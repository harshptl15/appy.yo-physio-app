/**
 * database config file.
 * @author Luke Johnson
 * @author Carter Belnap
 */

//import mysql2 module
const mysql = require('mysql2');

/**
 * Create a connection pool to the database.
 * Defaults match the local SQL setup in DDL.sql, but can be overridden via env vars.
 */
const pool = mysql.createPool({
<<<<<<< HEAD
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'group7',
    password: process.env.DB_PASSWORD || 'group7pwd',
    database: process.env.DB_NAME || 'physio',
    port: Number(process.env.DB_PORT || 3306)
=======
    host: 'localhost',
    user: 'root',
    password: 'Meshva2007',
    database: 'physio',
    port: 3306
>>>>>>> 1ab4fd9 (Created Your Goals Page)
});

console.log(
    `[DB] host=${process.env.DB_HOST || 'localhost'} user=${process.env.DB_USER || 'group7'} db=${process.env.DB_NAME || 'physio'} port=${process.env.DB_PORT || 3306}`
);

//export the pool to be used in other files.
module.exports = pool.promise(); 
