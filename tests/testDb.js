/**
 * test the database is connecting by printing all rows.
 */

//import the db config script.
const db = require('../db');

//print all rows.
(async () => {
  try {
    const [rows] = await db.query('SELECT * FROM `User`');
    console.log('✅ DB Connected! Result:', rows);//show all users.
  } catch (err) {
    console.error('❌ DB connection failed:', err);
  }
})();