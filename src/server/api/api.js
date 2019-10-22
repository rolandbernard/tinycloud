
const express = require("express");

const v1 = require("./v1/v1.js");

const app = express();

app.use("/v1/", v1);

module.exports = app;
