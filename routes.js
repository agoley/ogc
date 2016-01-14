var crypto = require('crypto');
var express = require('express');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Game = mongoose.model('Game');
var Transaction = mongoose.model('Transaction');
var crypto = require('crypto');

/* Braintree config */
var braintree = require("braintree");

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "yznj2nd338249bxn",
  publicKey: "2h2srgd23vdmj5xp",
  privateKey: "c8823318fc817d0ceb25f87e3e5fb86e"
});

function hashPW(pwd){
   return crypto.createHash('sha256').update(pwd).
          digest('base64').toString();
};

module.exports = function(app) {
	var users = require('./user_services');
	var games = require('./game_services');
	app.use('/static', express.static( './static'));
	
	app.get('/', function(req, res){
     console.log("redirecting");
	 console.log("authenticated user id: " + req.session.user)
	 if (req.session.user)	 {
		 console.log("sending to /home");
		res.redirect('/home');
     } else {
       req.session.msg = 'Access denied!';
	   //console.log("sending to /login");
       res.redirect('/login');
     }
  });
	app.get('/login',  function(req, res){
		res.render('index', {msg:req.session.msg});
	});
	
	app.get('/gameView', function(req,res) {
		if (req.session.user) {
			//res.render('game',  {game: req.session.game, msg:req.session.msg});
			res.json(req.session.game);
		} else {
			res.redirect('/login');
		}
	});
	
	app.get('/home',  function(req, res){
		if (req.session.user) {
		//res.render('index', function(err, html) {
		//res.send(html);
		//});

			res.render('home',  {username: req.session.username, msg:req.session.msg});
		} else {
			res.redirect('/login');
		}
	});
	
	// Braintree client token generation.
	app.get("/client_token", function (req, res) {
		gateway.clientToken.generate({}, function (err, response) {
			res.send(response.clientToken);
		});
	});
	
	// Braintree recieve payment.
	app.post("/payment-methods", function (req, res) {
		var nonce = req.body.payment_method_nonce;
		// Use payment method nonce here (using test nonce for now)
		console.log("req: " + JSON.stringify(req.body));
		//console.log("checkout: " + JSON.stringify(req.body.checkout))
		//Submit the transaction
		var trans = new Transaction({user_id: req.session.user.toString()});
		// Set transaction fields
		trans.set('user_cart', req.body.user.user_cart );
		trans.set('email', req.body.user.email );
		trans.set('status', "pending" );
		trans.set('date', new Date()); 
		trans.set('credit', req.body.credit );
		trans.set('charge', req.body.charge );
		trans.set('coin', req.body.coin );
		trans.set('credit_preference', req.body.credit_preference );
		if( trans.credit_preference == 'Venmo' ) {
			trans.set('credit_preference', req.body.credit_preference );
			trans.set('venmo_name', req.body.venmo_name );
		}
		
		// Save the user
		User.findOne({ _id: req.session.user }).exec(function(err, user) {
			if (!user){
				res.json(404, {err: 'User Not Found.'});
			} else {
			if(user.credit_buffered == null || user.credit_buffered == 'NaN'){
				user.credit_buffered = 0;
			}
			if(user.coin_buffered == null || user.coin_buffered == 'NaN' ){
				user.coin_buffered = 0;
			}
			user.last_transaction = trans;
			user.credit_buffered = user.credit_buffered +  parseInt(req.body.credit);
			user.coin_buffered = user.coin_buffered + parseInt(req.body.coin);
			trans.set('charge', req.body.charge );
			user.cart = [];
			user.save();
			}	
		});
		
		// Save the transaction
		trans.save(function(err) {
			if (err){
				console.log(err);
				res.redirect('/');
			} else {
				
			}
		});
		
		//Submit the payment
		gateway.transaction.sale({
			amount: '10.00',
			paymentMethodNonce: nonce,
			}, function (err, result) {
			//console.log("payment result" + JSON.stringify(result));
		});
		res.redirect('/');
	});
	
	// Game service routes
	app.post('/upload/game', games.upload);
	app.post('/games/action', games.getActionGames);
	app.post('/games/shooter', games.getShooterGames);
	app.post('/games/family', games.getFamilyGames);
	app.post('/games/racing', games.getRacingGames);
	app.post('/games/fighting', games.getFightingGames);
	app.get('/games/titles', games.getAllTitles);
	app.get('/games/actoincount', games.actionCount);
	app.get('/games/profile', games.getGameProfile);
	app.post('/game', games.game);
	app.post('/games/update', games.update);
	
	// User service routes
	app.post('/signin2', users.signup2);
	app.post('/signup', users.signup);
	app.post('/signin', users.signin);
	app.post('/signout', users.signout);
	app.post('/user/addGame', users.addToCart);
	app.post('/user/addCredit', users.creditUser);
	app.post('/user/addCoin', users.coinUser);
	app.post('/user/removeGame', users.removeFromCart);
	app.post('/submitTransaction', users.submitTransaction);
	app.post('/user/update', users.updateUser);
	
	app.get('/user/profile', users.getUserProfile);
	app.get('/user/transactions', users.getPendingTransForUser);
	app.get('/auth/twitter', users.twitter);
	app.get('/auth/twitter/return', users.twitterReturn);
	app.get('/user/clearLastTransaction', users.clearLastTransaction);

	
	// Passport (Social media authentication) staging
	var passport = require('passport'), FacebookStrategy = require('passport-facebook').Strategy;		
	passport.use(new FacebookStrategy({
		clientID: '1610215232526663',
		clientSecret: 'ddc4a674462c056226bd1717e3b8f73f',
		callbackURL: "/auth/facebook/callback",
		passReqToCallback: true
	},
	function(req, accessToken, refreshToken, profile, done) {
		// Look for the user
		console.log("Looking for the user from facebook");
		users.findUser(req, profile, accessToken, refreshToken, function(err, result) { 
			console.log(result.session.user);
			done();
		});
	}));
	// Redirect the user to Facebook for authentication.  When complete,
	// Facebook will redirect the user back to the application at
	//     /auth/facebook/callback
	app.get('/auth/facebook', passport.authenticate('facebook'));

	// Facebook will redirect the user to this URL after approval.  Finish the
	// authentication process by attempting to obtain an access token.  If
	// access was granted, the user will be logged in.  Otherwise,
	// authentication has failed.
	app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/' }));
};