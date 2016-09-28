'use strict';

var app = angular.module('loginApp', ["header", "welcome", "gamesView"]);
  
// todo transform into main component
app.controller('HomeController', ['$scope', '$http', '$timeout', function($scope, $http, $timeout ) {
	$scope.view = {
		showFeaturedGames: true,
		showProfile: false,
		showConfirmation: false,
		showCart: false,
		showGameDetail: false,
		showCheckout: false,
		addConfirm: false
	};
	$scope.addConfirm = false;
	$scope.transaction = {};
	$scope.creditTypes = ["Venmo", "Mailed Check"];
	$scope.checkout = {};
	$scope.page = {};
	
	$scope.clearLastTransaction = function(){
		console.log("clearing.");
		$http.get('//localhost:8080/user/clearLastTransaction', { withCredentials: true }).
		success(function(data, status, headers, config) {
			console.log("cleared the last transaction.");
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //localhost:8080/clearLastTransaction");
		});
	}
	
	// Get pending transactions for the user. Displayed in the profile page.
	var getTransactions = function() {
		$http.get('//localhost:8080/user/transactions', { withCredentials: true }).success(function(data, status, headers, config) {
			$scope.transForUser = data;
		}).error(function(data, status, headers, config) {
			console.log('Error getting user');
		});
	};
	
	$scope.updateUser = function(){
		$http.post('//localhost:8080/user/update', $scope.user).
		success(function(data, status, headers, config) {
			$scope.user = data;
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //localhost:8080/user/update");
		});
	}			
	
	$http.get('//localhost:8080/user/profile').
		success(function(data, status, headers, config) {
			$scope.user = data;
			if($scope.user.email){
				$scope.total = $scope.totalCart();
				$scope.credit = $scope.totalCredit();
				$scope.coin = $scope.totalCoin();
				$scope.sales = $scope.allSalesInCart();
				$scope.buys = $scope.allBuysInCart();
				$scope.trades = $scope.allTradesInCart();
			}
		}).error(function(data, status, headers, config) {
			console.log('Error getting user');
		});
	$scope.refreshUser = function() {
		$http.get('//localhost:8080/user/profile').
			success(function(data, status, headers, config) {
			$scope.user = data;
			if($scope.user.email){			
				$scope.total = $scope.totalCart();
				$scope.credit = $scope.totalCredit();
				$scope.coin = $scope.totalCoin();
				$scope.sales = $scope.allSalesInCart();
				$scope.buys = $scope.allBuysInCart();
				$scope.trades = $scope.allTradesInCart();
			}
		}).error(function(data, status, headers, config) {
			console.log('Error getting user');
		});
	}
	
	$scope.allSalesInCart = function() {
		var currSales = [];
		for(var i = 0; i < $scope.user.cart.length; i++){
			if($scope.user.cart[i].type == 'sale'){
				currSales.push($scope.user.cart[i]);
			}
		}
		return currSales;
	}
	
	$scope.allBuysInCart = function() {
		var currBuys = [];
		for(var i = 0; i < $scope.user.cart.length; i++){
			if($scope.user.cart[i].type == 'ingest'){
				currBuys.push($scope.user.cart[i]);
			}
		}
		return currBuys;
	}
	
	$scope.allTradesInCart = function() {
		var currTrades = [];
		for(var i = 0; i < $scope.user.cart.length; i++){
			if($scope.user.cart[i].type == 'trade'){
				currTrades.push($scope.user.cart[i]);
			}
		}
		return currTrades;
	}
	
	$scope.totalCart = function() {
		var tot = 0;
		var currSales = [];
		for(var i = 0; i < $scope.user.cart.length; i++) {
			if($scope.user.cart[i].type == 'sale') {
				tot += $scope.user.cart[i].cost;
			}
		}
		return tot;
	}
	
	$scope.totalCredit = function() {
		var tot = 0;
		for(var i = 0; i < $scope.user.cart.length; i++) {
			if($scope.user.cart[i].type == 'ingest') {
				tot += $scope.user.cart[i].cost;
			}
		}
		return tot;
	}
	
	$scope.totalCoin = function() {
		var tot = 0;
		for(var i = 0; i < $scope.user.cart.length; i++) {
			if($scope.user.cart[i].type == 'trade') {
				tot += $scope.user.cart[i].cost;
			}
		}
		return tot;
	}
		
	/*$scope.addToCart = function(game) {
		// Filter by transaction type
		if($scope.transaction.type == "sale") {
			console.log("adding game: " + game);
			$http.post('//localhost:8080/user/addGame', game, { withCredentials: true }).
			success(function(data, status, headers, config) {
				if(data) {
					console.log("user cart after add: " +  data.cart);
					$scope.user = data;
					$timeout(function(){$scope.addConfirm = false; $scope.$apply();}, 3000);
					$scope.total = $scope.totalCart();
					$scope.credit = $scope.totalCredit();
					$scope.coin = $scope.totalCoin();
					$scope.sales = $scope.allSalesInCart();
					$scope.buys = $scope.allBuysInCart();
					$scope.trades = $scope.allTradesInCart();
				}
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to //localhost:8080/user/addGame");
			});
		} else if($scope.transaction.type == "ingest") {
			// Add credit to the users account.
			$http.post('//localhost:8080/user/addCredit', game,{ withCredentials: true }).
			success(function(data, status, headers, config) {
				if(data) {
					$scope.user = data;
					$scope.total = $scope.totalCart();
					$scope.credit = $scope.totalCredit();
					$scope.coin = $scope.totalCoin();
					$scope.sales = $scope.allSalesInCart();
					$scope.buys = $scope.allBuysInCart();
					$scope.trades = $scope.allTradesInCart();
				}
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to //localhost:8080/user/addGame", { withCredentials: true });
			});
		} else if($scope.transaction.type == "trade") {
			// Add coin to the users account.
			$http.post('//localhost:8080/user/addCoin', game, { withCredentials: true }).
			success(function(data, status, headers, config) {
				if(data) {
					$scope.user = data;
					$scope.total = $scope.totalCart();
					$scope.credit = $scope.totalCredit();
					$scope.coin = $scope.totalCoin();
					$scope.sales = $scope.allSalesInCart();
					$scope.buys = $scope.allBuysInCart();
					$scope.trades = $scope.allTradesInCart();
				}
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to //localhost:8080/user/addGame", { withCredentials: true });
			});
		}
		
	}*/
		
	$scope.removeFromCart = function(game) {
		$http.post('//localhost:8080/user/removeGame', game, { withCredentials: true }).
		success(function(data, status, headers, config) {
			if(data){
				$scope.user = data;
				$scope.total = $scope.totalCart();
				$scope.credit = $scope.totalCredit();
				$scope.coin = $scope.totalCoin();
			}
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //localhost:8080/user/addGame");
		});
	} 	
//}]);

//app.controller('GameController', ['$scope', '$http', function($scope, $http ) {
	$scope.game = {};
	$scope.consoles = ["PS4", "Xbox One", "Wii U", "PS3", "Xbox 360", "Wii", "3DS", "DS" ];
	$scope.uploadGame = false;
	$scope.uploadPhoto = false;
	$scope.page = {};
	$scope.page.actionNumber = 0;
	$scope.page.shooterNumber = 0;
	$scope.page.familyNumber = 0;
	$scope.page.racingNumber = 0;
	$scope.page.fightingNumber = 0;
	$scope.matches = [];
	$scope.titles = [];
	$scope.query = "";
	$scope.quantity = 10;
	$scope.editGame = false;
	$scope.displayGame = false;
	$scope.displayCart = false;
	$scope.displayCheckout = false;
	$scope.displayConf = false;
	$scope.displayProf = false;
	$scope.transForUser = [];
	
	// Request the token here.
	$scope.getClientToken = function() {
		$http.get('//localhost:8080/client_token', { withCredentials: true })
			.success(function(data, status, headers, config) {
			var client_token = data;
			console.log("token: " + client_token);
			// Init braintree.
			braintree.setup(client_token, "custom", {
				id: "checkout"
				/*onPaymentMethodReceived: function (obj) {
					// Do some logic in here.
					// When you're ready to submit the form:
					console.log("pay callback");
					document.forms["co"].submit();
				}*/ 
			});
		}).error(function(data, status, headers, config) {
			console.log("App failed to get client braintree token.");
		});
	}
	
	$scope.viewCheckout = function() {
		$scope.getClientToken();
		$scope.displayCheckout = true;
		$scope.displayCart = false;
		$scope.displayGame = false;
		$scope.displayConf = false;
		$scope.displayProf = false;
	}
	
	$scope.viewProf = function() {
		$scope.displayCheckout = false;
		$scope.displayCart = false;
		$scope.displayGame = false;
		$scope.displayConf = false;
		$scope.displayProf = true;
	}
	
	$scope.viewConf = function() {
		$scope.displayCheckout = false;
		$scope.displayCart = false;
		$scope.displayGame = false;
		$scope.displayConf = true;
		$scope.displayProf = false;
	}
	
	$scope.viewCart = function() {
		$scope.displayCheckout = false;
		$scope.displayCart = true;
		$scope.displayGame = false;
		$scope.displayConf = false;
		$scope.displayProf = false;
	}
	
	if($scope.user != null && $scope.user.last_transaction != null){
		console.log("last not null");
		$scope.viewConf();
	}
	
	$http.get('//localhost:8080/games/profile').
		success(function(data, status, headers, config) {
			//console.log("game: ", data);
			$scope.game = data;
		}).error(function(data, status, headers, config) {
			console.log('Error getting game');
		});
		
		// Get pending transactions for the user. Displayed in the profile page.
		$http.get('//localhost:8080/user/transactions').success(function(data, status, headers, config) {
			console.log("transactions: ", data);
			$scope.transForUser = data;
		}).error(function(data, status, headers, config) {
			console.log('Error getting user');
		});
		
	/**
		Submit a transaction.
		Change view to a confirmation page if successful.
	**/
	$scope.submitTransaction = function(user){
		if(!$scope.checkout.policy_accepted) { return; }
		$scope.checkout.mailing_address = user.mailing_address;
		$scope.checkout.billing_address = user.billing_address;
		$scope.checkout.user_cart = user.cart;
		$scope.checkout.credit = $scope.credit;
		$scope.checkout.charge = user.cart.cost;
		$scope.checkout.coin = user.cart.coin;
		
		$http.post('//localhost:8080/submitTransaction', $scope.checkout, { withCredentials: true }).success(function(data, status, headers, config) {
			$scope.viewConf();
			$scope.trans = data;
			user.cart = [];
			$http.get('//localhost:8080/user/transactions', { withCredentials: true }).success(function(data, status, headers, config) {
				console.log("transactions: ", data);
				$scope.transForUser = data;
			}).error(function(data, status, headers, config) {
				console.log('Error getting user');
			});
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //localhost:8080/submitTransaction");
		});
	}
	
	/* $scope.clearLastTransaction = function(){
		console.log("clearing.");
		$http.get('//localhost:8080/user/clearLastTransaction').
		success(function(data, status, headers, config) {
			console.log("cleared the last transaction.");
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //localhost:8080/clearLastTransaction");
		});
	}	*/
		
	$scope.getAction = function() {
		$http.post('//localhost:8080/user/action', $scope.page).
		success(function(data, status, headers, config) {
			console.log("data from action: " + data);
			if(data){ 
				$scope.action = data;
				$scope.page.actionNumber = $scope.page.actionNumber + 1;
			}
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //localhost:8080/game/action");
		});
	}
		
	$scope.getShooter = function() {
		//console.log($scope.page);
		$http.post('//localhost:8080/games/shooter', $scope.page).
		success(function(data, status, headers, config) {
			//console.log("App posted to //localhost:8080/game/shooter,response: ", data[0].image_path);
			if(data != ""){ 
				$scope.shooter = data;
				$scope.page.shooterNumber = $scope.page.shooterNumber + 1;
			}
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //localhost:8080/game/shooter");
		});
	}
	
	$scope.getFamily = function() {
		$http.post('//localhost:8080/games/family', $scope.page).
		success(function(data, status, headers, config) {
			if(data != ""){ 
				$scope.family = data;
				$scope.page.familyNumber = $scope.page.familyNumber + 1;
			}
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //localhost:8080/game/family");
		});
	}
		
	$scope.getRacing = function() {
		$http.post('//localhost:8080/games/racing', $scope.page).
		success(function(data, status, headers, config) {
			if(data != ""){ 
				$scope.racing = data;
				$scope.page.racingNumber = $scope.page.racingNumber + 1;
			}
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //localhost:8080/game/racing");
		});
	}
		
	$scope.getFighting = function() {
		$http.post('//localhost:8080/games/fighting', $scope.page).
		success(function(data, status, headers, config) {
			if(data != ""){ 
				$scope.fighting = data;
				$scope.page.fightingNumber = $scope.page.fightingNumber + 1;
			}
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //localhost:8080/game/fighting");
		});
	}
		
	$scope.getTitles = function() {
		$http.get('//localhost:8080/games/titles', { withCredentials: true }).
		success(function(data, status, headers, config) {
			$scope.titles = data;
			// console.log("titles: " + $scope.titles + ", data:" + data);
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //localhost:8080/games/titles");
		});
	}
		
	$scope.getTitles();
	$scope.getAction();
	$scope.getShooter();
	$scope.getFamily();
	$scope.getRacing();
	$scope.getFighting();
	
	$scope.reverseAction = function() {
		if( $scope.page.actionNumber > 1 ) {
			//console.log("decrementing page");
			$scope.page.actionNumber -= 2;
			//console.log($scope.page.actionNumber);
			$scope.getAction();
		}
	}
	
	$scope.reverseShooter = function() {
		if( $scope.page.shooterNumber > 1 ) {
			//console.log("decrementing page");
			$scope.page.shooterNumber -= 2;
			//console.log($scope.page.shooterNumber);
			$scope.getShooter();
		}
	}
		
	$scope.reverseFamily = function() {
		if( $scope.page.familyNumber > 1 ) {
			//console.log("decrementing page");
			$scope.page.familyNumber -= 2;
			$scope.getFamily();
		}
	}
		
	$scope.reverseRacing = function() {
		if( $scope.page.racingNumber > 1 ) {
			//console.log("decrementing page");
			$scope.page.racingNumber -= 2;
			$scope.getRacing();
		}
	}
	
	$scope.reverseFighting = function() {
		if( $scope.page.fightingNumber > 1 ) {
			//console.log("decrementing page");
			$scope.page.fightingNumber -= 2;
			$scope.getFighting();
		}
	}
	
	
	//Display game upload panel.
	$scope.toggleUploadGame = function() {
		$scope.uploadPhoto = false;
		$scope.uploadGame = !$scope.uploadGame;
	}
	
	$scope.toggleEditGame = function() {
		$scope.editGame = !$scope.editGame;
	}
	
	//Display photo upload panel.
	$scope.toggleUploadPhoto = function() {
		$scope.uploadGame = false;
		$scope.uploadPhoto = !$scope.uploadPhoto;
	}
	
	// Post to node server to upload a game
	$scope.gameUpload = function(game) {
		$http.post('//localhost:8080/upload/game', game).
		success(function(data, status, headers, config) {
			//console.log("App posted to //localhost:8080/upload/game,response: " + data);
			$scope.game = {}; // Reset the game inputs
			$scope.uploadGame = false;
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //localhost:8080/upload/game, { withCredentials: true }");
		});
	};
	
	$scope.getMatches = function() {
		$scope.matches = [];
		if($scope.query == null || $scope.query == "") return;
		var m = 0;
		for(var i = 0; i < $scope.titles.length; i++){
			if( m < 10 ) {
				if( $scope.titles[i].toUpperCase().indexOf($scope.query.toUpperCase()) > -1 ){
					$scope.matches.push($scope.titles[i]);
					m += 1;
				}
			}
		}
		//console.log("matches: " + $scope.matches);
	};
	
	$scope.updateGame = function(game) {
		$http.post('//localhost:8080/games/update', JSON.stringify(game), { withCredentials: true }).
			success(function(data, status, headers, config) {
			//	console.log("App posted to //localhost:8080/game/update, resonse: " + data);
				if(data){
					//$scope.getGame(game.title);
					$scope.editGame = false;
				} else {
					console.log("handle error");
					$scope.fail = true;
				}
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to //localhost:8080/game/update");
		});
	}
	
	$scope.getGame = function(gameTitle) {
		console.log("getting game " + gameTitle );
		var param = {};
		param.title = gameTitle;
		$http.post('//localhost:8080/game', JSON.stringify(param)).
			success(function(data, status, headers, config) {
				//console.log("App posted to //localhost:8080/game, resonse: " + data);
				if(data){
					$scope.game = data;
					console.log($scope.game.genre);
				//	$scope.displayCart = false;
					$scope.view.showCheckout = false;
					$scope.view.showGameDetail = true;
					$scope.view.showFeaturedGames = false;
					$scope.view.showProfile = false;
					//$scope.displayCheckout = false;
					//$scope.displayGame = true;
					//$scope.displayProf = false;
					$scope.query = null;
					$scope.getMatches();
					$("#intro").slideUp();
					var headerHeight = $('.header').height();
					$("#core").css("padding-top", headerHeight);
				} else {
					console.log("handle error");
					$scope.fail = true;
				}
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to //localhost:8080/game");
		});
	}
	
	/*
	depr. 9/24/16
		$scope.clearGame = function(){
		$scope.view.showGameDetail = false;
		$scope.view.showCart = false;
		$scope.view.showCheckout = false;
		$scope.view.showConfirmation = false;
		$scope.view.showProfile = false;
		$scope.view.showFeaturedGames = true;
	}
//}]);*/

//app.controller('LoginController', ['$scope', '$http', function($scope, $http ) {
	$scope.credentials = {};
	$scope.credentials.password = '';
	$scope.credentials.password2 = '';
	$scope.showSignUp = false;
	$scope.fail = false;
	$scope.authenticated = false;
	$scope.userAlreadyexists = false;
	
	/**
	Set the user from server data
	**/
	var setUser = function() {
		$http.get('//localhost:8080/user/profile', { withCredentials: true }).
			success(function(data, status, headers, config) {
			if(data) {
				$scope.user = data;
				$scope.total = $scope.totalCart();
				$scope.credit = $scope.totalCredit();
				$scope.coin = $scope.totalCoin();
				$scope.sales = $scope.allSalesInCart();
				$scope.buys = $scope.allBuysInCart();
				$scope.trades = $scope.allTradesInCart();
			} else {
				$scope.user = {};
			}
		}).error(function(data, status, headers, config) {
			console.log('Error getting user');
		});
	}
	setUser();
	
	/** 
	Check if a user is logged in
	**/
	$scope.isAuthenticated = function() {
	$http.get('//localhost:8080/user/isAuth', { withCredentials: true }).
		success(function(data, status, headers, config) {
			if(data == "true"){
				$scope.authenticated = true;
				$('#intro').removeClass('login-body');
				$('#welcome').hide();
			} else {
				$scope.authenticated = false;
			}
			console.log("isAuth: " + data);
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //localhost:8080/user/isAuth");
		});
	}
	$scope.isAuthenticated()
	
	$scope.passcheck = function() {
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
	$scope.setAuth = function() {
		$scope.authenticated = true;
		$scope.unauthenticated = false;
	}
	
	/**
		Sign in with credentials
	**/
	$scope.signin = function(){
		document.body.style.cursor = 'progress';
		if($scope.credentials.email && $scope.credentials.password){
			$http.post('//localhost:8080/signin/', $scope.credentials, { withCredentials: true }).success(function(data, status, headers, config) {
				$scope.user = data;
				$('#welcome').hide();
				$('#intro').removeClass('login-body');
				document.body.style.cursor = '';
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to //localhost:8080/signup");
				return;
			});
		}
	}
	
	/**
		Sign out user
	**/
	$scope.signout = function() {
		$http.post('//localhost:8080/signout', { withCredentials: true }).
		success(function(data, status, headers, config) {
			console.log("logged out");
			//var animationName = 'animated fadeIn';
			//var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
// 			$('#welcome').show();
 			$('#intro').addClass('login-body');
// 			$("#intro").show("slide");
			$('#intro').slideDown();
			$("#core").css("padding-top", "0px");
			//$('#intro').addClass(animationName).one(animationEnd, function() {
			//	$(this).removeClass(animationName);
			//});
			$scope.user = {};
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //localhost:8080/login");
		});
	};
	
	$scope.viewSignIn = function() {
			$scope.showSignUp = false;
			$('#intro').addClass('login-body');
			$('#intro').slideDown();
			$("#core").css("padding-top", "0px");
	}
	
	/**
	Register new user
	**/
	$scope.signup = function() {
		console.log("signing up: " + $scope.credentials.email);
		if($scope.credentials.email && $scope.credentials.password){
			$http.post('//localhost:8080/signup',  $scope.credentials, { withCredentials: true })
			.success(function(data, status, headers, config) {
				if(data == "exists"){
					$scope.userAlreadyexists = true;
				} else {
				    console.log("data from signup: " + data);
					$scope.user = data;
					$('#welcome').hide();
					$('#intro').removeClass('login-body');
					$scope.userAlreadyexists = false;
				}
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to //localhost:8080/signup");
			});
		}
	};
}]);


