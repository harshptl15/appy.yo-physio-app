/**
 * controllers/settingsController.js
 * Renders the Settings page.
 */
const showSettingsView = (req, res) => {
    const user = req.session?.user || {};
    res.render('settingsView', { user });
};

module.exports = { showSettingsView };
