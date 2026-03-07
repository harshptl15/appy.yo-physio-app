/**
 * index.js
 * the entry point for the application.
 * @author: Luke Johnson
 */


require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();

const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to Railway MySQL!");
});



const session = require('express-session'); //import express-session for session management
const path = require('path'); //import path module for handling file paths
//import userRoutes used for routing to register and login views.
const userRoutes = require('./routes/userRoutes');
const { checkAuthenticated } = require('./middleware/auth');
const userModel = require('./models/userModel');
const dashboardController = require('./controllers/dashboardController');

//used for parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//used for parsing application/json
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));


// Set view engine to EJS
app.set('view engine', 'ejs');
// Set views folder
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'views')));
app.use('/frontend', express.static(path.join(__dirname, 'frontend/dist')));

app.use((req, res, next) => {
  res.locals.currentUser = req.session?.user || null;
  res.locals.currentPath = req.path;
  next();
});

// Hard-register dashboard summary endpoints at app level as a safety net.
app.get('/api/dashboard/summary', checkAuthenticated, dashboardController.getDashboardSummary);
app.get('/dashboard/summary', checkAuthenticated, dashboardController.getDashboardSummary);

app.use('/', userRoutes);//use userRoutes for all routes starting with '/'

//route for aboutUs page
app.get("/about", (req, res) => {
  res.render("about");
});

app.get('/forgot-password', (req, res) => {
  res.render('placeholder', {
    title: 'Forgot Password | PhysioApp',
    headingKey: 'placeholder.forgot.heading',
    bodyKey: 'placeholder.forgot.body'
  });
});

app.get('/terms', (req, res) => {
  res.render('placeholder', {
    title: 'Terms & Conditions | PhysioApp',
    headingKey: 'placeholder.terms.heading',
    bodyKey: 'placeholder.terms.body'
  });
});

app.get('/privacy', (req, res) => {
  res.render('placeholder', {
    title: 'Privacy Policy | PhysioApp',
    headingKey: 'placeholder.privacy.heading',
    bodyKey: 'placeholder.privacy.body'
  });
});

//route for settings page
app.get("/settings", checkAuthenticated, async (req, res) => {
  const notice = req.query.message
    ? {
        type: req.query.type || 'info',
        message: req.query.message
      }
    : null;
  try {
    const dbUser = await userModel.getUserById(req.session.user.id);
    const user = dbUser
      ? {
          ...req.session.user,
          ...dbUser
        }
      : req.session.user;

    res.render("settings", { user, notice });
  } catch (error) {
    console.error('Error loading settings profile:', error);
    res.render("settings", { user: req.session.user, notice });
  }
});

//show register view.
app.get('/', (req, res) => {
    res.redirect('/register');
});

<<<<<<< HEAD
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
});

//listen to port 3000
app.listen(3000, () => {
    console.log('server running on port 3000');
})
=======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
>>>>>>> b223851a563dab77718c663201c933b08aae249a
