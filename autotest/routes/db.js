/*jshint es5: false */

var util = require('util');
var sqlite3 = require('sqlite3');
var uuid = require('node-uuid');

var sqlite3 = require('sqlite3').verbose();
var db = null;

function connect(callback) {
  db = new sqlite3.Database('./db/test.db', sqlite3.OPEN_READWRITE
      | sqlite3.OPEN_CREATE, function(err) {
    if (err) {
      util.log('FAIL on creating table ' + err);
      callback(err);
    }
  });
}

function disconnect() {
  db.close();
}

function del(tableName, id, callback) {
  db.run("delete from " + tableName + " where id = ?;", [ id ], function(err) {
    if (err) {
      util.log('FAIL to delete ' + err);
      callback(err);
    }
  });
}

function insertResponseUnit(unit_type, unit_name, request_path, response_value,
    callback) {
  db
      .run(
          "insert into response_unit (id, unit_type, unit_name, request_path, response_value) values (?,?,?,?,?);",
          [ uuid.v4(), unit_type, unit_name, request_path, response_value ],
          function(error) {
            if (error) {
              util.log('FAIL on add ' + error);
              callback(error);
            }
          });
}

exports.connect = connect;
exports.disconnect = disconnect;
exports.insertResponseUnit = insertResponseUnit;