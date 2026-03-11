/**
 * this is a helper function to convert ExerciseDTOs to an array of objects the view can use.
 * Each object contains the fields: "exerciseName", "id"
 */
//import the ExerciseDTO class
const { ExerciseDTO } = require("../DTO/ExerciseDTO");

const normalizeGoalToBoolean = (goalValue) => {
    if (goalValue === true || goalValue === 1 || goalValue === "1") return true;
    if (goalValue === false || goalValue === 0 || goalValue === "0") return false;
    if (typeof goalValue === "string") {
        const normalized = goalValue.trim().toLowerCase();
        if (normalized === "true") return true;
        if (normalized === "false") return false;
    }
    return false;
};

const exerciseDtoConverterToObjectsForView = (exerciseDTOs) => {
    //check if exerciseDTOs is not an array, or has a lenght of 0, or the fileds are not exerciseDTOs and log an error message    
    if (!Array.isArray(exerciseDTOs) || exerciseDTOs.length === 0 || !exerciseDTOs.every(exercise => exercise instanceof ExerciseDTO)) {
        console.error("exerciseDtoConverterToObjectForView: Invalid input, expected an array of ExerciseDTO objects");
        return [];
    }
    

    //map the exerciseDTOs to an array of objects the view can use
    const exerciseObjectsToReturn = exerciseDTOs.map(exercise => {
        return {
            exerciseName: exercise.exerciseName,
            id: exercise.id,
            goal: normalizeGoalToBoolean(exercise.goal),
            tips: exercise.tips || '',
            commonMistakes: exercise.commonMistakes || '',
            image: exercise.image || '',
            video: exercise.video || '',
            sets: exercise.sets || '',
            reps: exercise.reps || '',
            skillLevel: exercise.skillLevel || '',
            tempo: exercise.tempo || '',
            position: exercise.position || '',
            equipment: exercise.equipment || ''
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
