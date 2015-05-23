function ResponseUnit() {
  return {
    id : null,
    unit_category : null,
    unit_name : null,
    unit_key : null,
    unit_value : null,
    unit_origin : null
  };
}

function ResponseGroup() {
  return {
    id : null,
    group_name : null,
    subgroup_ids : null,
    response_unit_ids : null,
    is_order : false
  };
}

function ResponseFlow() {
  return {
    id : null,
    flow_name : null,
    group_id_sequence : null,
    sequence_switch_unit_id : null,
    flow_repeat : 0
  };
}

function ResponseUnitType() {
  return {
    id : null,
    type_name : null,
    type_code : null
  }
}

exports.ResponseUnit = ResponseUnit;
exports.ResponseGroup = ResponseGroup;
exports.ResponseFlow = ResponseFlow;
exports.ResponseUnitType = ResponseUnitType;