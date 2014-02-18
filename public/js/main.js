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

  $scope.scoring.playStyles = [
    {
      name: 'dozer',
      action: false,
    },
    {
      name: 'goalie',
      action: false,
    },
    {
      name: 'truss shooter',
      action: false,
    },
    {
      name: 'defense',
      action:  false
    },
    {
      name: 'shooter',
      action:  false
    }
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
    {
      name: 'one',
      action: false,
    },
    {
      name: 'two',
      action: false,
    },
    {
      name: 'three',
      action: false,
    },
    {
      name: 'goal',
      action:  false
    }
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
    {
      title: 'driving',
      stars: 0
    },
    {
      title: 'shooting',
      stars: 0
    },
    {
      title: 'passing',
      stars: 0
    },
    {
      title: 'defense',
      stars: 0
    },
    {
      title: 'catching',
      stars: 0
    }
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

app.controller('PicklistCtrl', function($scope) {
  
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
