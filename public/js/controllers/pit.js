var app = angular.module('ctrl.pit', [  
  'ngTouch',
  'fileSystem',
  'ui.bootstrap'
]);

app.controller('PitCtrl', function($scope, $http, fileSystem, $q, $log, socket) {
  var fs = fileSystem;

  // request 100MB
  fs.requestQuota(100)

  .then(function(granted) {
    console.log('GRANTED '+ granted +'MB of persistent data');
  },
  function(err) {
    console.log(err);
  }); 
// ============================== GENERAL INFO ==============================
  // Team Name
  $scope.generalInfo = {};
  $scope.generalInfo['teamNumber'] = 0;

  $scope.teams = [];
  $scope.event = {};

  // List of events and what event we are at
  $scope.events = [
    { name: 'Autodesk Oregon Regional', value: 'orpo', region: 'Regionals' },
    { name: 'pnw - district 1', value: 'test2', region: 'PNW' },
    { name: 'Inland Empire Regional', value:'casb', region:'Regionals' }
  ];

  var getEvent = function(eventId) {
    socket.emit('get-event', eventId, function(event) {
      console.log(event);

      $scope.event = event || {};

      $scope.teams = ($scope.event.teams || []).sort(function numericSort(team1,team2) { console.log('SORT',team1.id,team2.id); return team1.id - team2.id; });
    });
  };

  // make sure event is always good
  $scope.$watch('eventId', function(newEvent, oldEvent) {
    getEvent( newEvent );
  });

  $scope.$watch('teamId', function(newTeam, oldTeam) {
    if(newTeam != null) {
      $scope.team = newTeam;
      console.log('newTeam',newTeam.id)
    }
  });

  // List of wheels and what kind of wheels are present. Also notes on wheels
  $scope['wheels'] = [
  	'None',
  	'High Traction',
  	'Traction',
  	'Mecanum',
  	'Omni',
  	'Swerve',
  	'Caster'
  ];

  $scope.generalInfo['wheel'] = {
    'wheelL1': null,
    'wheelL2': null,
    'wheelL3': null,
    'wheelR1': null,
    'wheelR2': null,
    'wheelR3': null
  };

  $scope.generalInfo['wheelNotes'] = '';

  // Robot height
  $scope.generalInfo['robotHeight'] = '';

  // Can they shift?
  $scope.generalInfo['shifting'] = true;

// ============================== ROBOT INFO ==============================
  // How far can they shoot/Shooting range
  $scope.robotInfo = {};
  $scope.robotInfo.zones = [
  	{ name: 'Goal Line' },
  	{ name: 'Zone 1' },
  	{ name: 'Zone 2' }
  ];

  $scope.robotInfo.minShoot = $scope.robotInfo.zones[0];
  $scope.robotInfo.maxShoot = $scope.robotInfo.zones[0];

  // List of Shooter types
  $scope.robotInfo.shooterTypes = [
	 // TO BE SUPPLIED BY PETER
	 { name: 'Something' }
  ];

  $scope.robotInfo.shooterType = $scope.robotInfo.shooterTypes[0];

  // List of Collector types
  $scope.robotInfo.collectorTypes = [
  	// TO BE SUPPLIED BY PETER
  	{ name: 'Something' }
  ];

  $scope.robotInfo.collectorType = $scope.robotInfo.collectorTypes[0];

  // Can they catch balls?
  $scope.robotInfo.catchable = true;

  // Their plan for if disabled with ball
  $scope.robotInfo.disabledPlan = '';

  // Play style
  $scope.robotInfo.playstyles = [
  	{ name: 'Forward' },
  	{ name: 'Middle' },
  	{ name: 'Starter' },
  	{ name: 'Goalie' }
  ];

  // How long it takes to reload/load
  $scope.robotInfo.reloadTimes = [
  	// TO BE SUPPLIED BY ???
  	{ name: 'Something' }
  ];

  $scope.robotInfo.reloadTime = $scope.robotInfo.reloadTimes[0];

// ============================== AUTONOMOUS INFO ==============================
  // Strait forward autonomous?
  $scope.autoInfo = {};
  $scope.autoInfo.dfAuto = false;

  // How many balls can they score in Auto?
  $scope.autoInfo.autoBalls = 0;

  // Do they recognize a hot goal?
  $scope.autoInfo.hotRecog = true;

  // List of starting spots and where they start
  $scope.autoInfo.startSpots = [
  	// TO BE SUPPLIED BY DALE/PETER
  	{ name: 'Something' }
  ];

  $scope.autoInfo.startPosition = $scope.autoInfo.startSpots[0];

// ============================== NOTES ==============================
  //General Notes
  $scope.generalNotes = '';

// ============================== SUBMIT ==============================

  $scope.saveData = function() {

      var pitData = {
        general: $scope.generalInfo,
        robot: $scope.robotInfo,
        auto: $scope.autoInfo,
        notes: $scope.generalNotes,
      };

      console.log('PITDATA', pitData);

      fs.writeText(pitData.general.teamNumber+".json", JSON.stringify(pitData))

      .then(function(granted) {
        console.log('Saved '+ pitData.general.teamNumber +".json", JSON.stringify(pitData));

        fs.readFile('0.json').then(function(file) {console.log(JSON.parse(file))});

        fs.getFolderContents('/').then(function(dir) {console.log(dir)});
      },
      function(err) {
        console.log(err);
      }); 
    //}
  };

  $scope.submitData = function() {
    var teamData = [];
    var allPromises = [];

    // get all data from fs
    var promise = fs.getFolderContents('/')

    .then( function readFilesFromDirectory(dir) {
      angular.forEach(dir, function(fileEntry, num) {

        if( fileEntry.isFile ) {
          allPromises.push( fs.readFile( fileEntry.name ) );
          $log.log('Promise '+ num +' added!');

        }
      });
    })

    .then( function() {
      $q.all(allPromises)

      .then( function consolidateFileData(files) {
        angular.forEach(files, function(file, num) {
          file = JSON.parse(file);
          teamData.push( file );

          $log.log('File '+ num +' added!', file);
        });
        $log.log('Team_data added!', teamData);
      })

      .then( function sendToServer() {
        $log.log('Team_data, what is it?', teamData);
        $http.post( '/submit/pitData', teamData );
      });

    })

    .catch( function(err) {
      console.error(err);
    });
  };

});
