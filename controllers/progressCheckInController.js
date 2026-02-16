const {
  createProgressCheckIn
} = require('../models/progressCheckInModel');
const {
  NOTIFICATION_TYPES,
  createLog,
  markClicked
} = require('../models/notificationLogModel');

const submitProgressCheckIn = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const mood = (req.body.mood || '').trim() || null;
    const painAvgRaw = req.body.painAvg;
    const mobilityRaw = req.body.mobilityRating;
    const notes = (req.body.notes || '').trim() || null;
    const sourceNotificationId = Number(req.body.notificationId || 0);

    const painAvg = painAvgRaw === '' || painAvgRaw === undefined ? null : Number(painAvgRaw);
    const mobilityRating = mobilityRaw === '' || mobilityRaw === undefined ? null : Number(mobilityRaw);

    if (painAvg !== null && (!Number.isInteger(painAvg) || painAvg < 0 || painAvg > 10)) {
      return res.status(400).json({ error: 'painAvg must be between 0 and 10.' });
    }

    if (mobilityRating !== null && (!Number.isInteger(mobilityRating) || mobilityRating < 1 || mobilityRating > 5)) {
      return res.status(400).json({ error: 'mobilityRating must be between 1 and 5.' });
    }

    if (notes && notes.length > 600) {
      return res.status(400).json({ error: 'notes must be 600 characters or fewer.' });
    }

    const checkInId = await createProgressCheckIn({
      userId,
      mood,
      painAvg,
      mobilityRating,
      notes
    });

    await createLog({
      userId,
      type: NOTIFICATION_TYPES.PROGRESS_CHECKIN,
      status: 'SENT',
      metadata: { source: 'checkin_submission', checkInId }
    });

    if (sourceNotificationId > 0) {
      await markClicked({ notificationId: sourceNotificationId, userId });
    }

    return res.status(200).json({ data: { checkInId } });
  } catch (error) {
    console.error('Failed to submit progress check-in:', error);
    return res.status(500).json({ error: 'Could not submit progress check-in.' });
  }
};

module.exports = {
  submitProgressCheckIn
};
