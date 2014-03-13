var app = angular.module('ctrl.scout', [  
  'ngTouch',
  'ui.bootstrap',
  'btford.socket-io'
]);

app.controller('ScoutHomeCtrl', function($scope) {
  // scout home is where you select the alliance position you watch
  // anything that goes on the team selection page? Nothing?
});

app.controller('ScoutCtrl', function($scope, socket, $http, $routeParams, $log, $timeout) {
  
  $scope.alerts = [];
  /* NON-DATA INFORMATION */

// ===== DATA AND RESET ====================================
  var resetScout = function(finishedMatchNum) {
    if( angular.isDefined(finishedMatchNum) ) {

      // if I don't add one, it automatically jumps up one (CS starts at 0)
      $scope.match = $scope.event.matches[finishedMatchNum];
    }

    /* COLLAPSE STATES */
    $scope.collapsed = {
      info: false,
      auto: true,
      scoring: true,
      teamwork: true,
      issues: true,
      submit: true
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
  };

  resetScout();

    /* LISTS */
  $scope.scouts = [
    'Ben Balden',
    'Anna Dodson',
    'Ian Hoyt'
  ];

  $scope.events = [
    { name: 'Autodesk Oregon Regional', value: 'orpo', region: 'Regionals' },
    { name: 'pnw - district 1', value: 'test2', region: 'PNW' },
    { name: 'Inland Empire Regional', value:'casb', region:'Regionals' }
  ];

// ===== VIEW FUNCTIONS ====================================
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

  var alertUser = function(type, message) {
    $scope.alerts.push({ type:type || 'info', msg:message });
    $timeout( function() {
      // doesn't take into account multiple coming in every few seconds
      $scope.alerts.shift(); // removes first item in alerts
    }, 5000);
  };

// ===== WATCHER FUNCTIONS ====================================
  // make sure event is always good
  $scope.$watch('info.event', function(newEvent, oldEvent) {
    getEvent( newEvent );
  });

  // make sure event is always good
  $scope.$watch('match', function(newMatch, oldMatch) {
    if(newMatch != null) {
      console.log(newMatch);
      var teamPosInArray = $scope.info.posNum - 1; // adjust for arrays
      setTeam( newMatch[ $scope.info.color +'Alliance' ].teams[ teamPosInArray ] );
      $scope.info.matchNum = newMatch.number;
    }
  });

  var getEvent = function(eventId) {
    socket.emit('get-event', eventId, function(event) {
      $scope.event = event || {};

      $scope.matches = $scope.event.matches || [];
      $scope.matches = $scope.matches.sort(function numericSort(match1,match2) { console.log('SORT',match1.number,match2.number); return match1.number - match2.number; });

      console.log(event);
    });
  };

  var setTeam = function(teamId) {
    socket.emit('get-team-info', teamId, function(team) {
      $scope.team = team;
      console.log('SET TEAM', team);

      $scope.info['team'] = teamId;
    });
  };

// ===== SET INFO ====================================
  var pos = $routeParams.pos;
  var posNum = parseInt(pos.slice( pos.length-1 )); // 'red1' => 1
  var color = pos.slice(0, pos.length-1).toLowerCase(); // 'red1' => 'red'

  $scope.info = {
    scout: null, // chosen by select, set once and ignore
    event: null, //chosen by select, set once and ignore
    team: null, // returned in the POST request to the server
    matchNum: null, //set once when page opens and ignore

    // 1, 2, or 3
    posNum: posNum,
    color: color
  };

  $scope.match = null;

  // AUTONOMOUS

  // SCORING

  // TEAMWORK

  // ISSUES

  // SUBMISSION
  
// ===== SCOUT SCOPE FUNCTIONS ====================================
  $scope.submitMatch = function submitMatch() {
    // verify all data is inputted

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

      $log.log(submitData);

      submitData.success( function(wasSaved) {
        $log.log( 'WAS SAVED?', wasSaved );

        if(wasSaved) {
          alertUser('success', 'Successfully submitted data for team '+ $scope.info.team +' in match '+ $scope.info.matchNum);
          resetScout( $scope.info.matchNum ); // since matches start from 1, anf indexes start from 0, there is no matchNum+1
        }
        else {
          alertUser('danger', 'did not save properly, some error happened on the server');
        }
      });

      submitData.error( function(data, status, headers, config) {
        $log.log('Error!', data, status, headers);
      });

    }
    else {
      angular.forEach( test.errors, function(errMessage) {
        alertUser('danger', errMessage);
      });
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

      console.log($scope.info);
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
