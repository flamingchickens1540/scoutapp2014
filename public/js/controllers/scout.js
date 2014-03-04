var app = angular.module('ctrl.scout', [  
  'ngTouch',
  'ui.bootstrap',
  'btford.socket-io'
]);

app.controller('ScoutCtrl', function($scope, $http, $log) {
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
    { name: 'Autodesk Oregon Regional', value: 'orpo', region: 'Regionals' },
    { name: 'pnw - district 1', value: 'test2', region: 'PNW' }
  ];


  /***************** INFO *****************/
  $scope.info = {
    scout: null,
    event: null,
    team: null,
    matchNum: null
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

    $scope.info.team = 1540;
    $scope.info.matchNum = 3;

    var test = verify();

    if(test.verified) {
      //send to server
      $log.log('INFO', $scope.info);
      $log.log('AUTONOMOUS', $scope.auto);
      $log.log('SCORING', $scope.scoring);
      $log.log('TEAMWORK', $scope.teamwork);
      $log.log('ISSUES', $scope.issues);
      $log.log('SUBMIT', $scope.submit);

      var submitData = $http.post('/submit/matchData', {
        info: $scope.info,
        auto: $scope.auto,
        scoring: $scope.scoring,
        teamwork: $scope.teamwork,
        issues: $scope.issues,
        submit: $scope.submit
      });

      .

    }
    else {
      // alert user
      var errors = test.errors.join('\n');

      alert(errors);
    }

  };

  // Verifying function
  var verify = function() {
    /*
      Info:
        scout
        match
        team
        event

      Autonomous:
        startPosition

      Issues:
        if deadBroken is string, deadBrokenNotes
        if ejectable is string, ejectionNotes

      Submit:
        if deadBroken is not dead, ratings

    */
    var verified = true;
    var errLog = [];

    /* INFO VERIFY */
    if(
      !$scope.info.scout ||
      !$scope.info.event ||
      !$scope.info.team || 
      !$scope.info.matchNum
    ) {
      verified = false;
      errLog.push('Match information is not complete.');
    }

    if(!$scope.auto.startPosition) {
      verified = false;
      errLog.push('Please input a start position under autonomous.');
    }

    if( (typeof $scope.issues['deadBroken'] === 'string') && $scope.issues['deadBrokenNotes'] === '') {
      verified = false;
      errLog.push('Please input information as to why this robot is dead/broken.');
    }

    if( (typeof $scope.issues['ejectable'] === 'string') && $scope.issues['ejectableNotes'] === '') {
      verified = false;
      errLog.push('Please input information as to how this robot passively ejects the ball.');
    }

    return { verified: verified, errors: errLog };
  };

});
