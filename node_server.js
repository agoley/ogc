/* Server Config */

/* Define dependencies */
/*var express = require('express');
var app = express();
var multer  = require('multer');
app.engine('.html', require('ejs').__express);
var mongoose =  require('mongoose');
//var expressSession = require('express-session');
//var mongoStore = require('connect-mongo')({session: expressSession});
var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');
var favicon = require('serve-favicon');
app.use(favicon(__dirname + '/static/images/logo-icon.ico'));
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
//app.use(cookieParser('foo'));
//app.use(bodyParser.urlencoded());
//app.use(bodyParser.json());

app.use('/', express.static('./static'));
//app.set('views', __dirname + '\\static\\views');
app.set('views', __dirname + '/static/views');
app.set('view engine', 'html');

//var uri = "mongodb://user:user@localhost:27017/testDB";
//var options = { db: { w: 1, native_parser: false }, server: { poolSize: 5, socketOptions: { connectTimeoutMS: 9500 }, auto_reconnect: true }, replSet: {}, mongos: {} };
var  uri = process.env.MONGOLAB_URI;
var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },  
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };    

var mongooseUri = uriUtil.formatMongoose(uri);
mongoose.connect(mongooseUri);
//var conn = mongoose.connect(uri,options);
//mongoose.connect(mongooseUri, options); 
//var conn = mongoose.connection;  

//var https = require('https');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("Mongo successfully connected.");
});

require('./users_model.js');
require('./games_model.js');
require('./transaction_model.js');

/*app.use(session({
    secret: "foo",
	resave: true,
    cookie: { secure: false, httpOnly: false },
    store: new MongoStore({ mongooseConnection: mongoose.connection, collection: 'sessions' })
}));*/

/*app.use(session({
	secret: 'SECRET',
	cookie: { secure: false },
	cookie: {maxAge: 60*60*1000},
	store: new MongoStore({
		mongooseConnection: mongoose.connection,
		collection: 'sessions'
	})
}));*/

/* Configure multer for file uploads 
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

// Picture api
app.post('/api/photo',function(req,res){
	if(done==true){
		console.log(req.files);
		res.redirect('/home');
	}
});

/*app.use(expressSession({
	secret: 'SECRET',
	cookie: {maxAge: 60*60*1000},
	db: new mongoStore({
		mongooseConnection: db,
		collection: 'sessions'
	})
}));*/



/*Clean up sessions
function sessionCleanup() {
    expressSession.all(function(err, sessions) {
        for (var i = 0; i < sessions.length; i++) {
            sessionStore.get(sessions[i], function() {} );
        }
    });
}
setInterval(sessionCleanup(), 36000000);

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var sessionStore = new MongoStore({ 
		mongooseConnection: mongoose.connection,
		ttl: 5 *24 * 60 * 60 
	});
/*app.use(session({
	secret: 'foo',
    cookie: {httpOnly: false, secure: false, maxAge: null },
	//saveUninitialized: false, // don't create session until something stored
    //resave: false, //don't save session if unmodified
    store: new MongoStore({ 
		mongooseConnection: mongoose.connection,
		ttl: 5 *24 * 60 * 60 
	})
}));

var sessionOpts = {
	store: sessionStore,
	secret: 'foo',
	cookie: { httpOnly: false, maxAge: 2419200000 }
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser('foo'));
app.use(session(sessionOpts));
app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', 'http://www.onlinegamecash.com' );
	res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    if (req.method === 'OPTIONS'){
        res.send(200);
    } else {
		next();
	}
});
require('./routes')(app);
var port = process.env.PORT || 3000;
app.listen(port);


/* https.createServer(options, app).listen(443);
var https = require('https');
var fs = require('fs');

var options = {
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
};

https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(8000); */


var express   = require('express');
var parseurl = require('parseurl');
var http = require("http");
var session = require("express-session");
var mongoose =  require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var app = express();


var  uri = process.env.MONGOLAB_URI;
app.engine('.html', require('ejs').__express);
app.use('/', express.static('./static'));
app.set('views', __dirname + '/static/views');
app.set('view engine', 'html');

app.use(cookieParser("keyboardcat"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(session({
    secret: "keyboardcat",
	rolling: true,
    resave: true,
    saveUninitialized: false,
    cookie: { 
		path: '/',
        domain: 'onlinegamecash.com',
        secure: false,
        maxAge: null
    }
}));

mongoose.connect(uri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("Mongo successfully connected.");
});

require('./users_model.js');
require('./games_model.js');
require('./transaction_model.js');

app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', 'http://www.onlinegamecash.com' );
	res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    if (req.method === 'OPTIONS'){
        res.send(200);
    } else {
		next();
	}
});

require('./routes')(app);
var port = process.env.PORT || 3000;
app.listen(port);