// ----------------------------------   DEPENDENCIES  ----------------------------------------------
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
// const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
// const session = require('express-session');

// -------------------------------------  APP CONFIG   ----------------------------------------------

// Create `ExpressHandlebars` instance with the default layout and configure the layouts and partials dir.
const hbs = handlebars.create({
    extname: '.hbs', // Make sure you have the dot before 'hbs'
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, '/src/views/layouts'),
    partialsDir: path.join(__dirname, '/src/views/partials'),
});

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/src/views'));
app.use(bodyParser.json());

// If you are using express-session, uncomment the session setup as well

// -------------------------------------  ROUTES   ----------------------------------------------

app.get('/', (req, res) => {
    // Just provide the name of the view 'home'
    // The .hbs extension is not required because you've set the default engine to handle it
    res.render('pages/home');
});

app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
  });

// -------------------------------------  START THE SERVER   ----------------------------------------------

module.exports = app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
