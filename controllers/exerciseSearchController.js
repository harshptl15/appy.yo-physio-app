/**
 * author: Luke Johnson
 * description: this controller recieves the cattegory(strech/strengthen/avoid), muscle group, and were(home/hym) 
 * from the the session and creates a muscle and where dto do send to the DAO, form that it recieves an exercise DTO
 * which it sends to the exerciseRoutine view.
 * for now I will use LukeTestExerciseSearchView, and LukeTestExerciseRoutineView, for testing the controller works
 * without needing views which I am not responsible for.
 */

const { json } = require("express");

//import the exercise service which allows access to the exercise DAO
const { ExerciseService } = require("../businesslayer/ExerciseService");
const exerciseService = new ExerciseService();


//import DTOs
const { MuscleDTO, CategoryType } = require("../DTO/MuscleDTO");
const { ExerciseDTO } = require("../DTO/ExerciseDTO");
const { WhereDTO } = require("../DTO/WhereDTO");


//temp location variable
let categoryDefault = "stretch";

/**
 * * function for searching exercise based on muscle group, location, and category.
 * this uses the session varialbes to construct DTOs to send to the DAO.
 * pay close attention to how the DTOs are constructed, not they are passed an object 
 * as the paramater.
 */
const searchExercise = async (req, res) => {
    console.log("in searchExercise in exerciseSearchController.js");
    //location
    _location = null;
    //check if location is set in session
    if (req.session.location == null || req.session.location.length === 0) {    
        return res.status(400).json({ error: "Location not set in session" });
    }
    _location = req.session.location; //get location from session if it exists
    //category
    _category = null;
    //check if muscle array is set in session
    if (req.session.muscleArray == null || req.session.muscleArray.length === 0) {
        return res.status(400).json({ error: "Muscle array not set in session" });
    }
    //create local muscle groups array
    _muscleGroups = [ ];
    //loop through the muscle array in the session
    for (let muscleArrayIndex = 0; muscleArrayIndex < req.session.muscleArray.length; muscleArrayIndex++) {
        _muscleObject = req.session.muscleArray[muscleArrayIndex]; //get muscle object from session
        //debug _muscleObject
        console.log("muscleObject: ", _muscleObject);
        //check if muscle object has a muscle group
        if (_muscleObject.muscleName == null || _muscleObject.muscleName.length === 0) {
            return res.status(400).json({ error: "Muscle group not set in muscle object in session" });
        }
        //check if muscle object has a category
        if (_muscleObject.category == null || _muscleObject.category.length === 0) {
            return res.status(400).json({ error: "Category not set in muscle object in session" });
        }
        //if muscle object category is not = "avoid", set the category variable.
        if (_muscleObject.category != "avoid") {
            _category = _muscleObject.category;
        }
        //create new muscle DTO object and add it to the muscle groups array
        //note the object structure of muscleObject already follows the strcuture of the object
        //that must be passed to the MuscleDTO constructor
        _muscleGroups.push(new MuscleDTO(_muscleObject)); 
    }     
    //if the session category is not avoid, set category to the session category
    if (req.session.category != "avoid") {
        _category = req.session.category; //get location from session if it exists
    }
    _whereDTO = new WhereDTO( {id:1, location: _location }); //create a new where DTO object
    //get exercise results from DAO passing it location and muscle groups
    //note muscle groups array is deconstrcuted in these parameters
    console.log("SEARCH location:", _location);
console.log("WHERE DTO:", _whereDTO);

    _exerciseResults = await exerciseService.getExerciseComplexSearch(_whereDTO, _category, _muscleGroups);
    //check if exercise results are empty
    if (_exerciseResults == null || _exerciseResults.length === 0) {
        console.log("No exercises found for the given criteria");
    }
    //create array to store in list of exercises .ejs view
    _exerciseResultsForView = [];
    //check if elements in _exerciseResults are strings
    if (_exerciseResults.some(result => typeof result === "string")) { 
        console.log("Exercise results are strings");
        //map the strings in the _exerciseResults array to the exerciseName field in the objects in the _exerciseResultsForView array
        //also map a placeholder id to the id vield in that object in th eexerciseResultsForView array
        _exerciseResultsForView = _exerciseResults.map(exerciseStr => ( {exerciseName: exerciseStr, id: "1"}));
        
    }
    //check if the elements in _exerciseResults are ExerciseDTO objects
    else if (_exerciseResults.some(result => result instanceof ExerciseDTO)) {
        console.log("Exercise results are ExerciseDTO objects");
        //map the name field in the ExerciseDTO objects to the exerciseName field in the _exerciseResultsForView array
        //also map the id fild in the ExerciseDTO objects to the id filed in the _exerciseResultsForView array
        _exerciseResultsForView = _exerciseResults.map(exerciseDTO => ( {exerciseName: exerciseDTO.exerciseName, id: exerciseDTO.id}));
    }
    console.log("exerciseResultsForView: ", _exerciseResultsForView);
    //render the exercise routine view with the exercise results for the view
    res.render('./listOfExerciseResultsView', {exerciseResults: _exerciseResultsForView});
}

/** 
 * export the searchExercise function
 */
module.exports = { searchExercise }; //export searchExercise function