/**
 * /middleware/auth.js
 * middleware to check if user is authenticated.
 */
const checkAuthenticated = (req, res, next) => {
  // session.user should be an object { id, username }
  if (req.session.user && req.session.user.id) {
    req.user = req.session.user;
    return next();
  }

  const requestPath = req.originalUrl || req.path || '';
  const expectsJson =
    requestPath.startsWith('/api/') ||
    (req.headers.accept && req.headers.accept.includes('application/json')) ||
    req.xhr;

  if (expectsJson) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.redirect('/login');
};

module.exports = { checkAuthenticated };
