// Transaction Model
var mongoose = require('mongoose'),
	Schema  = mongoose.Schema;
var TransactionSchema = new Schema({
	user_email: String,
	user_cart: { type : Array , default : [] },
	credit: Number,
	cash: Number,
	coin: Number,
	confirmation_no: Number,
	shipping_type: String,
	shipping_status: String,
	shipping_id: String,
	status: String
});
mongoose.model('Transaction', TransactionSchema);