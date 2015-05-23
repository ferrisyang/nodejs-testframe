/*jshint es5: false */

//var util = require('util');
var util = console;
var sqlite3 = require('sqlite3');
var uuid = require('node-uuid');
var models = require('../models/models');

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db/test.db3', function(error) {
  if (error) {
    console.log("Connect to DB Error : " + error);
  }
});

// ResponseUnit
function insertResponseUnit(responseUnitVO, callback) {
  var unitId = uuid.v4();
  db
      .run(
          "insert into response_unit (id, unit_category, unit_name, unit_key, unit_value, unit_origin) values (?,?,?,?,?,?);",
          [ unitId, responseUnitVO.unit_category, responseUnitVO.unit_name, responseUnitVO.unit_key,
              responseUnitVO.unit_value, responseUnitVO.unit_origin ], function(error) {
            if (error) {
              util.log('FAIL on add ResponseUnit ' + error);
            }
            if (callback) {
              if (error) {
                callback(error);
              } else {
                callback(null, unitId);
              }
            }
          });
}

function deleteResponseUnit(id, callback) {
  db.run("delete from response_unit where id = ?;", [ id ], function(error) {
    if (error) {
      util.log('FAIL on delete ResponseUnit ' + error);
    }
    if (callback) {
      if (error) {
        callback(error);
      } else {
        callback();
      }
    }
  });
}

function updateResponseUnit(responseUnitVO, callback) {
  db.run("update response_unit set unit_category=?, unit_name=?, unit_key=?, unit_value=?, unit_origin=? where id=?;",
      [ responseUnitVO.unit_category, responseUnitVO.unit_name, responseUnitVO.unit_key, responseUnitVO.unit_value,
          responseUnitVO.unit_origin, responseUnitVO.id ], function(error) {
        if (error) {
          util.log('FAIL on update ResponseUnit ' + error);
        }
        if (callback) {
          if (error) {
            callback(error);
          } else {
            callback();
          }
        }
      });
}

function getResponseUnitByID(id, callback) {
  var didOne = false;
  db.each("select * from response_unit where id = ?;", [ id ], function(error, row) {
    if (error) {
      util.log('FAIL on getResponseUnitByID ' + error);
    }
    if (callback) {
      if (error) {
        callback(error);
      } else {
        if (!didOne) {
          callback(null, row);
          didOne = true;
        }
      }
    }
  });
}

function getResponseUnitAllInArray(callback) {
  db.all("select * from response_unit;", callback);
}

function getResponseUnitAllforEach(doEach, callback) {
  console.log("getResponseUnitAllforEach");
  var didOne = false;
  db.each("select * from response_unit;", function(error, row) {
    if (error) {
      util.log('FAIL on getResponseUnitAllforEach ' + error);
      if (callback) {
        callback(error);
      }
    } else {
      doEach(null, row);
    }
  });
}

// ResponseGroup
function insertResponseGroup(responseGroupVO, callback) {
  var groupId = uuid.v4();
  db.run("insert into response_group (id, group_name, subgroup_ids, response_unit_ids, is_order) values (?,?,?,?,?);",
      [ groupId, responseGroupVO.group_name, responseGroupVO.subgroup_ids, responseGroupVO.response_unit_ids,
          responseGroupVO.is_order ], function(error) {
        if (error) {
          util.log('FAIL on add ResponseGroup ' + error);
        }
        if (callback) {
          if (error) {
            callback(error);
          } else {
            callback(null, groupId);
          }
        }
      });
}

function deleteResponseGroup(id, callback) {
  db.run("delete from response_group where id = ?;", [ id ], function(error) {
    if (error) {
      util.log('FAIL on delete ResponseGroup ' + error);
    }
    if (callback) {
      if (error) {
        callback(error);
      } else {
        callback();
      }
    }
  });
}

function updateResponseGroup(responseGroupVO, callback) {
  db.run("update response_group set group_name=?, subgroup_ids=?, response_unit_ids=?, is_order=? where id=?;", [
      responseGroupVO.group_name, responseGroupVO.subgroup_ids, responseGroupVO.response_unit_ids,
      responseGroupVO.is_order, responseGroupVO.id ], function(error) {
    if (error) {
      util.log('FAIL on update ResponseGroup ' + error);
    }
    if (callback) {
      if (error) {
        callback(error);
      } else {
        callback();
      }
    }
  });
}

function addResponseGroupUnitIds(id, unitIds, callback) {
  getResponseGroupByID(id, function(error, row) {
    if (error) {
      util.log('FAIL on getResponseGroupByID ' + error);
    } else {
      var group = new models.ResponseGroup();
      group.id = row.id;
      group.response_unit_ids = row.response_unit_ids + "," + unitIds;

      db.run("update response_group set response_unit_ids=? where id=?;", [ group.response_unit_ids, group.id ],
          function(error) {
            if (error) {
              util.log('FAIL on update ResponseGroup ' + error);
            }
            if (callback) {
              if (error) {
                callback(error);
              } else {
                callback();
              }
            }
          });
    }
  })

}

