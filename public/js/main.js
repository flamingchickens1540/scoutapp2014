"use strict";

var app = angular.module('scout2014', [
  'ngRoute',
  'ngTouch',
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

app.controller('ScoutCtrl', function($scope) {
  
});

app.controller('ModeratorCtrl', function($scope) {
  
});

app.controller('AnalystCtrl', function($scope) {
  
});

app.controller('PicklistCtrl', function($scope) {
  
});

