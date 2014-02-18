var app = angular.module('ctrl.picklist', [  
  'ngTouch',
  'ui.bootstrap',
  'btford.socket-io'
]);

//This is just some test data at the moment.
//info and second_picks are both mock data.
app.controller('PicklistCtrl', function($scope) {

  $scope.allTeams = {

		1540: {
		  name: "Flaming Chickens",
		  selected: false,
		  styleClass : null,
		  info: "This is where info for 1540 will go.",
		  second_picks: [1359, 1432, 2374]
		},

		1359: {
		  name: "The Scalawags",
		  selected: false,
		  styleClass : null,
		  info: "This is where info for 1359 will go.",
		  second_picks: [1540, 1432, 2374]

		},

		1432: {
		  name: "Mahr's Metal Beavers",
		  selected: false,
		  styleClass : null,
		  info: "This is where info for 1432 will go.",
		  second_picks: [1540, 1359, 2374]
		},

		2374:{
		  name: "Crusaderbots",
		  selected: false,
		  styleClass : null,
		  info: "This is where info for 2374 will go.",
		  second_picks: [1359, 1432, 1540]
		},

		2990:{
		  name:"Hotwire",
		  selected: false,
		  styleClass : null,
		  info: "This is where info for 2990 will go.",
		  second_picks: [1359, 1540, 2374]
		},

		3131:{
		  name: "Gladiators",
		  selected: false,
		  styleClass : null,
		  info: "This is where info for 3131 will go.",
		  second_picks: [1540, 1432, 2990]
		},

		4051:{
		  name: "Sabin-Sharks",
		  selected: false,
		  styleClass : null,
		  info: "This is where info for 4051 will go.",
		  second_picks: [1540, 1432, 3131]
		},

		4127:{
		  name: "Loggerbots",
		  selected: false,
		  styleClass : null,
		  info: "This is where info for 4127 will go.",
		  second_picks: [1359, 3131, 4051]
		}
  };

  //Need input for this part, for now, it's set as an empty object that is later filled with every team.
  $scope.firstPicks = {};

  //Need input for this part, until then, it's just a duplication of the allTeams object.
  $scope.secondPicks = $scope.allTeams;

  $scope.currentTeamInfo = null;


  $scope.selectTeam = function(teamId) {
		$scope.allTeams[teamId].selected = !$scope.allTeams[teamId].selected;
		$scope.allTeams[teamId].styleClass = ($scope.allTeams[teamId].styleClass ==='selected')? null: 'selected';


	  angular.forEach($scope.allTeams, function(obj, key) {
			if (!obj.selected) {

			  $scope.firstPicks[key] = {
					name: obj.name,
					selected: obj.selected,
					styleClass: obj.styleClass,
					info: obj.info,
					second_picks: obj.second_picks
			  };
			}
	  });



	  $scope.viewTeamInfo = function(teamId) {
			
			// what does this function do? - Hamzah
			$scope.currentTeamInfo = teamId;
	  };

		// run the logic for the first, second lists
  };

  $scope.getClass = function(inputTeamId) {
  	// return the class
		return $scope.allTeams[inputTeamId].styleClass;
  };
});
