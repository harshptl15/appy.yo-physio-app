/**
 * controllers/goalsController.js
 * Goals page: save goals, per-muscle goal text, list with checkmark and X.
 */

const { MuscleService } = require('../businesslayer/MuscleService');
const goalsModel = require('../models/goalsModel');

const muscleService = new MuscleService();

/**
 * Show goals page: form + "Your saved goals" list with goal text, checkmark, X.
 */
const showGoalsView = async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect('/login');

    const [muscleDtos, userGoals] = await Promise.all([
      muscleService.getAllMuscles(),
      goalsModel.getGoalsByUserId(userId)
    ]);

    const muscleGroups = muscleDtos.map((m) => ({
      id: m.id,
      muscleName: m.muscleName
    }));

    const selectedMuscleIds = userGoals?.muscleIds ?? [];
    const intensity = userGoals?.intensity ?? 'moderate';
    const notes = userGoals?.notes ?? '';
    const muscleGoals = userGoals?.muscleGoals ?? {};
    const idToName = new Map(muscleGroups.map((m) => [m.id, m.muscleName]));

    // List for "Your saved goals": each saved muscle with goal text and completed
    const savedGoalsList = (userGoals?.muscleIds ?? []).map((muscleId) => ({
      muscleId,
      muscleName: idToName.get(muscleId) || 'Body part',
      goalText: muscleGoals[String(muscleId)]?.text || '',
      completed: Boolean(muscleGoals[String(muscleId)]?.completed)
    }));

    res.render('goalsView', {
      user: req.session.user,
      muscleGroups,
      selectedMuscleIds,
      intensity,
      notes,
      savedGoalsList,
      savedIntensity: userGoals?.intensity ?? null,
      success: req.query.saved === '1'
    });
  } catch (err) {
    console.error('Error in showGoalsView:', err);
    res.status(500).send('Something went wrong loading your goals.');
  }
};

/**
 * Save user goals from the main form
 */
const saveGoals = async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect('/login');

    let muscleIds = req.body.muscleIds;
    if (typeof muscleIds === 'string') muscleIds = [muscleIds];
    if (!Array.isArray(muscleIds)) muscleIds = [];
    muscleIds = muscleIds.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));

    const intensity = req.body.intensity || 'moderate';
    const notes = (req.body.notes || '').trim() || null;

    await goalsModel.saveGoals(userId, muscleIds, intensity, notes);
    res.redirect('/goals?saved=1');
  } catch (err) {
    console.error('Error saving goals:', err);
    res.status(500).send('Something went wrong saving your goals.');
  }
};

/**
 * Set goal text for one muscle (from modal prompt)
 */
const setMuscleGoal = async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect('/login');
    const muscleId = parseInt(req.body.muscleId, 10);
    if (isNaN(muscleId)) return res.redirect('/goals');
    const goalText = (req.body.goalText || '').trim() || '';

    await goalsModel.setMuscleGoalText(userId, muscleId, goalText);
    res.redirect('/goals');
  } catch (err) {
    console.error('Error setting muscle goal:', err);
    res.status(500).send('Something went wrong.');
  }
};

/**
 * Toggle completed for one goal (checkmark)
 */
const toggleComplete = async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect('/login');
    const muscleId = parseInt(req.body.muscleId, 10);
    if (isNaN(muscleId)) return res.redirect('/goals');

    await goalsModel.toggleMuscleGoalCompleted(userId, muscleId);
    res.redirect('/goals');
  } catch (err) {
    console.error('Error toggling complete:', err);
    res.redirect('/goals');
  }
};

/**
 * Remove one goal from the list (X)
 */
const removeGoal = async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect('/login');
    const muscleId = parseInt(req.params.muscleId, 10);
    if (isNaN(muscleId)) return res.redirect('/goals');

    await goalsModel.removeMuscleGoal(userId, muscleId);
    res.redirect('/goals');
  } catch (err) {
    console.error('Error removing goal:', err);
    res.redirect('/goals');
  }
};

module.exports = {
  showGoalsView,
  saveGoals,
  setMuscleGoal,
  toggleComplete,
  removeGoal
};
