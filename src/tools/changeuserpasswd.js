
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
    database: config.db.database,
    namedPlaceholders: true,
    multipleStatements: true
});

const sql = {
    updateuserpasswdhash: fs.readFileSync(path.join(__dirname, "./sql/updateuserpasswdhash.sql"), "utf8")
};

(async function () {
    let username = null;
    let password = null;

    const args = process.argv.slice(2).reduce(function (a, e) {
        if (a.length > 0 &&
            (a[a.length - 1] === "-u" ||
                a[a.length - 1] === "-p")) {
            a[a.length - 1] = [a[a.length - 1], e];
        } else {
            a.push(e);
        }
        return a;
    }, []);

    args.forEach(function (arg) {
        if (typeof (arg) === "string") {
            console.error("Unknown option '" + arg + "'");
            process.exit(1);
        } else {
            if (arg[0] === "-u") {
                if (username !== null) {
                    console.error("Duplicate option '" + arg[0] + "'");
                    process.exit(1);
                }
                username = arg[1];
            } else if (arg[0] === "-p") {
                if (password !== null) {
                    console.error("Duplicate option '" + arg[0] + "'");
                    process.exit(1);
                }
                password = arg[1];
            }
        }
    });

    if (password === null) {
        password = "";
    }

    const passwordhash = await bcrypt.hash(password, config.saltrounds);

    db.promise().query(sql.updateuserpasswdhash, { username: username, passwordhash: passwordhash })
        .then(function () {
            console.log("Password updated");
            process.exit(0);
        })
        .catch(function (error) {
            console.error(error.message);
            process.exit(1);
        });
}) ();
