var _ = require('underscore');
var mongoose = require('mongoose');

var db = require('./db_api.js');

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

	var teamMatchExists = db.teamMatchExists( info.event, info.matchNum, info.team );

	q.all([ getMatch, getTeam, teamMatchExists ]) 
	.spread( function createAndSaveTeamMatch( match, team, teamMatchExists ) {

		console.log('EXISTS: '+match.number+' '+team.id, teamMatchExists);

		// check if it exists
		if( !teamMatchExists ) {
			var teamMatch = new TeamMatch();

			teamMatch['team'] = team.id;
			teamMatch['match'] = match.number;
			teamMatch['event'] = info.event;
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
		}

		else {
			throw new Error('Team Match for '+ team.id +', '+ match.number +' already exists')
		}
	})

	.then( function saveTeamMatchToOtherDocuments(models) {
		var teamMatch = models.teamMatch;
		var team = models.team;
		var match = models.match;

		team.matches.push(teamMatch);
		// i.e.red1Data
		match[info.color + info.posNum +'Data'] = teamMatch;

		// create promises
		var saveTeamMatch = q.ninvoke(teamMatch, "save");
		var saveTeam = q.ninvoke(match, "save");
		var saveMatch = q.ninvoke(team, "save");

		return q.all([ saveTeamMatch, saveMatch, saveTeam ])
		.spread( function errors(teamMatchErr, matchErr, teamErr) {
			if( teamMatchErr )  return teamMatchErr;
			if( matchErr ) return matchErr;
			if( teamErr ) return teamErr;

			return teamMatch;
		});
	})

	.spread( function returnSuccess(teamMatch) {
		callback(null, 'match', teamMatch);
	})

	.catch( function saveMatchDataErrHandler(err) {
		callback(err, null , null);
	});
};

dataPathways['pitData'] = function(data, callback) {
	console.log('PITDATA', data);

	_.each(data, function(pitData) {
		var teamId = pitData.teamId;

		// save pit data to team
		Team.findOneAndUpdate( { id:teamId }, { pit:pitData }, function(err, c) {
			console.log(err,c)

			callback(err, 'pit');
		});
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
