
const express = require("express");

const auth = require("./auth.js");
const download = require("./download.js");
const drive = require("./drive.js");
const user = require("./user.js");

const app = express();

app.use(auth.middle);
app.use("/auth/", auth);
app.use("/download/", download);
app.use("/drive/", drive);
app.use("/user/", user);

module.exports = app;

