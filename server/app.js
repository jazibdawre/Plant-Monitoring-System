var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//Routes
var indexRouter = require('./routes/index');
var actionRouter = require('./routes/actionRouter');
var settingsRouter = require('./routes/settingsRouter');
var limitsRouter = require('./routes/limitsRouter');
var statusRouter = require('./routes/statusRouter');
var latestRouter = require('./routes/latestRouter');
var logsRouter = require('./routes/logsRouter');
var espRouter = require('./routes/espRouter');

//MongoDB
var config = require('./config');
const mongoose = require('mongoose');
const url = config.mongoUrl;
const connect = mongoose.connect(url);
connect.then((db) => {
  console.log("Connected to Mongo Database");
}, (err) => { console.log(err); });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//Website
app.use(express.static(path.join(__dirname, 'public')));
//Default
app.use('/', indexRouter);
//API
app.use("/action", actionRouter);
app.use("/settings", settingsRouter);
app.use("/limits", limitsRouter);
app.use("/status", statusRouter);
app.use("/latest", latestRouter);
app.use("/logs", logsRouter);
//ESP data entry
app.use("/esp", espRouter);

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
  res.render('error');
});

module.exports = app;
