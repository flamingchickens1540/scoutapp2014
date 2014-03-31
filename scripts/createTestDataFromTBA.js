// GOAL: turn this into a command line script
// populateTBATestData --event casb --year 2014 --db scoutmock2014
// eventually requires commander


var mongoose = require('mongoose');
var _ = require('underscore');
var q = require('q');

require('./../db_modules/models/event.js');
require('./../db_modules/models/team.js');
require('./../db_modules/models/match.js');
require('./../db_modules/models/team_match.js');

//Models
var Team = mongoose.model('Team');
var Match = mongoose.model('Match');
var TeamMatch = mongoose.model('TeamMatch');
var Event = mongoose.model('Event');

var tba = require('thebluealliance')('hamzah','1540scouting','0.0.1');

// use command line args or defaults
var eventId = eventId || 'orwil';
var year = year || (new Date()).getFullYear();
var dbName = dbName || 'pre-osu2014';

console.log('DBNAME:', dbName);
mongoose.connect('localhost', dbName);

// remove all current models => use promises
// not done yet

var models = {};
// hold the created models
models.event = null;
models.teams = [];
models.matches = [];

// returns an FRC id number 'frc1540' => 1540
var truncateFRC = function(tbaTeamIdString) { return parseInt( tbaTeamIdString.slice(3) ); };


// get this event from TBA
var createEvent = q.nfcall(tba.getEvent, eventId, year)
.then( function createEventObject(event) {
	// issue with the tba code
	if(event == null) return new Error('invalid event code, '+ eventId);

	models.event = new Event();
	models.event['id'] = event.event_code.toLowerCase();
	models.event['name'] = event.name;
	models.event['location'] = event.location;
	models.event['dates'] = [ new Date(event.start_date), new Date(event.end_date) ];

	console.log('======== CREATED EVENT OBJECT ========');
	return models.event;
});


var createAllTeams = q.nfcall(tba.getTeamsAtEvent, eventId, year)
.then( function createAllTeamObjects(teams) {
	if(_.isEmpty(teams) || teams == null) return new Error('invalid event code, '+ eventId);

	_.each(teams, function(teamInfo) {
		var team = new Team();

		team['id'] = teamInfo.team_number;
		team['name'] = teamInfo.nickname || 'FRC '+ teamInfo.team_number;
		team['info'] = { 'location':teamInfo.location };
		team['events'].push( eventId );

		models.teams.push(team);
	});

	console.log('======== CREATED TEAM OBJECTS ========');
	return models.teams;
});


var createAllMatches = q.nfcall(tba.getMatchesAtEvent, eventId, year)
.then( function createAllMatchObjects(matches) {
	if(_.isEmpty(matches) || matches == null) return new Error('invalid event code, '+ eventId);

	_.each(matches, function(matchInfo) {
		// i only want qualification matches
		if( matchInfo.comp_level === 'qm' ) {
			var match = new Match();
			// converts strings => numbers
			var redTeams = _.map( matchInfo.alliances.red.teams, truncateFRC );
			var blueTeams = _.map( matchInfo.alliances.blue.teams, truncateFRC );

			match['event'] = eventId;
			match['number'] = matchInfo.match_number;
			match['redAlliance'] = { 'teams':redTeams };
			match['blueAlliance'] = { 'teams':blueTeams };

			models.matches.push(match);
		}
	});

	console.log('======== CREATED MATCH OBJECTS ========');
	return models.matches;
});


q.all( [ createEvent, createAllTeams, createAllMatches ] )
.spread( function saveModelsToDb(event, teams, matches) {

	var saveTeams, saveMatches;

	// saves each team to database
	saveTeams = _.map(teams, function saveEachTeam(team) { 

		team.save(function(err) {
			if(!err) console.log('saved team '+ team.id +' to database');
			else { console.log(err); return err;}
		}); 
	});

	// saves each match to database
	saveMatches = _.map(matches, function saveEachTeam(match) { 
		console.log(match._id);
		return q.ninvoke( match, 'save')

		.then(function(err) {
			if(!err) console.log('saved match '+ match.number +' to database');
			else return new Error(' failed to save match '+ match.number +' to database');
		}); 
	});

	q.all([ saveTeams, saveMatches ])
	.then( function(stuff) {

		console.log(event);

		event['id'] = eventId;
		event['teams'] = teams;
		event['matches'] = matches;

		event.save(function(err) {
			if(!err) console.log('saved event '+ event.id +' to database');
			else console.log('failed to save event '+ event.id +' to database'+err.message);
		});
	});

})

.then(

	function successfulScriptRun() {
		//console.log('\nSuccessfully shutting down...');
		// breaks the program due to async in js - process.exit(0);
	}

)

.fail(

	function catchGetEventError(err) {
		console.log('ERR: '+ err);
		console.log('\nShutting down...');
		//process.exit(1);
	}

);

module.exports = exports = {
	Team:Team,
	Match:Match,
	TeamMatch:TeamMatch,
	Event:Event
};
