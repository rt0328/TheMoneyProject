DROP TABLE IF EXISTS users;
CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(60) NOT NULL,
    money FLOAT
);

-- DROP TABLE IF EXISTS stocks;

-- CREATE TABLE stocks (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(100),
--     symbol VARCHAR(10) NOT NULL,
--     price FLOAT
-- );

DROP TABLE IF EXISTS users_to_stocks;

CREATE TABLE users_to_stocks(
    user_id VARCHAR(50) NOT NULL,
    stock_symbol VARCHAR(5) NOT NULL,
    num_shares INT
);
