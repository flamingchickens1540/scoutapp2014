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
      templateUrl: 'partials/scoutHome',
      controller: 'ScoutHomeCtrl'
    }).

    when('/scout/:pos', {
      templateUrl: 'partials/scout',
      controller: 'ScoutCtrl'
    }).

    when('/admin', {
      templateUrl: 'partials/admin',
      controller: 'AdminCtrl'
    }).

    when('/moderator', {
      templateUrl: 'partials/moderator',
      controller: 'ModeratorCtrl'
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

app.controller('AppCtrl', function(fileSystem, socket, $scope) {
  
  window.fs = fs;
  window.socket = socket;

  $scope.reconnect = function() {
    socket.socket.reconnect();
  };

  var fs = fileSystem;
  
  // request 100MB
  fs.requestQuota(100)

    .then( function(granted) {
      console.log('GRANTED '+ granted +' bytes of persistent data');
    })
    .catch( function(err) {
      console.log(err);
    }); 

  socket.on('connect', function(ev) { console.log('CONNECTED', ev, navigator.onLine); $scope.connected = 'connected' });
  socket.on('reconnect', function(ev) { console.log('RECONNECTED', ev, navigator.onLine); $scope.connected = 'reconnected' });
  //socket.on('reconnecting', function(ev) { console.log('RECONNECTING', ev, navigator.onLine); $scope.connected = 'reconnecting' });
  socket.on('disconnect', function(ev) { console.log('DISCONNECTED', ev, navigator.onLine); $scope.connected = 'disconnected' });


});

app.controller('AdminCtrl', function($scope, socket, fileSystem) {

  var fs = fileSystem;

  $scope.events = [
    { name: 'Autodesk PNW District Championships', value: 'pncmp', region: 'Regionals' },
    { name: 'Wilsonville District', value: 'orwil', region: 'PNW' },
    { name: 'OSU District', value: 'orosu', region: 'PNW' },
    { name: 'Oregon City District', value: 'orore', region: 'PNW' },
    { name: 'Inland Empire Regional', value:'casb', region:'Regionals' }
  ];

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
app.directive('upVote', function() {
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
