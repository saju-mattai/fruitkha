var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db = require('./config/connection')
var session = require('express-session')
// var fileupload=require('express-fileupload')

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');

var app = express();  

// view engine setup
app.set('views', [__dirname + '/views/user', __dirname + '/views/admin'])
app.set('view engine', 'ejs'); 
  
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:'key',cookie:{maxAge:6000000}}))
// app.use(fileupload())

// db-connection 
db.connect((err)=>{
  if(err) console.log('connection err'+err);
  else console.log('database connected');
})
//back-buttom
app.use(function(req, res, next) {  
  if (!req.user) {
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.header('Expires', '-1');
      res.header('Pragma', 'no-cache');
  }
    next();
}); 

app.use('/', usersRouter);
app.use('/', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('404');
});

module.exports = app;
