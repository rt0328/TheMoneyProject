const THEME_COLORS = [
  {
    "color" : "green",
    "hex" : "7ADD83"
  },
  {
    "color" : "pink",
    "hex" : "F18AED"
  },
  {
    "color" : "turquoise",
    "hex" : "7ACBDD"
  },
  {
    "color" : "red",
    "hex" : "ED6262"
  },
]

const ICONS = [
  {
    "filename" : "bezos.png",
    "icon_num": 1,
  },
  {
    "filename" : "doge.png",
    "icon_num": 2,
  },
  {
    "filename" : "elon.png",
    "icon_num": 3,
  },
  {
    "filename" : "lisa.png",
    "icon_num": 4,
  },
  {
    "filename" : "matthew.png",
    "icon_num": 5,
  },
  {
    "filename" : "oprah.png",
    "icon_num": 6,
  },
  {
    "filename" : "rihanna.png",
    "icon_num": 7,
  },
  {
    "filename" : "stewie.png",
    "icon_num": 8,
  },
  {
    "filename" : "stonks.png",
    "icon_num": 9,
  },
  {
    "filename" : "zuckerberg.png",
    "icon_num": 10,
  },
]

// ----------------------------------   DEPENDENCIES  ----------------------------------------------
const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const { error, group} = require('console');
const url = require('url');

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
app.use(express.static('public'));




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
    console.log('Success!')
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



app.get('/groups', async (req, res) => {
  const user = req.session.user;

  try {
    // Get distinct groups that the user is in along with corresponding portfolio IDs
    const groupData = await db.manyOrNone(`
      SELECT DISTINCT ON (g.group_id) g.*, gp.portfolio_id
      FROM groups g
      INNER JOIN users_to_groups ug ON g.group_id = ug.group_id
      INNER JOIN groups_to_portfolios gp ON g.group_id = gp.group_id
      INNER JOIN portfolios p ON gp.portfolio_id = p.portfolio_id
      WHERE ug.user_id = $1 AND p.user_id = $1
    `, [user.username]);

    // Append iconFileName and color to each group in groupData
    groupData.forEach((group, index) => {
      group.iconFileName = getIconFilename(group.icon_num);

      // Alternate background color based on index
      const colorIndex = index % THEME_COLORS.length;
      group.backgroundColor = THEME_COLORS[colorIndex].hex;
    });

    // Fetch current portfolio value and ranking for each group

    console.log("GROUP DATA:");
    console.log(groupData);

    res.render('pages/groups', { groupData, loggedIn: true });
  } catch (error) {
    // Handle error
    console.error('Error fetching group data:', error);
    res.status(500).send('Internal Server Error');
  }
});





app.get('/create_group', async (req, res) => {
  res.render('pages/create_group', { loggedIn: true, icons: ICONS });
});


app.post('/create_group', async (req, res) => {
  console.log(req.body);
  if (req.body.groupname === '' || req.body.startingliquidity === '' || req.body.icon_num === '') {
      res.status(400).render('pages/create_group', { loggedIn: true, icons: ICONS, message: "Please enter a group name, starting liquidity, and select an icon", error: 1 });
  } else {
      try {
          // Function to generate a unique group code
          function generateGroupCode() {
              const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
              let code = '';
              for (let i = 0; i < 6; i++) {
                  code += characters.charAt(Math.floor(Math.random() * characters.length));
              }
              return code;
          }

          // Function to check if group code is unique
          async function isGroupCodeUnique(code) {
              const existingGroup = await db.oneOrNone('SELECT group_id FROM groups WHERE group_code = $1', [code]);
              return !existingGroup;
          }


          // Generate a unique group code
          let groupCode;
          let unique = false;
          while (!unique) {
              groupCode = generateGroupCode();
              unique = await isGroupCodeUnique(groupCode);
          }

          // Check if the group code already exists
          const groupCodeExists = await db.oneOrNone('SELECT group_code FROM groups WHERE group_code = $1', [groupCode]);
          if (groupCodeExists) {
              // If the group code exists, render an error message
              return res.status(400).render('pages/create_group', { loggedIn: true, icons: ICONS, message: "Group code already exists. Please try again.", error: 1 });
          }

          // Insert the group into the database
          await db.none('INSERT INTO groups(admin_user, group_name, starting_liquidity, icon_num, group_code) VALUES ($1, $2, $3, $4, $5)', [req.session.user.username, req.body.groupname, req.body.startingliquidity, req.body.icon_num, groupCode]);

          // Create portfolio for admin user
          const portfolioId = await createPortfolio(req.session.user.username, req.body.startingliquidity);

          // Add the user to the group
          await db.none('INSERT INTO users_to_groups(user_id, group_id) VALUES ($1, (SELECT group_id FROM groups WHERE group_code = $2))', [req.session.user.username, groupCode]);

          // Add the group to the user's portfolio
          await db.none('INSERT INTO groups_to_portfolios(group_id, portfolio_id) VALUES ((SELECT group_id FROM groups WHERE group_code = $1), $2)', [groupCode, portfolioId]);

          // Redirect to the My Groups page
          res.redirect(`/group_code?groupCode=${groupCode}`);
      } catch (error) {
          console.error('Error inserting group:', error);
          res.status(500).send('Internal Server Error');
      }
  }
});



