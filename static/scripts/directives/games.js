
app.directive("games", function() {
  return {
    restrict: 'E',
    templateUrl: "views/games.html"
    };
});

app.directive("gamesUnauth", function() {
  return {
    restrict: 'E',
    templateUrl: "views/games-unauth.html"
    };
});

app.directive("cm", function() {
  return {
    restrict: 'E',
    templateUrl: "views/cm.html"
    };
});

app.directive("authorizedHeader", function() {
  return {
    restrict: 'E',
    templateUrl: "views/auth_head.html"
    };
});

// angular 1.5 upgrade
app.directive("ogcWelcome", function() {
	return {
		restrict: 'E',
		templateUrl: "views/welcome.html"
	};
});


// angular 1.5 upgrade
app.directive("ogcHeader", function() {
	return {
		restrict: 'E',
		templateUrl: "views/header.html"
	};
});

app.directive("ogcFooter", function() {
  return {
    restrict: 'E',
    templateUrl: "views/footer.html"
    };
});

app.directive("gameDisplay", function() {
  return {
    restrict: 'E',
    templateUrl: "views/game_display.html"
    };
});

app.directive("cartDisplay", function() {
  return {
    restrict: 'E',
    templateUrl: "views/cart.html"
    };
});

app.directive("checkout", function() {
  return {
    restrict: 'E',
    templateUrl: "views/checkout.html"
    };
});

app.directive("confirmation", function() {
  return {
    restrict: 'E',
    templateUrl: "views/confirmation.html"
    };
});

app.directive("userProfile", function() {
  return {
    restrict: 'E',
    templateUrl: "views/user_profile.html"
    };
});

app.directive("unauthHome", function() {
  return {
    restrict: 'E',
    templateUrl: "views/main.html"
    };
});
app.directive("authHome", function() {
  return {
    restrict: 'E',
    templateUrl: "views/main_home.html"
    };
});

app.directive("newMember", function() {
  return {
    restrict: 'E',
    templateUrl: "views/new_member.html"
    };
});

