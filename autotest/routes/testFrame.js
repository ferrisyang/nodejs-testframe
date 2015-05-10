/*
 * GET users listing.
 */

var db = require('../models/db');
var models = require('../models/models');

var currentFlow = new models.ResponseFlow();

function testFrame(req, res) {
  generateFlowByName(function() {
    console.log("req = " + req);
    console.log("currentFlow = " + currentFlow.flow_name);
    console.log("group_id_sequence = " + currentFlow.group_id_sequence);
    res.render('home', {
      layout : 'main2',
      title : 'Express Handlebars'
    });

    // TBD: currentFlow.group_id_sequence will be cut by ","
    getAllResponsesFromGroup(currentFlow.group_id_sequence);

  });
}

function getAllResponsesFromGroup(groupId, callback) {
  db.getResponseGroupByID(groupId, function(error, row) {
    if (error) {
      console.error("Can not find ResponseGroup by id = " + groupId);
    } else {
      var unitIDList = [];
      var responseUnitList = [];
      if(row.subgroup_ids){
        var subgroup_ids = row.subgroup_ids.split(",");
        for(var i=0; i<subgroup_ids.length; i++){
          getAllResponsesFromGroup(groupId, callback);
        }
      }
      callback();
    }
  });
}

function getResponseUnitById (unitId, callback){
  db.getResponseUnitByID(unitId, function(error, row){
    if (error) {
      console.error("Can not find getResponseUnit By Id = " + unitId);
    } else {
      var responseUnit = new models.ResponseUnit();
      responseUnit.id = row.id;
      responseUnit.unit_type = row.unit_type;
      responseUnit.unit_name = row.unit_name;
      responseUnit.request_path = row.request_path;
      responseUnit.response_value = row.response_value;
      callback(responseUnit);
    }
  });
}

function generateFlowByName(callback) {
  db.getResponseFlowByName(start_flow_name, function(error, row) {
    if (error) {
      console.error("Can not find the Flow by name = " + start_flow_name);
    } else {
      currentFlow = {
        id : row.id,
        flow_name : row.flow_name,
        group_id_sequence : row.group_id_sequence,
        sequence_switch_request_path : row.sequence_switch_request_path,
        flow_repeat : row.flow_repeat
      };
      callback();
    }
  });
}

exports.testFrame = testFrame;