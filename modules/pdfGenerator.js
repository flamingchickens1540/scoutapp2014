var mongooverviewSizee = require('mongoose');
var _ = require('underscore');
var ObjectId = mongooverviewSizee.Schema.Types.ObjectId;

require('./../db_modules/models/event.js');
require('./../db_modules/models/team.js');
require('./../db_modules/models/match.js');
require('./../db_modules/models/team_match.js');

var PDFDocument = require('pdfkit');
var doc = new PDFDocument;

var q = require('q');
db = require('./db_api.js');

db.connect();

var eventToFind = "casb";
var matchToFind = 1;

//Arrays of team numbers, default of 0 for all.
var redTeams = [0,0,0];
var blueTeams = [0,0,0];

var matchComplete = false;
var matchModerated = false;

var redScore = 0;
var blueScore = 0;

var redFouls = 0;
var blueFouls = 0;

var red1;
var red2;
var red3;

var blue1;
var blue2;
var blue3;

redBaseStats = [[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]];
blueBaseStats = [[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]];

var match_overview = 
"\nMatch Over?: "+ matchComplete + "\nMatch moderated?: "+matchModerated+"\n\nRed Score: "+redScore+
"\nBlue Score: "+ blueScore + "\n\nRed Fouls: "+redFouls+"\nBlue Fouls: " + blueFouls + "\n\n(Note: Ignore the graphs, they work, but have incorrect data.)";


function issueToString(issue){
	if (issue==null){
		return "None";
	}
	else
		return issue;
}

//converting active zone objects and play styles objects into strings for displaying
function zoneObjectToString(zoneObject){

	var string = "";

	for (var zone=0; zone<zoneObject.length; zone++){
		if (zoneObject[zone].action==true){
			//stringList.add(zoneObject[zone].name);
			string = string + " "+ zoneObject[zone].name;

			if (zone<(zoneObject.length-2)){
				string = string + " +";
			}
		}


	}

	return string;		

}

db.getMatch(eventToFind, matchToFind) //.then is called once db.getMatch returns the info.
.then(function getMatch(match){


	redTeams = match.redAlliance.teams;
	blueTeams = match.blueAlliance.teams;

	matchComplete = match.complete;
	matchModerated = match.moderated;

	redScore = match.redAlliance.score;
	blueScore = match.blueAlliance.score;

	redFouls = match.redAlliance.fouls;
	blueFouls = match.blueAlliance.fouls;

	red1 = match.red1Data;
	red2 = match.red2Data;
	red3 = match.red3Data;

	blue1 = match.blue1Data;
	blue2 = match.blue2Data;
	blue3 = match.blue3Data;

	var reds = [red1, red2, red3];
	var blues = [blue1, blue2, blue3];

//Holy crap this code is poorly written
	for (var q=0; q< redTeams.length; q++){

		var tempList = [];


		playStyles = zoneObjectToString(reds[q].data.scoring.playStyles);
		//playStyles = "defense, dozer";
		redBaseStats[q][0] = playStyles;

		activeZones = zoneObjectToString(reds[q].data.teamwork.zones);
		//activeZones = "shooter, goalie";
		redBaseStats[q][1] = activeZones;

		highGoals = reds[q].data.scoring.goals.high;
		//highGoals = 0;
		redBaseStats[q][2] = highGoals;

		lowGoals = reds[q].data.scoring.goals.low;
		//lowGoals = 0;
		redBaseStats[q][3] = lowGoals;

		totalPasses = reds[q].data.teamwork.passing.aerial + reds[q].data.teamwork.passing.roll + reds[q].data.teamwork.passing.truss;
		//totalPasses = 0;
		redBaseStats[q][4] = totalPasses;

		totalRecieves = reds[q].data.teamwork.receiving.aerial + reds[q].data.teamwork.receiving.roll + reds[q].data.teamwork.receiving.truss;
		//totalRecieves =0;
		redBaseStats[q][5] = totalRecieves;

		issue = reds[q].data.issues.deadBroken;
		//issue = null;
		issue = issueToString(issue);
		redBaseStats[q][6] = issue;
	}



	for (var q=0; q< blueTeams.length; q++){

		console.log("this should print three times");

		playStyles = zoneObjectToString(blues[q].data.scoring.playStyles);
		//playStyles = "dozer, goalie";
		blueBaseStats[q][0] = playStyles;

		activeZones = zoneObjectToString(blues[q].data.teamwork.zones);
		//activeZones = "shooter, truss shooter";
		blueBaseStats[q][1] = activeZones;

		highGoals = blues[q].data.scoring.goals.high;
		//highHoals = 0;
		blueBaseStats[q][2] = highGoals;

		lowGoals = blues[q].data.scoring.goals.low;
		//lowGoals = 0;
		blueBaseStats[q][3] = lowGoals;

		totalPasses = blues[q].data.teamwork.passing.aerial + blues[q].data.teamwork.passing.roll + blues[q].data.teamwork.passing.truss;
		//totalPasses = 0;
		blueBaseStats[q][4] = totalPasses;

		totalRecieves = blues[q].data.teamwork.receiving.aerial + blues[q].data.teamwork.receiving.roll + blues[q].data.teamwork.receiving.truss;
		//totalReceives = 0;
		blueBaseStats[q][5] = totalRecieves;


		issue = blues[q].data.issues.deadBroken;
		//issue = null;
		issue = issueToString(issue);
		blueBaseStats[q][6] = issue;
	}

	
})


