const { MuscleDTO } = require('../DTO/MuscleDTO'); // Assuming MuscleDTO is defined in models
// Importing the ConnectionManager class to manage database connections
const { ConnectionManager } = require('./ConnectionManager');

/**
 * @author Peter
 * MuscleDAO is a class that interacts with the database to perform operations related to muscle groups.
 * It uses a ConnectionManager to manage database connections.
 * This class provides methods to retrieve all muscle groups and to get a muscle group by its ID
 */
class MuscleDAO {
    /** @type {ConnectionManager} */
    #connectionManager;
    /**
     * @param {ConnectionManager} connectionManager
     * 
     * @throws {TypeError} If connectionManager is not an instance of ConnectionManager.
     */
    constructor(connectionManager) {
        if (!(connectionManager instanceof ConnectionManager)) {
            throw new TypeError("connectionManager must be an instance of ConnectionManager");
        }
        this.#connectionManager = connectionManager;
    }

    /**
     * Retrieves all muscle groups from the database.
     * @returns {Promise<MuscleDTO[]>} - A promise that resolves to an array of MuscleDTO objects.
     * 
     * @throws {Error} If the database query fails.
     */
    async getAll() {
        const connection = await this.#connectionManager.getConnection();
        try {
            const [rows] = await connection.query("SELECT * FROM Muscle_Group");
            // map the rows to MuscleDTO instances
            return rows.map(row => new MuscleDTO({ id: row.id, muscleName: row.name }));
        } catch (error) {
            console.error("Error retrieving muscles:", error);
            throw error; 
        } finally {
            connection.release();
        }
    }

    /**
     * Retrieves a muscle group by its unique ID.
     * @param {number} muscleId - The unique identifier of the muscle group to retrieve.
     * @returns {Promise<MuscleDTO|null>} - A promise that resolves to a MuscleDTO if found, or null if no muscle group exists with the given ID.
     *
     * @throws {Error} If the database query fails.
     */
    async getByMuscleId(muscleId) {
        const connection = await this.#connectionManager.getConnection();
        try {
            const [rows] = await connection.query("SELECT * FROM Muscle_Group WHERE id = ?", [muscleId]);
            if (rows.length === 0) {
                return null;
            }
            return new MuscleDTO({ id: rows[0].id, muscleName: rows[0].name });
        } catch (error) {
            console.error("Error retrieving muscle by ID:", error);
            throw error; 
        } finally {
            connection.release();
        }
    }
}
module.exports = { MuscleDAO };