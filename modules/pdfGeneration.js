var mongoose = require('mongoose');
var _ = require('underscore');

require('./../db_modules/models/event.js');
require('./../db_modules/models/team.js');
require('./../db_modules/models/match.js');
require('./../db_modules/models/team_match.js');

var q = require('q');
db = require('./db_api.js');

//db.connect('wilsonville2014');

var PDFDocument = require('pdfkit');
var doc;

//Arrays of team numbers, default of 0 for all.
	var redTeams = [0,0,0];
	var blueTeams = [0,0,0];

	var matchComplete = false;
	var matchModerated = false;

	var redScore = 0;
	var blueScore = 0;

	var redFouls = 0;
	var blueFouls = 0;

	var eventToFind = 'casb';
	var matchToFind = 3;


module.exports = exports = function genPDF(eventToFind, matchToFind) {

	eventToFind = eventToFind || "orwil";
	matchToFind = matchToFind || 3;

	doc = new PDFDocument();

	// get match
	return db.getMatch(eventToFind, matchToFind) //.then is called once db.getMatch returns the info.

	// set match info and pass it on
	.then(function setMatchInfo(match){

		console.log('test')

		console.log('MATCH', match);

		redTeams = match.redAlliance.teams;
		blueTeams = match.blueAlliance.teams;

		return match;
	})

	// get all teams
	.then( function(match) {
		var getRedTeams = db.getTeams( match.redAlliance.teams );
		var getBlueTeams = db.getTeams( match.blueAlliance.teams );

		return q.all([ getRedTeams, getBlueTeams ])
		.spread( function(redTeams, blueTeams) {
			console.log('found all teams in '+ match.number +', red: '+ redTeams +', blue: '+ blueTeams)
			
			// return match and each alliance's teams
			return { match:match, redTeams:redTeams, blueTeams:blueTeams };
		});
	})

	// generate PDF
	.then(function pdfshiz(data) {
		var match = data.match;
		var redTeams = data.redTeams;
		var blueTeams = data.blueTeams;

		console.log('MATCH ======================', match);
		console.log('RED ======================', redTeams);
		console.log('BLUE ======================', blueTeams);

		fillBack();
		drawTitle("Overview: Event "+ eventToFind +", Match " + match.number);
		drawSectionTitles(redTeams, blueTeams);
		drawBaseStats(redTeams, blueTeams);
		setGraphValues(redTeams, blueTeams);
		drawGraphs();
		drawMainLines();

		data.doc = doc;
		return data;
	})

	.then( function otherPages(data) {
		var doc = data.doc;
		var redTeams = data.redTeams;
		var blueTeams = data.blueTeams;

		_.each( redTeams, function(team) {
			doc.addPage()
				.fill('red')

				.fontSize(20)
				.text('Pit Notes for Team '+ team.id +', '+ team.name +':')
				.fontSize(14)
				.text(team.pit.notes || 'no notes yet')

				.fontSize(20)
				.text('Scout Notes for Team '+ team.id +', '+ team.name +':')
				.fontSize(14)
				.text(team.masterNotes || 'no notes yet');

		});

		_.each( blueTeams, function(team) {
			doc.addPage()
				.fill('blue')

				.fontSize(20)
				.text('Pit Notes for Team '+ team.id +', '+ team.name +':')
				.fontSize(14)
				.text(team.pit.notes || 'no notes yet')

				.fontSize(20)
				.text('Scout Notes for Team '+ team.id +', '+ team.name +':')
				.fontSize(14)
				.text(team.masterNotes || 'no notes yet');

		});

		exportPDF(eventToFind+"_"+matchToFind);
	})

	//.then( function() {process.exit(0);}) 
	.catch( function errHandler(err) {
		console.error(err);
	});

};






//Put all the pdf stuff in a function to be called when the promise is fufilled.


var text;
var match = matchToFind;



// === OVERVIEW BOXES DATA =====================================================
//The main box, in which everything is held.
var box = {
	top: 75,

	//Note: the document is 612x792 px by default
	left: 31,
	width: 550,
	height: 650,
	//os = overview size
	os: 130,
	tabHeight: (650-130)/3
};

//Overview box, the grey one at the top of the main box that holds summary text and the two graphs.
var ob = {
	top: box.top+15,
	left: box.left + 15,
	width: box.width/2 -30,
	height: box.os - 30
};

