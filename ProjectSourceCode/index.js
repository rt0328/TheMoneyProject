// Theme colors for group and player rankings
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
    "color" : "orange",
    "hex" : "f7ab56"
  },
]

// Group icons - icon_num corresponds to group table and filename corresponds to relative path in project
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

// Handlebars Configuration
const hbs = handlebars.create({
  extname: '.hbs', // Make sure you have the dot before 'hbs'
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, '/src/views/layouts'),
  partialsDir: path.join(__dirname, '/src/views/partials'),
});



// DB Configuration
const dbConfig = {
  host: 'db', 
  port: 5432, 
  database: process.env.POSTGRES_DB, 
  user: process.env.POSTGRES_USER, 
  password: process.env.POSTGRES_PASSWORD, 
};

// Use pgp with db config
const db = pgp(dbConfig);

// Connect to database
db.connect()
.then(obj => {
  console.log('Database connection successful'); 
  obj.done(); 
})
.catch(error => {
  console.log('ERROR:', error.message || error);
});


// Set up hbs, directory, views, and public folders with express
app.use(express.static(__dirname + '/src/'));
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/src/views'));
app.use(bodyParser.json());
app.use(express.static('public'));



// Define session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    loggedIn: false
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);




// -------------------------------------  START THE SERVER   ----------------------------------------------


module.exports = app.listen(3000, ()=>{
  console.log('Server is listening on port 3000');
});



// -------------------------------------  ROUTES   ----------------------------------------------

// Redirect / to home page
app.get('/', (req, res) => {
  res.redirect('/home');
});

// Home page
app.get('/home', (req, res) => {
  res.render('pages/home', { loggedIn: req.session.loggedIn , homePage: true});
});

// -------------------------  Login / Authentication   ----------------------------------



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
          // Password matches
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
    // User exists and password matches, save session and redirect to portfolio
    req.session.user = result.user;
    req.session.save(() => {
      res.redirect('/groups');
    });
  } else if (result.status === 'passwordIncorrect') {
    // User exists but password doesn't match
    res.status(400).render('pages/login', { message: 'Incorrect username or password.', error: 1 });
  } else if (result.status === 'userNotFound') {
    // User not found
    res.status(302).render('pages/register', { message: 'User not found. Please register.', error: 1 });
  } else {
    // Generic error
    res.status(404).render('pages/login', { message: 'An error occurred. Please try again later.' });
  }
});

const auth = (req, res, next) => {
  if (!req.session.user && req.originalUrl !== '/register') {
    // User is not logged in and not accessing the register page, redirect to login page
    return res.redirect('/login');
  }

  // User is logged in, set loggedIn state in session
  req.session.loggedIn = true;
  next();
};



app.use(auth);





// -------------------------  Register   ----------------------------------

app.get('/register', (req, res) => {
  res.render('pages/register', {registerPage: true});
});


app.post('/register', async (req, res) => {
  // Hash the password using bcrypt library
  if (req.body.password === '' || req.body.username === '') {
    res.status(400).render('pages/register', {message: "Please enter a username and password", error: 1});

  }
  else {
    const hash = await bcrypt.hash(req.body.password, 10)

    // Insert username and hashed password into the 'users' table
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
      // Successfully added user
      res.status(302).render('pages/login',{message: "User Added Successfully"});
    } else {
      // Error inserting user due to already exisiting 
      res.status(400).render('pages/register',{message: "Username already taken. Please try a new username.", error: 1});
    }
  }
});


// -------------------------  Logout  ----------------------------------


app.get('/logout', (req, res) => {

  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      // Error logging out
      console.log('Session Destroy Error:', err);
      res.send("Error logging out"); 
    } else {
      // Session destroyed, render the logout page with a success message
      req.session.loggedIn = false;
      res.render('pages/logout', { logoutPage: true, message: 'Logged out Successfully' });
    }
  });
});

// -------------------------  Groups  ----------------------------------



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
    res.render('pages/groups', { groupData, loggedIn: req.session.loggedIn });

  } catch (error) {
    // Handle error
    console.error('Error fetching group data:', error);
    res.status(500).send('Internal Server Error');
  }
});


// -------------------------  Create Group  ----------------------------------


app.get('/create_group', async (req, res) => {
  res.render('pages/create_group', { loggedIn: req.session.loggedIn, icons: ICONS });
});


