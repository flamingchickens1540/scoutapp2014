exports.mongoose = exports.m = m = require('mongoose');
m.connect('localhost', 'scoutapp2014test');

require('./../db_modules/models/match.js');
require('./../db_modules/models/team_match.js');
require('./../db_modules/models/team.js');
require('./../db_modules/models/event.js');

exports.Match = m.model('Match');
exports.TeamMatch = m.model('TeamMatch');
exports.Team = m.model('Team');
exports.Event = m.model('Event');
