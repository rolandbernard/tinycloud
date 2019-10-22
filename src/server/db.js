
const mysql = require("mysql2");

const config = require("../config.js");

const pool  = mysql.createPool({
    connectionLimit: 10,
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    namedPlaceholders: true,
    multipleStatements: true
});

module.exports = pool;
