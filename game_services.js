var mongoose = require('mongoose');
var Game = mongoose.model('Game');

exports.upload = function(req, res){
   console.log("Begining game upload.");
   var game = new Game({title:req.body.title});
   game.set('console', req.body.console);
   game.set('developer', req.body.developer);
   game.set('release_date', req.body.date);
   game.set('genre', req.body.genre);
   game.set('buy_price', req.body.buyPrice);
   game.set('sell_price', req.body.sellPrice);
   var imgPath = "http://localhost/images/games/".concat(req.body.title.toLowerCase().concat("_").concat(req.body.console.toLowerCase()).replace(/[^\w\s]/gi, '').concat('.jpg'));
   imgPath = imgPath.split(' ').join('_');
   game.set('image_path', imgPath);
   console.log(game);
   res.send();
   game.save(function(err) {
     if (err){
		console.log(err);
		res.end(0);
     } else {
       res.end(1);
     }
   });
};

exports.getActionGames = function(req, res) {
	var paginate = 5;
	var page = parseInt(req.body.actionNumber);
	console.log("body: " + req.body.actionNumber);
	Game.find({ genre: "Action" })
	.skip(page * paginate)
	.limit(paginate)
	.exec(function(err, games) {
		if (!games){
			res.json(404, {err: 'Data Not Found.'});
		} else {
			var json = JSON.stringify(games);
			res.send(json);
		}
	});
};


exports.getShooterGames = function(req, res) {
	var paginate = 5;
	var page = parseInt(req.body.shooterNumber);
	console.log("body: " + req.body.shooterNumber);
	Game.find({ genre: "Shooter" })
	.skip(page * paginate)
	.limit(paginate)
	.exec(function(err, games) {
		if (!games){
			res.json(404, {err: 'Data Not Found.'});
		} else {
			var json = JSON.stringify(games);
			res.send(json);
		}
	});
};

exports.getFamilyGames = function(req, res) {
	var paginate = 5;
	var page = parseInt(req.body.familyNumber);
	console.log("body: " + req.body.familyNumber);
	Game.find({ genre: "Family" })
	.skip(page * paginate)
	.limit(paginate)
	.exec(function(err, games) {
		if (!games){
			res.json(404, {err: 'Data Not Found.'});
		} else {
			var json = JSON.stringify(games);
			res.send(json);
		}
	});
};

exports.getRacingGames = function(req, res) {
	var paginate = 5;
	var page = parseInt(req.body.racingNumber);
	console.log("body: " + req.body.racingNumber);
	Game.find({ genre: "Racing" })
	.skip(page * paginate)
	.limit(paginate)
	.exec(function(err, games) {
		if (!games){
			res.json(404, {err: 'Data Not Found.'});
		} else {
			var json = JSON.stringify(games);
			res.send(json);
		}
	});
};

exports.getFightingGames = function(req, res) {
	var paginate = 5;
	var page = parseInt(req.body.fightingNumber);
	console.log("body: " + req.body.fightingNumber);
	Game.find({ genre: "Fighting" })
	.skip(page * paginate)
	.limit(paginate)
	.exec(function(err, games) {
		if (!games){
			res.json(404, {err: 'Data Not Found.'});
		} else {
			var json = JSON.stringify(games);
			res.send(json);
		}
	});
};