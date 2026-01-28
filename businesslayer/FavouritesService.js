const { FavouritesDAO } = require('../dao/FavouritesDAO');
const { ConnectionManager } = require('../dao/ConnectionManager');
const { UserDTO } = require('../DTO/UserDTO');
const { ExerciseDTO } = require('../DTO/ExerciseDTO');

/**
 * @author Peter
 * FavouritesService is a class that provides methods to manage user favourites.
 * It uses FavouritesDAO to perform database operations related to user favourites.
 * This class provides methods to insert and remove favourite exercises for a user.
 * It is designed to work with UserDTO and ExerciseDTO objects.
 */
class FavouritesService {
    #favouritesDAO;

    /**
     * Creates an instance of FavouritesService.
     * Initializes the FavouritesDAO with a ConnectionManager instance.
     */
    constructor() {
        const connectionManager = ConnectionManager.getInstance();
        this.#favouritesDAO = new FavouritesDAO(connectionManager);
    }

    /**
     * Inserts a new favourite exercise for a user.
     * @param {UserDTO} userDTO         - The user data transfer object.
     * @param {ExerciseDTO} exerciseDTO - The exercise data transfer object.
     * 
     * @throws {TypeError} If userDTO is not an instance of UserDTO or exerciseDTO is not an instance of ExerciseDTO.
     * @throws {Error} If the database query fails.
     */
    async insertFavourite(userDTO, exerciseDTO) {
        if (!(userDTO instanceof UserDTO)) {
            throw new TypeError("userDTO must be an instance of UserDTO");
        }
        if (!(exerciseDTO instanceof ExerciseDTO)) {
            throw new TypeError("exerciseDTO must be an instance of ExerciseDTO");
        }
        try {
            await this.#favouritesDAO.insertFavourite(userDTO, exerciseDTO);
        } catch (error) {
            console.error(`Error inserting favourite: ${error.message}`);
            throw error;
        }
    }

    /**
     * Removes a favourite exercise for a user.
     * @param {UserDTO} userDTO - The user data transfer object.
     * @param {ExerciseDTO} exerciseDTO - The exercise data transfer object.
     * 
     * @throws {TypeError} If userDTO is not an instance of UserDTO or exerciseDTO is not an instance of ExerciseDTO.
     * @throws {Error} If the database query fails.
     */
    async removeFavourite(userDTO, exerciseDTO) {
        if (!(userDTO instanceof UserDTO)) {
            throw new TypeError("userDTO must be an instance of UserDTO");
        }
        if (!(exerciseDTO instanceof ExerciseDTO)) {
            throw new TypeError("exerciseDTO must be an instance of ExerciseDTO");
        }
        try {
            await this.#favouritesDAO.removeFavourite(userDTO, exerciseDTO);
        } catch (error) {
            console.error(`Error removing favourite: ${error.message}`);
            throw error;
        }
    }

    /**
     * get favourite exercises for a user.
     */
    async getFavouritesByUserId(userDTO) {
        if (!(userDTO instanceof UserDTO)) {
            throw new TypeError("userDTO must be an instance of UserDTO");
        }

        try {
            return await this.#favouritesDAO.getFavouritesByUserId(userDTO);
        } catch (error) {
            console.error(`Error retrieving favourites: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Removes multiple favourites for a user.
     */
    async removeMultipleFavourites(userDTO, exerciseDTOs) {
        if (!(userDTO instanceof UserDTO)) {
            throw new TypeError("userDTO must be an instance of UserDTO");
        }
        if (!Array.isArray(exerciseDTOs) || !exerciseDTOs.every(dto => dto instanceof ExerciseDTO)) {
            throw new TypeError("exerciseDTOs must be an array of ExerciseDTO instances");
        }
        try {
            await this.#favouritesDAO.removeMultipleFavourites(userDTO, exerciseDTOs);
        } catch (error) {
            console.error(`Error removing multiple favourites: ${error.message}`);
            throw error;
        }
    }

    // A future group might want to implement logic to retrieve all users who have a specific exercise in their favourites.
    // This is only if they intend on creating a front end for administrators to view popular exercises.
}

module.exports = { FavouritesService };