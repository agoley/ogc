/* Server Config */

/* Define dependencies */
var express = require('express');
var multer  = require('multer');
var app = express();
var bodyParser = require('body-parser');
app.engine('.html', require('ejs').__express);
var mongoose =  require('mongoose');
var cookieParser = require('cookie-parser');
app.use(bodyParser());
app.use(cookieParser());
var expressSession = require('express-session');
var mongoStore = require('connect-mongo')({session: expressSession});
var mongoose = require('mongoose');
require('./users_model.js');
require('./games_model.js');
var uri = "mongodb://user:user@localhost:27017/testDB";
var options = { db: { w: 1, native_parser: false }, server: { poolSize: 5, socketOptions: { connectTimeoutMS: 500 }, auto_reconnect: true }, replSet: {}, mongos: {} };
var conn = mongoose.connect(uri,options);

/* Configure multer for file uploads */
var done=false;
app.use(multer({ dest: './uploads/',
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

app.use(expressSession({
	secret: 'SECRET',
	cookie: {maxAge: 60*60*1000},
	db: new mongoStore({
		mongooseConnection: mongoose.connection,
		collection: 'sessions'
	})
}));
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    if ('OPTIONS' == req.method){
        return res.sendStatus(200);
    }
    next();
});
app.use('/', express.static('./static'));
app.set('views', __dirname + '\\static\\views');
app.set('view engine', 'html');

require('./routes')(app);

app.listen(80);