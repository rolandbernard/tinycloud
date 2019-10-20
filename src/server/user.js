
const path = require("path");
const express = require("express");
const bcrypt = require("bcrypt");

const config = require("./config.js");
const db = require("./db.js");

const app = express();

app.get("/:username/avatar", async function (req, res) {
    try {
        const [rows, fields] = await db.promise().execute("SELECT u.uavatar avatar FROM users u WHERE u.uusername = :username;", { username: req.params.username });
        if (rows.length === 0) {
            res.status(404).end();
        } else {
            res.status(200);
            if (rows[0].avatar === null) {
                res.setHeader("Content-Type", "image/png");
                res.sendFile(path.join(__dirname, "../public/avatarplaceholder.png"));
            } else {
                res.setHeader("Content-Type", "image/png");
                res.send(rows[0].avatar);
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).end();
    }
});

app.post("/avatar", async function (req, res) {
    if (req.token !== undefined) {
        if (req.files !== undefined) {

        } else {
            res.status(400).end();
        }
    } else {
        res.status(401).end();
    }
});

app.post("/password", async function (req, res) {
    if (req.token !== undefined) {
        if (typeof (req.body.password) === "string") {
            try {
                const passwordhash = await bcrypt.hash(req.body.password, config.saltrounds);
                await db.promise().execute("UPDATE users u SET u.upasswdhash = :passwordhash WHERE u.uid = UUID_TO_BIN(:useruuid);", { passwordhash: passwordhash, useruuid: req.token.uuid });
                res.status(200).end();
            } catch (err) {
                console.error(err);
                res.status(500).end();
            }
        } else {
            res.status(400).end();
        }
    } else {
        res.status(401).end();
    }
});

app.get("/:username", async function (req, res) {
    try {
        const [rows, fields] = await db.promise().execute("SELECT * FROM users u WHERE u.uusername = :username;", { username: req.params.username });
        if (rows.length === 0) {
            res.status(404).end();
        } else {
            res.status(302).end();
        }
    } catch (err) {
        console.error(err);
        res.status(500).end();
    }
});

module.exports = app;
