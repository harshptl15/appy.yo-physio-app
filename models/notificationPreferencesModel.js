const db = require('../db');

const DEFAULT_NOTIFICATION_PREFERENCES = {
  workoutRemindersEnabled: true,
  restDayRemindersEnabled: true,
  progressCheckInsEnabled: false,
  routineRecommendationsEnabled: true,
  preferredReminderTime: '18:00',
  timezone: 'UTC'
};

const DB_COLUMNS = {
  workoutRemindersEnabled: 'workout_reminders_enabled',
  restDayRemindersEnabled: 'rest_day_reminders_enabled',
  progressCheckInsEnabled: 'progress_checkins_enabled',
  routineRecommendationsEnabled: 'routine_recommendations_enabled',
  preferredReminderTime: 'preferred_reminder_time',
  timezone: 'timezone'
};

const toDomain = (row) => ({
  userId: row.user_id,
  workoutRemindersEnabled: !!row.workout_reminders_enabled,
  restDayRemindersEnabled: !!row.rest_day_reminders_enabled,
  progressCheckInsEnabled: !!row.progress_checkins_enabled,
  routineRecommendationsEnabled: !!row.routine_recommendations_enabled,
  preferredReminderTime: row.preferred_reminder_time,
  timezone: row.timezone,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const getByUserId = async (userId) => {
  const [rows] = await db.execute(
    `SELECT user_id, workout_reminders_enabled, rest_day_reminders_enabled,
            progress_checkins_enabled, routine_recommendations_enabled,
            preferred_reminder_time, timezone, created_at, updated_at
     FROM Notification_Preferences
     WHERE user_id = ?`,
    [userId]
  );

  return rows[0] ? toDomain(rows[0]) : null;
};

const createDefaultsForUser = async (userId) => {
  await db.execute(
    `INSERT INTO Notification_Preferences (
      user_id,
      workout_reminders_enabled,
      rest_day_reminders_enabled,
      progress_checkins_enabled,
      routine_recommendations_enabled,
      preferred_reminder_time,
      timezone
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE user_id = user_id`,
    [
      userId,
      DEFAULT_NOTIFICATION_PREFERENCES.workoutRemindersEnabled,
      DEFAULT_NOTIFICATION_PREFERENCES.restDayRemindersEnabled,
      DEFAULT_NOTIFICATION_PREFERENCES.progressCheckInsEnabled,
      DEFAULT_NOTIFICATION_PREFERENCES.routineRecommendationsEnabled,
      DEFAULT_NOTIFICATION_PREFERENCES.preferredReminderTime,
      DEFAULT_NOTIFICATION_PREFERENCES.timezone
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
  const entries = Object.entries(patch).filter(([key]) => DB_COLUMNS[key]);
  if (!entries.length) return getOrCreateByUserId(userId);

  const setClause = entries.map(([key]) => `${DB_COLUMNS[key]} = ?`).join(', ');
  const values = entries.map(([, value]) => value);

  await db.execute(
    `UPDATE Notification_Preferences
     SET ${setClause}
     WHERE user_id = ?`,
    [...values, userId]
  );

  return getByUserId(userId);
};

module.exports = {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getByUserId,
  createDefaultsForUser,
  getOrCreateByUserId,
  updateByUserId
};
