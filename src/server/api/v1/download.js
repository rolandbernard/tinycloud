
const express = require("express");

const app = express();

app.get("/:token", function (req, res) {
    // const data = "hello";
    // res.setHeader("Content-Type", "text/html");
    // res.setHeader("Accept-Ranges", "bytes");
    // const range = req.range(data.length);
    // if(range !== undefined && range.type === "bytes" && range.length === 1) {
    //     res.status(206);
    //     res.setHeader("Content-Range", range[0].start.toString() + "-" + range[0].end.toString() + "/" + data.length);
    //     res.send(data.slice(range[0].start, range[0].end+1));
    // } else {
    //     res.status(200);
    //     res.send(data);
    // }
});

module.exports = app;
