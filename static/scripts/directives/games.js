
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

app.directive("contentManager", function() {
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

