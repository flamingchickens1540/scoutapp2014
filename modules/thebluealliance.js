var req = require('request');

// all TBA API v2 requests go to this root folder
var rootURL = 'http://www.thebluealliance.com/api/v2/';

// you have to set a header in order to get the request methods
exports = module.exports = function(name, description, version) {
	
	var headers = { "X-TBA-App-Id":null };
	var isDefined = function(variable) { return (typeof variable !== 'undefined' && variable !== null); };


	if( isDefined(name) && isDefined(description) && isDefined(version) )
		headers['X-TBA-App-Id'] = [name,description,'v'+version].join(':');
	else
		throw new Error('can not set header with null or undefined values');

	var tba = {};

	tba['getTeam'] = function(teamId, year, callback) {

		// arguments validation for year and callback
	  switch( typeof year ) {
	  	case 'number':
	  		year = year;
	  		break;

	  	case 'function':
	  		callback = year;
	  		year = undefined;

	  	case 'undefined':
	  		year = new Date().getFullYear();
	  		break;
	  }

	  req.get({ headers:headers, url:rootURL+'team/frc'+ teamId +'/'+ year },

	  	function(err, res) {
	  		if(!err) {
	  			var teamInfo = JSON.parse(res.body);

	  			if(res.statusCode === 200)
	  				// successful request
	  				callback( null, teamInfo );
	  			
	  			else
	  				// Unsuccessful because of 404 or something
	  				callback( new Error('Unsuccessful request to TBA'), null, null );
	  		}

	  		else
	  			// error in request
	  			callback(err, null, null);
	  	}

	  );
	};

	tba['getEventById'] = function() {};
	tba['getTeamsByEvent'] = function() {};
	tba['getMatchesByTeam'] = function() {};

	return tba;
};
