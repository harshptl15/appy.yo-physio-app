/**
 * database config file.
 * @author Luke Johnson
 * @author Carter Belnap
 */


// db.js
require('dotenv').config();
const mysql = require('mysql2');

// Use DATABASE_URL from Railway
const pool = mysql.createPool(process.env.DATABASE_URL);

// Export promise pool
module.exports = pool.promise();

console.log(`[DB] Connected via DATABASE_URL`);

//export the pool to be used in other files.
module.exports = pool.promise();