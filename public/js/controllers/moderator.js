var app = angular.module('ctrl.moderator', [  
  'ngTouch',
  'ui.bootstrap',
  'btford.socket-io'
]);

app.controller('ModeratorCtrl', function($scope, $modal, socket, $http, $log) {

  $scope.events = [
    { name:'PNW District Champs', value:'orpo' }
  ];

  $scope.matches = [];

  $scope.eventId = null;
  $scope.event = null;

  socket.on('receive-event', function(event) {
    $scope.event = event || {};
    $scope.matches = $scope.event.matches;
    console.log(event);
  });

  // make sure event is always good
  $scope.$watch('eventId', function(newEvent, oldEvent) {

    socket.emit('get-event', newEvent);

  });


/*
MATCH
{id: Number,
moderated: Boolean, //if true, then the match was moderated already
redAlliance: {team1:Number,team2:Number,team3:Number},
blueAlliance: {team1:Number,team2:Number,team3:Number},
}
  


*/

  $scope.matches = [
    
    // {number: 123,moderated: false, redAlliance: {team1:1540,team2:666,team3:4321}, blueAlliance: {team1:1234,team2:678,team3:8756}},
    // {number: 13,moderated: false, redAlliance: {team1:140,team2:66,team3:432}, blueAlliance: {team1:124,team2:8,team3:876}},
    // {number: 130,moderated: false, redAlliance: {team1:1540,team2:666,team3:4321}, blueAlliance: {team1:1234,team2:678,team3:8756}},
    // {number: 135,moderated:true, redAlliance: {team1:140,team2:66,team3:432}, blueAlliance: {team1:124,team2:8,team3:876}},
    // {number: 1263,moderated: false, redAlliance: {team1:1540,team2:666,team3:4321}, blueAlliance: {team1:1234,team2:678,team3:8756}},
    // {number: 153,moderated: true, redAlliance: {team1:140,team2:66,team3:432}, blueAlliance: {team1:124,team2:8,team3:876}},
    // {number: 1723,moderated: false, redAlliance: {team1:1540,team2:666,team3:4321}, blueAlliance: {team1:1234,team2:678,team3:8756}},
    // {number: 173,moderated: true, redAlliance: {team1:140,team2:66,team3:432}, blueAlliance: {team1:124,team2:8,team3:876}},
     
  ];

  $scope.editNotes = function (team, matchData) {

    var modalInstance = $modal.open({
      templateUrl: 'components/moderatorModal.jade',
      resolve: {
        matchNotes: function() { return matchData.notes },
        masterNotes: function() { return team.masterNotes }
      },
      controller: function ($scope, $modalInstance, matchNotes, masterNotes) {

        $scope.notes = {};
        $scope.notes['master'] = masterNotes;
        $scope.notes['match'] = matchNotes;

        $scope.ok = function () {
          $log.log('CLOSING: ', $scope.notes);
          $modalInstance.close( $scope.notes['master'] );
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

      }
    });

    modalInstance.result.then(
      function(notes) {
        console.log('OUTPUT NOTES: ',notes);
      }, 
      function() {
        $log.info('Modal dismissed at: ' + new Date());
      }
    );
  };


  
});

