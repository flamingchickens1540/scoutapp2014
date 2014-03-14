var app = angular.module('ctrl.pit', [  
  'ngTouch',
  'fileSystem',
  'ui.bootstrap'
]);

app.controller('PitCtrl', function($scope, $http, fileSystem, $q, $log, socket, $timeout) {
  var fs = fileSystem;

  fs.createFolder('pit')

    .then(function(test) {
      console.log(test);
    })

    .catch(function(err) {
      console.log('already created or error', err.obj);
    });

  // request 100MB
  fs.requestQuota(100)

    .then( function(granted) {
      console.log('GRANTED '+ granted +' bytes of persistent data');
    })
    .catch( function(err) {
      console.log(err);
    }); 

  $scope.teams = [];
  $scope.event = {};

  $scope.eventId = null;
  $scope.team = null;

  $scope.alerts = [];


// ===== WATCHERS =========================================
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

// ===== DATA =============================================

  // List of events and what event we are at
  $scope.events = [
    { name: 'Autodesk Oregon Regional', value: 'orpo', region: 'Regionals' },
    { name: 'PNW District - Oregon City', value: 'orore', region: 'PNW' },
    { name: 'PNW District - Wilsonville', value: 'orwil', region: 'PNW' },
    { name: 'Inland Empire Regional', value:'casb', region:'Regionals' }
  ];

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

// ===== RESET ============================================
  var reset = function() {
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
        near: false,
        low: false
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
      autoBalls: null,
      hotRecog: null
    };

    // ============================== NOTES ==============================
    //General Notes
    $scope.notes = '';
  };

// ===== GETTING DB INFO ====================================
  $scope.$watch('team', function(newTeam, oldTeam) {
    if(newTeam != null) {
      $scope['team'].id = newTeam.id;
      $scope['currentNotes'] = newTeam.masterNotes;
    }
  });

  var setTeam = function(teamId) {
    socket.emit('get-team-info', teamId, function(team) {
      $scope.team = team;
      console.log(team);
    });
  };

  var getEvent = function(eventId) {
    socket.emit('get-event', eventId, function(event) {
      console.log(event);

      $scope.event = event || {};

      $scope.teams = ($scope.event.teams || []).sort(function numericSort(team1,team2) { console.log('SORT',team1.id,team2.id); return team1.id - team2.id; });
    });
  };

// ===== SUBMISSION =======================================

  $scope.saveData = function() {

    var team = $scope.team;
    var teamId = null;

    if(team != null) {
      teamId = team.id;
    }


    var pitData = {
      teamId: teamId,
      general: $scope.generalInfo,
      robot: $scope.robotInfo,
      auto: $scope.autoInfo,
      notes: $scope.notes,
    };

    console.log('PITDATA', pitData);

    var verified = verifyData( pitData );

    if( verified.isValidated ) {

      fs.writeText( 'pit/'+ teamId +".json", JSON.stringify(pitData))

      .then( function(granted) {
        console.log('Saved '+ teamId +".json", JSON.stringify(pitData));

        $scope.alerts.push({ type:'success', msg:'Successfully saved team '+ teamId +'\'s pit data.' });

        $timeout(function() {
          // reset
          reset();
          // empty alerts
          $scope.alerts = [];
        }, 5000);

        fs.readFile('pit/'+ teamId +'.json').then(function(file) {console.log(JSON.parse(file))});

        fs.getFolderContents('/pit/').then(function(dir) {console.log(dir)});
      })
      
      .catch( function errHandler(err) {
        console.log(err);
        $scope.alerts.push({ type:'danger', msg:err.message });
      });

    }

    else {
      angular.forEach( verified.errLog, function(err) {
        $scope.alerts.push({ type:'danger', msg:err });
      });

    }
  };

  // check all data
  var verifyData = function verifyData(pitData) {
    
    var errLog = [];
    var validated = {};

    validated['general'] = true;
    validated['robot'] = true;
    validated['auto'] = true;
    validated['team'] = true;

    if( pitData['teamId'] === null ) {
      validated['general'] = false;
      errLog.push('Select a team!')
    }    

    // none for wheels or shootingRange
    /* $scope.generalInfo = {
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
        near: false,
        low: false
      }    
    };*/

    if( pitData.general['shifting'] === null ) {
      validated['general'] = false;
      errLog.push('Issues in autoInfo. Have you filled out shifting?')
    }


    // ROBOT INFO
    /*$scope.robotInfo = {
      shooterType: null,
      collectorType: null,

      catchable: null,

      disabledPlan: '',

      playstyle: null
    };*/
    if( !( 
      pitData.robot['shooterType'] &&
      pitData.robot['collectorType'] &&
      pitData.robot['playStyle']
      ) && pitData.robot['catchable'] === null ) {

      validated['robot'] = false;
      errLog.push('Issues in robotInfo. Have you filled out shooter type, collector type, catchable, and primary play style?')
    }


    // AUTONOMOUS VALIDATION
    /*$scope.autoInfo = {
      dfAuto: null,
      autoBalls: null,
      hotRecog: null
    };*/
    if(
      pitData.auto['dfAuto'] === null &&
      pitData.auto['autoBalls'] === null &&
      pitData.auto['hotRecog'] === null
      ) {

      validated['auto'] = false;
      errLog.push('Issues in autoInfo. Have you filled out drive forward, autonomous balls, and hot goal recognition?')
    }


    var validatePit = ( validated['robot'] && validated['auto'] && validated['general'] );

    return { isValidated:validatePit, errLog:errLog };
  };

  $scope.submitData = function() {
    var teamData = [];

    // get all data from fs
    fs.getFolderContents('/pit/')

    .then( function readFilesFromDirectory(dir) {
      console.log('DIR', dir);

      return $q.all( dir.map( function(fileEntry) {
        if(fileEntry.isFile)
          return fs.readFile( 'pit/'+ fileEntry.name )
      }))
    })

    .then( function doStuffWithFiles(files) {
      var teamPitData = files.map( function returnParsedJSON(file) {
        return JSON.parse(file);
      });

      console.log(teamPitData);

      
      return $http.post('/submit/pitData', teamPitData)

      .success( function(data, status, headers, config) {
        console.log(data, status, headers, config);
        if(status == 200) {
          $scope.alerts.push({ type:'success', msg:'Saved to server' });

          $timeout(function() {
            console.log('TEST TIMEOUT')
            // empty alerts
            $scope.alerts = [];
          }, 5000);
        }
        else {
          return new Error('bad request');
        }
      })

      .catch( function(err) {
        console.log(err.message+' IN REQUEST');
      });
    })

    .catch( function(err) {
      console.error(err);
      alert(err, "not saved");
    });
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.clearEntries = function() {
    clearFS($q, fs);
  };

  $scope.printEntries = function() {
    getDir($q, fs);
  };


  // init all fields
  reset();
});

// ============================== DEV FUNCTIONS ===========
  // empty pit directory
  var clearFS = function(q, fs) {
    fs.getFolderContents('/pit/')

    .then( function readFilesFromDirectory(dir) {
      console.log('DIR', dir);

      return q.all( dir.map( function(fileEntry) {
        if(fileEntry.isFile)
          return fs.deleteFile( 'pit/'+ fileEntry.fullPath )
      }));

    })

    .then( function(files) {
      console.log(files);
    })

    .catch( function errHandler(err) {
      console.log(err);
    });
  };

  // console.log pit directory
  var getDir = function(q, fs) {
    fs.getFolderContents('/pit/')

    .then( function readFilesFromDirectory(dir) {
      console.log('DIR', dir);
    })

    .catch( function errHandler(err) {
      console.log(err);
    });
  };
