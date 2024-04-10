// ----------------------------------   DEPENDENCIES  ----------------------------------------------
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const { error } = require('console');

// -------------------------------------  APP CONFIG   ----------------------------------------------

// Create `ExpressHandlebars` instance with the default layout and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: '.hbs', // Make sure you have the dot before 'hbs'
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, '/src/views/layouts'),
  partialsDir: path.join(__dirname, '/src/views/partials'),
});



// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });







// Register `hbs` as our view engine using its bound `engine()` function.
app.use(express.static(__dirname + '/src/'));
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/src/views'));
app.use(bodyParser.json());



app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// If you are using express-session, uncomment the session setup as well





// -------------------------------------  START THE SERVER   ----------------------------------------------

//normal server
// app.listen(3000, () => {
//   console.log('Server is listening on port 3000');
// });

//testing module
module.exports = app.listen(3000, ()=>{
  console.log('Server is listening on port 3000');
});





// -------------------------------------  ROUTES   ----------------------------------------------

var loggedIn = false;

app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/login', (req, res) => {
  res.render('pages/login', { loginPage: true });
});

app.get('/home', (req, res) => {
    res.render('pages/home', { loggedIn: loggedIn , homePage: true});
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const loginUser = async (username, password) => {
    try {
      const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
      if (user) {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          return { status: 'success', user };
        } else {
          // Password does not match
          return { status: 'passwordIncorrect' };
        }
      } else {
        // User does not exist
        return { status: 'userNotFound' };
      }
    } catch (error) {
      console.error('Error logging in user:', error);
      return { status: 'error', error };
    }
  };

  const result = await loginUser(username, password);

  if (result.status === 'success') {
    // If the user is found and password matches, redirect to /portfolio route after setting the session.
    req.session.user = result.user;
    req.session.save(() => {
      res.redirect('/groups');
    });
  } else if (result.status === 'passwordIncorrect') {
    // If the user exists and the password doesn't match, render the login page with a message.
    res.status(400).render('pages/login', { message: 'Incorrect username or password.', error: 1 });
  } else if (result.status === 'userNotFound') {
    
    res.status(302).render('pages/register', { message: 'User not found. Please register.', error: 1 });
  } else {
    // For any other errors, render the login page with a generic error message.
    res.status(404).render('pages/login', { message: 'An error occurred. Please try again later.' });
  }
});

app.get('/register', (req, res) => {
  res.render('pages/register', {registerPage: true});
});

app.post('/register', async (req, res) => {
  //hash the password using bcrypt library
  if (req.body.password === '' || req.body.username === '') {
    res.status(400).render('pages/register', {message: "Please enter a username and password", error: 1});

  }
  else {
    const hash = await bcrypt.hash(req.body.password, 10)

    // To-DO: Insert username and hashed password into the 'users' table
    const insertUser = async (username, hash) => {
      try {
        await db.none('INSERT INTO users(username, password) VALUES ($1, $2)', [username, hash]);
        return true;
      } catch (error) {
        console.error('Error inserting user:', error);
        return false;
      }
    };

    const success = await insertUser(req.body.username, hash);

    if (success) {
      res.status(302).render('pages/login',{message: "User Added Successfully"});
    } else {
      res.status(400).render('pages/register',{message: "Username already taken. Please try a new username.", error: 1});
    }
  }
});

// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to login page.
    loggedIn = false;
    return res.redirect('/login');
  }
  next();
  loggedIn = true;
};

app.use(auth);


app.get('/logout', (req, res) => {

  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.log('Session Destroy Error:', err);
      res.send("Error logging out"); // Optionally, handle errors more gracefully
    } else {
      // Session destroyed, render the logout page with a success message
      loggedIn = false;
      res.render('pages/logout', { logoutPage: true, message: 'Logged out Successfully' });
    }
  });
});



app.get('/portfolio', (req, res) => {
  res.render('pages/portfolio', { loggedIn: true, portfolioPage: true });
});

app.get('/groups', (req, res) => {
  res.render('pages/groups', { loggedIn: true, groupsPage: true });
});

app.get('/group', (req, res) => {
  res.render('pages/group', { loggedIn: true, groupPage: true });
});
// -------------------------------------  API   ----------------------------------------------

require('dotenv').config();


// Import the Finnhub module
const finnhub = require('finnhub');


// Function to get the price of a stock symbol
async function getSymbolPrice(symbol){
   try {
       // Retrieve the API key authentication object from the Finnhub API client
       const api_key = finnhub.ApiClient.instance.authentications['api_key'];

       // Set the API key from the environment variable
       api_key.apiKey = process.env.API_KEY;

       // Create a new instance of the Finnhub client
       const finnhubClient = new finnhub.DefaultApi();


       // Fetch the quote for the given symbol and handle the response
       const data = await new Promise((resolve, reject) => {
           finnhubClient.quote(symbol, (error, data, response) => {
               if (error) {
                   reject(error);
               } else {
                   resolve(data);
               }
           });
       });
       const currentPrice = data.c;
       //console.log('Current price:', currentPrice);


       // You can return or use the current price as needed
       return currentPrice;
   } catch(error) {
       // Log any errors that occur during the API call
       console.error('error', error);
   }
};