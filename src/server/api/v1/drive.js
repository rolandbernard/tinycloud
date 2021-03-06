
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
                    el.isshare = el.isshare ? true : false;
                    if (!el.isshare) {
                        delete el.shareuuid;
                        delete el.directaccesslevel;
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
                const [inforows, infofields] = await db.promise().query(sql.getentryinfo, { useruuid: (req.token !== undefined ? req.token.uuid : null), entryuuid: req.params.uuid });
                let object = inforows[0];
                object.isfolder = object.isfolder ? true : false;
                if (object.isfolder) {
                    delete object.filesize;
                    delete object.contenttype;
                    const [contentrows, contentfields] = await db.promise().query(sql.getfoldercontent, { useruuid: (req.token !== undefined ? req.token.uuid : null), parentuuid: inforows[0].uuid });
                    object.content = contentrows.map(function (el) {
                        el.isfolder = el.isfolder ? true : false;
                        if (el.isfolder) {
                            delete el.filesize;
                            delete el.contenttype;
                        }
                        el.isshare = el.isshare ? true : false;
                        if (!el.isshare) {
                            delete el.shareuuid;
                            delete el.directaccesslevel;
                        }
                        return el;
                    })
                }
                object.isshare = object.isshare ? true : false;
                if (!object.isshare) {
                    delete object.shareuuid;
                    delete object.directaccesslevel;
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
    if (req.params.uuid.length != 36) {
        res.status(400).end();
    } else {
        try {
            const [accessrows, accessfields] = await db.promise().query(sql.getaccesslevel, { useruuid: (req.token !== undefined ? req.token.uuid : null), entryuuid: req.params.uuid });
            if (accessrows[0].accesslevel === null) {
                res.status(404).end();
            } else if (accessrows[0].accesslevel.includes("r")) {
                const [contentrows, contentfields] = await db.promise().query(sql.getentryshares, { entryuuid: req.params.uuid });
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

app.post("/:uuid/share", async function(req, res) {
    if (req.params.uuid.length != 36) {
        res.status(400).end();
    } else {
        try {
            const [accessrows, accessfields] = await db.promise().query(sql.getaccesslevel, { useruuid: (req.token !== undefined ? req.token.uuid : null), entryuuid: req.params.uuid });
            if (accessrows[0].accesslevel === null) {
                res.status(404).end();
            } else if (accessrows[0].accesslevel.includes("d")) {
                if (req.body.accesslevel === "r" ||
                    req.body.accesslevel === "rw" ||
                    req.body.accesslevel === "rwd") {
                    if (typeof (req.body.useruuid) === "string") {
                        const [userrows, userfields] = await db.promise().query(sql.getuserbyuuid, { useruuid: req.body.useruuid });
                        if (userrows.length === 1) {
                            const [sharerows, sharefields] = await db.promise().query(sql.getentryusershare, { useruuid: req.body.useruuid, entryuuid: req.params.uuid });
                            if (sharerows.length === 1) {
                                await db.promise().query(sql.updateshareaccesslevel, { shareuuid: sharerows[0].uuid, accesslevel: req.body.accesslevel });
                                res.status(200).end();
                            } else {
                                await db.promise().query(sql.insertentryshare, { useruuid: req.body.useruuid, entryuuid: req.params.uuid, accesslevel: req.body.accesslevel });
                                res.status(200).end();
                            }
                        } else {
                            res.status(404).end();
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
    if (req.params.uuid.length != 36) {
        res.status(400).end();
    } else {
        try {
            const [sharerows, sharefields] = await db.promise().query(sql.getshareentry, { shareuuid: req.params.uuid });
            if (sharerows.length === 1) {
                const [accessrows, accessfields] = await db.promise().query(sql.getaccesslevel, { useruuid: (req.token !== undefined ? req.token.uuid : null), entryuuid: sharerows[0].uuid });
                if (accessrows[0].accesslevel === null) {
                    res.status(404).end();
                } else if (accessrows[0].accesslevel.includes("w")) {
                    await db.promise().query(sql.deleteshare, { shareuuid: req.params.uuid });
                    res.status(200).end();
                } else {
                    res.status(401).end();
                }
            } else {
                res.status(404).end();
            }
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    }
});

app.post("/:uuid", async function (req, res) {
    if (req.params.uuid.length != 36) {
        res.status(400).end();
    } else {
        try {
            if ((typeof (req.body.newparent) === 'string' && req.body.newparent.length === 36) || req.body.newparent === null) {
                const [accessrows, accessfields] = await db.promise().query(sql.getaccessleveldirect, { useruuid: (req.token !== undefined ? req.token.uuid : null), entryuuid: req.params.uuid });
                if (accessrows.length === 0) {
                    res.status(404).end();
                } else if (accessrows[0].accesslevel.includes("d")) {
                    if (req.body.newparent === null) {
                        await db.promise().query(sql.updateentryparent, { entryuuid: req.params.uuid, parentuuid: null, useruuid: (req.token !== undefined ? req.token.uuid : null) });
                        res.status(200).end();
                    } else {
                        const [accessnewrows, accessnewfields] = await db.promise().query(sql.getaccesslevel, { useruuid: (req.token !== undefined ? req.token.uuid : null), entryuuid: req.body.newparent });
                        const [parentrows, parentfields] = await db.promise().query(sql.getentryinfo, { entryuuid: req.body.newparent });
                        if (accessnewrows.length === 0 || parentrows.length === 0) {
                            res.status(404).end();
                        } else if (accessnewrows[0].accesslevel.includes("w")) {
                            const [cyclerows, cyclefields] = await db.promise().query(sql.getentryparent, { entryuuid: parentrows[0].uuid, parentuuid: req.params.uuid });
                            if (cyclerows.length === 0) {
                                await db.promise().query(sql.updateentryparent, { entryuuid: req.params.uuid, parentuuid: req.body.newparent, useruuid: (req.token !== undefined ? req.token.uuid : null) });
                                res.status(200).end();
                            } else {
                                res.status(400).end();
                            }
                        } else {
                            res.status(401).end();
                        }
                    }
                } else {
                    res.status(401).end();
                }
            } else {
                const [accessrows, accessfields] = await db.promise().query(sql.getaccesslevel, { useruuid: (req.token !== undefined ? req.token.uuid : null), entryuuid: req.params.uuid });
                const [entryrows, entryfields] = await db.promise().query(sql.getentryinfo, { entryuuid: req.params.uuid });
                if (accessrows.length === 0 || entryrows.length === 0) {
                    res.status(404).end();
                } else if (accessrows[0].accesslevel.includes("w")) {
                    if (req.files && req.files.file !== undefined && !entryrows[0].isfolder) {
                        await db.promise().query(sql.updatefile, { entryuuid: entryrows[0].uuid, size: req.files.file.size, contenttype: req.files.file.mimetype, data: req.files.file.data, useruuid: (req.token !== undefined ? req.token.uuid : null) });
                        res.status(200).end();
                    } else if (typeof (req.body.newname) === 'string') {
                        if (entryrows[0].isfolder) {
                            await db.promise().query(sql.updatefoldername, { entryuuid: entryrows[0].uuid, name: req.body.newname, useruuid: (req.token !== undefined ? req.token.uuid : null) });
                            res.status(200).end();
                        } else {
                            await db.promise().query(sql.updatefilename, { entryuuid: entryrows[0].uuid, name: req.body.newname, useruuid: (req.token !== undefined ? req.token.uuid : null) });
                            res.status(200).end();
                        }
                    } else {
                        res.status(400).end();
                    }
                } else {
                    res.status(400).end();
                }
            }
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    }
});

app.put("/", async function (req, res) {
    if (req.token !== undefined) {
        try {
            if (req.files && req.files.file !== undefined) {
                const [uuidrows, uuidfields] = await db.promise().query(sql.getuuid);
                await db.promise().query(sql.insertfileentry, { uuid: uuidrows[0].uuid, name: req.files.file.name, size: req.files.file.size, contenttype: req.files.file.mimetype, data: req.files.file.data, useruuid: req.token.uuid, parentuuid: null });
                res.status(200).json({
                    uuid: uuidrows[0].uuid
                });
            } else if (typeof (req.body.foldername) === "string") {
                const [uuidrows, uuidfields] = await db.promise().query(sql.getuuid);
                await db.promise().query(sql.insertfolderentry, { uuid: uuidrows[0].uuid, name: req.body.foldername, useruuid: req.token.uuid, parentuuid: null });
                res.status(200).json({
                    uuid: uuidrows[0].uuid
                });
            } else if (typeof (req.body.shareentryuuid) === "string") {
                const [sharerows, sharefields] = await db.promise().query(sql.getbestentryshare, { useruuid: req.token.uuid, entryuuid: req.body.shareentryuuid });
                if (sharerows.length >= 1) {
                    const [uuidrows, uuidfields] = await db.promise().query(sql.getuuid);
                    await db.promise().query(sql.insertsharelinkentry, { uuid: uuidrows[0].uuid, parentuuid: null, shareuuid: sharerows[0].uuid, useruuid: req.token.uuid });
                    res.status(200).json({
                        uuid: uuidrows[0].uuid
                    });
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
            const [parentrows, parentfields] = await db.promise().query(sql.getentryinfo, { entryuuid: req.params.uuid });
            if (parentrows.length === 1 && parentrows[0].isfolder) {
                const [accessrows, accessfields] = await db.promise().query(sql.getaccesslevel, { useruuid: (req.token !== undefined ? req.token.uuid : null), entryuuid: req.params.uuid });
                if (accessrows.length === 0) {
                    res.status(404).end();
                } else if (accessrows[0].accesslevel.includes("w")) {
                    if (req.files && req.files.file !== undefined) {
                        const [uuidrows, uuidfields] = await db.promise().query(sql.getuuid);
                        await db.promise().query(sql.insertfileentry, { uuid: uuidrows[0].uuid, name: req.files.file.name, size: req.files.file.size, contenttype: req.files.file.mimetype, data: req.files.file.data, useruuid: (req.token !== undefined ? req.token.uuid : null), parentuuid: parentrows[0].uuid });
                        res.status(200).json({
                            uuid: uuidrows[0].uuid
                        });
                    } else if (typeof (req.body.foldername) === "string") {
                        const [uuidrows, uuidfields] = await db.promise().query(sql.getuuid);
                        await db.promise().query(sql.insertfolderentry, { uuid: uuidrows[0].uuid, name: req.body.foldername, useruuid: (req.token !== undefined ? req.token.uuid : null), parentuuid: parentrows[0].uuid });
                        res.status(200).json({
                            uuid: uuidrows[0].uuid
                        });
                    } else if (typeof (req.body.shareentryuuid) === "string") {
                        const [sharerows, sharefields] = await db.promise().query(sql.getbestentryshare, { useruuid: (req.token !== undefined ? req.token.uuid : null), entryuuid: req.body.shareentryuuid });
                        if (sharerows.length >= 1) {
                            const [uuidrows, uuidfields] = await db.promise().query(sql.getuuid);
                            await db.promise().query(sql.insertsharelinkentry, { uuid: uuidrows[0].uuid, parentuuid: parentrows[0].uuid, shareuuid: sharerows[0].uuid, useruuid: (req.token !== undefined ? req.token.uuid : null) });
                            res.status(200).json({
                                uuid: uuidrows[0].uuid
                            });
                        } else {
                            res.status(401).end();
                        }
                    } else {
                        res.status(400).end();
                    }
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
    }
});

app.delete("/:uuid", async function (req, res) {
    if(req.params.uuid.length != 36) {
        res.status(400).end();
    } else {
        try {
            const [accessrows, accessfields] = await db.promise().query(sql.getaccessleveldirect, { useruuid: (req.token !== undefined ? req.token.uuid : null), entryuuid: req.params.uuid });
            if (accessrows[0].accesslevel === null) {
                res.status(404).end();
            } else if (accessrows[0].accesslevel.includes("d")) {
                await db.promise().query(sql.deleteentry, { entryuuid: req.params.uuid });
                res.status(200).end();
            } else {
                res.status(401).end();
            }
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    }
});

module.exports = app;
