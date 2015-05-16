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
	var page = parseInt(req.body.number);
	console.log("body: " + req.body.number);
	Game.find({ genre: "Action" })
	.skip(page * paginate)
	.limit(paginate)
	.exec(function(err, games) {
		if (!games){
			res.json(404, {err: 'Data Not Found.'});
		} else {
			var json = JSON.stringify(games);
			console.log(json);
			res.send(json);
		}
	});
};