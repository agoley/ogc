/* Server Config */

var express   = require('express');
var parseurl = require('parseurl');
var http = require("http");
var session = require("express-session");
var mongoose =  require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var app = express();

app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', req.headers.origin );
	res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    if (req.method === 'OPTIONS'){
        res.send(200);
    } else {
		next();
	}
});

var favicon = require('serve-favicon');
app.use(favicon(__dirname + '/static/images/logo-icon.ico'));

//var  uri = process.env.MONGOLAB_URI;
var uri = "mongodb://user:user@localhost:27017/testDB"; // local connection
app.engine('.html', require('ejs').__express);
app.use('/', express.static('./static'));
app.set('views', __dirname + '/static/views');
app.set('view engine', 'html');

mongoose.connect(uri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("Mongo successfully connected.");
});

require('./users_model.js');
require('./games_model.js');
require('./transaction_model.js');

var MongoStore = require('connect-mongo')(session);
var sessionStore = new MongoStore({ 
		mongooseConnection: mongoose.connection,
		ttl: 5 *24 * 60 * 60 
	});
app.use(session({
    secret: "keyboardcat", 
    cookie: { maxAge: 1000 * 60 * 60 * 24, path : '/', secure: false},
	store: sessionStore,
	saveUninitialized:false,
	resave: false, 
	unset: 'destroy'
}));

app.use(cookieParser("keyboardcat"));
/*app.use(session({
	secret: "keyboardcat",
	store:new MongoStore({
          db: 'heroku_d17q9k0c',
          mongooseConnection:mongoose.connection, 
          collection: 'sessions', 
          stringify:false,
          autoReconnect:true,
          touchAfter: 24 * 3600 // time period in seconds
	}),
    cookie: { name: 'connect.sid', maxAge: 1000 * 60 * 60 * 24, secure: false, httpOnly: false},
	saveUninitialized: false,
	resave: false,
	unset: 'destroy'
	},function(err){
		console.log(err || 'connect-mongodb setup ok');
}));*/

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

require('./routes')(app);
var port = process.env.PORT || 80;
app.listen(port);