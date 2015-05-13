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
var groupIdSequenceNo = 0;
var groupSwitchUnitId = null;
var groupSwitchUnitRequestPath = null;
var groupSwitchFlag = false;

var indexInfo = 'It provided mock data by JSON formatted.<br />If you want to add or edit the mock data, please use context "/manage".';

function resetCache(flowName) {
  currentFlow = new models.ResponseFlow();
  currentResponseMap = new customUtils.Map();
  currentResponseCallMap = new customUtils.Map();
  groupIdSequenceArray = [];
  groupIdSequenceNo = 0;
  groupSwitchUnitId = null;
  groupSwitchUnitRequestPath = null;
  groupSwitchFlag = false;
  if (flowName) {
    start_flow_name = flowName;
  }
}

function renderIndexPage(req, res, next, message) {
  res.render('index', {
    layout : 'main',
    title : 'Automation Test Framework',
    indexInfo : indexInfo,
    message : message
  });
}

function responseNotFoundPage(req, res, next) {
  var NOT_FOUND = "Response Json data is not found.";
  renderIndexPage(req, res, next, NOT_FOUND);
}

function responseWrite(req, res, next) {
  var callPath = req.baseUrl;
  var responseValue = currentResponseCallMap.get(callPath);
  if (responseValue) {

    if (groupSwitchUnitId && !groupSwitchFlag) {
      var groupSwitchUnit = currentResponseMap.get(groupSwitchUnitId);
      if (groupSwitchUnit && callPath === groupSwitchUnit.request_path) {
        groupSwitchFlag = true;
        groupSwitchUnitRequestPath = groupSwitchUnit.request_path;
      }
    }

    var body = eval("(" + responseValue + ")");
    res.json(body);

    // body = JSON.stringify(body);
    // res.writeHead(200, [ [ "Content-Type", "text/json" ], [ "Content-Length",
    // body.length ] ]);
    // res.write(body);
    // res.end();
  } else {
    responseNotFoundPage(req, res, next);
  }
}

function getAllResponseIdsFromGroup(groupId, req, res, next, callback) {
  db.getResponseGroupByID(groupId, function(error, row) {
    if (error) {
      var msg = 'Can not find ResponseGroup by id = ' + groupId;
      renderIndexPage(req, res, next, msg);
    } else {
      var unitIDList = [];
      if (row.response_unit_ids) {
        unitIDList = row.response_unit_ids.split(",");
      }
      if (row.subgroup_ids) {
        var subgroup_ids = row.subgroup_ids.split(",");
        for (var i = 0; i < subgroup_ids.length; i++) {
          getAllResponseIdsFromGroup(subgroup_ids[i], req, res, next, function(list) {
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

function getResponseUnitById(unitId, req, res, next, callback) {
  db.getResponseUnitByID(unitId, function(error, row) {
    if (error) {
      var msg = 'Can not find getResponseUnit By Id = ' + unitId;
      renderIndexPage(req, res, next, msg);
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

function getAllResponsesFromGroup(groupId, req, res, next, callback) {
  var responseUnitList = [];
  getAllResponseIdsFromGroup(groupId, req, res, next, function(list) {
    // console.log("list = " + list);
    var unitIds = list.unique();
    // console.log("unitIds = " + unitIds);
    var count = 0;
    for (var i = 0; i < unitIds.length; i++) {
      getResponseUnitById(unitIds[i], req, res, next, function(responseUnit) {
        responseUnitList.push(responseUnit);
        count++;
        if (count === unitIds.length) {
          callback(responseUnitList);
        }
      });
    }
  });
}

function getResponseValue(req, res, next) {
  if (groupIdSequenceArray[groupIdSequenceNo]) {
    getAllResponsesFromGroup(groupIdSequenceArray[groupIdSequenceNo], req, res, next, function(list) {
      if (list && list.length > 0) {
        for (var i = 0; i < list.length; i++) {
          currentResponseMap.put(list[i].id, list[i]);
          currentResponseCallMap.put(list[i].request_path, list[i].response_value);
        }
      }
      responseWrite(req, res, next);
    });
  } else {
    responseNotFoundPage(req, res, next);
  }
}

function generateFlowByName(req, res, next, callback) {
  db.getResponseFlowByName(start_flow_name, function(error, row) {
    if (error) {
      var msg = 'Can not find the Flow by name = ' + start_flow_name;
      renderIndexPage(req, res, next, msg);
    } else {
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

/* GET home page. */
router.get('/', function(req, res, next) {
  var callPath = req.baseUrl;

  if (!callPath || callPath.length === 0) {
    renderIndexPage(req, res, next, "");
  } else {
    if (currentResponseCallMap.isEmpty()) {
      generateFlowByName(req, res, next, function() {
        groupIdSequenceArray = currentFlow.group_id_sequence.split(",");
        groupSwitchUnitId = currentFlow.sequence_switch_unit_id;
        getResponseValue(req, res, next);
      });
    } else {
      if (groupSwitchFlag && callPath === groupSwitchUnitRequestPath) {
        console.log("Group Switch!");
        currentResponseMap = new customUtils.Map();
        currentResponseCallMap = new customUtils.Map();
        groupIdSequenceNo = groupIdSequenceNo + 1;
        if (groupIdSequenceNo >= groupIdSequenceArray.length) {
          if (currentFlow.flow_repeat !== 0) {
            groupIdSequenceNo = 0;
            getResponseValue(req, res, next);
          } else {
            var msg = 'Flow Sequence Out of Range!<br />Definition flow sequence group Size is [' + groupIdSequenceArray.length
                + '], and call flow count is [' + (groupIdSequenceNo + 1) + ']';
            renderIndexPage(req, res, next, msg);
          }
        } else {
          getResponseValue(req, res, next);
        }
      } else {
        responseWrite(req, res, next);
      }
    }
  }
});

module.exports = router;
