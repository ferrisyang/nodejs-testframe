var express = require('express');
var router = express.Router();

var db = require('../db/db');
var models = require('../models/models');
var customUtils = require('../utils/utils');
var indexRoute = require('./index');

var displayObject = {
  allFlows : [],
  currentFlow : {},
  currentFlowGroups : new customUtils.Map(),
  currentGroupUnitIds : [],
  currentGroupUnitsMap : new customUtils.Map()
};

function refreshData() {
  displayObject = {
    allFlows : [],
    currentFlow : {},
    currentFlowGroups : new customUtils.Map(),
    currentGroupUnitIds : [],
    currentGroupUnitsMap : new customUtils.Map()
  };
}

function renderManagePage(req, res, next) {
  res.render('manage', {
    layout : 'main',
    title : 'Automation Test Framework Manage Page',
    manageInfo : 'Manage Page info',
    displayObject : displayObject
  });
}

function getAllFlows(callback) {
  db.getResponseFlowAllInArray(function(error, list) {
    if (list && list.lenght > 0) {
      console.log("getAllFlows size = " + list.length);
      for (var i = 0; i < list.length; i++) {
        var obj = {
          flowId : list[i].id,
          flowName : list[i].flow_name
        };
        displayObject.allFlows.push(obj);
      }
    }
    if (callback) {
      callback();
    }
  });
}

//Select Flow
function getFlowById(flowId, callback) {
  db.getResponseFlowByID(flowId, function(error, row) {
    displayObject.currentFlow = row;
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
      displayObject.currentFlowGroups.put(groupId, row);

      if (row.response_unit_ids) {
        var unitIDList = row.response_unit_ids.split(",");
        displayObject.currentGroupUnitIds.concat(unitIDList);
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

function getResponseUnitById(unitId, callback) {
  db.getResponseUnitByID(unitId, function(error, row) {
    if (error) {
      var msg = 'Can not find ResponseUnit by id = ' + unitId;
      console.error(msg);
    } else {
      displayObject.currentGroupUnitsMap.put(unitId, row);
    }
    if (callback) {
      callback();
    }
  });
}

// Click Group
function getCurrentGroupResponseUtils(groupId, callback) {
  getGroupsById(groupId, function() {
    var unitIds = displayObject.currentGroupUnitIds;
    var count = 0;
    for (var i = 0; i < unitIds.length; i++) {
      getResponseUnitById(unitIds[i], function() {
        count++;
        if (count === unitIds.length && callback) {
          callback();
        }
      });
    }
  });
}

//Change Flow
function getCurrentFlow(flowId, callback){
  var currentFlowId = null;
  if(flowId){
    currentFlowId = flowId;
  }
}

/* Manage Page. */
router.get('/', function(req, res, next) {
  console.log('Manage Request BaseURL = ' + req.baseUrl);
  renderManagePage(req, res, next);

  getAllFlows();

});

router.post('/', function(req, res, next) {
  refreshData();
  var paramsJson = req.body;
  console.log('Manage Post BaseURL = ' + req.baseUrl);
  console.log('Manage Post paramsJson = ' + JSON.stringify(paramsJson));
  renderManagePage(req, res, next);
});

module.exports = router;
