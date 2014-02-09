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
  /* Collapse functions */
  $scope.collapse = {
    info: false,
    auto: true,
    scoring: true,
    teamwork: true,
    issues: true,
    submit: true
  };

  $scope.displayView = function displayView(panel) {
    $scope.collapse = {
      info: true,
      auto: true,
      scoring: true,
      teamwork: true,
      issues: true,
      submit: true
    };

    switch(panel) {
      case 'info':
        $scope.collapse['info'] = false;
        $scope.collapse['issues'] = false;
        break;

      case 'auto':
        $scope.collapse['auto'] = false;
        $scope.collapse['issues'] = false;
        break;

      case 'teleop':
        $scope.collapse['scoring'] = false;
        $scope.collapse['teamwork'] = false;
        $scope.collapse['issues'] = false;
        break;

      case 'submit':
        $scope.collapse['submit'] = false;
        break;

      default:
        // nothing happens
        break;
    }
  };

  // TEST SpinnerComponent
  $scope.itemsToTrack = {
    'goal': {
      type: 'success',
      value: 0
    },
    'miss': {
      type: 'danger',
      value: 0
    },
  };


  /***************** AUTONOMOUS *****************/
  $scope.startPosition = null;
  $scope.drivesForward = false;

  $scope.fieldItemsToTrackInAutonomous = {
    'goal': {
      type: 'success',
      value: 0
    },
    'miss': {
      type: 'danger',
      value: 0
    },
    'hotgoal': {
      type: 'warning',
      value: 0
    },
  };

  $scope.goalieItemsToTrackInAutonomous = {
    'blocked': {
      type: 'success',
      value: 0
    },
    'miss': {
      type: 'danger',
      value: 0
    }
  };



  // MATCH INFO
  $scope.openMatchInfoModal = function() {
    var matchInfoModal = $modal.open({
      templateUrl: 'templates/match_info',
      backdrop: 'static',
      // modal scope is a sub-prototype of this scope
      scope: $scope,
      controller: function($scope, $modalInstance) {
        $scope.continueToMatch = function continueToMatch() {
          // verify all data is submitted

          $modalInstance.close();
        };
      }
    });
  };

  //$scope.openMatchInfoModal();

  $scope.events = [
    { name: 'orpo', value: 'test', region: 'Regionals' },
    { name: 'pnw - district 1', value: 'test2', region: 'PNW' }
  ];

  $scope.scouts = [
    'Ben Balden',
    'Anna Dodson',
    'Ian Hoyt'
  ];

  $scope.scout = 'Who are you?'

  //MATCH SUBMISSION
  $scope.openMatchSubmitModal = function() {

    //check that everything else is completed

    var matchSubmitModal = $modal.open({
      templateUrl: 'templates/match_submit',
      // modal scope is a sub-prototype of this scope
      scope: $scope
    });
  };
  
  /* Vote Directive */
  $scope.auto = {
    min: 0,
    max: 3,
    value: 1
  };


  /*  Zones  */
  $scope.zones = [
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

  /*  Play Styles  */
  $scope.playStyles = [
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

  /* RATINGS */
  $scope.ratings = [
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

  $scope.rate = 0;
  $scope.numStars = 5;
  $scope.isReadonly = false;

  $scope.hoveringOver = function(value) {
    $scope.overStar = value;
    $scope.percent = 100 * (value / $scope.max);
  };


  // Play Style Select
  $scope.playStyleOptions = [
    'Play Style 1',
    'Play Style 2',
    'Play Style 3'
  ];

  // get from server
  $scope.currentNotes = 'test';

  $scope.submitMatch = function submitMatch() {
    // verify all data is inputted
    // http put request to server?
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
    required: ['itemsToTrack'],
    scope: {
      itemsToTrack: '=',
      title: '@'
    },
    controller: function($scope) {
      $scope.changeValue = function changeValue(title) {
        $scope.itemsToTrack[title].value++;
      };

      $scope.undoValue = function undoValue(title) {
        var value = $scope.itemsToTrack[title].value - 1;

        // calue can't be negative
        $scope.itemsToTrack[title].value = (value >= 0)? value : 0;
      };
    },
    templateUrl: 'components/spinner'
  };
});

// doesn't work
app.directive('compSelect', function() {
  return {
    restrict:'E',
    required: ['ng-model', 'options'],
    scope: {
      options: '=',
      title: '@',
      model: '=',
      required: '@'
    },
    controller: function($scope) {

    },
    templateUrl: 'components/select'
  }
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
