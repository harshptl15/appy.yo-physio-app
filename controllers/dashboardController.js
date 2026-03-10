const { evaluateNotificationsForUser } = require('../services/notificationEligibilityService');
const { NOTIFICATION_TYPES } = require('../models/notificationLogModel');
const goalsModel = require('../models/goalsModel');
const notificationPreferencesModel = require('../models/notificationPreferencesModel');
const {
  getActiveWorkoutSessionByUserId,
  getLastCompletedWorkoutSessionByUserId,
  getConsecutiveTrainingDays,
  hasCompletedWorkoutToday,
  getCompletedWorkoutCountInLastDays
} = require('../models/workoutSessionModel');

const parseReminderTime = (value) => {
  if (!value || typeof value !== 'string') return { hour: 18, minute: 0 };
  const [rawHour, rawMinute] = value.split(':');
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) {
    return { hour: 18, minute: 0 };
  }
  return { hour, minute };
};

const getNextScheduledWorkoutAt = (preferredReminderTime) => {
  const { hour, minute } = parseReminderTime(preferredReminderTime);
  const now = new Date();
  const scheduled = new Date(now);
  scheduled.setHours(hour, minute, 0, 0);
  if (scheduled <= now) {
    scheduled.setDate(scheduled.getDate() + 1);
  }
  return scheduled.toISOString();
};

const getNextRestDate = ({ hasWorkoutToday, workoutsLast7Days }) => {
  const now = new Date();
  const next = new Date(now);
  // If user already trained today or has trained heavily this week, suggest tomorrow as rest.
  if (hasWorkoutToday || workoutsLast7Days >= 5) {
    next.setDate(next.getDate() + 1);
  }
  return next.toISOString();
};

const getGoalProgress = (goals) => {
  if (!goals) {
    return {
      totalGoals: 0,
      completedGoals: 0,
      goalProgressPercent: 0
    };
  }

  const muscleGoalEntries = Object.values(goals.muscleGoals || {});
  const totalGoals = muscleGoalEntries.length > 0
    ? muscleGoalEntries.length
    : Array.isArray(goals.muscleIds)
      ? goals.muscleIds.length
      : 0;

  const completedGoals = muscleGoalEntries.reduce((count, entry) => {
    return count + (entry && entry.completed ? 1 : 0);
  }, 0);

  return {
    totalGoals,
    completedGoals,
    goalProgressPercent: totalGoals > 0
      ? Math.round((completedGoals / totalGoals) * 100)
      : 0
  };
};

const toRoutineRecommendationFromActiveSession = (activeSession) => {
  if (!activeSession) return null;

  const duration = Number(activeSession.estimated_duration_minutes || activeSession.preferred_workout_duration_minutes || 0);
  const exerciseCount = Number(activeSession.target_exercise_count || 0);

  return {
    notificationId: null,
    title: 'Continue your active routine',
    duration: duration > 0 ? duration : 20,
    difficulty: activeSession.difficulty_before ? `Level ${Number(activeSession.difficulty_before).toFixed(1)}` : 'In progress',
    rationale: exerciseCount > 0
      ? `${exerciseCount} exercises are already planned for this session.`
      : 'You already have a routine in progress.',
    ctaLabel: 'Continue routine',
    ctaLink: '/showRoutine'
  };
};

