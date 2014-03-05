'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Mixed = Schema.Types.Mixed;


var TeamMatchSchema = new Schema({
	team: { type:ObjectId, ref:'Team', required:'Team Matches requires a team' },

	match: { type: ObjectId, ref:'Match', required:'Team Matches requires a match' },

	color: { type:String, required:'Team matches must specify the position' },
	posNum: { type:Number, required:'Team matches must specify the position' },

	scout: String,
	
	data: Mixed
});

mongoose.model('TeamMatch', TeamMatchSchema);