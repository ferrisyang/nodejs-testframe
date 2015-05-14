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
var indexRoute = require('./index');

var DEFAULT_FLOW_ID = "1";
var allFlows = [];

var tempObject = {
  currentFlowId : null,
  allFlows : [],
  currentFlow : {},
  currentSequenceGroups : new customUtils.Map(),
  currentFlowGroups : new customUtils.Map(),
  currentGroupUnitIds : [],
  currentGroupUnitsMap : new customUtils.Map()
};

var displayObject = {
  currentFlowRepeat : false,
  currentGroupName: null,
  displayFlowSequenceGroups : [],
  displayGroupUnits : []
};

var displayAllFlows = [];

function refreshData() {
  tempObject = {
    currentFlowId : null,
    allFlows : [],
    currentFlow : {},
    currentSequenceGroups : new customUtils.Map(),
    currentFlowGroups : new customUtils.Map(),
    currentGroupUnitIds : [],
    currentGroupUnitsMap : new customUtils.Map()
  };
  displayObject = {
    currentFlowRepeat : false,
    currentGroupName: null,
    displayFlowSequenceGroups : [],
    displayGroupUnits : []
  };
}

function getAllFlows(callback) {
  db.getResponseFlowAllInArray(function(error, list) {
    if (list && list.length > 0) {
      console.log("getAllFlows size = " + list.length);
      allFlows = list;
      for (var i = 0; i < list.length; i++) {
        var obj = {
          flowId : list[i].id,
          currentSelected : false,
          flowName : list[i].flow_name
        };
        displayAllFlows.push(obj);
      }
    }
    if (callback) {
      callback();
    }
  });
}

function getFlowById(callback) {
  db.getResponseFlowByID(tempObject.currentFlowId, function(error, row) {
    tempObject.currentFlow = row;
    if (callback) {
      callback();
    }
  });
}

function getGroupsById(groupId, callback) {
  db.getResponseGroupByID(groupId, function(error, row) {
    if (error) {
      var msg = 'Can not find ResponseGroup by id = ' + groupId;
      console.error(msg);
    } else {
      tempObject.currentFlowGroups.put(groupId, row);

      if (row.response_unit_ids) {
        var unitIDList = row.response_unit_ids.split(",");
        tempObject.currentGroupUnitIds = tempObject.currentGroupUnitIds.concat(unitIDList);
      }

      if (row.subgroup_ids) {
        var subgroup_ids = row.subgroup_ids.split(",");
        for (var i = 0; i < subgroup_ids.length; i++) {
          getGroupsById(subgroup_ids[i], callback);
        }
      } else {
        if (callback) {
          callback();
        }
      }
    }
  });
}

function getFlowGroups(callback) {
  var count = 0;
  var curFlow = tempObject.currentFlow;
  var groupIds = curFlow.group_id_sequence.split(",");
  for (var i = 0; i < groupIds.length; i++) {
    var groupId = groupIds[i];
    db.getResponseGroupByID(groupId, function(error, row) {
      count++;
      tempObject.currentSequenceGroups.put(row.id, row);
      if (count === groupIds.length && callback) {
        callback();
      }
    });
  }
}

function getResponseUnitById(unitId, callback) {
  db.getResponseUnitByID(unitId, function(error, row) {
    if (error) {
      var msg = 'Can not find ResponseUnit by id = ' + unitId;
      console.error(msg);
    }
    if (callback) {
      callback(row);
    }
  });
}

// Click Group
function getCurrentGroupResponseUtils(groupId, callback) {
  getGroupsById(groupId, function() {
    var unitIds = tempObject.currentGroupUnitIds.unique();
    var count = 0;
    for (var i = 0; i < unitIds.length; i++) {
      var unitId = unitIds[i];
      getResponseUnitById(unitId, function(row) {
        count++;
        var obj = {
          unitId : row.id,
          unitName : row.unit_name
        };
        displayObject.displayGroupUnits.push(obj);
        if (count === unitIds.length && callback) {
          callback();
        }
      });
    }
  });
}

// Change Flow
function getCurrentFlow(flowId, callback) {
  if (flowId) {
    refreshData();
    tempObject.currentFlowId = flowId;
    tempObject.allFlows = allFlows;
  } else {
    tempObject.currentFlowId = DEFAULT_FLOW_ID;
  }
  getFlowById(function() {
    getFlowGroups(function() {
      var itemKeys = tempObject.currentFlow.group_id_sequence.split(",");
      for (var i = 0; i < itemKeys.length; i++) {
        var obj = {
          order : i + 1,
          currentSelected : false,
          groupId : itemKeys[i],
          groupName : tempObject.currentSequenceGroups.get(itemKeys[i]).group_name
        };
        displayObject.displayFlowSequenceGroups.push(obj);
      }
      if (callback) {
        callback();
      }
    });
  });
}

function renderManagePage(req, res, next) {
  res.render('manage', {
    layout : 'main',
    title : 'Automation Test Framework Manage Page',
    manageInfo : 'Manage Page info',
    displayObject : displayObject,
    displayAllFlows : displayAllFlows,
  });
}

/* Manage Page. */
router.get('/', function(req, res, next) {
  console.log('Manage Request BaseURL = ' + req.baseUrl);
  refreshData();
  displayAllFlows = [];
  getAllFlows(function() {
    getCurrentFlow(DEFAULT_FLOW_ID, function() {
      displayObject.currentFlowRepeat = tempObject.currentFlow.flow_repeat == 0 ? false : true;
      renderManagePage(req, res, next);
    });
  });
});

router.post('/', function(req, res, next) {
  var paramsJson = req.body;
  if (paramsJson.flowId) {
    refreshData();

    for (var i = 0; i < displayAllFlows.length; i++) {
      if (paramsJson.flowId === displayAllFlows[i].flowId) {
        displayAllFlows[i].currentSelected = true;
      } else {
        displayAllFlows[i].currentSelected = false;
      }
    }

    getCurrentFlow(paramsJson.flowId, function() {
      displayObject.currentFlowRepeat = tempObject.currentFlow.flow_repeat == 0 ? false : true;
      renderManagePage(req, res, next);
    });

  } else if (paramsJson.groupId) {
    tempObject.currentGroupUnitIds = [];
    displayObject.displayGroupUnits = [];
    tempObject.currentGroupUnitsMap = new customUtils.Map();
    for (var i = 0; i < displayObject.displayFlowSequenceGroups.length; i++) {
      if (displayObject.displayFlowSequenceGroups[i].groupId === paramsJson.groupId) {
        displayObject.displayFlowSequenceGroups[i].currentSelected = true;
        displayObject.currentGroupName = displayObject.displayFlowSequenceGroups[i].groupName;
      } else {
        displayObject.displayFlowSequenceGroups[i].currentSelected = false;
      }
    }
    getCurrentGroupResponseUtils(paramsJson.groupId, function() {

      var unitOrder = tempObject.currentGroupUnitIds.unique();
      var tempMap = [];
      for (var i = 0; i < unitOrder.length; i++) {
        for (var j = 0; j < displayObject.displayGroupUnits.length; j++) {
          if (unitOrder[i] === displayObject.displayGroupUnits[j].unitId) {
            tempMap.push(displayObject.displayGroupUnits[j]);
          }
        }
      }

      displayObject.displayGroupUnits = tempMap;
      renderManagePage(req, res, next);
    });
  }
});

module.exports = router;
