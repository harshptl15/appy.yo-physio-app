const speakeasy = require('speakeasy');
const qrcode    = require('qrcode');
const userModel = require('../models/userModel');

/**
 * GET /twofa/setup
 * Generate a TOTP secret, store it in the session, and render the 2FA setup page
 */
exports.getTwofaSetup = (req, res) => {
  const error =
    req.query.error === 'rate'
      ? 'Too many attempts. Please wait a few minutes and try again.'
      : null;

  let secret = req.session.twofa_temp_secret;
  let otpauthUrl = req.session.twofa_temp_otpauth;
  if (!secret || !otpauthUrl) {
    const generated = speakeasy.generateSecret({ length: 20 });
    secret = generated.base32;
    otpauthUrl = generated.otpauth_url;
    req.session.twofa_temp_secret = secret;
    req.session.twofa_temp_otpauth = otpauthUrl;
  }

  qrcode.toDataURL(otpauthUrl, (err, dataUrl) => {
    if (err) {
      return res.status(500).render('twofa-setup', {
        qrCodeUrl: null,
        manualKey: secret,
        error: 'Failed to generate QR code. Please enter the key manually.'
      });
    }
    res.render('twofa-setup', {
      qrCodeUrl: dataUrl,
      manualKey: secret,
      error
    });
  });
};

/**
 * POST /twofa/setup
 * Verify the setup token and enable 2FA in the database
 */
exports.postTwofaSetup = async (req, res) => {
  const userId = req.user.id;
  const token  = (req.body.token || '').replace(/\s+/g, '').replace(/[^\d]/g, '');
  const secret = req.session.twofa_temp_secret;

  if (!secret) {
    return res.redirect('/twofa/setup');
  }

  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1
  });

  if (verified) {
    await userModel.enableTwoFactor(userId, secret);
    delete req.session.twofa_temp_secret;
    delete req.session.twofa_temp_otpauth;
    return res.render('twofa-setup', {
      qrCodeUrl: null,
      manualKey: null,
      error: null,
      success: true
    });
  }

  // If verification fails, reuse the same secret and QR code
  const otpauthUrl = req.session.twofa_temp_otpauth;
  if (!otpauthUrl) {
    return res.redirect('/twofa/setup');
  }
  qrcode.toDataURL(otpauthUrl, (err, dataUrl) => {
    if (err) {
      return res.status(500).render('twofa-setup', {
        qrCodeUrl: null,
        manualKey: secret,
        error: 'Failed to generate QR code. Please try again.'
      });
    }
    res.render('twofa-setup', {
      qrCodeUrl: dataUrl,
      manualKey: secret,
      error: 'Invalid code, please try again.'
    });
  });
};

/**
 * GET /twofa/verify
 * Render the 2FA verification page after login
 */
exports.getTwofaVerify = (req, res) => {
  if (!req.session.temp_twofa_user) {
    return res.redirect('/login');
  }
  res.render('twofa-verify');
};

/**
 * GET /twofa/disable
 * Render the 2FA disable confirmation page
 */
exports.getTwofaDisable = async (req, res) => {
  const user = await userModel.getUserById(req.user.id);
  if (!user || !user.twofa_enabled) {
    return res.redirect('/dashboard');
  }
  res.render('twofa-disable', { error: null });
};

/**
 * POST /twofa/verify
 * Verify the 2FA token at login and finalize the user session
 */
exports.postTwofaVerify = async (req, res) => {
  if (!req.session.temp_twofa_user) {
    return res.redirect('/login');
  }
  const userId = req.session.temp_twofa_user.id;
  const token  = (req.body.token || '').replace(/\s+/g, '').replace(/[^\d]/g, '');

  const user = await userModel.getUserById(userId);
  if (!user || !user.twofa_secret) {
    return res.render('twofa-verify', { error: '2FA is not enabled for this account.' });
  }
  const verified = speakeasy.totp.verify({
    secret: user.twofa_secret,
    encoding: 'base32',
    token,
    window: 1
  });

  if (!verified) {
    return res.render('twofa-verify', { error: 'Invalid 2FA code.' });
  }

  delete req.session.temp_twofa_user;
  req.session.user = { id: user.id, username: user.username };
  res.render('twofa-verify', { success: true });
};

/**
 * POST /twofa/disable
 * Disable two-factor authentication after password confirmation
 */
exports.postTwofaDisable = async (req, res) => {
  const password = req.body.password || '';
  const userId = req.user.id;

  const ok = await userModel.verifyPassword(userId, password);
  if (!ok) {
    return res.render('twofa-disable', { error: 'Incorrect password.' });
  }

  await userModel.disableTwoFactor(userId);
  delete req.session.user.twofa_enabled;
  res.redirect('/dashboard');
};
