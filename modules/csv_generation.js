var db = require("./db_api.js"); // in modules folder
var _ = require('underscore');
var fs = require('fs');
var q = require('q');

db.connect();

// PIT
db.getTeamsAtEvent('casb')

.then( function getData(teams) {

	var pitHeaders = [
		"Team Number",
		"Front Left Wheel Type",
		"Front Right Wheel Type",
		"Middle Left Wheel Type",
		"Middle Right Wheel Type",
		"Back Left Wheel Type",
		"Back Right Wheel Type",
		"Shifting Ability",
		"Can Shoot Far",
		"Can Shoot Medium",
		"Can Shoot Near",
		"Can Shoot Low Goal",
		"Shooter Type",
		"Collector Type",
		"Catching Ability",
		"Preffered Playstyle",
		"Plan for when Disabled",
		"Drives Forward",
		"Balls they can score in Auto",
		"Hot Goal Recognition",
		"Notes"
	];

	var pitInfo = [pitHeaders];

	_.each( teams, function(team) {
		var pit = team.pit;
		var general = pit.general;
		var auto = pit.auto;
		var robot = pit.robot;

		var pitLine = [
			team.id,
			// wheel info
			general.wheel.wheelL1,
			general.wheel.wheelR1,
			general.wheel.wheelL2,
			general.wheel.wheelR2,
			general.wheel.wheelL3,
			general.wheel.wheelR3,

			general.shifting,
			general.shootingRange.far,
			general.shootingRange.medium,
			general.shootingRange.near,
			general.shootingRange.low,

			robot.shooterType,
			robot.collectorType,
			robot.catchable,
			robot.playstyle,

			auto.dfAuto,
			auto.autoBalls,
			auto.hotRecog,

			pit.notes
		];

		// add data to array
		pitInfo.push(pitLine);
	});

	return pitInfo;
})

.then( function joinArray(pitInfo) {
	var pitCSVArray = _.map( pitInfo, function(pitLineArray) {
		return pitLineArray.join(',');
	});

	var pitCSV = pitCSVArray.join('\n');
	return pitCSV;
})

.then( function writeFile(csvText) {
	fs.writeFile('./pit.csv', csvText, function(e) {
		console.log('ERR: '+e);
	});
})

.catch(function errHandler(err) {
	console.error(err);
});

// SCOUT
db.getTeamsAtEvent("casb")
.then(function scoutData(teams) {
	var scoutHeader = [
		"Team Number",
		"Match Number",
	 	"Starting Position",
	 	"Drives Forward",
	 	"Auto Goals Made",
	 	"Auto Goals Missed",
	 	"Auto Goals Made in Hot Goal",
	 	"Auto Goalie Shots Blocked",
	 	"Auto Goalie Unsuccessful Blocks",
	 	"Is a Dozer",
	 	"Is a Goalie",
	 	"Is a Truss Shooter",
	 	"Is Defensive",
	 	"Is a Shooter",
	 	"High Goals Made",
	 	"High Goals Missed",
	 	"Low Goals Made",
	 	"Low Goals Missed",
	 	"Rolled Balls Received",
	 	"Truss Balls Received",
	 	"Rolled Balls Passed",
	 	"Truss Balls Passed",
	 	"Human-pass Capable?",
	 	"Dead/Broken",
	 	"DeadBroken Notes",
	 	"Passive Ejection",
	 	"Ejection Notes",
	 	"Driving Rating",
	 	"Shooting Rating",
	 	"Passing Rating",
	 	"Defense Rating",
	 	"Catching Rating",
	 	"Collection Rating"
	];

	var scoutInfo = [scoutHeader];

	_.each(teams, function(team) {
		var teamMatches = team.matches;

		_.each( teamMatches, function(teamMatch) {
			var data = teamMatch.data;
			var auto = data.auto;
			var teamwork = data.teamwork;
			var scoring = data.scoring;
			var submit = data.submit;
			var issues = data.issues;

			var teamMatchArray = [
				team.id,
				teamMatch.match, // number

				auto.startPosition,
				auto.fieldValues.goal,
				auto.fieldValues.miss,
				auto.fieldValues.hotgoal,
				auto.drivesForward,
				auto.goalieValues.block,
				auto.goalieValues.miss,
			];

			for(var i = 0; i < scoring.playStyles.length; i++) {
				teamMatchArray.push( scoring.playStyles[i].action ); // has to be in order
			}

			teamMatchArray = teamMatchArray.concat([
				scoring.goals.high,
				scoring.goals.highMisses,
				scoring.goals.low,
				scoring.goals.lowMisses,

				teamwork.receiving.roll,
				teamwork.receiving.truss,
				teamwork.passing.roll,
				teamwork.passing.truss,

				teamwork.humanPass,

				issues.deadBroken,
				issues.deadBrokenNotes,
				issues.ejectable,
				issues.ejectionNotes
			]);

			for(var i = 0; i < submit.ratings.length; i++) {
				teamMatchArray.push( submit.ratings[i].stars ); // has to be in order
			}

			console.log(teamMatchArray);

			scoutInfo.push(teamMatchArray);
		});
	});

	//console.log(scoutInfo);

	return scoutInfo;
})

.then( function joinScoutData(scoutInfo) {
	var scoutCSVArray = _.map( scoutInfo, function(scoutLineArray) {
		return scoutLineArray.join(',');
	});

	var scoutCSV = scoutCSVArray.join('\n');
	return scoutCSV;
})

.then( function writeFile(csvText) {
	fs.writeFile('./scout.csv', csvText, function(e) {
		console.log('ERR: '+e);
	});
})

.catch(function errHandler(err) {
	console.error(err);
});
