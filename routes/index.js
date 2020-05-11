var express = require('express');
var router = express.Router();

// Adding database variable from queries
var db = require('../queries');

/* GET home page. */
router.get('/', function (req, res, next) {
  if(req.session.userid){
    res.status(200);
    res.render('index.ejs', {title: 'Home', name: req.session.name, isadmin: req.session.isadmin });
  } else{
    res.redirect('/login');
  }

})
/* REST APIs */
/* SHOW ALL USERS */
router.get('/api/getallusers', db.getAllUsers);

/* GET Add a Book page */
router.get('/books/add', function(req, res, next){
  if(req.session.userid){
    res.render('addbook.ejs', {title: 'Add Book', flashMessage: '', name: req.session.name});
  }
  else{
    res.redirect('/login');
  }
})

/* POST Add a Book*/
router.post('/books/add', db.addBook);

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

/* View All the Books */
router.get('/books', db.viewBooks);

/* Remove */
router.get('/books/:id/remove', db.removeBook);

router.get('/books/:id/update', db.updateBookForm);

router.post('/books/:id/update', db.updateBook);

router.get('/books/:id/', db.viewABook)

/* View users */
router.get('/users', db.viewUsers);

/* View students */
router.get('/students', db.viewStudents);

/* View me - session variables */
router.get('/me', function(req, res, next){
  var name = req.session.name;
  var email = req.session.email;
  var userid = req.session.userid;
  var isadmin = (req.session.isadmin)?"Admin":"Student";
  res.render('me.ejs', { title: 'Me', name: name, data: {name: name, email:email, userid: userid, isadmin: isadmin} });
});

module.exports = router;
