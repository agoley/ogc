'use strict';

/**
 * @ngdoc function
 * @name loginApp.controller:MainCtrl
 * @description
 * # MainCtrl
 */
var app = angular.module('loginApp')
  .controller('MainCtrl', function ($scope) {
  });
  
app.controller('HomeController', ['$scope', '$http', '$timeout', function($scope, $http, $timeout ) {
	$scope.addConfirm = false;
	$scope.transaction = {};
	$scope.creditTypes = ["Venmo", "Mailed Check"];
	$scope.checkout = {};
	$scope.user = {};

	$scope.clearLastTransaction = function(){
		console.log("clearing.");
		$http.get('//www.onlinegamecash.com/user/clearLastTransaction', { withCredentials: true }).
		success(function(data, status, headers, config) {
			console.log("cleared the last transaction.");
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //www.onlinegamecash.com/clearLastTransaction");
		});
	}
	
	// Get pending transactions for the user. Displayed in the profile page.
	var getTransactions = function() {
		$http.get('//www.onlinegamecash.com/user/transactions', { withCredentials: true }).success(function(data, status, headers, config) {
			$scope.transForUser = data;
		}).error(function(data, status, headers, config) {
			console.log('Error getting user');
		});
	};
	
	$scope.updateUser = function(){
		$http.post('//www.onlinegamecash.com/user/update', $scope.user).
		success(function(data, status, headers, config) {
			$scope.user = data;
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //www.onlinegamecash.com/user/update");
		});
	}			
	
	$http.get('//www.onlinegamecash.com/user/profile').
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
		$http.get('//www.onlinegamecash.com/user/profile').
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
		
	$scope.addToCart = function(game) {
		// Filter by transaction type
		if($scope.transaction.type == "sale") {
			console.log("adding game: " + game);
			$http.post('//www.onlinegamecash.com/user/addGame', game, { withCredentials: true }).
			success(function(data, status, headers, config) {
				if(data) {
					$scope.user = data;
					$scope.addConfirm = true;
					$timeout(function(){$scope.addConfirm = false; $scope.$apply();}, 3000);
					$scope.total = $scope.totalCart();
					$scope.credit = $scope.totalCredit();
					$scope.coin = $scope.totalCoin();
					$scope.sales = $scope.allSalesInCart();
					$scope.buys = $scope.allBuysInCart();
					$scope.trades = $scope.allTradesInCart();
				}
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to //www.onlinegamecash.com/user/addGame");
			});
		} else if($scope.transaction.type == "ingest") {
			// Add credit to the users account.
			$http.post('//www.onlinegamecash.com/user/addCredit', game,{ withCredentials: true }).
			success(function(data, status, headers, config) {
				if(data) {
					$scope.user = data;
					$timeout(function(){$scope.addConfirm = true; $scope.$apply();}, 100);
					$timeout(function(){$scope.addConfirm = false; $scope.$apply();}, 3000);
					$scope.total = $scope.totalCart();
					$scope.credit = $scope.totalCredit();
					$scope.coin = $scope.totalCoin();
					$scope.sales = $scope.allSalesInCart();
					$scope.buys = $scope.allBuysInCart();
					$scope.trades = $scope.allTradesInCart();
				}
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to //www.onlinegamecash.com/user/addGame", { withCredentials: true });
			});
		} else if($scope.transaction.type == "trade") {
			// Add coin to the users account.
			$http.post('//www.onlinegamecash.com/user/addCoin', game, { withCredentials: true }).
			success(function(data, status, headers, config) {
				if(data) {
					$scope.user = data;
					timeout(function(){$scope.addConfirm = true; $scope.$apply();}, 100);
					$timeout(function(){$scope.addConfirm = false; $scope.$apply();}, 3000);
					$scope.total = $scope.totalCart();
					$scope.credit = $scope.totalCredit();
					$scope.coin = $scope.totalCoin();
					$scope.sales = $scope.allSalesInCart();
					$scope.buys = $scope.allBuysInCart();
					$scope.trades = $scope.allTradesInCart();
				}
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to //www.onlinegamecash.com/user/addGame", { withCredentials: true });
			});
		}
		
	}
		
	$scope.removeFromCart = function(game) {
		$http.post('//www.onlinegamecash.com/user/removeGame', game, { withCredentials: true }).
		success(function(data, status, headers, config) {
			//console.log("user: ", data);
			if(data){
				$scope.user = data;
				$scope.total = $scope.totalCart();
				$scope.credit = $scope.totalCredit();
				$scope.coin = $scope.totalCoin();
			}
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //www.onlinegamecash.com/user/addGame");
		});
	} 	
}]);

