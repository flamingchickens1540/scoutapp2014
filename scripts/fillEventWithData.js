var mongoose = require('mongoose');
var _ = require('underscore');
var q = require('q');
var db = require('./../modules/db_api.js');

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

var eventId = 'casb';

db.connect();

var matches = db.getMatchesAtEvent( eventId )

.then( function(matches) {

	return q.all( _.map( matches, function(match) {

		console.log(match);

		var red1Data = db.newTeamMatch( generateRandomScoutData( match.redAlliance.teams[0], parseInt(match.number), 'red', 1 ));
		var red2Data = db.newTeamMatch( generateRandomScoutData( match.redAlliance.teams[1], parseInt(match.number), 'red', 2 ));
		var red3Data = db.newTeamMatch( generateRandomScoutData( match.redAlliance.teams[2], parseInt(match.number), 'red', 3 ));

		var blue1Data = db.newTeamMatch( generateRandomScoutData( match.blueAlliance.teams[0], parseInt(match.number), 'blue', 1 ));
		var blue2Data = db.newTeamMatch( generateRandomScoutData( match.blueAlliance.teams[1], parseInt(match.number), 'blue', 2 ));
		var blue3Data = db.newTeamMatch( generateRandomScoutData( match.blueAlliance.teams[2], parseInt(match.number), 'blue', 3 ));

		return q.all([ red1Data, red2Data, red3Data, blue1Data, blue2Data, blue3Data ]);

	}));
});

var teams = db.getTeamsAtEvent('casb')

.then( function(teams) {
	return q.all( _.map(teams, function(team) {
		team.pit = generateRandomPitData();
		return q.ninvoke(team, 'save');
	}));
})

.catch( function(err) {
	console.error(err);
});






var generateRandomScoutData = function(teamId, matchNum, posColor, posNum) {
	var info = {
    scout: 'Anna Dodson',
    event: eventId,
    team: teamId,
    matchNum: matchNum,
    posNum: posNum,
    color: posColor
  };

	var auto = {
		startPosition: (TorF())? 'field': 'goalie',
		drivesForward: TorF(),
		fieldValues: {
      goal: random(3),
      miss: random(3),
      hotgoal: random(3)
		},
		goalieValues: {
			block: random(3),
      miss: random(3)
		}
	};

	var scoring = {
		playStyles: [      
			{ name: 'dozer', action: TorF() },
      { name: 'goalie', action: TorF() },
      { name: 'truss shooter', action: TorF() },
      { name: 'defense', action:  TorF() },
      { name: 'shooter', action:  TorF() }
     ],
    goals: {
      high: random(6),
      highMisses: random(6),

      low: random(6),
      lowMisses: random(6)
    }
	};

	var teamwork = {
		receiving: {
      roll: random(10),
      truss: random(10)
    },
    passing: {
      roll: random(10),
      truss: random(10)
    },
    humanPass: TorF()
	};

	// never issues
	var issues = {
		deadBroken: null,
    deadBrokenNotes: '',

    ejectable: null,
    ejectionNotes: ''
	};

	var submit = {
		ratings: [
      { title: 'driving', stars: random(5)+1 },
      { title: 'shooting', stars: random(5)+1 },
      { title: 'passing', stars: random(5)+1 },
      { title: 'defense', stars: random(5)+1 },
      { title: 'catching', stars: random(5)+1 },
      { title: 'collecting', stars: random(5)+1 }
		],
    numStars: 5,

    notes: random(24357108834751062937509),
    currentNotes: ''
	};

	return {
		info:info,
		auto:auto,
		scoring:scoring,
		teamwork:teamwork,
		issues:issues,
		submit:submit
	};
};

var generateRandomPitData = function() {

	var wheel = chooseOne([ 'None', 'High Traction', 'Kit', 'Mecanum', 'Omni', 'Swerve', 'Caster' ]);
  var general = {
    wheel: {
      'wheelL1': wheel,
      'wheelL2': wheel,
      'wheelL3': wheel,
      'wheelR1': wheel,
      'wheelR2': wheel,
      'wheelR3': wheel
    },

    shifting: TorF(),

    shootingRange: {
      far: TorF(),
      medium: TorF(),
      near: TorF(),
      low: TorF()
    }    
  };

  var robot = {
    shooterType: chooseOne([ 'Catapult', 'Spinner', 'Kicker', 'Slingshot', 'Puncher', 'None' ]),
    collectorType: chooseOne([ 'Claw', 'Toro', 'Rollers', 'Passive', 'None' ]),

    catchable: TorF(),

    disabledPlan: random(4590581290378934),

    playstyle: chooseOne([ 'All', 'Passer', 'Shooter', 'Defense', 'Goalie' ])
  };

  var auto = {
    dfAuto: TorF(), // drives forward
    autoBalls: random(4),
    hotRecog: TorF()
  };

	return {
    general: general,
    robot: robot,
    auto: auto,
    notes: random(894375023904758926123857089)
   };
};

var random = function(number) {
	return Math.floor( number*Math.random() );
};

var TorF = function() {
	return ( Math.round(Math.random()) )? true: false;
};

var chooseOne = function(options) {
	return options[ random(options.length) ] || null;
};

