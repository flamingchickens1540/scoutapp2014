var mongoose = require('mongoose');
var _ = require('underscore');
var q = require('q');
// easier to remember function to convert to a q promise
var convertToQPromise = q;

require('./../db_modules/models/event.js');
require('./../db_modules/models/team.js');
require('./../db_modules/models/match.js');
require('./../db_modules/models/team_match.js');

//Models
var Team = mongoose.model('Team');
var Match = mongoose.model('Match');
var TeamMatch = mongoose.model('TeamMatch');
var Event = mongoose.model('Event');

var db = {};

/********************************************
***************  CONNECTION  ****************
********************************************/
db.connect = function(dbName, callback) {
  mongoose.connect('localhost', (dbName || 'mockdata2014') );
    
  if(callback && _.isFunction(callback)) {
    callback(null);
  }
  else {
    return true;
  }
};

/********************************************
******************  EVENT  ******************
********************************************/
db.getEvent = db.getEventById = function(eventId) {
	return convertToQPromise(
		Event.findOne({ id:eventId })
		.populate('matches teams')
		.exec()
	);
};

/********************************************
******************  TEAM  *******************
********************************************/
db.getTeam = db.getTeamById = function(teamId) {
	return convertToQPromise(
		Team.findOne({ id:teamId })
		.populate('matches')
		.exec()
	)

	.then( function testForNullValues(team) {
		// null values are errors
		if( _.isNull(team) || _.isUndefined(team) ) return new Error('can not find team '+ teamId);
		return team;
	});
};

db.getTeams = db.getTeamsById = function(teamIdArray) {
	var teamsRegExp = new RegExp( teamIdArray.join('|') );
	console.log(teamsRegExp);

	return q.all( _.map( teamIdArray, function(teamId) {
		return convertToQPromise(
			Team.findOne({ id:teamId })
			.populate('matches')
			.exec()
		)

		.then( function testForNullValues(team) {
			// null values are errors
			if( _.isNull(team) || _.isUndefined(team) ) return new Error('can not find teams '+ teamIdArray);
			return team;
		});

	}))

	.then( function handleTeams(teams) {
		return teams;
	});
};

/********************************************
******************  MATCH  ******************
********************************************/
db.getMatch = function(eventId, matchNumber) {
	return convertToQPromise(
		Match.findOne({ event:eventId, number:matchNumber })
		.populate('red1Data red2Data red3Data blue1Data blue2Data blue3Data')
		.exec()
	)

	.then( function testForNullValues(match) {
		// null values are errors
		if( _.isNull(match) ) return new Error('can not find match '+ matchNumber +' at event '+ eventId);
		return match;
	});
};

db.getMatchesAtEvent = function(eventId) {
	return convertToQPromise(
		Match.find({ event:eventId })
		.populate('red1Data red2Data red3Data blue1Data blue2Data blue3Data')
		.exec()
	)

	.then( function testForNullValues(matches) {
		// null values are errors
		if( _.isNull(matches) || _.isEmpty(matches) ) return new Error('can not find matches at event '+ eventId);
		return matches;
	});
};

/********************************************
***************  TEAM_MATCH  ****************
********************************************/
db.getTeamsAtEvent = function(eventId) {
	return convertToQPromise(
		Team.find({ events:eventId }) // events array contains eventId
		.populate('matches')
		.exec()
	)

	.then( function testForNullValues(teams) {
		// null values are errors
		if( _.isNull(teams) || _.isEmpty(teams) ) return new Error('can not find teams at event '+ eventId);
		return teams;
	});
};

db.getTeamMatch = function(eventId, matchNum, teamId) {
	return convertToQPromise(
		TeamMatch.findOne({ match:matchNum, team:teamId, event:eventId }) 
		.exec()
	)

	.then( function testForNullValues(teamMatch) {
		console.log(teamMatch);

		// null values are errors
		if( _.isNull(teamMatch) ) return new Error('can not find teamMatch '+ eventId +', '+ matchNum +', '+ teamId);
		return teamMatch;
	})

	.catch(function(err) {
		console.log(err);
	});
};

db.newUnsavedTeamMatch = function(info ) {
	return convertToQPromise(
		Match.find({})
		.$where('this.redAlliance.teams &contains; '+ teamNumber +' || this.blueAlliance.teams &contains; '+ teamNumber)
		.exec()
	);
};

db.addTeamMatchToMatch = db.addTMToMatch = function(event, matchNum, data) {

};

db.getDataForMatch = function(eventId, number) {

};

db.getMatchDataForTeam = function(teamId) {

};

db.TeamMatch = TeamMatch;
db.Team = Team;
db.Event = Event;
db.Match = Match;

module.exports = exports = db;

