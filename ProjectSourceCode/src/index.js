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
    layoutsDir: path.join(__dirname, '/views/layouts'),
    partialsDir: path.join(__dirname, '/views/partials'),
});

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'));
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



// -------------------------------------  ROUTES   ----------------------------------------------

const user = {
  password: undefined,
  username: undefined
};

app.get('/', (req, res) => {
    // Just provide the name of the view 'home'
    // The .hbs extension is not required because you've set the default engine to handle it
    res.render('pages/home');
});

app.get('/login', (req, res) => {
    //do something
    res.render('pages/login');
});

app.get('/register', (req, res) => {
    //TODO Add JSON info?
    res.render('pages/register');
});

app.get('/indiv_dashboard', (req, res) => {
  //TODO Add JSON info?
  res.render('pages/indiv_dashboard');

  //Add /indiv_dashboard to other function
});

//   // Register
app.post('/register', async (req, res) => {
    //hash the password using bcrypt library
    //console.log(req.body.username);

    const hash = await bcrypt.hash(req.body.password, 10);
  
    // To-DO: Insert username and hashed password into the 'users' table

    
      const query =
      'insert into users (username, password) values ($1, $2)  returning * ;';


    db.any(query, [
      req.body.username,
      hash
    ])
      // if query execution succeeds
      // send success message
      .then(function (data) {
        // res.status(201).json({
        //   status: 'success',
        //   data: data,
        //   message: 'data added successfully',
        // });

        user.username = data.username;
        user.password = hash;

          req.session.user = user;
          req.session.save();
        res.redirect("/login")
      })
      // if query execution fails
      // send error message
      .catch(function (err) {
        
        res.redirect("/register")
        return console.log(err);
      });
    
    

  });


  app.post('/login', async (req, res) => {
    //hash the password using bcrypt library
    const query =
    'select password from users where username = $1;';


    db.one(query,
      req.body.username
    )
      // if query execution succeeds
      // send success message
      .then(async (data) => {
        const match = await bcrypt.compare(req.body.password, data.password);



        if(Object.keys( data.password ).length > 0)
        {
            if(match)
            {

                req.session.user = {
                api_key: process.env.API_KEY,
                };
                req.session.save();
                res.redirect('/indiv_dashboard');
            }
            else{
                console.log("Password invalid");            
            }
        }else{
            console.log("data base request failed");
            console.log(data.password);
            console.log(hash);
            res.redirect('/register');
        }
        
        /*
        res.status(201).json({
          status: 'success',
          data: data,
          message: 'data added successfully',
        });
        */
      })
      // if query execution fails
      // send error message
      .catch(function (err) {
        
        res.redirect("/register")
        return console.log(err);
      });
    
    

  });

  
  const auth = (req, res, next) => {
    if (!req.session.user) {
      // Default to login page.
      return res.redirect('/login');
    }
    next();
  };

  
// Authentication Required
app.use(auth);





app.get('/logout', (req, res) => {
//do something


alert("Logged out!");

req.session.destroy();
res.render('pages/logout');



});




// -------------------------------------  START THE SERVER   ----------------------------------------------

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
