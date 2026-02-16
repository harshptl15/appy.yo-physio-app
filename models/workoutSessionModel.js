const db = require('../db');

const createWorkoutSession = async ({
  userId,
  preferredWorkoutDurationMinutes,
  targetExerciseCount,
  estimatedDurationMinutes,
  difficultyBefore
}) => {
  const [result] = await db.execute(
    `INSERT INTO Workout_Session (
      user_id,
      status,
      preferred_workout_duration_minutes,
      target_exercise_count,
      estimated_duration_minutes,
      difficulty_before,
      difficulty_after
    ) VALUES (?, 'active', ?, ?, ?, ?, ?)`,
    [
      userId,
      preferredWorkoutDurationMinutes,
      targetExerciseCount,
      estimatedDurationMinutes,
      difficultyBefore,
      difficultyBefore
    ]
  );

  return result.insertId;
};

const getWorkoutSessionById = async (sessionId) => {
  const [rows] = await db.execute(
    `SELECT *
     FROM Workout_Session
     WHERE id = ?`,
    [sessionId]
  );
  return rows[0] || null;
};

const getActiveWorkoutSessionByUserId = async (userId) => {
  const [rows] = await db.execute(
    `SELECT *
     FROM Workout_Session
     WHERE user_id = ? AND status = 'active'
     ORDER BY started_at DESC
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

const getLastCompletedWorkoutSessionByUserId = async (userId) => {
  const [rows] = await db.execute(
    `SELECT *
     FROM Workout_Session
     WHERE user_id = ? AND status = 'completed'
     ORDER BY completed_at DESC
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

const getRecentCompletedSessionsByUserId = async (userId, limit = 5) => {
  const [rows] = await db.execute(
    `SELECT *
     FROM Workout_Session
     WHERE user_id = ? AND status = 'completed'
     ORDER BY completed_at DESC
     LIMIT ?`,
    [userId, limit]
  );
  return rows;
};

const completeWorkoutSession = async ({
  sessionId,
  completionRatio,
  difficultyAfter,
  adjustmentReason,
  conservativeProgressionApplied
}) => {
  await db.execute(
    `UPDATE Workout_Session
     SET status = 'completed',
         completed_at = NOW(),
         completion_ratio = ?,
         difficulty_after = ?,
         adjustment_reason = ?,
         conservative_progression_applied = ?
     WHERE id = ?`,
    [
      completionRatio,
      difficultyAfter,
      adjustmentReason,
      conservativeProgressionApplied,
      sessionId
    ]
  );
};

const linkRoutineEntriesToSession = async ({ userId, sessionId, exerciseIds }) => {
  if (!exerciseIds.length) return;

  const placeholders = exerciseIds.map(() => '(?, ?, ?, FALSE)').join(', ');
  const values = [];
  exerciseIds.forEach((exerciseId) => {
    values.push(userId, exerciseId, sessionId);
  });

  await db.execute(`DELETE FROM Routine_Entry WHERE user_id = ?`, [userId]);
  await db.execute(
    `INSERT INTO Routine_Entry (user_id, exercise_id, workout_session_id, goal)
     VALUES ${placeholders}`,
    values
  );
};

const getRoutineStatsByUserId = async (userId) => {
  const [rows] = await db.execute(
    `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN goal = TRUE THEN 1 ELSE 0 END) AS completed
     FROM Routine_Entry
     WHERE user_id = ?`,
    [userId]
  );

  const total = Number(rows[0]?.total || 0);
  const completed = Number(rows[0]?.completed || 0);
  return { total, completed };
};

const savePainFeedback = async ({
  workoutSessionId,
  userId,
  painScore,
  trend,
  notes
}) => {
  await db.execute(
    `INSERT INTO Workout_Pain_Feedback (
      workout_session_id,
      user_id,
      pain_score,
      trend,
      notes
    ) VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      pain_score = VALUES(pain_score),
      trend = VALUES(trend),
      notes = VALUES(notes),
      created_at = NOW()`,
    [workoutSessionId, userId, painScore, trend, notes]
  );
};

const getPainFeedbackBySessionId = async (workoutSessionId) => {
  const [rows] = await db.execute(
    `SELECT *
     FROM Workout_Pain_Feedback
     WHERE workout_session_id = ?
     LIMIT 1`,
    [workoutSessionId]
  );
  return rows[0] || null;
};

const createNotificationLog = async ({ userId, eventType, message }) => {
  await db.execute(
    `INSERT INTO Notification_Log (user_id, event_type, message)
     VALUES (?, ?, ?)`,
    [userId, eventType, message]
  );
};

const hasNotificationTypeToday = async ({ userId, eventType }) => {
  const [rows] = await db.execute(
    `SELECT 1
     FROM Notification_Log
     WHERE user_id = ?
       AND event_type = ?
       AND DATE(created_at) = CURRENT_DATE()
     LIMIT 1`,
    [userId, eventType]
  );
  return rows.length > 0;
};

const getLatestUnshownNotificationByUserId = async (userId) => {
  const [rows] = await db.execute(
    `SELECT *
     FROM Notification_Log
     WHERE user_id = ? AND shown_on_dashboard = FALSE
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

const markNotificationShown = async (notificationId) => {
  await db.execute(
    `UPDATE Notification_Log
     SET shown_on_dashboard = TRUE,
         shown_at = NOW()
     WHERE id = ?`,
    [notificationId]
  );
};

const getConsecutiveTrainingDays = async (userId) => {
  const [rows] = await db.execute(
    `SELECT DATE(completed_at) AS d
     FROM Workout_Session
     WHERE user_id = ?
       AND status = 'completed'
       AND completed_at IS NOT NULL
     GROUP BY DATE(completed_at)
     ORDER BY d DESC`,
    [userId]
  );

  if (!rows.length) return 0;

  let streak = 0;
  let expected = new Date(rows[0].d);

  for (const row of rows) {
    const current = new Date(row.d);
    if (current.toDateString() === expected.toDateString()) {
      streak += 1;
      expected.setDate(expected.getDate() - 1);
      continue;
    }
    break;
  }

  return streak;
};

const getDaysSinceLastCompletedWorkout = async (userId) => {
  const [rows] = await db.execute(
    `SELECT completed_at
     FROM Workout_Session
     WHERE user_id = ?
       AND status = 'completed'
       AND completed_at IS NOT NULL
     ORDER BY completed_at DESC
     LIMIT 1`,
    [userId]
  );

  if (!rows.length) return null;
  const last = new Date(rows[0].completed_at);
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((now - last) / msPerDay);
};

const hasCompletedWorkoutToday = async (userId) => {
  const [rows] = await db.execute(
    `SELECT 1
     FROM Workout_Session
     WHERE user_id = ?
       AND status = 'completed'
       AND completed_at IS NOT NULL
       AND DATE(completed_at) = CURRENT_DATE()
     LIMIT 1`,
    [userId]
  );
  return rows.length > 0;
};

const getCompletedWorkoutCountInLastDays = async (userId, days) => {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS total
     FROM Workout_Session
     WHERE user_id = ?
       AND status = 'completed'
       AND completed_at IS NOT NULL
       AND completed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [userId, days]
  );
  return Number(rows[0]?.total || 0);
};

const getLatestPainFeedbackForUser = async (userId) => {
  const [rows] = await db.execute(
    `SELECT wpf.*
     FROM Workout_Pain_Feedback wpf
     INNER JOIN Workout_Session ws ON ws.id = wpf.workout_session_id
     WHERE ws.user_id = ?
     ORDER BY wpf.created_at DESC
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

module.exports = {
  createWorkoutSession,
  getWorkoutSessionById,
  getActiveWorkoutSessionByUserId,
  getLastCompletedWorkoutSessionByUserId,
  getRecentCompletedSessionsByUserId,
  completeWorkoutSession,
  linkRoutineEntriesToSession,
  getRoutineStatsByUserId,
  savePainFeedback,
  getPainFeedbackBySessionId,
  createNotificationLog,
  hasNotificationTypeToday,
  getLatestUnshownNotificationByUserId,
  markNotificationShown,
  getConsecutiveTrainingDays,
  getDaysSinceLastCompletedWorkout,
  hasCompletedWorkoutToday,
  getCompletedWorkoutCountInLastDays,
  getLatestPainFeedbackForUser
};
