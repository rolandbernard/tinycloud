
const path = require("path");
const express = require("express");
const http = require("http");

const app = express();
const dir = path.join(__dirname, "public");

app.use(function (req, res, next) {
    if(req.url == "/") {
        req.url = "/index.html";
    }
    next();
});
app.use("/", express.static(dir))
app.use(function(req, res){
    res.status(404);
    res.sendFile(path.join(__dirname, "private/404.html"));
});

http.createServer(app).listen(8080);

