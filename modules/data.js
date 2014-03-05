var _ = require('underscore');
var mongoose = require('mongoose');

var db = require('./db_api.js');
db.connect();

var dataPathways = {};

// models
var TeamMatch = mongoose.model('TeamMatch');
var Team = mongoose.model('Team');
var Match = mongoose.model('Match');
var Event = mongoose.model('Event');

var q = require('q');

// for match data
dataPathways['matchData'] = function(data, callback) {
	var info = {
    scout: data.info.scout,
    event: data.info.event,
    team: data.info.team,
    matchNum: data.info.matchNum,
    posNum: data.info.posNum,
    color: data.info.color
  };

	var auto = data.auto;
	var scoring = data.scoring;
	var teamwork = data.teamwork;
	var issues = data.issues;
	var submit = data.submit;

	var getMatch = db.getMatch( info.event,info.matchNum );

	var getTeam = db.getTeam( info.team );


	q.all([ getMatch, getTeam ]) 
	.spread(function createAndSaveTeamMatch( match, team ) {

		var teamMatch = new TeamMatch();

		teamMatch['team'] = team;
		teamMatch['match'] = match;
		teamMatch['scout'] = info.scout;
		teamMatch['posNum'] = info.posNum;
		teamMatch['color'] = info.color;
		teamMatch['data'] = {
			'auto': auto,
			'scoring': scoring,
			'teamwork': teamwork,
			'issues': issues,
			'submit': submit
		};

		// returns a new promise to keep the chain going
		// passes all models to the function that saves teamMatch to match and team
		return { 
			teamMatch:teamMatch, 
			match:match, 
			team:team 
		};

	})

	.then( function saveTeamMatchToOtherDocuments(models) {
		var teamMatch = models.teamMatch;
		var team = models.team;
		var match = models.match;

		team.matches.push(teamMatch);
		// i.e.red1Data
		match[info.color + info.posNum +'Data'] = teamMatch;

		teamMatch.save(function(err) { if(err) return err });
		match.save(function(err) { if(err) return err });
		team.save(function(err) { if(err) return err });
	})

	.then( function returnSuccess() {
		callback(null, true);
	})

	.catch( function saveMatchDataErrHandler(err) {
		callback(err, false);
		// delete the teamMatch
	});
};

dataPathways['pitData'] = function(data, callback) {
	console.log('PITDATA', data);

	_.each(data, function(pitData) {
		var teamId = pitData.general.teamNumber;

		// save pit data to team
		Team.findOneAndUpdate( { id:teamId }, { pit:pitData }, function(err, c) {console.log(err,c)} );
	});
};

exports.collect = function(submitTo, data, callback) {
	var submitFunction = dataPathways[submitTo];

	if( _.isFunction(submitFunction) ) {
		submitFunction(data, callback);
	}
	else {
		callback( new Error('not an available data pathway') );
	}
};
