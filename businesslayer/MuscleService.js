const {ConnectionManager} = require("../dao/ConnectionManager");
const { MuscleDTO } = require("../DTO/MuscleDTO");
const { MuscleDAO } = require("../dao/MuscleDAO");

/**
 * @author Peter
 * MuscleService is a class that provides methods to interact with muscle groups.
 * It uses MuscleDAO to perform database operations related to muscle groups.
 * This class provides methods to retrieve all muscle groups and to get a muscle group by its ID
 */
class MuscleService {
    #muscleDAO;

    /**
     * Constructor for MuscleService.
     * Initializes the MuscleDAO with a ConnectionManager instance.
     */
    constructor() {
        const connectionManager = ConnectionManager.getInstance();
        this.#muscleDAO = new MuscleDAO(connectionManager);
    }

    /**
     * Retrieves all muscle groups from the database.
     * @returns {Promise<MuscleDTO[]>} A promise that resolves to an array of MuscleDTO objects.
     * 
     * @throws {Error} If the database query fails.
     */
    async getAllMuscles() {
        try {
            return await this.#muscleDAO.getAll();
        } catch (error) {
            console.error("Error in getAllMuscles:", error);
            throw error; // Propagate the error to the caller
        }
    }
    /**
     * Retrieves a muscle group by its ID.
     * @param {number} muscleId - The ID of the muscle group to retrieve.
     * @returns {Promise<MuscleDTO|null>} A promise that resolves to a MuscleDTO object or null if not found.
     * 
     * @throws {TypeError} If muscleId is not a number.
     * @throws {RangeError} If muscleId is not a positive number.
     * @throws {Error} If the database query fails.
     */
    async getMuscleById(muscleId) {
        if (typeof muscleId !== 'number') {
            throw new TypeError("Invalid argument: muscleId must be a number.");
        }
        if (muscleId <= 0) {
            throw new RangeError("Invalid argument: muscleId must be a positive number.");
        }
        try {
            return await this.#muscleDAO.getByMuscleId(muscleId);
        } catch (error) {
            console.error("Error in getMuscleById:", error);
            throw error; // Propagate the error to the caller
        }
    }
}

module.exports = { MuscleService };