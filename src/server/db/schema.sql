DROP DATABASE IF EXISTS aliens;
CREATE DATABASE aliens;

\c aliens;

CREATE TABLE games (
 ID SERIAL PRIMARY KEY,
 name VARCHAR,
 status BOOLEAN
);

CREATE TABLE players (
 ID SERIAL PRIMARY KEY,
 handle VARCHAR,
 tagline VARCHAR,
 human BOOLEAN
 lat DECIMAL,
 lon DECIMAL,
 latStart DECIMAL,
 lonStart DECIMAL,
 latEnd DECIMAL,
 lonEnd DECIMAL,
 game_id INTEGER
);


INSERT INTO games (name, status) VALUES ('Test Game1',true);
