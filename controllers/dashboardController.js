const { evaluateNotificationsForUser } = require('../services/notificationEligibilityService');
const { NOTIFICATION_TYPES } = require('../models/notificationLogModel');

const showDashboard = async (req, res) => {
  try {
    const user = req.session.user;
    const userId = user.id;

    const evaluated = await evaluateNotificationsForUser(userId);
    const notifications = evaluated.notifications || [];

    const inAppNotificationCards = [];
    let routineRecommendation = null;
    let progressCheckInPrompt = null;

    notifications.forEach((item) => {
      if (item.type === NOTIFICATION_TYPES.ROUTINE_RECOMMENDATION) {
        routineRecommendation = {
          notificationId: item.id,
          title: item.metadata?.title || 'Recommended for you today',
          duration: item.metadata?.duration || 20,
          difficulty: item.metadata?.difficulty || 'Moderate',
          rationale: item.metadata?.rationale || '',
          ctaLabel: item.metadata?.ctaLabel || 'Start now',
          ctaLink: item.metadata?.ctaLink || '/workouts'
        };
        return;
      }

      if (item.type === NOTIFICATION_TYPES.PROGRESS_CHECKIN) {
        progressCheckInPrompt = {
          notificationId: item.id,
          message: item.metadata?.message || 'Weekly check-in: how are you feeling overall?'
        };
        return;
      }

      inAppNotificationCards.push({
        id: item.id,
        type: item.type,
        message: item.metadata?.message || 'You have a new reminder.',
        ctaLabel: item.metadata?.ctaLabel || 'Open',
        ctaLink: item.metadata?.ctaLink || '/workouts'
      });
    });

    res.render('dashboard', {
      user,
      inAppNotificationCards,
      routineRecommendation,
      progressCheckInPrompt
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.render('dashboard', {
      user: req.session.user,
      inAppNotificationCards: [],
      routineRecommendation: null,
      progressCheckInPrompt: null
    });
  }
};

module.exports = { showDashboard };
