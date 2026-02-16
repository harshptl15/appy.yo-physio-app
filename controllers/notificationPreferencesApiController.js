const {
  getOrCreateByUserId,
  updateByUserId
} = require('../models/notificationPreferencesModel');

const ALLOWED_KEYS = new Set([
  'workoutRemindersEnabled',
  'restDayRemindersEnabled',
  'progressCheckInsEnabled',
  'routineRecommendationsEnabled',
  'preferredReminderTime',
  'timezone'
]);

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const validatePatch = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, error: 'Invalid payload.' };
  }

  const normalized = {};

  for (const [key, value] of Object.entries(payload)) {
    if (!ALLOWED_KEYS.has(key)) {
      return { ok: false, error: `Field '${key}' is not supported.` };
    }

    if (
      key === 'workoutRemindersEnabled' ||
      key === 'restDayRemindersEnabled' ||
      key === 'progressCheckInsEnabled' ||
      key === 'routineRecommendationsEnabled'
    ) {
      if (typeof value !== 'boolean') {
        return { ok: false, error: `${key} must be a boolean.` };
      }
      normalized[key] = value;
      continue;
    }

    if (key === 'preferredReminderTime') {
      if (typeof value !== 'string' || !TIME_PATTERN.test(value)) {
        return { ok: false, error: 'preferredReminderTime must use HH:MM (24h) format.' };
      }
      normalized[key] = value;
      continue;
    }

    if (key === 'timezone') {
      if (typeof value !== 'string' || value.length < 2 || value.length > 64) {
        return { ok: false, error: 'timezone must be a valid timezone string.' };
      }
      normalized[key] = value;
    }
  }

  return { ok: true, data: normalized };
};

const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const prefs = await getOrCreateByUserId(userId);
    return res.status(200).json({ data: prefs });
  } catch (error) {
    console.error('Failed to load notification preferences:', error);
    if (error && error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        error: 'Notification preferences schema is missing. Run notification_preferences_migration.sql and retry.'
      });
    }
    if (error && (error.code === 'ER_TABLEACCESS_DENIED_ERROR' || error.code === 'ER_DBACCESS_DENIED_ERROR')) {
      return res.status(500).json({
        error: 'Database user does not have required permissions for notification preferences tables.'
      });
    }
    return res.status(500).json({ error: 'Could not load notification preferences.' });
  }
};

const patchNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const validation = validatePatch(req.body || {});
    if (!validation.ok) {
      return res.status(400).json({ error: validation.error });
    }

    await getOrCreateByUserId(userId);
    const updated = await updateByUserId(userId, validation.data);
    return res.status(200).json({ data: updated });
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    if (error && error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        error: 'Notification preferences schema is missing. Run notification_preferences_migration.sql and retry.'
      });
    }
    if (error && (error.code === 'ER_TABLEACCESS_DENIED_ERROR' || error.code === 'ER_DBACCESS_DENIED_ERROR')) {
      return res.status(500).json({
        error: 'Database user does not have required permissions for notification preferences tables.'
      });
    }
    return res.status(500).json({ error: 'Could not update notification preferences.' });
  }
};

module.exports = {
  getNotificationPreferences,
  patchNotificationPreferences
};