.then(function makePDF(){
	generatePDF();
})

//Put all the pdf stuff in a function to be called when the promise is fufilled.




//The main box, in which everything is held.
var box = {
	top: 75,

	//Note: the document is 612x792 px by default
	left: 31,
	width: 550,
	height: 650,
	overviewSize: 200
}

//Overview box, the grey one at the top of the main box that holds summary text and the two graphs.
var ob = {

	top: box.top+15,
	left: box.left + 15,
	width: box.width/2 -30,
	height: box.overviewSize - 30
}




//m = margin. A temporary placeholder so that I could adjust some of the margins more easily.
var margin = 15;

//Graph Box 1 - container for the first graph

var tempLeft1 = box.left +(box.width/2);
var tempWidth1 = box.width - (2*margin)-(box.width/2)    //Apparently I can't base values off of other values inside an object, 
var tempTop1 = (box.top+margin)                          // so I had to make some external variables to be able to set everything at once.

var gb1 = {

	top: tempTop1,
	left: tempLeft1,
	width: tempWidth1,
	height: box.overviewSize/2 - (2*margin),

	barWidth: 40,

	bars: [     //Array that holds the three bars of the graph.
							//The three bars each have basic rectangle attributes, and values for caluclating thier height.
		{
		max: 100,
		value: 42,
		left: tempLeft1 + ((tempWidth1/4)*1),
		top: tempTop1,
		height: 100},


		{
		max: 100,
		value: 25,
		left: tempLeft1 + ((tempWidth1/4)*2),
		top: tempTop1,
		height: 100},


		{
		max: 100,
		value: 75,
		left: tempLeft1 + ((tempWidth1/4)*3),
		top: tempTop1,
		height: 100}
	]

}


//set the height and y-value.
for (var bar=0; bar<=2; bar++){
	setHeightAndTop(gb1, bar);
}


//Graph Box 2 - container for the second graph. Format is identical to gb1.

tempLeft2 = box.left +(box.width/2);
tempWidth2 = box.width - (2*margin)-(box.width/2)
tempTop2 = (box.top+box.overviewSize/2)

var gb2 = {

	top: tempTop2,
	left: tempLeft2,
	width: tempWidth2,
	height: box.overviewSize/2 - (2*margin),

	barWidth: 40,

	bars : [

		{
		max: 100,
		value: 13,
		left: tempLeft2 + ((tempWidth2/4)*1),
		top: tempTop2,
		height: 100},

		{
		max: 100,
		value: 84,
		left: tempLeft2 + ((tempWidth2/4)*2),
		top: tempTop2,
		height: 100},

		{
		max: 100,
		value: 52,
		left: tempLeft2 + ((tempWidth2/4)*3),
		top: tempTop2,
		height: 100}

	]
}