app.get('/group_code', async (req,res) => {
  const groupCode = req.query.groupCode;
  res.render('pages/group_code', { loggedIn: true, groupCode : groupCode });
});

app.get('/join_group', (req, res) => {
  res.render('pages/join_group', {loggedIn : true});
});

// Route to handle joining a group
app.post('/join_group', async (req, res) => {
  const groupCode = req.body.groupCode;
  const username = req.session.user.username;

  try {
    // Check if the group with the provided code exists
    const group = await db.oneOrNone('SELECT * FROM groups WHERE group_code = $1', [groupCode]);
    if (!group) {
      // Group not found, send JSON response with an error message
      return res.render('pages/join_group', { message: 'This group does not exist!', loggedIn: true , error : true});
    }

    // Check if the user is already in the group
    const userInGroup = await db.oneOrNone('SELECT * FROM users_to_groups WHERE user_id = $1 AND group_id = $2', [username, group.group_id]);
    if (userInGroup) {
      // User is already in the group, send JSON response with an error message
      return res.render('pages/join_group', { message: 'You are already in the group.', loggedIn: true , error : true});
    }

    // Add user to the group
    await db.none('INSERT INTO users_to_groups (user_id, group_id) VALUES ($1, $2)', [username, group.group_id]);

    // Create a new portfolio for the user
    const portfolioId = await createPortfolio(username, group.starting_liquidity);

    // Connect the group to the new portfolio
    await db.none('INSERT INTO groups_to_portfolios (group_id, portfolio_id) VALUES ($1, $2)', [group.group_id, portfolioId]);

    // Send JSON response indicating success
    return res.redirect('/groups')
  } catch (error) {
    console.error('Error joining group:', error);
    // Send JSON response with error message
    return res.render('pages/join_group', { message: 'Failure to join group.', loggedIn: true , error : true});
  }
});

app.get('/edit_group', async (req,res) => {
  res.render('pages/edit_group', {loggedIn : true, })
})


