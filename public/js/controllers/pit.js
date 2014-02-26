var app = angular.module('ctrl.pit', [  
  'ngTouch',
  'fileSystem',
  'ui.bootstrap'
]);

app.controller('PitCtrl', function($scope) {
// ============================== GENERAL INFO ==============================
  // Team Name
  $scope.generalInfo = new Object();
  $scope.generalInfo.teamName = 0;

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
  $scope.generalInfo.robotHeight = '';

  // Can they shift?
  $scope.generalInfo.shifting = true;

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
  $scope.autoInfo = new Object();
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

  // Do I need to do something with the save button?
});
