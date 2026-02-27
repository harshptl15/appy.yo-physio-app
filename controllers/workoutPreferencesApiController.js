const {
  ALLOWED_DURATIONS,
  getOrCreateByUserId,
  updateByUserId
} = require('../models/workoutPreferencesModel');

const ALLOWED_KEYS = new Set([
  'preferredWorkoutDurationMinutes',
  'recoveryDayRemindersEnabled',
  'painFeedbackAfterWorkoutsEnabled',
  'autoAdjustDifficultyEnabled',
  'conservativeProgressionEnabled'
]);

const validatePatch = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, error: 'Invalid payload.' };
  }

  const normalized = {};

  for (const [key, value] of Object.entries(payload)) {
    if (!ALLOWED_KEYS.has(key)) {
      return { ok: false, error: `Field '${key}' is not supported.` };
    }

    if (key === 'preferredWorkoutDurationMinutes') {
      const num = Number(value);
      if (!Number.isInteger(num) || !ALLOWED_DURATIONS.includes(num)) {
        return {
          ok: false,
          error: `preferredWorkoutDurationMinutes must be one of: ${ALLOWED_DURATIONS.join(', ')}`
        };
      }
      normalized[key] = num;
      continue;
    }

    if (typeof value !== 'boolean') {
      return { ok: false, error: `${key} must be a boolean.` };
    }

    normalized[key] = value;
  }

  return { ok: true, data: normalized };
};

const getWorkoutRecoveryPreferences = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const prefs = await getOrCreateByUserId(userId);
    return res.status(200).json({ data: prefs });
  } catch (error) {
    console.error('Failed to load workout preferences:', error);
    if (error && (error.code === 'USER_NOT_FOUND' || error.code === 'INVALID_USER_ID')) {
      delete req.session.user;
      return res.status(401).json({ error: 'Session user is invalid. Please log in again.' });
    }
    if (error && error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        error: 'Workout preferences schema is missing. Run workout_recovery_preferences_migration.sql and retry.'
      });
    }
    if (error && (error.code === 'ER_TABLEACCESS_DENIED_ERROR' || error.code === 'ER_DBACCESS_DENIED_ERROR')) {
      return res.status(500).json({
        error: 'Database user does not have required permissions for workout preferences tables.'
      });
    }
    return res.status(500).json({ error: 'Could not load workout preferences.' });
  }
};

const patchWorkoutRecoveryPreferences = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = validatePatch(req.body || {});
    if (!validation.ok) {
      return res.status(400).json({ error: validation.error });
    }

    await getOrCreateByUserId(userId);
    const updated = await updateByUserId(userId, validation.data);
    return res.status(200).json({ data: updated });
  } catch (error) {
    console.error('Failed to update workout preferences:', error);
    if (error && (error.code === 'USER_NOT_FOUND' || error.code === 'INVALID_USER_ID')) {
      delete req.session.user;
      return res.status(401).json({ error: 'Session user is invalid. Please log in again.' });
    }
    if (error && error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        error: 'Workout preferences schema is missing. Run workout_recovery_preferences_migration.sql and retry.'
      });
    }
    if (error && (error.code === 'ER_TABLEACCESS_DENIED_ERROR' || error.code === 'ER_DBACCESS_DENIED_ERROR')) {
      return res.status(500).json({
        error: 'Database user does not have required permissions for workout preferences tables.'
      });
    }
    return res.status(500).json({ error: 'Could not update workout preferences.' });
  }
};

module.exports = {
  getWorkoutRecoveryPreferences,
  patchWorkoutRecoveryPreferences
};
