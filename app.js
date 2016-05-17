var express = require("express");
var app = express();

app.use(express.static("public"));

require("http").createServer(app).listen(3000);