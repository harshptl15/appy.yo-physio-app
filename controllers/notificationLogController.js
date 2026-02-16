const {
  markClicked
} = require('../models/notificationLogModel');

const markNotificationClicked = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const notificationId = Number(req.params.id);
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({ error: 'Invalid notification id.' });
    }

    await markClicked({ notificationId, userId });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Failed to mark notification clicked:', error);
    return res.status(500).json({ error: 'Could not update notification status.' });
  }
};

module.exports = {
  markNotificationClicked
};
