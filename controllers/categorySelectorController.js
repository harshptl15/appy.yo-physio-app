/**
 * author: Luke Johnson
 * description: this controller recieves the category (strech/strengthen/avoid) from the category view
 * and saves it in the session, it then redirects to the muscleGroupView.
 * Note the session can contain an array of objects, each object contains a category and muscle group.
 * it also shows the category view.
 */


const path = require('path'); //import path module

//temp location variable
let categoryDefault = "stretch";
/**
 * handles showing the category view
 */
const showCategoryView = async (req, res) => {
    console.log("in show category view controller in categorySelectorController.js");
    _category = null; //initialize location variable
    if (req.session.category == null || req.session.category.length === 0) {        
        _category = categoryDefault; //set default location if not set in session
    }
    else {        
        _category = req.session.category; //get location from session if it exists
    }
    //create an array of categories to display in the view
    _categories = [{categoryName: "stretch"}, {categoryName: "strengthen"}, {categoryName: "avoid"}];
    //render the category view with the category variable
    res.render('./categoryView', {categories: _categories, selectedCategory: _category});
}

/**
 * the function which recieves the input from the category view, and redirects to the muscleGroupSelectorController.
 */

const categorySelect = async (req, res) => {
    console.log("in categorySelect in categorySelectorController.js");
    //return error if category is not set in form
    if (req.body.categoryInput == null || req.body.categoryInput.length === 0) {
        return res.status(400).json({ error: "Category not set in form" });
    }
    //set the session variable for category if it exists
    req.session.category = req.body.categoryInput; //get location from form    
    res.redirect('/muscleGroup');    
}

module.exports = {showCategoryView, categorySelect}; //export functions