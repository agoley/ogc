// User account module: allows the user to view and edit their account
var userAccount = angular.module('userAccount', []);

// Provide user services for the account module
userAccount.factory('UserFactory', function($http) {
	var userFactory = {};
	
	// get transaction history for this user
	userFactory.getHistory = function(){
		return $http.get('//localhost:8080/user/transactions');
	}
	
	// update the users information
	userFactory.updateUser = function(){
		return $http.post('//localhost:8080/user/update', $scope.user);
	}
	return userFactory;
});

userAccount.component('recentTransactionHistory', {
	bindings: {},
	controller: function(UserFactory) {},
	templateUrl: "views/user_profile.html"
});