//set the height and y-value.
for (var bar=0; bar<=2; bar++){
	setHeightAndTop(gb2, bar);
}



//Used for Calculating the height and top point of a bar based on the values that it holds.
function setHeightAndTop(graphBox, b){
	graphBox.bars[b].height = ((graphBox.height-10)*((graphBox.bars[b].value)/(graphBox.bars[b].max)));
	graphBox.bars[b].top = ((graphBox.top+gb1.height-10)-graphBox.bars[b].height);
}

//----------------------------------------------



//draws all the big, filled in rectangles that make up the back of the main box.
function fillBack()
{
	doc.rect(box.left+10, box.top+10, box.width, box.height).fillOpacity(.8).fill("black"); //black shadow

	doc.rect(box.left, box.top+box.overviewSize, box.width/2, box.height-box.overviewSize).fillOpacity(1.0).fill('#FFCCCC'); //red
	doc.rect(box.left+box.width/2, box.top+box.overviewSize, box.width/2, box.height-box.overviewSize).fillOpacity(1.0).fill('#B3C6FF'); //blue
	doc.rect(box.left, box.top, box.width, box.overviewSize).fillOpacity(1.0).fill('#BFBFBF'); //gray

	doc.rect(box.left, box.top, box.width, box.height).stroke('black');
}

//The most important lines of the main box. (box outline + section outline).
function drawMainLines(){

	for (var i=0; i<2; i++){
		doc.rect(box.left, (box.top+box.overviewSize)+(150*i), box.width, 150).stroke('black');
	}

	doc.moveTo(box.left+(box.width/2), box.top+box.overviewSize).lineTo(box.left+(box.width/2), box.top+box.height).stroke('black');

}

//Just draws the text in the overview box.
function drawMatchOverview(){
	doc.fontSize(12);
	doc.fill("black");
	doc.fillOpacity(1.0);

	doc.text("     "+ match_overview, ob.left, ob.top, {
		width: ob.width,
		align: "center"
	})
}

//Draws the given text as the title above the main box.
function drawTitle(text){

	doc.fontSize(20);
	doc.fill('black');

	doc.text(text, box.left, box.top-30, {
		width: box.width,
		align: "center"
	}).fillOpacity(1.0).fill('black');
}

//Not called normally. Use if you want to see the actual locations of gb1, gb2, and ob.
function drawOverviewOutlines(){

	doc.rect(gb1.left, gb1.top, gb1.width, gb1.height).stroke("000000");
	doc.rect(gb2.left, gb2.top, gb2.width, gb2.height).stroke("000000");
	doc.rect(ob.left, ob.top, ob.width, ob.height).stroke('black');

}

//Draws the text for each team's name above that team's section.
function drawSectionTitles(){
	for (var i=0; i <=2; i++){

		doc.rect(box.left, box.top+box.overviewSize+(i*150), box.width/2, 30).fillOpacity(1.0).fill('#FFB3B3');
		doc.rect(box.left+box.width/2, box.top+box.overviewSize+(i*150), box.width/2, 30).fillOpacity(1.0).fill('#99B3FF');

		doc.fill("black");

		doc.fontSize(14);
		doc.text(redTeams[i], box.left+25, box.top+10+box.overviewSize + (i*150), {
	  		width: 225,
	  		align: 'center'
		});

		doc.fontSize(14);
		doc.text(blueTeams[i], box.left+25+(box.width/2), box.top+10+box.overviewSize + (i*150), {
	  		width: 225,
	  		align: 'center'
		});

		doc.moveTo(box.left, box.top+box.overviewSize+(i*150)+30).lineTo(box.left+box.width/2, box.top+box.overviewSize+(i*150)+30).stroke('black');
		doc.moveTo(box.left+(box.width/2), box.top+box.overviewSize+(i*150)+30).lineTo(box.left+box.width, box.top+box.overviewSize+(i*150)+30).stroke('black');
	}
}


