
const express = require("express");
const jwt = require("jsonwebtoken");

const db = require("../../db.js");
const config = require("../../../config.js");
const app = express();

// Enables range requests
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

app.get("/:token", function (req, res) {
    /* TODO */
});

module.exports = app;
