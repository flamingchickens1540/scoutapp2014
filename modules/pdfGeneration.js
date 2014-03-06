var mongoose = require('mongoose');
var _ = require('underscore');
var ObjectId = mongoose.Schema.Types.ObjectId;

require('./../db_modules/models/event.js');
require('./../db_modules/models/team.js');
require('./../db_modules/models/match.js');
require('./../db_modules/models/team_match.js');

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

var match_overview = 
"\nMatch Over?: "+ matchComplete + "\nmatchModerated: "+matchModerated+"\nRed Score: "+redScore+
"\nBlue Score: "+ blueScore + "\nRed Fouls: "+redFouls+"\nBlue Fouls: " + blueFouls;




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

console.log("Line reached!");
console.log(match.blue1Data);
console.log("Second line reached");


})


.then(function pdfshiz(){
generatePDF();
})





//Put all the pdf stuff in a function to be called when the promise is fufilled.


var PDFDocument = require('pdfkit');
var doc = new PDFDocument;


var text;
var match = 13;




//The main box, in which everything is held.
var box = {
top: 75,

//Note: the document is 612x792 px by default
left: 31,
width: 550,
height: 650,
//os = overview size
os: 200
}

//Overview box, the grey one at the top of the main box that holds summary text and the two graphs.
var ob = {

top: box.top+15,
left: box.left + 15,
width: box.width/2 -30,
height: box.os - 30
}




//m = margin. A temporary placeholder so that I could adjust some of the margins more easily.
var m = 15;

//Graph Box 1 - container for the first graph

var tempLeft1 = box.left +(box.width/2);
var tempWidth1 = box.width - (2*m)-(box.width/2)    //Apparently I can't base values off of other values inside an object, 
var tempTop1 = (box.top+m)                          // so I had to make some external variables to be able to set everything at once.

var gb1 = {

top: tempTop1,
left: tempLeft1,
width: tempWidth1,
height: box.os/2 - (2*m),

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
for (var h=0; h<=2; h++){
setHeightAndTop(gb1, h);
}


//Graph Box 2 - container for the second graph. Format is identical to gb1.

tempLeft2 = box.left +(box.width/2);
tempWidth2 = box.width - (2*m)-(box.width/2)
tempTop2 = (box.top+box.os/2)

var gb2 = {

top: tempTop2,
left: tempLeft2,
width: tempWidth2,
height: box.os/2 - (2*m),

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
for (var h=0; h<=2; h++){
setHeightAndTop(gb2, h);
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

	doc.rect(box.left, box.top+box.os, box.width/2, box.height-box.os).fillOpacity(1.0).fill('#FFCCCC'); //red
	doc.rect(box.left+box.width/2, box.top+box.os, box.width/2, box.height-box.os).fillOpacity(1.0).fill('#B3C6FF'); //blue
	doc.rect(box.left, box.top, box.width, box.os).fillOpacity(1.0).fill('#BFBFBF'); //gray

	doc.rect(box.left, box.top, box.width, box.height).stroke('black');
}

//The most important lines of the main box. (box outline + section outline).
function drawMainLines(){

	for (var i=0; i<2; i++){
	doc.rect(box.left, (box.top+box.os)+(150*i), box.width, 150).stroke('black');
	}

	doc.moveTo(box.left+(box.width/2), box.top+box.os).lineTo(box.left+(box.width/2), box.top+box.height).stroke('black');

}

//Just draws the text in the overview box.
function drawMatchOverview(){
	doc.fontSize(12);
	doc.fill("black");
	doc.fillOpacity(1.0);

	doc.text("     "+ match_overview, ob.left, ob.top, {
	width: ob.width
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

	doc.rect(box.left, box.top+box.os+(i*150), box.width/2, 30).fillOpacity(1.0).fill('#FFB3B3');
	doc.rect(box.left+box.width/2, box.top+box.os+(i*150), box.width/2, 30).fillOpacity(1.0).fill('#99B3FF');

	doc.fill("black");

	doc.fontSize(14);
	doc.text(redTeams[i]+": "+"Team Name", box.left+25, box.top+10+box.os + (i*150), {
	  width: 225,
	  align: 'center'
	});

	doc.fontSize(14);
	doc.text(blueTeams[i]+": "+"Team Name", box.left+25+(box.width/2), box.top+10+box.os + (i*150), {
	  width: 225,
	  align: 'center'
	});

	doc.moveTo(box.left, box.top+box.os+(i*150)+30).lineTo(box.left+box.width/2, box.top+box.os+(i*150)+30).stroke('black');
	doc.moveTo(box.left+(box.width/2), box.top+box.os+(i*150)+30).lineTo(box.left+box.width, box.top+box.os+(i*150)+30).stroke('black');
	}
};


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
	doc.text(baseStats[o].string, box.left+25, box.top+top_margin+((baseStats[o].n)*spacing)+box.os + (i*150), {
	 width: 225,
	 align: baseStats[o].align
	});


	//Blue Stats:
	doc.text(baseStats[o].string, box.left+25+(box.width/2), box.top+top_margin+((baseStats[o].n)*spacing)+box.os + (i*150), {
	 width: 225,
	 align: baseStats[o].align
	});
	}
	}
}



//Draws the graphs.
function drawGraphs(){


	for (var b=0; b<=2; b++){

	doc.fill('red');
	doc.fontSize(10);

	doc.rect(gb1.bars[b].left-(gb1.barWidth/3)+1, gb1.bars[b].top+1, 30, gb1.bars[b].height).fill('black');
	doc.rect(gb1.bars[b].left-(gb1.barWidth/3), gb1.bars[b].top, 30, gb1.bars[b].height).fill('red');

	doc.text("Team "+redTeams[b], gb1.bars[b].left-(gb1.barWidth/2), gb1.top+gb1.height-2);


	doc.fill('blue');
	doc.fontSize(10);

	doc.rect(gb2.bars[b].left-(gb2.barWidth/3)+1, gb2.bars[b].top+1, 30, gb2.bars[b].height).fill('black');
	doc.rect(gb2.bars[b].left-(gb2.barWidth/3), gb2.bars[b].top, 30, gb2.bars[b].height).fill('blue');
	doc.text("Team "+blueTeams[b], gb2.bars[b].left-(gb2.barWidth/2), gb2.top+gb2.height-2);
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
	drawTitle("Match " + match +": Overview");
	drawSectionTitles();
	drawBaseStats();
	drawGraphs();
	drawMainLines();
	exportPDF("page1");

	console.log("PDF generated!");

}

//---------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------