var app = angular.module('ctrl.pit', [  
  'ngTouch',
  'fileSystem',
  'ui.bootstrap'
]);

app.controller('PitCtrl', function($scope, $http, fileSystem, $q, $log) {
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
  $scope.generalInfo.teamNumber = 0;

  // List of events and what event we are at
  $scope.generalInfo.events = [
  	{ name: 'Oregon City District' },
  	{ name: 'Wilsonville District' },
  	{ name: 'OSU District' },
  	{ name: 'PNW Championships' },
  	{ name: 'World Championships' }
  ];

  $scope.generalInfo.e = $scope.generalInfo.events[0]; // Maybe change this before each event to fascilitate lives

  // List of wheels and what kind of wheels are present. Also notes on wheels
  $scope.generalInfo.wheels = [
  	{ name: 'None' },
  	{ name: 'High Traction' },
  	{ name: 'Traction' },
  	{ name: 'Mecanum' },
  	{ name: 'Omni' },
  	{ name: 'Swerve' },
  	{ name: 'Caster' }
  ];

  $scope.generalInfo.wheelL1 = $scope.generalInfo.wheels[0];
  $scope.generalInfo.wheelL2 = $scope.generalInfo.wheels[0];
  $scope.generalInfo.wheelL3 = $scope.generalInfo.wheels[0];
  $scope.generalInfo.wheelR1 = $scope.generalInfo.wheels[0];
  $scope.generalInfo.wheelR2 = $scope.generalInfo.wheels[0];
  $scope.generalInfo.wheelR3 = $scope.generalInfo.wheels[0];

  $scope.generalInfo.wheelNotes = '';

  // Robot height
  $scope.generalInfo.robotHeight = 0;

  // Can they shift?
  $scope.generalInfo.shifting = true;

// ============================== ROBOT INFO ==============================
  // How far can they shoot/Shooting range
  $scope.robotInfo = {};
  $scope.generalInfo.zones = [ //ignores this #toolazy
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

  $scope.robotInfo.playstyle = $scope.robotInfo.playstyles[0];

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

    .then(
      function(dir) {
        angular.forEach(dir, function(fileEntry, num) {

          if( fileEntry.isFile ) {
            allPromises.push( fs.readFile( fileEntry.name ) );
            $log.log('Promise '+ num +' added!');

          }
        });
      },

      function(err) {
        alert(err.message)
      }
    )

    .then(

      function() {
        $q.all(allPromises)

        .then(

          function(files) {
            angular.forEach(files, function(file, num) {
              file = JSON.parse(file);
              teamData.push( file );

              $log.log('File '+ num +' added!', file);
            });
            $log.log('Team_data added!', teamData);

          },

          function(err) {
            alert(err.message)
          }

        )

        .then(

          function sendToServer() {
            $log.log('Team_data, what is it?', teamData);
            $http.post( '/submit/pitData', teamData );
          }

        );
      }
    )
  };

});
