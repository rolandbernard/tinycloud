
const path = require("path");
const express = require("express");
const http = require("http");
const stream = require("stream");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const fileupload = require("express-fileupload");

const auth = require("./auth.js");
const avatar = require("./avatar.js");
const download = require("./download.js");
const drive = require("./drive.js");

const app = express();
const dir = path.join(__dirname, "public");

app.use(function (req, res, next) {
    if(req.path === "/") {
        req.url = "/static/index.html";
    }
    next();
});
app.use("/static/", express.static(dir));
app.use("/avatar/", avatar);
app.use("/drive/", drive);
app.use("/download/", download);
app.use("/auth/", auth);
app.use(function (req, res) {
    res.status(404);
    res.setHeader("Content-Type", "text/html");
    res.sendFile(path.join(__dirname, "public/404.html"));
});

http.createServer(app).listen(8080);

