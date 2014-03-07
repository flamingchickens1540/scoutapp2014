var app = angular.module('ctrl.picklist', [  
  'ngTouch',
  'ui.bootstrap',
  'btford.socket-io'
]);


//This is just some test data at the moment.
//info and second_picks are both mock data.
app.controller('PicklistCtrl', function($scope) {

	var selected = { 'background-color': '#d9534f', 'text-decoration': 'line-through' };
	var currentSelection = { 'background-color': '#99CC32' }

	$scope['teams'] = {
		1540: { name:"The Flaming Chickens", second_picks:[1359, 1432, 2374], 
			notes:"FRC LOL LOL LOL 1" },
		1359: { name:"The Scalawags", second_picks:[1359, 1432, 2374], 
			notes:"FRC LOL LOL LOL 2" },
		1432: { name:"Mahr's Metal Beavers", second_picks:[1359, 1432, 2374], 
			notes:"FRC LOL LOL LOL 3" },
		2374: { name:"Crusaderbots", second_picks:[1359, 1432, 2374], 
			notes:"FRC LOL LOL LOL 4" },
		2990: { name:"Hotwire", second_picks:[1359, 1432, 2374], 
			notes:"FRC LOL LOL LOL 5" },
		3131: { name:"Gladiators", second_picks:[1359, 1432, 2374], 
			notes:"FRC LOL LOL LOL 6" },
		4051: { name:"Sabin-Sharks", second_picks:[1359, 1432, 2374], 
			notes:"FRC LOL LOL LOL 7" },
		4127: { name:"Loggerbots", second_picks:[1359, 1432, 2374], 
			notes:"FRC LOL LOL LOL 8" },
	};
	angular.forEach( $scope.teams, function(team, teamNum) {
		team.selected = false;
		team.style = null;
	});

	//Need input for this part, for now, it's set as an empty object that is later filled with every team.
  $scope['firstPicks'] = {
  	1540: { name:"The Flaming Chickens", second_picks:[1359, 1432, 2374] },
  	1359: { name:"The Scalawags", second_picks:[1359, 1432, 2374] },
		1432: { name:"Mahr's Metal Beavers", second_picks:[1359, 1432, 2374] },
  };
  angular.forEach( $scope.firstPicks, function(team, teamNum) {
		team.selected = false;
		team.style = null;
	});

  $scope['secondPicks'] = {};
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
  $scope.viewTeamInfo = function(teamId) {
  	var teamInfo = $scope.teams[teamId];
		var firstPickInfo = $scope.firstPick = $scope.firstPicks[teamId];
		$scope['secondPicks'] = {};
		$scope.firstPick['id'] = teamId;

		angular.forEach(firstPickInfo.second_picks, function(secondTeamId) {
			$scope.secondPicks[secondTeamId] = $scope.teams[secondTeamId];
		});

		$scope.currentNotes = teamInfo.notes;
  };

  $scope.getClass = function(teamId) {
  	console.log($scope.teams[teamId])

  	// return the class
		return $scope.teams[teamId].style;
  };

  $scope.deselect = function() {

  };
});
