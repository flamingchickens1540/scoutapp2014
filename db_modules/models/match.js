'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

/**
* Match Schema
*/

var MatchSchema = new Schema({
	event: {
		type: ObjectId,
		ref:'Event'
	},

	number: Number,

	// startTime: TBA?

	redAlliance: {
		teams: [{
			type: ObjectId,
			ref: 'Team'
		}],

		teamData: [{
			type: ObjectId,
			ref:'TeamMatch'
		}],

		/* BLUE ALLIANCE DATA
		score: Number,
		fouls: Number, //points or number?
		*/
	},

	blueAlliance: {
		teams: [{
			type: ObjectId,
			ref: 'Team'
		}],

		teamData: [{
			type: ObjectId,
			ref:'TeamMatch'
		}]

		/* BLUE ALLIANCE DATA
		score: Number,
		fouls: Number, //points or number?
		*/
	},
	
	moderated: { type: Boolean, default: false },
	complete: { type: Boolean, default: false }
});



mongoose.model('Match', MatchSchema);
