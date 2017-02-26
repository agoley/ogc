// User Services 
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Game = mongoose.model('Game');
var Transaction = mongoose.model('Transaction');
var crypto = require('crypto');
var sha = require('sha256');
var twitterAPI = require('node-twitter-api'); // Twitter Auth
var rt, rts; // Twitter token and token secret
var twitter = new twitterAPI({
    consumerKey: 'rASJtoCIWHLvqMDgvx3VgdkLd',
    consumerSecret: '8FGvXSwJof0eoehWgVQ1EdcBAOmGIV56X0s9YHNWvHV589Suna',
    callback: 'http://onlinegamecash.com/auth/twitter/return'
});

// HELPER FUNCTIONS START

/**
 * Hash a string.
 * @param {String}
 */
function hashPW(pwd){
	console.log("pwd: " + pwd);
   return crypto.createHash('sha256').update(pwd).
          digest('base64').toString();
};

/**
 * Check if a user exists.
 * @param {String} User email. 
 * @return {Boolean} True if the user exists else false.
 */
var exists = function(email) {
	User.findOne({ email: email }).exec(function(err, user) {
		if(user){
			return true;
		} else {
			return false;
		}
	});
}

/**
 * Creates a user with the give credentials.
 * @param {Object} New user credentials. 
 * @param {function} (Optional) Callback.
 * @param {Object} request
 * @param {Object} response
 */
var create = function(creds, callback, req, res) {
		var result = {};
		result.data = new User();
		result.data.set('password', hashPW(creds.password));
		result.data.set('email', creds.email);
		result.data.save(function(err) {
			if (err){
				result.success = false;
				callback(result, req, res);
			} else {
				result.success = true;
				callback(result, req, res);;
			}
		});		
}

/**
 * Completes a transaction after any validation steps.
 * @param {Object} result of previous steps.
 * @param {Object} request
 * @param {Object} response
 */
var completeTransaction = function(result, req, res) {
	if (!result.success) {
		// Transaction failed validation 
		// console.log("completeTransaction: failed validation");
		res.json(404, {err: 'Transaction failed validation'});
		return;
	} else {
		if (result.data) {
			// A new user was created for this transaction
			// console.log("completeTransaction: setting user: " + JSON.stringify(result.data));
			setSessionUser(result.data, req.session);
		}
		
		// Create the transaction
		var trans = new Transaction();
		var orderDate = new Date();
		var orderNo = orderDate.valueOf();
		
		if (req.session.user) {
			trans.set('user_id', req.session.user.toString());
		} else {
			trans.set('user_id', "guest");
		}
	
		trans.set('user_cart', req.body.user_cart);
		trans.set('email', req.body.email);
		trans.set('status', "pending");
		trans.set('date', orderDate);
		trans.set('order_no', orderNo);
    
		// If there is credit, add credit to the users credit buffer.
		if (req.body.credit > 0) {
			trans.set('credit', req.body.credit );
			trans.set('credit_preference', req.body.credit_preference );
			if ( trans.credit_preference == 'Venmo' ) {
				trans.set('credit_preference', req.body.credit_preference );
				trans.set('venmo_name', req.body.venmo_name );
			}
		
			// TODO: clean this method. All user changes should be made in a single find.		
			// add credit 
			User.findOne({ _id: req.session.user }).exec(function(err, user) {
				if (user) {	
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
		if(req.body.coin > 0) {
			trans.set('coin', req.body.coin );
			// add coin 
			User.findOne({ _id: req.session.user }).exec(function(err, user) {
				if (!user){
					console.log("completeTransaction: user not found: " + JSON.stringify(req.session.user));
					res.status(404).json({err: 'User Not Found.'}); // TODO: set return flag
				} else {
					if(user.coin_buffered == null) {
						user.coin_buffered = 0;
					}	
					user.coin_buffered = user.coin_buffered + parseInt(req.body.coin);
					user.save();
				}	
			});
		}
	
		// If there is a charge, charge the user.
		if(req.body.charge > 0){
			trans.set('charge', req.body.charge );
			// Set mailing address
			// Set billing address
			// Set shipping type
			// Charge here
		}
	
		// update inventory
		synchronizeGameCounts(req.body.user_cart);
	
		// Save the transaction
		trans.save(function(err) {
			if (err){
				console.log("Error saving transaction: " + err);
				res.redirect('/');
     		} else {
				console.log("completeTransaction: successfully saved transaction");
       		res.json(trans); // TODO: pass new user back as well
			}
   	});	
	}
}

/**
 * Checks if any item in a cart is no longer in stock.
 * @param {Object} users cart
 * @return {Object} isInStock
 */
function isCartInStock(cart) {
	result = {
		isInStock: true
	};
	for (i = 0; i < cart.length; i++ ) {
		if (cart[i].type === 'sale') {
			Game.findOne({title: cart[i].title, console: cart[i].console})
				.exec(function(err, game) {
				if (game.quantity < 0) {
					result.isInStock =  false;
				} 
			});
		}
	}
	return result.isInStock;
}

/**
 * Sysnchronize inventory during a transaction.
 */
function synchronizeGameCounts(cart) {
	for (i = 0; i < cart.length; i++ ) {
		if (cart[i].type === 'sale') {
			Game.findOne({title: cart[i].title, console: cart[i].console})
				.exec(function(err, game) {
				game.quantity = game.quantity-1;
				game.save();
			});
		}
	}
}
   
/**
 * addSaleToCart
 * @param {Object} req
 * @param {Object} res
 */
function addSaleToCart(req, res) {
	User.findOne({ _id: req.session.user })
		.exec(function(err, user) {
		if (!user){
			res.json(404, {err: 'User Not Found.'});
		} else {
			var cart = user.cart;
			if(!cart){
				cart = [];
			} 
			var game = req.body.game;
			var item = 
				{ title: game.title,
				  console: game.console,
				  path: game.image_path,
				  quantity: 1,
				  cost: game.sell_price,
				  type: "sale"
				};				
			cart.push(item);
			user.cart = cart;
			user.save();
			res.json(user)
		}
	});
}

/**
 * addCreditToCart
 * @param {Object} req
 * @param {Object} res
 */
function addCreditToCart(req, res) {
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
			var game = req.body.game;
			var item = {
				title: game.title, 
				console: game.console, 
				path: game.image_path, 
				quantity: 1, 
				cost: game.buy_price, 
				type: 'ingest'
			};
			cart.push(item);
			user.cart = cart;
			user.save();
			res.json(user)
		}
	});
}

/**
 * addCoinToCart
 * @param {Object} req
 * @param {Object} res
 */
function addCoinToCart(req, res) {
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
			var game = req.body.game;
			cart.push({ 
				title: game.title, 
				console: game.console, 
				path: game.image_path, 
				quantity: 1, 
				cost: (game.buy_price + 5), 
				type: 'trade'});
			user.cart = cart;
			user.save();
			res.json(user)
		}
	});
}
	
