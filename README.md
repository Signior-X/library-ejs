# Library Management
A simple website to manage books and users

# Tech Stack
-> Nodejs
-> Postgresql
-> Expressjs with ejs template

# Start The Server
To run the server in dubugging mode:
```
nodemon
```
To simply start the server,
```
npm start
```

# !Important Environment
To test and run, you need .env file also

So, create a .env file in the root folder
Add your local postgresql database url
DATABASE_URL=user:password@host:port/database

# To create models 
Endure that postgresql is installed
Make changes to .env

To create Tables,
```
node modes.js
```

To add dummy deta in the database
```
node demodata.js
```

# REST APIs
The are currently working and can take form or json data to work
