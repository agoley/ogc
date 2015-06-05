// Game model
var mongoose = require('mongoose'),
	Schema  = mongoose.Schema;
var GameSchema = new Schema({
	title: String,
	console: String,
	developer: String,
	summary: String,
	release_date: Date,
	genre: [String],        
	buy_price: Number,
	sell_price: Number,
	image_path: String,
	quantity: Number
});
mongoose.model('Game', GameSchema);