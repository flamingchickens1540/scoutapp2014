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


app.config(function ($routeProvider, $locationProvider, socketProvider) {
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
  var fs = fileSystem;
  window.fs = fs;
  
  // request 100MB
  fs.requestQuota(1000)

    .then( function(granted) {
      console.log('GRANTED '+ granted +' bytes of persistent data');
    })
    .catch( function(err) {
      console.log(err);
    }); 

  socket.on('connect', function(ev) { console.log('CONNECTED', ev, navigator.onLine); $scope.connected = 'TESTING - conn' });
  socket.on('reconnect', function(ev) { console.log('RECONNECTED', ev, navigator.onLine); $scope.connected = 'TESTING - reconn' });
  socket.on('disconnect', function(ev) { console.log('DISCONNECTED', ev, navigator.onLine); $scope.connected = 'TESTING - disconn' });


});

app.controller('AdminCtrl', function($scope, socket, fileSystem, $q, $timeout) {

  var fs = fileSystem;

  fs.createFolder('event')

    .then(function(test) {
      console.log(test);
    })

    .catch(function(err) {
      console.log('already created or error', err.obj);
    });

  var alertUser = function(type, message) {
    $scope.alerts.push({ type:type || 'info', msg:message });
    $timeout( function() {
      // doesn't take into account multiple coming in every few seconds
      $scope.alerts.shift(); // removes first item in alerts
    }, 5000);
  };
  $scope.alerts = [];
  $scope.events = [
    { name: 'Autodesk Oregon District Champs', value: 'pncmp', region: 'Regionals' },
    { name: 'Wilsonville District', value: 'orwil', region: 'PNW' },
    { name: 'Oregon City District', value: 'orore', region: 'PNW' },
    { name: 'Inland Empire Regional', value:'casb', region:'Regionals' }
  ];

// ===== WATCHER FUNCTIONS ====================================
  // make sure event is always good
  $scope.$watch('eventId', function(newEvent, oldEvent) {
    var eventId = newEvent;

    socket.emit('get-event', eventId, function(event) {
      saveEvent(event);
    });
  });

  var saveEvent = function(event) {
    event = event || {};
    var matches = event.matches || [];
    var eventTeams = event.teams || [];
    var matches = matches.sort(function numericSort(match1,match2) { console.log('SORT',match1.number,match2.number); return match1.number - match2.number; });

    var teams = {};

    eventTeams.map( function(team) {
      teams[team.id] = team;
    });

    console.log('TEAMS',teams);

    // turn teams into object, not array
    event.teams = teams;

    fs.writeText( 'event/'+ event.id +".json", JSON.stringify(event))

      .then( function() {
        console.log('Saved '+ event.id +".json", JSON.stringify(event));

        alertUser('success', 'Successfully saved event '+ event.id +'.');

        fs.readFile('event/'+ event.id +'.json').then(function(file) {console.log(JSON.parse(file))});

        fs.getFolderContents('/event/').then(function(dir) {console.log(dir)});
      })
      
      .catch( function errHandler(err) {
        console.log(err);
        alertUser( 'danger', err.message );
      });

  };
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
