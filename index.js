/**
 * index.js
 * the entry point for the application.
 * @author: Luke Johnson
 */

const express = require('express'); //import express module.
//creating an instance of express.
const app = express();
const session = require('express-session'); //import express-session for session management
const path = require('path'); //import path module for handling file paths
//import userRoutes used for routing to register and login views.
const userRoutes = require('./routes/userRoutes');

//used for parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

//used for parsing application/json
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: false
}));


// Set view engine to EJS
app.set('view engine', 'ejs');
// Set views folder
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'views')));

app.use('/', userRoutes);//use userRoutes for all routes starting with '/'

//show register view.
app.get('/', (req, res) => {
    res.redirect('/register');
});

app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);
  res.status(500).json({ error: err.message || "Server error" });
});

//listen to port 3000
app.listen(3001, () => {
    console.log('server running on port 3001');
})