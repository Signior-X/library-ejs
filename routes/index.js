var express = require('express');
var router = express.Router();

// Adding database variable from queries
var db = require('../queries');

/* GET home page. */
router.get('/', function (req, res, next) {
  if(req.session.userid){
    res.status(200);
    res.render('index.ejs', {title: 'Home', name: req.session.name});
  } else{
    res.redirect('/login');
  }

})
/* REST APIs */
/* SHOW ALL USERS */
router.get('/api/getallusers', db.getAllUsers);

/* SHOW ALL BOOKS */
router.get('/api/getallbooks', db.getAllBooks);

/* GET Add a Book page */
router.get('/addbook', function(req, res, next){
  if(req.session.userid){
    res.render('addbook.ejs', {title: 'Add Book', flashMessage: '', name: req.session.name});
  }
  else{
    res.redirect('/login');
  }
})

/* POST Add a Book*/
router.post('/addbook', db.addBook);

/* ADD A USER */
router.post('/api/adduser', db.addUser);
/* End of REST APis */

/* GET Login Page */
router.get('/login', function(req, res, next){
  // first checking if the user is not logged in
  if(req.session.userid){
    res.redirect('/');
  }
  res.render('login.ejs', { title: 'Login', flashMessage: null});
});

/* POST for Login Page */
router.post('/login', db.checkLogin);

/* GET register page */
router.get('/register', function(req, res, next){
  if(req.session.userid){
    res.redirect('/');
  }
  res.render('register.ejs', {title: 'Register', flashMessage: null});
});

/* POST register page */
router.post('/register', db.registerUser);

/* Logout */
router.get('/logout', function(req, res, next){
  
  req.session = null;
  console.log("session cleared");
  res.redirect('/login');
});

/* Dummy url for testing */
router.get('/check', function(req, res, next){
    req.session.userid="test";
    res.end("Done");
});

module.exports = router;
