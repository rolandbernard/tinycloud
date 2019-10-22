
const bcrypt = require("bcrypt");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");

const config = require("../config.js");

const db  = mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    namedPlaceholders: true,
    multipleStatements: true
});

const sql = {
    createdatabase: fs.readFileSync(path.join(__dirname, "./sql/createdatabase.sql"), "utf8").replace(/:databasename/g, config.db.database)
};

(async function () {
    db.promise().query(sql.createdatabase)
        .then(function () {
            console.log("Created database");
            process.exit(0);
        })
        .catch(function (error) {
            console.error(error.message);
            process.exit(1);
        });
}) ();