//draws all the big, filled in rectangles that make up the back of the main box.
function fillBack() {
	doc.rect(box.left+10, box.top+10, box.width, box.height).fillOpacity(.8).fill("black"); //black shadow

	doc.rect(box.left, box.top+box.os, box.width/2, box.height-box.os).fillOpacity(1.0).fill('#FFCCCC'); //red
	doc.rect(box.left+box.width/2, box.top+box.os, box.width/2, box.height-box.os).fillOpacity(1.0).fill('#B3C6FF'); //blue
	doc.rect(box.left, box.top, box.width, box.os).fillOpacity(1.0).fill('#BFBFBF'); //gray

	doc.rect(box.left, box.top, box.width, box.height).stroke('black');
}

//The most important lines of the main box. (box outline + section outline).
function drawMainLines(){

	for (var i=0; i<2; i++){
		doc.rect(box.left, (box.top+box.os)+(box.tabHeight*i), box.width, box.tabHeight).stroke('black');
	}

	doc.moveTo(box.left+(box.width/2), box.top+box.os).lineTo(box.left+(box.width/2), box.top+box.height).stroke('black');
}



// === GENERATE AND PRINT GRAPHS =====================================================

//m = margin. A temporary placeholder so that I could adjust some of the margins more easily.
var m = 15;

//Graph Box 1 - container for the first graph

var tempLeft1 = box.left +(box.width/2);
var tempWidth1 = box.width - (2*m)-(box.width/2)    //Apparently I can't base values off of other values inside an object, 
var tempTop1 = (box.top+10)                          // so I had to make some external variables to be able to set everything at once.

var gb1 = {

	top: tempTop1,
	left: tempLeft1,
	width: tempWidth1,
	height: box.os - (2*m),

	barWidth: 40,

	autoBars: [ 
	
		{
			max: 100,
			value: 0,
			left: tempLeft1 + ((tempWidth1/4)*1),
			top: tempTop1,
			height: 100
		},
		{
			max: 100,
			value: 0,
			left: tempLeft1 + ((tempWidth1/4)*2),
			top: tempTop1,
			height: 100
		},
		{
			max: 100,
			value: 0,
			left: tempLeft1 + ((tempWidth1/4)*3),
			top: tempTop1,
			height: 100
		}
	],

	teleBars: [ 
	
		{
			max: 100,
			value: 0,
			left: tempLeft1 + ((tempWidth1/4)*1),
			top: tempTop1,
			height: 100
		},
		{
			max: 100,
			value: 0,
			left: tempLeft1 + ((tempWidth1/4)*2),
			top: tempTop1,
			height: 100
		},
		{
			max: 100,
			value: 0,
			left: tempLeft1 + ((tempWidth1/4)*3),
			top: tempTop1,
			height: 100
		}
	]
};

//Graph Box 2 - container for the second graph. Format is identical to gb1.

tempLeft2 = box.left +10;
tempWidth2 = box.width - (2*m)-(box.width/2)
tempTop2 = (box.top+10)

var gb2 = {

	top: tempTop2,
	left: tempLeft2,
	width: tempWidth2,
	height: box.os - (2*m),

	barWidth: 40,

	autoBars : [
		{
			max: 100,
			value: 0,
			left: tempLeft2 + ((tempWidth2/4)*1),
			top: tempTop2,
			height: 100
		}, {
			max: 100,
			value: 0,
			left: tempLeft2 + ((tempWidth2/4)*2),
			top: tempTop2,
			height: 100
		}, {
			max: 100,
			value: 0,
			left: tempLeft2 + ((tempWidth2/4)*3),
			top: tempTop2,
			height: 100
		}
	],

	teleBars : [
		{
			max: 100,
			value: 0,
			left: tempLeft2 + ((tempWidth2/4)*1),
			top: tempTop2,
			height: 100
		}, {
			max: 100,
			value: 0,
			left: tempLeft2 + ((tempWidth2/4)*2),
			top: tempTop2,
			height: 100
		}, {
			max: 100,
			value: 0,
			left: tempLeft2 + ((tempWidth2/4)*3),
			top: tempTop2,
			height: 100
		}
	]
};



//Used for Calculating the height and top point of a bar based on the values that it holds.
function setHeightAndTop(graphBox, b){
	graphBox.teleBars[b].height = ((graphBox.height-10)*((graphBox.teleBars[b].value)/(graphBox.teleBars[b].max)));
	graphBox.teleBars[b].top = ((graphBox.top+gb1.height-10)-graphBox.teleBars[b].height);

	graphBox.autoBars[b].height = ((graphBox.height-10)*((graphBox.autoBars[b].value)/(graphBox.autoBars[b].max)));
	graphBox.autoBars[b].top = ((graphBox.top+gb1.height-10)-graphBox.autoBars[b].height);
}

