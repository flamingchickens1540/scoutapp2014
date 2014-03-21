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
		if( _.isUndefined(team) ) return new Error('can not find team '+ teamId);
		return team;
	});
};

db.newTeam = function(id, name, events) {
	db.getTeam(id)
	.then(function(team) {
		if( !_.isNull(team) ) {
			var team = new Team();

			team.id = id;
			team.name = name;
			team.events = events;

			return q.ninvoke(team, 'save');
		}
	})

	.then(function(err) {
		if(!err) console.log('new team '+ id + 'created');
		else console.log('new team '+ id + ' not created');
	}); 
};

db.getTeams = db.getTeamsById = function(teamIdArray) {

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
db.getTeamMatchesAtEvent = function(eventId) {
	return convertToQPromise(
		TeamMatch.find({ event:eventId }) // events array contains eventId
		.populate('matches')
		.exec()
	)

	.then( function testForNullValues(teamMatches) {
		// null values are errors
		if( _.isNull(teams) || _.isEmpty(teams) ) return new Error('can not find teamMatches at event '+ eventId);
		return teamMatches;
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

db.teamMatchExists = function(eventId, matchNum, teamId) {
	return convertToQPromise(
		TeamMatch.findOne({ match:matchNum, team:teamId, event:eventId }) 
		.exec()
	)

	.then( function testForNullValues(teamMatch) {
		console.log(teamMatch);

		// null values are errors
		if( _.isNull(teamMatch) ) return false;
		return true;
	})

	.catch(function(err) {
		console.log(err);
	});
};

// for random generation
db.newTeamMatch = function(data) {
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

