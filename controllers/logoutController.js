/**
 * logoutController.js
 * @author luke Johnson
 * this controller handles the logout functionality.
 */
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }
        console.log('user logged out successfully');
        // Optionally clear cookie if you want (depends on your setup):
        // res.clearCookie('connect.sid');

        // Redirect to login
        res.redirect('/login');
    });
};

module.exports = { logout };