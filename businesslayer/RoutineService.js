const { RoutineDAO } = require("../dao/RoutineDAO");
const { ConnectionManager } = require("../dao/ConnectionManager");
const { RoutineDTO } = require("../DTO/RoutineDTO"); // TODO: Define RoutineDTO
const { UserDTO } = require("../DTO/UserDTO");
const { ExerciseDTO } = require("../DTO/ExerciseDTO");

/**
 * @author Peter
 * @author Luke Johnson
 * RoutineService is a class that provides methods to manage user routines.
 * It uses RoutineDAO to perform database operations related to user routines.
 * This class provides methods to insert, remove, and retrieve routines for a user.
 */
class RoutineService {
    #routineDAO;

    /**
     * Constructor for RoutineService.
     * Initializes the RoutineDAO with a ConnectionManager instance.
     */
    constructor() {
        const connectionManager = ConnectionManager.getInstance();
        this.#routineDAO = new RoutineDAO(connectionManager);
    }

    /**
     * Inserts a new routine into the database.
     * @param {UserDTO} userDTO         - The user data transfer object.
     * @param {ExerciseDTO} exerciseDTO - The exercise data transfer object.
     * 
     * @throws {TypeError} If userDTO is not an instance of UserDTO or exerciseDTO is not an instance of ExerciseDTO.
     * @throws {Error} If the database query fails.
     */
    async insertRoutine(userDTO, exerciseDTO) {
        if (!(userDTO instanceof UserDTO)) {
            throw new TypeError("userDTO must be an instance of UserDTO");
        }
        if (!(exerciseDTO instanceof ExerciseDTO)) {
            throw new TypeError("exerciseDTO must be an instance of ExerciseDTO");
        }
        try {
            await this.#routineDAO.insertRoutine(userDTO, exerciseDTO);
        } catch (error) {
            console.error(`Error inserting routine: ${error.message}`);
            throw error;
        }
    }

    /**
     * insert multiple routines into the database.
     * 
     */
    async insertMultipleRoutines(routineDTOs) {
        if (!Array.isArray(routineDTOs) || routineDTOs.length === 0) {
            throw new TypeError("routineDTOs must be a non-empty array of RoutineDTO objects");
        }
        //check if all items in the array are instances of RoutineDTO
        if (!routineDTOs.every(dto => dto instanceof RoutineDTO)) {
            throw new TypeError("All items in routineDTOs must be instances of RoutineDTO");
        }
        try {
            await this.#routineDAO.insertMultipleRoutines(routineDTOs);
        } catch (error) {
            console.error(`Error inserting multiple routines: ${error.message}`);
            throw error;
        }
    }

    /**
     * Removes a routine from the database based on user and exercise information.
     * @param {UserDTO} userDTO         - The user data transfer object.
     * @param {ExerciseDTO} exerciseDTO - The exercise data transfer object.
     * 
     * @throws {TypeError} If userDTO is not an instance of UserDTO or exerciseDTO is not an instance of ExerciseDTO.
     * @throws {Error} If the database query fails.
     */
    async removeRoutineBySecondaryFields(routineDTO) {
        if (!(routineDTO instanceof RoutineDTO)) {
            throw new TypeError("routineDTO must be an instance of RoutineDTO");
        }
        try {
            await this.#routineDAO.removeRoutineBySecondaryFields(routineDTO);
        } catch (error) {
            console.error(`Error removing routine: ${error.message}`);
            throw error;
        }
    }

    /**
     * Removes a routine from the database by its ID.
     * @param {number} routineId - The ID of the routine to remove.
     * 
     * @throws {TypeError} If routineId is not a number.
     * @throws {RangeError} If routineId is not a positive number.
     * @throws {Error} If the database query fails.
     */
    async removeRoutineById(routineId) {
        if (typeof routineId !== 'number') {
            throw new TypeError('Invalid argument: routineId must be a number.');
        }
        if (routineId <= 0) {
            throw new RangeError('Invalid argument: routineId must be a positive number.');
        }
        try {
            await this.#routineDAO.removeRoutineById(routineId);
        } catch (error) {
            console.error(`Error removing routine by ID: ${error.message}`);
            throw error;
        }
    }

    /**
     * mark a routine as finished. Note this refers to the exercise in a routine, and marks it's goal as true.
     */
    async markRoutineAsFinished(routineDTO) {
        if (!(routineDTO instanceof RoutineDTO)) {
            throw new TypeError("routineDTO must be an instance of RoutineDTO");
        }
        try {
            await this.#routineDAO.markRoutineAsFinished(routineDTO);
        } catch (error) {
            console.error(`Error marking routine as finished: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * restart a routine, setting all goals to false.
     */
    async restartEntireRoutine(userDTO) {
        if (!(userDTO instanceof UserDTO)) {
            throw new TypeError("userDTO must be an instance of UserDTO");
        }

        try {
            await this.#routineDAO.restartEntireRoutine(userDTO);
        } catch (error) {
            console.error(`Error restarting routine: ${error.message}`);
            throw error;
        }
    }

    // A future group may want to implment logic to switch around the order of exercises in the user's routine.
    // This could either be done by adding an index field, or creating updates to shift the order of the exercises within a routine.
    // For now, the focus is on basic CRUD operations.
}

module.exports = { RoutineService };