function setGraphValues(redTeams, blueTeams) {

	_.each(redTeams, function(team, index) {

		// SCOUTING DATA
		var matches = team.matches || [];

		var scoutData = {
			high: 0,
			highTotal: 0,

			auto: 0,
			autoTotal: 0



		};

		_.each( matches, function(teamMatch) {
			var data = teamMatch.data;

			scoutData.highTotal += (data.scoring.goals.high + data.scoring.goals.highMisses);
			scoutData.high += data.scoring.goals.high;

			scoutData.autoTotal += (data.auto.fieldValues.goal + data.auto.fieldValues.miss);
			scoutData.auto += data.auto.fieldValues.goal;

			
		});



		if (scoutData.highTotal > 0){

			gb1.teleBars[index].max = 1;
			gb1.teleBars[index].value = scoutData.high/scoutData.highTotal;
		}

		if (scoutData.autoTotal > 0){

			gb1.autoBars[index].max = 1;
			gb1.autoBars[index].value = scoutData.auto/scoutData.autoTotal;
		}
	});
		//set the height and y-value.
	for (var h=0; h<=2; h++){
		setHeightAndTop(gb2, h);
	}

	//set the height and y-value.
	for (var h=0; h<=2; h++) {
		setHeightAndTop(gb1, h);
	}
}

//Draws the graphs.
function drawGraphs() {

	for (var b=0; b<=2; b++){

		doc.fill('red');
		doc.fontSize(10);

	//tele-op bars
		doc.rect(gb1.teleBars[b].left-(gb1.barWidth/3)+16, gb1.teleBars[b].top+1, 15, gb1.teleBars[b].height)
			.fill('black');
		doc.rect(gb1.teleBars[b].left-(gb1.barWidth/3)+15, gb1.teleBars[b].top, 15, gb1.teleBars[b].height)
			.fill('#1D1AB2');

	//auto bars
		doc.rect(gb1.autoBars[b].left-(gb1.barWidth/3)+1, gb1.autoBars[b].top+1, 15, gb1.autoBars[b].height)
			.fill('black');
		doc.rect(gb1.autoBars[b].left-(gb1.barWidth/3), gb1.autoBars[b].top, 15, gb1.autoBars[b].height)
			.fill('#0B0974');

		doc.fontSize(15);
		doc.text(blueTeams[b], gb1.teleBars[b].left-(gb1.barWidth/2)+8, gb1.top+gb1.height-2);
		doc.fontSize(12);

		doc.fill('blue');
		doc.fontSize(10);

		doc.rect(gb2.teleBars[b].left-(gb2.barWidth/3)+16, gb2.teleBars[b].top+1, 15, gb2.teleBars[b].height)
			.fill('black');
		doc.rect(gb2.teleBars[b].left-(gb2.barWidth/3)+15, gb2.teleBars[b].top, 15, gb2.teleBars[b].height)
			.fill('#FF0000');

		doc.rect(gb2.autoBars[b].left-(gb2.barWidth/3)+1, gb2.autoBars[b].top+1, 15, gb2.autoBars[b].height)
			.fill('black');
		doc.rect(gb2.autoBars[b].left-(gb2.barWidth/3), gb2.autoBars[b].top, 15, gb2.autoBars[b].height)
			.fill('#A60000');



		doc.fontSize(15);
		doc.text(redTeams[b], gb2.teleBars[b].left-(gb2.barWidth/2)+8, gb2.top+gb2.height-2);
		doc.fontSize(12);
	}

	doc.moveTo(gb1.left+10, gb1.top+gb1.height-10)
		.lineTo(gb1.left+gb1.width-10, gb1.top+gb1.height-10)
		.stroke('black');
	doc.moveTo(gb1.left+10, gb1.top+gb1.height-10)
		.lineTo(gb1.left+10, gb1.top)
		.stroke('black');


	doc.moveTo(gb2.left+10, gb2.top+gb1.height-10)
		.lineTo(gb2.left+gb2.width-10, gb2.top+gb1.height-10)
		.stroke('black');
	doc.moveTo(gb2.left+10, gb2.top+gb1.height-10)
		.lineTo(gb2.left+10, gb2.top)
		.stroke('black');
}

// === PRINT TEXT =====================================================

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
	})
		.fillOpacity(1.0)
		.fill('black');
}

//Not called normally. Use if you want to see the actual locations of gb1, gb2, and ob.
function drawOverviewOutlines(){
	doc.rect(gb1.left, gb1.top, gb1.width, gb1.height)
		.stroke("000000");

	doc.rect(gb2.left, gb2.top, gb2.width, gb2.height)
		.stroke("000000");

	doc.rect(ob.left, ob.top, ob.width, ob.height)
		.stroke('black');
}

