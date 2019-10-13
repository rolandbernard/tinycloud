
const path = require("path");
const express = require("express");
const app = express();

app.use(function (req, res, next) {
    if(req.method !== "GET" || req.path.split("/").length !== 2) {
        next();
    } else {
        console.log(req.path);
        res.status(200);
        res.setHeader("Content-Type", "image/png");
        res.sendFile(path.join(__dirname, "avatarplaceholder.png"));
    }
});

module.exports = app;
