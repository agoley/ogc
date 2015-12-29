var mongoose = require('mongoose');
var Game = mongoose.model('Game');

var query = Game.find({}).select('title -_id');

var allGameTitles = [];
query.exec(function (err, titles) {
	if (err) return next(err);
	for(i = 0; i < titles.length; i++){
		allGameTitles.push(titles[i].title);
	}
	//console.log("All Titles: " + allGameTitles);
});
exports.refreshTitles = function(req,res) {
	query.exec(function (err, titles) {
		if (err) return next(err);
		for(i = 0; i < titles.length; i++){
			allGameTitles.push(titles[i].title);
		}
		//console.log("All Titles: " + allGameTitles);
	})
	res.end();
}

exports.getAllTitles = function(req, res) {
	var titles = JSON.stringify(allGameTitles);
	res.send(titles);
};

exports.update = function(req, res){
	console.log(req.body);
	Game.findOne({ _id: req.body._id })
	.exec(function(err,game) {
		if(!game){
			err = 'Game Not Found.';
			console.log(err);
		} else {
			game.title = req.body.title
			game.genre = req.body.genre
			game.summary= req.body.summary
			game.release_date = req.body.release_date
			game.buy_price = req.body.buy_price
			game.sell_price = req.body.sell_price
			game.save();
		}
		res.json(game);
	});
}

exports.upload = function(req, res){
	// Check if the game exists already. If it does add to the quantity. Otherwise add the game.
	Game.findOne({title: req.body.title, console: req.body.console}).exec(function(err,dup) {
		if(dup){
			console.log("ITS A DUP!");
			err = "It's a dup!";
			res.end(err);
		} else {
			var game = new Game({title:req.body.title});
			game.set('console', req.body.console);
			game.set('developer', req.body.developer);
			game.set('release_date', req.body.date);
			game.set('genre', req.body.genre);
			game.set('buy_price', req.body.buyPrice);
			game.set('sell_price', req.body.sellPrice);
			//var imgPath = "http://localhost/images/games/".concat(req.body.title.toLowerCase().concat("_").concat(req.body.console.toLowerCase()).replace(/[^\w\s]/gi, '').concat('.jpg'));
			var imgPath = "https://agile-shelf-4123.herokuapp.com/images/games/".concat(req.body.title.toLowerCase().concat("_").concat(req.body.console.toLowerCase()).replace(/[^\w\s]/gi, '').concat('.jpg'));
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
		}
	})
};

exports.getActionGames = function(req, res) {
	var paginate = 3;
	var size = 15;
	var page = parseInt(req.body.actionNumber);
	Game.find({ genre: "Action" })
	.skip(page * paginate)
	.limit(size)
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
	var paginate = 3;
	var page = parseInt(req.body.shooterNumber);
	Game.find({ genre: "Shooter" })
	.skip(page * paginate)
	.limit(size)
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
	var paginate = 3;
	var page = parseInt(req.body.familyNumber);
	Game.find({ genre: "Family" })
	.skip(page * paginate)
	.limit(size)
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
	var paginate = 3;
	var page = parseInt(req.body.racingNumber);
	Game.find({ genre: "Racing" })
	.skip(page * paginate)
	.limit(size)
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
	var paginate = 3;
	var page = parseInt(req.body.fightingNumber);
	Game.find({ genre: "Fighting" })
	.skip(page * paginate)
	.limit(size)
	.exec(function(err, games) {
		if (!games){
			res.json(404, {err: 'Data Not Found.'});
		} else {
			var json = JSON.stringify(games);
			res.send(json);
		}
	});
};

exports.game = function(req, res){
	console.log(req.body);
	Game.findOne({ title: req.body.title })
	.exec(function(err,game) {
		if(!game){
			err = 'Game Not Found.';
		} else {
			req.session.game = game;
			res.redirect('/gameView');
		}
		res.end();
	});
}

exports.getGameProfile = function(req, res){
	res.json(req.session.game)
}

/*
exports.signin = function(req, res){
   User.findOne({ email: req.body.email })
   .exec(function(err, user) {
     if (!user){
       err = 'User Not Found.';
     } else if (user.password ===
                hashPW(req.body.password.toString())) {
       req.session.regenerate(function(){
         req.session.user = user.id;
         req.session.username = user.username;
         req.session.msg = 'Authenticated as ' + user.username;
         res.redirect('/');
       });
     }else{
       err = 'Authentication failed.';
     }
     if(err){
       req.session.regenerate(function(){
         req.session.msg = err;
	 res.send();
         //res.redirect('/login');
       });
     }
   });
};
*/