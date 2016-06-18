// Welcome module: contains components and templates for the welcome splash
var welcome = angular.module('welcome', []);

// Provides user services
welcome.factory('UserFactory', function($http) {
	var userFactory = {};
	userFactory.login = function(credentials) {
		return $http
			.post('//localhost:8080/signin/',
				credentials,
				{withCredentials: true});
	};	
	return userFactory;
});


welcome.component('signupForm', {
	bindings: {
		user: '=',
		showSignUp: '='
	},
	controller: function(){
		var ctrl = this;
		ctrl.credentials = {};
		
		ctrl.flipSignUp = function(){
			ctrl.showSignUp = !ctrl.showSignUp;
		};
	},
	templateUrl: 'views/signup_form.html'
});

welcome.component('loginForm', {
	bindings: {
		user: '=',
		showSignUp: '='
	},
	controller: function(UserFactory){
		var ctrl = this;
		ctrl.credentials = {};
		ctrl.fail = false;
		
		// init view
		if(ctrl.user.email){
			$("#intro").hide();
			$("#core").css("padding-top", "125px");
		}
			
		ctrl.login = function(){
			if(ctrl.credentials.email && ctrl.credentials.password){
				UserFactory.login(ctrl.credentials).then(function(response) {
					ctrl.user = response.data;
					$("#intro").hide("slide");
					$("#core").css("padding-top", "125px");
				});
			}
		};
		
		ctrl.flipSignUp = function(){
			ctrl.showSignUp = !ctrl.showSignUp;
		};
		
	},
	template: 
		"<div class='container' id='signin'>" +
			"<div class='row'>" +
				"<h2 class='pull-left'> Sign In </h2>" +
			"</div>" +
			"<div class='row'>" +
				"<div class='error' ng-show='$ctrl.fail'>" +
					"The email or password you entered was incorrect." +
				"</div>" +
			"</div>" +
			"<div class='row'>" +
				"<input type='text' id='email' ng-model='$ctrl.credentials.email' " +
					"class='form-control pull-left neat-input' placeholder='Email...' >" +
			"</div>" +
			"<div class='row low-div'>" +
				"<input type='password' id='password' ng-model='$ctrl.credentials.password' " +
					 "class='form-control pull-left neat-input' " + 
					 "placeholder='Password...' > " +
			"</div>" +
			"<div class='row low-div'>" +
				"<button class='btn btn-attention pull-left neat' " +
					 "ng-click='$ctrl.login()'>Sign In</button>" +
			"</div>" +
			"<div class='row low-div'>" +
				"Not a member? " +
				"<button class='a btn btn-default neat no-border' " +
					"ng-click='$ctrl.flipSignUp()'>Sign Up</button>" + 
			"</div>" +
			"<div class='row low-div'> " +
				"<a href='/auth/twitter' class='no-decoration'></a> "+ 	
				"<a href='/auth/twitter' " +
					"class='btn btn-block btn-social btn-twitter neat no-decoration'>" +
					"<i class='fa fa-twitter'></i> Sign in with Twitter " +
				"</a>" +
			"</div>" + 
		"</div>"
});