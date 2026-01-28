const path = require('path'); //import path module

/**
 * handles showing the dashboard view
 */
const showDashboard = (req, res) => {
    const userName = req.session.user; //get user name from session
    console.log('in dashboard controller username: ' + userName);
    //show dashboard view
    res.render('dashboard', { user: userName });
}

module.exports = {showDashboard};
