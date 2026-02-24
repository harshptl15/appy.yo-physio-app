/**
 * author: Luke Johnson
 * this controller recieves the muscle group form the muscleGroupSelectorView
 * and saves it in the session.
 * Note the session can contain an array of objects, each object contains a category and muscle group.
 * it also shows the muscle group selector view.
 */

const path = require('path'); //import path module

//require the MuscleService class
const { MuscleService } = require("../businesslayer/MuscleService");
//create an instance of the MuscleService class
const muscleService = new MuscleService();


const muscleGroupTemp = "chest"; //default muscle group variable
/**
 * show the muscle group view
 * When ?fresh=1 (e.g. from sidebar), set flag to replace muscleArray on next selection
 * so switching muscles shows the correct exercises instead of accumulating.
 */
 const showMuscleGroupView = async (req, res) => {
    if (req.query.fresh === '1') {
        req.session.replaceMuscleArray = true;
    }
     _muscleGroup = null; //initialize location variable
     if (req.session.muscleGroup == null || req.session.muscleGroup.length === 0) {        
         _muscleGroup = muscleGroupTemp; //set default location if not set in session
     }
     else {        
         _muscleGroup = req.session.muscleGroup; //get location from session if it exists
     }
     //get all muscl group DTOs.
     _muscleDtos = await muscleService.getAllMuscles(); 
     //map muscle DTO names to an array of objects
        _muscleGroups = _muscleDtos.map(muscleDto => {
            return { muscleName: muscleDto.muscleName,
                id : muscleDto.id
             };
        });
     //show where view
     console.log("in show muscle group view controller in locationSelectorController.js");
     res.render('./muscleGroupView', {muscleGroups: _muscleGroups, selectedMuscle: _muscleGroup});
 }

 
/**
 * the function which recieves the input from the muscle group view, and redirects to exerciseSearchController.
 */
const muscleGroupSelect = async (req, res) => {
    console.log("in muscle group select in muscleGroupSelectorController.js");
    //return error if muscle group is not set in form
    if (req.body.muscleGroupInput == null || req.body.muscleGroupInput.length === 0) {
        return res.status(400).json({ error: "Muscle group not set in form" });
    }
    // when user came from "Exercises" sidebar (fresh=1), replace muscleArray so we show
    // exercises for only the newly selected muscle instead of accumulating
    if (req.session.replaceMuscleArray) {
        req.session.muscleArray = [];
        delete req.session.replaceMuscleArray;
    }
    //set the session variable for muscle group if it exists
    req.session.muscleGroup = req.body.muscleGroupInput;
    res.redirect('/exerciseSearch');
    
}

module.exports = {showMuscleGroupView, muscleGroupSelect};//export showMuscleGroupView function