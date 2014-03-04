'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

/**
* Match Schema
*/

var MatchSchema = new Schema({
	event: { type:String, required:'Event id is required' },

	number: { type:Number, required:'Match number is required' },

	//timeStamp: { type:Date },

	// TeamMatch data for each team
	red1Data: { type:ObjectId, ref:'TeamMatch' },
	red2Data: { type:ObjectId, ref:'TeamMatch' },
	red3Data: { type:ObjectId, ref:'TeamMatch' },

	blue1Data: { type:ObjectId, ref:'TeamMatch' },
	blue2Data: { type:ObjectId, ref:'TeamMatch' },
	blue3Data: { type:ObjectId, ref:'TeamMatch' },

	redAlliance: {
		teams: [{ type:Number, default:[], required:'Requires 3 red teams' }],
		score: Number,
		fouls: Number
	},

	blueAlliance: {
		teams: [{ type:Number, default:[], required:'Requires 3 blue teams' }],
		score: Number,
		fouls: Number
	},
	
	moderated: { type: Boolean, default: false },
	complete: { type: Boolean, default: false }
});

mongoose.model('Match', MatchSchema);
