// Game model
var mongoose = require('mongoose'),
	Schema  = mongoose.Schema;
var GameSchema = new Schema({
	title: String,
	console: String,
	developer: String,
	release_date: Date,
	genre: String,
	buy_price: Number,
	sell_prcoe: Number
});
mongoose.model('Game', GameSchema);