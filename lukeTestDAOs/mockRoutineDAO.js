/**
 * this is a mock DAO so the controllers can operate before implementing the actual DAO.
 */
//import exercise DTO
const { ExerciseDTO } = require("../DTO/ExerciseDTO");
//import routine DTO
const { RoutineDTO } = require("../DTO/RoutineDTO");

/**
 * get all 
 * gets all exercises in routine for based on user id.
 * @param userId
 */
const getAllExercisesInRoutine = (userId) => {
    console.log("in mockRoutineDAO getAllExercisesInRoutine for user id: ", userId);
    //create a mock array of exercise DTOs
    const exercisesToReturn = [
        new ExerciseDTO({
            id: 1,
            exerciseName: "exercise1",
            tips: "Mock tips 1",
            commonMistakes: "Mock common mistakes 1",
            image: "mockImage1.jpg",
            video: "mockVideo1.mp4",
            sets: 3,
            reps: 10,
            skillLevel: "beginner",
            tempo: "2-0-2",
            position: "standing",
            equipment: "dumbbell"
        }),
        new ExerciseDTO({
            id: 2,
            exerciseName: "Exercise in Routine 2",
            tips: "Mock tips 2",
            commonMistakes: "Mock common mistakes 2",
            image: "mockImage2.jpg",
            video: "mockVideo2.mp4",
            sets: 3,
            reps: 10,
            skillLevel: "beginner",
            tempo: "2-0-2",
            position: "standing",
            equipment: "dumbbell"
        })
    ]
    return exercisesToReturn;
}

/**
 * insert multiple exercises into routine for user
 * @param exerciseRoutineDtos : an array of ExerciseRoutineDTOs which each represent an exercise in a routine.
 */
const insertMultipleExercisesIntoRoutine = (routineDtos) => {
    //debug to show we are in this function
    console.log("inserting multiple exercise routines: ", routineDtos);
}

/**
 * remove routines
 * @param routineDto: a RoutineDTO which each represents an exercise in a routine.
 */
const removeRoutine = (routineDto) => {
    //debug to show we are in this function
    console.log("removing an exercise routine: ", routineDto);
}

/**
 * remove all routines for a user
 * @param userId: the id of the user to remove routines for
 */
const removeAllRoutinesForUser = (userId) => {
    //debug to show we are in this function
    console.log("removing all exercise routines for user id: ", userId);
}

//export all functions so they can be used in other files
module.exports = {
    getAllExercisesInRoutine,
    insertMultipleExercisesIntoRoutine,
    removeRoutine,
    removeAllRoutinesForUser
};