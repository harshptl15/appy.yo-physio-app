const { ExerciseDTO } = require("../DTO/ExerciseDTO");
const { MuscleDTO } = require("../DTO/MuscleDTO");
const { UserDTO } = require("../DTO/UserDTO") // TODO: Create UserDTO class
// Importing the ConnectionManager class to manage database connections
const { ConnectionManager } = require("./ConnectionManager");

/**
 * @author Peter
 * @author Luke Johnson
 * ExerciseDAO is a class that interacts with the database to perform operations related to exercises.
 * It uses a ConnectionManager to manage database connections.
 * This class provides methods to retrieve all exercises, get an exercise by name,
 * and get exercises based on category, location, and muscle groups.
 */

class ExerciseDAO {
    /** @type {ConnectionManager} */
    #connectionManager;
    /**
     * @param {ConnectionManager} connectionManager
     */
    constructor(connectionManager) {
        if (!(connectionManager instanceof ConnectionManager)) {
            throw new TypeError("connectionManager must be an instance of ConnectionManager");
        }
        this.#connectionManager = connectionManager;
    }
    /**
    * Maps the rows from the database to ExerciseDTO objects.
    * This is a private method used internally to convert database rows to ExerciseDTO instances.
    * @param {Array} rows - The rows retrieved from the database.
    * @returns {ExerciseDTO[]} - An array of ExerciseDTO objects.
    */
    // TODO: Add missing fields into the ExerciseDTO class from DDL.sql
    #mapRowsToExerciseDTO(rows) {
        return rows.map(row => new ExerciseDTO({
            id:             row.id,
            exerciseName:   row.name,
            tips:           row.tips,
            commonMistakes: row.common_mistakes,
            image:          row.image_link,
            video:          row.video_link,
            sets:           row.sets,
            reps:           row.reps,
            holdTimeSec:    row.hold_time_sec, // MISSING in ExerciseDTO
            restTimeSec:    row.rest_time_sec, // MISSING in ExerciseDTO
            skillLevel:     row.skill_level,
            tempo:          row.tempo,
            position:       row.position,
            equipment:      row.equipment_needed,
            goal:          row.goal
        }));
    }

    /**
     * Retrieves all exercises from the database.
     * @returns {Promise<ExerciseDTO[]>}
     * 
     * @throws {Error} If the database query fails.
     */
    async getAll() {
        const connection = await this.#connectionManager.getConnection();
        try {
            const [resultSet] = await connection.query("SELECT * FROM Exercise");
            // TODO: Add missing fields into the ExerciseDTO class from DDL.sql
            return this.#mapRowsToExerciseDTO(resultSet); // Map the result set to ExerciseDTO objects
        } catch (error) {
            console.error("Error retrieving exercises:", error);
            throw error; // Propagate the error to the caller
        } finally {
            connection.release();
        }
    }

    /**
     * Retrieves a single exercise by its unique ID.
     *
     * @param {number} id                   - The unique identifier of the exercise to retrieve.
     * @returns {Promise<ExerciseDTO|null>} - A promise that resolves to an ExerciseDTO if found, or null if no exercise exists with the given ID.
     *
     * @throws {Error} If the database query fails.
     */
    async getExerciseById(id) {
        const connection = await this.#connectionManager.getConnection();
        try {
            const [rows] = await connection.query("SELECT * FROM Exercise WHERE id = ?", [id]);
            if (rows.length === 0) {
                return null; // No exercise found with the given name
            }
            return new ExerciseDTO({ exerciseName: rows[0].name});
        } catch (error) {
            console.error("Error retrieving exercise by name:", error);
            throw error; // Propagate the error to the caller
        } finally {
            connection.release();
        }
    }
    
    /**
     * Retrieves exercises based on complex search criteria.
     * @param {boolean} isGym          - Whether to filter exercises for home use only.
     * @param {string} category             - The category of the exercises to retrieve.
     * @param {MuscleDTO[]} muscleDTO       - An array of MuscleDTO objects representing the muscle groups to filter by.
     * @returns {Promise<ExerciseDTO[]>}    - A promise that resolves to an array of ExerciseDTO objects matching the criteria.
     *
     * @throws {Error} If the database query fails.
     */
    async getExerciseComplexSearch(isGym, category, muscleDTOArray) {
        const connection = await this.#connectionManager.getConnection();
        // const muscleIDs = muscleDTOArray.map( m => m.id);               // Create a list of muscle IDs from the muscleDTO array
        // const musclePlaceholders = muscleIDs.map(() => '?').join(', '); // This is to ensure that the number of placeholders matches the number of muscle IDs
        //these are the muscles that the query will search for becasuse they do not have avoid in the category.
        const muscleNames = muscleDTOArray
        .filter(m => m.category != "avoid")
        .map(m => m.muscleName); 
        const musclePlaceholders = muscleNames.map(() => '?').join(', '); // This is to ensure that the number of placeholders matches the number of muscle names
            //debug
            // console.log("muscleNames: ", muscleNames);
        //muscle names that from the muscleDTOArray that have avoid in the category.
        const avoidMuscleNames = muscleDTOArray
        .filter(m =>m.category == "avoid")
        .map(m => m.muscleName);
        const avoidMusclePlaceholders = avoidMuscleNames.map(() => '?').join(', '); // This is to ensure that the number of placeholders matches the number of muscle names
        //debug
        console.log("avoidMuscleNames: ", avoidMuscleNames);
        try{
            let query = `
                SELECT DISTINCT e.id, e.name, e.tips, e.common_mistakes, e.image_link, e.video_link, 
                       e.sets, e.reps, e.hold_time_sec, e.rest_time_sec, e.skill_level, 
                       e.tempo, e.position, e.equipment_needed, e.is_gym_only
                FROM Exercise e
                JOIN Exercise_Muscle_Group emg ON e.id = emg.exercise_id
                JOIN Muscle_Group m ON emg.muscle_group_id = m.id
                WHERE e.category = ? AND m.name IN (${musclePlaceholders})
            `;

            // Only add the NOT IN clause if there are muscles to avoid
            if (avoidMuscleNames.length > 0) {
                query += ` AND e.id NOT IN (
                    SELECT DISTINCT e2.id 
                    FROM Exercise e2
                    JOIN Exercise_Muscle_Group emg2 ON e2.id = emg2.exercise_id
                    JOIN Muscle_Group m2 ON emg2.muscle_group_id = m2.id
                    WHERE m2.name IN (${avoidMusclePlaceholders})
                )`;
            }

            // This is to make sure that if the user is searching for home exercises, we only return exercises that are not gym-only.
            // The reason for this is if the user is at home, they cannot do gym-only exercises, unless the have the equipment for it,
            // which is not a common case. 
            // 
            // A future group can add this feature if they want to.
            if (isGym) {
                query += " AND e.is_gym_only = 1"; // change 0 to false if query does not work
            }

            // Prepare parameters: category, muscle names, and avoid muscle names (if any)
            const queryParams = [category, ...muscleNames];
            if (avoidMuscleNames.length > 0) {
                queryParams.push(...avoidMuscleNames);
            }
            
            const [resultSet] = await connection.query(query, queryParams);
            return this.#mapRowsToExerciseDTO(resultSet); // Map the result set to ExerciseDTO objects
        } catch (error) {
            console.error("Error retrieving exercises with complex search:", error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Retrieves exercises from routine entries for a specific user.
     * @param {UserDTO} userDTO             - The user data transfer object containing user information.
     * @returns {Promise<ExerciseDTO[]>}    - A promise that resolves to an array of ExerciseDTO objects.
     * 
     * @throws {Error} If the database query fails.
     */
    //TODO: Create UserDTO class
    async getExercisesFromRoutineEntriesByUser(userDTO) {
        const connection = await this.#connectionManager.getConnection();
        try {
            const query = `
                SELECT e.id, e.name, e.tips, e.common_mistakes, e.image_link, e.video_link, 
                       e.sets, e.reps, e.hold_time_sec, e.rest_time_sec, e.skill_level, 
                       e.tempo, e.position, e.equipment_needed, e.category, e.is_gym_only,
                       re.goal
                FROM Exercise e
                JOIN Routine_Entry re ON e.id = re.exercise_id
                WHERE re.user_id = ?
            `;
            const [resultSet] = await connection.query(query, [userDTO.id]);
            // console.log("resultSet: ", resultSet);
            const exerciseDTOsToReturn = this.#mapRowsToExerciseDTO(resultSet); // Map the result set to ExerciseDTO objects
            // console.log("exerciseDTOsToReturn: ", exerciseDTOsToReturn);
            return exerciseDTOsToReturn;
        } catch (error) {
            console.error("Error retrieving exercises by user ID:", error);
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = { ExerciseDAO };