var _ = require('underscore');
var dataPathways = {};

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


