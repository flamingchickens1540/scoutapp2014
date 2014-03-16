var _ = require('underscore');
var PDFDocument = require('pdfkit');
var doc = new PDFDocument;


var teamName = 1540;
var notes = "Robot was fairly good at catching, but not nearly as good at passing. Played mainly a catcher position, mixed with some goalie. A couple of passes were attempted, but both ended up flying high of thier targets. Robot has very limited autonmous, and did not appear to be able to identify hot goals. Robot attempted to make truss passes, but failed both times. Upon closer inspection, the robot is actually several small animals covered in tin foil. It is still unclear at this time, but it is most likely that this is why the robot lacks the ability to throw balls with any accuracy. Information is still limited at this time.";


var box = {
	top: 100,

	//document is 612x792 px by default
	left: 56,
	width: 500,
	height: 640,

	//overview size
	os: 200
}


doc.rect(box.left+10, box.top+10, box.width, box.height).fillOpacity(.8).fill('black');

//Title goes here
doc.fontSize(24);

doc.text("Team: "+teamName+" ", box.left, box.top-40, {
	width: box.width,
	align: "center"
}).fill('black');


//reset font to normal size
doc.fontSize(12);



doc.text("Text goes here", box.left+25, box.top+50, {
	width: box.width-50,
}).fill('black');



doc.rect(box.left, box.top, box.width, box.height).fillOpacity(1.0).fill('#B3C6FF');


doc.fontSize(14);

doc.fill('black');
doc.fillOpacity(1.0);

var top_margin = 30
var s = 30;

//----------------------------------------------------

//Team information
doc.text('Scouter: ' + "Scouter Name", box.left+25, box.top+top_margin + (160*0), {
  width: (box.width)-50,
  align: 'left'
});

doc.text('Starting Position: ' + "Goalie", box.left+25, box.top+top_margin + (160*0)+s, {
  width: (box.width)-50,
  align: 'left'
});

doc.text('Play Styles: ' + "Dozer, Defense", box.left+25, box.top+top_margin + (160*0)+s*2, {
  width: (box.width)-50,
  align: 'left'
});

doc.text('Active Zones: ' + "One, Two", box.left+25, box.top+top_margin + (160*0)+s*3, {
  width: (box.width)-50,
  align: 'left'
});


//Team information
doc.text('Low Goals: ' + "0", box.left+box.width/2, box.top+top_margin + (160*0), {
  width: (box.width/2),
  align: 'center'
});

doc.text('High Goals: ' + "0", box.left+box.width/2, box.top+top_margin + (160*0)+s*1, {
  width: (box.width/2),
  align: 'center'
});

doc.text('Total Points: ' + "0", box.left+box.width/2, box.top+top_margin + (160*0)+s*2, {
  width: (box.width/2),
  align: 'center'
});

//-------------------------------------------------------------

var ratings = ["Driving", "Passing", "Catching", "Shooting", "Defense"];
var rValues = [1, 4, 2, 3, 1];

for (var t=0; t<5; t++){

    doc.fill('black');
    doc.text(ratings[t]+": ", box.left+25, 30*t + box.top+175, {
      width: (box.width), //The -50's are for margin space.
        align: 'left'
    });


  for (var y=0; y<rValues[t]; y++){

    doc.rect(160+(y*20)+2, box.top+170+(t*30)+2, 20, 20).fill('black');
    doc.rect(160+(y*20), box.top+170+(t*30), 20, 20).fill('blue');

  }

	for (var q = 0; q<5; q++){


		doc.rect(160+(q*20), box.top+170+(t*30), 20, 20).stroke('black');
	}
}

doc.fill('black');

doc.moveTo(box.left+box.width/2, box.top).lineTo(box.left+box.width/2, box.top+box.height).stroke("black");

doc.fontSize(12);
doc.text("Notes: " + "\n\n" + notes, box.left+(box.width/2)+20, box.top+160+20, {
      width: (box.width)/2-40, //The -50's are for margin space.
        align: 'left'
    });
doc.fontSize(12);




//-------------------------------------------------------------

//Team information
doc.text('Passes: ', box.left+25, box.top+top_margin + (160*2), {
  width: (box.width/4)-50,
  align: 'left'
});

doc.text('Rolling: ' + "2", box.left+25, box.top+top_margin + (160*2)+s*1, {
  width: (box.width/4)-50,
  align: 'left'
});

doc.text('Truss: ' + "1", box.left+25, box.top+top_margin + (160*2)+s*2, {
  width: (box.width/4)-50,
  align: 'left'
});

doc.text('Aerial: ' + "0", box.left+25, box.top+top_margin + (160*2)+s*3, {
  width: (box.width/4)-50,
  align: 'left'
});


doc.moveTo(box.left+(box.width/4), box.top+(160*2)).lineTo(box.left+(box.width/4), box.top+(160*3)).stroke('black');

doc.text('Recieves: ', box.left+(box.width/4)+25, box.top+top_margin + (160*2), {
  width: (box.width/4)-50,
  align: 'left'
});

doc.text('Rolling: ' + "1", box.left+(box.width/4)+25, box.top+top_margin + (160*2)+s*1, {
  width: (box.width/4)-50,
  align: 'left'
});

doc.text('Truss: ' + "2", box.left+(box.width/4)+25, box.top+top_margin + (160*2)+s*2, {
  width: (box.width/4)-50,
  align: 'left'
});

doc.text('Aerial: ' + "1", box.left+(box.width/4)+25, box.top+top_margin + (160*2)+s*3, {
  width: (box.width/4)-50,
  align: 'left'
});



doc.text('Wheel Type: ' + "High Traction", box.left+25+(box.width/2), box.top+top_margin + (160*3), {
  width: (box.width/2)-50,
  align: 'left'
});

doc.text('Robot Height: ' + "124 cm", box.left+25+(box.width/2), box.top+top_margin + (160*3)+s, {
  width: (box.width/2)-50,
  align: 'left'
});

doc.text('Shifting: ' + "True", box.left+25+(box.width/2), box.top+top_margin + (160*3)+s*2, {
  width: (box.width/2)-50,
  align: 'left'
});

doc.text('Identify Hot Goal: ' + "True", box.left+25+(box.width/2), box.top+top_margin + (160*3)+s*3, {
  width: (box.width/2)-50,
  align: 'left'
});




//-------------------------------------------------------------
doc.text("Issues", box.left+25, box.top+15 + (160*3), {
  width: (box.width)-50, //The -50's are for margin space.
  align: 'left'
});












doc.rect(box.left, box.top, box.width, box.height).lineWidth(1).stroke('black');


doc.moveTo(box.left, (box.top+160)).lineTo(box.left+box.width, box.top+160).stroke('black');

doc.moveTo(box.left, (box.top+320)).lineTo(box.left+box.width/2, box.top+320).stroke('black');

doc.moveTo(box.left, (box.top+480)).lineTo(box.left+box.width, box.top+480).stroke('black');



doc.write('teamPageTest.pdf');