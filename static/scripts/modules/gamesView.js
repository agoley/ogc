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
		} else if(category == 'family') {
			return $http.get('//localhost:8080/games/topFamily');
		} else if(category == 'fighting') {
			return $http.get('//localhost:8080/games/topFighting');
		}
	}
	return gamesFactory;
});

// Game scroll component - possibly dynamic based on category??
gamesView.component('gameScroller', {
	bindings: {
		user: '=',
		getGame: '&'
	},
	controller: function($scope, GamesFactory, $attrs){
		var ctrl = this;
		ctrl.activeItem = 0; // 0, 1, or 2
		ctrl.item0Left = 0;
		ctrl.item1Left = window.innerWidth;
		ctrl.item2Left = window.innerWidth *2;
		ctrl.category = $attrs.category;
		ctrl.size = $attrs.size; 
		
		var isMobile = window.matchMedia("only screen and (max-width: 760px)");

		// TODO: pull this up a layer to enable setting on demand
    	if (isMobile.matches) {
        	//Conditional script here
        	ctrl.size = 3;
        	ctrl.r = 20;
    	} else {
    		ctrl.r = 40;
    		ctrl.size = 5;
    	}
		
		if(ctrl.user.email){
			var headerHeight = $('.header').height();
			$("#core").css("padding-top", headerHeight);
		}
		
		GamesFactory.getFeaturedAction($attrs.category).then(function(response){
			ctrl.featuredActionGames = response.data.slice(0,ctrl.size);
			ctrl.featuredActionGames2 = response.data.slice(ctrl.size, ctrl.size*2);
			ctrl.featuredActionGames3 = response.data.slice(ctrl.size*2, ctrl.size*3);
			ctrl.width = window.innerWidth;
			ctrl.gameImageWidth = (ctrl.width - ctrl.r) / ctrl.size;
			ctrl.gameImageHeight = ctrl.gameImageWidth * 1.2;
			ctrl.scrollWidth = ctrl.gameImageWidth / 3;
			ctrl.leftBtnLeft = -ctrl.scrollWidth;
			$('.scroll-btn').css({height: ctrl.gameImageHeight, width: ctrl.scrollWidth});
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
				ctrl.leftBtnLeft = -ctrl.scrollWidth;
			} else {
				ctrl.leftBtnLeft= 0;
				$('.game-carousel.'+ctrl.category).animate({left: "-="+width}, 
					700, function(){});
				ctrl.activeItem +=1;
			}
		}
		
		ctrl.resize = function() {
			var width = window.innerWidth;
			ctrl.gameImageWidth = (width - ctrl.r) / ctrl.size;
			ctrl.gameImageHeight = ctrl.gameImageWidth * 1.2;
			ctrl.scrollWidth = ctrl.gameImageWidth / 3;
			if (ctrl.activeItem == 0) {
				ctrl.item1Left = width;
				ctrl.item2Left = width*2;
				ctrl.leftBtnLeft = -ctrl.scrollWidth;
			} else if (ctrl.activeItem == 1) {
				ctrl.item0Left = -width;
				ctrl.item2Left = width;
			} else if( ctrl.activeItem == 2) {
				ctrl.item0Left = -width*2;
				ctrl.item1Left = -width;
			}
			
			
			$scope.$apply();
			$('.game-image')
				.css({width: ctrl.gameImageWidth, height: ctrl.gameImageHeight});
			ctrl.scrollHeight = ctrl.gameImageHeight;	
			$('.scroll-btn').css({height: ctrl.gameImageHeight, width: ctrl.scrollWidth});
			if(ctrl.user.email){			
				var headerHeight = $('.header').height();
				$('#core').css('padding-top', headerHeight);
			}
		}
		
		$(window).resize(function() {
			ctrl.resize();
		});
			
	},
	templateUrl: "views/game_scroller.html"
});