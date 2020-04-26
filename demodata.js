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

/**
 * Function to add data
 * @param {JSON} jsondata 
 * @param {String} tablename
 * @param {String} ret (must give this or else error) 
 * It will return what you asked for in ret else 0 in case of error
 */
function addData(jsondata, tablename, ret){
    
    db.one(create_insert_statement(jsondata, tablename)+' returning '+ret)
    .then(data => {
        console.log("Add success",data[ret]);
        //print done
    })
    .catch(error => {
        console.log(error);
        // print error;
    });
    return("done"); // print new user id;
}

userdata1 = {
    'name':'priyam',
    'email':'sethpriyam1@gmail.com',
    'password':'test',
    'isadmin':true
}
console.log(addData(userdata1, 'users', 'userid'));

userdata2 = {
    'name':'test',
    'email':'test@students.iitmandi.ac.in',
    'password':'test',
    'isadmin':false
}

userdata3 = {
    'name':'Priyam',
    'email':'seth',
    'password':'test',
    'isadmin':true
}


console.log(addData(userdata3, 'users', 'userid'));

book1 = {
    'name':'sherlock homes',
    'description':'A detective story',
    'genre':'detective',
    'total':9,
    'nissued':0,
    'dateadded':'2020-04-22'
}
console.log(addData(book1, 'books', 'id'));

book2 = {
    'name':'The White Tiger',
    'author':'Arnav Adlinge',
    'genre':'story',
    'total':2,
    'nissued':0,
    'dateadded':'2020-04-22'
}
console.log(addData(book2, 'books', 'id'));

book3 = {
    'name':'Steve Jobs',
    'description':'Apple',
    'genre':'biography',
    'total':7,
    'nissued':0,
    'dateadded':'2020-04-22'
}
console.log(addData(book3, 'books', 'id'));

book4 = {
    'name':'Harry Potter',
    'genre':'story',
    'total':3,
    'nissued':0,
    'dateadded':'2020-04-22'
}
console.log(addData(book4, 'books', 'id'));

book5 = {
    'name':'Whatever',
    'author':'priyam',
    'genre': 'biography',
    'total':8,
    'nissued':0,
    'dateadded':'2020-04-26'
}

console.log(addData(book5, 'books', 'id'));
