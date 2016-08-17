// Games module: contains components and factories for browsing and viewing games
var gamesView = angular.module('gamesView', []);

// Provide game services for the module
gamesView.factory('GamesFactory', function($http) {
	var gamesFactory = {};
	
	// get the 40 most popular action games
	gamesFactory.getFeaturedAction = function(category){
	
		if(category == 'action') {
			return $http.get('//localhost:8080/games/topAction');
		} else if(category == 'shooter') {
			return $http.get('//localhost:8080/games/topShooter');
		}
	}
	return gamesFactory;
});

// Content manager component

// Game scroll component - possibly dynamic based on category??
gamesView.component('actionScroller', {
	bindings: {
		user: '='
	},
	controller: function($scope, GamesFactory, $attrs){
		var ctrl = this;
		ctrl.activeItem = 0; // 0, 1, or 2
		ctrl.item0Left = 0;
		ctrl.item1Left = window.innerWidth;
		ctrl.item2Left = window.innerWidth *2;
		ctrl.leftBtnLeft = -60;
		ctrl.category = $attrs.category;
		
		var headerHeight = $('.header').height();
		$("#core").css("padding-top", headerHeight);
		
		GamesFactory.getFeaturedAction($attrs.category).then(function(response){
			ctrl.featuredActionGames = response.data.slice(0,5);
			ctrl.featuredActionGames2 = response.data.slice(5, 10);
			ctrl.featuredActionGames3 = response.data.slice(10, 15);
			ctrl.width = window.innerWidth;
			ctrl.gameImageWidth = (ctrl.width - 40) / 5;
			ctrl.gameImageHeight = ctrl.gameImageWidth * 1.2;
			$('.scroll-btn').css({height: ctrl.gameImageHeight});
		});
		
		ctrl.scrollLeft = function(){
			if(ctrl.activeItem > 0){
				ctrl.width = window.innerWidth;
				$('.game-carousel.'+ctrl.category).animate({left: "+="+ctrl.width}, 
					700, function(){});
				ctrl.activeItem -=1;
				if(ctrl.activeItem == 0){
					ctrl.leftBtnLeft = -60;
				}
			}
		}
		
		ctrl.scrollRight = function(){
			var width = window.innerWidth;
			if (ctrl.activeItem > 1){
				$('.game-carousel.'+ctrl.category).animate({left: "+="+width*2}, 
					700, function(){});
				ctrl.activeItem = 0;
				ctrl.leftBtnLeft = -60;
			} else {
				ctrl.leftBtnLeft= 0;
				$('.game-carousel.'+ctrl.category).animate({left: "-="+width}, 
					700, function(){});
				ctrl.activeItem +=1;
			}
		}
		
		ctrl.resize = function() {
			var width = window.innerWidth;
			if (ctrl.activeItem == 0) {
				ctrl.item1Left = width;
				ctrl.item2Left = width*2;
			} else if (ctrl.activeItem == 1) {
				ctrl.item0Left = -width;
				ctrl.item2Left = width;
			} else if( ctrl.activeItem == 2) {
				ctrl.item0Left = -width*2;
				ctrl.item1Left = -width;
			}
			ctrl.gameImageWidth = (width - 40) / 5;
			ctrl.gameImageHeight = ctrl.gameImageWidth * 1.2;
			$scope.$apply();
			$('.game-image')
				.css({width: ctrl.gameImageWidth, height: ctrl.gameImageHeight});
			ctrl.scrollHeight = ctrl.gameImageHeight;	
			$('.scroll-btn').css({height: ctrl.gameImageHeight});
			if(ctrl.user.email){			
				var headerHeight = $('.header').height();
				$('#core').css('padding-top', headerHeight);
			}
		}
		
		$(window).resize(function() {
			ctrl.resize();
		});
			
	},
	templateUrl: "views/action_scroller.html"
});

// Game detail component