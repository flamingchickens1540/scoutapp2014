var app = angular.module('ctrl.moderator', [  
  'ngTouch',
  'ui.bootstrap',
  'btford.socket-io'
]);

app.controller('ModeratorCtrl', function($scope, $modal, socket, $http, $log) {

  // returns true/false depending on whether data exists for the match
  $scope.containsData = function(matchData) {
    return !angular.isDefined(matchData);
  };

  $scope.events = [
    { name:'PNW District Champs', value:'orpo' },
    { name:'Inland Empire Regional', value:'casb' }
  ];

  $scope.eventId = null;
  $scope.matches = [];
  $scope.teams = {};

  var getEvent = function(eventId) {
    socket.emit('moderator:get-data', eventId, function(data) {

      if(!angular.isDefined(data.matches))
        data.matches = [];

      $scope.matches = (data.matches || []).sort(function numericSort(match1,match2) { console.log('SORT',match1.number,match2.number); return match1.number - match2.number; });;

      angular.forEach(data.teams, function(team) {
        $scope.teams[team.id] = team;
        $scope.teams[team.id].masterNotes = team.masterNotes || 'FRC '+ team.id;
      });
      console.log($scope.teams);

    });
  };

  // make sure event is always good
  $scope.$watch('eventId', function(newEvent, oldEvent) {
    getEvent( newEvent );
  });

  $scope.editNotes = function (matchData) {
    console.log(matchData);
    var teamId = matchData.team;

    var modalInstance = $modal.open({
      templateUrl: 'components/moderatorModal.jade',
      resolve: {
        matchNotes: function() { return matchData.data.submit.notes },
        masterNotes: function() { return ($scope.teams[teamId] || {}).masterNotes } //REMOVE THIS WHEN POSSIBLE
      },
      controller: function ($scope, $modalInstance, matchNotes, masterNotes) {

        $scope.teamId = teamId || 'None';

        $scope.notes = {};
        $scope.notes['master'] = masterNotes;
        $scope.notes['match'] = matchNotes;

        $scope.ok = function () {
          $log.log('CLOSING: ', $scope.notes);
          $modalInstance.close({ 
            teamId:teamId, 
            masterNotes:$scope.notes['master'] 
          });
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

      }
    });

    modalInstance.result.then(
      function saveAndShareNewNote(noteInfo) {
        console.log(noteInfo);

        // updates the master note locally so that I don't need to pull from the db for notes
        $scope.teams[teamId].masterNotes = noteInfo.masterNotes;

        socket.emit('save-moderated-notes', noteInfo, function(isSaved) {
          console.log('Note was saved: '+ isSaved);
          if(isSaved) alert('saved!');
          else alert('not saved!');
        })
      },

      function closeModal() {
        $log.info('Modal dismissed at: ' + new Date());
      }
    );

  };


  
});

