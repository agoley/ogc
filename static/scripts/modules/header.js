// Header module: contains components and templates for the header
var header = angular.module('header', []);

// Site logo 
header.component('logo', {
	bindings: {
		view: '='
	},
	controller: function(){
		var ctrl = this;
		ctrl.setViewToFeaturedGames = function() {
			ctrl.view = ViewService.setViewToFeaturedGames(ctrl.view);
		}
	},
	template: 	"<a href='/home' ng-click='$ctrl.setViewToFeaturedGames()'>" +
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
	template: 	"<a ng-show='$ctrl.user.email' href=''"+
				 "ng-click='$ctrl.signout()' ><text class='text-glow-hover'>" +
				 "Sign Out</text></a>"
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
			console.log("login btn clicked");
			ctrl.showSignUp = false;
			$('#intro').addClass('login-body');
			$('#intro').slideDown();
			$("#core").css("padding-top", "0px");
		}
		
	},
	template:  	"<a" + 
						"href='' " + 
						"ng-click='$ctrl.viewSignIn()' " + 
						"id='loginBtn' " +  
						"ng-hide='user.email'>" +
							"Sign In" +
					"</a>"
});

// Shopping cart button
header.component('shoppingCartBtn', {
	bindings: {
		user: '=',
		view: '='
	},
	controller: function(ViewService){
		var ctrl = this;
		ctrl.getCartLength = function(ViewService){
			if(ctrl.user.cart){
				return ctrl.user.cart.length;
			} else {
				return 0;
			}
		}
		ctrl.setViewToCart = function () {
			ctrl.view = ViewService.setViewToCart(ctrl.view);
		}
	},
	template:  "<button class='btn navbar-btn neat outset' " +
					"ng-click='$ctrl.setViewToCart()'> " +
					"<span class='glyphicon " +
						"glyphicon-shopping-cart' aria-hidden='true'></span> " +
					"<span class='badge'>" +
						"{{$ctrl.getCartLength()}}"+
					"</span>"+
				"</button>"

});

// Constructs a browse bar which lexicographically sorts games base on input.
header.component('titleBrowser', {
	bindings: {
		view: '='
	},
	controller: function(GamesFactory, ViewService){
		// It is necessary to declare a global ctrl variable, because the 'this' object
		// will not be within the closure of callbacks and not accessible. By 
		// creating a global reference to the 'this' object it can be reached.
		var ctrl = this;
		ctrl.view.browser = {};
		GamesFactory.getGameTitles().then(function(response) {
			ctrl.view.browser.titles = response.data;
		});
		ctrl.getMatches = function() {
			ctrl.view.browser.matches = 
				GamesFactory.getMatches(ctrl.view.browser.titles, ctrl.view.query);
		}
		
		ctrl.getGame = function (title) {
			GamesFactory.getGame(title).then(function (response) {
				if (response.data) {
					ctrl.view.game = response.data;
					ctrl.view.game.release_date = new Date(ctrl.view.game.release_date);					
					ctrl.view = ViewService.setViewToGameDetail(ctrl.view);
					ctrl.view.query = '';
					ctrl.getMatches();
					$("#intro").slideUp();
					var headerHeight = $('.header').height();
					$("#core").css("padding-top", headerHeight);
				}
			});
		}
	},
	templateUrl: "views/title_browser.html"
});