//Draws the text for each team's name above that team's section.
function drawSectionTitles(redT, blueT) {

	for (var i=0; i <=2; i++) {

		doc.rect(box.left, box.top+box.os+(i*box.tabHeight), box.width/2, 30)
			.fillOpacity(1.0)
			.fill('#FFB3B3');

		doc.rect(box.left+box.width/2, box.top+box.os+(i*box.tabHeight), box.width/2, 30)
			.fillOpacity(1.0)
			.fill('#99B3FF');

		doc.fill("black");

		doc.fontSize(14);
		doc.text(redT[i].id+": " +redT[i].name, box.left+25, box.top+10+box.os + (i*box.tabHeight), {
		  width: 225,
		  align: 'center'
		});

		doc.fontSize(14);
		doc.text(blueT[i].id+": "+ blueT[i].name, box.left+25+(box.width/2), box.top+10+box.os + (i*box.tabHeight), {
		  width: 225,
		  align: 'center'
		});

		doc.moveTo(box.left, box.top+box.os+(i*box.tabHeight)+30)
			.lineTo(box.left+box.width/2, box.top+box.os+(i*box.tabHeight)+30)
			.stroke('black');

		doc.moveTo(box.left+(box.width/2), box.top+box.os+(i*box.tabHeight)+30)
			.lineTo(box.left+box.width, box.top+box.os+(i*box.tabHeight)+30)
			.stroke('black');
	}
};



// === FILL IN DATA =====================================================

