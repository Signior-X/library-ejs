var dotenv =  require('dotenv');
var pgp = require('pg-promise')(/* options */);  // From express documentation

// Loading dotenv
dotenv.config();

// Database ones
db = pgp(process.env.DATABASE_URL)

/**
 * Function to create insert statement from json data
 * @param {JSON DATA} data 
 * @param {String} tablename 
 */
function create_insert_statement(jsondata, tablename){
    var stmt = "";
    stmt = "INSERT INTO "+tablename+"";
    var col="(";
    var val="(";

    Object.keys(jsondata).forEach(function(key){
        //console.log(key)
        col+=('"'+key+'",');
        //console.log(data[key])
        val+=("'"+jsondata[key]+"',");
    });
    col = (col.substring(0,col.length-1)+")");
    val = (val.substring(0,val.length-1)+")");
    stmt+=(col+" VALUES"+val);
    return(stmt);
}

//Add Query Functions

/* Function to get details of all users */
function getAllUsers(req, res, next){
    db.any('select userid, name, email from users')
    .then(function(data){
        res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL Users'
        });
    })
    .catch(function (err) {
        return next(err);
      });
}

/* Function to get all the details of all the books */
function getAllBooks(req, res, next){
    db.any('select * from books')
    .then(function(data){
        res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL Books'
        });
    })
    .catch(function (err) {
        return next(err);
      });
}

/* Funciton to add a book */
function addBook(req, res, next){
    reqbody = req.body;
    if('name' in reqbody){
        stmt = create_insert_statement(reqbody, 'books');
        db.one(stmt+' returning id')
        .then(function(data){
            res.status(200)
            .json({
                status: 'success',
                id: data['id'],
                message: 'Successfully added the book'
            });
        })
        .catch(err =>{
            return next(err);
        });
    } else{  // Some constraints of the function
        res.end('"name" not supplied in method body');
    }
}

/* Function to add a user */
function addUser(req, res, next){
    reqbody = req.body;
    reqbody['isadmin']=false
    stmt = create_insert_statement(reqbody, 'users');
    db.one(stmt + ' returning userid')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    id: data['userid'],
                    message: 'Successfully added the user'
                });
        })
        .catch(err => {
            return next(err);
        });
}

module.exports = {
    getAllUsers: getAllUsers,
    getAllBooks: getAllBooks,
    addBook: addBook,
    addUser: addUser
};
