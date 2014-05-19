var Config = require('./config.js');
var fs = require('fs');
var express = require('express');
var connect = require('connect');

// Configure the server
var app = express();
var server = require('http').createServer(app);

// Configure Express basics
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Add Express middleware
app.use(connect.logger({stream: fs.createWriteStream('./logs/' + Config.log.file.express, {flags: 'a'})}));
app.use(express.static(__dirname + '/public'));

// Set up Express routes
require('./routes.js')(app);

// Start the server
server.listen(Config.web.port, function () {
  console.log('Listening on port ' + Config.web.port + '.');
});