//Draws all the data for each team. Should draw every piece of info shown in baseStats.
function drawBaseStats(redTeams, blueTeams) {

	doc.fontSize(12);
	doc.fill("black");
	doc.fillOpacity(1.0);

	var top_margin = 45;
	var spacing = 20;

	_.each( redTeams, function(team, index) {
		
		// PIT DATA
		var pitWheels = ((((team.pit || {}).general || {}).wheel) || {});
		var wheelsText = [];
		_.each( pitWheels, function(wheel) {
			if( !_.isNull(wheel) ) {
				wheelsText.push(wheel);
			}
		});		

		var shootingRange = ((((team.pit || {}).general || {}).shootingRange) || {});
		var rangeText = [];
		_.each( shootingRange, function(canShootFrom, name) {
			if( canShootFrom ) {
				rangeText.push(name);
			}
		});		

		// SCOUTING DATA
		var matches = team.matches || [];

		var scoutData = {
			high: 0,
			highTotal: 0,
			highRatio: 0.0,

			low: 0,
			lowTotal: 0,
			lowRatio: 0.0,

			autoBalls: 0,
			autoHotgoals: 0,
			autoMisses: 0,

			pass: 0,
			passTotal: 0,
			passRatio: 0.0,

			trussPasses: 0,
			totalTrussPasses: 0,
			trussRatio: 0.0
		};

		_.each( matches, function(teamMatch) {
			var data = teamMatch.data;

			scoutData.autoBalls += data.auto.fieldValues.goal;
			scoutData.autoHotgoals += data.auto.fieldValues.hotgoal;
			scoutData.autoMisses += data.auto.fieldValues.miss;

			scoutData.highTotal += (data.scoring.goals.high + data.scoring.goals.highMisses);
			scoutData.high += data.scoring.goals.high;

			scoutData.lowTotal += (data.scoring.goals.low + data.scoring.goals.lowMisses);
			scoutData.low += data.scoring.goals.low;

			scoutData.pass += ((data.teamwork.passing.roll || 0) + (data.teamwork.passing.aerial || 0)) //+ data.teamwork.passing.aerialMisses + data.teamwork.passing.rollMisses;
			scoutData.passTotal += data.teamwork.passing.roll + data.teamwork.passing.aerial;

			scoutData.trussPasses += data.teamwork.passing.truss;
			scoutData.totalTrussPasses += data.teamwork.passing.truss; //+ data.teamwork.passing.trussMisses;
		});

		scoutData.lowRatio = scoutData.low +'/'+ scoutData.lowTotal;
		scoutData.highRatio = scoutData.high +'/'+ scoutData.highTotal;
		scoutData.passRatio = scoutData.pass+'/'+scoutData.passTotal;
		scoutData.trussRatio = scoutData.trussPasses+'/'+scoutData.totalTrussPasses;


		console.log('stuff =======\n\n')

		doc.fontSize(10);
		doc.text("Play Style: "+ ((((team.pit || {}).robot || {}).playstyle) || 'No pit data for Play Style'), box.left+25, box.top+box.os + top_margin + (index*box.tabHeight), { width:225 })
			.text("Shifting: "+ ((((team.pit || {}).general || {}).shifting) || 'No shifting data found'))
			.text("Wheels: "+ wheelsText.join(','), { width:225 })
			.text('Shooting Range: '+ rangeText.join(','), { width:225 })
			.text("High: " + scoutData.highRatio)
			.text("Low: "+ scoutData.lowRatio)
			.text("Passes: " + scoutData.passRatio)
			.text("Truss Passes: " + scoutData.trussRatio)
			.text("Auto Goals (including hot): " + scoutData.autoBalls+'/'+(scoutData.autoBalls + scoutData.autoMisses))
			.text("Hot goals out of all goals made: " + scoutData.autoHotgoals+'/'+scoutData.autoBalls) 

	});
	doc.fontSize(12);



	_.each( blueTeams, function(team, index) {
		
		// PIT DATA
		var pitWheels = ((((team.pit || {}).general || {}).wheel) || {});
		var wheelsText = [];
		_.each( pitWheels, function(wheel) {
			if( !_.isNull(wheel) ) {
				wheelsText.push(wheel);
			}
		});		

		var shootingRange = ((((team.pit || {}).general || {}).shootingRange) || {});
		var rangeText = [];
		_.each( shootingRange, function(canShootFrom, name) {
			if( canShootFrom ) {
				rangeText.push(name);
			}
		});		

		// SCOUTING DATA
		var matches = team.matches || [];

		var scoutData = {
			high: 0,
			highTotal: 0,
			highRatio: 0.0,

			low: 0,
			lowTotal: 0,
			lowRatio: 0.0,

			autoBalls: 0,
			autoHotgoals: 0,
			autoMisses: 0,

			pass: 0,
			passTotal: 0,
			passRatio: 0.0,

			trussPasses: 0,
			totalTrussPasses: 0,
			trussRatio: 0.0
		};

		_.each( matches, function(teamMatch) {
			var data = teamMatch.data;

			scoutData.autoBalls += data.auto.fieldValues.goal;
			scoutData.autoHotgoals += data.auto.fieldValues.hotgoal;
			scoutData.autoMisses += data.auto.fieldValues.miss;

			scoutData.highTotal += (data.scoring.goals.high + data.scoring.goals.highMisses);
			scoutData.high += data.scoring.goals.high;

			scoutData.lowTotal += (data.scoring.goals.low + data.scoring.goals.lowMisses);
			scoutData.low += data.scoring.goals.low;

			scoutData.pass += data.teamwork.passing.roll + data.teamwork.passing.aerial //+ data.teamwork.passing.aerialMisses + data.teamwork.passing.rollMisses;
			scoutData.passTotal += data.teamwork.passing.roll + data.teamwork.passing.aerial;

			scoutData.trussPasses += data.teamwork.passing.truss;
			scoutData.totalTrussPasses += data.teamwork.passing.truss; //+ data.teamwork.passing.trussMisses;
		});

		scoutData.lowRatio = scoutData.low +'/'+ scoutData.lowTotal;
		scoutData.highRatio = scoutData.high +'/'+ scoutData.highTotal;
		scoutData.passRatio = scoutData.pass+'/'+scoutData.passTotal;
		scoutData.trussRatio = scoutData.trussPasses+'/'+scoutData.totalTrussPasses;


		console.log('stuff =======\n\n')

		doc.fontSize(10);
		doc.text("Play Style: "+ ((((team.pit || {}).robot || {}).playstyle) || 'No pit data for Play Style'), box.left+25+(box.width/2), box.top+box.os + top_margin + (index*box.tabHeight), { width:225 })
			.text("Shifting: "+ ((((team.pit || {}).general || {}).shifting) || 'No shifting data found'))
			.text("Wheels: "+ wheelsText.join(','), { width:225 })
			.text('Shooting Range: '+ rangeText.join(','), { width:225 })
			.text("High: " + scoutData.highRatio)
			.text("Low: "+ scoutData.lowRatio)
			.text("Passes: " + scoutData.passRatio)
			.text("Truss Passes: " + scoutData.trussRatio)
			.text("Auto Goals (including hot): " + scoutData.autoBalls+'/'+(scoutData.autoBalls + scoutData.autoMisses))
			.text("Hot goals out of all goals made: " + scoutData.autoHotgoals+'/'+scoutData.autoBalls) 
	});
	doc.fontSize(12);
}


// === SAVE NEW PDF =====================================================

//Writes the PDF in the public/pdf folder
function exportPDF(name) {
	doc.write('public/pdf/'+name+'.pdf', function(err) {console.log("PDF exported!");console.log("Error: " + err)});
}

// make a new pdf
// exports('casb', 3);
