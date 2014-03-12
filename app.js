'use strict';
/**
 * Module dependencies
 */

var express = require('express'),
  http = require('http'),
  path = require('path');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);


var db = require('./modules/db_api.js');
var dataRouter = require('./modules/data.js');

var mongoose = require('mongoose');
var q = require('q');

// connect to database
db.connect('mock2014v2');

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
  io.sockets.emit('test', 'test');
  res.render('index', { title:'1540 Scouting 2014' });
});

// All submissions for the database
app.post('/submit/:dest', function(req, res) {
  var submitTo = req.params.dest;
  var data = req.body;

  dataRouter.collect(submitTo, data, function(err, savedTo, otherData) {
    var isSaved = false;

    console.log('OTHER DATA', otherData);

    if(!err) {
      if( savedTo == 'match' ) {
        var teamMatch = otherData;
        isSaved = true;
        // emit event
        io.sockets.emit('moderator:new-team-match', teamMatch);
      }
      else if( savedTo == 'pit' ) {
        isSaved = true;
      }
      
      res.send(isSaved);
    }
    else {
      res.send(err);
    }
  });
});

app.get('/stuff/:data', function(req, res) {
  var data = req.params.data;
  var Match = mongoose.model('Match');
  var Team = mongoose.model('Team');
  var TeamMatch = mongoose.model('TeamMatch');

  switch(data) {
    case 'match':
      Match.find(function(err, matches) {
        res.json(matches);
      });
      break;

    case 'team':
      Team.find(function(err, matches) {
        res.json(matches);
      });
      break;

    case 'teammatch':
      TeamMatch.find(function(err, matches) {
        res.json(matches);
      });
      break;
  }
});


io.sockets.on('connection', function(socket) {

  socket.on('get-event', function(eventId, returnDataToClient) {
    
    db.getEvent( eventId )

    .then( function returnEvent(event) {
      returnDataToClient(event);
    })

    .catch( function errHandler() {
      // return some failing thing
    });
  });

  socket.on('moderator:get-data', function(eventId, returnDataToClient) {

    q.all([ db.getTeamsAtEvent(eventId), db.getMatchesAtEvent(eventId) ])
    
    .spread( function getAllData(teams, matches) {
      console.log(teams.length, matches.length);
      return { teams:teams, matches:matches }
    })

    .then( function returnToClient(data) {
      returnDataToClient({ teams:data.teams, matches:data.matches });
    })

    .catch( function errHandler(err) {
      // return some failing thing
      console.log(err);
    });
  });


  socket.on('get-team-info', function(teamId, returnDataToClient) {
    var Team = mongoose.model('Team');

    Team.findOne({ id:teamId }).populate('matches').exec()

    .then(

      function returnTeam(team) {
        returnDataToClient(team);
      }

    );
  });

  socket.on('save-moderated-notes', function(info, returnDataToClient) {
    var Team = mongoose.model('Team');
    var TeamMatch = mongoose.model('TeamMatch');

    var teamId = info.teamId;
    var masterNotes = info.masterNotes;

    Team.findOneAndUpdate( { id:teamId }, { masterNotes:masterNotes }, function(err, team) {
      if(!err) {

        TeamMatch.findOneAndUpdate( { _id:info.teamMatch._id }, { moderated:true } , function(err, tm) {

          socket.broadcast.emit('save-moderated-notes', info);

          console.log('Added note '+ masterNotes +' to team '+ team.id);
          returnDataToClient(true);
        });
      }
      else {
        returnDataToClient(false);
      }

    });
  });

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

/**
 * Start Server
 */

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
