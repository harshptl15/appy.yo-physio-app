/**
 * author: Luke Johnson
 * description: this controller recieves the location (home/gym) from the locationSelectorView
 * and saves it in the session, it then redirects to the categorySelectorView.
 * it also shows the where view.
 */

const path = require('path'); //import path module

//default location variable 
const locationTemp = "home";

/**
 * handles showing the where view
 */
const showWhereView = async (req, res) => {
    _location = null; //initialize location variable
    if (req.session.location == null || req.session.location.length === 0) {        
        _location = locationTemp; //set default location if not set in session
    }
    else {        
        _location = req.session.location; //get location from session if it exists
    }
    //create an array of locations to display in the view
    _locations = [{locationName: "home"}, {locationName: "gym"}];
    //show where view
    console.log("in show where view controller in locationSelectorController.js");
    res.render('./whereView', {locations: _locations, selectedLocation: _location});
}

/**
 * the function which recieves the input from the where view, and redirects to the category view.
 */
const whereSelect = async (req, res) => {
    console.log("in whereSelect in locationSelectorController.js");
    //reurn error if location is not set in form
    if (req.body.locationInput == null || req.body.locationInput.length === 0) {
        return res.status(400).json({ error: "Location not set in form" });
    }
    //set the session variable for location if it exists
    req.session.location = req.body.locationInput; //get location from form    
    res.redirect('/category');
    
}

module.exports = {showWhereView, whereSelect};