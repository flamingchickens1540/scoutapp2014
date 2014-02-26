'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

/**
* Match Schema
*/

var MatchSchema = new Schema({
	event: String,

	number: Number,

	//timeStamp: { type:Date },

	redAlliance: {
		teams: [{ type:Number, default:[] }],

		teamData: [{
			type: ObjectId,
			ref:'TeamMatch'
		}],
	},

	blueAlliance: {
		teams: [{ type:Number, default:[] }],

		teamData: [{
			type: ObjectId,
			ref:'TeamMatch'
		}]
	},
	
	moderated: { type: Boolean, default: false },
	complete: { type: Boolean, default: false }
});

mongoose.model('Match', MatchSchema);
