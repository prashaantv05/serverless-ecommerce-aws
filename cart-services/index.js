const serverless = require('serverless-http');
const express = require("express");
const cors = require("cors");   // 👈 ADD THIS

const app = express();

app.use(cors());                // 👈 ADD THIS
app.use(express.json());
app.use('/cart', require('./cartRoutes'));
module.exports.handler = serverless(app);