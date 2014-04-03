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

var dbName = dbName || 'mockdata2014';

console.log('DBNAME:', dbName);
mongoose.connect('localhost', dbName);

TeamMatch.remove().exec(function(err) {
	if(!err) {
		console.log('Removed all TeamMatch data');
	}
});

Team.find(function(err,teams) {
	teams.forEach(function(team) {
		team.matches = []; 
		team.pit = {};
		team.masterNotes = '';
		team.save(function(err) {
			if(!err) {
				console.log('Scout data for team '+ team.id +' removed!');
			}
		});
	});
}).exec();

Match.find(function(err, matches) {
	matches.forEach(function(match) {
		match.red1Data = null; 
		match.red2Data = null; 
		match.red3Data = null; 
		match.blue1Data = null; 
		match.blue2Data = null; 
		match.blue3Data = null; 
		match.save(function(err) {
			if(!err) {
				console.log('Scout data for match '+ match.number +' at event '+ match.event +' removed!');
			}
		});
	});
}).exec();
