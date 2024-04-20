-- Insert a new user (password hashes to examplepassword)
-- DO NOT DELETE: THIS IS USED IN UNIT TEST!!!!!
INSERT INTO users(username, password)
VALUES ('exampleuser', '$2a$10$Fb5oD61P4mzgC8UXi.oUYOtOyWal7DmLHuXKPasscfAp71hRIJUK.') RETURNING username;


-- Insert a new group
INSERT INTO groups (admin_user, group_name, starting_liquidity, icon_num, group_code)
VALUES ('grace', 'examplegroup', 100000, 1, 'AD65TH');

-- Insert a new portfolio for the user
INSERT INTO portfolios (user_id, current_liquidity)
VALUES ('grace', 50000);

-- Insert two new stocks
INSERT INTO stocks (stock_symbol)
VALUES ('AAPL');
INSERT INTO stocks (stock_symbol)
VALUES ('TSLA');

-- Link the user to the group
INSERT INTO users_to_groups (user_id, group_id)
VALUES ('grace', 1);

-- Link the group to the portfolio
INSERT INTO groups_to_portfolios (group_id, portfolio_id)
VALUES (1, 1);

-- Link the portfolio to the two stocks
INSERT INTO portfolios_to_stocks (portfolio_id, stock_id, num_shares)
VALUES (1, 1,100);
INSERT INTO portfolios_to_stocks (portfolio_id, stock_id, num_shares)
VALUES (1, 2,50);