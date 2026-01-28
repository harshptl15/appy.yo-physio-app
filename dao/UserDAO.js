const { UserDTO } = require('../DTO/UserDTO'); // TODO: Define UserDTO
// Importing the ConnectionManager class to manage database connections
const { ConnectionManager } = require('./ConnectionManager');
/**
 * @author Peter
 * UserDAO is a class that interacts with the database to perform operations related to users.
 * It uses a ConnectionManager to manage database connections.
 * This class provides methods to retrieve users by their credentials and to create new users.
 */
class UserDAO {
    #connectionManager;

    /**
     * @param {ConnectionManager} connectionManager - An instance of ConnectionManager to manage database connections.
     * 
     * @throws {TypeError} If connectionManager is not an instance of ConnectionManager.
     */
    constructor(connectionManager) {
        if (!(connectionManager instanceof ConnectionManager)) {
            throw new TypeError('connectionManager must be an instance of ConnectionManager');
        }
        this.#connectionManager = connectionManager;
    }

    /**
     * Fetch a user by their username and hashed password.
     * @param {string} username - The username of the user.
     * @param {string} hashedPassword - The hashed password of the user.
     * @returns {Promise<UserDTO|null>} - A promise that resolves to a UserDTO object or null if not found.
     * 
     * @throws {Error} If the database query fails.
     */
    async getUserByUsernameAndHashedPassword(username, hashedPassword) {
        const connection = this.#connectionManager.getConnection();
        try {
            const query = 'SELECT * FROM User WHERE username = ? AND password = ?';
            const [resultSet] = await connection.execute(query, [username, hashedPassword]); // Use the hashed password directly
            return resultSet.length > 0 ? new UserDTO({
                id: resultSet[0].id, 
                username: resultSet[0].username, 
                email: resultSet[0].email
            }) : null;
        } catch (error) {
            console.error(`Error fetching user: ${error.message}`);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Create a new user in the database.
     * @param {string} username - The username of the new user.
     * @param {string} email - The email of the new user.
     * @param {string} hashedPassword - The hashed password of the new user.
     * @returns {Promise<void>} - A promise that resolves when the user is created.
     * 
     * @throws {Error} If the database query fails.
     */
    async createUser(username, email, hashedPassword) {
        const connection = this.#connectionManager.getConnection();
        try {
            const query = 'INSERT INTO User (username, email, password) VALUES (?, ?, ?)';
            await connection.execute(query, [username, email, hashedPassword]); // Use the hashed password directly
        } catch (error) {
            console.error(`Error creating user: ${error.message}`);
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = { UserDAO };