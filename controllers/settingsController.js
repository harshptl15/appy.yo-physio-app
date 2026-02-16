/**
 * controllers/settingsController.js
 * Renders the Settings page.
 */
const showSettingsView = (req, res) => {
    const user = req.session?.user || {};
    res.render('settingsView', { user });
};

module.exports = { showSettingsView };
 * author: Mohammad Huzaifa
 * Description: This controller handles the logic for updating the user's profile information, such as username and password. It interacts with the database to update the user's information and ensures that the user is authenticated before allowing any updates. It also includes error handling for various scenarios, such as missing fields or incorrect current password.
 */

const bcrypt = require('bcrypt');

const db=require('../db')

const USERS_TABLE= 'User';
const COL_ID = 'id';
const COL_USERNAME = 'username';
const COL_PASSWORD = 'password';

exports.updateProfile = async (req, res) => {
  try{
    const userId= req.session.user.id;
    const newUsername = req.body.newUsername;
    if(!userId){
        return res.status(401).send("Not Logged in");
    }
    if(!newUsername){
        return res.status(400).send("New username is required");
    }
    await db.execute(`UPDATE ${USERS_TABLE} SET ${COL_USERNAME} = ? WHERE ${COL_ID} = ?`, [newUsername, userId]);

    if(req.session.user) req.session.user.username = newUsername;


    req.session.user.username = newUsername;
    res.redirect("/settings");
  }catch(err){
    if(err.code === 'ER_DUP_ENTRY'){
        return res.status(400).send("Username already taken");
    }
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.updatePassword = async (req, res) => {
  try{
    const userId = req.session.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if(!userId){
        return res.status(401).send("Not Logged in");
    }
    if(!currentPassword || !newPassword || !confirmPassword){
        return res.status(400).send("All password fields are required");
    }   
    if(newPassword !== confirmPassword){
        return res.status(400).send("Passwords don't match");

    }
    if(newPassword.length < 6){
        return res.status(400).send("New password must be at least 6 characters");
    }
    const [rows] = await db.execute(`SELECT ${COL_PASSWORD} AS passwordHash FROM ${USERS_TABLE} WHERE ${COL_ID} = ?`, [userId]);
    if(!rows||rows.length === 0){
        return res.status(404).send("User not found");
    }
    const storeHash=rows[0].passwordHash;
    const ok=await bcrypt.compare(currentPassword, storeHash);
    if(!ok){
        return res.status(400).send("Current password is incorrect");
    }

    const newHash=await bcrypt.hash(newPassword, 12);
    await db.execute(`UPDATE ${USERS_TABLE} SET ${COL_PASSWORD} = ? WHERE ${COL_ID} = ?`, [newHash, userId]);


    return res.redirect("/settings");
  }catch(err){
    console.error(err);
    res.status(500).send("Password couldn't be updated");
  }

};
