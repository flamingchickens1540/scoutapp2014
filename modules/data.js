var _ = require('underscore');
var mongoose = require('mongoose');

var db = require('./db.js');

var dataPathways = {};

// models
var TeamMatch = mongoose.model('TeamMatch');
var Team = mongoose.model('Team');
var Match = mongoose.model('Match');
var Event = mongoose.model('Event');

var ObjectId = mongoose.Types.ObjectId;
var Promise = mongoose.Promise;

// for match data
dataPathways['matchData'] = function(data, callback) {
	var info = {
    scout: data.info.scout,
    event: data.info.event,
    team: data.info.team,
    matchNum: data.info.matchNum
  };
	var auto = data.auto;
	var scoring = data.scoring;
	var teamwork = data.teamwork;
	var issues = data.issues;
	var submit = data.submit;


	var findMatch = Match.findOne( { event:'orpo' } ).exec()

	.then(
		function foundMatch(match) {
			console.log('MATCH ', match);
			findMatch.fulfill(match);
		},

		function errorFindingMatch(err) {
			console.error( 'ERROR finding match' , err );
			findMatch.reject( 'Need a match to save team_match to' );
		}
	);

	var saveTeamMatch = findMatch.onFulfill( 

		// create the team_match, then pass it to the team object for team reference
		function createTeamMatch(match) {

			console.log('MATCH in CREATE_TEAM_MATCH', match);

			// match instance for this team
			var teamMatch = new TeamMatch({
				// stores a reference to the overall match object
				match: match,

				scout: info.scout,

				// team data
				data: {
					auto: auto,
					scoring: scoring,
					teamwork: teamwork,
					issues: issues,
					submit: submit
				}
			});

			teamMatch.save(function(err) {

				// reject for error
				if(err)
					saveTeamMatch.reject('Could not save teamMatch', err);

				// fulfill for successful save
				else {
					console.log('TEAM_MATCH in SAVE CALLBACK', teamMatch);
					saveTeamMatch.fulfill(teamMatch);
				}
			});
		} 

	)

	.then(

		function saveTeamMatchToTeam(teamMatch) {

			console.log('TEAM_MATCH in SAVE to TEAM', teamMatch);

			// when a team is gotten and a teamMatch is made and saved
			// save the teamMatch to the team
			var getTeam = Team.findOne( { id:1540 } ).exec()

			.then( 

				function retrieveTeamFromDb(team) {
					// add the new teamMatch
					team.matches.push(teamMatch);

					team.save(function(err) {
						
						if(err)
							getTeam.reject('Failed to save teamMatch to team');

						else {
							console.log('TEAM ', team);
							getTeam.fulfill();
						}

					});

				},

				function failToRetrieveTeamFromDb(err) {
					console.error(err);
				}

			);
		},

		function failToSaveTeamMatch(err) {
			console.error(err);
			saveTeamMatch.end();
		}

	);

};

dataPathways['pitData'] = function(data, callback) {
	console.log('PITDATA', data);
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
