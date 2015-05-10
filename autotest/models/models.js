function ResponseUnit() {
  return {
    id : null,
    unit_type : null,
    unit_name : null,
    request_path : null,
    response_value : null
  };
}

function ResponseGroup() {
  return {
    id : null,
    group_name : null,
    subgroup_ids : null,
    response_unit_ids : null
  };
}

function ResponseFlow() {
  return {
    id : null,
    flow_name : null,
    group_id_sequence : null,
    sequence_switch_request_path : null,
    flow_repeat : 0
  };
}

exports.ResponseUnit = ResponseUnit;
exports.ResponseGroup = ResponseGroup;
exports.ResponseFlow = ResponseFlow;