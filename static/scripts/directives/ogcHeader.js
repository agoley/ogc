
/**
* Module for the apps header.
* Data: user, games
**/
app.directive('ogcHeader', function() {
	return {
		scope: {
			user: '=',
			games: '='
		},
		templateUrl: 'header.html',
		replace: true,
		controller: 'HeaderCtrl',
		controllerAs: 'ctrl'
    };
})

app.controller('HeaderCtrl', function() {
    this.contestants = [
      {firstName: 'Rachel', lastName: 'Washington'},
      {firstName: 'Joshua', lastName: 'Foster'},
      {firstName: 'Samuel', lastName: 'Walker'},
      {firstName: 'Phyllis', lastName: 'Reynolds'}
    ];
  });