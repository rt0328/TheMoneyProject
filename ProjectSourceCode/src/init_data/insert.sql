-- Insert a new group
INSERT INTO groups (admin_user, starting_liquidity, icon_num)
VALUES ('grace', 100000, 1);

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
VALUES ('exampleuser', 1);

-- Link the group to the portfolio
INSERT INTO groups_to_portfolios (group_id, portfolio_id)
VALUES (1, 1);

-- Link the portfolio to the two stocks
INSERT INTO portfolios_to_stocks (portfolio_id, stock_id, num_shares)
VALUES (1, 1,100);
INSERT INTO portfolios_to_stocks (portfolio_id, stock_id, num_shares)
VALUES (1, 2,50);