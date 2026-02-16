
/**
 *  models/userModel.js
 * routes for login view, regsiter view, 
 * @author Luke Johnson,El Mehdi Chaouni Ben Abdellah
 **/

const db = require('../db');
const bcrypt = require('bcrypt');

/**
 * Check if username is already taken
 * @param {string} username
 * @returns {Promise<boolean>}
 */
const isUsernameTaken = async (username) => {
  const [rows] = await db.query('SELECT 1 FROM `User` WHERE username = ?', [username]);
  return rows.length > 0;
};

/**
 * Check if email is already registered
 * @param {string} email
 * @returns {Promise<boolean>}
 */
const isEmailTaken = async (email) => {
  const [rows] = await db.query('SELECT 1 FROM `User` WHERE email = ?', [email]);
  return rows.length > 0;
};

/**
 * Register a new user in the database
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 */
const registerUser = async (name, email, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Registering user: ${name} with email: ${email}`);
    await db.query('INSERT INTO `User` (username, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    console.log('User added to db');
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;  // Throw error up so controller can handle it
  }
}
/**
 * Enable two-factor authentication: store secret and set flag
 * @param {number} userId 
 * @param {string} secret 
 */
const enableTwoFactor = async (userId, secret) => {
  await db.query('UPDATE `User` SET twofa_enabled = ?, twofa_secret = ? WHERE id = ?',[true, secret, userId]);
};

/**
 * Disable two-factor authentication: clear secret and flag
 * @param {number} userId 
 */
const disableTwoFactor = async (userId) => {
  await db.query('UPDATE `User` SET twofa_enabled = ?, twofa_secret = NULL WHERE id = ?',  [false, userId]);
};

/**
 * Authenticate a user by username and password
 * @param {string} name 
 * @param {string} password 
 * @returns {object|null} user object if valid, otherwise null
 */
const loginUser = async (name, password) => {
  try {
    const [userRows] = await db.query('SELECT * FROM `User` WHERE username = ?', [name]);
    if (userRows.length === 0) {
      console.log('No user found with username:', name);
      return null;
    }
    const user = userRows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      return user;
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
const getUserById = async (id) => {
  const [rows] = await db.query(
    `SELECT
      id,
      username,
      twofa_enabled,
      twofa_secret,
      gender,
      age,
      height_unit,
      height_cm,
      height_ft,
      height_in,
      weight_unit,
      weight_value,
      injury_focus,
      injury_focus_other,
      condition_focus,
      rehab_level
    FROM \`User\`
    WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Verify a user's password by user id
 * @param {number} userId
 * @param {string} password
 * @returns {Promise<boolean>}
 */
const verifyPassword = async (userId, password) => {
  const [rows] = await db.query('SELECT password FROM `User` WHERE id = ?', [userId]);
  if (rows.length === 0) return false;
  return bcrypt.compare(password, rows[0].password);
};

const getIdofUser = async (userName) => {
  try {
    const [rows] = await db.query('SELECT id FROM `User` WHERE username = ?', [userName]);
    if (rows.length === 0) {
      console.log('No user found with username:', userName);
      return null;
    }
    return rows[0].id;
  } catch (error) {
    console.error('Error getting user ID:', error);
    throw error;
  }
}

const getAllUserIds = async () => {
  const [rows] = await db.query('SELECT id FROM `User`');
  return rows.map((row) => Number(row.id)).filter((id) => Number.isInteger(id) && id > 0);
};

module.exports = {
  registerUser,
  loginUser,
  isUsernameTaken,
  isEmailTaken,
  enableTwoFactor,
  disableTwoFactor,
  getIdofUser,
  getUserById,
  getAllUserIds
};
