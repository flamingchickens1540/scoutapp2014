var app = angular.module('ctrl.moderator', [  
  'ngTouch',
  'ui.bootstrap',
  'btford.socket-io'
]);

app.controller('ModeratorCtrl', function($scope, $modal, socket, $http, $log, $timeout) {

  $scope.eventId = null;
  $scope.matches = [];
  $scope.teams = {};

  $scope.alerts = [];

// ===== HELPER FUNCTIONS =============================================  
  var alertUser = function(type, message) {
    $scope.alerts.push({ type:type || 'info', msg:message });
    $timeout( function() {
      // doesn't take into account multiple coming in every few seconds
      $scope.alerts.shift(); // removes first item in alerts
    }, 5000);
  };

// ===== DATA =============================================
  $scope.events = [
    { name:'PNW District Champs', value:'orpo' },
    { name:'Inland Empire Regional', value:'casb' }
  ];

// ===== WATCHER FUNCTIONS ====================================
  var getEvent = function(eventId) {
    socket.emit('moderator:get-data', eventId, function(data) {

      if(!angular.isDefined(data.matches)) {
        data.matches = [];

        alertUser( 'danger', 'No matches found for '+ eventId );
      };

      $scope.matches = (data.matches || []).sort(function numericSort(match1,match2) { console.log('SORT',match1.number,match2.number); return match1.number - match2.number; });;

      angular.forEach(data.teams, function(team) {
        $scope.teams[team.id] = team;
        $scope.teams[team.id].masterNotes = team.masterNotes || 'FRC '+ team.id;
      });
      console.log($scope.teams);

      alertUser( 'info', 'Successfully pulled matches and teams for '+ eventId );

    });
  };

  // make sure event is always good
  $scope.$watch('eventId', function(newEvent, oldEvent) {
    getEvent( newEvent );
  });

  // DOES NOT ACCOUNT FOR ANOTHER PERSON EDITING THE NOTE DURING UPDATE
  socket.on('save-moderated-notes', function updateLocalNotes(info) {
    console.log('New notes!', info);

    if($scope.teams[info.teamId]) {
      $scope.teams[info.teamId].masterNotes = info.masterNotes;
    }

    alertUser('info','Pulled notes updates for team '+ info.teamId);
  });

  socket.on('moderator:new-team-match', function(teamMatch) {
    console.log('NEW TEAM MATCH',teamMatch);

    var matchNum = teamMatch.match;
    var pos = teamMatch.color + teamMatch.posNum;

    $scope.matches[matchNum-1][pos+'Data'] = teamMatch;
    $scope.$apply();

    alertUser('info','Match Data for '+ teamMatch.team +' in match '+ matchNum +' is now avaliable.');
  });

// ===== $SCOPE FUNCTIONS ====================================
  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

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
        $scope.teams[noteInfo.teamId].masterNotes = noteInfo.masterNotes;

        noteInfo['teamMatch'] = matchData; //mongodb object - INSECURE

        socket.emit('save-moderated-notes', noteInfo, function(isSaved) {
          console.log('Note was saved: '+ isSaved);
          if(isSaved) {
            alertUser('success','Updated master notes for team '+ noteInfo.teamId);
          }
          else { 
            alertUser('danger','Failed to updated master notes for team '+ noteInfo.teamId);
          }
        });
      },

      function closeModal() {
        $log.info('Modal dismissed at: ' + new Date());
      }
    );
  };

  $scope.openMatchPdf = function(eventId, matchNum) {

    socket.emit('moderator:generate-PDF', { eventId:eventId, matchNum:matchNum }, function(wasSuccess) {
      if(wasSuccess)
        window.open('/pdf/'+ eventId +'_'+ matchNum +'.pdf');
      else
        alertUser('danger', 'failed to generate PDF');
    });

  };
  
});

