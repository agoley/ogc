/* Server Config */

/* Define dependencies */
var express = require('express');
var app = express();
var multer  = require('multer');
var bodyParser = require('body-parser');
app.engine('.html', require('ejs').__express);
var mongoose =  require('mongoose');
var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');

app.use(express.favicon());
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

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("Mongo successfully connected.");
});

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
app.use(session({
    secret: "foo",
    store: new MongoStore({ mongooseConnection: mongoose.connection, collection: 'sessions' })
}));

app.use(bodyParser());
app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*' );
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
setInterval(sessionCleanup(), 36000000);*/

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