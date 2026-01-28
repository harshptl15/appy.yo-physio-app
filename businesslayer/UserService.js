const { ConnectionManager } = require("../dao/ConnectionManager");
const crypto = require('crypto');
const { UserDTO } = require("../dto/UserDTO");
const UserDAO = require("../dao/UserDAO");

/**
 * @author Peter
 * UserService is a class that provides methods to interact with user accounts.
 * It uses UserDAO to perform database operations related to user accounts.
 * This class provides methods to log in a user and to create a new user.
 */
class UserService{
    #userDAO;

    /**
     * Constructor for UserService.
     * Initializes the UserDAO with a ConnectionManager instance.
     */
    constructor(){
        const connectionManager = ConnectionManager.getInstance();
        this.#userDAO = new UserDAO(connectionManager);
    }

    /**
     * Log in a user.
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {Promise<UserDTO|null>} - A promise that resolves to a UserDTO object or null if login fails.
     * 
     * @throws {TypeError} If username or password is not a string.
     * @throws {Error} If the database query fails.
     */
    async login (username, password) {
        if(typeof username !== 'string' || typeof password !== 'string' || username.trim() === '' || password.trim() === '') {
            throw new TypeError("Both fields must be non-empty strings.");
        }
        // Hash the password using crypto
        const hashedPasswordToCompare = crypto.createHash('sha256').update(password).digest('hex');
        try {
            return this.#userDAO.getUserByUsernameAndHashedPassword(username, hashedPasswordToCompare);
        } catch (error) {
            console.error(`Login error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create a new user in the system.
     * @param {string} username - The username of the new user.
     * @param {string} email - The email of the new user.
     * @param {string} password - The password of the new user.
     * 
     * @throws {TypeError} If username, email, or password is not a string.
     * @throws {Error} If the database query fails.
     */
    async createUser(username, email, password) {
        if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
            throw new TypeError("Username, email, and password must all be strings.");
        }
        // Hash the password using crypto
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        try {
            await this.#userDAO.createUser(username, email, hashedPassword);
        } catch (error) {
            console.error(`Create user error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = { UserService };