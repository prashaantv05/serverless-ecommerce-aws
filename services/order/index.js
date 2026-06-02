const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");   // 👈 ADD THIS

const app = express();

app.use(cors());                // 👈 ADD THIS
app.use(express.json());
app.use("/orders", require("./orderRoutes"));

module.exports.handler = serverless(app);