const serverless = require('serverless-http');
const express = require("express");
const cors = require("cors"); 

const app = express();

app.use(cors());         
app.use(express.json());
app.use('/products', require('./productRoutes'));

module.exports.handler = serverless(app);