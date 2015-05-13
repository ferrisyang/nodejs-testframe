/*jshint es5: false */

//var util = require('util');
var util = console;
var sqlite3 = require('sqlite3');
var uuid = require('node-uuid');

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db/test.db3', function(error){
  if(error){
    console.log("Connect to DB Error : " + error);
  }
});

// ResponseUnit
function insertResponseUnit(responseUnitVO, callback) {
  db.run("insert into response_unit (id, unit_type, unit_name, request_path, response_value) values (?,?,?,?,?);", [
      uuid.v4(), responseUnitVO.unit_type, responseUnitVO.unit_name, responseUnitVO.request_path,
      responseUnitVO.response_value ], function(error) {
    if (error) {
      util.log('FAIL on add ResponseUnit ' + error);
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
  db.run("update response_unit set unit_type=?, unit_name=?, request_path=?, response_value=? where id=?;", [
      responseUnitVO.unit_type, responseUnitVO.unit_name, responseUnitVO.request_path, responseUnitVO.response_value,
      responseUnitVO.id ], function(error) {
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
  db.run("insert into response_group (id, group_name, subgroup_ids, response_unit_ids) values (?,?,?,?);", [ uuid.v4(),
      responseGroupVO.group_name, responseGroupVO.subgroup_ids, responseGroupVO.response_unit_ids ], function(error) {
    if (error) {
      util.log('FAIL on add ResponseGroup ' + error);
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
  db
      .run("update response_group set group_name=?, subgroup_ids=?, response_unit_ids=? where id=?;", [
          responseGroupVO.group_name, responseGroupVO.subgroup_ids, responseGroupVO.response_unit_ids,
          responseGroupVO.id ], function(error) {
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