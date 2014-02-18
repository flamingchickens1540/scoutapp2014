"use strict";

var app = angular.module('scout2014', [
  'ngRoute',
  'ngTouch',
  'ui.bootstrap',
  'btford.socket-io'
 ]);


app.config(function ($routeProvider, $locationProvider) {
  $routeProvider.

    when('/', {
      templateUrl: 'partials/home',
      controller: 'AppCtrl'
    }).

    when('/pit', {
      templateUrl: 'partials/pit',
      controller: 'PitCtrl'
    }).

    when('/scout', {
      templateUrl: 'partials/scout',
      controller: 'ScoutCtrl'
    }).

    when('/analyst', {
      templateUrl: 'partials/analyst',
      controller: 'AnalystCtrl'
    }).

    when('/moderator', {
      templateUrl: 'partials/moderator',
      controller: 'AnalystCtrl'
    }).

    when('/picklist', {
      templateUrl: 'partials/picklist',
      controller: 'PicklistCtrl'
    }).
    
    //default - turn off for development
    otherwise({
      redirectTo: '/' //or a 404 page?
    });

  $locationProvider.html5Mode(true);
});

app.controller('AppCtrl', function($scope) {

});

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

app.controller('ScoutCtrl', function($scope, $modal, $http) {
  /* NON-DATA INFORMATION */

  /* COLLAPSE STATES */
  $scope.collapsed = {
    info: false,
    auto: true,
    scoring: true,
    teamwork: true,
    issues: true,
    submit: true
  };

  $scope.displayView = function displayView(panel) {
    $scope.collapsed = {
      info: true,
      auto: true,
      scoring: true,
      teamwork: true,
      issues: true,
      submit: true
    };

    switch(panel) {
      case 'info':
        $scope.collapsed['info'] = false;
        break;

      case 'auto':
        $scope.collapsed['auto'] = false;
        $scope.collapsed['issues'] = false;
        break;

      case 'teleop':
        $scope.collapsed['scoring'] = false;
        $scope.collapsed['teamwork'] = false;
        $scope.collapsed['issues'] = false;
        break;

      case 'submit':
        $scope.collapsed['submit'] = false;
        break;

      default:
        // nothing happens
        break;
    }
  };

  /* LISTS */
  $scope.scouts = [
    'Ben Balden',
    'Anna Dodson',
    'Ian Hoyt'
  ];

  $scope.events = [
    { name: 'orpo', value: 'test', region: 'Regionals' },
    { name: 'pnw - district 1', value: 'test2', region: 'PNW' }
  ];


  /***************** INFO *****************/
  $scope.info = {
    scout: null,
    event: null,
    team: null,
    match: null
  };


  /***************** AUTONOMOUS *****************/
  $scope.auto = {
    startPosition: null,
    drivesForward: false,
    fieldValues: {
      goal: 0,
      miss: 0,
      hotgoal: 0
    },
    goalieValues: {
      block: 0,
      miss: 0
    }
  };


  /***************** SCORING *****************/
  $scope.scoring = {
    playStyles: [],
    goals: {
      high: 0,
      low: 0
    }
  };

  $scope.scoring['playStyles'] = [
    { name: 'dozer', action: false },
    { name: 'goalie', action: false },
    { name: 'truss shooter', action: false },
    { name: 'defense', action:  false },
    { name: 'shooter', action:  false }
  ];

  /***************** TEAMWORK *****************/
  $scope.teamwork = {
    zones: [],
    receiving: {
      roll: 0,
      truss: 0,
      aerial: 0
    },
    passing: {
      roll: 0,
      truss: 0,
      aerial: 0
    }
  };

  $scope.teamwork['zones'] = [
    { name: 'one', action: false },
    { name: 'two', action: false },
    { name: 'three', action: false },
    { name: 'goal', action: false }
  ];


  /***************** ISSUES *****************/
  $scope.issues = {
    // DEAD OR BROKEN?
    deadBroken: null,
    deadBrokenNotes: '',

    // PASSIVE EJECTION ON ROBOT?
    ejectable: null,
    ejectionNotes: ''
  };


  /***************** SUBMISSION *****************/

  /* RATINGS */
  $scope.submit = {
    ratings: [],
    numStars: 5,

    notes: ''
  }; 

  $scope.submit['ratings'] = [
    { title: 'driving', stars: 0 },
    { title: 'shooting', stars: 0 },
    { title: 'passing', stars: 0 },
    { title: 'defense', stars: 0 },
    { title: 'catching', stars: 0 }
  ];

  // get from server
  $scope.currentNotes = 'test';

  $scope.submitMatch = function submitMatch() {
    // verify all data is inputted
    // http put request to server?
    console.log($scope);
  };
});

