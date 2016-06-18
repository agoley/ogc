// Header module: contains components and templates for the header
var header = angular.module('header', []);

// Provides games services.
header.factory('GameFactory', function($http) {
	var gameFactory = {};
	gameFactory.getGameTitles = function() {
		return $http.get('//localhost:8080/games/titles');
	};	
	gameFactory.getMatches = function(titles, query) {
		var matches = [];
		if(query == null || query == "") return;
		var m = 0;
		for(var i = 0; i < titles.length; i++){
			if( m < 10 ) {
				if( titles[i].toUpperCase().indexOf(query
					.toUpperCase()) > -1 ){
					matches.push(titles[i]);
					m += 1;
				}
			}
		}
		return matches;
	};
	return gameFactory;
});

// Site logo 
header.component('logo', {
	bindings: {
		clearGame: '&'
	},
	controller: function(){},
	template: 	"<a href='/home' ng-click='$ctrl.clearGame()'>" +
					"<img id='logo' src='../images/logo-white.png'/>" +
				"</a>"
});

// Sign out button
header.component('signoutBtn', {
	bindings: {
		user: '=',
		signout: '&'
	},
	controller: function() {},
	template: 	"<button ng-show='$ctrl.user.email' class='btn navbar-btn neat outset' " +
				 "ng-click='$ctrl.signout()' ><text class='text-glow-hover'>" +
				 "Sign Out</text></button>"
});


// Show log in form button
header.component('showLoginBtn', {
	bindings: {
		user: '=',
		showSignUp: '='
	},
	controller: function(){
		var ctrl = this;
		ctrl.viewSignIn = function(){
			ctrl.showSignUp = false;
		}
		
	},
	template:  	"<button id='loginBtn' class='a' ng-hide='$ctrl.user.email'" +
				"ng-class=\"!$ctrl.showSignUp? " +
				"'btn navbar-btn neat outset no-border' : " +
				"'btn  navbar-btn neat inset no-border'\"" +
				"ng-click='$ctrl.viewSignIn()'> Log In </button>"
});

// Shopping cart button
header.component('shoppingCartBtn', {
	bindings: {
		user: '=',
		viewCart: '&'
	},
	controller: function(){
		var ctrl = this;
		ctrl.getCartLength = function(){
			if(ctrl.user.cart){
				return ctrl.user.cart.length;
			} else {
				return 0;
			}
		}
	},
	template:  "<button class='btn navbar-btn neat outset' " +
				"ng-click='$ctrl.viewCart()' >Shopping Cart <span class='badge'> " +
				"{{$ctrl.getCartLength()}}</span></button>"

});

// Constructs a browse bar which lexicographically sorts games base on input.
header.component('titleBrowser', {
	bindings: {
		getGame: '&'
	},
	controller: function(GameFactory){
		// It is necessary to declare a global ctrl variable, because the 'this' object
		// will not be within the closure of callbacks and not accessible. By 
		// creating a global reference to the 'this' object it can be reached.
		var ctrl = this;
		ctrl.browser = {};
		GameFactory.getGameTitles().then(function(response) {
			ctrl.browser.titles = response.data;
		});
		ctrl.getMatches = function() {
			ctrl.browser.matches = 
				GameFactory.getMatches(ctrl.browser.titles, ctrl.query);
		}
	},
	templateUrl: "views/title_browser.html"
});