const buildDashboardPayload = async (user, { currentPath = '/dashboard' } = {}) => {
  const userId = user.id;
  const settled = await Promise.allSettled([
    evaluateNotificationsForUser(userId),
    getConsecutiveTrainingDays(userId),
    getLastCompletedWorkoutSessionByUserId(userId),
    getActiveWorkoutSessionByUserId(userId),
    hasCompletedWorkoutToday(userId),
    getCompletedWorkoutCountInLastDays(userId, 7),
    goalsModel.getGoalsByUserId(userId),
    notificationPreferencesModel.getOrCreateByUserId(userId)
  ]);

  const [
    evaluatedResult,
    streakDaysResult,
    lastCompletedSessionResult,
    activeWorkoutSessionResult,
    hasWorkoutTodayResult,
    workoutsLast7DaysResult,
    userGoalsResult,
    notificationPreferencesResult
  ] = settled;

  const evaluated = evaluatedResult.status === 'fulfilled'
    ? evaluatedResult.value
    : { notifications: [] };
  const streakDays = streakDaysResult.status === 'fulfilled'
    ? Number(streakDaysResult.value || 0)
    : 0;
  const lastCompletedSession = lastCompletedSessionResult.status === 'fulfilled'
    ? lastCompletedSessionResult.value
    : null;
  const activeWorkoutSession = activeWorkoutSessionResult.status === 'fulfilled'
    ? activeWorkoutSessionResult.value
    : null;
  const hasWorkoutTodayValue = hasWorkoutTodayResult.status === 'fulfilled'
    ? Boolean(hasWorkoutTodayResult.value)
    : false;
  const workoutsLast7Days = workoutsLast7DaysResult.status === 'fulfilled'
    ? Number(workoutsLast7DaysResult.value || 0)
    : 0;
  const userGoals = userGoalsResult.status === 'fulfilled'
    ? userGoalsResult.value
    : null;
  const notificationPreferences = notificationPreferencesResult.status === 'fulfilled'
    ? notificationPreferencesResult.value
    : { preferredReminderTime: '18:00' };

  if (evaluatedResult.status === 'rejected') {
    console.warn('Dashboard notifications summary failed:', evaluatedResult.reason?.message || evaluatedResult.reason);
  }
  if (streakDaysResult.status === 'rejected') {
    console.warn('Dashboard streak query failed:', streakDaysResult.reason?.message || streakDaysResult.reason);
  }
  if (lastCompletedSessionResult.status === 'rejected') {
    console.warn('Dashboard last completed session query failed:', lastCompletedSessionResult.reason?.message || lastCompletedSessionResult.reason);
  }
  if (activeWorkoutSessionResult.status === 'rejected') {
    console.warn('Dashboard active session query failed:', activeWorkoutSessionResult.reason?.message || activeWorkoutSessionResult.reason);
  }
  if (hasWorkoutTodayResult.status === 'rejected') {
    console.warn('Dashboard has-workout-today query failed:', hasWorkoutTodayResult.reason?.message || hasWorkoutTodayResult.reason);
  }
  if (workoutsLast7DaysResult.status === 'rejected') {
    console.warn('Dashboard workouts-last-7-days query failed:', workoutsLast7DaysResult.reason?.message || workoutsLast7DaysResult.reason);
  }
  if (userGoalsResult.status === 'rejected') {
    console.warn('Dashboard goals query failed:', userGoalsResult.reason?.message || userGoalsResult.reason);
  }
  if (notificationPreferencesResult.status === 'rejected') {
    console.warn('Dashboard notification preferences query failed:', notificationPreferencesResult.reason?.message || notificationPreferencesResult.reason);
  }

  const notifications = Array.isArray(evaluated.notifications) ? evaluated.notifications : [];

  const inAppNotificationCards = [];
  let routineRecommendation = null;
  let progressCheckInPrompt = null;

  notifications.forEach((item) => {
    if (item.type === NOTIFICATION_TYPES.ROUTINE_RECOMMENDATION) {
      routineRecommendation = {
        notificationId: item.id,
        title: item.metadata?.title || 'Recommended for you today',
        duration: item.metadata?.duration || 20,
        difficulty: item.metadata?.difficulty || 'Moderate',
        rationale: item.metadata?.rationale || '',
        ctaLabel: item.metadata?.ctaLabel || 'Start now',
        ctaLink: item.metadata?.ctaLink || '/workouts'
      };
      return;
    }

    if (item.type === NOTIFICATION_TYPES.PROGRESS_CHECKIN) {
      progressCheckInPrompt = {
        notificationId: item.id,
        message: item.metadata?.message || 'Weekly check-in: how are you feeling overall?'
      };
      return;
    }

    inAppNotificationCards.push({
      id: item.id,
      type: item.type,
      message: item.metadata?.message || 'You have a new reminder.',
      ctaLabel: item.metadata?.ctaLabel || 'Open',
      ctaLink: item.metadata?.ctaLink || '/workouts'
    });
  });

  if (!routineRecommendation) {
    routineRecommendation = toRoutineRecommendationFromActiveSession(activeWorkoutSession);
  }

  const goalProgress = getGoalProgress(userGoals);

  const metrics = {
    streakDays,
    lastWorkoutAt: lastCompletedSession ? lastCompletedSession.completed_at : null,
    lastWorkoutTitle: lastCompletedSession
      ? (Number(lastCompletedSession.target_exercise_count || 0) > 0
        ? `${Number(lastCompletedSession.target_exercise_count)} exercises completed`
        : 'Completed workout session')
      : null,
    nextRestDate: getNextRestDate({
      hasWorkoutToday: hasWorkoutTodayValue,
      workoutsLast7Days
    }),
    nextScheduledWorkoutAt: getNextScheduledWorkoutAt(notificationPreferences.preferredReminderTime),
    workoutsLast7Days,
    weeklyCompletionPercent: Math.min(100, Math.round((workoutsLast7Days / 7) * 100)),
    ...goalProgress
  };

  return {
    user,
    inAppNotificationCards,
    routineRecommendation,
    progressCheckInPrompt,
    metrics,
    currentPath
  };
};

const showDashboard = async (req, res) => {
  try {
    const user = req.session.user;
    const payload = await buildDashboardPayload(user, { currentPath: req.path });

    res.render('dashboard', {
      pageData: payload
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.render('dashboard', {
      pageData: {
        user: req.session.user,
        inAppNotificationCards: [],
        routineRecommendation: null,
        progressCheckInPrompt: null,
        metrics: null,
        currentPath: req.path,
        metricsError: 'Unable to load dashboard metrics right now.'
      }
    });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const payload = await buildDashboardPayload(req.session.user, { currentPath: '/dashboard' });
    return res.status(200).json(payload);
  } catch (error) {
    console.error('Error loading dashboard summary:', error);
    return res.status(200).json({
      user: req.session.user,
      inAppNotificationCards: [],
      routineRecommendation: null,
      progressCheckInPrompt: null,
      metrics: {
        streakDays: 0,
        lastWorkoutAt: null,
        lastWorkoutTitle: null,
        nextRestDate: null,
        nextScheduledWorkoutAt: null,
        workoutsLast7Days: 0,
        weeklyCompletionPercent: 0,
        totalGoals: 0,
        completedGoals: 0,
        goalProgressPercent: 0
      },
      currentPath: '/dashboard'
    });
  }
};

module.exports = {
  showDashboard,
  getDashboardSummary
};
