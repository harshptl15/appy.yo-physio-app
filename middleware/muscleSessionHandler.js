/**
 * Author: Luke Johnson
 * Description: Middleware for converting muslceGroup and category session variables to 
 * an array of objects stored in the session.
 * also resets the session array of objects containing muscle groups and categories.
 * This allows the user to search multiple muscle groups with categories when searching for exercises.
 */

/**
 * convert muslceGroup and category session variables to an array of objects in the session.
 * then deletes the muscleGroup and category session variables.
 */
const convertMuscleGroupAndCategoryInSessionToArray = (req, res, next) =>{
    console.log("in convertMuscleGroupAndCategoryInSessionToArray middleware");
    //check if muscleGroup session variable is set
    if (req.session.muscleGroup == null || req.session.muscleGroup.length === 0) {
        return res.status(400).json({ error: "Muscle group not set in session" });
    }
    //check if category session variable is set
    if (req.session.category == null || req.session.category.length === 0) {
        return res.status(400).json({ error: "Category not set in session" });
    }
    //check if a muscleArray session variable is set
    if (req.session.muscleArray == null) {
        req.session.muscleArray = []; //initialize muscleArray session variable
    }
    //create a new object with muscleGroup and category
    const muscleObject = {
        muscleName: req.session.muscleGroup,
        category: req.session.category
    };
    //push the muscleObject to the muscleArray session variable
    req.session.muscleArray.push(muscleObject);
    next(); //call next middleware
}

/**
 * resets the session array of muscle groups and categories, and muscle groups and categories variables.
 */
const resetMuscleGroupAndCategoryInSession = (req, res, next) => {
    req.session.muscleArray = []; //reset muscleArray session variable
    req.session.muscleGroup = null; //reset muscleGroup session variable
    req.session.category = null; //reset category session variable
    next(); //call next middleware
}

module.exports = {
    convertMuscleGroupAndCategoryInSessionToArray,
    resetMuscleGroupAndCategoryInSession
};