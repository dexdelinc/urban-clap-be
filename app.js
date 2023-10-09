require("dotenv").config();
require("./db/connection").connect();
const express = require("express");
const bodyParser=require('body-parser')
const app = express();
const cors = require("cors");

app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
app.use(express.static("public"));
app.use(cors());

app.get("", (_req, res) => {
  res.status(200).json({
    status: 200,
    message: "Server is running",
  });
});
module.exports = app;