app.post('/create_group', async (req, res) => {
  if (req.body.groupname === '' || req.body.startingliquidity === '' || req.body.icon_num === '') {
      res.status(400).render('pages/create_group', { loggedIn: req.session.loggedIn, icons: ICONS, message: "Please enter a group name, starting liquidity, and select an icon", error: 1 });
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
              // Group Code already exists, throw error
              return res.status(400).render('pages/create_group', { loggedIn: req.session.loggedIn, icons: ICONS, message: "Group code already exists. Please try again.", error: 1 });
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
  res.render('pages/group_code', { loggedIn: req.session.loggedIn, groupCode : groupCode });
});


// -------------------------  Join Group  ----------------------------------


app.get('/join_group', (req, res) => {
  res.render('pages/join_group', {loggedIn : req.session.loggedIn});
});

// Route to handle joining a group
app.post('/join_group', async (req, res) => {
  const groupCode = req.body.groupCode;
  const username = req.session.user.username;

  try {
    // Check if the group with the provided code exists
    const group = await db.oneOrNone('SELECT * FROM groups WHERE group_code = $1', [groupCode]);
    if (!group) {
      // Group not found
      return res.render('pages/join_group', { message: 'This group does not exist!', loggedIn: true , error : true});
    }

    // Check if the user is already in the group
    const userInGroup = await db.oneOrNone('SELECT * FROM users_to_groups WHERE user_id = $1 AND group_id = $2', [username, group.group_id]);
    if (userInGroup) {
      // User is already in the group, throw error
      return res.render('pages/join_group', { message: 'You are already in the group.', loggedIn: req.session.loggedIn , error : true});
    }

    // Add user to the group
    await db.none('INSERT INTO users_to_groups (user_id, group_id) VALUES ($1, $2)', [username, group.group_id]);

    // Create a new portfolio for the user
    const portfolioId = await createPortfolio(username, group.starting_liquidity);

    // Connect the group to the new portfolio
    await db.none('INSERT INTO groups_to_portfolios (group_id, portfolio_id) VALUES ($1, $2)', [group.group_id, portfolioId]);

    return res.redirect('/groups')
  } catch (error) {
    console.error('Error joining group:', error);
    // Error joining group
    return res.render('pages/join_group', { message: 'Failure to join group.', loggedIn: req.session.loggedIn , error : true});
  }
});


// -------------------------  Edit Group  ----------------------------------

app.get('/edit_group', async (req, res) => {
  // Retrieve the group ID from the request query
  const groupId = req.query.groupId;

  // Check if the current user is logged in
  if (req.session.user) {
      // Get the group based on group_id
      const groupData = await db.oneOrNone('SELECT * FROM groups WHERE group_id = $1', [groupId]);
      
      // Check if group found
      if (groupData) {

          // Get admin of group
          const adminUser = groupData.admin_user;
          
          // Check if the current user matches the admin user of the group
          if (req.session.user.username === adminUser) {
              // User is the admin of the group
              res.render('pages/edit_group', { loggedIn: req.session.loggedIn, groupData, icons: ICONS });

          } else {
              // User is not the admin of the group, deny access
              res.render('pages/error', {
                  errorMessage: 'You do not have access to group settings.',
                  errorCode: 403,
                  redirect: `/group?groupId=${groupId}`
              });
            
          }
      } else {
          // Group ID not found, handle error 
          res.render('pages/error', {
            errorMessage: 'Group not found.',
            errorCode: 404,
            redirect: `/home` 
        });
      }
  } else {
      // User is not logged in, handle authentication
      res.status(401).send('You need to login to access this page.');
  }
});


app.put('/edit_group/:groupId', async (req, res) => {
  const groupId = req.params.groupId;
  const { group_name } = req.body; 

  console.log(`Group ID: ${groupId}`);

  console.log(`Req.body:`);
  console.log(req.body);

  // Validate input data
  if (!group_name) {
    return res.status(400).json({ error: "Group name must be provided." });
  }

  try {
    // Check if the group exists
    const groupQuery = `
      SELECT * FROM groups WHERE group_id = $1;
    `;
    const group = await db.oneOrNone(groupQuery, groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }

    // Check if the current user is the admin of the group
    if (req.session.user.username !== group.admin_user) {
      return res.status(403).json({ error: "You are not authorized to edit this group." });
    }

    // Update group name
    const updateQuery = `
      UPDATE groups
      SET group_name = $1
      WHERE group_id = $2
      RETURNING *;
    `;
    const updatedGroup = await db.oneOrNone(updateQuery, [group_name, groupId]);

    if (!updatedGroup) {
      return res.status(404).json({ error: "Group not found." });
    }

    return res.status(200).json({ message: "Group name updated successfully.", group: updatedGroup });
  } catch (error) {
    console.error("Error updating group:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});


// -------------------------  Delete Group  ----------------------------------




app.delete('/delete_group', async (req, res) => {
  const groupId = req.query.groupId;

  // Validate groupId
  if (!groupId) {
    return res.status(400).json({ error: "groupId parameter is required." });
  }

  try {
    // Check if the group exists
    const groupQuery = `
      SELECT * FROM groups WHERE group_id = $1;
    `;
    const group = await db.oneOrNone(groupQuery, groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }

    // Check if the current user is the admin of the group
    if (req.session.user.username !== group.admin_user) {
      return res.status(403).json({ error: "You are not authorized to delete this group." });
    }

    // Delete related records in other tables
    await db.none('DELETE FROM users_to_groups WHERE group_id = $1', groupId);

    // Delete records from groups_to_portfolios table
    await db.none('DELETE FROM groups_to_portfolios WHERE group_id = $1', groupId);

    // Delete portfolios associated with the deleted group and their stocks
    const portfoliosQuery = `
      SELECT portfolio_id FROM groups_to_portfolios WHERE group_id = $1;
    `;
    const portfolios = await db.manyOrNone(portfoliosQuery, groupId);

    // Delete each portfolio and its associated stocks
    await Promise.all(portfolios.map(async (portfolio) => {
      await Promise.all([
        db.none('DELETE FROM portfolios_to_stocks WHERE portfolio_id = $1', portfolio.portfolio_id),
        db.none('DELETE FROM portfolios WHERE portfolio_id = $1', portfolio.portfolio_id)
      ]);
    }));

    // Finally, delete the group
    const deleteQuery = `
      DELETE FROM groups 
      WHERE group_id = $1
      RETURNING *;
    `;
    const deletedGroup = await db.oneOrNone(deleteQuery, groupId);

    if (!deletedGroup) {
      return res.status(404).json({ error: "Failed to delete the group." });
    }

    return res.status(200).json({ message: "Group deleted successfully."});
  } catch (error) {
    console.error("Error deleting group:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});




// -------------------------  Group  ----------------------------------



app.get('/group', async (req, res) => {
  try {
    // Get current user from session and groupId from params
    const currentUser = req.session.user;
    const groupId = req.query.groupId;



    // Verify the user belongs to the group and throw permission error if not
    const userInGroup = await db.oneOrNone('SELECT * FROM users_to_groups WHERE user_id = $1 AND group_id = $2', [currentUser.username, groupId]);
    if (!userInGroup) {
      res.render('pages/error', {
          errorMessage: 'You do not have access to group.',
          errorCode: 403,
          redirect: `/groups` 
      });
    }

    // Get group data
    const groupData = await db.oneOrNone('SELECT * FROM groups WHERE group_id = $1', [groupId]);

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


    // For each portfolio, use getPortfolioValue to retrieve currentValue and topStock.
    // Additionally, add alternating background color using THEME_COLORS
    const portfolioData = [];
    for (const portfolio of allPortfolios) {
      const { portfolioValue, topStock } = await getPortfolioValue(portfolio);
      const colorIndex = allPortfolios.indexOf(portfolio) % THEME_COLORS.length;
      const backgroundColor = THEME_COLORS[colorIndex].hex;
      portfolioData.push({ ...portfolio, portfolioValue, topStock, backgroundColor });
    }


    // Assign a rank to each portfolio based on currentValue. #1 should get the highest currentValue
    portfolioData.sort((a, b) => b.portfolioValue - a.portfolioValue);
    portfolioData.forEach((portfolio, index) => {
      portfolio.rank = index + 1;
    });


    // See if current user is admin user of the group. If true, pass
    const isAdmin = currentUser.username === portfolioData[0].user_id;


    // Once rankings are assigned, split portfolios into two: userPortfolio and otherPortfolios
    const [userPortfolio] = portfolioData.filter(portfolio => portfolio.user_id === currentUser.username);
    const otherPortfolios = portfolioData.filter(portfolio => portfolio.user_id !== currentUser.username);

    res.render('pages/group', { loggedIn: req.session.loggedIn, isAdmin, userPortfolio, otherPortfolios, groupData });
  } catch (error) {
    console.error('Error fetching group data:', error);
    res.status(500).send('Internal Server Error');
  }
});



// -------------------------  Portfolio  ----------------------------------



app.get('/portfolio', async (req, res) => {
  try {
    // Get user's current liquidity 
    const user = req.session.user;
    const portfolioId = req.query.portfolioId || req.session.portfolioId;

    // Get user data from users table based on session 
    const userData = await db.one('SELECT * FROM users WHERE username = $1', [user.username]);

    // Get portfolio where portfolio_id matches what's passed in req body
    const portfolioData = await db.one('SELECT * FROM portfolios WHERE portfolio_id = $1', [portfolioId]);

    // Determine if user matches the owner of the portfolio
    if (portfolioData.user_id !== userData.username) {
      res.render('pages/error', {
        errorMessage: 'You do not have access to portfolio.',
        errorCode: 403,
        redirect: `/groups` 
    });
    }

    // Fetch stock data from portfolios_to_stocks table for the specified portfolio
    const stockData = await db.manyOrNone('SELECT * FROM portfolios_to_stocks WHERE portfolio_id = $1', [portfolioId]);

    let currPortfolioValue = 0;

    // Calculate current value for each stock
    for (const stock of stockData) {
      // Get current price for the stock symbol

      const currentPrice = await getSymbolPrice(stock.stock_symbol);


      const currStockValue = currentPrice * stock.num_shares;

      currPortfolioValue += currStockValue;

      // Update current value for the stock in the stockData array
      stock.current_value = formatDollarAmount(currStockValue);
    }

    // Format current liquidity
    const currentLiquidity = formatDollarAmount(portfolioData.current_liquidity);

    // Pass information into the portfolio page
    res.render('pages/portfolio', { 
      loggedIn: req.session.loggedIn,
      currentLiquidity: currentLiquidity,
      userStocks: stockData,
      currPortfolioValue: formatDollarAmount(currPortfolioValue),
    });
  } catch (error) {
    console.error('Error retrieving portfolio data:', error);
    res.status(500);
  }
});



// -------------------------  Portfolio - Manage Assets  ----------------------------------



app.post('/buyStock', async (req, res) => {
  try {


    const { portfolioId, stockSymbol, numStocks } = req.body;
    const username = req.session.user.username;


    // Check if the portfolio belongs to the current user
    const portfolioOwner = await db.oneOrNone('SELECT user_id FROM portfolios WHERE portfolio_id = $1', [portfolioId]);
    if (!portfolioOwner || portfolioOwner.user_id !== username) {
      console.log('Unauthorized access to portfolio');
      return res.status(403).json({ message: "Unauthorized access to portfolio" });
    }

    // Fetch user's current liquidity from portfolios table
    const { current_liquidity } = await db.one('SELECT current_liquidity FROM portfolios WHERE portfolio_id = $1', [portfolioId]);

    // Call Finnhub API to get current price of the stock
    const currentPrice = await getSymbolPrice(stockSymbol);


    // Calculate the cost of purchasing the specified number of shares
    const purchaseCost = currentPrice * numStocks;

    // Check if user has enough liquidity for the purchase
    if (purchaseCost > current_liquidity) {
      return res.status(400).json({ message: "Insufficient funds for the purchase" });
    }

    // Deduct the purchase cost from user's current liquidity
    const newLiquidity = current_liquidity - purchaseCost;


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

    const { portfolioId, stockSymbol, numStocks } = req.body;
    const username = req.session.user.username;


    // Check if the portfolio belongs to the current user
    const portfolioOwner = await db.oneOrNone('SELECT user_id FROM portfolios WHERE portfolio_id = $1', [portfolioId]);
    if (!portfolioOwner || portfolioOwner.user_id !== username) {
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
    const currentPrice = await getSymbolPrice(stockSymbol);


    // Calculate the value of the sold stocks
    const saleValue = currentPrice * numStocks;


    // Add the sale value to user's current liquidity
    const newLiquidity = current_liquidity + saleValue;


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


    // Respond with status 200 for success
    res.status(200).json({ message: "Stock sold successfully" });

  } catch (error) {
    console.error('Error selling stock:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});





// -------------------------------------  API & Helper Functions  ----------------------------------------------

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

