const db = require('../db');

const NOTIFICATION_TYPES = {
  WORKOUT_REMINDER: 'WORKOUT_REMINDER',
  REST_DAY_REMINDER: 'REST_DAY_REMINDER',
  PROGRESS_CHECKIN: 'PROGRESS_CHECKIN',
  ROUTINE_RECOMMENDATION: 'ROUTINE_RECOMMENDATION'
};

const NOTIFICATION_STATUS = {
  CREATED: 'CREATED',
  SHOWN: 'SHOWN',
  DISMISSED: 'DISMISSED',
  SENT: 'SENT'
};

const parseMetadata = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const toDomain = (row) => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  status: row.status,
  scheduledFor: row.scheduled_for,
  shownAt: row.shown_at,
  metadata: parseMetadata(row.metadata),
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const hasTypeForToday = async ({ userId, type }) => {
  const [rows] = await db.execute(
    `SELECT 1
     FROM Notification_Log
     WHERE user_id = ?
       AND type = ?
       AND DATE(created_at) = CURRENT_DATE()
     LIMIT 1`,
    [userId, type]
  );
  return rows.length > 0;
};

const createLog = async ({ userId, type, status = NOTIFICATION_STATUS.CREATED, scheduledFor = null, metadata = null }) => {
  const metadataValue = metadata ? JSON.stringify(metadata) : null;
  const message =
    (metadata && typeof metadata === 'object' && typeof metadata.message === 'string' && metadata.message.trim()) ||
    type.replace(/_/g, ' ');
  const [result] = await db.execute(
    `INSERT INTO Notification_Log (user_id, type, status, scheduled_for, metadata, message, shown_on_dashboard)
     VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
    [userId, type, status, scheduledFor, metadataValue, message]
  );
  return result.insertId;
};

const createLogOncePerDay = async ({ userId, type, status = NOTIFICATION_STATUS.CREATED, scheduledFor = null, metadata = null }) => {
  const exists = await hasTypeForToday({ userId, type });
  if (exists) return null;
  return createLog({ userId, type, status, scheduledFor, metadata });
};

const getPendingInAppNotifications = async (userId) => {
  const [rows] = await db.execute(
    `SELECT id, user_id, type, status, scheduled_for, shown_at, metadata, created_at, updated_at
     FROM Notification_Log
     WHERE user_id = ?
       AND status = 'CREATED'
       AND DATE(created_at) = CURRENT_DATE()
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map(toDomain);
};

const markShown = async (notificationIds) => {
  if (!notificationIds || notificationIds.length === 0) return;

  const placeholders = notificationIds.map(() => '?').join(', ');
  await db.execute(
    `UPDATE Notification_Log
     SET status = 'SHOWN', shown_at = NOW()
     WHERE id IN (${placeholders})
       AND status = 'CREATED'`,
    notificationIds
  );
};

const markClicked = async ({ notificationId, userId }) => {
  await db.execute(
    `UPDATE Notification_Log
     SET status = 'SENT', shown_at = COALESCE(shown_at, NOW())
     WHERE id = ? AND user_id = ?`,
    [notificationId, userId]
  );
};

module.exports = {
  NOTIFICATION_TYPES,
  NOTIFICATION_STATUS,
  hasTypeForToday,
  createLog,
  createLogOncePerDay,
  getPendingInAppNotifications,
  markShown,
  markClicked
};
