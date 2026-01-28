/**
 * this is a helper function to convert ExerciseDTOs to an array of objects the view can use.
 * Each object contains the fields: "exerciseName", "id"
 */
//import the ExerciseDTO class
const { ExerciseDTO } = require("../DTO/ExerciseDTO");

const exerciseDtoConverterToObjectsForView = (exerciseDTOs) => {
    //check if exerciseDTOs is not an array, or has a lenght of 0, or the fileds are not exerciseDTOs and log an error message    
    if (!Array.isArray(exerciseDTOs) || exerciseDTOs.length === 0 || !exerciseDTOs.every(exercise => exercise instanceof ExerciseDTO)) {
        console.error("exerciseDtoConverterToObjectForView: Invalid input, expected an array of ExerciseDTO objects");
        return [];
    }
    

    //map the exerciseDTOs to an array of objects the view can use
    exerciseObjectsToReturn =  exerciseDTOs.map(exercise => {
        return {
            exerciseName: exercise.exerciseName,
            id: exercise.id,
            goal: exercise.goal
        };
    });
    
    //debug message to check converter is working
    console.log("exercise DTO converted to object for view: ", exerciseObjectsToReturn);
    return exerciseObjectsToReturn;
};

//export the function so it can be used in other files
module.exports = {
    exerciseDtoConverterToObjectsForView
};