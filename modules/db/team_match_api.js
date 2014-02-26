/**********************************************
== Schema ==
Team: tracks team matches, score, and qualScore
(unimplemented) Event: tracks where an event is and the matches that occur. Will be expanded eventually to support multiple events

getTeam: gets an individual team, populates matches (ID, CALLBACK)
getTeams: gets multiple or all teams, populates matches - accepts ([TEAM_IDS] - optional, CALLBACK)
addTeam: creates new team (ID, NAME, CALLBACK)
removeTeam: deletes one team (ID, CALLBACK)
updateTeam: updates one team (ID, UPDATE_OBJ, CALLBACK)


require('./../db_modules/models/team.js');