const { getAllUserIds } = require('../models/userModel');
const { generateNotificationEventsForUser } = require('../services/notificationEligibilityService');

const runDailyNotificationJob = async (req, res) => {
  try {
    const expectedToken = process.env.NOTIFICATION_JOB_TOKEN || '';
    const incomingToken = req.header('x-job-token') || req.query.token || '';

    if (!expectedToken || incomingToken !== expectedToken) {
      return res.status(401).json({ error: 'Unauthorized job request.' });
    }

    const userIds = await getAllUserIds();
    let processed = 0;

    for (const userId of userIds) {
      await generateNotificationEventsForUser(userId);
      processed += 1;
    }

    return res.status(200).json({
      data: {
        processedUsers: processed,
        ranAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Daily notification job failed:', error);
    return res.status(500).json({ error: 'Daily notification job failed.' });
  }
};

module.exports = {
  runDailyNotificationJob
};
