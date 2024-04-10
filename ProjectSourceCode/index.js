// ----------------------------------   DEPENDENCIES  ----------------------------------------------
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords

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
module.exports = app.listen(3000);





// -------------------------------------  ROUTES   ----------------------------------------------



app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('pages/login', { loginPage: true });
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
      res.redirect('/portfolio');
    });
  } else if (result.status === 'passwordIncorrect') {
    // If the user exists and the password doesn't match, render the login page with a message.
    res.render('pages/login', { message: 'Incorrect username or password.' });
  } else if (result.status === 'userNotFound') {
    // If the user is not found, redirect to the registration page.
    req.session.message = 'User not found. Please register.';
    req.session.save(() => {
      res.redirect('/register');
    });
  } else {
    // For any other errors, render the login page with a generic error message.
    res.render('pages/login', { message: 'An error occurred. Please try again later.' });
  }
});

// app.get('/welcome', (req, res) => {
//   res.json({ status: 'success', message: 'Welcome!' });
// });


app.get('/register', (req, res) => {
 const message = req.session.message;
  delete req.session.message; // Clear the message from the session after displaying it
  if(message === "please enter a password"){
    res.status(400).render('pages/register', { message: message, error: 1 });
  }
  else{
    res.render('pages/register', { message: message });
  }
});


app.post('/register', async (req, res) => {
  //hash the password using bcrypt library
  if(req.body.password === ''){
    req.session.message = "please enter a password";
    // console.log(req.session.message);
    res.status(400).redirect('/register');
  }
  else{
    const hash = await bcrypt.hash(req.body.password, 10)

    // To-DO: Insert username and hashed password into the 'users' table
    const insertUser = async (username, hash, money) => {
      try {
        await db.none('INSERT INTO users(username, password, money) VALUES ($1, $2, $3)', [username, hash, money]);
        return true;
      } catch (error) {
        console.error('Error inserting user:', error);
        return false;
      }
    };

    const success = await insertUser(req.body.username, hash,300);

    if (success) {
      res.redirect('/login');
    } else {
      req.session.message = "please enter a new password";
      res.redirect('/register');
    }
  }
});

// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to login page.
    return res.redirect('/login');
  }
  next();
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
      res.render('pages/logout', { message: 'Logged out Successfully' });
    }
  });
});



app.get('/portfolio', async (req, res) => {
  try {
    // Get user's current liquidity (money in users table)
    const user = req.session.user;
    const userData = await db.one('SELECT * FROM users WHERE username = $1', [user.username]);
    const currentLiquidity = userData.money;

    // Get user's stocks (users_to_stocks table)
    const userStocks = await db.any('SELECT * FROM users_to_stocks WHERE user_id = $1', [user.username]);

    // Pass information into the portfolio page
    res.render('pages/portfolio', { 
      loggedIn: true,
      currentLiquidity: currentLiquidity,
      userStocks: userStocks
    });
  } catch (error) {
    console.error('Error retrieving portfolio data:', error);
    res.status(500).render('pages/error', { message: 'An error occurred while retrieving portfolio data.' });
  }
});

