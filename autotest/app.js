/**
 * Module dependencies.
 */

var express = require('express');
var exphbs = require('express-handlebars');
var routes = require('./routes');
var testFrame = require('./routes/testFrame');
var db = require('./models/db');
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

start_flow_name = process.argv[2];

app.get('/', testFrame.testFrame);
app.get('/admin', routes.index);

http.createServer(app).listen(
    app.get('port'),
    function() {
      if(!start_flow_name){
        start_flow_name = "default_flow";
      }
      console.log('Start Flow Name: ' + start_flow_name);
      console.log('Express server listening on port ' + app.get('port'));
//      db.getResponseUnitAllInArray(function(error, row){
//        console.log("getResponseUnitAllInArray = " +  row);
//      });
//      db.getResponseUnitAllforEach(function(error, responseUnitVO){
//        console.log("getResponseUnitAllforEach = {id:?, unit_type:?, unit_name:?, request_path:?, response_value:?}", responseUnitVO.id,
//            responseUnitVO.unit_type, responseUnitVO.unit_name, responseUnitVO.request_path, responseUnitVO.response_value);
//      });
      
      
      
    });
