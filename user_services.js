/* User Services */
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Transaction = mongoose.model('Transaction');
var crypto = require('crypto');
var sha = require('sha256');
function hashPW(pwd){
	console.log("pwd: " + pwd);
   return crypto.createHash('sha256').update(pwd).
          digest('base64').toString();
};

/*function hashPW(pwd) {
	return sha(pwd);
};*/

exports.removeFromCart = function(req, res) {
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

/** Update a user
* Req: user information to update with.
*/
exports.updateUser = function(req, res) {
	User.findOne({ _id: req.session.user }).exec(function(err, user) {
		if (!user){
			res.json(404, {err: 'User Not Found.'});
		} else {
			//var ma = user.mailing_address;
			user.email = req.body.email;
			
			user.set('mailing_address.lineOne', req.body.mailing_address.lineOne);
			user.set('mailing_address.lineTwo', req.body.mailing_address.lineTwo);
			user.set('mailing_address.city', req.body.mailing_address.city);
			user.set('mailing_address.state', req.body.mailing_address.state);
			user.set('mailing_address.zip', req.body.mailing_address.zip);
			
			//user.mailing_address = ma;
			console.log(user);
			// Save the changes.
			user.save(function (err) {
				if (err) { 
					console.log(err);
				} else {
					console.log("Successfully saved user changes");
					res.json(user)
				}
			});	
		}
	});
}

exports.clearLastTransaction = function(req, res) {
	if(req.session.user) {
		User.findOne({ _id: req.session.user }).exec(function(err, user) {
			if (!user){
				res.json(404, {err: 'User Not Found.'});
			} else {
				console.log('clearing last transaction.');
				user.set('last_transaction', null);
				user.save(function (err) {
					if (err) { 
						console.log(err);
					} else {
						console.log("Successfully saved user changes");
						res.json(user)
					}
				});	
			}
		});
	} else {
		res.end();
	}
}

/**
	Return all pending transactions for a given user.
	Passed in the request is a user id.
*/
exports.getPendingTransForUser = function(req, res) {
	var session = req.session;
	if(session){
		Transaction.find({ user_id: session.user, status: 'pending' })
		.limit(5)
		.exec(function(err, data) {
			if (err){
				res.json(404, {err: 'User Not Found.'});
			} else {
				res.json(data);
			}
		});
	} else {
		res.end();
	}
};

/* 
	Save a transaction to the database
	Coin/Credit/Charge a user
	Req contains the transaction
	Return the transaction
*/
exports.submitTransaction = function(req, res) {
	// If policy accepted
	var trans = new Transaction({user_id: req.session.user.toString()});
	// Set transaction fields
	trans.set('user_cart', req.body.user_cart );
	trans.set('email', req.body.email );
	trans.set('status', "pending" );
	trans.set('date', new Date());
	
	// If there is credit, add credit to the users credit buffer.
	if(req.body.credit != null){
		trans.set('credit', req.body.credit );
		trans.set('credit_preference', req.body.credit_preference );
		if( trans.credit_preference == 'Venmo' ) {
			trans.set('credit_preference', req.body.credit_preference );
			trans.set('venmo_name', req.body.venmo_name );
		}
		
		//TODO: clean this method. All user changes should be made in a single find.
		
		// add credit 
		User.findOne({ _id: req.session.user }).exec(function(err, user) {
			if (!user){
				res.json(404, {err: 'User Not Found.'});
			} else {
			if(user.credit_buffered == null){
				user.credit_buffered = 0;
			}
			user.credit_buffered = user.credit_buffered +  parseInt(req.body.credit);
			user.cart = [];
			user.save();
			}	
		});
	}
	
	// If there is coin, add coin to the users coin buffer
	if(req.body.coin != null) {
		trans.set('coin', req.body.coin );
		
		// add coin 
		User.findOne({ _id: req.session.user }).exec(function(err, user) {
			if (!user){
				res.json(404, {err: 'User Not Found.'});
			} else {
			if(user.coin_buffered == null){
				user.coin_buffered = 0;
			}
			user.coin_buffered = user.coin_buffered + parseInt(req.body.coin);
			user.save();
			}	
		});
	}
	
	// If there is a charge, charge the user.
	if(req.body.charge != null){
		trans.set('charge', req.body.charge );
		// Set mailing address
		// Set billing address
		// Set shipping type
		// Charge here
	}
	
	// Save the transaction
	trans.save(function(err) {
     if (err){
		console.log(err);
		res.redirect('/');
     } else {
       res.json(trans);
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
			//user.credit_buffered = user.credit_buffered + req.body.buy_price;
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
			//user.coin_buffered = user.coin_buffered + (req.body.buy_price + 5);
			user.save();
			res.json(user)
		}
	});
}

exports.signout = function(req, res) {
    res.clearCookie('connect.sid', { path: '/' }); 
    res.send('removed session', 200); // tell the client everything went well
};
	
//sign up	
exports.signup = function(req, res){
   console.log("body:" + JSON.stringify(req.body));
   console.log(req.body.password);
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

// return true if req.session.user is not null
exports.isUserLoggedIn = function(req, res) {
	if(req.session.user){
		res.send("true");
	} else {
		res.send("false");
	}
};

// Set the sessions user and return 
exports.signin2 = function(req, res) {
	console.log("req body on sign in:" + req.body.email);
	User.findOne({ email: req.body.email })
   .exec(function(err, user) {
		if(err) {
			req.session.msg = err;
			//res.send();
			res.redirect('/');
		} else {
			console.log("Found on sign in: " + user );
			if (user.password != null && user.password === hashPW(req.body.password.toString())) {
				req.session.user = user.id;
				req.session.username = user.username;
				//res.cookie(req.session.id);
				console.log("Session user: " + req.session.user + ", and session id: " + req.session.id);
				res.send(user);
			}
		}
	});
	//res.send(200);
	/*User.findOne({ email: req.body.email })
   .exec(function(err, user) {
     if (!user){
       err = 'User Not Found.';
	   console.log("no user found");
     } else { 
		if(err){
			req.session.regenerate(function(){ 
				req.session.msg = err;
				//res.send();
				res.redirect('/');
			});
		} else {
			console.log("user: " + user);
			if (user.password != null && user.password === hashPW(req.body.password.toString())) {
				req.session.regenerate(function(){
					req.session.user = user.id;
					req.session.username = user.username;
					req.session.msg = 'Authenticated as ' + user.username;
					console.log("authenticated user id: " + JSON.stringify(user))
					req.session.save();
					req.send(user);
				});
			} 
		}
	} 
   });*/
}


 exports.signin = function(req, res){
	//console.log("req body: " +  Object.values(req));
	//var postReq = JSON.parse(Object.keys(req.body));
	//console.log(postReq);
   User.findOne({ email: req.body.email })
   .exec(function(err, user) {
     if (!user){
       err = 'User Not Found.';
	   console.log("no user found");
     } else { 
		if(err){
			req.session.regenerate(function(){ 
				req.session.msg = err;
				//res.send();
				res.redirect('/login');
			});
		} else {
			console.log("user: " + user);
			if (user.password != null && user.password === hashPW(req.body.password.toString())) {
				req.session.regenerate(function(){
					req.session.user = user.id;
					req.session.username = user.username;
					req.session.msg = 'Authenticated as ' + user.username;
					console.log("authenticated user id: " + JSON.stringify(user))
					res.redirect('/');
				});
			} 
		}
	} 
   });
};

exports.getUserProfile = function(req, res) {
	console.log("Getting profile - session id: " + req.session.id + ", user: " + req.session.user);
	User.findOne({ _id: req.session.user })
	.exec(function(err, user) {
		if (err){
			res.json(404, {err: 'User Not Found.'});
		} else {
			if(user) {
				//res.cookie(req.session.id);
				res.json(user);
			} else {
				res.end();
			}
		}
	});
};

/* Twitter Authorization */
var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: 'rASJtoCIWHLvqMDgvx3VgdkLd',
    consumerSecret: '8FGvXSwJof0eoehWgVQ1EdcBAOmGIV56X0s9YHNWvHV589Suna',
    callback: 'http://onlinegamecash.com/auth/twitter/return'
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




