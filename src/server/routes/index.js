const express = require('express');
const router = express.Router();
const db = require('../db/connection');

const indexController = require('../controllers/index');

router.get('/', function (req, res, next) {
  const renderObject = {};
  renderObject.title = 'Welcome to Express!';
  indexController.sum(1, 2, (error, results) => {
    if (error) return next(error);
    if (results) {
      renderObject.sum = results;
      res.render('index', renderObject);
    }
  });
});


router.get('/test', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  const renderObject = {};
  renderObject.title = 'Games';
  db.any('SELECT * FROM games')
  .then((results) => {
    renderObject.authors = results;
    //res.render('authors.html', renderObject);
    res.json(renderObject).status(200);
  })
  .catch((error) => {
    next(error);
  });
});
//http -f POST http://node.nyedigital.com/game name=test
router.post('/game', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  const newGame = {
    name: req.body.name
  };
  const newPlayer = {
    handle: req.body.handle,
    tagline: req.body.tagline
  };
  db.any(`INSERT INTO games (name, status) VALUES('${newGame.name}', 'true')  returning id`)
  .then((result) => {
    var gameId = result[0].anonymous.id;
    console.log(result[0].anonymous);
    db.any("INSERT INTO players(handle, tagline, game_id) values($1, $2, $3) returning id", [newPlayer.handle, newPlayer.tagline, gameId])
      .then((result) => {
        res.json(result).status(200);
        })
      .catch((error) => {
        next(error);
      });
    })
  .catch((error) => {
    next(error);
  });
});

router.post('/player', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  const newGame = {
    name: req.body.name
  };
  db.any(`INSERT INTO games (handle, tagline, human, latStart, lonS) VALUES('${newGame.name}', 'true')`)
  .then((result) => {
    res.json(result).status(200);
    })
  .catch((error) => {
    next(error);
  });
});


module.exports = router;
