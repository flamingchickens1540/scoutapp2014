/**********************************************

Match: Tracks match numbers, times (UTC), scores, teams, and fouls

getMatch: gets one match, populates redTeams and blueTeams (ID, CALLBACK)
getMatches: gets all matches, populates redTeams and blueTeams
createMatch: creates a match before the actual match (ID, TEAMS{RED:[],BLUE:[]}, CALLBACK)
finishMatch: enters scoring and foul info (MATCH_ID, MATCH_STATS{FOULS{RED,BLUE},SCORE{RED,BLUE}, TIME_OF_MATCH, CALLBACK)
updateMatch: any other necessary code (MATCH_ID, UPDATE_OBJ, CALLBACK)
removeMatch: removes one match (MATCH_ID, CALLBACK)

***********************************************/

var mongoose = require('mongoose');

// models
var TeamMatch = mongoose.model('TeamMatch');
var Team = mongoose.model('Team');
var Match = mongoose.model('Match');
var Event = mongoose.model('Event');

var Promise = require('mongoose').Promise;

var match_methods = {};

match_methods.createMatch = function() {};

match_methods.getMatch = exports.getMatch = function(eventId, matchNum) {
	return Match.findOne({ event:eventId, number: matchNum }).exec();
};

match_methods.getMatchesByEvent = function(eventId) {
	return Match.find({ event:eventId }).exec();
};

match_methods.getMatchesByTeam = function(teamNumber) {
	return Match.find({}).$where('this.redAlliance.teams &contains; '+ teamNumber +' || this.redAlliance.teams &contains; '+ teamNumber).exec();
};

match_methods.addTeamMatchToMatch = function() {};
match_methods.Match = function() {};

/*
//MATCHES
var dbNewMatch = function dbNewMatch(id, matchCompetitors, callback) {
  console.log('db#newMatch', id, matchCompetitors);

  if(typeof id !== 'number') { //|| !_.isObject(matchCompetitors) || !_.isFunction(callback)) {
    console.error('DB#newMatch: wrong arguments');
  }

  var redTeams = matchCompetitors.redAlliance;
  var blueTeams = matchCompetitors.blueAlliance;
  var allTeams = _.uniq(redTeams.concat(blueTeams));

  console.log(allTeams,redTeams,blueTeams);

  if(redTeams.length !== 3 && blueTeams.length !== 3 && allTeams.length !== 6) {
    console.error('DB#newMatch: must have three unique teams on each alliance');
  }

  if(!_.isFunction(callback)) {
    callback = function(e,t){console.log(e,t)};
  }
  
  var match = new Match;

  match.id = id;
  match.redAlliance = redTeams;
  match.blueAlliance = blueTeams;
  match.blueScore = 0;
  match.redScore = 0;
  match.redFouls = 0;
  match.blueFouls = 0;
  match.complete = false;

  match.save(function(err, m) {
    if(!err) {
      var p = new mongoose.Promise;
      p.then(function() {
        console.log('created new match '+ m.id +' with red:'+ m.redAlliance +'and blue:'+ m.blueAlliance);
        _.each(allTeams, function(teamId) {
          console.log(teamId);
          dbUpdateTeam(teamId, {$push:{matches:m.id}});
        });
      })

      .then(function() {
        callback(null);
      });

      p.fulfill();

    }
    else {
      console.error(err, 'db#newMatch match creation failed');
      callback(err);
    }
  });
};

//not rewritten
var dbUpdateMatch = function dbUpdateMatch(match_id, updateObj, callback) {
  if(!(typeof id === 'number') && !_.isObject(updateObj)) {
    throw new Error('db#finishMatch: BAD ARGUMENTS');
  }

  callback = callback || function(e,m) {console.log(e,m)};

  Match.findOneAndUpdate({_id: match_id}, updateObj, callback);
};

var dbFinishMatch = function dbFinishMatch(id, matchStats, callback) {
  if(!(typeof id === 'number') && !_.isObject(matchStats)) {
    throw new Error('db#finishMatch: BAD ARGUMENTS');
  }

  callback = callback || function(err) {if(err){console.log(err);}};

  dbUpdateMatch(id, {
    redScore: matchStats.redScore, 
    blueScore: matchStats.blueScore, 
    redFouls: matchStats.redFouls, 
    blueFouls: matchStats.blueFouls,
    complete: true
  }, function(err, match) {
    if(!err) {

      var errCallback = function(err) {
        if(err) throw err;
      };

      var promise = new mongoose.Promise;

      promise.then(function() {
        var winner = match.getWinner();

        if(winner === 'red' || winner === 'blue') {
          var loser = (winner === 'red')? 'blue' : 'red';
          console.log('================   WIN/LOSS   ================', winner, loser);

          var winQualScore = match[winner+'Score'] + Math.round(0.5 * match[loser+'Score']);
          var loseQualScore = match[loser+'Score'];

          console.log(winQualScore, loseQualScore);

          _.each(match[winner+'Alliance'], function(teamId) {
            dbUpdateTeam(teamId, {$inc:{qualScore: winQualScore, wins: 1}}/*, errCallback*/);
          });
          _.each(match[loser+'Alliance'], function(teamId) {
            dbUpdateTeam(teamId, {$inc:{qualScore: loseQualScore, losses: 1}}/*, errCallback*/);
          });
        }
        else if(winner === 'tie') {
          console.log('================   TIE   ================');

          var redQualScore = match.redScore;
          var blueQualScore = match.blueScore;

          console.log(redQualScore, blueQualScore);

          _.each(match['redAlliance'], function(teamId) {
            dbUpdateTeam(teamId, {$inc:{qualScore: redQualScore, ties: 1}}/*, errCallback*/);
          });
          _.each(match['blueAlliance'], function(teamId) {
            dbUpdateTeam(teamId, {$inc:{qualScore: blueQualScore, ties: 1}}/*, errCallback*/);
          });
        }
        else {
          console.error('db#finishMatch: There\'s an issue here.');
        }
      })

      .then(function() {
        callback(null);
      });

      promise.fulfill();
    }
    else {
      callback(err)
    }
  });
};

//not rewritten
/*var dbGetMatch = function dbGetMatch(matchId, callback) {
  var query = Match;

  if(!matchId) {
    throw new Error('must have a callback');
  }

  //db.get(MATCH_ID, FUNCTION) => Match object
  if(typeof matchId === 'number' && _.isFunction(callback)) {
    query = query.findOne({_id:matchId});
  }
  //covers db.get(FUNCTION) => returns all matches
  else if(_.isFunction(matchId)) {
    callback = matchId;
    query = query.find({}); //queries for all matches in db 
  }
  //covers error cases
  else {
    callback = function(err, match) {console.log(err, match)};
    callback(new Error('can not get match '+ matchId +' from database with current arguments'), null);
  }

  query.exec(callback);
};

//not rewritten
//ERR: potentially update the ids as well
//remove from teams of match too
var dbRemoveMatch = function dbRemoveMatch(id, callback) {
  if(typeof id !== 'number') {
    console.log('DB REMOVE: id does not work');
  }
  else {
    Match.findOneAndRemove({_id:id}, callback);
  }
};*/