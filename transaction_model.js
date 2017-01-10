// Transaction Model
var mongoose = require('mongoose'),
	Schema  = mongoose.Schema;
var TransactionSchema = new Schema({
	user_id: String,
	order_no: String,
	user_cart: { type : Array , default : [] },
	credit: Number,
	charge: Number,
	coin: Number,
	shipping_type: String,
	shipping_status: String,
	shipping_id: String,
	status: String,
	date: Date,
	policy_accepted: Boolean,
	credit_preference: String,
	venmo_name: String,
	billing_address: { type : Array , default : [] },
	mailing_address: { type : Array , default : [] },
	email: String,
	billing_info: { type : Array , default : [] }
});
mongoose.model('Transaction', TransactionSchema);