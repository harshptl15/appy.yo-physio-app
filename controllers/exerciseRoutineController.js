/**
 * author: Luke Johnson
 * description: this controller for the routine, 
 * it recieves the exercises to add to the routine
 * from the exercise search controller.
 * it renders the exercise routine view.
 * it adds exercises to the routine.
 * it removes exercises from the routine.
 * it marks exercises goals as completed.
 */

//import the routine DTO
const { RoutineDTO } = require("../DTO/RoutineDTO");
//require the user DTO
const { UserDTO } = require("../DTO/UserDTO");
//require the exercise DTO
const { ExerciseDTO } = require("../DTO/ExerciseDTO");

//import the helper for converting exercise DTOs to objects for the view
const { exerciseDtoConverterToObjectsForView } = require("./exerciseDtoConverterToObjectsForView");
//require the routine service to get exercises from the DAO
const { RoutineService } = require("../businesslayer/RoutineService");
//require the exercise service to get exercises from the DAO
const { ExerciseService } = require("../businesslayer/ExerciseService");

//instantiate objects of the services.
const exerciseService = new ExerciseService();
const routineService = new RoutineService();

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
    //get the ids of exercises to add to the routine from the request body.
    //they will be converted into ExerciseDTOs.
        _exerciseRoutineIds = getExerciseResultsIdsFromView(req, res);
        //check if exercise routine is empty
        if (_exerciseRoutineIds.length === 0) {
            return res.status(400).json({ error: "created exercise routine is empty" });
        }
        console.log("exercise routine from request body: ", _exerciseRoutineIds);
        //create exercise DTOs from the exercise IDs
        _inputExerciseDTOs = _exerciseRoutineIds.map(exerciseId => {
            return new ExerciseDTO({
                id: exerciseId
            });
        });
    //just show the view
    await justAddExercisesToRoutine(req, res, _inputExerciseDTOs);
    await justShowTheView(req, res);
}

/**
 * just add exercises to the routine
 * this is passed an array of exerciseDTOs and it checks which 
 * do not exist in current routine, and adds the new ones to the 
 * routine.
 */
const justAddExercisesToRoutine = async (req, res, exerciseDtos) => {
    console.log("in justAddExercisesToRoutine in exerciseRoutineController.js");
    //create user DTO from session
    _userDTO = new UserDTO({
        id: req.session.user.id,
        userName: req.session.userName
    })
    //query DAO for exercise routine
    oldExerciseDtosFromDao = await exerciseService.getExercisesFromRoutineByUserId(_userDTO);
    //find exercise objects that exist in the input routine but not in the old routine from the database.
    //this is based on te exercise name.
    exerciseDtosToAdd = exerciseDtos.filter(inputExerciseDto => {
        return !oldExerciseDtosFromDao.some(oldExercise => oldExercise.id == inputExerciseDto.id);
    })
    //debug the exercises to add to the routine
    console.log("exercises to add to routine: ", exerciseDtosToAdd);
    //get the userId from the session to use in the routine DAO
    userIdFromSession = req.session.user.id;
    //create an array to store the routine DTOs to add
    routinesToAdd = [];
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
    }

    
}

/**
 * helper function to get the exercise results ids from the view.
 * @param {} req 
 * @param {*} res 
 */
const getExerciseResultsIdsFromView = (req, res) => {
    //get the total number of exercises in the list in the results view.
    const numberOfExercises = req.body.numberOfExercises;
    if (!numberOfExercises || numberOfExercises <= 0) {
        return res.status(400).json({ error: "Invalid number of exercises" });
    }
    //array for storing exercise result ids
    exerciseResultIds = [];
    //iterate through all checkboxes in the view that are checked for 
    //selected exercises to add to the routine, and push their
    //value into the exercise result ids array.
    for (let i=0; i < numberOfExercises; i++) {
        if (req.body[`selected${i}`]) {
            exerciseResultIds.push(req.body[`selected${i}`]);
        }
    }
    console.log("exerciseResultIds: ", exerciseResultIds);
    return exerciseResultIds;
}

/**
 * finishedExercise this function marks an exercise as finished, and moves on to the next exercise in the routine.
 * in the process it marks the exercise as completed in the databse, and reloads the view with the data on the next exercise,
 * also passing it all the exercises in the list.
 */
const markExerciseAsFinished = async (req, res) => {
    console.log("in markExerciseAsFinished in exerciseRoutineController.js");
    //get the user id from the session
    const userId = req.session.user.id;
    //get the current exercise id from the request body
    const finishedExerciseId = req.body.finishedExerciseId;
    //create a RoutineDTO to mark as finished
    const routineToMarkAsFinished = new RoutineDTO({
        userId: userId,
        exerciseId: finishedExerciseId
    });
    //render the exercise routine view with all exercises from the routine DAO, and the current exercise object.
    await routineService.markRoutineAsFinished(routineToMarkAsFinished);
    justShowTheView(req, res);
}

