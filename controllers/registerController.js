const userModel = require('../models/userModel');//import user model
const path = require('path'); //import path module

/**
 * Handles registration of a new user.
 */
const register = async (req, res) => {
  console.log('In register controller');
  const { name, email, password, confirmPassword, termsAccepted } = req.body;

  const errors = {};

  // Basic field validations
  if (!name) errors.name = 'Username is required.';
  if (!email) errors.email = 'Email is required.';
  if (!password) errors.password = 'Password is required.';
  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password.';

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailPattern.test(email)) {
    errors.email = 'Invalid email format.';
  }

  if (password && password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (password && confirmPassword && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!termsAccepted) {
    errors.terms = 'You must agree to the terms and conditions.';
  }

  // Stop here if any validation errors so far
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  // Check if username or email already taken
  try {
    const usernameTaken = await userModel.isUsernameTaken(name);
    if (usernameTaken) {
      errors.name = 'Username is already taken.';
    }

    const emailTaken = await userModel.isEmailTaken(email);
    if (emailTaken) {
      errors.email = 'Email is already registered.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Register the user
    await userModel.registerUser(name, email, password);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
    error: err.message,
    code: err.code,
    sqlMessage: err.sqlMessage
  });
  }
};

module.exports = {register};