app.controller('GameController', ['$scope', '$http', function($scope, $http ) {
	$scope.game = {};
	$scope.consoles = ["PS4", "Xbox One", "Wii U", "PS3", "Xbox 360", "Wii", "3DS", "DS" ];
	$scope.genres = ["Action", "Adventure", "FPS", "RPG", "TPS", "Shooter", "Fighting", "Racing", "Family", "Strategy", "MMO" ];
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
		$http.get('//www.onlinegamecash.com/client_token', { withCredentials: true })
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
	
	$http.get('//www.onlinegamecash.com/games/profile').
		success(function(data, status, headers, config) {
			//console.log("game: ", data);
			$scope.game = data;
		}).error(function(data, status, headers, config) {
			console.log('Error getting game');
		});
		
		// Get pending transactions for the user. Displayed in the profile page.
		$http.get('//www.onlinegamecash.com/user/transactions').success(function(data, status, headers, config) {
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
		$scope.checkout.charge = $scope.total;
		$scope.checkout.coin = $scope.coin;
		
		$http.post('//www.onlinegamecash.com/submitTransaction', $scope.checkout, { withCredentials: true }).success(function(data, status, headers, config) {
			$scope.viewConf();
			$scope.trans = data;
			user.cart = [];
			$http.get('//www.onlinegamecash.com/user/transactions', { withCredentials: true }).success(function(data, status, headers, config) {
				console.log("transactions: ", data);
				$scope.transForUser = data;
			}).error(function(data, status, headers, config) {
				console.log('Error getting user');
			});
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //www.onlinegamecash.com/submitTransaction");
		});
	}
	
	/* $scope.clearLastTransaction = function(){
		console.log("clearing.");
		$http.get('//www.onlinegamecash.com/user/clearLastTransaction').
		success(function(data, status, headers, config) {
			console.log("cleared the last transaction.");
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //www.onlinegamecash.com/clearLastTransaction");
		});
	}	*/
		
	$scope.getAction = function() {
		$http.post('//www.onlinegamecash.com/user/action', $scope.page).
		success(function(data, status, headers, config) {
			console.log("data from action: " + data);
			if(data){ 
				$scope.action = data;
				$scope.page.actionNumber = $scope.page.actionNumber + 1;
			}
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //www.onlinegamecash.com/game/action");
		});
	}
		
	$scope.getShooter = function() {
		//console.log($scope.page);
		$http.post('//www.onlinegamecash.com/games/shooter', $scope.page).
		success(function(data, status, headers, config) {
			//console.log("App posted to //www.onlinegamecash.com/game/shooter,response: ", data[0].image_path);
			if(data != ""){ 
				$scope.shooter = data;
				$scope.page.shooterNumber = $scope.page.shooterNumber + 1;
			}
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //www.onlinegamecash.com/game/shooter");
		});
	}
	
	$scope.getFamily = function() {
		$http.post('//www.onlinegamecash.com/games/family', $scope.page).
		success(function(data, status, headers, config) {
			if(data != ""){ 
				$scope.family = data;
				$scope.page.familyNumber = $scope.page.familyNumber + 1;
			}
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //www.onlinegamecash.com/game/family");
		});
	}
		
	$scope.getRacing = function() {
		$http.post('//www.onlinegamecash.com/games/racing', $scope.page).
		success(function(data, status, headers, config) {
			if(data != ""){ 
				$scope.racing = data;
				$scope.page.racingNumber = $scope.page.racingNumber + 1;
			}
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //www.onlinegamecash.com/game/racing");
		});
	}
		
	$scope.getFighting = function() {
		$http.post('//www.onlinegamecash.com/games/fighting', $scope.page).
		success(function(data, status, headers, config) {
			if(data != ""){ 
				$scope.fighting = data;
				$scope.page.fightingNumber = $scope.page.fightingNumber + 1;
			}
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //www.onlinegamecash.com/game/fighting");
		});
	}
		
	$scope.getTitles = function() {
		$http.get('//www.onlinegamecash.com/games/titles', { withCredentials: true }).
		success(function(data, status, headers, config) {
			$scope.titles = data;
			console.log("titles: " + $scope.titles + ", data:" + data);
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //www.onlinegamecash.com/games/titles");
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
		$http.post('//www.onlinegamecash.com/upload/game', game).
		success(function(data, status, headers, config) {
			//console.log("App posted to //www.onlinegamecash.com/upload/game,response: " + data);
			$scope.game = {}; // Reset the game inputs
			$scope.uploadGame = false;
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //www.onlinegamecash.com/upload/game, { withCredentials: true }");
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
		$http.post('//www.onlinegamecash.com/games/update', JSON.stringify(game), { withCredentials: true }).
			success(function(data, status, headers, config) {
			//	console.log("App posted to //www.onlinegamecash.com/game/update, resonse: " + data);
				if(data){
					//$scope.getGame(game.title);
					$scope.editGame = false;
				} else {
					console.log("handle error");
					$scope.fail = true;
				}
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to //www.onlinegamecash.com/game/update");
		});
	}
	
	$scope.getGame = function(gameTitle) {
		var param = {};
		param.title = gameTitle;
		$http.post('//www.onlinegamecash.com/game', JSON.stringify(param)).
			success(function(data, status, headers, config) {
				//console.log("App posted to //www.onlinegamecash.com/game, resonse: " + data);
				if(data){
					$scope.game = data;
					console.log($scope.game.genre);
				//	$scope.displayCart = false;
					$scope.displayCheckout = false;
					$scope.displayGame = true;
					$scope.displayProf = false;
					$scope.query = null;
					$scope.getMatches();
				} else {
					console.log("handle error");
					$scope.fail = true;
				}
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to //www.onlinegamecash.com/game");
		});
	}
	
	$scope.clearGame = function(){
		$scope.displayGame = false;
		$scope.displayCart = false;
		$scope.displayCheckout = false;
		$scope.displayConf = false;
		$scope.displayProf = false;
	}
}]);

app.controller('LoginController', ['$scope', '$http', function($scope, $http ) {
	$scope.credentials = {};
	$scope.credentials.password = '';
	$scope.credentials.password2 = '';
	$scope.showSignUp = true;
	$scope.fail = false;
	$scope.authenticated = false;
	
	/**
	Set the user from server data
	**/
	var setUser = function() {
		$http.get('//www.onlinegamecash.com/user/profile', { withCredentials: true }).
			success(function(data, status, headers, config) {
			if(data) {
				$scope.user = data;$scope.total = $scope.totalCart();
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
	setUser();
	
	/** 
	Check if a user is logged in
	**/
	$scope.isAuthenticated = function() {
	$http.get('//www.onlinegamecash.com/user/isAuth', { withCredentials: true }).
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
			console.log("App failed to post to //www.onlinegamecash.com/user/isAuth");
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
		console.log("hello, this is signin2");
		if($scope.credentials.email && $scope.credentials.password){
			$http.post('//www.onlinegamecash.com/signin/', $scope.credentials, { withCredentials: true }).success(function(data, status, headers, config) {
				$scope.user = data;
				$('#welcome').hide();
				$('#intro').removeClass('login-body');
				console.log("user after sign in: " + $scope.user)
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to //www.onlinegamecash.com/signup");
				return;
			});
		}
	}
	
	/**
		Sign out user
	**/
	$scope.signout = function() {
		$http.post('//www.onlinegamecash.com/signout', { withCredentials: true }).
		success(function(data, status, headers, config) {
			console.log("logged out");
			var animationName = 'animated fadeIn';
			var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
			$('#welcome').show();
			$('#intro').addClass('login-body');
			$('#intro').addClass(animationName).one(animationEnd, function() {
				$(this).removeClass(animationName);
			});
			$scope.user = {};
		}).error(function(data, status, headers, config) {
			console.log("App failed to post to //www.onlinegamecash.com/login");
		});
	};
	
	/**
	Register ne user
	**/
	$scope.signup = function() {
		if($scope.credentials.email && $scope.credentials.password){
			$http.post('//www.onlinegamecash.com/signup',  $scope.credentials, { withCredentials: true }).success(function(data, status, headers, config) {
				window.location = '//www.onlinegamecash.com/home';
			}).error(function(data, status, headers, config) {
				console.log("App failed to post to //www.onlinegamecash.com/signup");
			});
		}
	};
	
}]);


