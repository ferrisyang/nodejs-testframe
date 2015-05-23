var db = require('../db/db');
var models = require('../models/models');
var moment = require('moment');

var currentGroupId = "";

function recordResponseUnit(unitKey, unitValue, callback) {
  var unit = new models.ResponseUnit();
  unit.unit_category = unitKey;
  unit.unit_name = unitKey;
  unit.unit_key = unitKey;
  unit.unit_value = unitValue;
  unit.unit_origin = '503'; // Data From BSOI (503)
  db.insertResponseUnit(unit, function(error, unitId) {
    if (error) {
      console.error('Error on insert Response unit, unit_key = ' + unitKey);
    } else {
      if (currentGroupId.length > 0) {
        db.addResponseGroupUnitIds(currentGroupId, unitId, function(error) {
          console.log("update group, add unitId = " + unitId);
          if (callback) {
            callback();
          }
        });
      } else {
        var group = new models.ResponseGroup();
        group.group_name = moment().format('YYYYMMDDHHmmss');
        group.response_unit_ids = unitId;
        group.is_order = true;
        db.insertResponseGroup(group, function(error, groupId) {
          currentGroupId = groupId;
          console.log("add group id = " + groupId);
          if (callback) {
            callback();
          }
        });
      }
    }
  });
}

exports.recordResponseUnit = recordResponseUnit;