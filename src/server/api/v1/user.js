
const path = require("path");
const express = require("express");
const bcrypt = require("bcrypt");
const sharp = require("sharp");

const config = require("../../../config.js");
const db = require("../../db.js");
const sql = require("./sql.js");

const app = express();

function send_data(req, res, data) {
    res.setHeader("Accept-Ranges", "bytes");
    const range = req.range(data.length);
    if(range !== undefined && range.type === "bytes" && range.length === 1) /* Only accept one range */ {
        res.status(206);
        res.setHeader("Content-Range", range[0].start.toString() + "-" + range[0].end.toString() + "/" + data.length);
        res.send(data.slice(range[0].start, range[0].end+1));
    } else {
        res.send(data);
    }
}

app.get("/:username/avatar", async function (req, res) {
    try {
        const [rows, fields] = await db.promise().query(sql.getuseravatar, { username: req.params.username });
        if (rows.length === 0) {
            res.status(404).end();
        } else {
            res.status(200);
            if (rows[0].avatar === null) {
                res.setHeader("Content-Type", "image/png");
                res.sendFile(path.join(__dirname, "../../../public/avatarplaceholder.png"));
            } else {
                res.setHeader("Content-Type", "image/png");
                send_data(req, res, rows[0].avatar);
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
            try {
                const avatar = await sharp(req.files.file.data).resize(128, 128, {
                    fit: "contain",
                }).png({
                    compressionLevel: 9,
                }).toBuffer();
                try {
                    await db.promise().query(sql.updateuseravatar, { avatar: avatar, useruuid: req.token.uuid });
                    res.status(200).end();
                } catch (err) {
                    console.error(err);
                    res.status(500).end();
                }
            } catch (err) {
                res.status(400).end();
            }
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
                await db.promise().query(sql.updateuserpasswdhash, { passwordhash: passwordhash, useruuid: req.token.uuid });
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
        const [rows, fields] = await db.promise().query(sql.getuser, { username: req.params.username });
        if (rows.length === 0) {
            res.status(404).end();
        } else {
            res.status(200);
            res.json(rows[0].uuid);
        }
    } catch (err) {
        console.error(err);
        res.status(500).end();
    }
});

module.exports = app;
