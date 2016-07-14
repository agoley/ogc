// Games module: contains components and factories for browsing and viewing games
var gamesView = angular.module('gamesView', []);

// Provide game services for the module
gamesView.factory('GamesFactory', function($http) {
	var gamesFactory = {};
	
	// get the 40 most popular action games
	gamesFactory.getFeaturedAction = function(){
		return $http.get('//localhost:8080/games/topAction');
	}
	return gamesFactory;
});

// Content manager component

// Game scroll component - possibly dynamic based on category??
gamesView.component('actionScroller', {
	bindings: {},
	controller: function($scope, GamesFactory){
		var ctrl = this;
		
		GamesFactory.getFeaturedAction().then(function(response){
			ctrl.featuredActionGames = response.data.slice(0,5);
			ctrl.featuredActionGames2 = response.data.slice(5, 9);
			ctrl.width = window.innerWidth;
			ctrl.gameImageWidth = (ctrl.width - 40) / 5;
			ctrl.gameImageHeight = ctrl.gameImageWidth * 1.2;
			$('#action-carousel').css({width: ctrl.gameImageWidth, 
				height: ctrl.gameImageHeight});
			$('.scroll-btn').css({height: ctrl.gameImageHeight});
		});
		
		ctrl.scrollLeft = function(){
			var w =215*5;
			$('#action-carousel').animate({left: "+="+w}, 700, function(){});
		}
		
		// the foreward scroll will move the front of the array to the back
		ctrl.scrollRight = function(){
			console.log("scrolling right");
			$('#action-carousel').animate({left: "-="+window.innerWidth}, 
				700, function(){});
			$('#action-carousel-1').animate({'margin-left': -10}, 
				700, function(){});
		}
		// the reverse scroll will move the back to the front of the array
		
		$(window).resize(function() {
			ctrl.width = window.innerWidth;
			ctrl.gameImageWidth = (ctrl.width - 40) / 5;
			ctrl.gameImageHeight = ctrl.gameImageWidth * 1.2;
			$scope.$apply();
			$('.game-image')
				.css({width: ctrl.gameImageWidth, height: ctrl.gameImageHeight});
			$('.scroll-btn').css({height: ctrl.gameImageHeight});
		});
	},
	templateUrl: "views/action_scroller.html"
});

// Game detail component