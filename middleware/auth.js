/**
 * /middleware/auth.js
 * middleware to check if user is authenticated.
 */
const checkAuthenticated = (req, res, next) => {
  // session.user should be an object { id, username }
  if (req.session.user && req.session.user.id) {
    req.user = req.session.user;
    console.log('session exists for user id:', req.user.id);
    return next();
  }
  res.status(401).send('you must log in first');
};

module.exports = { checkAuthenticated };
