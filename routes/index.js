var express = require('express');
var router = express.Router();

// Adding database variable from queries
var db = require('../queries');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* SHOW ALL USERS */
router.get('/api/getallusers', db.getAllUsers);

/* SHOW ALL BOOKS */
router.get('/api/getallbooks', db.getAllBooks);

/* ADD A BOOK */
router.post('/api/addbook', db.addBook);

/* ADD A USER */
router.post('/api/adduser', db.addUser);


module.exports = router;