app.get('/group', async (req, res) => {
  try {
    // Get current user from session and groupId from params
    const currentUser = req.session.user;
    const groupId = req.query.groupId;


    console.log(`Group ID: ${groupId}`)

    // 1. Verify the user belongs to the group and throw permission error if not
    const userInGroup = await db.oneOrNone('SELECT * FROM users_to_groups WHERE user_id = $1 AND group_id = $2', [currentUser.username, groupId]);
    if (!userInGroup) {
      return res.status(403).send('You do not have permission to access this group.');
    }

    // Get group data
    const groupData = await db.oneOrNone('SELECT * FROM groups WHERE group_id = $1', [groupId]);
    console.log(groupData);

    // Get group icon
    groupData.iconFileName = getIconFilename(groupData.icon_num);

    // 2. Get all of the portfolios (including current user) from db
    const allPortfolios = await db.manyOrNone(`
      SELECT p.*, u.username AS user_id
      FROM portfolios p
      INNER JOIN users_to_groups ug ON p.user_id = ug.user_id
      INNER JOIN users u ON p.user_id = u.username
      INNER JOIN groups_to_portfolios gp ON p.portfolio_id = gp.portfolio_id
      WHERE ug.group_id = $1
      AND gp.group_id = $1
    `, [groupId]);

    console.log("All Portfolios:")
    console.log(allPortfolios);

    // 3. For each portfolio, use getPortfolioValue to retrieve currentValue and topStock.
    // Additionally, add alternating background color using THEME_COLORS
    const portfolioData = [];
    for (const portfolio of allPortfolios) {
      const { portfolioValue, topStock } = await getPortfolioValue(portfolio);
      const colorIndex = allPortfolios.indexOf(portfolio) % THEME_COLORS.length;
      const backgroundColor = THEME_COLORS[colorIndex].hex;
      portfolioData.push({ ...portfolio, portfolioValue, topStock, backgroundColor });
    }

    console.log("PortfolioData with portfolioValue and top stock:")
    console.log(portfolioData);

    // 4. Assign a rank to each portfolio based on currentValue. #1 should get the highest currentValue
    portfolioData.sort((a, b) => b.portfolioValue - a.portfolioValue);
    portfolioData.forEach((portfolio, index) => {
      portfolio.rank = index + 1;
    });

    console.log("Portfolios with ranks:")
    console.log(portfolioData);

    // 5. See if current user is admin user of the group. If true, pass
    const isAdmin = currentUser.username === portfolioData[0].user_id;

    console.log(`isAdmin : ${isAdmin}`)

    // 6. Once rankings are assigned, split portfolios into two: userPortfolio and otherPortfolios
    const [userPortfolio] = portfolioData.filter(portfolio => portfolio.user_id === currentUser.username);
    const otherPortfolios = portfolioData.filter(portfolio => portfolio.user_id !== currentUser.username);

    console.log("User Portfolio:")
    console.log(userPortfolio);

    console.log("Other portfolios:")
    console.log(otherPortfolios);

    res.render('pages/group', { loggedIn: true, isAdmin, userPortfolio, otherPortfolios, groupData });
  } catch (error) {
    console.error('Error fetching group data:', error);
    res.status(500).send('Internal Server Error');
  }
});







app.get('/portfolio', async (req, res) => {
  try {
    // Get user's current liquidity (money in users table)
    const user = req.session.user;
    const portfolioId = req.query.portfolioId || req.session.portfolioId;

    // Get user data from users table based on session 
    const userData = await db.one('SELECT * FROM users WHERE username = $1', [user.username]);

    // Get portfolio where portfolio_id matches what's passed in req body
    const portfolioData = await db.one('SELECT * FROM portfolios WHERE portfolio_id = $1', [portfolioId]);

    // Determine if user matches the owner of the portfolio
    if (portfolioData.user_id !== userData.username) {
      return res.status(404).json({ message: "Unauthorized access." });
    }

    // Fetch stock data from portfolios_to_stocks table for the specified portfolio
    const stockData = await db.manyOrNone('SELECT * FROM portfolios_to_stocks WHERE portfolio_id = $1', [portfolioId]);

    let currPortfolioValue = 0;

    // Calculate current value for each stock
    for (const stock of stockData) {
      // Get current price for the stock symbol
      console.log(stock.stock_symbol);
      const currentPrice = await getSymbolPrice(stock.stock_symbol);
      console.log(currentPrice);

      const currStockValue = currentPrice * stock.num_shares;

      currPortfolioValue += currStockValue;

      // Update current value for the stock in the stockData array
      stock.current_value = formatDollarAmount(currStockValue);
    }

    // Format current liquidity
    const currentLiquidity = formatDollarAmount(portfolioData.current_liquidity);

    // Pass information into the portfolio page
    res.render('pages/portfolio', { 
      loggedIn: true,
      currentLiquidity: currentLiquidity,
      userStocks: stockData,
      currPortfolioValue: formatDollarAmount(currPortfolioValue),
    });
  } catch (error) {
    console.error('Error retrieving portfolio data:', error);
    res.status(500);
  }
});