/**
 * TODO
 * removeExeriseFromRoutine this function removes the current exercise in the routine.
 * index was the current exercise index, it decrements it. 
 * it then reloads the routine view with the updated routine.
 */
const removeExerciseFromRoutine = async (req, res) => {
    //get the exercise id from the request body
    const exerciseIdToRemove = req.body.exerciseId;
    //get the user id from the session
    const userId = req.session.user.id;
    //create a RoutineDTO to remove
    const routineToRemove = new RoutineDTO({
        id: 1,
        userId: userId,
        exerciseId: exerciseIdToRemove
    });
    //call the routine service to remove the routine
    await routineService.removeRoutineBySecondaryFields(routineToRemove);
    //reload the routine view
    await justShowTheView(req, res);
}

const justShowTheView = async (req, res) => {
    //get all exercises in routine for user from Routine DAO
    exerciseDtosFromDao = await exerciseService.getExercisesFromRoutineByUserId(_userDTO);
        //debug message to check if exercise DTOs are returned from DAO
        console.log("exercise DTOs from DAO: ", exerciseDtosFromDao);
    //using the exerciseDtoConverterToObjectsForView helper turn the exerciseDTOs for the routine
    // into objects the view can use, 
    exerciseObjectsForRoutineView = exerciseDtoConverterToObjectsForView(exerciseDtosFromDao);
    //debug message to check if exercise objects for routine view are created
    console.log("exercise objects for routine view: ", exerciseObjectsForRoutineView);
    //variable tracks if all exercises in the routine are completed.
    allExercisesCompleted = false;
    //index of current exercise in the routine
    currentExerciseIndex = 0;
    //iterate through all exercises in routine to find first one that is not marked as goal completed.
    for (let i=0; i < exerciseObjectsForRoutineView.length; i++) {
        if (exerciseObjectsForRoutineView[i].goal == false) {
            currentExerciseIndex = i;   
            //debug message
            console.log("current exercise set to ", currentExerciseIndex);
            //exit the loop once the first exercise with goal false is found
            break;
        }
        //check if at end of loop and no exercises with goals false.
        if (i == exerciseObjectsForRoutineView.length - 1) {
            //mark all exercises as completed.
            allExercisesCompleted = true;
            console.log("all exercises in routine are completed");
        }
    }
        //debug
        // console.log("current exercise index: ", currentExerciseIndex);
        // console.log("exerciseDtosFromDao length: ", exerciseDtosFromDao.length);
        // console.log("exerciseDtosFromDao value: ", exerciseDtosFromDao);
    //create currentExercise local variable
    currentExercise = null;
    //if query returns no exercises in routine, set currentExercise to dummy values
    if (!exerciseDtosFromDao || exerciseDtosFromDao.length == 0 || exerciseDtosFromDao.length == undefined) {
        currentExercise = { 
            id: 4,
            exerciseName: "no exercise in routine", 
            tips: "",
            commonMistakes: "",
            image: "",
            video: "",
            sets: "",
            reps: "",
            skillLevel: "",
            tempo: "",
            position: "",
            equipment: ""
            };
    } else {
        //create an object for the current exercise.
        currentExercise = { 
            id: exerciseDtosFromDao[currentExerciseIndex].id,
            exerciseName: exerciseDtosFromDao[currentExerciseIndex].exerciseName, 
            tips: exerciseDtosFromDao[currentExerciseIndex].tips,
            commonMistakes: exerciseDtosFromDao[currentExerciseIndex].commonMistakes,
            image: exerciseDtosFromDao[currentExerciseIndex].image,
            video: exerciseDtosFromDao[currentExerciseIndex].video,
            sets: exerciseDtosFromDao[currentExerciseIndex].sets,
            reps: exerciseDtosFromDao[currentExerciseIndex].reps,
            skillLevel: exerciseDtosFromDao[currentExerciseIndex].skillLevel,
            tempo: exerciseDtosFromDao[currentExerciseIndex].tempo,
            position: exerciseDtosFromDao[currentExerciseIndex].position,
            equipment: exerciseDtosFromDao[currentExerciseIndex].equipment
            };
        }
    //render the exercise routine view with all exercises from the routine DAO, and the current exercise object.
    res.render('./exerciseRoutineView', {exerciseRoutine: exerciseObjectsForRoutineView, currentExercise: currentExercise, allExercisesCompleted: allExercisesCompleted});
};

/**
 * restart the routine by setting all the goals in the routine to false.
 */
const restartRoutine = async (req, res) => {
    console.log("in restartRoutine in exerciseRoutineController.js");
    //get the user id from the session
    const userId = req.session.user.id;
    //create a UserDTO from the user id
    const userDTO = new UserDTO({ id: userId });
    //call routineService to restart the routine
    await routineService.restartEntireRoutine(userDTO);
    //reload the routine view
    justShowTheView(req, res);
}

module.exports = {
    showExerciseRoutineView,
    removeExerciseFromRoutine,
    markExerciseAsFinished,
    restartRoutine,
    justShowTheView,
    justAddExercisesToRoutine
};