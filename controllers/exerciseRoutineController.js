/**
 * author: Luke Johnson
 * description: routine controller with preference-aware plan generation and workout session behavior.
 */

const { RoutineDTO } = require('../DTO/RoutineDTO');
const { UserDTO } = require('../DTO/UserDTO');
const { ExerciseDTO } = require('../DTO/ExerciseDTO');
const { exerciseDtoConverterToObjectsForView } = require('./exerciseDtoConverterToObjectsForView');
const { RoutineService } = require('../businesslayer/RoutineService');
const { ExerciseService } = require('../businesslayer/ExerciseService');
const {
  getOrCreateByUserId
} = require('../models/workoutPreferencesModel');
const {
  createWorkoutSession,
  getWorkoutSessionById,
  getLastCompletedWorkoutSessionByUserId,
  getRecentCompletedSessionsByUserId,
  linkRoutineEntriesToSession,
  getRoutineStatsByUserId,
  completeWorkoutSession,
  getPainFeedbackBySessionId
} = require('../models/workoutSessionModel');
const {
  getPlanConstraintsFromDuration,
  computeDifficultyAdjustment
} = require('../services/workoutBehaviorService');

const exerciseService = new ExerciseService();
const routineService = new RoutineService();

const getExerciseResultsIdsFromView = (req, res) => {
  const numberOfExercises = Number(req.body.numberOfExercises);
  if (!numberOfExercises || numberOfExercises <= 0) {
    res.status(400).json({ error: 'Invalid number of exercises' });
    return [];
  }

  const exerciseResultIds = [];
  for (let i = 0; i < numberOfExercises; i += 1) {
    const raw = req.body[`selected${i}`];
    if (!raw) continue;
    const parsed = Number(raw);
    if (Number.isInteger(parsed) && parsed > 0) {
      exerciseResultIds.push(parsed);
    }
  }

  return exerciseResultIds;
};

const finalizeSessionWithoutPainFeedbackIfNeeded = async ({ userId, sessionId, prefs }) => {
  if (!sessionId) return;

  const session = await getWorkoutSessionById(sessionId);
  if (!session || session.status !== 'active') return;

  if (prefs.painFeedbackAfterWorkoutsEnabled) {
    return;
  }

  const routineStats = await getRoutineStatsByUserId(userId);
  const completionRatio = routineStats.total === 0 ? 0 : Number((routineStats.completed / routineStats.total).toFixed(2));

  const recentSessions = await getRecentCompletedSessionsByUserId(userId, 5);
  const adjustment = computeDifficultyAdjustment({
    autoAdjustEnabled: prefs.autoAdjustDifficultyEnabled,
    conservativeProgressionEnabled: prefs.conservativeProgressionEnabled,
    painFeedbackAfterWorkoutsEnabled: prefs.painFeedbackAfterWorkoutsEnabled,
    currentDifficulty: session.difficulty_before,
    completionRatio,
    latestPainFeedback: null,
    recentSessions,
    recentFeedbackBySessionId: {}
  });

  await completeWorkoutSession({
    sessionId,
    completionRatio,
    difficultyAfter: adjustment.difficultyAfter,
    adjustmentReason: adjustment.adjustmentReason,
    conservativeProgressionApplied: adjustment.conservativeProgressionApplied
  });
};

const justAddExercisesToRoutine = async (req, res, exerciseDtos) => {
  const userId = req.session.user.id;
  const exerciseIds = exerciseDtos
    .map((exercise) => Number(exercise.id))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (exerciseIds.length === 0) {
    return null;
  }

  const prefs = await getOrCreateByUserId(userId);
  const planConstraints = getPlanConstraintsFromDuration(
    prefs.preferredWorkoutDurationMinutes,
    exerciseIds.length
  );

  const limitedExerciseIds = exerciseIds.slice(0, planConstraints.targetExerciseCount);
  const lastCompletedSession = await getLastCompletedWorkoutSessionByUserId(userId);
  const difficultyBefore = Number(lastCompletedSession?.difficulty_after || 1.0);

  const workoutSessionId = await createWorkoutSession({
    userId,
    preferredWorkoutDurationMinutes: prefs.preferredWorkoutDurationMinutes,
    targetExerciseCount: limitedExerciseIds.length,
    estimatedDurationMinutes: planConstraints.estimatedDurationMinutes,
    difficultyBefore
  });

  await linkRoutineEntriesToSession({
    userId,
    sessionId: workoutSessionId,
    exerciseIds: limitedExerciseIds
  });

  req.session.activeWorkoutSessionId = workoutSessionId;
  req.session.latestSessionPlanMetadata = {
    durationPreferenceMinutes: prefs.preferredWorkoutDurationMinutes,
    requestedExercises: exerciseIds.length,
    selectedExercises: limitedExerciseIds.length,
    warmupIncluded: planConstraints.warmupIncluded,
    warmupMinutes: planConstraints.warmupMinutes,
    perExerciseMinutes: planConstraints.perExerciseMinutes,
    estimatedDurationMinutes: planConstraints.estimatedDurationMinutes
  };

  return { workoutSessionId, prefs };
};

