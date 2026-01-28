const { UserDTO } = require("../DTO/UserDTO");
const { ExerciseDTO } = require("../DTO/ExerciseDTO");
// Importing ConnectionManager to manage database connections
const { ConnectionManager } = require("./ConnectionManager");
//import routine DTO
const { RoutineDTO } = require("../DTO/RoutineDTO");

/**
 * @author Peter
 * @author Luke Johnson
 * RoutineDAO is a class that provides methods to interact with routines in the database.
 * It uses a ConnectionManager to manage database connections.
 * This class provides methods to insert a new routine, remove a routine by its unique ID,
 * and remove a routine based on the user and exercise DTOs.
 * It is designed to work with UserDTO and ExerciseDTO objects.
 */
class RoutineDAO {
    #connectionManager;

    /**
     * @param {ConnectionManager} connectionManager - The connection manager instance to manage database connections
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
     * Inserts a new routine into the database.
     * @param {UserDTO} userDTO - The user DTO containing the user's ID.
     * @param {ExerciseDTO} exerciseDTO - The exercise DTO containing the exercise's ID.
     * @returns {Promise<void>}
     * 
     * @throws {Error} If the database query fails.
     */
    async insertRoutine(userDTO, exerciseDTO) {
        const connection = await this.#connectionManager.getConnection();
        try {
            // Adjust column names to match ../DDL.sql
            const query = "INSERT INTO Routine_Entry (user_id, exercise_id) VALUES (?, ?)";
            await connection.query(query, [userDTO.id, exerciseDTO.id]);
        } catch (error) {
            console.error("Error inserting routine:", error);
            throw error; // Propagate the error to the caller
        } finally {
            connection.release();
        }
    }
    /**
     * insert multiple routines into the database.
     * 
     */
    async insertMultipleRoutines(routineDTOs) {
        const connection = await this.#connectionManager.getConnection();
        try {
            //crate the query with placeholders for each routine
            const query = "INSERT INTO Routine_Entry (user_id, exercise_id) VALUES ?";
            //convert the routineDTOs into an array of values
            const values = routineDTOs.map(routine => [routine.userId, routine.exerciseId]);
            //execute the query with the values
            await connection.query(query, [values]);
        } catch (error) {
            console.error("Error inserting multiple routines:", error);
            throw error; // Propagate the error to the caller
        } finally {
            connection.release();
        }
    }

    /**
     * Removes a routine based on the user and exercise DTOs.
     * @param {UserDTO} userDTO - The user DTO containing the user's ID.
     * @param {ExerciseDTO} exerciseDTO - The exercise DTO containing the exercise's ID.
     * @returns {Promise<void>}
     * 
     * @throws {Error} If the database query fails.
     */
    async removeRoutineBySecondaryFields(routineDTO) {
        const connection = await this.#connectionManager.getConnection();
        try {
            // Adjust column names to match ../DDL.sql
            const query = "DELETE FROM Routine_Entry WHERE user_id = ? AND exercise_id = ?";
            await connection.query(query, [routineDTO.userId, routineDTO.exerciseId]);
        } catch (error) {
            console.error("Error removing routine:", error);
            throw error; // Propagate the error to the caller
        } finally {
            connection.release();
        }
    }

    /**
     * Removes a routine by its unique ID.
     * @param {number} routineId - The unique identifier of the routine to remove.
     * @returns {Promise<void>}
     * 
     * @throws {Error} If the database query fails.
     */
    async removeRoutineById(routineId) {
        const connection = await this.#connectionManager.getConnection();
        try {
            // Adjust column name to match ../DDL.sql
            const query = "DELETE FROM Routine_Entry WHERE id = ?";
            await connection.query(query, [routineId]);
        } catch (error) {
            console.error("Error removing routine by ID:", error);
            throw error; // Propagate the error to the caller
        } finally {
            connection.release();
        }
    }

    /**
     * update the routine to mark it as finished.
     */
    async markRoutineAsFinished(routineDTO) {
        console.log("in RoutineDAO.markRoutineAsFinished");
        const connection = await this.#connectionManager.getConnection();
        try {
        const query = "UPDATE Routine_Entry SET Goal = TRUE WHERE User_id = ? AND Exercise_id = ?";
        const values = [routineDTO.userId, routineDTO.exerciseId];
            //execute the query with the values
            await connection.query(query, values);
        } catch (error) {
            console.error("Error marking routine as finished:", error);
            throw error; // Propagate the error to the caller
        } finally {
            connection.release();
        }

    }

    /**
     * restart a routine for a user, marking all goals as false.
     */
    async restartEntireRoutine(userDTO) {
        const connection = await this.#connectionManager.getConnection();
        const query = "UPDATE Routine_Entry SET Goal = FALSE WHERE User_id = ?";
        try {
            //execute the query with the values
            await connection.query(query, [userDTO.id]);
        } catch (error) {
            console.error("Error restarting routine:", error);
            throw error; // Propagate the error to the caller
        } finally {
            connection.release();
        }
    }
}

module.exports = { RoutineDAO };