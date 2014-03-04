'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

/**
* Team Schema
*/

var TeamSchema = new Schema({
	// ex. 1540
	id: { type: Number, required:'All teams must have an FRC id number', unique:true },
	name: String,
	info: {
		location: String,
		//relevant awards
		awards: [String],
	},

	pit: {},
	masterNotes: { type:String, default:'' },

	matches: [{ type:ObjectId, ref:'TeamMatch', default:[] }],

	events: [{ type:String, default:[] }]

});



var awards = ['Chairman’s Award', 'Creativity Award sponsored by Xero', 'Engineering Inspiration Award', 'Entrepreneurship Award sponsored by Kleiner Perkins Caufield & Byers', 'Excellence in Engineering Award sponsored by Delphi', 'Finalist', 'FIRST Dean’s List Award', 'FIRST Future Innovator Award sponsored by the Abbott Fund', 'Founder’s Award', 'Gracious Professionalism® Award sponsored by Johnson & Johnson', 'Highest Rookie Seed Award', 'Imagery Award in honor of Jack Kamen', 'Industrial Design Award sponsored by General Motors', 'Industrial Safety Award sponsored by Underwriters Laboratories', 'Innovation in Control Award sponsored by Rockwell Automation', 'Judges’ Award', 'Media & Technology Innovation Awardsponsored by Comcast', 'Quality Award sponsored by Motorola', 'Rookie All-Star Award', 'Rookie Inspiration Award', 'Safety Animation Award sponsored by UL', 'Team Spirit Award sponsored by Chrysler', 'Volunteer of the Year Award', 'Winner', 'Woodie Flowers Finalist Award'];


mongoose.model('Team', TeamSchema);
