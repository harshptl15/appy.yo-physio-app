/**
 * controller for favourite exercises.
 * @author Luke Johnson
 */

//import DTOs
const { UserDTO } = require("../DTO/UserDTO");
const { ExerciseDTO } = require("../DTO/ExerciseDTO");
//favourite service to go inbetween DAO.
const { FavouritesService } = require("../businesslayer/FavouritesService");
const favouritesService = new FavouritesService();
//import helper class
const { exerciseDtoConverterToObjectsForView } = require("./exerciseDtoConverterToObjectsForView");
//import functsions from excerciseRoutineController.js
const { justAddExercisesToRoutine} = require("./exerciseRoutineController");
//import favourites service to get favourites

/**
 * TODO:
 * add/remove exercise to favourites in DB using DAO
 * requires mock DAO
 * redirect to call DAO to get favourites and send to view.
 */

const addExerciseToFavouritesThenShowFavourites = async (req, res) => {
    console.log("in addExerciseToFavouritesThenShowFavourites in favouriteExercisesController.js");
    //get user id from session.
    const userId = req.session.user.id; // Assuming userId is stored in session
    //get exercise id from request body.
    const exerciseId = req.body.favouriteExerciseId; // Assuming exerciseId is sent in the request body
    //create a UserDTO and ExerciseDTO
    const userDTO = new UserDTO({ id: userId });
    const exerciseDTO = new ExerciseDTO({ id: exerciseId });
    //get favourites from service to know if the exercise is already a favourite
    try {
        const existingFavouritesDtos = await favouritesService.getFavouritesByUserId(userDTO);
        //filter to so favouriteToAdd only is the favouriteDTO if it does not already exist in the favourites
        const favouriteDtoToAdd = !existingFavouritesDtos.some(dto => dto.id == exerciseDTO.id)
        ? exerciseDTO
        : undefined;
        //if favouriteDtoToAdd is not undefined, then add it to favourites
        if (favouriteDtoToAdd) {
            //call service to add exercise to favourites
            await favouritesService.insertFavourite(userDTO, favouriteDtoToAdd);
        }
    } catch (error) {
        console.error(`Error adding exercise to favourites: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
    //call getAndShowFavourites to get favourites and send to view.
    try {
        await getAndShowFavourites(req, res);
    } catch (error) {
        console.error(`Error retrieving favourites: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

/**
 * submit favourites form, this is called when the submit button is pressed
 * in the favourites view, this checks the checkboxes for each exercise
 * to see if any should be removed from favourites, or added to the routine.
 */
const submitFavouritesForm = async (req, res) => {
    console.log("in submitFavouritesForm in favouriteExercisesController.js");
    //get the number of favourites in the request body so it knows how many checkboxes to check
    const numberOfFavourites = req.body.numberOfFavourites;
    //debug the number of favourites
    console.log("numberOfFavourites: ", numberOfFavourites);
    //check if numberOfFavourites is greater than 0
    if (numberOfFavourites > 0) {
        //variable for storing array of favourites to remove
        let favouritesToRemove = [];
        //variable for storing array of favourites to add to routine
        let favouritesToAddToRoutine = [];
        //iterate through the favourites and check if any are checked
        for (let i = 0; i < numberOfFavourites; i++) {
            //check the add to routine checkbox
            if (req.body['addFavToRoutine' + i]) {
                //if it is checked, add the exercise id to the favouritesToAddToRoutine array
                favouritesToAddToRoutine.push(req.body['addFavToRoutine' + i]);
            }
            //check the favourites to remove checkbox
            if (req.body['removeFromFavs' + i]) {
                //if it is checked, add the exercise id to the favouritesToRemove array
                favouritesToRemove.push(req.body['removeFromFavs' + i]);
            }
        }
            // //debug the favouritesToAddToRoutine array
            // console.log("favouritesToAddToRoutine: ", favouritesToAddToRoutine);
        //debug the favouritesToRemove array
        console.log("favouritesToRemove: ", favouritesToRemove);
        //check if any favourites are to be added to the routine
        if (favouritesToAddToRoutine.length > 0) {
            //create an array of ExerciseDTOs from the favouritesToAddToRoutine array
            const exerciseDTOsToAdd = favouritesToAddToRoutine.map(exerciseId => new ExerciseDTO({ id: exerciseId }));
            //call justAddExercisesToRoutine with the exerciseDTOsToAdd
            try {
                await justAddExercisesToRoutine(req, res, exerciseDTOsToAdd);
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
        if (favouritesToRemove.length > 0) {
            //create an array of ExerciseDTOs from the favouritesToRemove array
            const exerciseDTOsToRemove = favouritesToRemove.map(exerciseId => new ExerciseDTO({ id: exerciseId }));
            //create a UserDTO
            const userDTO = new UserDTO({ id: req.session.user.id });
            await favouritesService.removeMultipleFavourites(userDTO, exerciseDTOsToRemove);
        }
        //reload the favourites view
        await getAndShowFavourites(req, res);
    }
}

/**
 * call DAO to get favourites, send to view.
 */
const getAndShowFavourites = async (req, res) => {
    console.log("in getAndShowFavourites in favouriteExercisesController.js");
    //get user id from session.
    const userId = req.session.user.id; // Assuming userId is stored in session
    try {
        const userDTO = new UserDTO({ id: userId });
        const favouriteExerciseDTOs = await favouritesService.getFavouritesByUserId(userDTO);
        //convert DTOs to objects for view
        const favouriteExercisesForView = exerciseDtoConverterToObjectsForView(favouriteExerciseDTOs);
        //debug the favouriteExercisesForView
        console.log("favouriteExercisesForView: ", favouriteExercisesForView);
        //send to favourites view
        res.render("favouriteExercisesView", { favouriteExercises: favouriteExercisesForView });

    } catch (error) {
        console.error(`Error retrieving favourites: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    getAndShowFavourites,
    submitFavouritesForm,
    addExerciseToFavouritesThenShowFavourites
};
