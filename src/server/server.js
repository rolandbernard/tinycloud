
const path = require("path");
const express = require("express");
const fileupload = require("express-fileupload");
const http = require("http");
const https = require("https");
var compression = require('compression');

const api = require("./api/api.js");
const config = require("../config.js");

const app = express();

app.use(compression());
app.use(express.urlencoded({ extended:true }));
app.use(express.json());
app.use(fileupload());

app.get("/", function (req, res) {
    res.status(200);
    res.sendFile(path.join(__dirname, "../public/index.html"));
});
app.use("/static/", express.static(path.join(__dirname, "../public/"), { /*cacheControl: true , maxAge: 3600000*/ }));
app.use("/api/", api);
app.use(function (req, res) {
    res.status(404);
    res.sendFile(path.join(__dirname, "../public/404.html"));
});
app.use(function (err, req, res, next) {
    console.error(err);
    res.status(500).end();
});

const options = {
    key: config.keys.private,
    cert: config.keys.public
};

http.createServer(app).listen(config.ports.http);
https.createServer(options, app).listen(config.ports.https);
