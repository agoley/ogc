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
	token_refresh_facebook: String,
	coin_available: { type: Number, default: 0 },
	coin_buffered: { type: Number, default: 0 },
	admin: Boolean,
	cart:  { type : Array , default : [] },
	credit_available: { type: Number, default: 0 },
	credit_buffered: { type: Number, default: 0 },
	billing_address: {},
	last_transaction: {},
	mailing_address: {
					lineOne: String,
					lineTwo: String,
					city: String,
					state: String,
					zip: Number
					},
	billing_info: { type : Array , default : [] }
});
mongoose.model('User', UserSchema);