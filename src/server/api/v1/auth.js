
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../../db.js");
const config = require("../../../config.js");

const app = express();

app.middle = async function (req, res, next) {
    const header = req.headers.authorization;
    if (header !== undefined) {
        const bearer = header.split(' ');
        const token = bearer[1];
        try {
            const decoded = jwt.verify(token, config.keys.public, { algorithms: ["ES384"] });
            const [rows, fields] = await db.promise().query("SELECT * FROM users u WHERE u.uid = UUID_TO_BIN(:useruuid);", { useruuid: decoded.uuid });
            if (decoded.forauth === true && rows.length === 1) {
                req.token = decoded;
            }
        } catch (err) { }
    }
    next();
};

app.post("/gettoken", async function (req, res) {
    let uuid;
    let success = false;
    if (typeof (req.body.username) === "string" && typeof (req.body.password) === "string") {
        try {
            const [rows, fields] = await db.promise().query("SELECT u.upasswdhash hash, BIN_TO_UUID(u.uid) uuid FROM users u WHERE u.uusername = :username", { username: req.body.username });
            if (rows.length === 1) {
                success = await bcrypt.compare(req.body.password, rows[0].hash);
                uuid = rows[0].uuid;
            }
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    }
    if (success) {
        const object = {
            forauth: true,
            uuid: uuid,
            username: req.body.username
        };
        try {
            const token = jwt.sign(object, config.keys.private, { algorithm: "ES384", expiresIn: 60 * 60 * 24 });
            res.status(200);
            res.json({ token: token });
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    } else {
        res.status(401).end();
    }
});

app.post("/download", function (req, res) {
    if (req.token !== undefined) {
        if (typeof (req.body.downloaduuid) === "string") {
            const object = {
                uuid: req.token.uuid,
                username: req.token.username,
                downloaduuid: req.body.downloaduuid
            };
            try {
                const token = jwt.sign(object, config.keys.private, { algorithm: "ES384", expiresIn: 60 * 60 * 24 });
                res.status(200);
                res.json({ token: token });
            } catch (err) {
                res.status(401).end();
            }
        } else {
            res.status(400).end();
        }
    } else {
        res.status(401).end();
    }
});

app.get("/test", function (req, res) {
    if (req.token !== undefined) {
        res.status(200).end();
    } else {
        res.status(401).end();
    }
});


module.exports = app;