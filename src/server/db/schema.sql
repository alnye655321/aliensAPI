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

INSERT INTO players (handle, tagline, human,lat,lon,latStart,lonStart) VALUES ('alnye','my life for hire', false, 39.68214, -104.98421, 39.68214, -104.98421);
INSERT INTO players (handle, tagline, human,lat,lon,latStart,lonStart) VALUES ('bond','shakin not stirred', false, 39.69287, -104.95425, 39.69287, -104.95425);

-- update players set game_id = 2 where id = 1  or id =2;
