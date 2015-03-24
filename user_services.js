/* User Services */
var mongoose = require('mongoose');
var User = mongoose.model('User');
var crypto = require('crypto');
function hashPW(pwd){
   return crypto.createHash('sha256').update(pwd).
          digest('base64').toString();
};
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
							console.log("found user, saving and creatin session");
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




