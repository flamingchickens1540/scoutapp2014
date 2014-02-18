var app = angular.module('ctrl.scout', [  
  'ngTouch',
  'ui.bootstrap',
  'btford.socket-io'
]);

app.controller('ScoutCtrl', function($scope, $http) {
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
