// Factory for user functions
angular.module('onlinegamecash').factory('UserFactory', function($http) {
	var userFactory = {};
	// login request
	userFactory.login = function(credentials) {
		if(credentials.email && credentials.password){
			return $http
				.post('//localhost:8080/signin/',
					credentials,
					{withCredentials: true});
		}
	};	
	// signup request
	userFactory.signup = function(credentials) {
		if(credentials.email && credentials.password){
			return $http
				.post('//localhost:8080/signup',
					credentials,
					{ withCredentials: true });
		} 
	}
	
	userFactory.update = function(user) {
		return $http.post('//localhost:8080/user/update', user);
	}
	
	userFactory.getTransactions = function() {
		return $http.get('//localhost:8080/user/transactions');
	} 
	
	userFactory.addItemToCart = function(g, t) {
		return $http.post('//localhost:8080/user/addItemToCart', {game: g, type: t});
	}
	
	userFactory.removeItemFromCart = function(game) {
		return $http.post('//localhost:8080/user/removeGame', game);
	}
    
    userFactory.submitTransaction = function(checkout) {
        return $http.post('//localhost:8080/submitTransaction', checkout);
    }
	 
	 userFactory.refreshUser = function() {
		 return $http.get('//localhost:8080/user/profile');
	 }	
	 
	userFactory.getCartTotals = function(user) {
            var totals = {};
			totals.cost = 0;
			totals.coin = 0;
			totals.credit = 0;
			var currSales = [];
			for (var i = 0; i < user.cart.length; i++) {
				if (user.cart[i].type == 'sale') {
					totals.cost += user.cart[i].cost;
				} else if (user.cart[i].type == 'trade') {
					totals.coin += user.cart[i].cost;
				} else {
					totals.credit += user.cart[i].cost;
				}
			}
			return totals;
		}
	
	// Format the item. {title, console, qauntity, path, cost, type}
	userFactory.formatCartItem = function(item, type) {
		var cartItem = {};
		cartItem.title = item.title;
		cartItem.console = item.console;
		cartItem.quantity = item.quantity;
		cartItem.path = item.image_path;
		cartItem.type = type;
		if (type == 'sale') {
			cartItem.cost = item.sell_price;
		} else if (type == 'ingest') {
			cartItem.cost = item.buy_price;
		} else {
			cartItem.cost = item.buy_price + 5;
		}
		return cartItem;
	}
	
	return userFactory;
});
