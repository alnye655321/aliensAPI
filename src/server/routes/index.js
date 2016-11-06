const express = require('express');
const router = express.Router();
const db = require('../db/connection');

const indexController = require('../controllers/index');

function checkLat(lat) {
	var latVal = parseFloat(lat);
  if (!isNaN(latVal) && latVal <= 90 && latVal >= -90) {
      return true;
    }
    else {
      return false;
    }
  }

function checkLon(lon) {
	var lonVal = parseFloat(lon);
if (!isNaN(lonVal) && lonVal <= 180 && lonVal >= -180) {
    return true;
  }
else {
    return false;
  }
}

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
  //create new host (human) player along with the new game
  const newPlayer = {
    handle: req.body.handle,
    tagline: req.body.tagline
  };
  db.any(`INSERT INTO games (name, status) VALUES('${newGame.name}', 'true')  returning id`)
  .then((result) => {
    var gameResponse = {}; // send back to client id of new game, and id of new host player
    gameResponse.gameId = result[0].id;
    db.any("INSERT INTO players(handle, tagline, game_id, human) values($1, $2, $3, $4) returning id", [newPlayer.handle, newPlayer.tagline, gameResponse.gameId, "true"])
      .then((result) => {
        gameResponse.playerId = result[0].id;
        res.json(gameResponse).status(200);
        })
      .catch((error) => {
        next(error);
      });
    })
  .catch((error) => {
    next(error);
  });
});

//human running continiously ---------------------------------------------------
//http://0.0.0.0:3000/update/human
router.post('/update/human', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  var responseMsg = {};

  const humanUpdate = {
    id: req.body.id,
    lat: req.body.lat,
    lon: req.body.lon,
    checkStart: req.body.checkStart,
    gameId: req.body.gameId
  };

  //validate gps coordinates
  if ( checkLat(humanUpdate.lat) === false || checkLon(humanUpdate.lon) === false ) {
    res.json({
      status: 'error',
      message: 'Those GPS coordinates are invalid'
    }).status(404);
  }
  //end validate gps coordinates
  else { //run updates after error checking
    if (humanUpdate.checkStart === "true") { // run this once for initial starting position
      db.tx(t=> {
          return t.batch([
              t.any("UPDATE players SET latStart = $1 WHERE id = $2", [humanUpdate.lat, humanUpdate.id]),
              t.any("UPDATE players SET lonStart = $1 WHERE id = $2", [humanUpdate.lon, humanUpdate.id])
          ]);
        })
      .then(result=> {
        if (!result.length) {
          res.status(404).send({
            status: 'error',
            message: 'That player doesn\'t exist'
          });
        } else {
          responseMsg.startStatus = 'complete'; // will listen in app for sucess, then start passing checkStart = false;
        }
      })
      .catch((error) => {
        next(error);
      });
    } // end initial starting postion

    db.tx(t=> { // run this every time
        return t.batch([
            t.any("UPDATE players SET lat = $1 WHERE id = $2", [humanUpdate.lat, humanUpdate.id]),
            t.any("UPDATE players SET lon = $1 WHERE id = $2", [humanUpdate.lon, humanUpdate.id])
        ]);
      })
    .then(result=> {
      if (!result.length) {
        res.status(404).send({
          status: 'error',
          message: 'That player doesn\'t exist'
        });
      }
      else {
        responseMsg.updateStatus = 'complete';

        db.any("SELECT * FROM players WHERE game_id = $1 AND human = false", [humanUpdate.gameId])
        .then((results) => {
          console.log(results);
          responseMsg.aliens = results;
          res.json(responseMsg).status(200);
        })
        .catch((error) => {
          next(error);
        });
      }
    })
    .catch((error) => {
      next(error);
    });
  } //end run updates after error checking
});//end human running continiously --------------------------------------------




module.exports = router;
