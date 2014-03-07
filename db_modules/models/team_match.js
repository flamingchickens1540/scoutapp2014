'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Mixed = Schema.Types.Mixed;


var TeamMatchSchema = new Schema({
	team: { type:Number, required:'Team Matches requires a team id' },
	event: { type: String, required:'Team Matches requires an event id' },
	match: { type: String, required:'Team Matches requires a match number' },

	color: { type:String, required:'Team matches must specify the position' },
	posNum: { type:Number, required:'Team matches must specify the position' },

	scout: String,
	
	moderated: { type: Boolean, default: false },

	data: Mixed
});

mongoose.model('TeamMatch', TeamMatchSchema);