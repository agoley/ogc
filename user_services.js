/* User Services */
var mongoose = require('mongoose');
var User = mongoose.model('User');
var crypto = require('crypto');
function hashPW(pwd){
   return crypto.createHash('sha256').update(pwd).
          digest('base64').toString();
};

exports.removeFromCart = function(req, res) {
	console.log(req.body);
	User.findOne({ _id: req.session.user })
	.exec(function(err, user) {
		if (!user){
			res.json(404, {err: 'User Not Found.'});
		} else {
			var cart = user.cart;
			if(!cart){
				cart = [];
			} 
			// Check if the game exists in the cart
			for(var i = 0; i < cart.length; i++) {
				if( cart[i].title == req.body.title && cart[i].console == req.body.console ) {
					//if(cart[i].quantity)
					cart.splice(i, 1);
					i = cart.length;
				}
			}
			user.cart = cart;
			user.save();
			console.log(user);
			res.json(user)
		}
	});
}

exports.addToCart = function(req, res) {
	User.findOne({ _id: req.session.user })
	.exec(function(err, user) {
		if (!user){
			res.json(404, {err: 'User Not Found.'});
		} else {
			var cart = user.cart;
			if(!cart){
				cart = [];
			} 
			// Check if the game exists in the cart
			/*var exists = false;
			for(var i = 0; i < cart.length; i++) {
				if( cart[i].title == req.body.title && cart[i].console == req.body.console ) {
					cart[i].quantity = cart[i].quantity + 1;
					exists = true;
				}
			}
			if(!exists) {
				cart.push({ title: req.body.title, console: req.body.console, path: req.body.image_path, quantity: 1, cost: req.body.sell_price});
			}
			*/
			var item = { title: req.body.title, console: req.body.console, path: req.body.image_path, quantity: 1, cost: req.body.sell_price, type: "sale"};
			cart.push(item);
			user.cart = cart;
			user.save();
			res.json(user)
		}
	});
};

/*
Descrip: 
	This service adds credit to a users account. Credit is gained when a user sells a game to ogc.
	The credit is placed on hold until the game is mailed to ogc and verified.
Return:
	Returns the updated user.
*/
exports.creditUser = function(req, res) {
	User.findOne({ _id: req.session.user })
	.exec(function(err, user) {
		if (!user){
			res.json(404, {err: 'User Not Found.'});
		} else {
			var cart = user.cart;
			if(!cart){
				cart = [];
			} 
			if(!user.credit_buffered){
				user.credit_buffered = 0;
			}
			cart.push({ title: req.body.title, console: req.body.console, path: req.body.image_path, quantity: 1, cost: req.body.buy_price, type: 'ingest'});
			user.cart = cart;
			user.credit_buffered = user.credit_buffered + req.body.buy_price;
			user.save();
			res.json(user)
		}
	});
}

/*
Descrip: 
	This service adds coin to a users account. Coin is gained when a user trades a game to ogc.
	The coin is placed on hold until the game is mailed to ogc and verified.
Return:
	Returns the updated user.
*/
exports.coinUser = function(req, res) {
	User.findOne({ _id: req.session.user })
	.exec(function(err, user) {
		if (!user){
			res.json(404, {err: 'User Not Found.'});
		} else {
			var cart = user.cart;
			if(!cart){
				cart = [];
			} 
			if(!user.coin_buffered){
				user.coin_buffered = 0;
			}
			cart.push({ title: req.body.title, console: req.body.console, path: req.body.image_path, quantity: 1, cost: (req.body.buy_price + 5), type: 'trade'});
			user.cart = cart;
			user.coin_buffered = user.coin_buffered + (req.body.buy_price + 5);
			user.save();
			res.json(user)
		}
	});
}

exports.signout = function(req, res) {
	req.session.destroy(function(){
		res.redirect('/');
    });
};
	   
exports.signup = function(req, res){
   var user = new User({username:req.body.username});
   user.set('password', hashPW(req.body.password));
   user.set('email', req.body.email);
   user.save(function(err) {
     if (err){
		console.log(err);
		res.redirect('/login');
     } else {
       req.session.user = user.id;
       req.session.username = user.username;
       req.session.msg = 'Authenticated as ' + user.username;
       res.redirect('/');
     }
   });
};

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

exports.getUserProfile = function(req, res) {
	User.findOne({ _id: req.session.user })
	.exec(function(err, user) {
		if (!user){
			res.json(404, {err: 'User Not Found.'});
		} else {
			res.json(user);
		}
	});
};

