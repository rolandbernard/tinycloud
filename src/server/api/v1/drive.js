
const express = require("express");

const db = require("../../db.js");
const sql = require("./sql.js");

const app = express();

app.get("/", async function (req, res) {
    if (req.token !== undefined) {
        try {
            const [contentrows, contentfields] = await db.promise().query(sql.getrootcontent, { useruuid: req.token.uuid });
            const object = {
                owner: req.token.username,
                content: contentrows.map(function (el) {
                    el.isfolder = el.isfolder ? true : false;
                    if (el.isfolder) {
                        delete el.filesize;
                        delete el.contenttype;
                    }
                    if (!el.isshare) {
                        delete el.shareuuid;
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

app.get("/:uuid/", async function (req, res) {
    if (req.params.uuid.length != 36) {
        res.status(400).end();
    } else {
        try {
            const [accessrows, accessfields] = await db.promise().query(sql.getaccesslevel, { useruuid: (req.token !== undefined ? req.token.uuid : null), entryuuid: req.params.uuid });
            if (accessrows[0].accesslevel === null) {
                res.status(404).end();
            } else if (accessrows[0].accesslevel.includes("r")) {
                const [contentrows, contentfields] = await db.promise().query(sql.getentryinfo, { entryuuid: req.params.uuid });
                let object = contentrows[0];
                object.isfolder = object.isfolder ? true : false;
                if (object.isfolder) {
                    delete object.filesize;
                    delete object.contenttype;
                    const [contentrows, contentfields] = await db.promise().query(sql.getfoldercontent, { useruuid: (req.token !== undefined ? req.token.uuid : null), parentuuid: req.params.uuid });
                    object.content = contentrows.map(function (el) {
                        el.isfolder = el.isfolder ? true : false;
                        if (el.isfolder) {
                            delete el.filesize;
                            delete el.contenttype;
                        }
                        if (!el.isshare) {
                            delete el.shareuuid;
                        }
                        return el;
                    })
                }
                res.status(200);
                res.json(object);
            } else {
                res.status(401).end();
            }
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    }
});

app.get("/:uuid/history", async function (req, res) {
    if (req.params.uuid.length != 36) {
        res.status(400).end();
    } else {
        try {
            const [accessrows, accessfields] = await db.promise().query(sql.getaccesslevel, { useruuid: (req.token !== undefined ? req.token.uuid : null), entryuuid: req.params.uuid });
            if (accessrows[0].accesslevel === null) {
                res.status(404).end();
            } else if (accessrows[0].accesslevel.includes("r")) {
                const [contentrows, contentfields] = await db.promise().query(sql.getentryhistory, { entryuuid: req.params.uuid });
                res.status(200);
                res.json(contentrows);
            } else {
                res.status(401).end();
            }
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    }
});

app.get("/:uuid/share", async function (req, res) {
    if(req.params.uuid.length != 36) {
        res.status(400).end();
    } else {
    }
});

app.post("/:uuid/share", async function(req, res) {
    if (req.params.uuid.length != 36) {
        res.status(400).end();
    } else {
        try {
            const [accessrows, accessfields] = await db.promise().query(sql.getaccesslevel, { useruuid: (req.token !== undefined ? req.token.uuid : null), entryuuid: req.params.uuid });
            if (accessrows[0].accesslevel === null) {
                res.status(404).end();
            } else if (accessrows[0].accesslevel.includes("w")) {
                if (req.body.accesslevel === "r" ||
                    req.body.accesslevel === "rw" ||
                    req.body.accesslevel === "rwd") {
                    if (typeof (req.body.useruuid) === "string") {
                        const [sharerows, sharefields] = await db.promise().query(sql.getentryusershare, { useruuid: req.body.useruuid, entryuuid: req.params.uuid });
                        if (sharerows.length === 1) {
                            await db.promise().query(sql.updateshareaccesslevel, { shareuuid: sharerows[0].uuid, accesslevel: req.body.accesslevel });
                            res.status(200).end();
                        } else {
                            await db.promise().query(sql.insertentryshare, { useruuid: req.body.useruuid, entryuuid: req.params.uuid, accesslevel: req.body.accesslevel });
                            res.status(200).end();
                        }
                    } else {
                        const [sharerows, sharefields] = await db.promise().query(sql.getentryallshare, { entryuuid: req.params.uuid });
                        if (sharerows.length === 1) {
                            await db.promise().query(sql.updateshareaccesslevel, { shareuuid: sharerows[0].uuid, accesslevel: req.body.accesslevel });
                            res.status(200).end();
                        } else {
                            await db.promise().query(sql.insertentryshare, { useruuid: req.body.useruuid, entryuuid: req.params.uuid, accesslevel: req.body.accesslevel });
                            res.status(200).end();
                        }
                    }
                } else {
                    res.status(400).end();
                }
            } else {
                res.status(401).end();
            }
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    }
});

app.delete("/share/:uuid", async function (req, res) {
    if(req.params.uuid.length != 36) {
        res.status(400).end();
    } else {
    }
});

// update / rename
app.post("/:uuid", function (req, res) {
    if(req.params.uuid.length != 36) {
        res.status(400).end();
    } else {
    }
});

// new
app.put("/", async function (req, res) {
    if (req.token !== undefined) {
        try {
            if (req.files !== undefined) {
                // TODO: Add file upload
            } else if (typeof (req.body.foldername) === "string") {
                const [uuidrows, uuidfields] = await db.promise().query(sql.getuuid);
                await db.promise().query(sql.insertfolderentry, { uuid: uuidrows[0].uuid, name: req.body.foldername, useruuid: req.token.uuid, parentuuid: null });
                res.status(200).end();
            } else if (typeof (req.body.shareentryuuid) === "string") {
                const [sharerows, sharefields] = await db.promise().query(sql.getbestentryshare, { useruuid: req.token.uuid, entryuuid: req.body.shareentryuuid });
                if (sharerows.length >= 1) {
                    const [uuidrows, uuidfields] = await db.promise().query(sql.getuuid);
                    await db.promise().query(sql.insertsharelinkentry, { uuid: uuidrows[0].uuid, parentuuid: null, shareuuid: sharerows[0].uuid, useruuid: req.token.uuid });
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

app.put("/:uuid", async function (req, res) {
    if (req.params.uuid.length != 36) {
        res.status(400).end();
    } else {
        try {
            const [accessrows, accessfields] = await db.promise().query(sql.getaccesslevel, { useruuid: (req.token !== undefined ? req.token.uuid : null), entryuuid: req.params.uuid });
            if (accessrows.length === 0) {
                res.status(404).end();
            } else if (accessrows[0].accesslevel.includes("w")) {
                if (req.files !== undefined) {
                    // TODO: Add file upload
                } else if (typeof (req.body.foldername) === "string") {
                    const [uuidrows, uuidfields] = await db.promise().query(sql.getuuid);
                    await db.promise().query(sql.insertfolderentry, { uuid: uuidrows[0].uuid, name: req.body.foldername, useruuid: (req.token !== undefined ? req.token.uuid : null), parentuuid: req.params.uuid });
                    res.status(200).end();
                } else if (typeof (req.body.shareentryuuid) === "string") {
                    const [sharerows, sharefields] = await db.promise().query(sql.getbestentryshare, { useruuid: (req.token !== undefined ? req.token.uuid : null), entryuuid: req.body.shareentryuuid });
                    if (sharerows.length >= 1) {
                        const [uuidrows, uuidfields] = await db.promise().query(sql.getuuid);
                        await db.promise().query(sql.insertsharelinkentry, { uuid: uuidrows[0].uuid, parentuuid: req.params.uuid, shareuuid: sharerows[0].uuid, useruuid: (req.token !== undefined ? req.token.uuid : null) });
                        res.status(200).end();
                    } else {
                        res.status(401).end();
                    }
                } else {
                    res.status(400).end();
                }
            } else {
                res.status(401).end();
            }
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    }   
});

app.delete("/:uuid", async function (req, res) {
    if(req.params.uuid.length != 36) {
        res.status(400).end();
    } else {
    }
});

module.exports = app;
