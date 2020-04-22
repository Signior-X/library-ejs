// Importing packages
var pgp = require('pg-promise')(/* options */);
var dotenv = require('dotenv')

dotenv.config(); // .env done

db = pgp(process.env.DATABASE_URL)  // creating the connection


console.log("Start of Table1");
/**
 * Creating Table books
 * id - serial primary key To identify the book
 * name - Name of the book
 * description - Description of the book
 * author - The name of the author
 * genre - The type of book
 * total - How many are there total this book in the library
 * nissued - Number of how many are currently issued
 * dateadded - date on which book was added in the library
 */
var table1 = "CREATE TABLE books(id serial primary key, name varchar(100) not null, description varchar(600), author varchar(30), genre varchar(20), total int, nissued int, dateadded date)"
db.none(table1)
    .then(data => {
        console.log("Successfully created table books");
    })
    .catch(error => {
        console.log("Error",error);
    });


console.log("Start Table 2")
/**
 * Creating Table users
 * userid - serial primary key To identify the user
 * email - used in login
 * password - used in login
 * name - Name of the user
 * isadmin - (boolean) Wheather he is librarian or admin (Write now considering both as same)
 */
var table2 = "CREATE TABLE users(userid serial primary key, email varchar(100) unique, password varchar(256), name varchar(30), isadmin boolean)"
db.none(table2)
    .then(data => {
        console.log("Successfully created table users");
    })
    .catch(error => {
        console.log("Error",error);
    });


console.log("Start Table 3")
/**
 * Creating Table bookissues - For having track of the books currently issued
 * bookid - The id of the book issued (DEPENDS ON books table)
 * userid - The user who has issued the book (DEPENDS ON users table)
 * dateissued - Date on which the book was issued
 */
var table3= "CREATE TABLE bookissues(bookid int REFERENCES books(id), userid int REFERENCES users(userid), dateissued date)"

function fun3(){
    db.none(table3)
    .then(data => {
        console.log("Successfully created table bookissues");
    })
    .catch(error => {
        console.log("Error");
    });
}
// Giving delay of 2 seconds for execution of creation of this tables
setTimeout(fun3, 2000);  // Important, so that first the above tables are created before!

console.log("Done creating Tables");


/**
 * How are Tables dependent on each other
 * bookissues -> users, and books (Foreign key constraint)
 */

 // It is giving error, always working like all at the same time, which we don't want
 // So research for tomorrow how can I do it
 // Write now giving time delay has solved the issue
 