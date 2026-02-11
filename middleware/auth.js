/**
 * /middleware/auth.js
 * middleware to check if user is authenticated.
 */
const userModel = require('../models/userModel');

const checkAuthenticated = async (req, res, next) => {
  // session.user should be an object { id, username }
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).send('you must log in first');
  }

  try {
    const userId = Number(req.session.user.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      req.session.destroy(() => {});
      return res.status(401).send('invalid session, please log in again');
    }

    const user = await userModel.getUserById(userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).send('session expired, please log in again');
    }

    req.user = { id: user.id, username: user.username };
    console.log('session exists for user id:', req.user.id);
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { checkAuthenticated };