//A basic format that makes is a lot easier to set the location of each team's attributes.


baseStats = [
	{n:0, string :"Play Style: ", align: "center"}, 
	{n:1, string: "Active Zones: ", align: "center"}, 
	{n:2, string:"High Goals: ", align: "left"}, 
	{n:2, string: "Low Goals: ", align: "right"},
	{n:3, string: "Passes Made: ", align: "left"},
	{n:3, string: "Recieves Made: ", align: "right"},
	{n:4, string: "Issues: ", align: "center"}
];


//Draws all the data for each team. Should draw every piece of info shown in baseStats.
function drawBaseStats(){

	doc.fontSize(12);
	doc.fill("black");
	doc.fillOpacity(1.0);

	for (var o=0; o<baseStats.length; o++){

		for (var i=0; i<=2; i++){

			var top_margin = 45;
			var spacing = 20;

			//Red Stats:
			doc.text(baseStats[o].string+redBaseStats[i][o], box.left+25, box.top+top_margin+((baseStats[o].n)*spacing)+box.overviewSize + (i*150), {
			  width: 225,
			  align: baseStats[o].align
			});


			//Blue Stats:
			doc.text(baseStats[o].string+blueBaseStats[i][o], box.left+25+(box.width/2), box.top+top_margin+((baseStats[o].n)*spacing)+box.overviewSize + (i*150), {
			  width: 225,
			  align: baseStats[o].align
			});
		}
	}
}



//Draws the graphs.
function drawGraphs(){

	//loops through the graph box's lists of bars (each only has three elements)
	for (var bar=0; bar<=2; bar++){

		doc.fill('red');
		doc.fontSize(10);

		doc.rect(gb1.bars[bar].left-(gb1.barWidth/3)+1, gb1.bars[bar].top+1, 30, gb1.bars[bar].height).fill('black');
		doc.rect(gb1.bars[bar].left-(gb1.barWidth/3), gb1.bars[bar].top, 30, gb1.bars[bar].height).fill('red');

		doc.text("Team "+redTeams[bar], gb1.bars[bar].left-(gb1.barWidth/2), gb1.top+gb1.height-2);


		doc.fill('blue');
		doc.fontSize(10);

		doc.rect(gb2.bars[bar].left-(gb2.barWidth/3)+1, gb2.bars[bar].top+1, 30, gb2.bars[bar].height).fill('black');
		doc.rect(gb2.bars[bar].left-(gb2.barWidth/3), gb2.bars[bar].top, 30, gb2.bars[bar].height).fill('blue');
		doc.text("Team "+blueTeams[bar], gb2.bars[bar].left-(gb2.barWidth/2), gb2.top+gb2.height-2);
	}

	doc.moveTo(gb1.left+10, gb1.top+gb1.height-10).lineTo(gb1.left+gb1.width-10, gb1.top+gb1.height-10).stroke('black');
	doc.moveTo(gb1.left+10, gb1.top+gb1.height-10).lineTo(gb1.left+10, gb1.top).stroke('black');

	doc.moveTo(gb2.left+10, gb2.top+gb1.height-10).lineTo(gb2.left+gb2.width-10, gb2.top+gb1.height-10).stroke('black');
	doc.moveTo(gb2.left+10, gb2.top+gb1.height-10).lineTo(gb2.left+10, gb2.top).stroke('black');
	

}

//Writes the PDF to a document of given name.
function exportPDF(name){
	doc.write(name+'.pdf');
}

//Runs all the collective functions that make the PDF.
function generatePDF(){

	fillBack();
	drawMatchOverview();
	drawTitle("Match " + matchToFind +": Overview");
	drawSectionTitles();
	drawBaseStats();
	drawGraphs();
	drawMainLines();
	exportPDF("page1");

	console.log("PDF generated!");

}

//---------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------
