-- Insert a new user (password hashes to examplepassword)
INSERT INTO users(username, password)
VALUES ('exampleuser', '$2a$10$Fb5oD61P4mzgC8UXi.oUYOtOyWal7DmLHuXKPasscfAp71hRIJUK.') RETURNING username;

-- Insert a new group
INSERT INTO groups (admin_user, starting_liquidity, icon_num, group_code)
VALUES ('exampleuser', 100000, 1, 5);

-- Insert a new portfolio for the user
INSERT INTO portfolios (user_id, current_liquidity)
VALUES ('exampleuser', 50000);

-- Insert two new stocks
INSERT INTO stocks (stock_symbol, num_shares)
VALUES ('AAPL', 100);
INSERT INTO stocks (stock_symbol, num_shares)
VALUES ('TSLA', 50);

-- Link the user to the group
INSERT INTO users_to_groups (user_id, group_id)
VALUES ('exampleuser', 1);

-- Link the group to the portfolio
INSERT INTO groups_to_portfolios (group_id, portfolio_id)
VALUES (1, 1);

-- Link the portfolio to the two stocks
INSERT INTO portfolios_to_stocks (portfolio_id, stock_id)
VALUES (1, 1);
INSERT INTO portfolios_to_stocks (portfolio_id, stock_id)
VALUES (1, 2);