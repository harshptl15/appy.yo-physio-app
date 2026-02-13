const { MuscleDTO } = require('../DTO/MuscleDTO');
const { WhereDTO } = require('../DTO/WhereDTO');
const { ConnectionManager } = require('../dao/ConnectionManager');
const { ExerciseDAO } = require('../dao/ExerciseDAO');
const { UserDTO } = require('../DTO/UserDTO'); // TODO: Create UserDTO class

/**
 * @author Peter
 * ExerciseService is a class that provides methods to interact with exercises.
 * It uses ExerciseDAO to perform database operations related to exercises.
 * This class provides methods to retrieve all exercises, get an exercise by ID,
 * and get exercises based on category, location (whether gym or home), and an array of muscle group DTOs.
 */
class ExerciseService {
    #exerciseDAO;

    constructor() {
        const connectionManager = ConnectionManager.getInstance();
        this.#exerciseDAO = new ExerciseDAO(connectionManager);
    }

    /**
     * Retrieves all exercises from the database.
     * @returns {Promise<ExerciseDTO[]>} A promise that resolves to an array of ExerciseDTO objects.
     * 
     * @throws {Error} If the database query fails.
     */
    async getAllExercises() {
        try {
            return await this.#exerciseDAO.getAll();
        } catch (error) {
            console.error("Error in getAllExercises:", error);
            throw error; // Propagate the error to the caller
        }
    }

    /**
     * Retrieves a single exercise by its unique ID.
     * @param {number} id - The unique identifier of the exercise to retrieve.
     * @returns {Promise<ExerciseDTO|null>} - A promise that resolves to an ExerciseDTO if found, or null if no exercise exists with the given ID.
     * 
     * @throws {TypeError} If id is not a number.
     * @throws {RangeError} If id is not a positive number.
     * @throws {Error} If the database query fails.
     */
    async getExerciseById(id){
        if(typeof id !== 'number'){
            throw new TypeError("Invalid argument: id must be a number.");
        }
        if(id <= 0){
            throw new RangeError("Invalid argument: id must be a positive number.");
        }
        try {
            return await this.#exerciseDAO.getExerciseById(id);
        } catch (error) {
            console.error("Error in getExerciseById:", error);
            throw error;
        }
    }

    /**
     * Retrieves exercises based on complex search criteria.
     * @param {WhereDTO} whereDTO - The where data transfer object containing location information.
     * @param {string} category - The category of the exercises to retrieve.
     * @param {MuscleDTO[]} muscleDTOArray - An array of MuscleDTO objects representing the muscle groups to filter by.
     * @returns {Promise<ExerciseDTO[]>} - A promise that resolves to an array of ExerciseDTO objects matching the criteria.
     *
     * @throws {TypeError} If whereDTO is not an instance of WhereDTO, 
     * or if muscleDTOArray is not an array of MuscleDTO instances, or if category is not a non-empty string.
     * @throws {Error} If the database query fails.
     */
    async getExerciseComplexSearch(whereDTO, category, muscleDTOArray) {
        if(!(whereDTO instanceof WhereDTO)) {
            throw new TypeError("Invalid argument: whereDTO must be an instance of WhereDTO.");
        }
        if(!Array.isArray(muscleDTOArray) || !muscleDTOArray.every(muscle => muscle instanceof MuscleDTO)) {
            throw new TypeError("Invalid argument: muscleDTOArray must be an array of MuscleDTO instances.");
        }
        if (typeof category !== 'string' || category.trim() === '') {
            throw new TypeError("Invalid argument: category must be a non-empty string.");
        }
        try {
            const isGym = whereDTO.location === 'gym';
return await this.#exerciseDAO.getExerciseComplexSearch(isGym, category, muscleDTOArray);

        } catch (error) {
            console.error("Error in getExerciseComplexSearch:", error);
            throw error;
        }
    }

    /**
     * Retrieves exercises from routine entries for a specific user.
     * @param {UserDTO} userDTO - The user data transfer object containing user information.
     * @returns {Promise<ExerciseDTO[]>} - A promise that resolves to an array of ExerciseDTO objects.
     *
     * @throws {TypeError} If userDTO is not an instance of UserDTO.
     * @throws {Error} If the database query fails.
     */
    async getExercisesFromRoutineByUserId(userDTO) {
        if (!(userDTO instanceof UserDTO)) {
            throw new TypeError("Invalid argument: userDTO must be an instance of UserDTO.");
        }
        try {
            return await this.#exerciseDAO.getExercisesFromRoutineEntriesByUser(userDTO);
        } catch (error) {
            console.error("Error in getExercisesFromRoutineByUserId:", error);
            throw error; // Propagate the error to the caller
        }
    }
}

module.exports = { ExerciseService };