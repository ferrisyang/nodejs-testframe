/**
 * Module dependencies.
 */

var express = require('express');
var exphbs = require('express-handlebars');
var routes = require('./routes');
var testFrame = require('./routes/testFrame');
var db = require('./routes/db');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.engine('.hbs', exphbs({
  defaultLayout : 'main',
  extname : '.hbs'
}));
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', '.hbs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', testFrame.testFrame);
app.get('/admin', routes.index);

http.createServer(app).listen(
    app.get('port'),
    function() {
      console.log('Express server listening on port ' + app.get('port'));
      db.connect(function(err) {
        console.error(err);
      });
      db.insertResponseUnit("unit_type", "unit_name", "request_path",
          "response_value", function(err) {
            console.error(err);
          });
    });
