/**
 *  controllers/loginController.js
 * @author Luke Johnson, El Mehdi Chaouni Ben Abdellah
 * */
const userModel = require('../models/userModel');
const { generateNotificationEventsForUser } = require('../services/notificationEligibilityService');

/**
 * handles login of user via AJAX (JSON).
 */
exports.login = async (req, res) => {
  const { name, password } = req.body;

  // 1. Validate required fields
  const errors = {};
  if (!name)     errors.name     = 'Username is required.';
  if (!password) errors.password = 'Password is required.';
  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }

  try {
    /**
     *  2. Attempt loginUser (returns user object or null)
     * */
    const user = await userModel.loginUser(name, password);
    if (!user) {
      /**
       * check if user exists to give proper message
       * */ 
      const exists = await userModel.isUsernameTaken(name);
      const msg = exists
        ? 'Invalid credentials.'
        : 'User not found. Please register first.';
      return res.status(401).json({ error: msg });
    }

    /**
     *  3. If 2FA is enabled, ask for code
     * */
    if (user.twofa_enabled) {
      req.session.temp_twofa_user = { id: user.id, username: user.username };
      return res.status(200).json({ twofaRequired: true });
    }

    /**
     *  4. Success without 2FA: create final session
     * */
    req.session.user = {
      id: user.id,
      username: user.username,
      twofa_enabled: !!user.twofa_enabled
    };

    generateNotificationEventsForUser(user.id).catch((error) => {
      console.error('Notification generation on login failed:', error);
    });

    return res.status(200).json({ twofaRequired: false });

  } catch (err) {
    console.error('Login error:', err);
    return res
      .status(500)
      .json({ error: 'Something went wrong. Please try again later.' });
  }
};
