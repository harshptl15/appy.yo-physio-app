const { UserDTO } = require("../DTO/UserDTO");
const { ExerciseDTO } = require("../DTO/ExerciseDTO");
// Importing ConnectionManager to manage database connections
const { ConnectionManager } = require("./ConnectionManager");

/**
 * @author Peter
 * FavouritesDAO is a class that interacts with the database to perform operations related to user favourites.
 * It uses a ConnectionManager to manage database connections.
 * This class provides methods to insert and remove favourite exercises for a user.
 * It is designed to work with UserDTO and ExerciseDTO objects.
 */
class FavouritesDAO {
    #connectionManager;

    /**
     * @param {ConnectionManager} connectionManager - An instance of ConnectionManager to manage database connections.
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
     * Inserts a new favourite exercise for a user.
     * @param {UserDTO} userDTO         - The user data transfer object.
     * @param {ExerciseDTO} exerciseDTO - The exercise data transfer object.
     * @returns {Promise<void>}
     * 
     * @throws {Error} If the database query fails.
     */
    async insertFavourite(userDTO, exerciseDTO) {
        const connection = await this.#connectionManager.getConnection();
        try {
            // Assuming DDL.sql defines: Favourites(user_id, exercise_id)
            const query = "INSERT INTO Favourites (user_id, exercise_id) VALUES (?, ?)";
            await connection.execute(query, [userDTO.id, exerciseDTO.id]);
        } catch (error) {
            console.error("Error inserting favourite:", error);
            throw error; // Propagate the error to the caller
        } finally {
            connection.release();
        }
    }

    /**
     * Removes a favourite exercise for a user.
     * @param {UserDTO} userDTO         - The user data transfer object.
     * @param {ExerciseDTO} exerciseDTO - The exercise data transfer object.
     * @returns {Promise<void>}
     * 
     * @throws {Error} If the database query fails.
     */
    async removeFavourite(userDTO, exerciseDTO) {
        const connection = await this.#connectionManager.getConnection();
        try {
            // Assuming DDL.sql defines: Favourites(user_id, exercise_id)
            const query = "DELETE FROM Favourites WHERE user_id = ? AND exercise_id = ?";
            await connection.execute(query, [userDTO.id, exerciseDTO.id]);
        } catch (error) {
            console.error("Error removing favourite:", error);
            throw error; // Propagate the error to the caller
        } finally {
            connection.release();
        }
    }

    /**
     * remove multiple favourites for a user.
     */
    async removeMultipleFavourites(userDTO, exerciseDTOs) {
        console.log("in remove multiple favourites, userDTO: ", userDTO, "exerciseDTOs: ", exerciseDTOs);
        const connection = await this.#connectionManager.getConnection();
        try {
            //convert the exerciseDTOs into an array of ids
            const exerciseIds = exerciseDTOs.map(exercise => exercise.id);
            //create placeholders for the IN clause
            const placeholders = exerciseIds.map(() => '?').join(', ');
            //create a query with placeholders for the user and array of exercise DTOs
            const query = `DELETE FROM Favourites WHERE user_id = ? AND exercise_id IN (${placeholders})`;
            //execute the query with the user id and the array of exercise ids
            await connection.execute(query, [userDTO.id, ...exerciseIds]);
        } catch (error) {
            console.error("Error removing multiple favourites:", error);
            throw error; // Propagate the error to the caller
        } finally {
            connection.release();
        }
    }

    /**
     * get all favourite exercises for a user.
     */
    async getFavouritesByUserId(userDTO) {
        const connection = await this.#connectionManager.getConnection();
        try {
            const query = `
            SELECT * FROM Exercise JOIN Favourites ON 
            Exercise.id = Favourites.Exercise_id WHERE 
            Favourites.user_id = ?
            `;
            const [rows] = await connection.execute(query, [userDTO.id]);
            if (rows.length === 0) {
                return []; // No favourites found for the user
            }
            // Map the rows to ExerciseDTO objects
            const exerciseDTOs = rows.map(row => new ExerciseDTO({
                id: row.id,
                exerciseName: row.name,
                tips: row.tips,
                commonMistakes: row.common_mistakes,
                image: row.image_link,
                video: row.video_link,
                sets: row.sets,
                reps: row.reps,
                skillLevel: row.skill_level,
                tempo: row.tempo,
                position: row.position,
                equipment: row.equipment_needed,
                goal: row.goal
            }));
            return exerciseDTOs; // Return the array of ExerciseDTO objects
        } catch (error) {
            console.error("Error retrieving favourites:", error);
            throw error; // Propagate the error to the caller
        } finally {
            connection.release();
        }
    }
}

module.exports = { FavouritesDAO };