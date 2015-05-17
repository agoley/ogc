'use strict';

/**
 * @ngdoc function
 * @name loginApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the loginApp
 */
var app = angular.module('loginApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
  
/*app.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
});

app.service('Session', function () {
  this.create = function (sessionId, userId) {
    this.id = sessionId;
    this.userId = userId;
  };
  this.destroy = function () {
    this.id = null;
    this.userId = null;
  };
  return this;
});

app.factory('AuthService', function ($http, Session) {
  var authService = {};
 
  authService.login = function(credentials) {
	$http.post('http://localhost/login', credentials).
		success(function(data, status, headers, config) {
			console.log("App posted to http://localhost/login");
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to http://localhost/login");
		});
  };
 
  authService.isAuthenticated = function () {
    return !!Session.userId;
  };
 
 
  return authService;
})*/

app.controller('HomeController', ['$scope', '$http', function($scope, $http ) {
	$scope.page = {};
	$scope.page.actionNumber = 0;
	$scope.page.shooterNumber = 0;
	$scope.page.familyNumber = 0;
	$scope.page.racingNumber = 0;
	$scope.page.fightingNumber = 0;
	
	$http.get('http://localhost/user/profile').
		success(function(data, status, headers, config) {
			console.log("user: ", data);
			$scope.user = data;
		}).error(function(data, status, headers, config) {
			console.log('Error getting user');
		});
		
		$scope.getAction = function() {
			console.log($scope.page);
			$http.post('http://localhost/games/action', $scope.page).
			success(function(data, status, headers, config) {
				console.log("App posted to http://localhost/game/action,response: ", data[0].image_path);
				$scope.action = data;
				$scope.page.actionNumber = $scope.page.actionNumber + 1;
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to http://localhost/game/action");
			});
		}
		
		$scope.getShooter = function() {
			console.log($scope.page);
			$http.post('http://localhost/games/shooter', $scope.page).
			success(function(data, status, headers, config) {
				console.log("App posted to http://localhost/game/shooter,response: ", data[0].image_path);
				$scope.shooter = data;
				$scope.page.shooterNumber = $scope.page.shooterNumber + 1;
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to http://localhost/game/shooter");
			});
		}
		
		$scope.getFamily = function() {
			$http.post('http://localhost/games/family', $scope.page).
			success(function(data, status, headers, config) {
				$scope.family = data;
				$scope.page.familyNumber = $scope.page.familyNumber + 1;
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to http://localhost/game/family");
			});
		}
		
		$scope.getRacing = function() {
			$http.post('http://localhost/games/racing', $scope.page).
			success(function(data, status, headers, config) {
				$scope.racing = data;
				$scope.page.racingNumber = $scope.page.racingNumber + 1;
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to http://localhost/game/racing");
			});
		}
		
		$scope.getFighting = function() {
			$http.post('http://localhost/games/fighting', $scope.page).
			success(function(data, status, headers, config) {
				$scope.fighting = data;
				$scope.page.fightingNumber = $scope.page.fightingNumber + 1;
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to http://localhost/game/fighting");
			});
		}
		
		$scope.getAction();
		$scope.getShooter();
		$scope.getFamily();
		$scope.getRacing();
		$scope.getFighting();
		
		$scope.reverseAction = function() {
			if( $scope.page.actionNumber > 1 ) {
				console.log("decrementing page");
				$scope.page.actionNumber -= 2;
				console.log($scope.page.actionNumber);
				$scope.getAction();
			}
		}
		
		$scope.reverseShooter = function() {
			if( $scope.page.shooterNumber > 1 ) {
				console.log("decrementing page");
				$scope.page.shooterNumber -= 2;
				console.log($scope.page.shooterNumber);
				$scope.getShooter();
			}
		}
		
		$scope.reverseFamily = function() {
			if( $scope.page.familyNumber > 1 ) {
				console.log("decrementing page");
				$scope.page.familyNumber -= 2;
				$scope.getFamily();
			}
		}
		
		$scope.reverseRacing = function() {
			if( $scope.page.racingNumber > 1 ) {
				console.log("decrementing page");
				$scope.page.racingNumber -= 2;
				$scope.getRacing();
			}
		}
		
		$scope.reverseFighting = function() {
			if( $scope.page.fightingNumber > 1 ) {
				console.log("decrementing page");
				$scope.page.fightingNumber -= 2;
				$scope.getFighting();
			}
		}
		
}]);
app.controller('GameController', ['$scope', '$http', function($scope, $http ) {
	$scope.game = {};
	$scope.consoles = ["PS4", "Xbox One", "Wii U", "PS3", "Xbox 360", "Wii", "3DS", "DS" ];
	$scope.genres = ["Action", "Adventure", "FPS", "RPG", "TPS", "Shooter", "Fighting", "Racing", "Family", "Strategy", "MMO" ];
	$scope.uploadGame = false;
	$scope.uploadPhoto = false;
	
	
	
	//Display game upload panel.
	$scope.toggleUploadGame = function() {
		$scope.uploadPhoto = false;
		$scope.uploadGame = !$scope.uploadGame;
	}
	
	//Display photo upload panel.
	$scope.toggleUploadPhoto = function() {
		$scope.uploadGame = false;
		$scope.uploadPhoto = !$scope.uploadPhoto;
	}
	
	// Post to node server to upload a game
	$scope.gameUpload = function() {
		$http.post('http://localhost/upload/game', $scope.game).
		success(function(data, status, headers, config) {
			console.log("App posted to http://localhost/upload/game,response: " + data);
			$scope.game = {}; // Reset the game inputs
			$scope.uploadGame = false;
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to http://localhost/upload/game");
		});
	};
		
}]);

app.controller('LoginController', ['$scope', '$http', function($scope, $http ) {
	$scope.credentials = {};
	$scope.credentials.password = '';
	$scope.credentials.password2 = '';
	$scope.showSignUp = true;
	$scope.fail = false;
	/*
	$scope.initUsersCollection = function(){
		$http.post('http://localhost/login2').
		success(function(data, status, headers, config) {
			console.log("App posted to http://localhost/login2");
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to http://localhost/login2");
		});
	}
	*/
	
	$scope.passcheck = function() {
		console.log("password: " + $scope.credentials.password);
		console.log("password2: " + $scope.credentials.password2);
		$scope.credentials.password == $scope.credentials.password2;
	}
	$scope.setSignUp = function() {
		$scope.showSignUp = true;
	}
	$scope.setSignIn = function() {
		$scope.showSignUp = false;
	}
	$scope.flipSignUp = function() {
		$scope.showSignUp = !$scope.showSignUp;
	}
	
	$scope.signout = function() {
		$http.post('http://localhost/signout').
		success(function(data, status, headers, config) {
			console.log("App posted to http://localhost/signout,response: " + data);
			window.location = 'http://localhost';
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to http://localhost/signout");
			window.location = 'http://localhost/login';
		});
	};
	
	$scope.signup = function() {
		$http.post('http://localhost/signup', $scope.credentials).
		success(function(data, status, headers, config) {
			console.log("App posted to http://localhost/signup,response: " + data);
			window.location = 'http://localhost/home';
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to http://localhost/signup");
		});
	};
	
	$scope.login = function() {
		$http.post('http://localhost/signin', $scope.credentials).
		success(function(data, status, headers, config) {
			console.log("App posted to http://localhost/signin, resonse: " + data);
			if(data){
				window.location = 'http://localhost/home';
			} else {
				console.log("handle error");
				$scope.fail = true;
			}
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to http://localhost/signin");
		});
	};
}]);

app.directive('fileModel', ['$parse', function ($parse) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var model = $parse(attrs.fileModel);
			var modelSetter = model.assign;
            
			element.bind('change', function(){
				scope.$apply(function(){
					modelSetter(scope, element[0].files[0]);
				});
           });
		}
	};
}]);
