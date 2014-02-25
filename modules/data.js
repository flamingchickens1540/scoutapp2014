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


dataPathways['matchData'] = function(data, callback) {
	//save
	


	callback(null, 'Nice Job! Saved!')
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


