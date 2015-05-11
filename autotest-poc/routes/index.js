Array.prototype.unique = function() {
  var temp = new Array();
  this.sort();
  for (i = 0; i < this.length; i++) {
    if (this[i] == this[i + 1]) {
      continue;
    }
    temp[temp.length] = this[i];
  }
  return temp;
}

var express = require('express');
var router = express.Router();

var db = require('../db/db');
var models = require('../models/models');
var customUtils = require('../utils/utils');

var currentFlow = new models.ResponseFlow();
var currentResponseMap = new customUtils.Map();
var currentResponseCallMap = new customUtils.Map();

var groupIdSequenceArray = [];
var groupSwitchUnitId = null;
var groupSwitchUnitRequestPath = null;
var groupSwitchFlag = false;

CurrentResponseCallMap_is_expired = false;

/* GET home page. */
router.get('/', function(req, res, next) {
  var callPath = req.baseUrl;

  if (CurrentResponseCallMap_is_expired || currentResponseCallMap.isEmpty()) {
    generateFlowByName(function() {
      groupIdSequenceArray = currentFlow.group_id_sequence.split(",");
      groupSwitchUnitId = currentFlow.sequence_switch_unit_id;
      getResponseValue(req, res, next);
    });
  } else {
    if (groupSwitchFlag || callPath == groupSwitchUnitRequestPath) {
      getResponseValue(req, res, next);
    } else {
      responseWrite(req, res, next);
    }
  }
  // res.render('index', {
  // layout : 'main2',
  // title : 'Express4',
  // value : currentResponseCallMap
  // });
});

function getResponseValue(req, res, next) {
  // TBD: group_id_sequence
  
  getAllResponsesFromGroup(currentFlow.group_id_sequence, function(list) {
    // var displayList = [];
    if (list && list.length > 0) {
      for (var i = 0; i < list.length; i++) {
        currentResponseMap.put(list[i].id, list[i]);
        currentResponseCallMap.put(list[i].request_path, list[i].response_value);
      }
    }
    responseWrite(req, res, next);
  });
}

function responseWrite(req, res, next) {
  var callPath = req.baseUrl;
  var responseValue = currentResponseCallMap.get(callPath);
  if (responseValue) {

    getResponseUnitById(groupSwitchUnitId, function(responseUnit) {
      if (groupSwitchUnitId == responseUnit.id) {
        groupSwitchFlag = true;
        groupSwitchUnitRequestPath = responseUnit.request_path;
      }
    });

    var body = eval("(" + responseValue + ")");
    body = JSON.stringify(body);
    res.writeHead(200, [ [ "Content-Type", "text/json" ], [ "Content-Length", body.length ] ]);
    res.write(body);
    res.end();
  } else {
    var NOT_FOUND = "Not Found\n";
    res.writeHead(404, [ [ "Content-Type", "text/plain" ], [ "Content-Length", NOT_FOUND.length ] ]);
    res.write(NOT_FOUND);
    res.end();
  }
}

function getAllResponsesFromGroup(groupId, callback) {
  var responseUnitList = [];
  getAllResponseIdsFromGroup(groupId, function(list) {
    console.log("list = " + list);
    var unitIds = list.unique();
    console.log("unitIds = " + unitIds);
    var count = 0;
    for (var i = 0; i < unitIds.length; i++) {
      getResponseUnitById(unitIds[i], function(responseUnit) {
        responseUnitList.push(responseUnit);
        count++;
        console.log("responseUnit.id = " + responseUnit.id);
        console.log("count = " + count);
        if (count == unitIds.length) {
          callback(responseUnitList);
        }
      });
    }
  });
}

function getAllResponseIdsFromGroup(groupId, callback) {

  console.log("getAllResponsesFromGroup ID : " + groupId);
  db.getResponseGroupByID(groupId, function(error, row) {
    if (error) {
      console.error("Can not find ResponseGroup by id = " + groupId);
    } else {
      var unitIDList = [];
      if (row.response_unit_ids) {
        unitIDList = row.response_unit_ids.split(",");
      }
      console.log("getResponseGroupByID subgroup_ids : " + row.subgroup_ids);
      if (row.subgroup_ids) {
        var subgroup_ids = row.subgroup_ids.split(",");
        for (var i = 0; i < subgroup_ids.length; i++) {
          getAllResponseIdsFromGroup(subgroup_ids[i], function(list) {
            console.log("getAllResponsesFromGroup list : " + list);
            unitIDList = unitIDList.concat(list);
            callback(unitIDList);
          });
        }
      } else {
        callback(unitIDList);
      }
    }
  });
}

function getResponseUnitById(unitId, callback) {
  db.getResponseUnitByID(unitId, function(error, row) {
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
      console.log("generateFlowByName group_id_sequence: " + row.group_id_sequence);
      currentFlow = {
        id : row.id,
        flow_name : row.flow_name,
        group_id_sequence : row.group_id_sequence,
        sequence_switch_unit_id : row.sequence_switch_unit_id,
        flow_repeat : row.flow_repeat
      };
      callback();
    }
  });
}

module.exports = router;