/* Twitter Authorization */
var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: 'rASJtoCIWHLvqMDgvx3VgdkLd',
    consumerSecret: '8FGvXSwJof0eoehWgVQ1EdcBAOmGIV56X0s9YHNWvHV589Suna',
    callback: 'http://127.0.0.1/auth/twitter/return'
});

var rt, rts;
exports.twitter =  function(req, res){
		// Get a request token
		twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
			if (error) {
			console.log("Error getting OAuth request token : " + error);
		} else {
			//store token and tokenSecret somewhere, you'll need them later; redirect user
			rt = requestToken;
			rts = requestTokenSecret;
			res.redirect(twitter.getAuthUrl(requestToken));
		}
	});
};

exports.twitterReturn =  function(req, res){
	//console.log(Object.keys(res));
	//console.log(res.req.query);
	var oauth_token = res.req.query.oauth_token;
	var oauth_verifier = res.req.query.oauth_verifier;
	twitter.getAccessToken(rt, rts, oauth_verifier, function(error, accessToken, accessTokenSecret, results) {
		if (error) {
			console.log(error);
		} else {
			//store accessToken and accessTokenSecret somewhere (associated to the user) 
			//Step 4: Verify Credentials belongs here 
			twitter.verifyCredentials(accessToken, accessTokenSecret, function(error, data, response) {
				if (error) {
				//something was wrong with either accessToken or accessTokenSecret 
				//start over with Step 1 
				console.log("something was wrong with either accessToken or accessTokenSecret");
				} else {
					//accessToken and accessTokenSecret can now be used to make api-calls (not yet implemented) 
					//data contains the user-data described in the official Twitter-API-docs 
					//you could e.g. display his screen_name 
					console.log("looking for user");
					User.findOne({ username: data["screen_name"]}).exec( function(err, user) {
						if (!user){
							console.log("didnt find user, creating one: " + data );
							var twitUser = new User({username:data["screen_name"]});
							twitUser.set('email', data["screen_name"]);
							twitUser.set('access_token_twitter', accessToken);
							twitUser.set('access_token_secret_twitter', accessTokenSecret);
							console.log("saving new user");
							twitUser.save(function(err) {
								if (err){
									console.log("save failed: " + err);
									res.redirect('/login');
								} else {
									req.session.user = twitUser.id;
									req.session.save(function(){
										console.log("built session redirecting");
										res.redirect('/');
									});
								}
							});
					    } else {
							console.log("found user, saving and creating session");
							user.set('access_token_twitter', accessToken);
							user.set('access_token_secret_twitter', accessTokenSecret);
							user.save(function(err) {
								if(err){
									console.log("An error occured updating user tokens");
								} else {
									req.session.user = user.id;
									req.session.username = user.username;
									req.session.msg = 'Authenticated as ' + user.username;
									req.session.save(function(){
										console.log("In save: " + req.session.user);
										res.redirect('/');
									});
								}
							}); 
						}
						if(err){
							console.log("an error occured" + err);
							req.session.regenerate(function(){
								req.session.msg = err;
								res.redirect('/login');
							});
						}
					});
				}
			});
		}
	});
};

exports.findUser = function(req, profile, at, rt, fn) {
	User.findOne({ facebook_id:profile.id }).exec( function(err, user) {
		if (!user){
			console.log("Did not find the user, creating a new one");
			var faceUser = new User({facebook_id:profile.id});
			faceUser.set('access_token_facebook', at);
			faceUser.set('token_refresh_facebook', rt);
			faceUser.set('email', profile.id);
			faceUser.save(function(err) {
				if (err){
					console.log("An error occured saving the new user from facebook login");
				} else {
					req.session.user = faceUser.id;
					req.session.save(function() {
						console.log("In save: " + req.session.user);
					});
					return fn(null, req);
				}
			});
		} else {
			console.log("found user, updating and logging in user");
			user.set('access_token_facebook', at);
			user.set('token_refresh_facebook', rt);
			user.save(function(err) {
				if(err){
					console.log("An error occured updating user tokens");
				} else {
					console.log("creating session");
					var temp = req.session.passport;
					console.log("user: " + user.id);
					req.session.user = user.id;
					req.session.username = user.username;
					req.session.msg = 'Authenticated as ' + user.username;
					req.session.save(function() {
						console.log("In save: " + req.session.user);
					});
					return fn(null, req);
				}
			}); 
		}
	})
};




