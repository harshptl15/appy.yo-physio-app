const mysql = require('mysql2/promise');
const pool = require('../db.js');

/** 
 * @author Peter
 * ConnectionManager is a singleton class that manages database connections.
 * It provides a method to get a connection from the connection pool.
 * This class ensures that only one instance of ConnectionManager is created throughout the application.
 */
class ConnectionManager {
    static instance = null;

    /**
     * Singleton instance of ConnectionManager.
     * This ensures that only one instance of ConnectionManager is created throughout the application.
     */
    constructor() {
        this.pool = pool;
    }

    /**
     * Returns the singleton instance of ConnectionManager.
     */
    static getInstance() {
        if (!ConnectionManager.instance) {
            ConnectionManager.instance = new ConnectionManager();
        }
        return ConnectionManager.instance;
    }

    /**
     * Gets a connection from the connection pool.
     * @returns {Promise<mysql.PoolConnection>} - A promise that resolves to a database connection.
     */
    async getConnection() {
        return await this.pool.getConnection();
    }
}

module.exports = { ConnectionManager };