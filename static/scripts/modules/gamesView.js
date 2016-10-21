// Games module: contains components and factories for browsing and viewing games
var gamesView = angular.module('gamesView', []);

// Provide game services for the module
gamesView.factory('GamesFactory', function ($http) {
	var gamesFactory = {};
	gamesFactory.genres = 
			["Action",
			 "Adventure",
			 "FPS", 
			 "RPG", 
			 "TPS", 
			 "Shooter", 
			 "Fighting", 
			 "Racing", 
			 "Family", 
			 "Strategy", 
			 "MMO"];
	gamesFactory.consoles = [
			"PS4", 
			"Xbox One", 
			"Wii U", 
			"PS3", 
			"Xbox 360", 
			"Wii", 
			"3DS", 
			"DS" ];
		

	
	// get featured games of this components category
	gamesFactory.getFeaturedGames = function (category) {
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
	
	gamesFactory.uploadGame = function (game) {
		return $http.post('//localhost:8080/upload/game', game);
	}
	
	gamesFactory.getGame = function (gameTitle) {
		var param = { title: gameTitle };
		return $http.post('//localhost:8080/game', JSON.stringify(param));
	}
	
	gamesFactory.updateGame = function (game) {
		return $http.post('//localhost:8080/games/update', JSON.stringify(game));
	}
	
	gamesFactory.getGameTitles = function() {
		return $http.get('//localhost:8080/games/titles');
	};	
	
	gamesFactory.getMatches = function(titles, query) {
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
	return gamesFactory;
}); 

// Content Manager component
gamesView.component('contentManager', {
	bindings: {
		view: '=',
		user: '='
	},
	controller: function (GamesFactory) {
		var ctrl = this;
		ctrl.game = {}; // client side place holder for the new game
		ctrl.view.cm = { 
			uploadGame: false,
			uploadPhoto: false
		};
		
		ctrl.consoles = GamesFactory.consoles;
		ctrl.genres = GamesFactory.genres;
				
		ctrl.toggleUploadGame = function ()  {
			ctrl.view.cm.uploadGame = ! ctrl.view.cm.uploadGame;
		}
		
		ctrl.toggleUploadPhoto = function () {
			ctrl.view.cm.uploadPhoto = ! ctrl.view.cm.uploadPhoto;
		}
		
		ctrl.updateTitles = function () {
			GamesFactory.getGameTitles().then(function(response) {
				ctrl.view.browser.titles = response.data;
			});
		}
		
		ctrl.uploadGame = function (game) {
			GamesFactory.uploadGame(game).then(function(response) {
				ctrl.view.game = response.data;
				ctrl.view.cm.uploadGame = false;
				ctrl.game = {}; // reset the game
				ctrl.updateTitles();
			});
		}
		
		
		
	},
	templateUrl: "views/content_manager.html"
});

// Game display component
gamesView.component('gameDetail', {
	bindings: {
		user: '=',
		game: '=',
		view: '='
	},
	controller: function (GamesFactory, UserFactory, $timeout, $scope, ViewService) {
		var ctrl = this;
		ctrl.editGame = false;
		ctrl.genres = GamesFactory.genres;

		ctrl.toggleEditGame = function () {
			ctrl.editGame = !ctrl.editGame;
		}
		
		ctrl.totalCart = function () {
			var tot = 0;
			var currSales = [];
			for (var i = 0; i < ctrl.user.cart.length; i++) {
				if (ctrl.user.cart[i].type == 'sale') {
					tot += ctrl.user.cart[i].cost;
				}
			}
			ctrl.user.cart.cost = tot;
		}
		
		ctrl.totalCoin = function () {
			var tot = 0;
			for (var i = 0; i < ctrl.user.cart.length; i++) {
				if (ctrl.user.cart[i].type == 'trade') {
					tot += ctrl.user.cart[i].cost;
				}
			}
			ctrl.user.cart.coin;
		}
		
		ctrl.totalCredit = function () {
			var tot = 0;
			for (var i = 0; i < ctrl.user.cart.length; i++) {
				if (ctrl.user.cart[i].type == 'ingest') {
					tot += ctrl.user.cart[i].cost;
				}
			}
			ctrl.user.cart.credit;
		}
		
		ctrl.updateCartTotals = function () {
			ctrl.totalCart();
			ctrl.totalCoin();
			ctrl.totalCredit();
		}
		
		ctrl.clearGame = function () {
			ctrl.view = ViewService.setViewToFeaturedGames(ctrl.view);
		}
			
		ctrl.addItemToCart = function (item, type) {
			console.log("adding item to cart");
			UserFactory.addItemToCart(item, type).then(function (response) {
				if (response.data) {
					ctrl.user = response.data;
					ctrl.view.addConfirm = true;
					$timeout(function () {
						ctrl.view.addConfirm = false; $scope.$apply();
					}, 3000);
					ctrl.updateCartTotals();
				}
			});
		}
		
		ctrl.updateGame = function (game) {
			GamesFactory.updateGame(game).then(function (response) {
				if (response.data) {
					// TODO: close edit game view
					ctrl.view.game = data;
				}
			});
		}	
	},
	templateUrl: 'views/game_display.html'
});

// Game scroll component
gamesView.component('gameScroller', {
	bindings: {
		user: '=',
		view: '='
	},
	controller: function ($scope, GamesFactory, UserFactory, $attrs, ViewService){
		var ctrl = this;
		ctrl.activeItem = 0; // 0, 1, or 2
		ctrl.item0Left = 0;
		ctrl.item1Left = window.innerWidth;
		ctrl.item2Left = window.innerWidth *2;
		ctrl.category = $attrs.category;
		ctrl.size = $attrs.size; 
		
		// if being viewed in a mobile device change the carousel size to 3
		var isMobile = window.matchMedia("only screen and (max-width: 760px)");
    	if (isMobile.matches) {
        	ctrl.size = 3;
        	ctrl.r = 20;
    	} else {
    		ctrl.r = 40;
    		ctrl.size = 5;
    	}
		
		if (ctrl.user.email) {
			var headerHeight = $('.header').height();
			$("#core").css("padding-top", headerHeight);
		}
		
		GamesFactory.getFeaturedGames($attrs.category).then(function (response) {
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
		
		ctrl.getGame = function (title) {
			GamesFactory.getGame(title).then(function (response) {
				if (response.data) {
					ctrl.view.game = response.data;
					ctrl.view.game.release_date = new Date(ctrl.view.game.release_date);
					ctrl.view = ViewService.setViewToGameDetail(ctrl.view);
					$("#intro").slideUp();
					var headerHeight = $('.header').height();
					$("#core").css("padding-top", headerHeight);
				}
			});
		}
		
		ctrl.scrollLeft = function (){
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
		
		ctrl.scrollRight = function (){
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
		
		ctrl.resize = function () {
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
		
		$(window).resize(function () {
			ctrl.resize();
		});
			
	},
	templateUrl: "views/game_scroller.html"
});