app.controller('ModeratorCtrl', function($scope) {
  
});

app.controller('AnalystCtrl', function($scope) {
  
});

//This is just some test data at the moment.
//info and second_picks are both mock data.
app.controller('PicklistCtrl', function($scope) {

  $scope.allTeams = {

    1540: {
      name: "Flaming Chickens",
      selected: false,
      styleClass : null,
      info: "This is where info for 1540 will go.",
      second_picks: [1359, 1432, 2374]
    },

    1359: {
      name: "The Scalawags",
      selected: false,
      styleClass : null,
      info: "This is where info for 1359 will go.",
      second_picks: [1540, 1432, 2374]

    },

    1432: {
      name: "Mahr's Metal Beavers",
      selected: false,
      styleClass : null,
      info: "This is where info for 1432 will go.",
      second_picks: [1540, 1359, 2374]
    },

    2374:{
      name: "Crusaderbots",
      selected: false,
      styleClass : null,
      info: "This is where info for 2374 will go.",
      second_picks: [1359, 1432, 1540]
    },

    2990:{
      name:"Hotwire",
      selected: false,
      styleClass : null,
      info: "This is where info for 2990 will go.",
      second_picks: [1359, 1540, 2374]
    },

    3131:{
      name: "Gladiators",
      selected: false,
      styleClass : null,
      info: "This is where info for 3131 will go.",
      second_picks: [1540, 1432, 2990]
    },

    4051:{
      name: "Sabin-Sharks",
      selected: false,
      styleClass : null,
      info: "This is where info for 4051 will go.",
      second_picks: [1540, 1432, 3131]
    },

    4127:{
      name: "Loggerbots",
      selected: false,
      styleClass : null,
      info: "This is where info for 4127 will go.",
      second_picks: [1359, 3131, 4051]
    }

  },

  //Need input for this part, for now, it's set as an empty object that is later filled with every team.
  $scope.firstPicks = {},

  //Need input for this part, until then, it's just a duplication of the allTeams object.
  $scope.secondPicks = $scope.allTeams;

  $scope.currentTeamInfo = null;


  $scope.selectTeam = function(teamId) {
    $scope.allTeams[teamId].selected = !$scope.allTeams[teamId].selected;
    $scope.allTeams[teamId].styleClass = ($scope.allTeams[teamId].styleClass ==='selected')? null: 'selected';


  angular.forEach($scope.allTeams, function(obj, key){
    if (!obj.selected){

      $scope.firstPicks[key] = {
        name: obj.name,
        selected: obj.selected,
        styleClass: obj.styleClass,
        info: obj.info,
        second_picks: obj.second_picks
      };
    }
  });



  $scope.viewTeamInfo = function(teamId){
    $scope.currentTeamInfo = teamId;

  }

    // run the logic for the first, second lists
  };

  $scope.getClass = function(inputTeamId) {
    return $scope.allTeams[inputTeamId].styleClass;
  }
});






// Component - spinner (comp-spinner)
app.directive('compSpinner', function() {
  return {
    restrict:'E',
    required: ['ngModel'],
    scope: {
      type: '@',
      value: '=ngModel',
      title: '@'
    },
    controller: function($scope) {

      /* REIMPLEMENT AUTO-TYPING SYSTEM */
      $scope.btnClass = 'btn-'+$scope.type;

      $scope.changeValue = function changeValue(value) {
        var testValue = $scope.value + value;

        $scope.value = (testValue > 0)? testValue: 0;
      };

    },
    templateUrl: 'components/spinner'
  };
});

app.filter('capitalize', function() {
    return function(input, param) {

      // "word1 word2 word3" => ['word1', 'word2', 'word3']
      var words = input.split(' ');

      var capitalizedWords = words.map(function(word) {
        // ['word1', 'word2', 'word3'] => ['Word1', 'Word2', 'Word3']
        return word.substring(0,1).toUpperCase()+word.substring(1);
      });

      // ['Word1', 'Word2', 'Word3'] => 'Word1 Word2 Word3'
      return capitalizedWords.join(' ');
    }
});

/*
app.directive('upVote', function(){
  return    {
    restrict:'E',
    scope:{
      min: '=',
      max:'=',
      value:'='
    },
    template: '<div class="">' + 
      '<button class="btn btn-lg btn-success" ng-click="value = value + 1" ng-disabled="value >= max">+</button>' + 
      '{{model.value}}'+
      '<button class="btn btn-lg btn-danger" ng-click="value = value - 1" ng-disabled="value <= min">-</button>' + 
    '</div>'
  }
});
*/
