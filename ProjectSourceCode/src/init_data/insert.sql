-- Insert a new user (password hashes to examplepassword)
-- DO NOT DELETE: THIS IS USED IN UNIT TEST!!!!!
INSERT INTO users(username, password)
VALUES
('user1', '$2a$10$Fb5oD61P4mzgC8UXi.oUYOtOyWal7DmLHuXKPasscfAp71hRIJUK.'),
('user2','$2a$10$Fb5oD61P4mzgC8UXi.oUYOtOyWal7DmLHuXKPasscfAp71hRIJUK.') RETURNING username;


-- Insert a new group
INSERT INTO groups (admin_user, group_name, starting_liquidity, icon_num, group_code)
VALUES ('grace', 'examplegroup', 100000, 1, 'AD65TH');

-- Insert portfolios
INSERT INTO portfolios (user_id, current_liquidity) VALUES
('user1', 10000),
('user2', 15000);

-- Insert groups
INSERT INTO groups (group_name, admin_user, starting_liquidity, icon_num, group_code) VALUES
('Group A', 'user1', 20000, 1, 'ABC123'),
('Group B', 'user2', 25000, 2, 'XYZ456');

-- Insert users_to_groups
INSERT INTO users_to_groups (user_id, group_id) VALUES
('user1', 1),
('user2', 1),
('user2', 2);

-- Insert groups_to_portfolios
INSERT INTO groups_to_portfolios (group_id, portfolio_id) VALUES
(1, 1),
(2, 2);

-- Insert portfolios_to_stocks
INSERT INTO portfolios_to_stocks (portfolio_id, stock_symbol, num_shares) VALUES
(1, 'AAPL', 10),
(1, 'GOOGL', 5),
(2, 'MSFT', 8),
(2, 'AMZN', 3);
