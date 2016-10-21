// service to control the page layout

angular.module('onlinegamecash').service('ViewService', function() {
  
  // set view to only display featured games
	this.setViewToFeaturedGames = function (view) {
    	view.showGameDetail = false;
		view.showCart = false;
	 	view.showCheckout = false;
	 	view.showConfirmation = false;
	 	view.showProfile = false;
	 	view.showFeaturedGames = true;
	 	return view;
  	};
  
  	// set view to only display the game detail
	this.setViewToGameDetail = function (view) {
  		view.showCheckout = false;
  		view.showCart = false;
  		view.showConfirmation = false;
		view.showGameDetail = true;
		view.showFeaturedGames = false;
		view.showProfile = false;
		return view;
  	}
  	
  	// set view to only display the checkout view
	this.setViewToCheckout = function (view) {
  		view.showCheckout = true;
  		view.showCart = false;
  		view.showConfirmation = false;
		view.showGameDetail = false;
		view.showFeaturedGames = false;
		view.showProfile = false;
		return view;
  	}
  	
  	// set view to only display the cart view
	this.setViewToCart = function (view) {
  		view.showCheckout = false;
  		view.showCart = true;
  		view.showConfirmation = false;
		view.showGameDetail = false;
		view.showFeaturedGames = false;
		view.showProfile = false;
		return view;
  	}
});