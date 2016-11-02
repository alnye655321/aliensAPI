const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', (req, res, next) => {
  const renderObject = {};
  renderObject.title = 'Books';
  db.any('SELECT * FROM books')
  .then((results) => {
    renderObject.books = results;
    //res.render('books.html', renderObject);
  })
  .catch((error) => {
    next(error);
  });

  db.any('SELECT * from authors JOIN books_authors on authors.id = books_authors.author_id')
  .then((results) => {
    renderObject.joins = results;
    res.render('books.html', renderObject);
  })
  .catch((error) => {
    next(error);
  });
});

router.get('/new', (req, res, next) => {
  db.any('SELECT last_name, first_name FROM authors')
  .then((results) => {
    const renderObject = {};
    renderObject.author = results;
    res.render('newbook.html', renderObject);
  })
  .catch((error) => {
    next(error);
  });
});

router.get('/:id', (req, res, next) => {
  const booksID = parseInt(req.params.id);
  db.any(`SELECT * FROM books WHERE id = ${booksID}`)
    .then((result) => {
      if (result.length) {
        res.send(result[0]);
      } else {
        res.status(404).send({
          status: 'error',
          message: 'That book doesn\'t exist'
        });
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/searchTitle', (req, res, next) => {
  const searchTitle = req.body.searchTitle
  db.any(`SELECT * FROM books WHERE title like '%$1#%'`, searchTitle)
    .then((results) => {
      if (results.length) {
        const renderObject = {};
        renderObject.books = results;
        res.render('books.html', renderObject);
      } else {
        res.status(404).send({
          status: 'error',
          message: 'That book doesn\'t exist'
        });
      }
    })
    .catch((error) => {
      next(error);
    });
});

// http POST localhost:3000/api/v1/books/ title=Alex genre=Nye cover=nothing description=horrid last_name=Nye
router.post('/', (req, res, next) => {
  const newBook = {
    title: req.body.title,
    genre: req.body.genre,
    cover: req.body.cover,
    description: req.body.description,
    last_name: req.body.last_name
  };
  //--------------
  db.any(`INSERT INTO books (title, genre, cover, description) VALUES('${newBook.title}', '${newBook.genre}', '${newBook.cover}', '${newBook.description}')`)
  .then((result) => {
    //res.send('You added a book!');
  })
  .catch((error) => {
    next(error);
  });
  //-----------------
  db.task(t=> { //add new record to join table after book addition
      return t.one('SELECT id FROM authors WHERE last_name = $1', newBook.last_name)
          .then(author => {
              return t.any('INSERT INTO books_authors (author_id, book_id) VALUES ($1,(SELECT MAX(id) FROM books))', author.id);
            });
    })
      .then(events=> {
          // success
          res.send('You added a book!');
        })
      .catch(error=> {
          // error
          next(error);
        });
});

//http --json PUT http://immense-mountain-80924.herokuapp.com/api/v1/books/21 title=Alec genre=somethinCool cover=somethinCool description=notWorthit
router.put('/:id', (req, res, next) => {
  const bookID = parseInt(req.params.id);
  const updateBook = {
    title: req.body.title,
    genre: req.body.genre,
    cover: req.body.cover,
    description: req.body.description
  };

  db.tx(t=> {
          return t.batch([
              t.any(`UPDATE books SET title = '${updateBook.title}' WHERE id = ${bookID}`, [true]),
              t.any(`UPDATE books SET genre = '${updateBook.genre}' WHERE id = ${bookID}`, [true]),
              t.any(`UPDATE books SET cover = '${updateBook.cover}' WHERE id = ${bookID}`, [true]),
              t.any(`UPDATE books SET description = '${updateBook.description}' WHERE id = ${bookID}`, [true])
          ]);
      })
      .then(result=> {
        if (!result.length) {
          res.status(404).send({
            status: 'error',
            message: 'That book doesn\'t exist'
          });
        } else {
          res.send('You updated a book!');
        }
      })
      .catch((error) => {
        next(error);
      });
    });

router.delete('/:id', function (req, res, next) {
  const bookID = parseInt(req.params.id);
  db.any(`DELETE FROM books WHERE id = ${bookID}`, [true])
   .then(function (data) {
        console.log(data);
        res.send(data);
      })
   .catch(function (error) {
    next(error);
  });
});

module.exports = router;
