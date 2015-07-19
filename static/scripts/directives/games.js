
app.directive("games", function() {
  return {
    restrict: 'E',
    templateUrl: "views/games.html"
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

