const speakeasy = require('speakeasy');
const qrcode    = require('qrcode');
const userModel = require('../models/userModel');
const { generateNotificationEventsForUser } = require('../services/notificationEligibilityService');
const APP_ISSUER = 'PhysioApp';

const renderSetup = (req, res, secretBase32, error = null) => {
  const otpAuthUrl = speakeasy.otpauthURL({
    secret: secretBase32,
    label: `${APP_ISSUER}:${req.user.username}`,
    issuer: APP_ISSUER,
    encoding: 'base32'
  });

  qrcode.toDataURL(otpAuthUrl, (qrErr, dataUrl) => {
    if (qrErr) {
      console.error('2FA QR generation error:', qrErr);
      return res.status(500).render('twofa-setup', {
        qrCodeUrl: null,
        manualKey: secretBase32,
        error: 'Could not generate QR code. Use the manual key below.',
        username: req.user.username
      });
    }

    return res.render('twofa-setup', {
      qrCodeUrl: dataUrl,
      manualKey: secretBase32,
      error,
      username: req.user.username
    });
  });
};

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
  const secret = speakeasy.generateSecret({ length: 20, name: `${APP_ISSUER}:${req.user.username}` });
  req.session.twofa_temp_secret = secret.base32;
  renderSetup(req, res, secret.base32);
};

/**
 * POST /twofa/setup
 * Verify the setup token and enable 2FA in the database
 */
exports.postTwofaSetup = async (req, res) => {
  try {
    const userId = req.user.id;
    const token = (req.body.token || '').trim();
    const secretBase32 = req.session.twofa_temp_secret;

    if (!secretBase32) {
      return res.redirect('/twofa/setup');
    }

    if (!/^\d{6}$/.test(token)) {
      return renderSetup(req, res, secretBase32, 'Enter a valid 6-digit code.');
    }

    const verified = speakeasy.totp.verify({
      secret: secretBase32,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return renderSetup(req, res, secretBase32, 'Invalid code. Please try again.');
    }

    await userModel.enableTwoFactor(userId, secretBase32);
    delete req.session.twofa_temp_secret;
    if (req.session.user) req.session.user.twofa_enabled = true;
    return res.redirect('/settings?type=success&message=Two-factor+authentication+enabled.');
  } catch (err) {
    console.error('2FA setup error:', err);
    return res.status(500).render('twofa-setup', {
      qrCodeUrl: null,
      manualKey: req.session.twofa_temp_secret || '',
      error: 'Unable to enable 2FA right now. Please try again.',
      username: req.user?.username || ''
    });
  }
};

/**
 * GET /twofa/verify
 * Render the 2FA verification page after login
 */
exports.getTwofaVerify = (req, res) => {
  if (!req.session.temp_twofa_user) {
    return res.redirect('/login');
  }
  res.render('twofa-verify', { error: null });
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
  try {
    if (!req.session.temp_twofa_user) {
      return res.redirect('/login');
    }

    const userId = req.session.temp_twofa_user.id;
    const token = (req.body.token || '').trim();

    if (!/^\d{6}$/.test(token)) {
      return res.render('twofa-verify', { error: 'Enter a valid 6-digit code.' });
    }

    const user = await userModel.getUserById(userId);
    if (!user || !user.twofa_secret) {
      return res.render('twofa-verify', { error: '2FA is not configured for this account.' });
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
    req.session.user = {
      id: user.id,
      username: user.username,
      twofa_enabled: user.twofa_enabled
    };

    generateNotificationEventsForUser(user.id).catch((error) => {
      console.error('Notification generation after 2FA verify failed:', error);
    });

    return res.redirect('/dashboard');
  } catch (err) {
    console.error('2FA verify error:', err);
    return res.status(500).render('twofa-verify', { error: 'Could not verify code right now.' });
  }
};

/**
 * POST /twofa/disable
 * Disable two-factor authentication after password confirmation
 */
exports.disableTwofa = async (req, res) => {
  try {
    await userModel.disableTwoFactor(req.user.id);
    if (req.session.user) req.session.user.twofa_enabled = false;
    return res.redirect('/settings?type=success&message=Two-factor+authentication+disabled.');
  } catch (err) {
    console.error('2FA disable error:', err);
    return res.redirect('/settings?type=error&message=Could+not+disable+2FA.');
  }
};
