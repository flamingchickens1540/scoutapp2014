'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Mixed = Schema.Types.Mixed;


var TeamMatchSchema = new Schema({
	team: {
		type: ObjectId,
		ref: 'Team'
	},

	match: {
		type: ObjectId,
		ref:'Match'
	},

	scout: String,
	
	data: Mixed
	
});

mongoose.model('TeamMatch', TeamMatchSchema);