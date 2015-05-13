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
        tempObject.currentGroupUnitIds.concat(unitIDList);
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
    } else {
      tempObject.currentGroupUnitsMap.put(unitId, row);
    }
    if (callback) {
      callback();
    }
  });
}

// Click Group
function getCurrentGroupResponseUtils(groupId, callback) {
  getGroupsById(groupId, function() {
    var unitIds = tempObject.currentGroupUnitIds;
    var count = 0;
    for (var i = 0; i < unitIds.length; i++) {
      var unitId = unitIds[i];
      getResponseUnitById(unitId, function() {
        count++;
        var itemKeys = tempObject.currentGroupUnitsMap.keys();
        for (var i = 0; i < itemKeys.length; i++) {
          var obj = {
            unitId : itemKeys[i],
            unitName : tempObject.currentGroupUnitsMap.get(itemKeys[i])
          };
          displayObject.displayGroupUnits.push(obj);
        }
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
      var itemKeys = tempObject.currentSequenceGroups.keys();
      for (var i = 0; i < itemKeys.length; i++) {
        var obj = {
          groupId : itemKeys[i],
          groupName : tempObject.currentSequenceGroups.get(itemKeys[i])
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
  getAllFlows(function() {
    getCurrentFlow(DEFAULT_FLOW_ID, function() {
      renderManagePage(req, res, next);
    });
  });
});

router.post('/', function(req, res, next) {
  refreshData();
  var paramsJson = req.body;
  console.log('Manage Post BaseURL = ' + req.baseUrl);
  console.log('Manage Post paramsJson = ' + JSON.stringify(paramsJson));
  renderManagePage(req, res, next);
});

module.exports = router;
