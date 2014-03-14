var db = require("./db_api.js");
var _ = require('underscore');
var fs = require('fs')

db.connect();

var pitHeader = [];
pitHeader.push("Team Number");
pitHeader.push("Front Left Wheel Type");
pitHeader.push("Front Right Wheel Type");
pitHeader.push("Middle Left Wheel Type");
pitHeader.push("Middle Right Wheel Type");
pitHeader.push("Back Left Wheel Type");
pitHeader.push("Back Right Wheel Type");
pitHeader.push("Wheel Notes");
pitHeader.push("Robot Height");
pitHeader.push("Shifting Ability");
pitHeader.push("Minimum Shooting Distance");
pitHeader.push("Maximum Shooting Distance");
pitHeader.push("Shooter Type");
pitHeader.push("Collector Type");
pitHeader.push("Catching Ability");
pitHeader.push("Preffered Playstyle")
pitHeader.push("Plan for when Disabled");
pitHeader.push("Simple Autonomous");
pitHeader.push("Balls they can score in Auto");
pitHeader.push("Hot Goal Recognition");
pitHeader.push("Autonomous Starting Position");
pitHeader.push("Notes");

var pitHeaderLine = pitHeader.join(',');
console.log(pitHeaderLine);

fs.writeFile('./pit.txt', pitHeaderLine, function (err) {
  if (err) throw err;
  console.log('It\'s saved!');
});

var scoutHeader = [];
scoutHeader.push("Match Number");
scoutHeader.push("Team Number");
scoutHeader.push("Autonomous Starting Position");
scoutHeader.push("Simple Autonomous");
scoutHeader.push("Goals Made");
scoutHeader.push("Goals Missed");
scoutHeader.push("Goals Made in Hot Goal");
scoutHeader.push("Shots Blocked");
scoutHeader.push("Unsuccessful Blocking Attempts");
scoutHeader.push("Playstyles");
scoutHeader.push("High Goals Made");
scoutHeader.push("Low Goals Made");
scoutHeader.push("Played in Zone 1");
scoutHeader.push("Played in Zone 2");
scoutHeader.push("Played in Zone 3");
scoutHeader.push("Played in Goalie Zone");
scoutHeader.push("Rolled Balls Recieved");
scoutHeader.push("Truss Balls Recieved");
scoutHeader.push("Aerial Balls Recieved");
scoutHeader.push("Rolled Balls Passed");
scoutHeader.push("Truss Balls Passed");
scoutHeader.push("Aerial Balls Passed");
scoutHeader.push("Dead/Broken");
scoutHeader.push("Notes");
scoutHeader.push("Passive Ejection");
scoutHeader.push("Notes");
scoutHeader.push("Driving Rating");
scoutHeader.push("Shooting Rating");
scoutHeader.push("Passing Rating");
scoutHeader.push("Defense Rating");
scoutHeader.push("Catching Rating");
scoutHeader.push("Overall Notes");

var scoutHeaderString = scoutHeader.join(',');
console.log(scoutHeaderString);

fs.writeFile('./matches.txt', scoutHeaderString, function (err) {
  if (err) throw err;
  console.log('It\'s saved!');
});

db.getTeamsAtEvent("casb")
.then(function scoutData(teamMatches) {
	_.each(teamMatches, function(teamMatch) {
		var scoutData = team_match.data;
		var teamData = team_match;

		//MORE CSV GENERATION STUFF
		var scoutInfo = [];
		scoutInfo.push(team_match.match);
		scoutInfo.push(team_match.team);
		scoutInfo.push(scoutData.auto.startPosition);
		scoutInfo.push(scoutData.auto.drivesForward);		
		scoutInfo.push(scoutData.auto.fieldValues.goal);
		scoutInfo.push(scoutData.auto.fieldValues.miss);
		scoutInfo.push(scoutData.auto.fieldValues.hotgoal);		
		scoutInfo.push(scoutData.auto.goalieValues.block);
		scoutInfo.push(scoutData.auto.goalieValues.miss);
		scoutInfo.push(scoutData.scoring.playStyles);
		scoutInfo.push(scoutData.scoring.goals.high);
		scoutInfo.push(scoutData.scoring.goals.low);
		scoutInfo.push(scoutData.teamwork.zones[0]);
		scoutInfo.push(scoutData.teamwork.zones[1]);
		scoutInfo.push(scoutData.teamwork.zones[2]);
		scoutInfo.push(scoutData.teamwork.zones[3]);
		scoutInfo.push(scoutData.teamwork.recieving.roll);
		scoutInfo.push(scoutData.teamwork.recieving.truss);
		scoutInfo.push(scoutData.teamwork.recieving.aerial);
		scoutInfo.push(scoutData.teamwork.passing.roll);
		scoutInfo.push(scoutData.teamwork.passing.truss);
		scoutInfo.push(scoutData.teamwork.passing.aerial);
		scoutInfo.push(scoutData.issues.deadBroken);
		scoutInfo.push(scoutData.issues.deadBrokenNotes);
		scoutInfo.push(scoutData.issues.ejectable);
		scoutInfo.push(scoutData.issues.ejectableNotes);
		scoutInfo.push(scoutData.submit.ratings[0]);
		scoutInfo.push(scoutData.submit.ratings[1]);
		scoutInfo.push(scoutData.submit.ratings[2]);
		scoutInfo.push(scoutData.submit.ratings[3]);
		scoutInfo.push(scoutData.submit.ratings[4]);
		scoutInfo.push(scoutData.submit.notes);

		var scoutLine = scoutData.join(',');
		console.log(scoutLine);

		fs.writeFile('matches.txt', scoutLine, function (err) {
		  if (err) throw err;
		  console.log('It\'s saved!');
		});
	})
})

.then(function pitData(teams) {
	_.each(teams, function(team) {
		var pitData = team.pit;

		// CSV GENERATION STUFF
		var pitInfo = [];
		pitInfo.push(pitData.general.teamNumber);
		pitInfo.push(pitData.general.wheelL1);
		pitInfo.push(pitData.general.wheelR1);
		pitInfo.push(pitData.general.wheelL2);
		pitInfo.push(pitData.general.wheelR2);
		pitInfo.push(pitData.general.wheelL3);
		pitInfo.push(pitData.general.wheelR3);
		pitInfo.push(pitData.general.wheelNotes);
		pitInfo.push(pitData.general.robotHeight);
		pitInfo.push(pitData.general.shifting);
		pitInfo.push(pitData.robot.minShoot);
		pitInfo.push(pitData.robot.maxShoot);
		pitInfo.push(pitData.robot.shooterType);
		pitInfo.push(pitData.robot.collectorType);
		pitInfo.push(pitData.robot.catchable);
		pitInfo.push(pitData.robot.playstyle);
		pitInfo.push(pitData.robot.disabledPlan);
		pitInfo.push(pitData.auto.dfAuto);
		pitInfo.push(pitData.auto.autoBalls);
		pitInfo.push(pitData.auto.hotRecog);
		pitInfo.push(pitData.auto.startPosition);
		pitInfo.push(pitData.notes);

		var pitLine = pitInfo.join(',');
		console.log(pitLine);

		fs.writeFile('pit.txt', pitLine, function (err) {
		  if (err) throw err;
		  console.log('It\'s saved!');
		});
	});
})
.catch(function errHandler(err) {
	console.error(err);
});
