const {
  getOrCreateByUserId
} = require('../models/workoutPreferencesModel');
const {
  getWorkoutSessionById,
  getRoutineStatsByUserId,
  getRecentCompletedSessionsByUserId,
  getPainFeedbackBySessionId,
  savePainFeedback,
  completeWorkoutSession
} = require('../models/workoutSessionModel');
const {
  computeDifficultyAdjustment
} = require('../services/workoutBehaviorService');

const ALLOWED_TRENDS = ['worse', 'same', 'better'];

const submitWorkoutPainFeedback = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const workoutSessionId = Number(req.body.workoutSessionId || req.session.activeWorkoutSessionId);
    const painScore = Number(req.body.painScore);
    const trend = (req.body.trend || '').trim();
    const notes = (req.body.notes || '').trim();

    if (!Number.isInteger(workoutSessionId) || workoutSessionId <= 0) {
      return res.status(400).json({ error: 'Invalid workout session.' });
    }

    if (!Number.isInteger(painScore) || painScore < 0 || painScore > 10) {
      return res.status(400).json({ error: 'Pain score must be between 0 and 10.' });
    }

    if (!ALLOWED_TRENDS.includes(trend)) {
      return res.status(400).json({ error: 'Trend must be one of: worse, same, better.' });
    }

    if (notes.length > 500) {
      return res.status(400).json({ error: 'Notes must be 500 characters or fewer.' });
    }

    const prefs = await getOrCreateByUserId(userId);
    if (!prefs.painFeedbackAfterWorkoutsEnabled) {
      return res.status(403).json({ error: 'Pain feedback is disabled in settings.' });
    }

    const session = await getWorkoutSessionById(workoutSessionId);
    if (!session || Number(session.user_id) !== Number(userId)) {
      return res.status(404).json({ error: 'Workout session not found.' });
    }

    await savePainFeedback({
      workoutSessionId,
      userId,
      painScore,
      trend,
      notes: notes || null
    });

    const routineStats = await getRoutineStatsByUserId(userId);
    const completionRatio = routineStats.total === 0 ? 0 : Number((routineStats.completed / routineStats.total).toFixed(2));

    const recentSessions = await getRecentCompletedSessionsByUserId(userId, 5);
    const recentFeedbackBySessionId = {};
    for (const recentSession of recentSessions) {
      const feedback = await getPainFeedbackBySessionId(recentSession.id);
      if (feedback) {
        recentFeedbackBySessionId[recentSession.id] = feedback;
      }
    }

    const adjustment = computeDifficultyAdjustment({
      autoAdjustEnabled: prefs.autoAdjustDifficultyEnabled,
      conservativeProgressionEnabled: prefs.conservativeProgressionEnabled,
      painFeedbackAfterWorkoutsEnabled: prefs.painFeedbackAfterWorkoutsEnabled,
      currentDifficulty: session.difficulty_before,
      completionRatio,
      latestPainFeedback: { pain_score: painScore, trend },
      recentSessions,
      recentFeedbackBySessionId
    });

    await completeWorkoutSession({
      sessionId: workoutSessionId,
      completionRatio,
      difficultyAfter: adjustment.difficultyAfter,
      adjustmentReason: adjustment.adjustmentReason,
      conservativeProgressionApplied: adjustment.conservativeProgressionApplied
    });

    if (req.session.activeWorkoutSessionId && Number(req.session.activeWorkoutSessionId) === workoutSessionId) {
      delete req.session.activeWorkoutSessionId;
    }

    return res.status(200).json({
      data: {
        workoutSessionId,
        completionRatio,
        difficultyAfter: adjustment.difficultyAfter,
        adjustmentReason: adjustment.adjustmentReason
      }
    });
  } catch (error) {
    console.error('Failed to save pain feedback:', error);
    return res.status(500).json({ error: 'Could not save pain feedback.' });
  }
};

module.exports = {
  submitWorkoutPainFeedback
};
