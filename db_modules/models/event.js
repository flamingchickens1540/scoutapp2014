'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;


/**
* Event Schema
*/

var EventSchema = new Schema({
	//ex. ORPO
	id: { type:String, unique:true },

	name: String,
	region: String,
	location: String,
	dates: [Date],

	teams: [{
		type: ObjectId,
		ref:'Team',
		default: []
	}],
	
	matches: [{
		type: ObjectId,
		ref:'Match',
		default: []
	}]
});

mongoose.model('Event', EventSchema);
