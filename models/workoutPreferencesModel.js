const db = require('../db');

const ALLOWED_DURATIONS = [15, 20, 30, 45, 60];

const DEFAULT_WORKOUT_RECOVERY_PREFERENCES = {
  preferredWorkoutDurationMinutes: 30,
  recoveryDayRemindersEnabled: false,
  painFeedbackAfterWorkoutsEnabled: true,
  autoAdjustDifficultyEnabled: true,
  conservativeProgressionEnabled: false
};

const DB_COLUMNS = {
  preferredWorkoutDurationMinutes: 'preferred_workout_duration_minutes',
  recoveryDayRemindersEnabled: 'recovery_day_reminders_enabled',
  painFeedbackAfterWorkoutsEnabled: 'pain_feedback_after_workouts_enabled',
  autoAdjustDifficultyEnabled: 'auto_adjust_difficulty_enabled',
  conservativeProgressionEnabled: 'conservative_progression_enabled'
};

const toDomain = (row) => ({
  userId: row.user_id,
  preferredWorkoutDurationMinutes: row.preferred_workout_duration_minutes,
  recoveryDayRemindersEnabled: !!row.recovery_day_reminders_enabled,
  painFeedbackAfterWorkoutsEnabled: !!row.pain_feedback_after_workouts_enabled,
  autoAdjustDifficultyEnabled: !!row.auto_adjust_difficulty_enabled,
  conservativeProgressionEnabled: !!row.conservative_progression_enabled,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const getByUserId = async (userId) => {
  const [rows] = await db.execute(
    `SELECT user_id, preferred_workout_duration_minutes, recovery_day_reminders_enabled,
            pain_feedback_after_workouts_enabled, auto_adjust_difficulty_enabled,
            conservative_progression_enabled, created_at, updated_at
     FROM Workout_Recovery_Preferences
     WHERE user_id = ?`,
    [userId]
  );
  return rows[0] ? toDomain(rows[0]) : null;
};

const createDefaultsForUser = async (userId) => {
  await db.execute(
    `INSERT INTO Workout_Recovery_Preferences (
      user_id,
      preferred_workout_duration_minutes,
      recovery_day_reminders_enabled,
      pain_feedback_after_workouts_enabled,
      auto_adjust_difficulty_enabled,
      conservative_progression_enabled
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE user_id = user_id`,
    [
      userId,
      DEFAULT_WORKOUT_RECOVERY_PREFERENCES.preferredWorkoutDurationMinutes,
      DEFAULT_WORKOUT_RECOVERY_PREFERENCES.recoveryDayRemindersEnabled,
      DEFAULT_WORKOUT_RECOVERY_PREFERENCES.painFeedbackAfterWorkoutsEnabled,
      DEFAULT_WORKOUT_RECOVERY_PREFERENCES.autoAdjustDifficultyEnabled,
      DEFAULT_WORKOUT_RECOVERY_PREFERENCES.conservativeProgressionEnabled
    ]
  );

  return getByUserId(userId);
};

const getOrCreateByUserId = async (userId) => {
  const existing = await getByUserId(userId);
  if (existing) return existing;
  return createDefaultsForUser(userId);
};

const updateByUserId = async (userId, patch) => {
  const updateEntries = Object.entries(patch).filter(([key]) => DB_COLUMNS[key]);
  if (updateEntries.length === 0) {
    return getOrCreateByUserId(userId);
  }

  const setClause = updateEntries
    .map(([key]) => `${DB_COLUMNS[key]} = ?`)
    .join(', ');
  const values = updateEntries.map(([, value]) => value);

  await db.execute(
    `UPDATE Workout_Recovery_Preferences
     SET ${setClause}
     WHERE user_id = ?`,
    [...values, userId]
  );

  return getByUserId(userId);
};

module.exports = {
  ALLOWED_DURATIONS,
  DEFAULT_WORKOUT_RECOVERY_PREFERENCES,
  getByUserId,
  getOrCreateByUserId,
  updateByUserId
};
