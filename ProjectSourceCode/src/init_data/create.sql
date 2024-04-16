DROP TABLE IF EXISTS users;
CREATE TABLE users (
  username VARCHAR(50) PRIMARY KEY,
  password VARCHAR(60) NOT NULL
);


DROP TABLE IF EXISTS portfolios;
CREATE TABLE portfolios (
    portfolio_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    current_liquidity INT NOT NULL
);


DROP TABLE IF EXISTS stocks;
CREATE TABLE stocks (
    stock_id SERIAL PRIMARY KEY,
    stock_symbol VARCHAR(5) NOT NULL,
);

DROP TABLE IF EXISTS groups;
CREATE TABLE groups (
    group_id SERIAL PRIMARY KEY,
    group_name VARCHAR(50) NOT NULL,
    admin_user VARCHAR(50) NOT NULL,
    starting_liquidity INT NOT NULL,
    icon_num INT,
    group_code INT
);

DROP TABLE IF EXISTS users_to_groups;
CREATE TABLE users_to_groups (
    user_id VARCHAR(50) NOT NULL,
    group_id INT NOT NULL
);

DROP TABLE IF EXISTS groups_to_portfolios;
CREATE TABLE groups_to_portfolios (
    group_id INT NOT NULL,
    portfolio_id INT NOT NULL
);

DROP TABLE IF EXISTS portfolios_to_stocks;
CREATE TABLE portfolios_to_stocks(
    portfolio_id INT NOT NULL,
    stock_id INT NOT NULL,
    num_shares INT NOT NULL
);


