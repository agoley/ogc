// userFunctionalManagment Module: provides components and services for user functions
var userFunctionalManagement = angular.module('userFunctionalManagement', []);

userFunctionalManagement.component('accountManagement', {
	bindings: {
		user: '=',
		view: '='
	},
	controller: function(UserFactory, ViewService, $scope){
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
		}
		
		ctrl.edit = function () {
			ctrl.userform.isEditing = true
			ctrl.tmp = $.extend(true, {}, ctrl.user);
		}
		
		ctrl.cancel = function () {
			ctrl.user = $.extend(true, {}, ctrl.tmp);
			ctrl.userform.isEditing = false;
		}
		
		ctrl.setViewToFeaturedGames = function() {
			ctrl.view = ViewService.setViewToFeaturedGames(ctrl.view);
		}
		
	},
	templateUrl: 'views/user_profile.html'
});

userFunctionalManagement.component('cartView', {
	bindings: {
		user: '=',
		view: '='
	},
	controller: function (ViewService) {
		var ctrl = this;
		
		ctrl.removeItemFromCart = function (item) {}
		
		ctrl.setViewToCheckout = function () {
			ctrl.view = ViewService.setViewToCheckout(ctrl.view);
		}
		
		ctrl.setViewToFeaturedGames = function() {
			ctrl.view = ViewService.setViewToFeaturedGames(ctrl.view);
		}
	},
	templateUrl: 'views/cartView.html'
});