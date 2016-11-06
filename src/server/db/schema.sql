DROP DATABASE IF EXISTS aliens;
CREATE DATABASE aliens;

\c aliens;

CREATE TABLE games (
 id SERIAL PRIMARY KEY,
 name VARCHAR,
 status BOOLEAN,
 gametime INTEGER,
 players INTEGER,
 location VARCHAR,
 latStart double precision,
 lonStart double precision
);

CREATE TABLE players (
 id SERIAL PRIMARY KEY,
 handle VARCHAR,
 tagline VARCHAR,
 human BOOLEAN,
 lat double precision,
 lon double precision,
 latStart double precision,
 lonStart double precision,
 latEnd double precision,
 lonEnd double precision,
 game_id INTEGER
);

INSERT INTO games (name, status) VALUES ('Test Game1',true);
