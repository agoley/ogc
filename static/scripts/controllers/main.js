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
	$http.get('http://localhost/user/profile').
		success(function(data, status, headers, config) {
			console.log("user: ", data);
			$scope.user = data;
		}).error(function(data, status, headers, config) {
			console.log('Error getting user');
		});
}]);
app.controller('GameController', ['$scope', '$http', function($scope, $http ) {
	$scope.game = {};
	$scope.consoles = ["PS4", "Xbox One", "Wii U", "PS3", "Xbox 360", "Wii", "3DS", "DS" ];
	$scope.genres = ["Action", "FPS", "RPG", "TPS", "Shooter", "Fighting", "Racing", "Family", "Strategy", "MMO" ];
	
	// Post to node server to upload a game
	$scope.gameUpload = function() {
		$http.post('http://localhost/upload/game', $scope.game).
		success(function(data, status, headers, config) {
			console.log("App posted to http://localhost/upload/game,response: " + data);
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
