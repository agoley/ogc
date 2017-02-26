// userMngr Module: provides components and services for user functions
var userMngr = angular.module('userMngr', []);

userMngr.component('confirmation', {
	bindings: {
		user: '=',
		view: '='
	},
	controller: function(UserFactory, ViewService) {
		var ctrl = this;
		
		ctrl.setViewToFeaturedGames = function() {
			  ctrl.view = ViewService.setViewToFeaturedGames(ctrl.view);
		};
		
		ctrl.transForUser = [];
		
		UserFactory.getTransactions().then(function(response) {
			if (response.data) {
				ctrl.transForUser = response.data;
			}
		});
	},
	templateUrl: 'views/confirmation.html'
});

userMngr.component('checkoutView', {
	bindings: {
		user: '=',
		view: '='
	},
	controller: function (UserFactory, ViewService) {
        var ctrl = this;
		ctrl.checkout = {};
        ctrl.transaction = {};
		ctrl.creditTypes = ["PayPal", "Venmo", "Mailed Check"];
        ctrl.totals = UserFactory.getCartTotals(ctrl.user);
		
		ctrl.allSalesInCart = function () {
            var currSales = [], i = 0;
            for (i = 0; i < ctrl.user.cart.length; i++) {
                if (ctrl.user.cart[i].type === 'sale') { 
                    currSales.push(ctrl.user.cart[i]);
                }
            }
            return currSales;
        };
        
        ctrl.allBuysInCart = function () {
            var currBuys = [], i = 0;
            for (i = 0; i < ctrl.user.cart.length; i++) {
                if (ctrl.user.cart[i].type === 'ingest') {
                    currBuys.push(ctrl.user.cart[i]);
                }
            }
            return currBuys;
        };
        
        ctrl.allTradesInCart = function () {
            var currTrades = [], i = 0;
            for (i = 0; i < ctrl.user.cart.length; i++) {
                if (ctrl.user.cart[i].type === 'trade') {
                    currTrades.push(ctrl.user.cart[i]);
                }
            }
            return currTrades;
        };
        
        ctrl.submitTransaction = function () {
            if(!ctrl.checkout.policy_accepted) {
					return; 
				}
            ctrl.checkout.mailing_address = ctrl.user.mailing_address;
            ctrl.checkout.billing_address = ctrl.user.billing_address;
            ctrl.checkout.user_cart = ctrl.user.cart;
            ctrl.checkout.credit = ctrl.totals.credit;
            ctrl.checkout.charge = ctrl.totals.cost;
            ctrl.checkout.coin = ctrl.totals.coin;
			   ctrl.checkout.creds = ctrl.credentials;
            
            UserFactory.submitTransaction(ctrl.checkout).then(function(response) {
               if (response.data) {
						if (ctrl.user.email == null) {
							ctrl.user.cart = [];
						} else {
							ctrl.refreshUser();
						}
						console.log("transactions successfull, setting view to confirmation.");
						ViewService.setViewToConfirmation(ctrl.view);
               } 
            });
        }
		  
		  ctrl.refreshUser = function () {
			  UserFactory.refreshUser().then(function (response) {
				  if (response.data) {
					  ctrl.user = response.data;
				  }
			  });
		  }
        
        ctrl.setViewToFeaturedGames = function () {
			  ctrl.view = ViewService.setViewToFeaturedGames(ctrl.view);
		  };
        
        ctrl.sales = ctrl.allSalesInCart();
        ctrl.buys = ctrl.allBuysInCart();
        ctrl.trades = ctrl.allTradesInCart();
    },
    templateUrl: 'views/checkoutView.html'
});

userMngr.component('accountManagement', {
	bindings: {
		user: '=',
		view: '='
	},
	controller: function (UserFactory, ViewService, $scope) {
        var ctrl = this;
		ctrl.transForUser = [];
		ctrl.userform = {isEditng: false};
				
		UserFactory.getTransactions().then(function (response) {
			if (response.data) {
				ctrl.transForUser = response.data;
			}
		});
		
		ctrl.updateUser = function () {
			UserFactory.update(ctrl.user).then(function (response) {
				if (response.data) {
					ctrl.user = response.data;
					ctrl.tmp = $.extend(true, {}, ctrl.user);
					ctrl.userform.isEditing = false;
				}
			});
		};
		
		ctrl.edit = function () {
			ctrl.userform.isEditing = true;
			ctrl.tmp = $.extend(true, {}, ctrl.user);
		};
		
		ctrl.cancel = function () {
			ctrl.user = $.extend(true, {}, ctrl.tmp);
			ctrl.userform.isEditing = false;
		};
		
		ctrl.setViewToFeaturedGames = function () {
			ctrl.view = ViewService.setViewToFeaturedGames(ctrl.view);
		};
		
	},
	templateUrl: 'views/user_profile.html'
});

userMngr.component('cartView', {
	bindings: {
		user: '=',
		view: '='
	},
	controller: function (ViewService, UserFactory, $scope, $cookies) {
		var ctrl = this;
		
		// Function to remove an item from the users cart.
		ctrl.removeFromCart = function (item) {
			if (ctrl.user.email == null) {
				// This is a guest.
				for (var i = 0; i < ctrl.user.cart.length; i++) {
					if (item.path == ctrl.user.cart[i].path) {
						// This is the item to remove.
						ctrl.user.cart.splice(i, 1); // Remove the item.
					}
				}
				// Save the user in client cookie.
				$cookies.putObject('guest', ctrl.user);
				// Update cart totals.
			} else {
				UserFactory.removeItemFromCart(item).then(function (response) {
					if (response.data) {
						ctrl.user = response.data;
					}
				});
			}
		};
		
		ctrl.setViewToCheckout = function () {
			ctrl.view = ViewService.setViewToCheckout(ctrl.view);
		};
		
		ctrl.setViewToFeaturedGames = function () {
			ctrl.view = ViewService.setViewToFeaturedGames(ctrl.view);
		};
	},
	templateUrl: 'views/cartView.html'
});