var app = angular.module('ctrl.picklist', [  
  'ngTouch'
]);


//This is just some test data at the moment.
//info and second_picks are both mock data.
app.controller('PicklistCtrl', function($scope, socket) {

	var selected = { 'background-color': '#d9534f', 'text-decoration': 'line-through' };
	var currentSelection = { 'background-color': '#99CC32' }

	// looking for scorers
	var defensePicks = 				[ 4488, 2471, 1425, 2811, 2374, 2635, 2093, 2990, 3674, 2411, 2521, 4057, 2733, 956, 4132, 4043 ];
	var lowGoalPicks =  			[ 4488, 2471, 1425, 2811, 2374, 2635, 2093, 2990, 3674, 2411, 2521, 4057, 2733, 956, 4132, 4043 ];
	
	// looking for passers and defenders
	var shortOffensePicks = 	[ 4488, 2471, 1425, 2517, 2733, 2811, 3674, 2521, 2626, 2635, 957, 4043, 4051, 4132, 2411, 5085 ];
	var pureOffensePicks = 		[ 4488, 2471, 1425, 2517, 2733, 2811, 3674, 2521, 2626, 2635, 957, 4043, 4051, 4132, 2411, 5085 ];
	
	// looking for passer, offensive or defensive
	var passingPicks = 				[ 4488, 2471, 1425, 2811, 2374, 2635, 2093, 2990, 2411, 2517, 3674, 2733, 4057, 4132, 4043, 956 ];

	var getEvent = function(eventId) {
    socket.emit('get-event', eventId, function(event) {
      console.log(event);

      $scope.event = event || {};

      var allTeams = ($scope.event.teams || []).sort(function numericSort(team1,team2) { console.log('SORT',team1.id,team2.id); return team1.id - team2.id; });

	    angular.forEach( allTeams, function(team) {
				team.selected = false;
				team.style = null;

				//console.log(team);
				$scope.teams[team.id] = team;
			});

			angular.forEach( $scope.firstPicks, function(team, teamNum) {
				console.log('Teams: ', $scope.firstPicks);

				team.name = $scope.teams[teamNum].name;
				team.selected = false;
				team.style = null;
			});
		});
  };

  $scope.teams = {};
  getEvent('orwil');

	$scope.firstPicks = {
  	2811: { second_picks: pureOffensePicks },
  	2093: { second_picks: shortOffensePicks },
  	5085: { second_picks: defensePicks },
  	4488: { second_picks: pureOffensePicks },
  	2990: { second_picks: shortOffensePicks },
  	3131: { second_picks: passingPicks },
  	956:  { second_picks: lowGoalPicks },
  	3636: { second_picks: defensePicks },
  	3674: { second_picks: passingPicks },
  	4051: { second_picks: defensePicks },
  	1540: { second_picks: passingPicks },
  	2521: { second_picks: lowGoalPicks },
  	2374: { second_picks: pureOffensePicks },
  	2411: { second_picks: defensePicks },
  	1425: { second_picks: pureOffensePicks },
  	2517: { second_picks: defensePicks }
  };


  $scope['secondPicks'] = [];
  $scope['currentTeamInfo'] = {};

  $scope.selectTeam = function(teamId) {

		var team = $scope.teams[teamId];

		// change the styles in teams
		team.selected = !team.selected;
		team.style = (team.style != null)? null: selected;

		// change the styles in firstPicks
		if( angular.isDefined($scope.firstPicks[teamId])){
			$scope.firstPicks[teamId].style = team.style;
			$scope.firstPicks[teamId].selected = team.selected;
		}
  };

  // makes the color green
  // $scope.toGreenColor = function(teamId) {
  // 	angular.forEach( $scope.teams, function(team, teamId) {
  // 		team.style = null;
  // 	});

  // 	$scope.firstPicks[teamId].style = currentSelection;
  // };

  $scope.firstPick = {};

  // second teamlist to show up
  $scope.viewFirstTeamInfo = function(teamId) {
  	var teamInfo = $scope.teams[teamId];
		$scope.firstPick = $scope.firstPicks[teamId];
		$scope['secondPicks'] = [];
		$scope.firstPick['id'] = teamId;

		angular.forEach($scope.firstPick.second_picks, function(secondTeamId, order) {
			// console.log($scope.teams[secondTeamId]);
			var pick = $scope.teams[secondTeamId];
			pick['id'] = secondTeamId;

			$scope.secondPicks.push(pick);

			//console.log($scope.secondPicks)
		});

		$scope.displayInfo = $scope.firstPick.id + ' - ' +  $scope.firstPick.name
		$scope.currentNotes = teamInfo.masterNotes || 'NO NOTES?';
  };

  $scope.secondPick = {};

  $scope.viewSecondTeamInfo = function(teamId) {

  	$scope.currentNotes = teamId;

  	var teamInfo = $scope.teams[teamId];
		$scope.secondPick = $scope.teams[teamId];

		//$scope.secondPick['id'] = teamId;
		$scope.displayInfo = $scope.secondPick.id + ' - ' +  $scope.secondPick.name
		$scope.currentNotes = $scope.secondPick.masterNotes || 'NO NOTES?';
  };

  $scope.getClass = function(teamId) {
  	//console.log($scope.teams[teamId])

  	// return the class
		return $scope.teams[teamId].style;
  };

  $scope.deselect = function() {

  };
});
