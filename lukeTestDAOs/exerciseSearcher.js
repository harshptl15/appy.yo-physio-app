/**
 * author: Luke Johnson
 * this is a mock DAO function for searching exercises.
 */

//import DTOs
const { MuscleDTO, CategoryType } = require("../DTO/MuscleDTO");
const { ExerciseDTO } = require("../DTO/ExerciseDTO");
const { WhereDTO } = require("../DTO/WhereDTO");
const { name } = require("ejs");
/**
 * This is a mock DAO function. it knows how to recieve the location, and an array of muscle groups
 * but does nothing with them other than checking that they are set and printing them to the console.
 * It constructs an array of exercises an returns it.
 * TODO change these exercises to DTOs and return them.
 * @param  {...any} args this is passed any number of arguments, the first arument is the location
 * whic is currently a string but may later be changed to a WhereDTO object.
 * The rest of the arguments are instances of MuscleDTO, each containing a muscle group and category.
 * @returns 
 */
function daoSearchForExercises(_category, _whereDTO, _muscleGroups) {
    //print category string
    console.log("Category: " + _category);
    //print location string
    console.log("Location: " + _location);
    //loop the rest of the aruments starting from index 1.
    for (let muscleGroupsIndex = 1; muscleGroupsIndex < _muscleGroups.length; muscleGroupsIndex++) {
        //check if the argument is an instance of MuscleDTO. Note the second parenthesis to make it a NOT.
        if (!(_muscleGroups[muscleGroupsIndex] instanceof MuscleDTO)) {
            console.error("Argument " + muscleGroupsIndex + " is not an instance of MuscleDTO");
        }
        //store muscle DTO as a local variable
        _muscleDTO = _muscleGroups[muscleGroupsIndex];
        //check if the muscleDTO has a set name field.
        if (_muscleDTO.muscleName == null || _muscleDTO.muscleName.length === 0) {
            console.error("Muscle group name is not set in MuscleDTO");
            return null;
        }
        //print muscle DTO name field.
        console.log("Muscle group name: " + _muscleDTO.muscleName);
        //check if the muscleDTO has a category field set.
        if (_muscleDTO.category == null || _muscleDTO.category.length === 0) {
            console.error("Category is not set in MuscleDTO");
            return null;
        }
    }
    //create an array of exercise DTOs to return
    exercises = [ 
        new ExerciseDTO({id: 1, exerciseName: "exercise1", tips: "tips1", commonMistakes: "commonMistakes1", image: "image1.jpg", video: "video1.mp4", sets: 3, reps: 10, skillLevel: "beginner", tempo: "2-0-2", position: "standing", equipment: "dumbbell", goal: false}),
        new ExerciseDTO({id: 2, exerciseName: "exercise2", tips: "tips2", commonMistakes: "commonMistakes2", image: "image2.jpg", video: "video2.mp4", sets: 4, reps: 12, skillLevel: "intermediate", tempo: "2-1-2", position: "sitting", equipment: "barbell", goal: false}),
        new ExerciseDTO({id: 3, exerciseName: "exercise3", tips: "tips3", commonMistakes: "commonMistakes3", image: "image3.jpg", video: "video3.mp4", sets: 5, reps: 15, skillLevel: "advanced", tempo: "2-2-2", position: "lying", equipment: "kettlebell", goal: false})
    ]
    //print exercises array of DTOs for debug purposes
    console.log("Exercises DTOs in mock exerciseSearcher: ", exercises);
    //return the exercises array
    return exercises;
}

//export the searchForExercises function
module.exports = {daoSearchForExercises};