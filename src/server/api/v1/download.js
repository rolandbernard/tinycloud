
const express = require("express");
const jwt = require("jsonwebtoken");
const archiver = require('archiver');
const stream_buffers = require('stream-buffers');

const db = require("../../db.js");
const config = require("../../../config.js");
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

app.get("/:token", async function (req, res) {
    try {
        const decoded = jwt.verify(req.params.token, config.keys.public, { algorithms: ["ES384"] });
        if (typeof (decoded.downloaduuid) === "string") {
            try {
                const [accessrows, accessfields] = await db.promise().query(sql.getaccesslevel, { useruuid: (decoded.uuid !== undefined ? decoded.uuid : null), entryuuid: decoded.downloaduuid });
                if (accessrows[0].accesslevel === null) {
                    res.status(404).end();
                } else if (accessrows[0].accesslevel.includes("r")) {
                    const [contentrows, contentfields] = await db.promise().query(sql.getentryinfo, { useruuid: (decoded.uuid !== undefined ? decoded.uuid : null), entryuuid: decoded.downloaduuid });
                    let data;
                    if (contentrows[0].isfolder) {
                        const [datarows, datafields] = await db.promise().query(sql.getfolderdata, { useruuid: (decoded.uuid !== undefined ? decoded.uuid : null), entryuuid: decoded.downloaduuid });
                        const zip = archiver('zip');
                        const out_buffer = new stream_buffers.WritableStreamBuffer();
                        zip.pipe(out_buffer);
                        datarows.forEach(function (row) {
                            zip.append(row.filedata, { name: row.filepath })
                        });
                        await zip.finalize();
                        out_buffer.end();
                        data = out_buffer.getContents();
                        res.setHeader("Content-Type", "application/zip");
                        res.setHeader('Content-disposition', 'attachment; filename=' + encodeURI(contentrows[0].name) + '.zip');
                    } else {
                        const [datarows, datafields] = await db.promise().query(sql.getfiledata, { useruuid: (decoded.uuid !== undefined ? decoded.uuid : null), entryuuid: decoded.downloaduuid });
                        data = datarows[0].filedata;
                        res.setHeader("Content-Type", contentrows[0].contenttype);
                        res.setHeader('Content-disposition', 'attachment; filename=' + encodeURI(contentrows[0].name));
                    }
                    res.status(200);
                    send_data(req, res, data);
                } else {
                    res.status(401).end();
                }
            } catch (err) {
                console.error(err);
                res.status(500).end();
            }
        }
    } catch (err) {
        res.status(401).end();
    }
});

module.exports = app;