const justShowTheView = async (req, res) => {
  const userId = req.session.user.id;
  const userDTO = new UserDTO({ id: userId, userName: req.session.user.username });

  const prefs = await getOrCreateByUserId(userId);
  const exerciseDtosFromDao = await exerciseService.getExercisesFromRoutineByUserId(userDTO);
  const exerciseObjectsForRoutineView = exerciseDtoConverterToObjectsForView(exerciseDtosFromDao);

  let allExercisesCompleted = false;
  let currentExerciseIndex = 0;

  for (let i = 0; i < exerciseObjectsForRoutineView.length; i += 1) {
    if (exerciseObjectsForRoutineView[i].goal === false) {
      currentExerciseIndex = i;
      break;
    }

    if (i === exerciseObjectsForRoutineView.length - 1) {
      allExercisesCompleted = true;
    }
  }

  let currentExercise = null;
  if (!exerciseDtosFromDao || exerciseDtosFromDao.length === 0) {
    currentExercise = {
      id: 0,
      exerciseName: 'No exercise in routine',
      tips: '',
      commonMistakes: '',
      image: '',
      video: '',
      sets: '',
      reps: '',
      skillLevel: '',
      tempo: '',
      position: '',
      equipment: ''
    };
  } else {
    const current = exerciseDtosFromDao[currentExerciseIndex];
    currentExercise = {
      id: current.id,
      exerciseName: current.exerciseName,
      tips: current.tips,
      commonMistakes: current.commonMistakes,
      image: current.image,
      video: current.video,
      sets: current.sets,
      reps: current.reps,
      skillLevel: current.skillLevel,
      tempo: current.tempo,
      position: current.position,
      equipment: current.equipment
    };
  }

  const activeWorkoutSessionId = req.session.activeWorkoutSessionId || null;
  let shouldShowPainFeedback = false;

  if (allExercisesCompleted && activeWorkoutSessionId) {
    if (prefs.painFeedbackAfterWorkoutsEnabled) {
      const existingFeedback = await getPainFeedbackBySessionId(activeWorkoutSessionId);
      shouldShowPainFeedback = !existingFeedback;
    } else {
      await finalizeSessionWithoutPainFeedbackIfNeeded({
        userId,
        sessionId: activeWorkoutSessionId,
        prefs
      });
      delete req.session.activeWorkoutSessionId;
    }
  }

  res.render('./exerciseRoutineView', {
    exerciseRoutine: exerciseObjectsForRoutineView,
    currentExercise,
    allExercisesCompleted,
    workoutPlanMetadata: req.session.latestSessionPlanMetadata || null,
    showPainFeedbackPrompt: shouldShowPainFeedback,
    activeWorkoutSessionId: activeWorkoutSessionId || null,
    painFeedbackAfterWorkoutsEnabled: prefs.painFeedbackAfterWorkoutsEnabled
  });
};

const showExerciseRoutineView = async (req, res) => {
  try {
    const exerciseRoutineIds = getExerciseResultsIdsFromView(req, res);
    if (exerciseRoutineIds.length === 0) {
      return res.status(400).json({ error: 'Created exercise routine is empty' });
    }

    const inputExerciseDTOs = exerciseRoutineIds.map((exerciseId) => new ExerciseDTO({ id: exerciseId }));
    await justAddExercisesToRoutine(req, res, inputExerciseDTOs);
    return justShowTheView(req, res);
  } catch (error) {
    console.error('Failed to build exercise routine:', error);
    if (error && (error.code === 'USER_NOT_FOUND' || error.code === 'INVALID_USER_ID')) {
      delete req.session.user;
      return res.status(401).send('Session user is invalid. Please log in again.');
    }
    return res.status(500).send('Could not create exercise routine.');
  }
};

const markExerciseAsFinished = async (req, res) => {
  const userId = req.session.user.id;
  const finishedExerciseId = Number(req.body.finishedExerciseId);
  if (!Number.isInteger(finishedExerciseId) || finishedExerciseId <= 0) {
    return res.status(400).send('Invalid exercise id.');
  }

  const routineToMarkAsFinished = new RoutineDTO({
    userId,
    exerciseId: finishedExerciseId
  });

  await routineService.markRoutineAsFinished(routineToMarkAsFinished);
  return justShowTheView(req, res);
};

const removeExerciseFromRoutine = async (req, res) => {
  const exerciseIdToRemove = Number(req.body.exerciseId);
  const userId = req.session.user.id;

  if (!Number.isInteger(exerciseIdToRemove) || exerciseIdToRemove <= 0) {
    return res.status(400).send('Invalid exercise id.');
  }

  const routineToRemove = new RoutineDTO({
    id: 1,
    userId,
    exerciseId: exerciseIdToRemove
  });

  await routineService.removeRoutineBySecondaryFields(routineToRemove);
  return justShowTheView(req, res);
};

const restartRoutine = async (req, res) => {
  const userId = req.session.user.id;
  const userDTO = new UserDTO({ id: userId });
  await routineService.restartEntireRoutine(userDTO);
  return justShowTheView(req, res);
};

module.exports = {
  showExerciseRoutineView,
  removeExerciseFromRoutine,
  markExerciseAsFinished,
  restartRoutine,
  justShowTheView,
  justAddExercisesToRoutine
};
