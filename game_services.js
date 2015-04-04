var mongoose = require('mongoose');
var Game = mongoose.model('Game');

exports.upload = function(req, res){
   console.log("Begining game upload.");
   console.log(req.body.picture);
   var game = new Game({title:req.body.title});
   game.set('console', req.body.console);
   game.set('developer', req.body.developer);
   game.set('release_date', req.body.date);
   game.set('genre', req.body.genre);
   game.set('buy_price', req.body.buyPrice);
   game.set('sell_price', req.body.sellPrice);
   console.log(game);
   res.send();
   /*game.save(function(err) {
     if (err){
		console.log(err);
		res.send(0);
     } else {
       res.send(1);
     }
   });*/
};