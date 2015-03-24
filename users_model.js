// User model
var mongoose = require('mongoose'),
	Schema  = mongoose.Schema;
var UserSchema = new Schema({
	username: String,
	password: String,
	email: { type: String, unique: true },
	access_token_twitter: String,
	access_token_secret_twitter: String,
	facebook_id: String,
	access_token_facebook: String,
	token_refresh_facebook: String
});
mongoose.model('User', UserSchema);