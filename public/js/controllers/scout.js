var app = angular.module('ctrl.scout', [  
  'ngTouch',
  'ui.bootstrap',
  'fileSystem',
  'btford.socket-io'
]);

app.controller('ScoutHomeCtrl', function($scope) {
  // scout home is where you select the alliance position you watch
  // anything that goes on the team selection page? Nothing?
});

app.controller('ScoutCtrl', function($scope, socket, $http, $routeParams, $log, $timeout, fileSystem, $q) {
  var fs = fileSystem;

  fs.createFolder('scout')

    .then(function(test) {
      console.log(test);
    })

    .catch(function(err) {
      console.log('already created or error', err.obj);
    });

  $scope.alerts = [];
  /* NON-DATA INFORMATION */

// ===== DATA AND RESET ====================================
  var resetScout = function(finishedMatchNum) {
    if( angular.isDefined(finishedMatchNum) ) {

      // if I don't add one, it automatically jumps up one (CS starts at 0)
      $scope.match = $scope.event.matches[finishedMatchNum];
    }

    /* COLLAPSE STATES */
    $scope.collapsed = {
      info: false,
      auto: true,
      scoring: true,
      teamwork: true,
      issues: true,
      submit: true
    };

    /***************** AUTONOMOUS *****************/
    $scope.auto = {
      startPosition: null,
      drivesForward: false,
      fieldValues: {
        goal: 0,
        miss: 0,
        hotgoal: 0
      },
      goalieValues: {
        block: 0,
        miss: 0
      }
    };

    /***************** SCORING *****************/
    $scope.scoring = {
      playStyles: [],
      goals: {
        high: 0,
        highMisses: 0,

        low: 0,
        lowMisses: 0
      }
    };

    $scope.scoring['playStyles'] = [
      { name: 'dozer', action: false },
      { name: 'goalie', action: false },
      { name: 'truss shooter', action: false },
      { name: 'defense', action:  false },
      { name: 'shooter', action:  false }
    ];

    /***************** TEAMWORK *****************/
    $scope.teamwork = {
      receiving: {
        roll: 0,
        truss: 0
      },
      passing: {
        roll: 0,
        truss: 0
      },
      humanPass: false
    };

    /***************** ISSUES *****************/
    $scope.issues = {
      // DEAD OR BROKEN?
      deadBroken: null,
      deadBrokenNotes: '',

      // PASSIVE EJECTION ON ROBOT?
      ejectable: null,
      ejectionNotes: ''
    };

    /***************** SUBMISSION *****************/

    /* RATINGS */
    $scope.submit = {
      ratings: [],
      numStars: 5,

      notes: '',
      currentNotes: ($scope.team || {}).masterNotes || ''
    }; 

    $scope.submit['ratings'] = [
      { title: 'driving', stars: 0 },
      { title: 'shooting', stars: 0 },
      { title: 'passing', stars: 0 },
      { title: 'defense', stars: 0 },
      { title: 'catching', stars: 0 },
      { title: 'collecting', stars: 0 }
    ];
  };

  resetScout();

    /* LISTS */
  $scope.scouts = [
    
    'Adolfo Apolloni','Alexandra Crew','Andie Becker','Anna Dodson','Ben Balden','Calissa Spooner','Conner Hansen','David Vollum','Elliot Lewis','Evan Chapman','Evë Maquelin','Gregor Peach','Hamzah Khan','Holly Sauer','Ian Hoyt','Iman Wahle','Iris Ellenberg','Jacob Bendicksen','Jacob Siegel','Jake Hansen','Jasper Gordon','Josephine Evans','Jules Renaud','Kellie Takahashi','Liam Wynne','Lukas Stracovsky','Maria Chang','Max Armstrong','Max Luu','Mind Tienpasertkij','Peter Smith','Robin Attey','Rushdi Abualhaija','Ryan Selden','Tristan Furnary','Tyler Riddle','Vincent Miller','Y Yen Gallup','Zach Alan'
  ];

  $scope.events = [
    { name: 'Autodesk Oregon District Champs', value: 'pncmp', region: 'Regionals' },
    { name: 'Wilsonville District', value: 'orwil', region: 'PNW' },
    { name: 'Oregon City District', value: 'orore', region: 'PNW' },
    { name: 'Inland Empire Regional', value:'casb', region:'Regionals' }
  ];

// ===== VIEW FUNCTIONS ====================================
  $scope.displayView = function displayView(panel) {
    $scope.collapsed = {
      info: true,
      auto: true,
      scoring: true,
      teamwork: true,
      issues: true,
      submit: true
    };

    switch(panel) {
      case 'info':
        $scope.collapsed['info'] = false;
        break;

      case 'auto':
        $scope.collapsed['auto'] = false;
        $scope.collapsed['issues'] = false;
        break;

      case 'teleop':
        $scope.collapsed['scoring'] = false;
        $scope.collapsed['teamwork'] = false;
        $scope.collapsed['issues'] = false;
        break;

      case 'submit':
        $scope.collapsed['submit'] = false;
        break;

      default:
        // nothing happens
        break;
    }
  };

  var alertUser = function(type, message) {
    $scope.alerts.push({ type:type || 'info', msg:message });
    $timeout( function() {
      // doesn't take into account multiple coming in every few seconds
      $scope.alerts.shift(); // removes first item in alerts
    }, 5000);
  };

// ===== WATCHER FUNCTIONS ====================================
  // make sure event is always good
  $scope.$watch('info.event', function(newEvent, oldEvent) {
    getEvent( newEvent );
  });

  // make sure event is always good
  $scope.$watch('match', function(newMatch, oldMatch) {
    if(newMatch != null) {
      console.log(newMatch);
      var teamPosInArray = $scope.info.posNum - 1; // adjust for arrays
      setTeam( newMatch[ $scope.info.color +'Alliance' ].teams[ teamPosInArray ] );
      $scope.info.matchNum = newMatch.number;
    }
  });

  var getEvent = function(eventId) {
    // socket.emit('get-event', eventId, function(event) {
    fs.readFile('event/'+eventId+'.json')
      .then( function(event) {
        event = JSON.parse(event);
        $scope.event = event || {};

        $scope.matches = $scope.event.matches || [];
        $scope.matches = $scope.matches.sort(function numericSort(match1,match2) { console.log('SORT',match1.number,match2.number); return match1.number - match2.number; });

        console.log(event);
      })

      .catch( function(err) {
        console.log(err);
      });
  };

  var setTeam = function(teamId) {
    var team = $scope.event.teams[teamId];
    $scope.team = team;
    console.log('SET TEAM', team);

    // $scope.submit['currentNotes'] = team.masterNotes || '';

    $scope.info['team'] = teamId;
  };

  // updates goal with hotgoal
  $scope.$watch( 'auto.fieldValues.hotgoal', function(newVal, oldVal) {
    $scope.auto.fieldValues['goal'] += (newVal - oldVal);
  });

  $scope.$watch( 'issues.ejectionNotes', function(newVal, oldVal) {
    if ($scope.issues.ejectable == null) $scope.issues.ejectionNotes = '';
  });

  $scope.$watch( 'issues.deadBrokenNotes', function(newVal, oldVal) {
    if ($scope.issues.deadBroken == null) $scope.issues.deadBrokenNotes = '';
  });

// ===== SET INFO ====================================
  var pos = $routeParams.pos;
  var posNum = parseInt(pos.slice( pos.length-1 )); // 'red1' => 1
  var color = pos.slice(0, pos.length-1).toLowerCase(); // 'red1' => 'red'

  $scope.info = {
    scout: null, // chosen by select, set once and ignore
    event: null, //chosen by select, set once and ignore
    team: null, // returned in the POST request to the server
    matchNum: null, //set once when page opens and ignore

    // 1, 2, or 3
    posNum: posNum,
    color: color
  };

  $scope.match = null;

  // AUTONOMOUS

  // SCORING

  // TEAMWORK

  // ISSUES

  // SUBMISSION
  
// ===== SCOUT SCOPE FUNCTIONS ====================================
  $scope.submitMatch = function submitMatch() {
    // verify all data is inputted

    var test = verify();

    if(test.verified) {
      //send to server
      $log.log('INFO', $scope.info);
      $log.log('AUTONOMOUS', $scope.auto);
      $log.log('SCORING', $scope.scoring);
      $log.log('TEAMWORK', $scope.teamwork);
      $log.log('ISSUES', $scope.issues);
      $log.log('SUBMIT', $scope.submit);

      var info = $scope.info;
      var scoutData = {
        info: $scope.info,
        auto: $scope.auto,
        scoring: $scope.scoring,
        teamwork: $scope.teamwork,
        issues: $scope.issues,
        submit: $scope.submit
      };

      // => casb_3_1678.json
      var filename = [info.event, info.matchNum, info.team].join('_');

      fs.writeText( 'scout/'+ filename +".json", JSON.stringify(scoutData))

        .then( function(granted) {
          console.log('Saved '+ filename +".json", JSON.stringify(scoutData));

          alertUser('success', 'Locally saved team '+ info.team +'\'s scout data for match '+ info.matchNum +'.');

          resetScout(scoutData.info.matchNum);

          fs.readFile('scout/'+ filename +'.json').then(function(file) {console.log(JSON.parse(file))});

          fs.getFolderContents('/scout/').then(function(dir) {console.log(dir)});
        })
        
        .catch( function errHandler(err) {
          console.log('FS ERROR:',err);
          alertUser( 'danger', err.message );

          return err;
        })

      .then( function sendOneMatchToServer() {
        // HTTP POST data to server
        return $http.post('/submit/matchData', scoutData)

          .success( function(data, status, headers, config) {
            $log.log( 'WAS SAVED?', data, status, headers, config);

            if(data.wasSaved) {
              alertUser('success', 'Sent data for team '+ info.team +' in match '+ info.matchNum +'to the server');
              return { wasSaved:true, unsavedMatches:data.unsavedMatches };
            }
            else {
              alertUser('danger', 'did not save properly. ERR: '+ data.err);
              return { wasSaved:false, unsavedMatches:null };
            }
          })

          .error( function(data, status, headers, config) {
            alertUser('danger', 'Failed to save to the server, please try again. ERR: '+ data.err);
            return { wasSaved:false, unsavedMatches:null };
          });
      })

      .then( function checkOtherMatches(data) {
        socket.emit('get-unsubmitted-matches', { event:info.event, pos:pos, currentMatch:info.matchNum }, function(listOfUnsubmittedMatches) {
          listOfUnsubmittedMatches = listOfUnsubmittedMatches.filter(function(match) { return angular.isDefined(match) });
          console.log('list', listOfUnsubmittedMatches);

          return $q.all( listOfUnsubmittedMatches.map( function(match) {
            var filename = [match.event, match.number, match[color+'Alliance'].teams[posNum]].join('_');
            console.log(filename);

            return fs.readFile('scout/'+filename+'.json')
              .then( function(file) {
                return JSON.parse(file);
                console.log(file);
              })
              .catch( function(err) {
                console.log('ERR: '+err.message);
              });
          }))

          .then( function sendOtherMatchesToServer(matchInfo) {
            matchInfo = matchInfo || [];
            console.log('UNSUBMITTED MATCHES', matchInfo);

            return $q.all( matchInfo.map( function(match) {
              console.log(match);
              var filename = [match.event, match.number, match[color+'Alliance'].teams[posNum]].join('_');

              console.log('scout/'+filename+'.json');

              return fs.readFile('scout/'+filename+'.json')

                .then( function(fileText) {
                  return JSON.parse(fileText);
                })

                .catch( function(err) {
                  console.error(err);
                });
            }))
          })

          .then( function(unsubmittedScoutData) {
            console.log('sending scout data');

            unsubmittedScoutData.map( function(scoutPoint) {
              var info = scoutPoint.info;
              return $http.post('/submit/matchData', scoutPoint)

              .success( function(data, status, headers, config) {
                $log.log( 'WAS SAVED?', data, status, headers, config);

                if(data.wasSaved) {
                  alertUser('success', 'Sent data for team '+ info.team +' in match '+ info.matchNum +'to the server');
                  return { wasSaved:true, unsavedMatches:data.unsavedMatches };
                }
                else {
                  alertUser('danger', 'did not save properly. ERR: '+ data.err);
                  return { wasSaved:false, unsavedMatches:null };
                }
              })

              .error( function(data, status, headers, config) {
                alertUser('danger', 'Failed to save to the server, please try again. ERR: '+ data.err);
                return { wasSaved:false, unsavedMatches:null };
              });
            });
          });
        });
      });


    }
    else {
      angular.forEach( test.errors, function(errMessage) {
        alertUser('danger', errMessage);
      });
    }
  };

  // Verifying function
  var verify = function() {
    /*
      Info:
        scout
        match
        team
        event

      Autonomous:
        startPosition

      Issues:
        if deadBroken is string, deadBrokenNotes
        if ejectable is string, ejectionNotes

      Submit:
        if deadBroken is not dead, ratings
    */
    var verified = true;
    var errLog = [];

    /* INFO VERIFY */
    if(
      !$scope.info.scout ||
      !$scope.info.event ||
      !$scope.info.team || 
      !$scope.info.matchNum
    ) {

      console.log($scope.info);
      verified = false;
      errLog.push('Match information is not complete.');
    }

    // no-shows can't have a start position
    if(!$scope.auto.startPosition && $scope.issues.deadBroken != 'dead') {
      verified = false;
      errLog.push('Please input a start position under autonomous.');
    }

    if( (typeof $scope.issues['deadBroken'] === 'string') && $scope.issues['deadBrokenNotes'] === '') {
      verified = false;
      errLog.push('Please input information as to why this robot is dead/broken.');
    }

    if( (typeof $scope.issues['ejectable'] === 'string') && $scope.issues['ejectableNotes'] === '') {
      verified = false;
      errLog.push('Please input information as to how this robot passively ejects the ball.');
    }

    return { verified: verified, errors: errLog };
  };
});
