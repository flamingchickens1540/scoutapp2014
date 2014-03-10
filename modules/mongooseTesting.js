var mongoose = require('mongoose');
var _ = require('underscore');
var ObjectId = mongoose.Schema.Types.ObjectId;

require('./../db_modules/models/event.js');
require('./../db_modules/models/team.js');
require('./../db_modules/models/match.js');
require('./../db_modules/models/team_match.js');

var q = require('q');
db = require('./db_api.js');

db.connect();





var eventToFind = "casb";
var matchToFind = 30;

var matchList = [];





db.getMatch(eventToFind, matchToFind) //returns a promise that calls .then
.then(function getMatch(match){

	for (var r=0; r<3; r++){
		console.log(" ");
	}

	console.log("Match Number: "+match.number);
	console.log("Moderated?:" +match.moderated);
	console.log("Completed?: "+match.complete);

});


	//casb