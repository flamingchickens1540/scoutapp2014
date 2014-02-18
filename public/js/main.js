"use strict";

var app = angular.module('scout2014', [
  'ngRoute',
  'ctrl.scout',
  'ctrl.pit',
  'ctrl.moderator',
  'ctrl.picklist',
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
