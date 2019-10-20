
const path = require("path");
const express = require("express");
const fileupload = require("express-fileupload");
const http = require("http");
const https = require("https");
var compression = require('compression');

const config = require("./config.js");
const auth = require("./auth.js");
const user = require("./user.js");
const download = require("./download.js");
const drive = require("./drive.js");

const app = express();

app.use(compression());
app.use(express.urlencoded({ extended:true }));
app.use(express.json());
app.use(fileupload());

app.use(auth.middle);
app.get("/", function (req, res, next) {
    res.status(200);
    res.setHeader("Content-Type", "text/html");
    res.sendFile(path.join(__dirname, "../public/index.html"));
});
app.use("/static/", express.static(path.join(__dirname, "../public")));
app.use("/user/", user);
app.use("/drive/", drive);
app.use("/download/", download);
app.use("/auth/", auth);
app.use(function (req, res) {
    res.status(404);
    res.setHeader("Content-Type", "text/html");
    res.sendFile(path.join(__dirname, "../public/404.html"));
});
app.use(function (err, req, res, next) {
    res.status(400);
    res.setHeader("Content-Type", "text/html");
    res.sendFile(path.join(__dirname, "../public/400.html"));
});

http.createServer(app).listen(config.ports.http);
https.createServer({
    key: config.keys.private,
    cert: config.keys.public
}, app).listen(config.ports.https);
