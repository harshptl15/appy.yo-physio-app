const {
  getOrCreateByUserId
} = require('../models/notificationPreferencesModel');
const {
  NOTIFICATION_TYPES,
  createLogOncePerDay,
  getPendingInAppNotifications,
  markShown
} = require('../models/notificationLogModel');
const {
  getLastByUserId
} = require('../models/progressCheckInModel');
const {
  hasCompletedWorkoutToday,
  getConsecutiveTrainingDays,
  getDaysSinceLastCompletedWorkout,
  getCompletedWorkoutCountInLastDays,
  getLatestPainFeedbackForUser
} = require('../models/workoutSessionModel');

const parseReminderMinutes = (value) => {
  const [hh, mm] = String(value || '18:00').split(':').map((v) => Number(v));
  if (!Number.isInteger(hh) || !Number.isInteger(mm)) return 18 * 60;
  return Math.max(0, Math.min(23, hh)) * 60 + Math.max(0, Math.min(59, mm));
};

const nowMinutesInTimezone = (timezone) => {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone || 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(new Date());

    const hh = Number(parts.find((p) => p.type === 'hour')?.value || 0);
    const mm = Number(parts.find((p) => p.type === 'minute')?.value || 0);
    return hh * 60 + mm;
  } catch (error) {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }
};

const daysSince = (dateValue) => {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((now - date) / msPerDay);
};

const getRoutineRecommendation = async (userId) => {
  const daysSinceLastWorkout = await getDaysSinceLastCompletedWorkout(userId);
  const workoutsLast7Days = await getCompletedWorkoutCountInLastDays(userId, 7);
  const latestPain = await getLatestPainFeedbackForUser(userId);

  if (daysSinceLastWorkout !== null && daysSinceLastWorkout >= 3) {
    return {
      title: 'Short Restart Session',
      duration: 15,
      difficulty: 'Light',
      rationale: 'You have had a few days off. A short session helps rebuild momentum safely.',
      ctaLabel: 'Start 15-min workout',
      ctaLink: '/workouts'
    };
  }

  if (latestPain && (Number(latestPain.pain_score) >= 4 || latestPain.trend === 'worse')) {
    return {
      title: 'Mobility & Recovery Routine',
      duration: 20,
      difficulty: 'Recovery',
      rationale: 'Recent pain feedback suggests easing load and prioritizing recovery.',
      ctaLabel: 'Start recovery flow',
      ctaLink: '/workouts'
    };
  }

  if (workoutsLast7Days >= 3) {
    return {
      title: 'Progression Variation Routine',
      duration: 30,
      difficulty: 'Moderate+',
      rationale: 'You have been consistent. A progression variation keeps adaptation moving.',
      ctaLabel: 'View progression routine',
      ctaLink: '/workouts'
    };
  }

  return {
    title: 'Balanced Daily Routine',
    duration: 20,
    difficulty: 'Moderate',
    rationale: 'A balanced session supports consistency and movement quality.',
    ctaLabel: 'Start today\'s routine',
    ctaLink: '/workouts'
  };
};

const generateNotificationEventsForUser = async (userId, options = {}) => {
  const nowOverride = options.now instanceof Date ? options.now : new Date();
  const prefs = await getOrCreateByUserId(userId);

  if (prefs.workoutRemindersEnabled) {
    const completedToday = await hasCompletedWorkoutToday(userId);
    const nowMins = nowMinutesInTimezone(prefs.timezone || 'UTC');
    const targetMins = parseReminderMinutes(prefs.preferredReminderTime);

    if (!completedToday && nowMins >= targetMins) {
      await createLogOncePerDay({
        userId,
        type: NOTIFICATION_TYPES.WORKOUT_REMINDER,
        scheduledFor: nowOverride,
        metadata: {
          message: 'Time for your session. A short workout today keeps your progress steady.',
          ctaLabel: 'Start workout',
          ctaLink: '/workouts'
        }
      });
    }
  }

  if (prefs.restDayRemindersEnabled) {
    const consecutiveDays = await getConsecutiveTrainingDays(userId);
    const latestPain = await getLatestPainFeedbackForUser(userId);
    const elevatedPain = latestPain && (Number(latestPain.pain_score) >= 4 || latestPain.trend === 'worse');

    if (consecutiveDays >= 3 || elevatedPain) {
      await createLogOncePerDay({
        userId,
        type: NOTIFICATION_TYPES.REST_DAY_REMINDER,
        scheduledFor: nowOverride,
        metadata: {
          message: 'A recovery day can help your body adapt and reduce symptom flare-ups.',
          ctaLabel: 'Open recovery options',
          ctaLink: '/showRoutine'
        }
      });
    }
  }

  if (prefs.progressCheckInsEnabled) {
    const lastCheckIn = await getLastByUserId(userId);
    const daysSinceLastCheckIn = daysSince(lastCheckIn?.created_at);

    if (daysSinceLastCheckIn === null || daysSinceLastCheckIn >= 7) {
      await createLogOncePerDay({
        userId,
        type: NOTIFICATION_TYPES.PROGRESS_CHECKIN,
        scheduledFor: nowOverride,
        metadata: {
          message: 'Weekly check-in: how are pain and mobility trending?',
          ctaLabel: 'Complete check-in'
        }
      });
    }
  }

  if (prefs.routineRecommendationsEnabled) {
    const recommendation = await getRoutineRecommendation(userId);
    await createLogOncePerDay({
      userId,
      type: NOTIFICATION_TYPES.ROUTINE_RECOMMENDATION,
      scheduledFor: nowOverride,
      metadata: recommendation
    });
  }

  return { preferences: prefs };
};

const evaluateNotificationsForUser = async (userId) => {
  const generated = await generateNotificationEventsForUser(userId);

  const pending = await getPendingInAppNotifications(userId);
  const ids = pending.map((item) => item.id);
  await markShown(ids);

  return {
    preferences: generated.preferences,
    notifications: pending
  };
};

module.exports = {
  evaluateNotificationsForUser,
  generateNotificationEventsForUser,
  getRoutineRecommendation
};
