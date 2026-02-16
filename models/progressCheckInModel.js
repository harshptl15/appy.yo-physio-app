const db = require('../db');

const getLastByUserId = async (userId) => {
  const [rows] = await db.execute(
    `SELECT id, user_id, mood, pain_avg, mobility_rating, notes, created_at
     FROM Progress_CheckIn
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

const createProgressCheckIn = async ({
  userId,
  mood = null,
  painAvg = null,
  mobilityRating = null,
  notes = null
}) => {
  const [result] = await db.execute(
    `INSERT INTO Progress_CheckIn (
      user_id,
      mood,
      pain_avg,
      mobility_rating,
      notes
    ) VALUES (?, ?, ?, ?, ?)`,
    [userId, mood, painAvg, mobilityRating, notes]
  );
  return result.insertId;
};

module.exports = {
  getLastByUserId,
  createProgressCheckIn
};