function getResponseGroupByID(id, callback) {
  var didOne = false;
  db.each("select * from response_group where id = ?;", [ id ], function(error, row) {
    if (error) {
      util.log('FAIL on getResponseGroupByID ' + error);
    }
    if (callback) {
      if (error) {
        callback(error);
      } else {
        if (!didOne) {
          callback(null, row);
          didOne = true;
        }
      }
    }
  });
}

function getResponseGroupAllInArray(callback) {
  db.all("select * from response_group;", callback);
}

function getResponseGroupAllforEach(doEach, callback) {
  var didOne = false;
  db.each("select * from response_group;", function(error, row) {
    if (error) {
      util.log('FAIL on getResponseGroupAllforEach ' + error);
      if (callback) {
        callback(error);
      }
    } else {
      doEach(null, row);
    }
  });
}

// ResponseFlow
function insertResponseFlow(responseFlowVO, callback) {
  db
      .run(
          "insert into response_flow (id, flow_name, group_id_sequence, sequence_switch_unit_id, flow_repeat) values (?,?,?,?,?);",
          [ uuid.v4(), responseFlowVO.flow_name, responseFlowVO.group_id_sequence,
              responseFlowVO.sequence_switch_unit_id, responseFlowVO.flow_repeat ], function(error) {
            if (error) {
              util.log('FAIL on add ResponseFlow ' + error);
            }
            if (callback) {
              if (error) {
                callback(error);
              } else {
                callback();
              }
            }
          });
}

function deleteResponseFlow(id, callback) {
  db.run("delete from response_flow where id = ?;", [ id ], function(error) {
    if (error) {
      util.log('FAIL on delete ResponseFlow ' + error);
    }
    if (callback) {
      if (error) {
        callback(error);
      } else {
        callback();
      }
    }
  });
}

function updateResponseFlow(responseFlowVO, callback) {
  db
      .run(
          "update response_flow set flow_name=?, group_id_sequence=?, sequence_switch_unit_id=?, flow_repeat=? where id=?;",
          [ responseFlowVO.flow_name, responseFlowVO.group_id_sequence, responseFlowVO.sequence_switch_unit_id,
              responseFlowVO.flow_repeat, responseFlowVO.id ], function(error) {
            if (error) {
              util.log('FAIL on update ResponseFlow ' + error);
            }
            if (callback) {
              if (error) {
                callback(error);
              } else {
                callback();
              }
            }
          });
}

function getResponseFlowByID(id, callback) {
  var didOne = false;
  db.each("select * from response_flow where id = ?;", [ id ], function(error, row) {
    if (error) {
      util.log('FAIL on getResponseFlowByID ' + error);
    }
    if (callback) {
      if (error) {
        callback(error);
      } else {
        if (!didOne) {
          callback(null, row);
          didOne = true;
        }
      }
    }
  });
}

function getResponseFlowByName(Name, callback) {
  var didOne = false;
  db.each("select * from response_flow where flow_name = ?;", [ Name ], function(error, row) {
    if (error) {
      util.log('FAIL on getResponseFlowByName ' + error);
    }
    if (callback) {
      if (error) {
        callback(error);
      } else {
        if (!didOne) {
          callback(null, row);
          didOne = true;
        }
      }
    }
  });
}

function getResponseFlowAllInArray(callback) {
  db.all("select * from response_flow;", callback);
}

function getResponseFlowAllforEach(doEach, callback) {
  var didOne = false;
  db.each("select * from response_flow;", function(error, row) {
    if (error) {
      util.log('FAIL on getResponseFlowAllforEach ' + error);
      if (callback) {
        callback(error);
      }
    } else {
      doEach(null, row);
    }
  });
}

exports.insertResponseUnit = insertResponseUnit;
exports.deleteResponseUnit = deleteResponseUnit;
exports.updateResponseUnit = updateResponseUnit;
exports.getResponseUnitByID = getResponseUnitByID;
exports.getResponseUnitAllInArray = getResponseUnitAllInArray;
exports.getResponseUnitAllforEach = getResponseUnitAllforEach;

exports.insertResponseGroup = insertResponseGroup;
exports.deleteResponseGroup = deleteResponseGroup;
exports.updateResponseGroup = updateResponseGroup;
exports.addResponseGroupUnitIds = addResponseGroupUnitIds;
exports.getResponseGroupByID = getResponseGroupByID;
exports.getResponseGroupAllInArray = getResponseGroupAllInArray;
exports.getResponseGroupAllforEach = getResponseGroupAllforEach;

exports.insertResponseFlow = insertResponseFlow;
exports.deleteResponseFlow = deleteResponseFlow;
exports.updateResponseFlow = updateResponseFlow;
exports.getResponseFlowByID = getResponseFlowByID;
exports.getResponseFlowByName = getResponseFlowByName;
exports.getResponseFlowAllInArray = getResponseFlowAllInArray;
exports.getResponseFlowAllforEach = getResponseFlowAllforEach;