var app = angular.module('ctrl.pit', [  
  'ngTouch',
  'ui.bootstrap',
  'btford.socket-io'
]);

app.controller('PitCtrl', function($scope) {
  // General Info
  // Team Name
  $scope.teamName = 0;

  // List of events and what event we are at
  $scope.events = [
  	{ name: 'Oregon City District' },
  	{ name: 'Wilsonville District' },
  	{ name: 'OSU District' },
  	{ name: 'PNW Championships' },
  	{ name: 'World Championships' }
  ];

  $scope.e = $scope.events[0]; // Maybe change this before each event to fascilitate lives

  // List of wheels and what kind of wheels are present. Also notes on wheels
  $scope.wheels = [
  	{ name: 'None' },
  	{ name: 'High Traction' },
  	{ name: 'Traction' },
  	{ name: 'Mecanum' },
  	{ name: 'Omni' },
  	{ name: 'Swerve' },
  	{ name: 'Caster' }
  ];

  $scope.wheelL1 = $scope.wheels[0];
  $scope.wheelL2 = $scope.wheels[0];
  $scope.wheelL3 = $scope.wheels[0];
  $scope.wheelR1 = $scope.wheels[0];
  $scope.wheelR2 = $scope.wheels[0];
  $scope.wheelR3 = $scope.wheels[0];

  $scope.wheelNotes = '';

  // Robot height
  $scope.robotHeight = '';

  // Can they shift?
  $scope.shifting = true;

  //Robot Information
  // How far can they shoot/Shooting range
  $scope.zones = [
  	{ name: 'Goal Line' },
  	{ name: 'Zone 1' },
  	{ name: 'Zone 2' }
  ];

  $scope.minShoot = $scope.zones[0];
  $scope.maxShoot = $scope.zones[0];

  // List of Shooter types
  $scope.shooterTypes = [
	 // TO BE SUPPLIED BY PETER
	 { name: 'Something' }
  ];

  $scope.shooterType = $scope.shooterTypes[0];

  // List of Collector types
  $scope.collectorTypes = [
  	// TO BE SUPPLIED BY PETER
  	{ name: 'Something' }
  ];

  $scope.collectorType = $scope.collectorTypes[0];

  // Can they catch balls?
  $scope.catchable = true;

  // Their plan for if disabled with ball
  $scope.disabledPlan = '';

  // Play style
  $scope.playstyles = [
  	{ name: 'Forward' },
  	{ name: 'Middle' },
  	{ name: 'Starter' },
  	{ name: 'Goalie' }
  ];

  // How long it takes to reload/load
  $scope.reloadTimes = [
  	// TO BE SUPPLIED BY ???
  	{ name: 'Something' }
  ];

  $scope.reloadTime = $scope.reloadTimes[0];

  //Autonomous information
  // Strait forward autonomous?
  $scope.dfAuto = false;

  // How many balls can they score in Auto?
  $scope.autoBalls = 0;

  // Do they recognize a hot goal?
  $scope.hotRecog = true;

  // List of starting spots and where they start
  $scope.startSpots = [
  	// TO BE SUPPLIED BY DALE/PETER
  	{ name: 'Something' }
  ];

  $scope.startPosition = $scope.startSpots[0];

  //Notes
  //General Notes
  $scope.generalNotes = '';

  // Do I need to do something with the save button?
});
