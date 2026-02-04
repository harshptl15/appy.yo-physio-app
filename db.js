/**
 * database config file.
 * @author Luke Johnson
 * @author Carter Belnap
 */

//import mysql2 module
const mysql = require('mysql2');

/**
 * create a connection pool to the database, use AWS RDS instance.
 */
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'physio',
    port: 3306
});

//export the pool to be used in other files.
module.exports = pool.promise(); 
