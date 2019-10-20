
const bcrypt = require("bcrypt");
const sharp = require("sharp");
const fs = require("fs");

const db = require("../server/db.js");
const config = require("../server/config.js");

main();

async function main() {
    let username = null;
    let password = null;
    let avatarfile = null;

    const args = process.argv.slice(2).reduce(function (a, e) {
        if (a.length > 0 &&
            (a[a.length - 1] === "-u" ||
                a[a.length - 1] === "-p" ||
                a[a.length - 1] === "-a")) {
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
            } else if (arg[0] === "-a") {
                if (avatarfile !== null) {
                    console.error("Duplicate option '" + arg[0] + "'");
                    process.exit(1);
                }
                avatarfile = arg[1];
            }
        }
    });

    if (password === null) {
        password = "";
    }

    let avatar = null;
    const passwordhash = await bcrypt.hash(password, config.saltrounds);

    if (avatarfile !== null) {
        avatar = await sharp(fs.readFileSync(avatarfile)).resize(128).png().toBuffer();
    }

    db.promise().execute("INSERT INTO users(uid, uusername, upasswdhash, uavatar) VALUES (UUID_TO_BIN(UUID()), ?, ?, ?);", [username, passwordhash, avatar])
    .then(function () {
        console.log("Added user");
        process.exit(0);
    })
    .catch(function (error) {
        console.error(error.message);
        process.exit(1);
    });
}