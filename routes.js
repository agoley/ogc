var crypto = require('crypto');
var express = require('express');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Game = mongoose.model('Game');
var crypto = require('crypto');
function hashPW(pwd){
   return crypto.createHash('sha256').update(pwd).
          digest('base64').toString();
};

module.exports = function(app) {
	var users = require('./user_services');
	var games = require('./game_services');
	app.use('/static', express.static( './static'));
	
	app.get('/', function(req, res){
     //console.log("redirecting");
	 if (req.session.user)	 {
		 //console.log("sending to /home");
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
	
	app.get('/home',  function(req, res){
		if (req.session.user) {
			res.render('home',  {username: req.session.username, msg:req.session.msg});
		} else {
			res.redirect('/login');
		}
	});
	
	// Game service routes
	app.post('/upload/game', games.upload);
	app.post('/games/action', games.getActionGames);
	
	// User authentication routes
	app.post('/signup', users.signup);
	app.post('/signin', users.signin);
	app.post('/signout', users.signout);
	app.get('/user/profile', users.getUserProfile);
	app.get('/auth/twitter', users.twitter);
	app.get('/auth/twitter/return', users.twitterReturn);
	
	// Passport (Social media authentication) staging
	var passport = require('passport'), FacebookStrategy = require('passport-facebook').Strategy;		
	passport.use(new FacebookStrategy({
		clientID: '1610215232526663',
		clientSecret: 'ddc4a674462c056226bd1717e3b8f73f',
		callbackURL: "/auth/facebook/callback",
		passReqToCallback: true
	},
	function(req, accessToken, refreshToken, profile, done) {
		//console.log(req);
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