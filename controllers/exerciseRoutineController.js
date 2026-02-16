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

const getAuthenticatedUserDTO = (req) => {
    const userId = Number(req.session?.user?.id);
    if (!Number.isInteger(userId) || userId <= 0) {
        return null;
    }
    return new UserDTO({
        id: userId,
        userName: req.session.user.username
    });
};

/**
 * show exercise routine view
 * This function is called to show the exercise routine view.
 * it receives the exercises to add to the routine from the request body.
 * it adds new exercises to the routine in the db thrugh the routine DAO.
 * It then gets the updated routine from the DAO.
 * in that it knows what exercises are completed, and from that gets the current exercise.
 * it then renders the exercise routine view with the updated routine,
 * as well as data on the current exercise.
 */
const showExerciseRoutineView = async (req, res) => {
    console.log("in showExerciseRoutineView in exerciseRoutineController.js");
    const userDTO = getAuthenticatedUserDTO(req);
    if (!userDTO) {
        return res.status(401).json({ error: "Invalid session user. Please log in again." });
    }
    //get the ids of exercises to add to the routine from the request body.
    //they will be converted into ExerciseDTOs.
        const exerciseRoutineIds = getExerciseResultsIdsFromView(req);
        if (!exerciseRoutineIds) {
            return res.status(400).json({ error: "Invalid number of exercises" });
        }
        //check if exercise routine is empty
        if (exerciseRoutineIds.length === 0) {
            return res.status(400).json({ error: "created exercise routine is empty" });
        }
        console.log("exercise routine from request body: ", exerciseRoutineIds);
        //create exercise DTOs from the exercise IDs
        const inputExerciseDTOs = exerciseRoutineIds.map(exerciseId => {
            return new ExerciseDTO({
                id: exerciseId
            });
        });
    //just show the view
    try {
        await justAddExercisesToRoutine(req, res, inputExerciseDTOs, userDTO);
        await justShowTheView(req, res);
    } catch (error) {
        if (
            error.code === "SESSION_USER_NOT_FOUND" ||
            error.code === "INVALID_USER_ID" ||
            error.code === "ER_NO_REFERENCED_ROW_2"
        ) {
            req.session.destroy(() => {});
            return res.status(401).json({ error: "Session is invalid. Please log in again." });
        }
        throw error;
    }
}

/**
 * just add exercises to the routine
 * this is passed an array of exerciseDTOs and it checks which 
 * do not exist in current routine, and adds the new ones to the 
 * routine.
 */
const justAddExercisesToRoutine = async (req, res, exerciseDtos, userDTO = getAuthenticatedUserDTO(req)) => {
    console.log("in justAddExercisesToRoutine in exerciseRoutineController.js");
    if (!userDTO) {
        return res.status(401).json({ error: "Invalid session user. Please log in again." });
    }
    //query DAO for exercise routine
    const oldExerciseDtosFromDao = await exerciseService.getExercisesFromRoutineByUserId(userDTO);
    //find exercise objects that exist in the input routine but not in the old routine from the database.
    //this is based on te exercise name.
    const exerciseDtosToAdd = exerciseDtos.filter(inputExerciseDto => {
        return !oldExerciseDtosFromDao.some(oldExercise => oldExercise.id == inputExerciseDto.id);
    })
    //debug the exercises to add to the routine
    console.log("exercises to add to routine: ", exerciseDtosToAdd);
    //get the userId from the session to use in the routine DAO
    const userIdFromSession = userDTO.id;
    //create an array to store the routine DTOs to add
    const routinesToAdd = [];
    //loop through exercises to add and
    //make an array of RoutineDTOs to add from the exercises and the user id.
    exerciseDtosToAdd.forEach((exercise) => {
        routinesToAdd.push(new RoutineDTO({
            userId: userIdFromSession,
            exerciseId: exercise.id
        }));
    });
    //debug the routine DTOs to add
    console.log("routine DTOs to add: ", routinesToAdd);
    //if routinesToAdd is not empty, or null
    //insert the routines into the database
    if (routinesToAdd && routinesToAdd.length > 0) {
        await routineService.insertMultipleRoutines(routinesToAdd);
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

/**
 * helper function to get the exercise results ids from the view.
 * @param {} req 
 * @param {*} res 
 */
const getExerciseResultsIdsFromView = (req) => {
    //get the total number of exercises in the list in the results view.
    const numberOfExercises = Number(req.body.numberOfExercises);
    if (!Number.isInteger(numberOfExercises) || numberOfExercises <= 0) {
        return null;
    }
    //array for storing exercise result ids
    const exerciseResultIds = [];
    //iterate through all checkboxes in the view that are checked for 
    //selected exercises to add to the routine, and push their
    //value into the exercise result ids array.
    for (let i=0; i < numberOfExercises; i++) {
        if (req.body[`selected${i}`]) {
            exerciseResultIds.push(req.body[`selected${i}`]);
        }
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
  const exerciseRoutineIds = getExerciseResultsIdsFromView(req, res);
  if (exerciseRoutineIds.length === 0) {
    return res.status(400).json({ error: 'Created exercise routine is empty' });
  }

  const inputExerciseDTOs = exerciseRoutineIds.map((exerciseId) => new ExerciseDTO({ id: exerciseId }));
  await justAddExercisesToRoutine(req, res, inputExerciseDTOs);
  return justShowTheView(req, res);
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
