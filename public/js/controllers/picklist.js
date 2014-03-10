var app = angular.module('ctrl.picklist', [  
  'ngTouch'
]);


//This is just some test data at the moment.
//info and second_picks are both mock data.
app.controller('PicklistCtrl', function($scope) {

	var selected = { 'background-color': '#d9534f', 'text-decoration': 'line-through' };
	var currentSelection = { 'background-color': '#99CC32' }

	var defensePicks = 				[ 955, 4652, 2811, 4132, 2635, 2002, 997, 2550,  3574, 3673, 2411, 2542, 3674, 3024, 4457, 2733, 3636 ];
	var mixPicks = 						[ 955, 997,  2811, 2635, 2550, 4652, 3574, 2411, 3812, 2542, 3674, 4051, 2733 ];
	var offensePicks = 				[ 4488, 2471, 1425, 955, 997, 3812, 2635, 3673, 2411, 3574, 3024, 4457, 2002, 2550, 4057];
	var midCloseOrFarPicks = 	[ 4488, 2471, 1425, 955, 997, 3812, 2635, 3673, 2411, 3574, 3024, 4457, 2002, 2550, 4057 ];

	$scope['teams'] = {
		753: { name: "High Desert Droids",    notes: "" },
		847: { name: "PHRED",    							notes: "" },
		955: { name: "CV Robotics",    				notes: "" },
		997: { name: "Spartan Robotics",    	notes: "" },
		1425: { name: "Error Code Xero",    	notes: "" },
		1571: { name: "Error404",    					notes: "" },
		2002: { name: "Tualatin Robotics",    notes: "" },
		2093: { name: "Bowtie Brigade",    		notes: "" },
		2374: { name: "Crusaderbots",    			notes: "" },
		2411: { name: "Rebel @lliance",    		notes: "" },
		2471: { name: "Team Mean Machine",    notes: "" },
		2517: { name: "The Green Wrenches",   notes: "" },
		2542: { name: "Go4Bots",    					notes: "" },
		2550: { name: "Skynet",    						notes: "" },
		2635: { name: "Lake Monsters",    		notes: "" },
		2733: { name: "Pigmice",    					notes: "" },
		2811: { name: "Stormbots",    				notes: "" },
		2915: { name: "Riverdale Robotics",   notes: "" },
		3024: { name: "My Favorite Team",    	notes: "" },
		3131: { name: "Gladiators",    				notes: "" },
		3574: { name: "High-Tekerz",    			notes: "" },
		3636: { name: "Generals",    					notes: "" },
		3673: { name: "CYBORG Seagulls",    	notes: "" },
		3674: { name: "4H Cloverbots",    		notes: "" },
		3812: { name: "Bits and Bots",    		notes: "" },
		4051: { name: "Sabin-Sharks",    			notes: "" },
		4057: { name: "KB Bots",    					notes: "" },
		4127: { name: "Loggerbots",    				notes: "" },
		4132: { name: "Scotbots",    					notes: "" },
		4457: { name: "ACE",    							notes: "" },
		4488: { name: "Shockwave",    				notes: "" },
		4652: { name: "WolfTechs",    				notes: "" },
		4692: { name: "Metal Mallards",    		notes: "" },
		5198: { name: "RoboKnight Force",    	notes: "" }
	};

	angular.forEach( $scope.teams, function(team, teamNum) {
		team.selected = false;
		team.style = null;
	});

	//Need input for this part, for now, it's set as an empty object that is later filled with every team.
  $scope['firstPicks'] = {
		955: { name: "CV Robotics",    				second_picks: defensePicks },
		997: { name: "Spartan Robotics",    	second_picks: defensePicks },
		1425: { name: "Error Code Xero",    	second_picks: defensePicks },
		2002: { name: "Tualatin Robotics",    second_picks: defensePicks },
		2411: { name: "Rebel @lliance",    		second_picks: defensePicks },
		2471: { name: "Team Mean Machine",    second_picks: defensePicks },
		2550: { name: "Skynet",    						second_picks: defensePicks },
		2635: { name: "Lake Monsters",    		second_picks: offensePicks },
		3131: { name: "Gladiators",    				second_picks: offensePicks },
		3574: { name: "High-Tekerz",    			second_picks: offensePicks },
		3673: { name: "CYBORG Seagulls",    	second_picks: offensePicks },
		3812: { name: "Bits and Bots",    		second_picks: offensePicks },
		4127: { name: "Loggerbots",    				second_picks: mixPicks },
		4132: { name: "Scotbots",    					second_picks: mixPicks },
		4488: { name: "Shockwave",    				second_picks: mixPicks },
		5198: { name: "RoboKnight Force",    	second_picks: mixPicks }
	};

  angular.forEach( $scope.firstPicks, function(team, teamNum) {
		team.selected = false;
		team.style = null;
	});

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
  $scope.viewTeamInfo = function(teamId) {
  	var teamInfo = $scope.teams[teamId];
		var firstPickInfo = $scope.firstPick = $scope.firstPicks[teamId];
		$scope['secondPicks'] = [];
		$scope.firstPick['id'] = teamId;

		angular.forEach(firstPickInfo.second_picks, function(secondTeamId, order) {
			var pick = $scope.teams[secondTeamId];
			pick['id'] = secondTeamId;

			$scope.secondPicks.push(pick);

			console.log($scope.secondPicks)
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
