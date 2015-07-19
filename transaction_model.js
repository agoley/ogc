// Transaction Model
var mongoose = require('mongoose'),
	Schema  = mongoose.Schema;
var TransactionSchema = new Schema({
	user_id: ObjectId,
	user_cart: { type : Array , default : [] },
	credit: Number,
	cash: Number,
	coin: Number,
	shipping_type: String,
	shipping_status: String,
	shipping_id: String,
	status: String,
	date: Date,
	policy_accepted: Boolean,
	credit_preference: String,
	venmo_name: String,
	email: String
});
mongoose.model('Transaction', TransactionSchema);