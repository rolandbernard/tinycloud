
const express = require("express");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const db = require("./db.js");
const config = require("./config.js");

const app = express();

const sqlgetrootcontent = fs.readFileSync(path.join(__dirname, "./sql/getrootcontent.sql"), "utf8");
app.get("/", async function (req, res) {
    if (req.token !== undefined) {
        try {
            const [contentrows, contentfields] = await db.promise().execute(sqlgetrootcontent, { useruuid: req.token.uuid });
            const object = {
                owner: req.token.username,
                content: contentrows.map(function (el) {
                    el.isfolder = el.isfolder ? true : false;
                    if (el.isfolder) {
                        delete el.filesize;
                        delete el.contenttype;
                    }
                    return el;
                })
            }
            res.status(200);
            res.json(object);
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    } else {
        res.status(401).end();
    }
});

const sqlgetentryinfo = fs.readFileSync(path.join(__dirname, "./sql/getentryinfo.sql"), "utf8");
const sqlgetfoldercontent = fs.readFileSync(path.join(__dirname, "./sql/getfoldercontent.sql"), "utf8");
const sqlgetaccesslevel = fs.readFileSync(path.join(__dirname, "./sql/getaccesslevel.sql"), "utf8");
app.get("/:uuid", async function (req, res) {
    const [accessrows, accessfields] = await db.promise().execute(sqlgetaccesslevel, { useruuid: (req.token !== undefined ? req.token.uuid : null), entryuuid: req.params.uuid });
    if (accessrows[0].accesslevel === null) {
        res.status(404).end();
    } else if (accessrows[0].accesslevel >= 1) {
        try {
            const [contentrows, contentfields] = await db.promise().execute(sqlgetentryinfo, { entryuuid: req.params.uuid });
            let object = contentrows[0];
            object.isfolder = object.isfolder ? true : false;
            if (object.isfolder) {
                delete object.filesize;
                delete object.contenttype;
                const [contentrows, contentfields] = await db.promise().execute(sqlgetfoldercontent, { parentuuid: req.params.uuid });
                object.content = contentrows.map(function (el) {
                    el.isfolder = el.isfolder ? true : false;
                    if (el.isfolder) {
                        delete el.filesize;
                        delete el.contenttype;
                    }
                    return el;
                })
            }
            res.status(200);
            res.json(object);
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    } else {
        res.status(401).end();
    }
});

const sqlgetentryhistory = fs.readFileSync(path.join(__dirname, "./sql/getentryhistory.sql"), "utf8");
app.get("/:uuid/history", async function (req, res) {
    const [accessrows, accessfields] = await db.promise().execute(sqlgetaccesslevel, { useruuid: (req.token !== undefined ? req.token.uuid : null), entryuuid: req.params.uuid });
    if (accessrows[0].accesslevel === null) {
        res.status(404).end();
    } else if (accessrows[0].accesslevel >= 1) {
        try {
            const [contentrows, contentfields] = await db.promise().execute(sqlgetentryhistory, { entryuuid: req.params.uuid });
            res.status(200);
            res.json(contentrows);
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    } else {
        res.status(401).end();
    }
});

app.get("/:uuid/share", async function (req, res) {

});

app.post("/:uuid/share", async function(req, res) {

});

// update / rename
app.post("/:uuid", function (req, res) {

});

// new
const sqlgetbestentryshare = fs.readFileSync(path.join(__dirname, "./sql/getbestentryshare.sql"), "utf8");
app.put("/", async function (req, res) {
    if (req.token !== undefined) {
        try {
            if (req.files !== undefined) {
                // TODO: Add file upload
            } else if (typeof (req.body.foldername) === "string") {
                const [uuidrow, uuidfields] = await db.promise().execute("SELECT UUID() uuid;");
                const sql1 = "INSERT INTO entrys(eid, ename, eparentid, eownerid, etype) VALUES (UUID_TO_BIN(:uuid), :name, NULL, UUID_TO_BIN(:useruuid), 'folder')";
                await db.promise().execute(sql1, { uuid: uuidrow[0].uuid, name: req.body.foldername, useruuid: req.token.uuid })
                const sql2 = "INSERT INTO history(hid, hentryid, huserid, hdatetime, hoperation) VALUES (UUID_TO_BIN(UUID()), UUID_TO_BIN(:uuid), UUID_TO_BIN(:useruuid), NOW(), 'create')";
                await db.promise().execute(sql2, { uuid: uuidrow[0].uuid, name: req.body.foldername, useruuid: req.token.uuid })
                res.status(200).end();
            } else if (typeof (req.body.shareentryuuid) === "string") {
                const [sharerows, sharefields] = await db.promise().execute(sqlgetbestentryshare, { useruuid: req.token.uuid, entryuuid: req.body.shareentryuuid });
                if (sharerows.length >= 1) {
                    const sql = "INSERT INTO sharepoints(spid, spmountedbyid, spparentid, spshareid) VALUES (UUID_TO_BIN(UUID()), UUID_TO_BIN(:useruuid), NULL, UUID_TO_BIN(:shareuuid))";
                    await db.promise().execute(sql, { shareuuid: sharerows[0].uuid, useruuid: req.token.uuid })
                    res.status(200).end();
                } else {
                    res.status(401).end();
                }
            } else {
                res.status(400).end();
            }
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    } else {
        res.status(401).end();
    }   
});

app.put("/:uuid", function (req, res) {

});

app.delete("/:uuid", function (req, res) {

});

module.exports = app;
