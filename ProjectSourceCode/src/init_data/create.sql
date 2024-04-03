DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY ,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(60) NOT NULL,
    money FLOAT,
);

DROP TABLE IF EXISTS stocks;

CREATE TABLE stocks (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    name VARCHAR(100),
    symbol VARCHAR(10) NOT NULL,
    price FLOAT,
);

DROP TABLE IF EXISTS users_to_stocks;

CREATE TABLE users_to_stocks(
    user_id INT NOT NULL,
    stock_id INT NOT NULL,
    bought_price FLOAT,
    qty INT,
);
