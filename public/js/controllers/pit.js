var app = angular.module('ctrl.pit', [  
  'ngTouch',
  'fileSystem',
  'ui.bootstrap'
]);

var clearFS = function(q, fs) {
  fs.getFolderContents('/')

  .then( function readFilesFromDirectory(dir) {
    console.log('DIR', dir);

    return q.all( dir.map( function(fileEntry) {
      if(fileEntry.isFile)
        return fs.deleteFile( fileEntry.fullPath )
    }));

  })

  .then( function(files) {
    console.log(files);
  })

  .catch( function errHandler(err) {
    console.log(err);
  });
};

var getDir = function(q, fs) {
  fs.getFolderContents('/')

  .then( function readFilesFromDirectory(dir) {
    console.log('DIR', dir);
  })

  .catch( function errHandler(err) {
    console.log(err);
  });
};

app.controller('PitCtrl', function($scope, $http, fileSystem, $q, $log, socket) {
  var fs = fileSystem;

  // request 100MB
  fs.requestQuota(100)

  .then(function(granted) {
    console.log('GRANTED '+ granted +'MB of persistent data');
  },
  function(err) {
    console.log(err);
  }); 

  $scope.teams = [];
  $scope.event = {};

  $scope.eventId = null;
  $scope.team = null;

  // List of events and what event we are at
  $scope.events = [
    { name: 'Autodesk Oregon Regional', value: 'orpo', region: 'Regionals' },
    { name: 'pnw - district 1', value: 'test2', region: 'PNW' },
    { name: 'Inland Empire Regional', value:'casb', region:'Regionals' }
  ];

  var getEvent = function(eventId) {
    socket.emit('get-event', eventId, function(event) {
      console.log(event);

      $scope.event = event || {};

      $scope.teams = ($scope.event.teams || []).sort(function numericSort(team1,team2) { console.log('SORT',team1.id,team2.id); return team1.id - team2.id; });
    });
  };

  // make sure event is always good
  $scope.$watch('eventId', function(newEvent, oldEvent) {
    getEvent( newEvent );
  });

  $scope.$watch('team', function(newTeam, oldTeam) {
    if(newTeam != null) {
      $scope.team = newTeam;
      console.log('newTeam',newTeam.id)
    }
  });

// ==============================  DATA  ==============================

  // List of wheels and what kind of wheels are present. Also notes on wheels
  $scope['wheels'] = [
    'None',
    'High Traction',
    'Traction',
    'Mecanum',
    'Omni',
    'Swerve',
    'Caster'
  ];

  // List of Shooter types
  $scope['shooterTypes'] = [
    'Catapult',
    'Spinner',
    'Kicker',
    'None'
  ];

  // List of Collector types
  $scope['collectorTypes'] = [
    'Claw',
    'Forklift',
    'Rollers',
    'Passive',
    'None'
  ];

  // Play style
  $scope['playstyles'] = [
    'Forward',
    'Middle',
    'Starter',
    'Goalie'
  ];


// ============================== GENERAL INFO ==============================
  // Team Name
  $scope.generalInfo = {
    wheel: {
      'wheelL1': null,
      'wheelL2': null,
      'wheelL3': null,
      'wheelR1': null,
      'wheelR2': null,
      'wheelR3': null
    },

    shifting: null,

    shootingRange: {
      far: false,
      medium: false,
      near: false
    }    
  };

// ============================== ROBOT INFO ==============================
  // How far can they shoot/Shooting range
  $scope.robotInfo = {
    shooterType: null,
    collectorType: null,

    catchable: null,

    disabledPlan: '',

    playstyle: null
  };

// ============================== AUTONOMOUS INFO ==============================
  // Strait forward autonomous?
  $scope.autoInfo = {
    dfAuto: null,
    autoBalls: 0,
    hotRecog: null
  };

// ============================== NOTES ==============================
  //General Notes
  $scope.notes = '';

// ========================== GETTING TEAMS ==========================
  $scope.$watch('team', function(newTeam, oldTeam) {
    if(newTeam != null) {
      $scope.info['team'] = newTeam.id;
      $scope['currentNotes'] = newTeam.masterNotes;
    }
  });

  var setTeam = function(teamId) {
    socket.emit('get-team-info', teamId, function(team) {
      $scope.team = team;
      console.log(team);
    });
  };

// ============================== SUBMIT ==============================

  $scope.saveData = function() {
    var teamId = $scope.team.id;

      var pitData = {
        teamId: teamId,
        general: $scope.generalInfo,
        robot: $scope.robotInfo,
        auto: $scope.autoInfo,
        notes: $scope.generalNotes,
      };

      console.log('PITDATA', pitData);

      fs.writeText( teamId +".json", JSON.stringify(pitData))

      .then(function(granted) {
        console.log('Saved '+ teamId +".json", JSON.stringify(pitData));

        fs.readFile(teamId +'.json').then(function(file) {console.log(JSON.parse(file))});

        fs.getFolderContents('/').then(function(dir) {console.log(dir)});
      })
      
      .catch( function errHandler(err) {
        console.log(err);
        alert(err, "not saved");
      });
  };

  $scope.submitData = function() {
    var teamData = [];
    var allPromises = [];

    // get all data from fs
    fs.getFolderContents('/')

    .then( function readFilesFromDirectory(dir) {
      console.log('DIR', dir);

      return $q.all( dir.map( function(fileEntry) {
        if(fileEntry.isFile)
          return fs.readFile( fileEntry.name )
      }))
    })

    .then( function doStuffWithFiles(files) {
      angular.forEach(files, function(file, num) {

        $log.log(files);
        $log.log('Promise '+ num +' added!');
      });
    })

    .catch( function(err) {
      console.error(err);
      alert(err, "not saved");
    });
  };

  $scope.clearEntries = function() {
    clearFS($q, fs);
  };

  $scope.printEntries = function() {
    getDir($q, fs);
  };

});