/**
 * Sets the session user and username
 * @param {Object} user
 * @param {Object} session
 */
function setSessionUser(user, session) {
	session.user = user.id;
	session.username = user.username;
}

// HELPER FUNCTIONS END

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

/** 
 * Update a user
 * @param {Object} req
 * @param {Object} res
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
 *	Return last 5 transactions for a given user.
 *	@param {Object} req
 * @param {Object} res
 */
exports.getPendingTransForUser = function(req, res) {
	var session = req.session;
	if(session){
		Transaction.find({user_id: session.user})
		.sort('-date')
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

/** 
 *	Save a transaction to the database
 *	Coin/Credit/Charge a user
 *	@param {Object} req contains the transaction
 *	@return {Object} the transaction
 */
exports.submitTransaction = function(req, res) {
	var result = {};
	
	if (!req.body.policy_accepted) {
		result.success = false;
		console.log('submitTransaction: policy not accepted.');
	}
	
   if (!isCartInStock(req.body.user_cart)) {
		result.success = false;
		console.log('submitTransaction: An item in the users cart is out of stock.');
    }
	
	if (req.body.creds) {
		console.log("submitTransaction creds: " + req.body.creds.email);
		create(req.body.creds, completeTransaction, req, res); 
	} else {
		completeTransaction(result, req, res);
	}
}

// experimental
exports.addItemToCart = function(req, res) {
	if (req.body.type=='sale') {
		addSaleToCart(req, res);
	} else if (req.body.type=='ingest') {
		addCreditToCart(req, res);
	} else if (req.body.type=='trade') {
		addCoinToCart(req, res);
	} else {
		res.send(true);
	}
};

/**
 * Clear the sessions user and return to home.
 */
exports.signout = function(req, res) {
	console.log("cookies on signout: " + JSON.stringify(req.cookies));
	req.session.user = null;
	res.redirect('/');
}
	
/**
 * Save the new user and return to home logged in.
 */	
exports.signup = function(req, res){
   // Check if a user with this email exists
   User.findOne({ email: req.body.email }).exec(function(err, user) {
		if(err) {
			req.session.msg = err;
			console.log(err);
			res.redirect('/');
		} else {
			if(user){
				// User exists
				res.send("exists");
			} else {
				// Create the user
				var user = new User({username:req.body.username});
				user.set('password', hashPW(req.body.password));
				user.set('email', req.body.email);
				user.save(function(err) {
					if (err){
						console.log(err);
						res.end();
					} else {
						req.session.user = user.id;
						req.session.username = user.username;
						res.json(user);
					}
				});
			}
		}
	});
};

/**
 *	Return true if req.session.user is not null
 */
exports.isUserLoggedIn = function(req, res) {
	if(req.session.user){
		res.send("true");
	} else {
		res.send("false");
	}
};

/**
 * Verify credentials, set the session user and return. 
 */
exports.signin = function(req, res) {
	User.findOne({ email: req.body.email })
   .exec(function(err, user) {
		if(err) {
			req.session.msg = err;
			res.redirect('/');
		} else {
			if (user.password != null && user.password === hashPW(req.body.password.toString())) {
				setSessionUser(user, req.session);
				res.send(user);
			}
		}
	});
}

exports.getUserProfile = function(req, res) {
	console.log("Getting profile - session id: " + req.session.id + ", user: " + req.session.user);
	User.findOne({ _id: req.session.user })
	.exec(function(err, user) {
		if (err){
			res.json(404, {err: 'User Not Found.'});
		} else {
			if(user) {
				res.json(user);
			} else {
				res.end();
			}
		}
	});
};

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




