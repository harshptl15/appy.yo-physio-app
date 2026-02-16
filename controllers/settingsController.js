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
const settingsRedirect = (type, message) =>
  `/settings?${new URLSearchParams({ type, message }).toString()}`;

const PROFILE_ENUMS = {
    gender: ['male', 'female', 'non_binary', 'prefer_not_to_say', 'other'],
    heightUnit: ['cm', 'ft_in'],
    weightUnit: ['kg', 'lbs'],
    injuryFocus: ['none', 'knee', 'shoulder', 'back', 'neck', 'ankle', 'hip', 'elbow', 'wrist', 'other'],
    conditionFocus: [
        'general_fitness',
        'strength_building',
        'muscle_gain',
        'fat_loss',
        'rehab',
        'mobility',
        'endurance',
        'post_surgery_recovery',
        'athletic_performance'
    ],
    rehabLevel: ['beginner', 'intermediate', 'advanced']
};

const isInEnum = (value, allowed) => allowed.includes(value);
const toInt = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

exports.updateProfile = async (req, res) => {
  try{
    const userId= req.session.user.id;
    if(!userId){
        return res.redirect(settingsRedirect('error', 'Not logged in.'));
    }

    const nextUsername = (req.body.newUsername || req.session.user.username || '').trim();
    if(!nextUsername){
        return res.redirect(settingsRedirect('error', 'Username is required.'));
    }

    const gender = (req.body.gender || '').trim();
    const ageRaw = (req.body.age || '').trim();
    const heightUnit = (req.body.heightUnit || '').trim();
    const weightUnit = (req.body.weightUnit || '').trim();
    const injuryFocus = (req.body.injuryFocus || '').trim();
    const injuryOther = (req.body.injuryOther || '').trim();
    const conditionFocus = (req.body.conditionFocus || '').trim();
    const rehabLevel = (req.body.rehabLevel || '').trim();

    if (!isInEnum(gender, PROFILE_ENUMS.gender)) {
        return res.redirect(settingsRedirect('error', 'Please select a valid gender.'));
    }
    if (!isInEnum(heightUnit, PROFILE_ENUMS.heightUnit)) {
        return res.redirect(settingsRedirect('error', 'Please select a valid height unit.'));
    }
    if (!isInEnum(weightUnit, PROFILE_ENUMS.weightUnit)) {
        return res.redirect(settingsRedirect('error', 'Please select a valid weight unit.'));
    }
    if (!isInEnum(injuryFocus, PROFILE_ENUMS.injuryFocus)) {
        return res.redirect(settingsRedirect('error', 'Please select a valid injury focus.'));
    }
    if (!isInEnum(conditionFocus, PROFILE_ENUMS.conditionFocus)) {
        return res.redirect(settingsRedirect('error', 'Please select a valid condition focus.'));
    }
    if (!isInEnum(rehabLevel, PROFILE_ENUMS.rehabLevel)) {
        return res.redirect(settingsRedirect('error', 'Please select a valid rehab level.'));
    }

    let age = null;
    if (ageRaw !== '') {
        age = toInt(ageRaw);
        if (age === null || age < 10 || age > 120) {
            return res.redirect(settingsRedirect('error', 'Age must be between 10 and 120.'));
        }
    }

    let heightCm = null;
    let heightFt = null;
    let heightIn = null;

    if (heightUnit === 'cm') {
        heightCm = toInt(req.body.heightCm);
        if (heightCm === null || heightCm < 140 || heightCm > 220) {
            return res.redirect(settingsRedirect('error', 'Height must be between 140 cm and 220 cm.'));
        }
    } else {
        heightFt = toInt(req.body.heightFeet);
        heightIn = toInt(req.body.heightInches);
        if (heightFt === null || heightFt < 4 || heightFt > 7) {
            return res.redirect(settingsRedirect('error', 'Height feet must be between 4 and 7.'));
        }
        if (heightIn === null || heightIn < 0 || heightIn > 11) {
            return res.redirect(settingsRedirect('error', 'Height inches must be between 0 and 11.'));
        }
    }

    const weightValue = toInt(req.body.weightValue);
    if (weightValue === null) {
        return res.redirect(settingsRedirect('error', 'Please select a valid weight.'));
    }
    if (weightUnit === 'kg' && (weightValue < 40 || weightValue > 180)) {
        return res.redirect(settingsRedirect('error', 'Weight must be between 40 kg and 180 kg.'));
    }
    if (weightUnit === 'lbs' && (weightValue < 90 || weightValue > 400)) {
        return res.redirect(settingsRedirect('error', 'Weight must be between 90 lbs and 400 lbs.'));
    }

    let injuryOtherValue = null;
    if (injuryFocus === 'other') {
        injuryOtherValue = injuryOther || null;
        if (injuryOtherValue && injuryOtherValue.length > 120) {
            return res.redirect(settingsRedirect('error', 'Other injury text must be 120 characters or fewer.'));
        }
    }

    await db.execute(
        `UPDATE \`${USERS_TABLE}\`
         SET ${COL_USERNAME} = ?,
             gender = ?,
             age = ?,
             height_unit = ?,
             height_cm = ?,
             height_ft = ?,
             height_in = ?,
             weight_unit = ?,
             weight_value = ?,
             injury_focus = ?,
             injury_focus_other = ?,
             condition_focus = ?,
             rehab_level = ?
         WHERE ${COL_ID} = ?`,
        [
            nextUsername,
            gender,
            age,
            heightUnit,
            heightCm,
            heightFt,
            heightIn,
            weightUnit,
            weightValue,
            injuryFocus,
            injuryOtherValue,
            conditionFocus,
            rehabLevel,
            userId
        ]
    );

    if(req.session.user) req.session.user.username = nextUsername;

    res.redirect(settingsRedirect('success', 'Profile and settings updated successfully.'));
  }catch(err){
    if(err.code === 'ER_DUP_ENTRY'){
        return res.redirect(settingsRedirect('error', 'Username already taken.'));
    }
    console.error(err);
    res.redirect(settingsRedirect('error', 'Could not update username right now.'));
  }
};

exports.updatePassword = async (req, res) => {
  try{
    const userId = req.session.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if(!userId){
        return res.redirect(settingsRedirect('error', 'Not logged in.'));
    }
    if(!currentPassword || !newPassword || !confirmPassword){
        return res.redirect(settingsRedirect('error', 'All password fields are required.'));
    }   
    if(newPassword !== confirmPassword){
        return res.redirect(settingsRedirect('error', "Passwords don't match."));

    }
    if(newPassword.length < 6){
        return res.redirect(settingsRedirect('error', 'New password must be at least 6 characters.'));
    }
    const [rows] = await db.execute(`SELECT ${COL_PASSWORD} AS passwordHash FROM \`${USERS_TABLE}\` WHERE ${COL_ID} = ?`, [userId]);
    if(!rows||rows.length === 0){
        return res.redirect(settingsRedirect('error', 'User not found.'));
    }
    const storeHash=rows[0].passwordHash;
    const ok=await bcrypt.compare(currentPassword, storeHash);
    if(!ok){
        return res.redirect(settingsRedirect('error', 'Current password is incorrect.'));
    }

    const newHash=await bcrypt.hash(newPassword, 12);
    await db.execute(`UPDATE \`${USERS_TABLE}\` SET ${COL_PASSWORD} = ? WHERE ${COL_ID} = ?`, [newHash, userId]);


    return res.redirect(settingsRedirect('success', 'Password updated successfully.'));
  }catch(err){
    console.error(err);
    res.redirect(settingsRedirect('error', "Password couldn't be updated."));
  }

};
