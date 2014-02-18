'use strict';
/**
 * Module dependencies
 */

var express = require('express'),
  http = require('http'),
  path = require('path');

var db = require('./modules/db.js');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.json());
app.use(express.favicon());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.use(express.favicon());
app.use(express.urlencoded());

// development only
if (app.get('env') === 'development') {
  app.use(express.errorHandler());
}

// serve index and view partials
app.get('/', function(req, res) {
  res.render('index', {title:'Bunnybots'});
});

app.get('/partials/:name', function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
});

app.get('/components/:name', function (req, res) {
  var name = req.params.name;
  res.render('components/' + name);
});

app.get('/templates/:name', function (req, res) {
  var name = req.params.name;
  res.render('templates/' + name);
});

// redirect all others to the index
app.get('*', function(req, res){
  res.render('index');
});


/* SOCKET.IO EVENTS */
io.sockets.on('connection', function(socket) {
  console.log('connected to socket '+ socket.id);

});


/**
 * Start Server
 */

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