app.post('/buyStock', async (req, res) => {
  try {
    console.log('Buy stock request received:', req.body);

    const { portfolioId, stockSymbol, numStocks } = req.body;
    const username = req.session.user.username;

    console.log('User:', username);
    console.log('Portfolio ID:', portfolioId);
    console.log('Stock Symbol:', stockSymbol);
    console.log('Number of Stocks:', numStocks);

    // Check if the portfolio belongs to the current user
    const portfolioOwner = await db.oneOrNone('SELECT user_id FROM portfolios WHERE portfolio_id = $1', [portfolioId]);
    if (!portfolioOwner || portfolioOwner.user_id !== username) {
      console.log('Unauthorized access to portfolio');
      return res.status(403).json({ message: "Unauthorized access to portfolio" });
    }

    // Fetch user's current liquidity from portfolios table
    const { current_liquidity } = await db.one('SELECT current_liquidity FROM portfolios WHERE portfolio_id = $1', [portfolioId]);

    console.log('Current Liquidity:', current_liquidity);

    // Call Finnhub API to get current price of the stock
    console.log('Fetching quote for symbol:', stockSymbol);
    const currentPrice = await getSymbolPrice(stockSymbol);

    console.log('Current Price for', stockSymbol, 'is', currentPrice);

    // Calculate the cost of purchasing the specified number of shares
    const purchaseCost = currentPrice * numStocks;

    console.log('Purchase Cost:', purchaseCost);

    // Check if user has enough liquidity for the purchase
    if (purchaseCost > current_liquidity) {
      console.log('Insufficient funds for the purchase');
      return res.status(400).json({ message: "Insufficient funds for the purchase" });
    }

    // Deduct the purchase cost from user's current liquidity
    const newLiquidity = current_liquidity - purchaseCost;

    console.log('New Liquidity after purchase:', newLiquidity);

    // Update user's current liquidity in the portfolios table
    await db.none('UPDATE portfolios SET current_liquidity = $1 WHERE portfolio_id = $2', [newLiquidity, portfolioId]);

    // Check if the stock is already present in the portfolio
    const existingStock = await db.oneOrNone('SELECT * FROM portfolios_to_stocks WHERE portfolio_id = $1 AND stock_symbol = $2', [portfolioId, stockSymbol]);

    if (existingStock) {
      // If the stock is already present, update the number of shares by adding the purchased quantity
      await db.none('UPDATE portfolios_to_stocks SET num_shares = num_shares + $1 WHERE portfolio_id = $2 AND stock_symbol = $3', [numStocks, portfolioId, stockSymbol]);
    } else {
      // If the stock is not present, insert a new row into the portfolios_to_stocks table
      await db.none('INSERT INTO portfolios_to_stocks (portfolio_id, stock_symbol, num_shares) VALUES ($1, $2, $3)', [portfolioId, stockSymbol, numStocks]);
    }

    // Respond with status 200 for success
    res.status(200).json({ message: "Stock purchased successfully" });

  } catch (error) {
    console.error('Error purchasing stock:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});





app.post('/sellStock', async (req, res) => {
  try {
    console.log('Sell stock request received:', req.body);

    const { portfolioId, stockSymbol, numStocks } = req.body;
    const username = req.session.user.username;

    console.log('User:', username);
    console.log('Portfolio ID:', portfolioId);
    console.log('Stock Symbol:', stockSymbol);
    console.log('Number of Stocks:', numStocks);

    // Check if the portfolio belongs to the current user
    const portfolioOwner = await db.oneOrNone('SELECT user_id FROM portfolios WHERE portfolio_id = $1', [portfolioId]);
    if (!portfolioOwner || portfolioOwner.user_id !== username) {
      console.log('Unauthorized access to portfolio');
      return res.status(403).json({ message: "Unauthorized access to portfolio" });
    }

    // Fetch user's current liquidity from portfolios table
    const { current_liquidity } = await db.one('SELECT current_liquidity FROM portfolios WHERE portfolio_id = $1', [portfolioId]);

    // Fetch the number of shares the user currently has for the stock being sold
    const existingStock = await db.oneOrNone('SELECT num_shares FROM portfolios_to_stocks WHERE portfolio_id = $1 AND stock_symbol = $2', [portfolioId, stockSymbol]);

    if (!existingStock || existingStock.num_shares < numStocks) {
      console.error('Error selling stock:', error);
      return res.status(500).json({ message: "Insufficient funds." });
    }

    // Call Finnhub API to get current price of the stock
    console.log('Fetching quote for symbol:', stockSymbol);
    const currentPrice = await getSymbolPrice(stockSymbol);

    console.log('Current Price for', stockSymbol, 'is', currentPrice);

    // Calculate the value of the sold stocks
    const saleValue = currentPrice * numStocks;

    console.log('Sale Value:', saleValue);

    // Add the sale value to user's current liquidity
    const newLiquidity = current_liquidity + saleValue;

    console.log('New Liquidity after sale:', newLiquidity);

    // Update user's current liquidity in the portfolios table
    await db.none('UPDATE portfolios SET current_liquidity = $1 WHERE portfolio_id = $2', [newLiquidity, portfolioId]);

    // Update the number of shares in the portfolios_to_stocks table
    const updatedShares = existingStock.num_shares - numStocks;
    if (updatedShares === 0) {
      // If all shares are sold, remove the record from portfolios_to_stocks
      await db.none('DELETE FROM portfolios_to_stocks WHERE portfolio_id = $1 AND stock_symbol = $2', [portfolioId, stockSymbol]);
    } else {
      // Otherwise, update the number of shares
      await db.none('UPDATE portfolios_to_stocks SET num_shares = $1 WHERE portfolio_id = $2 AND stock_symbol = $3', [updatedShares, portfolioId, stockSymbol]);
    }

    console.log('Stock sold successfully');

    // Respond with status 200 for success
    res.status(200).json({ message: "Stock sold successfully" });

  } catch (error) {
    console.error('Error selling stock:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});





// -------------------------------------  API   ----------------------------------------------

require('dotenv').config();


// Import the Finnhub module
const finnhub = require('finnhub');


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
                  console.error('Error fetching quote:', error);
                  reject(error);
              } else {
                  resolve(data);
              }
          });
      });

      // You can return or use the current price as needed
      return data.c;
  } catch(error) {
      // Log any errors that occur during the API call
      console.error('Error fetching symbol price:', error);
      throw error; // rethrow the error to propagate it to the caller
  }
}


app.get('/getSymbolPrice/:symbol', async (req, res) => {
  try {
      const symbol = req.params.symbol;

      // Call the getSymbolPrice function to fetch the current price
      const currentPrice = await getSymbolPrice(symbol);

      // Send the current price as a JSON response
      res.json({ symbol, currentPrice });
  } catch (error) {
      // Handle errors and send an appropriate response
      console.error('Error fetching symbol price:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});



function formatDollarAmount(amount) {
  // Round the amount to two decimal places
  return Number(amount).toFixed(2);
}



function getIconFilename(iconNum) {
  const icon = ICONS.find(icon => icon.icon_num === iconNum);
  return icon ? icon.filename : null;
}






// Function to create a portfolio for the user
async function createPortfolio(username, startingLiquidity) {
  try {
      // Insert the portfolio into the database
      const result = await db.one('INSERT INTO portfolios (user_id, current_liquidity) VALUES ($1, $2) RETURNING portfolio_id', [username, startingLiquidity]);
      return result.portfolio_id;
  } catch (error) {
      console.error('Error creating portfolio:', error);
      throw error;
  }
}


async function getPortfolioValue(portfolio) {
  let currPortfolioValue = portfolio.current_liquidity; // Start with current liquidity
  let topStock = null;
  let bestPerformance = -Infinity;

  // Fetch stock data from portfolios_to_stocks table for the specified portfolio
  const stockData = await db.manyOrNone('SELECT * FROM portfolios_to_stocks WHERE portfolio_id = $1', [portfolio.portfolio_id]);

  // Calculate current value for each stock and find the best performing one
  for (const stock of stockData) {
    // Get current price for the stock symbol
    const currentPrice = await getSymbolPrice(stock.stock_symbol);
    const currStockValue = currentPrice * stock.num_shares;
    currPortfolioValue += currStockValue;

    // Calculate performance of the stock
    const performance = currStockValue;

    // Update topStock if the current stock has better performance
    if (performance > bestPerformance) {
      topStock = stock.stock_symbol;
      bestPerformance = performance;
    }
  }

  // Return the portfolio value and the best performing stock
  return { portfolioValue: formatDollarAmount(currPortfolioValue), topStock };
}


async function getCurrentRanking(groupId, user) {
  try {
    // Fetch all portfolios for the group
    const portfolios = await db.manyOrNone('SELECT * FROM groups_to_portfolios WHERE group_id = $1', [groupId]);

    // Calculate ranking based on portfolio value
    portfolios.sort((a, b) => b.portfolio_value - a.portfolio_value);

    // Find index of current user's portfolio
    const currentUserIndex = portfolios.findIndex(portfolio => portfolio.user_id === user.username);

    // Add 1 to index to get ranking
    return currentUserIndex + 1;
  } catch (error) {
    console.error('Error calculating current ranking:', error);
    throw error;
  }
}