/* Server Config */

var express   = require('express');
var multer  = require('multer');
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

//var  uri = process.env.MONGOLAB_URI;  // remote location
var uri = "mongodb://local:password@localhost:27017/ogc"; // local connection
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

/* Configure multer for file uploads */
var done=false;
app.use(multer({ dest: './static/images/games',
 rename: function (fieldname, filename) {
    return filename;
  },
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  done=true;
}
}));
app.post('/api/photo',function(req,res){
	if(done==true){
		console.log(req.files);
		res.redirect('/');
	}
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
},function(err){
		console.log(err || 'connect-mongodb setup ok');
}));

app.use(cookieParser("keyboardcat"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

require('./routes')(app);
var port = process.env.PORT || 8080; // 80 for production
app.listen(port);