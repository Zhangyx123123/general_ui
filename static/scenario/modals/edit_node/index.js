(function () {
  var BASE_URL = "/php/api/ApiKey/";
  var common_parser_options = '\
  <option value="time_module">time</option>\
  <option value="city_module">city</option>\
  <option value="landmark_module">landmark</option>\
  <option value="money_module">money</option>\
  <option value="time_period_module">time_period</option>\
  <option value="phone_call_module">phone_call</option>\
  <option value="adjust_light_module">adjust_light</option>\
  <option value="adjust_volume_module">adjust_volume</option>\
  <option value="movie_name_module">movie_name</option>\
  <option value="song_name_module">song_name</option>\
  <option value="star_name_module">star_name</option>\
  <option value="teleplay_name_module">teleplay_name</option>\
  <option value="album_name_module">album_name</option>\
  <option value="number_module">number</option>';

  var common_parser_required_options = '\
  <option value="time">time</option>\
  <option value="city">city</option>\
  <option value="landmark">landmark</option>\
  <option value="money">money</option>\
  <option value="time_period">time_period</option>\
  <option value="phone_call">phone_call</option>\
  <option value="adjust_light">adjust_light</option>\
  <option value="adjust_volume">adjust_volume</option>\
  <option value="movie_name">movie_name</option>\
  <option value="song_name">song_name</option>\
  <option value="star_name">star_name</option>\
  <option value="teleplay_name">teleplay_name</option>\
  <option value="album_name">album_name</option>\
  <option value="number">number</option>';

  var hotel_parser_options = '\
  <option value="City">City</option>\
  <option value="CheckinDate">CheckinDate</option>\
  <option value="CheckoutDate">CheckoutDate</option>\
  <option value="LandMark">LandMark</option>\
  <option value="HotelName">HotelName</option>\
  <option value="Star">Star</option>\
  <option value="Price">Price</option>';

  var task_parser_options = '\
  <option value="from_place">fromPlace</option>\
  <option value="to_place">toPlace</option>\
  <option value="depart_date">departDate</option>\
  <option value="arrive_date">arriveDate</option>\
  <option value="return_date">returnDate</option>';

  var task_parser_required_options = '\
  <option value="fromPlace">fromPlace</option>\
  <option value="toPlace">toPlace</option>\
  <option value="departDate">departDate</option>\
  <option value="arriveDate">arriveDate</option>\
  <option value="returnDate">returnDate</option>';

  let polarity_options = '\
  <option value="polarity">polarity</option>';

  function initData(node) {
    if (node == null)
      return;
    switchUILayoutByNodeType(node);
    var settingsUI = $('#settings');
    //insert node type
    if(typeof node.ui_node_type === 'undefined'){
      settingsUI.find('[name=moduleType]').val(node_type_map[node.node_type]);
    }else{
      settingsUI.find('[name=moduleType]').val(node_type_map[node.ui_node_type]);
    }
    //insert node name
    settingsUI.find('[name=moduleNickname]').val(node.description);
    if(node.node_type == "entry"){
      //insert entry conditions into UI (entry node)
      for (var index in node.entry_condition_rules){
        addMoreTriggers(0);
        var eltTriggers = $('#moretriggers_module0 > div:last');
        var rules = node.entry_condition_rules[index];
        insertConditionsIntoUIFromJSON(rules, eltTriggers, '.if-content');
      }
      // insert edges into connections tab UI
      insertEdgesIntoConnectionsTabUIFromJSON(settingsUI, node);
    }else if(node.node_type == "parameter_collecting"){
      insertParamsIntoParamsSettingsTabUIFromJSON(node);
      insertEdgesIntoParamsConnectionsTabUIFromJSON(node);
    }else if(node.node_type == "nlu_pc"){
      settingsUI.find('[name=initialResponse]').val(node.content['msg']);
      insertParamsIntoNluPcSettingsTabUIFromJSON(node);
      // insert edges into connections tab UI
      insertEdgesIntoConnectionsTabUIFromJSON(settingsUI, node);
    }else if(node.node_type == "restful"){
      insertRestfulSettingFromJSON(node);
      insertEdgesIntoRestfulConnectionsTabUIFromJSON(node);
    }else if(node.node_type == "dialogue"){
      if(node.ui_node_type == 'polarity'){
        var qLength = node.content.questions.length;
        insertGlobalVarsOptions(settingsUI.find('#initialResponseGlobalVarsSelector'));
        settingsUI.find('[name=initialResponse]').val(node.content.questions[qLength-1].msg);
        settingsUI.find('[name=failureResponse]').val(node.content.questions[qLength-2].msg);
        insertEdgesIntoPolarityConnectionsTabUIFromJSON(node);
      }else if (node.ui_node_type == 'router'){
        // insert edges into connections tab UI
        insertEdgesIntoConnectionsTabUIFromJSON(settingsUI, node);
      }else{
        var qLength = node.content.questions.length;
        insertGlobalVarsOptions(settingsUI.find('#initialResponseGlobalVarsSelector'));
        settingsUI.find('[name=initialResponse]').val(node.content.questions[qLength-1].msg);
        settingsUI.find('[name=failureResponse]').val(node.content.questions[qLength-2].msg);
        // insert edges into connections tab UI
        insertEdgesIntoConnectionsTabUIFromJSON(settingsUI, node);
      }
    }
  }

  function updateModuleData() {
    var nodeId = window.currentNode.node_id;
    var node = JSON.parse(JSON.stringify(getNodeData(nodeId)));
    if(node == null)
      return;
    var settingsUI = $('#settings');
    // node name
    node.description = settingsUI.find('[name=moduleNickname]').val();

    node.edges = [];
    node.global_vars = [];
    if(node.node_type == "entry"){
      // trigger (entry node)
      node.entry_condition_rules = [];
      var elems = $('#moretriggers_module0 > div');
      for (var idx=0; idx<elems.length; idx++) {
        var elements = $(elems[idx]).find('.if-content > div');
        var rets = getConditionsFromUI(elements, nodeId);
        var rules = rets[0];
        var global_vars = rets[1];
        node.entry_condition_rules.push(rules);
      }
      // hidden edges
      insertHiddenEdgesIntoJSONForEntryNode(node);
      // edges
      insertEdgesIntoJSONFromConnectionsTab(nodeId, node);
    }else if(node.node_type == "parameter_collecting"){
      insertParsersRespsIntoJSONFromParamsSettingsTab(node);
      insertDefaultEdgesIntoJSONFromParamsConnectionsTab(node);
      insertEdgesIntoJSONFromParamsConnectionsTab(node);
    }else if(node.node_type == "nlu_pc"){
      insertEntitiesIntoJSONFromNluPcSettingsTab(settingsUI, node);
      node.edges.push({
            "to_node_id": null,
            "condition_rules": []
        },{
            "to_node_id": null,
            "condition_rules": []
        },{
            "to_node_id": null,
            "condition_rules": []
        });
      // edges
      insertEdgesIntoJSONFromConnectionsTab(nodeId, node);
    }else if(node.node_type == "restful"){
      insertRestfulSettingIntoJSONFromUI(node);
      insertEdgesIntoJSONFromRestfulConnectionsTab(node);
    }else if(node.node_type == "dialogue"){
        // initResp + failureResp
        insertInitRespNFailureRespIntoJSONFromUI(settingsUI, node);
      if(node.ui_node_type == 'polarity'){
        insertEdgesIntoJSONFromPolarityConnectionsTab(nodeId, node);
      }else if (node.ui_node_type == 'router'){
        node.content = {
          "questions": [{
            "msg": "$skip_dialogue",
            "condition_rules": []
          }]
        }
        node.edges.push({
              "to_node_id": null,
              "condition_rules": []
          },{
              "to_node_id": null,
              "condition_rules": []
          },{
              "to_node_id": null,
              "condition_rules": []
          });
        // edges
        insertEdgesIntoJSONFromConnectionsTab(nodeId, node);
      }else{
        // hidden edges
        if (settingsUI.find('[name=parserType]').val() != 'none'){
          insertHiddenEdgesIntoJSONFromUI(settingsUI, nodeId, node);
        }else{
          insertHiddenEdgesIntoJSONForNoDefaultParserNode(settingsUI, node);
        }
        // edges
        insertEdgesIntoJSONFromConnectionsTab(nodeId, node);
      }
    }
    return node;
  }

  function insertEdgesIntoRestfulConnectionsTabUIFromJSON(node){
    var failedSelectUI = $("#restful_connections").find(".failedThenGoto");
    var succeedSelectUI = $("#restful_connections").find(".succeedThenGoto");
    addElseOptions(failedSelectUI, node);
    addElseOptions(succeedSelectUI, node);

    $("#restful_connections").find(".failedThenGoto").multiselect('select', node.edges[0].to_node_id);
    $("#restful_connections").find(".succeedThenGoto").multiselect('select', node.edges[1].to_node_id);
  }

  function insertEdgesIntoJSONFromRestfulConnectionsTab(node){
    node.edges = [
      {
        "edge_type": "normal",
        "to_node_id": $("#restful_connections").find(".failedThenGoto").val(),
        "condition_rules": [
          [
            {
              "source": "global_info",
              "functions": [
                {
                  "function_name": "restful_failed",
                  "content": ""
                }
              ]
            }
          ]
        ],
        "actions": [
          {
            "operation": "set_to_global_info",
            "key": "sys_node_dialogue_cnt",
            "val": 0
          }
        ]
      },
      {
        "edge_type": "normal",
        "to_node_id": $("#restful_connections").find(".succeedThenGoto").val(),
        "condition_rules": [
          [
            {
              "source": "global_info",
              "functions": [
                {
                  "function_name": "restful_succeed",
                  "content": ""
                }
              ]
            }
          ]
        ],
        "actions": [
          {
            "operation": "set_to_global_info",
            "key": "sys_node_dialogue_cnt",
            "val": 0
          }
        ]
      }
    ]
  }

  function insertRestfulSettingIntoJSONFromUI(node){
    var restfulSettingsUI = $('#restful_settings');
    node.description = restfulSettingsUI.find('[name=moduleNickname]').val();
    node.content.requests[0].rtn_var_name = restfulSettingsUI.find('[name=rtn_var_name]').val();
    node.content.requests[0].method = restfulSettingsUI.find('[name=method]').val();
    node.content.requests[0].url = restfulSettingsUI.find('[name=url]').val();
    node.content.requests[0].headers['Content-Type'] = restfulSettingsUI.find('[name=headers]').val();
    node.content.requests[0].body.content = restfulSettingsUI.find('[name=body]').val();
    node.global_vars = [restfulSettingsUI.find('[name=rtn_var_name]').val()];
  }

  function changeRestfulMethod(method){
    if(method === 'GET'){
      $('#headerNbody').hide();
    }else{
      $('#headerNbody').show();
    }
  }

  function insertRestfulSettingFromJSON(node){
    var restfulSettingsUI = $('#restful_settings');
    //insert node type
    restfulSettingsUI.find('[name=moduleType]').val(node_type_map[node.node_type]);
    //insert node name
    restfulSettingsUI.find('[name=moduleNickname]').val(node.description);
    restfulSettingsUI.find('[name=rtn_var_name]').val(node.content.requests[0].rtn_var_name);
    restfulSettingsUI.find('[name=method]').val(node.content.requests[0].method);
    changeRestfulMethod(node.content.requests[0].method);
    restfulSettingsUI.find('[name=method]').change(function() {
      changeRestfulMethod($(this).val());
    });
    restfulSettingsUI.find('[name=url]').val(node.content.requests[0].url);
    restfulSettingsUI.find('[name=headers]').val(node.content.requests[0].headers['Content-Type']);
    restfulSettingsUI.find('[name=body]').val(node.content.requests[0].body.content);
  }

  function insertGlobalVarsOptions(selector){
    var item_list = '';
    for(var index in window.moduleData.nodes) {
      var node = window.moduleData.nodes[index];
      if(typeof node.global_vars !== 'undefined'){
        for(var id in node.global_vars){
          item_list += '\
            <li>\
              <a href="javascript:void(0)" onClick="insertGlobalVarsIntoEditor(\'$global{'+node.global_vars[id]+'}\', this)" class="dropdown-menu-item">'+he.encode(node.description)+'节点： '+node.global_vars[id]+'</a>\
            </li>';
        }
      }  
    }
    selector.append('\
      <ul class="dropdown-menu" style="max-height: 250px; overflow-y: auto; margin-top: 3px;">'
        +item_list+
      '</ul>'
    );
  }

  function insertGlobalVarsIntoEditor(txtToAdd, btn_pos){
    var textArea = $(btn_pos).parent().parent().parent().parent().find("[name=initialResponse]");
    var caretPos = textArea[0].selectionStart;
    var caretEnd = textArea[0].selectionEnd;
    var textAreaTxt = textArea.val();
    textArea.val(textAreaTxt.substring(0, caretPos) + txtToAdd + textAreaTxt.substring(caretEnd));
    textArea.focus();
    textArea[0].selectionStart = caretPos + txtToAdd.length;
    textArea[0].selectionEnd = caretPos + txtToAdd.length;
  }

  function insertDefaultEdgesIntoJSONFromParamsConnectionsTab(node){
    // success edge
    node.edges.push({
      "edge_type": "normal",
      "to_node_id": $("#params_connections").find(".successThenGoto").val(),
      "condition_rules": [
        [
          {
            "source": "global_info",
            "functions": [
              {
                "function_name": "all_parameters_are_collected",
                "content": []
              }
            ]
          }
        ]
      ],
      "actions": [
        {
            "operation": "set_to_global_info",
            "key": "sys_node_dialogue_cnt",
            "val": 0
        }
      ]
    });

    // edge to save sys_node_dialogue_cnt_limit
    node.edges.push({
      "edge_type": "hidden",
      "to_node_id": null,
      "condition_rules": [],
      "actions": [
        {
            "operation": "set_to_global_info",
            "key": "sys_node_dialogue_cnt_limit",
            "val": parseInt($("#params_connections").find(".failLimit").val() || 3)
        }
      ]
    });

    // fail edge
    node.edges.push({
      "edge_type": "normal",
      "to_node_id": $("#params_connections").find(".failThenGoto").val(),
      "condition_rules": [
        [
          {
            "source": "global_info",
            "functions": [
              {
                "function_name": "counter_check",
                "content": "node_counter"
              }
            ]
          }
        ]
      ],
      "actions": [
        {
            "operation": "set_to_global_info",
            "key": "sys_node_dialogue_cnt",
            "val": 0
        }
      ]
    });
  }

  function insertEdgesIntoJSONFromParamsConnectionsTab(node){
    var elems = $('#moreconditions_module1 > div');

    for (var idx=0; idx<elems.length; idx++) {
      var rules = [];
      var global_vars = [];
      var elements = $(elems[idx]).find('.if-content > div');
      //check is qq edge or not
      if($($(elements[0]).children("select")[1]).val() == "qq_similarity"){
        insertQQEdgesIntoJSONFromUI(elements[0], node);
        continue;
      }else{
        var rets = getConditionsFromUI(elements, node.node_id);
        var rules = rets[0];
        var global_vars =rets[1];
        node.global_vars = node.global_vars.concat(global_vars);
      }

      var selectElts = $(elems[idx]).find("div.thenGoto > select");
      var to_node_id = $(selectElts[0]).val();
      insertEdgeIntoJSONwithRules(rules, to_node_id, node);
    }
  }

  function insertEntitiesIntoJSONFromNluPcSettingsTab(settingsUI, node){
    node.content={
      'entities':[],
      'msg': settingsUI.find('[name=initialResponse]').val()
    }
    var elems = $('#moreNLUParameter_module0 > div');
    for (var idx=0; idx<elems.length; idx++) {
      node.content.entities.push({
        'entityName': $(elems[idx]).find('[name=entityName]').val(),
        'prompt': $(elems[idx]).find('[name=prompt]').val()
      });
    }
  }

  function insertParsersRespsIntoJSONFromParamsSettingsTab(node){
    node.content={
      'parsers':[],
      'questions':[]
    }
    var elems = $('#moreParameter_module0 > div');
    for (var idx=0; idx<elems.length; idx++) {
      var rets = insertParsersIntoJSONFromUI($(elems[idx]).find('.parser-content > div'),node);
      var parser_condition_rules = rets[0];
      var question_condition_rules = rets[1];
      node.content.parsers.push({
        "condition_rules": parser_condition_rules
      });
      node.content.questions.push({
        'msg': $(elems[idx]).find('[name=parameterQuerry]').val(),
        'parse_failed_msg': $(elems[idx]).find('[name=parseFailQuery]').val(),
        'condition_rules':question_condition_rules
      });
    }
  }

  function insertParsersIntoJSONFromUI(elements, node){
    var parser_condition_rules = [];
    var question_condition_rules = [];
    var keyObjs = [];
    var rets = getConditionsFromUI(elements, node.node_id);
    var condition_rules = rets[0];
    var global_vars = rets[1];
    node.global_vars = node.global_vars.concat(global_vars);
    for(var idx=0; idx<condition_rules.length; idx++){
      parser_condition_rules.push([condition_rules[idx]]);
    }
    global_vars.forEach(function(v){ keyObjs.push({"key": v})});
    question_condition_rule = [
      {
        "source": "global_info",
        "functions": [
          {
            "content": keyObjs,
            "function_name": "not_contain_key"
          }
        ]
      }
    ]
    question_condition_rules.push(question_condition_rule);
    return [parser_condition_rules, question_condition_rules];
  }

  function insertParamsIntoNluPcSettingsTabUIFromJSON(node){
    for (var index in node.content.entities){
      addMoreNLUParameter(0);
      var paramSetting = $('#moreNLUParameter_module0 > div:last');
      paramSetting.find('[name=entityName]').val(node.content.entities[index].entityName);
      paramSetting.find('[name=prompt]').val(node.content.entities[index].prompt);
    }
  }

  function insertParamsIntoParamsSettingsTabUIFromJSON(node){
    for (var index = 0; index < node.content.parsers.length; index++){
      addMoreParameter(0);
      var paramSetting = $('#moreParameter_module0 > div:last');
      paramSetting.find('[name=parameterQuerry]').val(node.content.questions[index].msg);
      paramSetting.find('[name=parseFailQuery]').val(node.content.questions[index].parse_failed_msg);
      var condition_rules = node.content.parsers[index].condition_rules;
      for(var idx = 0; idx <condition_rules.length; idx++){
        var rules = condition_rules[idx];
        if(idx > 0){
          var more_content = paramSetting.children('.parser-content');
          addMoreParameterParsers(more_content);
        }
        insertConditionsIntoUIFromJSON(rules, paramSetting, '.parser-content');
      }
    }
  }

  function insertEdgesIntoPolarityConnectionsTabUIFromJSON(node){
    var yesSelectUI = $("#polarity_connections").find(".yesThenGoto");
    var noSelectUI = $("#polarity_connections").find(".noThenGoto");
    var failSelectUI = $("#polarity_connections").find(".failThenGoto");
    addElseOptions(yesSelectUI, node);
    addElseOptions(noSelectUI, node);
    addElseOptions(failSelectUI, node);

    $("#polarity_connections").find(".failLimit").val(node.edges[0].actions[1].val);
    if(node.edges[4].to_node_id === null){ // init
      $("#polarity_connections").find(".yesThenGoto").multiselect('select', '0');
    }else{
      $("#polarity_connections").find(".yesThenGoto").multiselect('select', node.edges[4].to_node_id);
    }
    if(node.edges[5].to_node_id === null){ // init
      $("#polarity_connections").find(".noThenGoto").multiselect('select', '0');
    }else{
      $("#polarity_connections").find(".noThenGoto").multiselect('select', node.edges[5].to_node_id);
    }
    if(node.edges[6].to_node_id === null){ // init
      $("#polarity_connections").find(".failThenGoto").multiselect('select', '0');
    }else{
      $("#polarity_connections").find(".failThenGoto").multiselect('select', node.edges[6].to_node_id);
    }
  }

  function insertEdgesIntoParamsConnectionsTabUIFromJSON(node){
    // insert params connections's else, success and fail conditions into UI (pc node)
    var successSelectUI = $("#params_connections").find(".successThenGoto");
    var failSelectUI = $("#params_connections").find(".failThenGoto");
    //use system level dialogue cnt limit
    $("#params_connections").find(".failLimit").val(window.moduleData.setting.sys_node_dialogue_cnt_limit);
    addElseOptions(successSelectUI, node);
    addElseOptions(failSelectUI, node);

    for (var index = 0; index < node.edges.length; index++){
      var edge = node.edges[index];
      if (index == 0 && node.edges.length >= 3){
        if(node.edges[0].to_node_id === null){ // init
          $("#params_connections").find(".successThenGoto").multiselect('select', '0');
        }else{
          $("#params_connections").find(".successThenGoto").multiselect('select', node.edges[0].to_node_id);
        }
        $("#params_connections").find(".failLimit").val(node.edges[1].actions[0].val);
        if(node.edges[2].to_node_id === null){ // init
          $("#params_connections").find(".failThenGoto").multiselect('select', '0');
        }else{
          $("#params_connections").find(".failThenGoto").multiselect('select', node.edges[2].to_node_id);
        }
        index+=2;
      }else{
        addMoreConditions(1);
        var eltEdge = $('#moreconditions_module1 > div:last');
        if ('edge_type' in edge && edge.edge_type == 'qq'){
          //qq edges
          insertQQEdgesIntoUIFromJSON(eltEdge, edge);
        }else{
          //general edges
          if(edge.to_node_id == null){ // init
            eltEdge.find("div.thenGoto > select").multiselect('select', 'null');
          }else{
            eltEdge.find("div.thenGoto > select").multiselect('select', edge.to_node_id);
          }
          var rules = edge.condition_rules[0];
          insertConditionsIntoUIFromJSON(rules, eltEdge, '.if-content');
        }
      }
    }
  }

  function insertEdgesIntoConnectionsTabUIFromJSON(settingsUI, node){
    //1. insert parser function into UI
    //2. insert edges into UI
    insertParserFunOptions(settingsUI.find('[name=parserType]'));

    // initial exceedThenGoTo edge
    insertExceedThenGoToUIFromJSON(node);

    for (var index = 0; index < node.edges.length - 1; index++){
      var edge = node.edges[index];
      
      if (index == 0 && node.edges.length >= 3){
        //skip the parser function on conditions UI (which is selected in setting page)
        //insert parser function into setting page
        if(node.edges[1].condition_rules.length > 0){
          insertParserFunIntoUIFromJSON(settingsUI, node);
        }
        index+=2;
      }else if ('edge_type' in edge && edge.edge_type == 'exceedThenGoTo'){
        // insert exceedThenGoTo edge value to UI from JSON
        if (edge.to_node_id === null){ // init
          $("#connections").find(".exceedThenGoTo").multiselect('select', '0');
        }else{
          $("#connections").find(".exceedThenGoTo").multiselect('select', edge.to_node_id);
        }
      }else if ('edge_type' in edge && edge.edge_type == 'hidden'){
        continue;
      }else{
        addMoreConditions(0);
        var eltEdge = $('#moreconditions_module0 > div:last');
        if ('edge_type' in edge && edge.edge_type == 'qq'){
          //qq edges
          insertQQEdgesIntoUIFromJSON(eltEdge, edge);
        }else{
          //normal edges
          if(edge.to_node_id == null){
            eltEdge.find("div.thenGoto > select").multiselect('select', 'null');
          }else{
            eltEdge.find("div.thenGoto > select").multiselect('select', edge.to_node_id);
          }
          var rules = edge.condition_rules[0];
          insertConditionsIntoUIFromJSON(rules, eltEdge, '.if-content');
        }
      }
    }

    //insert else conditions into UI
    var connectionsElseUI = $("#connections").find(".elseGoTo");
    addElseOptions(connectionsElseUI, node);
    insertElseIntoUIFromJSON(connectionsElseUI, node);
  }

  function insertExceedThenGoToUIFromJSON(node){
    if (node.node_type == "entry" || node.ui_node_type == "router"){
      return;
    }
    var exceedThenGoToUI = $("#connections").find(".exceedThenGoTo");
    addElseOptions(exceedThenGoToUI, node);
    exceedThenGoToUI.val(0);

    var exceedThenGoToRoundLimitUI = $("#connections").find(".roundLimit");
    if (typeof node.node_dialogue_cnt_limit === 'undefined'){
      // old scenario - node_dialogue_cnt_limit doesn't exist
      if(node.edges.length == 0 || node.edges[2].condition_rules.length == 0){
        //use system level dialogue cnt limit
        exceedThenGoToRoundLimitUI.val(window.moduleData.setting.sys_node_dialogue_cnt_limit);
      }else{
        //use node level dialogue cnt limit
        exceedThenGoToRoundLimitUI.val(node.edges[2].condition_rules[0][0].functions[0].content[0].val);
      }
    }else{
      // new scenario
      exceedThenGoToRoundLimitUI.val(node.node_dialogue_cnt_limit);
    }
  }

  function insertEdgesIntoJSONFromPolarityConnectionsTab(nodeId, node){
    node.edges = 
    [
      {
        "to_node_id": null,
        "edge_type": "hidden",
        "condition_rules": [],
        "actions": [
          {
            "operation": "update_confirm_status"
          },
          {
            "operation": "set_to_global_info",
            "val": parseInt($("#polarity_connections").find(".failLimit").val() || 3),
            "key": "sys_node_dialogue_cnt_limit"
          }
        ]
      },
      {
        "to_node_id": null,
        "edge_type": "hidden",
        "condition_rules": []
      },
      {
        "to_node_id": null,
        "edge_type": "hidden",
        "condition_rules": []
      },
      {
        "to_node_id": null,
        "edge_type": "normal",
        "condition_rules": [
          [
            {
              "source": "text",
              "functions": [
                {
                  "content": {
                    "key_suffix": "_"+nodeId,
                    "key": "polarity"
                  },
                  "function_name": "polarity_parser"
                }
              ]
            }
          ]
        ],
        "actions": []
      },
      {
        "to_node_id": $("#polarity_connections").find(".yesThenGoto").val(),
        "edge_type": "normal",
        "condition_rules": [
          [
            {
              "source": "global_info",
              "functions": [
                {
                  "content": [
                    {
                      "compare": "==",
                      "val": "yes",
                      "key": "polarity_"+nodeId
                    }
                  ],
                  "function_name": "key_val_match"
                }
              ]
            }
          ]
        ],
        "actions": [
          {
            "operation": "set_to_global_info",
            "val": false,
            "key": "parsing_failed"
          },
          {
            "operation": "set_to_global_info",
            "val": 0,
            "key": "sys_node_dialogue_cnt"
          }
        ]
      },
      {
        "to_node_id": $("#polarity_connections").find(".noThenGoto").val(),
        "edge_type": "normal",
        "condition_rules": [
          [
            {
              "source": "global_info",
              "functions": [
                {
                  "content": [
                    {
                      "compare": "==",
                      "val": "no",
                      "key": "polarity_"+nodeId
                    }
                  ],
                  "function_name": "key_val_match"
                }
              ]
            }
          ]
        ],
        "actions": [
          {
            "operation": "set_to_global_info",
            "val": false,
            "key": "parsing_failed"
          },
          {
            "operation": "set_to_global_info",
            "val": 0,
            "key": "sys_node_dialogue_cnt"
          }
        ]
      },
      {
        "edge_type": "normal",
        "to_node_id": $("#polarity_connections").find(".failThenGoto").val(),
        "condition_rules": [
          [
            {
              "source": "global_info",
              "functions": [
                {
                  "function_name": "counter_check",
                  "content": "node_counter"
                }
              ]
            }
          ]
        ],
        "actions": [
          {
            "operation": "set_to_global_info",
            "val": false,
            "key": "parsing_failed"
          },
          {
            "operation": "set_to_global_info",
            "key": "sys_node_dialogue_cnt",
            "val": 0
          }
        ]
      },
      {
        "to_node_id": nodeId,
        "edge_type": "else_into",
        "condition_rules": [],
        "actions": [
          {
            "operation": "set_to_global_info",
            "val": true,
            "key": "parsing_failed"
          }
        ]
      }
    ]
  }

  function insertEdgesIntoJSONFromConnectionsTab(nodeId, node){
    var elems = $('#moreconditions_module0 > div');
    for (var idx=0; idx<elems.length; idx++) {
      var rules = [];
      var global_vars = [];
      var elements = $(elems[idx]).find('.if-content > div');
      //check is qq edge or not
      if($($(elements[0]).children("select")[1]).val() == "qq_similarity"){
        insertQQEdgesIntoJSONFromUI(elements[0], node);
        continue;
      }else{
        var rets = getConditionsFromUI(elements, nodeId);
        var rules = rets[0];
        var global_vars = rets[1];
        node.global_vars = node.global_vars.concat(global_vars);
      }

      var selectElts = $(elems[idx]).find("div.thenGoto > select");
      var to_node_id = $(selectElts[0]).val();
      insertEdgeIntoJSONwithRules(rules, to_node_id, node);
    }
    insertExceedThenGoToJSONFromUI($('#connections'), nodeId, node);
    insertElseIntoJSONFromUI($('#connections'), nodeId, node);
  }

  function insertGlobalConnectionsIntoJSON(nodeId, node){
    var elems = $('#moreconditions_module_gc > div');
    for (var idx=0; idx<elems.length; idx++) {
      var rules = [];
      var global_vars = [];
      var elements = $(elems[idx]).find('.if-content > div');
      //check is qq edge or not
      if($($(elements[0]).children("select")[1]).val() == "qq_similarity"){
        insertQQEdgesIntoJSONFromUI(elements[0], node);
        continue;
      }else{
        var rets = getConditionsFromUI(elements, nodeId);
        var rules = rets[0];
        var global_vars = rets[1];
        node.global_vars = node.global_vars.concat(global_vars);
      }

      var selectElts = $(elems[idx]).find("div.thenGoto > select");
      var to_node_id = $(selectElts[0]).val();
      insertEdgeIntoJSONwithRules(rules, to_node_id, node);
    }
  }

  function toggleExpertMode(){
    $("#settings > .row:eq(3)").slideToggle();
    $("#settings > .row:eq(4)").slideToggle();
  }

  function switchUILayoutByNodeType(node){
    $(".panel-title > span").html(he.encode(node.description) + " (" + node.node_id + ")");
    
    if (node.node_type == "entry"){
      $("#nlu_pc_settings_tab").hide();
      $("#restful_setttings_tab").hide();
      $("#restful_connections_tab").hide();
      $("#params_settings_tab").hide();
      $("#params_connections_tab").hide();
      $("#polarity_connections_tab").hide();
      $("#exceedThenGoToDIV").hide();
    }else if (node.node_type == "parameter_collecting"){
      $("#nlu_pc_settings_tab").hide();
      $("#restful_setttings_tab").hide();
      $("#restful_connections_tab").hide();
      $("#triggers_tab").hide();
      $("#connections_tab").hide();
      $("#polarity_connections_tab").hide();
    }else if (node.node_type == "nlu_pc"){
      $("#restful_setttings_tab").hide();
      $("#restful_connections_tab").hide();
      $("#triggers_tab").hide();
      $("#params_settings_tab").hide();
      $("#params_connections_tab").hide();
      $("#polarity_connections_tab").hide();
      $("#exceedThenGoToDIV").hide();
    }else if(node.node_type == "restful"){
      $("#nlu_pc_settings_tab").hide();
      $("#setttings_tab").hide();
      $("#connections_tab").hide();
      $("#triggers_tab").hide();
      $("#params_settings_tab").hide();
      $("#params_connections_tab").hide();
      $("#polarity_connections_tab").hide();
      $("#exceedThenGoToDIV").hide();
      $("#setttings_tab a").click();
      $("#restful_setttings_tab a").click();
    }else if (node.node_type == "dialogue"){
      if(typeof node.ui_node_type === 'undefined'){
        $("#nlu_pc_settings_tab").hide();
        $("#restful_setttings_tab").hide();
        $("#restful_connections_tab").hide();
        $("#triggers_tab").hide();
        $("#params_settings_tab").hide();
        $("#params_connections_tab").hide();
        $("#polarity_connections_tab").hide();
      }else if(node.ui_node_type == 'polarity'){
        $("#nlu_pc_settings_tab").hide();
        $("#restful_setttings_tab").hide();
        $("#restful_connections_tab").hide();
        $("#triggers_tab").hide();
        $("#params_settings_tab").hide();
        $("#params_connections_tab").hide();
        $("#connections_tab").hide();
        $("#settings > .row:eq(3)").hide();
        $("#settings > .row:eq(4)").hide();
      }else if(node.ui_node_type == "router"){
        $("#nlu_pc_settings_tab").hide();
        $("#restful_setttings_tab").hide();
        $("#restful_connections_tab").hide();
        $("#triggers_tab").hide();
        $("#params_settings_tab").hide();
        $("#params_connections_tab").hide();
        $("#polarity_connections_tab").hide();
        $("#exceedThenGoToDIV").hide();
      }else{
        $("#nlu_pc_settings_tab").hide();
        $("#restful_setttings_tab").hide();
        $("#restful_connections_tab").hide();
        $("#triggers_tab").hide();
        $("#params_settings_tab").hide();
        $("#params_connections_tab").hide();
        $("#settings > .row:eq(3)").hide();
        $("#settings > .row:eq(4)").hide();
        $("#polarity_connections_tab").hide();
        $("#expertModeBtn").show();
      }
    }

    if (node.node_type == "entry" || node.node_type == 'nlu_pc' || node.node_type == 'parameter_collecting' || node.ui_node_type == "router"){
      //hide unused elements
      $("#settings > .row:eq(2)").hide();
      $("#settings > .row:eq(3)").hide();
      $("#settings > .row:eq(4)").hide();
      $("#settings > .row:eq(5)").hide();
    }

    if (node.node_type == 'nlu_pc'){
      $("#settings > .row:eq(2)").show();
    }
  }

  function checkIfNodeChanged(){
    var newNode = updateModuleData();
    var oldNode = getNodeData(window.currentNode.node_id);
    if(jsonEqual(newNode,oldNode)){
      return false;
    }else{
      return true;
    }
  }

  function saveModuleSetting() {
    var newNode = updateModuleData();
    setNodeData(newNode);
    updateConnections();
    checkScenarioFormat();
    window.$('#'+window.currentNode.node_id+' h4').html(he.encode($('#settings').find('[name=moduleNickname]').val()));
    uploadScenarioJson();
  }

  function saveGlobalConnections() {
    const nodeId = 'global_edges'
    const pseudoNode = {
      "node_id": nodeId,
      "description": "通用连线",
      "node_type": 'global_edges',
      "edges": [],
      "global_vars": [],
    }
    insertGlobalConnectionsIntoJSON(nodeId, pseudoNode);
    window.moduleData.global_edges = pseudoNode.edges
    uploadScenarioJson();
  }

  function checkScenarioFormat(){
    var node_info = traverseScenarioNodeTree()
    for(var index in window.moduleData.nodes) {
      var node = window.moduleData.nodes[index];
      checkNodeFormat(node, node_info);
      updateWarningIcon(node);
    }
    $( ".sortablediv" ).find('[data-toggle="tooltip"]').tooltip();
  }

  function updateWarningIcon(node){
    var parent = window.$('#' + node.node_id + ' #node_content');
    parent.find('.info').remove();
    parent.find('.warning').remove();
    if (node.warnings == undefined){
      node.warnings = []
    }else{
      parent.append(generateWarningIcon(node.warnings));
    }
  }

  function traverseScenarioNodeTree(){
    // console.log(JSON.stringify(window.moduleData))
    var nodes = window.moduleData.nodes;
    // initial node_info
    var node_info = {}
    for(var x in nodes){
      var node = nodes[x];
      node_info[node.node_id] = {
        'hasInboundConnection': false,
        'hasOutboundConnection': false,
        'hasExitConnection': false,
        'hasInnerConnection': false
      }
    }
    // traverse scenario node tree
    for(var x in nodes) {
      var node = nodes[x];
      for (var y in node.edges){
        var edge = node.edges[y];
        var edge_type = 'normal';
        if (edge.edge_type !== undefined){
          edge_type = edge.edge_type;
        }

        if (edge_type == 'hidden' ){ // hidden edge
          var to_node_id = edge.to_node_id;
          if (to_node_id == null || node_info[to_node_id] == undefined){
            continue;
          }else if(to_node_id == node.node_id){
            // inner connection: the node connect to itself
            node_info[node.node_id].hasInnerConnection = true;
          }
        }else if (edge_type == 'qq'){  // qq edge
          for(var z in edge.candidate_edges){
            var to_node_id = edge.candidate_edges[z].to_node_id;
            if (to_node_id == null || to_node_id == node.node_id || node_info[to_node_id] == undefined){
              continue;
            }else if(to_node_id == '0'){
              node_info[node.node_id].hasExitConnection = true;
            }else{
              node_info[to_node_id].hasInboundConnection = true;
              node_info[node.node_id].hasOutboundConnection = true;
            }
          }
        }else{ // normal edge, else_into edge
          var to_node_id = edge.to_node_id;
          if (to_node_id == null || node_info[to_node_id] == undefined){
            continue;
          }
          
          if(edge_type == 'else_into'){
            // special logic for else_into edge
            if (to_node_id == node.node_id){
              // inner connection: the node connect to itself
              node_info[node.node_id].hasInnerConnection = true;
            }
          }else if (edge_type == 'normal'){
            // special logic for normal edge
          }

          // common logic for both normal and else_into edges
          if(to_node_id == node.node_id){
            continue;
          }else if(to_node_id == '0'){
            node_info[node.node_id].hasExitConnection = true;
          }else{
            node_info[to_node_id].hasInboundConnection = true;
            node_info[node.node_id].hasOutboundConnection = true;
          }
        }
      }
    }
    return node_info
  }

  function checkNodeFormat(node, node_info) {
    if (node.warnings == undefined){
      node.warnings = []
    }else{
      node.warnings.length = 0
    }
    
    if (node.node_type == 'entry') {
      checkEntryNodeFormat(node);
    }else if (node.node_type == 'dialogue') {
      checkDialogueNodeFormat(node, node_info);
    }else if (node.node_type == 'parameter_collecting') {
      checkParameterCollectingNodeFormat(node);
    }
    checkInboundConnection(node, node_info);
    checkOutboundConnection(node, node_info);
  }

  function checkEntryNodeFormat(node){
    if (node.entry_condition_rules === undefined || node.entry_condition_rules.length == 0){
      node.warnings.push({
        'type': 'missing_entry_trigger',
        'warning_msg': '缺少触发条件'
      });
    }
  }

  function checkDialogueNodeFormat(node, node_info){
    // check existence of responses
    for (var index in node.content.questions){
      var question = node.content.questions[index];
      if (question.question_type === undefined || question.question_type == 'skip_response'){
          continue;
      }
      
      if (question.msg === ''){
        warning = undefined
        if (question.question_type == 'initial_response'){
          warning = {
            'type': 'missing_response',
            'warning_msg': '预设文本栏位不能为空白，请填入询问语句。'
            // 'warning_msg': '解析文本目前为空白，节点将不会回复任何引导语句。'
          }
        } else if (question.question_type == 'failure_response'){
          if (node_info[node.node_id].hasInnerConnection == true){
            warning = {
              'type': 'missing_response',
              'warning_msg': '解析失败文本栏位不能为空白，请填入解析失败时的提示语句。'
              // 'warning_msg': '解析失败文本目前为空白，节点将不会回复解析失败提示语句。'
            }
          }
        }
        if (warning != undefined){
          node.warnings.push(warning)
        }
      }
    }
  }

  function checkParameterCollectingNodeFormat(node){
    var missing_msg = false;
    var missing_parse_failed_msg = false;
    for (var index in node.content.questions){
      var question = node.content.questions[index];
      if(question.msg === ''){
        missing_msg = true;
      }
      if(question.parse_failed_msg === ''){
        missing_parse_failed_msg = true;
      }
    }
    if(missing_msg == true){
      node.warnings.push({
        'type': 'missing_response',
        'warning_msg': '参数询问文本栏位不能为空白，请填入询问语句。'
      });
    }
    if(missing_parse_failed_msg == true){
      node.warnings.push({
        'type': 'missing_response',
        'warning_msg': '解析失败文本栏位不能为空白，请填入解析失败时的提示语句。'
      });
    }
  }

  function checkOutboundConnection(node, node_info){
    var this_node = node_info[node.node_id];
    if(this_node.hasExitConnection == true){
      node.warnings.push({
        'type': 'has_exit_connection',
        'warning_msg': '出口节点'
      });
    }
    if(this_node.hasOutboundConnection == false && this_node.hasExitConnection == false){
      node.warnings.push({
        'type': 'missing_outbound_connection',
        'warning_msg': '请在此节点新增至少一个指向其他节点的连线'
      });
    }    
  }

  function checkInboundConnection(node, node_info){
    if (node.node_type == 'entry') {
      return;
    }
    var this_node = node_info[node.node_id];
    if(this_node.hasInboundConnection == false){
      node.warnings.push({
        'type': 'missing_inbound_connection',
        'warning_msg': '请新增至少一个指向此节点的连线'
      });
    }
  }

  function addMoreConditions(id) {
    var moreConditionsHTML = $("#moreConditionsTemplate").val();
    $("#moreconditions_module"+id).attr("lastcondition", parseInt($("#moreconditions_module"+id).attr("lastcondition"))+1);
    $("#moreconditions_module"+id).append(moreConditionsHTML);
    var parent = $("#moreconditions_module"+id).children("div:last");
    var sourceUI = parent.find('[name=searchSource]');
    insertSourceOptions(sourceUI);
    var select = $(".thenGoto > select", parent);
    var qq_select = $(".qq_sentences > select", parent);
    for(var index in window.moduleData.nodes) {
      var node = window.moduleData.nodes[index];
      //should not choose entry node
      if(node.node_type == "entry"){
        continue;
      }
      //should not choose exit node in entry node
      if (node.description == 'Exit'){
        if (window.currentNode && window.currentNode.node_type == "entry") {
          continue;
        }
      }
      select.append('<option value="' + node.node_id + '">'+ he.encode(node.description) + ' (ID: ' + node.node_id + ')</option>');
      qq_select.append('<option value="' + node.node_id + '">'+ he.encode(node.description) + ' (ID: ' + node.node_id + ')</option>');
    }
    $("#moreconditions_module"+id).sortable();
    select.val('').multiselect({
      enableCaseInsensitiveFiltering: true
    });
    qq_select.val('').multiselect({
      enableCaseInsensitiveFiltering: true
    });
  }

  function addMoreTriggers(id) {
    var moreTriggersHTML = $("#moreTriggersTemplate").val();
    $("#moretriggers_module"+id).append(moreTriggersHTML);
    var parent = $("#moretriggers_module"+id).children("div:last");
    var sourceUI = parent.find('[name=searchSource]');
    insertSourceOptions(sourceUI);
    $("#moretriggers_module"+id).sortable();
  }

  function addMoreQQSentences(obj) {
    var moreQQSHTML = $("#moreQQSentencesTemplate").val();
    obj.append(moreQQSHTML);
    var qq_select = $(".qq_sentences > select:last", obj);
    for(var index in window.moduleData.nodes) {
      var node = window.moduleData.nodes[index];
      //should not choose entry node
      if(node.node_type == "entry"){
        continue;
      }
      //should not choose exit node in entry node
      if (!(window.currentNode.node_type == "entry" && node.description == 'Exit')){
        qq_select.append('<option value="' + node.node_id + '">'+ he.encode(node.description) + ' (ID: ' + node.node_id + ')</option>');
      }
    }
    qq_select.val('').multiselect({
      enableCaseInsensitiveFiltering: true
    });
  }

  function addMoreNLUParameter(id) {
    var moreNluPcEntityHTML = $("#moreNluPcEntityTemplate").val();
    $("#moreNLUParameter_module"+id).append(moreNluPcEntityHTML);
    $("#moreNLUParameter_module"+id).sortable();
  }

  function addMoreParameter(id) {
    var moreParameterHTML = $("#moreParameterTemplate").html();
    $("#moreParameter_module"+id).append(moreParameterHTML);
    var parserFunUI = $("#moreParameter_module"+id).children("div:last").find('[name=searchType]');
    insertParamParserFunOptions(parserFunUI);
    $("#moreParameter_module"+id).sortable();
  }

  function addMoreParameterParsers(obj) {
    var morePPHTML = $("#moreParameterParsersTemplate").val();
    obj.append(morePPHTML);
    var parserFunUI = obj.children('div:last').find('[name=searchType]');
    insertParamParserFunOptions(parserFunUI);
  }

  function addMoreIfCondition(obj) {
    var moreIfHTML = $("#moreIfConditionTemplate").val();
    obj.append(moreIfHTML);
    var sourceUI = obj.children('div:last').find('[name=searchSource]');
    insertSourceOptions(sourceUI);
  }

  function addMoreParsers(obj){
    var moreParsersHTML = $('#moreParsersTemplate').val();
    obj.append(moreParsersHTML);
    var parserFunUI = obj.children('div:last').find('[name=parserType]');
    insertParserFunOptions(parserFunUI);
  }

  function addMoreIfTrigger(obj) {
    var moreIfHTML = $("#moreIfTriggerTemplate").val();
    obj.append(moreIfHTML);
    var sourceUI = obj.children('div:last').find('[name=searchSource]');
    insertSourceOptions(sourceUI);
  }

  function addMoreRegExpGroup(obj) {
    var moreRegExpHTML = $("#moreRegExpTemplate").val();
    obj.append(moreRegExpHTML);
  }

  function insertElseIntoUIFromJSON(connectionsElseUI, node){
    if (node.edges.length > 0){
      var id = node.edges[node.edges.length-1].to_node_id;
      if(id == node.node_id){
        connectionsElseUI.multiselect('select', "null");
      }else if(id === null){
        connectionsElseUI.multiselect('select', "null");
      }else{
        connectionsElseUI.multiselect('select', id);
      }
    }else{
      connectionsElseUI.multiselect('select', "null");
    }
  }

  function addElseOptions(connectionsElseUI, node){
    if (node.node_type == "entry" || node.ui_node_type == "router" || node.ui_node_type == "restful"){
      //should not choose null target in entry node and router node (null target will turn to infinite loop)
      connectionsElseUI.find('option').remove();
    }
    //add else go to options
    for(var index in window.moduleData.nodes) {
      var object = window.moduleData.nodes[index];
      //should not choose self node and entry node
      if(object.node_id == node.node_id || object.node_type == "entry"){
        continue;
      }
      //should not choose exit node in entry node
      if (!(node.node_type == "entry" && object.description == 'Exit')){
        connectionsElseUI.append('<option value="' + object.node_id + '">'+ he.encode(object.description) + ' (ID: ' + object.node_id + ')</option>');
      }
    }
    connectionsElseUI.val('').multiselect({
      enableCaseInsensitiveFiltering: true,
      buttonWidth: 'auto'
    });
  }

  function insertQQEdgesIntoUIFromJSON(eltEdge, edge){
    var eltIfContent = eltEdge.find('.if-content');
    var content = eltIfContent.children('div:first');
    content.children('[name=searchSource]').val('text');
    searchSourceChange(content.children('[name=searchSource]')[0]);
    content.children('[name=searchType]').val('qq_similarity');
    searchFunctionChange(content.children('[name=searchType]')[0]);
    content.find("div.qq_threshold > input").val(edge.threshold);
    for(var idx=0; idx<edge.candidate_edges.length; idx++){
      if (idx > 0){
        addMoreQQSentences(content);
      }
      var qqs_element = content.children("div.qq_sentences:last");
      qqs_element.children("input").val(edge.candidate_edges[idx].tar_text);
      qqs_element.children("select").multiselect('select', edge.candidate_edges[idx].to_node_id);
    }
  }

  function insertParserFunIntoUIFromJSON(settingsUI, node){
    var function_name = node.edges[1].condition_rules[0][1].functions[0].function_name;
    var content = node.edges[1].condition_rules[0][1].functions[0].content;
    if (typeof content === 'object'){
      content = content.tags;
    }
    var contextList = content.split(",");
    var skipKeyList = node.edges[1].condition_rules[0][0].functions[0].content;
    var parserTypeUI = settingsUI.find('[name=parserType]');
    if(function_name == 'common_parser'){
      parserTypeUI.val('common_parser');
      searchParserChange(parserTypeUI[0]);
    }else if(function_name == 'hotel_parser'){
      parserTypeUI.val('hotel_parser');
      searchParserChange(parserTypeUI[0]);
    }else if(function_name == 'task_parser'){
      parserTypeUI.val('task_parser');
      searchParserChange(parserTypeUI[0]);
    }
    var contentSelect = settingsUI.find('[name=parserTypeContent]').children('.multiselect').multiselect({
      includeSelectAllOption: true,
      enableCaseInsensitiveFiltering: true,
    });
    for(var idx in contextList){
      contentSelect.multiselect('select', contextList[idx]);
    }
    var requiredSelect = settingsUI.find('[name=requiredData]').children('.multiselect').multiselect({
      includeSelectAllOption: true,
      enableCaseInsensitiveFiltering: true,
    });
    for(var idx in skipKeyList){
      requiredSelect.multiselect('select', skipKeyList[idx]['key'].replace("_"+node.node_id,''));
    }
    if(typeof node.default_parser_with_suffix !== 'undefined'){
      if(node.default_parser_with_suffix){
        settingsUI.find('[name=with_suffix]').prop("checked", true);
      }
    }
  }

  function insertConditionsIntoUIFromJSON(rules, conditionsUI, classStr){
    for (var idx in rules) {
      var rule = rules[idx];  
      var fun = rule.functions[0];
      var type = fun.function_name;
      var eltIfContent = conditionsUI.children(classStr);
      if (idx > 0){
        addMoreIfCondition(eltIfContent);
      }
      var content = eltIfContent.children('div:last');
      content.children('[name=searchSource]').val(rule.source);
      if(classStr == '.if-content'){
        searchSourceChange(content.children('[name=searchSource]')[0]);
      }
      content.children('[name=searchType]').val(fun.function_name);
      searchFunctionChange(content.children('[name=searchType]')[0]);
      if (type == "key_val_match" || type == "list_length_match") {
        content.children("div.triggers0").children("select").val(fun.content[0]['compare']);
        content.children("div.triggers2").children("input").val(fun.content[0]['key']);
        content.children("div.triggers3").children("input").val(fun.content[0]['val']);
      }
      else if (type == "key_key_match") {
        content.children("div.triggers0").children("select").val(fun.content[0]['compare']);
        content.children("div.triggers2").children("input").val(fun.content[0]['key1']);
        content.children("div.triggers3").children("input").val(fun.content[0]['key2']);
      }
      else if (type == "assign_value") {
        content.children("div.triggers2").children("input").val(fun.content[0]['key']);
        content.children("div.triggers3").children("input").val(fun.content[0]['val']);
      }
      else if (type == "regular_exp") {
        content.children("div.triggers0").children("input").val(fun.content['pattern']);
        for(var oid=0; oid<fun.content['operations'].length; oid++){
          if (oid > 0){
            addMoreRegExpGroup(content);
          }
          var reg_exp_element = content.children("div.reg_exp:last");
          $(reg_exp_element.children("input")[0]).val(fun.content['operations'][oid]['index']);
          $(reg_exp_element.children("input")[1]).val(fun.content['operations'][oid]['key']);
        }
      }
      else if (type == "regular_exp_from_var") {
        content.children("div.triggers0").children("input").val(fun.content['pattern']);
        content.children("div.triggers1").children("input").val(fun.content['from_key']);
        for(var oid=0; oid<fun.content['operations'].length; oid++){
          if (oid > 0){
            addMoreRegExpGroup(content);
          }
          var reg_exp_element = content.children("div.reg_exp:last");
          $(reg_exp_element.children("input")[0]).val(fun.content['operations'][oid]['index']);
          $(reg_exp_element.children("input")[1]).val(fun.content['operations'][oid]['key']);
        }
      }
      else if (type == "contain_key" || type == "not_contain_key") {
        content.children("div.triggers0").children("input").val(fun.content[0]['key']);
      }else if (type == "user_custom_parser") {
        content.children("div.triggers0").children("select").val(fun.content['trans']);
        content.children("div.triggers1").children("input").val(fun.content['to_key']);
      }else if (type == "user_custom_transform") {
        content.children("div.triggers0").children("select").val(fun.content['trans']);
        content.children("div.triggers1").children("input").val(fun.content['from_key']);
        content.children("div.triggers2").children("input").val(fun.content['to_key']);
      }else if (type == "hotel_parser" || type == "common_parser" || type == "task_parser"){
        var multiselect = content.children("div.triggers0").children(".multiselect");
        var content = fun.content;
        if(typeof content === 'object'){
          content = content.tags;
        }
        var contextList = content.split(",");
        for(var cid in contextList){
          multiselect.multiselect('select', contextList[cid]);
        }
      }else if (type == "counter_check" || type == "cu_parser"){
        content.children("div.triggers0").children("select").val(fun.content);
      }else if (type == "polarity_parser"){
        content.children("div.triggers0").children("select").val(fun.content.key);
      }else if (type == "api_parser"){
        content.children("div.triggers0").children("input").val(fun.content);
        if(fun.content_text_array){
          content.children("div.triggers1").children("input").val(fun.content_text_array.join(','));
        }
      } else {
        content.children("div.triggers0").children("input").val(fun.content);
      }
    }
  }

  function updateConnections() {
    window.toastr.options = {"positionClass": "toast-bottom-right"};
    window.toastr.success('连结已更新');
    var connctionsUI = $("#connections");
    var nodeId = window.currentNode.node_id;
    var node = getNodeData(nodeId);
    if(node.node_type == "parameter_collecting"){
      connctionsUI = $("#params_connections");
    }else if(node.ui_node_type == "polarity"){
      connctionsUI = $("#polarity_connections");
    }else if(node.node_type == "restful"){
      connctionsUI = $("#restful_connections");
    }
    var connectsTo = [];
    connctionsUI.find('.connectionSelect').each( function( index, element ){
      connectsTo.push( $( this ).val() );
    });
    connctionsUI.find('.exceedThenGoTo').each( function( index, element ){
      connectsTo.push( $( this ).val() );
    });
    connctionsUI.find('.elseGoTo').each( function( index, element ){
      connectsTo.push( $( this ).val() );
    });
    var connectsToString = connectsTo.join();
    window.$("#"+window.currentNode.node_id).attr("connectsTo", connectsToString);
    window.updateConnectionLines();
  }

  function getNodeData(nodeId) {
    for(var index in window.moduleData.nodes){
      var node = window.moduleData.nodes[index];
      if (node.node_id == nodeId){
        return node;
      }
    }
    return null;
  }

  function setNodeData(newNode) {
    var nodeId = newNode.node_id;
    for(var index in window.moduleData.nodes){
      var node = window.moduleData.nodes[index];
      if (node.node_id == nodeId){
        window.moduleData.nodes[index] = newNode;
      }
    }
  }

  function getFormData(datas, attr) {
    for(var index in datas){
      var data = datas[index];
      if (data.name == attr){
        return data.value;
      }
    }
    return '';
  }

  function insertInitRespNFailureRespIntoJSONFromUI(settingsUI, node){
    node.content.questions = [];

    // add skip node rule
    if (settingsUI.find('[name=parserType]').val() != 'none'){
      if(settingsUI.find('[name=with_suffix]').prop('checked')){
        node.default_parser_with_suffix = true;
      }else{
        node.default_parser_with_suffix = false;
      }
      var containKeys = settingsUI.find('[name=requiredData]').children('.multiselect').val();
      if (containKeys != null){
        for(var id = 0; id < containKeys.length; id++){
          if(containKeys[id] == "Select all"){
            containKeys.splice(id, 1);
          }
        }
        var skipRules = [];
        for(var idx in containKeys){
          var tag = '';
          tag = containKeys[idx];
          var key = '';
          if(settingsUI.find('[name=with_suffix]').prop('checked')){
            key = tag+"_"+node.node_id;
          }else{
            key = tag;
          }
          skipRules.push([
            {
              "source": "global_info",
              "functions": [
                {
                  "function_name": "contain_key",
                  "content": [{"key":key}]
                }
              ]
            }
          ]);
        }

        node.content.questions.push(
          {
            "question_type": "skip_response",
            "msg": null,
            "condition_rules": skipRules
          }
        );
      }
    }

    // add failure response
    node.content.questions.push(
      {
        "question_type": "failure_response",
        "msg": settingsUI.find('[name=failureResponse]').val(),
        "condition_rules": [
          [
            {
              "source": "global_info",
              "functions": [
                {
                  "function_name": "key_val_match",
                  "content": [
                    {
                      "key": "parsing_failed",
                      "val": true,
                      "compare": "=="
                    }
                  ]
                }
              ]
            }
          ]
        ]
      }
    );

    // add initial response
    node.content.questions.push(
      {
        "question_type": "initial_response",
        "msg": settingsUI.find('[name=initialResponse]').val(),
        "condition_rules": []
      }
    );
  }

  function getConditionsFromUI(elements, node_id){
    var rules = [];
    var global_vars = [];
    for (var index=0; index<elements.length; index++) {
      var selectElts = $(elements[index]).children("select");
      var source = $(selectElts[0]).val();
      var type = $(selectElts[1]).val();
      var triggers0 = $(elements[index]).children("div.triggers0").children("input")[0];
      var triggers0_text_array = [];
      if (typeof triggers0 === "undefined"){
        triggers0 = $(elements[index]).children("div.triggers0").children("select")[0];
        $(elements[index]).children("div.triggers0").find("select option:selected").each(function() {
          if(this.text != "Select all"){
            triggers0_text_array.push(this.text);
          }
        });
      }
      var triggers1 = $(elements[index]).children("div.triggers1").children("input")[0];
      var triggers2 = $(elements[index]).children("div.triggers2").children("input")[0];
      var triggers3 = $(elements[index]).children("div.triggers3").children("input")[0];
      var reg_exps = $(elements[index]).children("div.reg_exp");
      var fun = {};
      if (type == "key_val_match" || type == "list_length_match") {
        fun = {
          "function_name": type,
          "content": [
            {
              "key": $(triggers2).val().trim(),
              "val": $(triggers3).val().trim(),
              "compare": $(triggers0).val()
            }
          ]
        }
      }
      else if (type == "key_key_match") {
        fun = {
          "function_name": type,
          "content": [
            {
              "key1": $(triggers2).val().trim(),
              "key2": $(triggers3).val().trim(),
              "compare": $(triggers0).val()
            }
          ]
        }
      }
      else if (type == "assign_value") {
        fun = {
          "function_name": type,
          "content": [
            {
              "key": $(triggers2).val().trim(),
              "val": $(triggers3).val().trim(),
              "operation": "set_to_global_info"
            }
          ]
        }
      }
      else if (type == "regular_exp") {
        var operations = [];
        for(var rid=0; rid<reg_exps.length; rid++){
          operations.push(
              {
                "operation": 'set_to_global_info',
                "index": parseInt($($(reg_exps[rid]).children('input')[0]).val() || 0),
                "key": $($(reg_exps[rid]).children('input')[1]).val().trim()
              }
          );
          global_vars.push($($(reg_exps[rid]).children('input')[1]).val().trim());
        }
        fun = {
          "function_name": type,
          "content": {
            "pattern": $(triggers0).val().trim(),
            "operations": operations
          }
        }
      }
      else if (type == "regular_exp_from_var") {
        var operations = [];
        for(var rid=0; rid<reg_exps.length; rid++){
          operations.push(
              {
                "operation": 'set_to_global_info',
                "index": parseInt($($(reg_exps[rid]).children('input')[0]).val() || 0),
                "key": $($(reg_exps[rid]).children('input')[1]).val().trim()
              }
          );
          global_vars.push($($(reg_exps[rid]).children('input')[1]).val().trim());
        }
        fun = {
          "function_name": type,
          "content": {
            "pattern": $(triggers0).val().trim(),
            "from_key": $(triggers1).val().trim(),
            "operations": operations
          }
        }
      }
      else if (type == "contain_key" || type == "not_contain_key") {
        fun = {
          "function_name": type,
          "content": [{
            "key": $(triggers0).val().trim()
          }]
        }
      }else if(type == "user_custom_transform"){
        fun = {
          "function_name": type,
          "content": {
            "trans": $(triggers0).val(),
            "from_key": $(triggers1).val().trim(),
            "to_key": $(triggers2).val().trim()
          }
        }
        global_vars.push($(triggers2).val());
      }else if(type == "user_custom_parser"){
        fun = {
          "function_name": type,
          "content": {
            "trans": $(triggers0).val(),
            "to_key": $(triggers1).val().trim()
          }
        }
        global_vars.push($(triggers1).val());
      }else if(type == "common_parser" ||
               type == "task_parser"   ||
               type == "hotel_parser"){
        fun = {
          "function_name": type,
          "content": {
            "tags": $(triggers0).val() == null ? '' : $(triggers0).val().toString().replace("Select all,",""),
            "key_suffix": "_"+node_id
          },
          "content_text_array": triggers0_text_array
        } 
        for(var tag_id = 0; tag_id < triggers0_text_array.length; tag_id++){
          global_vars.push(triggers0_text_array[tag_id]+"_"+node_id);
        }
      }else if(type == "polarity_parser"){
        fun = {
          "function_name": type,
          "content": {
            "key": $(triggers0).val(),
            "key_suffix": "_"+node_id
          },
          "content_text_array": triggers0_text_array
        } 
        for(var tag_id = 0; tag_id < triggers0_text_array.length; tag_id++){
          global_vars.push(triggers0_text_array[tag_id]+"_"+node_id);
        }
      }else if(type == "api_parser"){
        let keyStr = $(triggers1).val().toString().trim();
        let keyArray = keyStr.split(',');
        fun = {
          "function_name": type,
          "content": $(triggers0).val() == null ? '' : $(triggers0).val().toString().trim(),
          "content_text_array": keyArray,
        }
        global_vars = global_vars.concat(keyArray);
      }else {
        fun = {
          "function_name": type,
          "content": $(triggers0).val() == null ? '' : $(triggers0).val().toString().trim(),
          "content_text_array": triggers0_text_array
        }
      }

      rules.push({
          "source": source,
          "functions": [fun]
      });
    }
    return [rules, global_vars];
  }

  function insertHiddenEdgesIntoJSONFromUI(settingsUI, nodeId, node){
    // get node_dialogue_cnt_limit
    var connectionsUI = $('#connections');
    var roundLimit = parseInt(connectionsUI.find(".roundLimit").val()) || window.moduleData.setting.sys_node_dialogue_cnt_limit;

    var containKeys = settingsUI.find('[name=requiredData]').children('.multiselect').val();
    if(containKeys != null){
      for(var id = 0; id < containKeys.length; id++){
        if(containKeys[id] == "Select all"){
          containKeys.splice(id, 1);
        }
      }
    }
    var keyObjs = []
    for(var idx in containKeys){
      var tag = '';
      tag = containKeys[idx];
      var key = '';
      if(settingsUI.find('[name=with_suffix]').prop('checked')){
        key = tag+"_"+nodeId;
      }else{
        key = tag;
      }
      keyObjs.push({"key":key});
    }
    //(skip if global val get) (set error true)
    //(skip if global val get) confirm
    node.edges.push({
      "edge_type": "hidden",
      "to_node_id": null,
      "condition_rules": [
        [
          {
            "source": "global_info",
            "functions": [
              {
                "function_name": "not_contain_key",
                "content": keyObjs
              }
            ]
          }
        ]
      ],
      "actions": [
        {
          "operation": "set_to_global_info",
          "key": "parsing_failed",
          "val": true
        },
        {
          "operation": "update_confirm_status"
        },
        {
            "operation": "set_to_global_info",
            "key": "sys_node_dialogue_cnt_limit",
            "val": roundLimit
        }
      ]
    });

    //(skip if global val get) parser (set error false)
    var contentList = settingsUI.find('[name=parserTypeContent]').children('.multiselect').val();
    if (contentList != null){
      for(var id = 0; id < contentList.length; id++){
        if(contentList[id] == "Select all"){
          contentList.splice(id, 1);
        }
      }
    }
    settingsUI.find('[name=parserTypeContent]').children('.multiselect').find("option:selected").each(function() {
      if(this.text != "Select all"){
        node.global_vars.push(this.text+"_"+nodeId);
      }
    });
    node.edges.push({
      "edge_type": "hidden",
      "to_node_id": null,
      "condition_rules": [
        [
          {
            "source": "global_info",
            "functions": [
              {
                "function_name": "not_contain_key",
                "content": keyObjs
              }
            ]
          },
          {
            "source": "text",
            "functions": [
              {
                "function_name": settingsUI.find('[name=parserType]').val(),
                "content": {
                  "key_suffix": "_"+nodeId,
                  "tags": ""+contentList
                }
              }
            ]
          }
        ]
      ],
      "actions": [
        {
          "operation": "set_to_global_info",
          "key": "parsing_failed",
          "val": false
        }
      ]
    });

    //no global val jump self / do nothing
    var target = null
    var requiredData = settingsUI.find('[name=requiredData]').children('.multiselect').val();
    if(typeof requiredData !== 'undefined' && requiredData != null){
      target = nodeId;
    }
    node.edges.push({
      "edge_type": "hidden",
      "to_node_id": target,
      "condition_rules": [
        [
          {
            "source": "global_info",
            "functions": [
              {
                "function_name": "key_val_match",
                "content": [
                  {
                    "key": "sys_node_dialogue_cnt",
                    "val": roundLimit,
                    "compare": "<"
                  }
                ]
              },
              {
                "function_name": "counter_check",
                "content": "scenario_counter_rev"
              },
              {
                "function_name": "not_contain_key",
                "content": keyObjs
              }
            ]
          }
        ]
      ]
    });
  }

  function insertHiddenEdgesIntoJSONForEntryNode(node){
    //confirm
    node.edges.push({
      "edge_type": "hidden",
      "to_node_id": null,
      "condition_rules": [],
      "actions": [
        {
          "operation": "set_to_global_info",
          "key": "sys_scenario_dialogue_cnt",
          "val": 0
        },
        {
          "operation": "set_to_global_info",
          "key": "sys_node_dialogue_cnt",
          "val": 0
        },
        {
            "operation": "set_to_global_info",
            "key": "sys_scenario_dialogue_cnt_limit",
            "val": window.moduleData.setting.sys_scenario_dialogue_cnt_limit
        },
        {
            "operation": "set_to_global_info",
            "key": "sys_node_dialogue_cnt_limit",
            "val": window.moduleData.setting.sys_node_dialogue_cnt_limit
        }
      ]
    });

    //dummy
    node.edges.push({
      "edge_type": "hidden",
      "to_node_id": null,
      "condition_rules": []
    });

    //dummy
    node.edges.push({
      "edge_type": "hidden",
      "to_node_id": null,
      "condition_rules": []
    });
  }

  function insertHiddenEdgesIntoJSONForNoDefaultParserNode(settingsUI, node){
    // get node_dialogue_cnt_limit
    var connectionsUI = $('#connections');
    var roundLimit = parseInt(connectionsUI.find(".roundLimit").val()) || window.moduleData.setting.sys_node_dialogue_cnt_limit;
    //confirm
    node.edges.push({
      "edge_type": "hidden",
      "to_node_id": null,
      "condition_rules": [],
      "actions": [
        {
          "operation": "update_confirm_status"
        },
        {
            "operation": "set_to_global_info",
            "key": "sys_node_dialogue_cnt_limit",
            "val": roundLimit
        }
      ]
    });

    //dummy
    node.edges.push({
      "edge_type": "hidden",
      "to_node_id": null,
      "condition_rules": []
    });

    //dummy (keep node dialogues cnt into edge)
    node.edges.push({
      "edge_type": "hidden",
      "to_node_id": null,
      "condition_rules": [
        [
          {
            "source": "global_info",
            "functions": [
              {
                "function_name": "key_val_match",
                "content": [
                  {
                    "key": "sys_node_dialogue_cnt",
                    "val": roundLimit,
                    "compare": "<"
                  }
                ]
              }
            ]
          }
        ]
      ]
    });
  }

  function insertQQEdgesIntoJSONFromUI(element, node){
    var threshold = $(element).find("div.qq_threshold > input").val();
    if(threshold == ""){
      threshold = "0";
    }
    var candidate_edges = [];
    var qqs_elements = $(element).children("div.qq_sentences");
    for (var qqsId=0; qqsId<qqs_elements.length; qqsId++) {
      var qqs_sentence = $($(qqs_elements[qqsId]).children("input")[0]).val().trim();
      var qqs_target = $($(qqs_elements[qqsId]).children("select")[0]).val().trim();
      candidate_edges.push({
        "to_node_id": qqs_target,
        "tar_text": qqs_sentence
      });
    }
    node.edges.push({
      "threshold": threshold,
      "edge_type": "qq",
      "candidate_edges": candidate_edges
    });
  }

  function insertEdgeIntoJSONwithRules(rules, to_node_id, node){
    if(to_node_id == "null"){
      node.edges.push({
        "edge_type": "normal",
        "to_node_id": null,
        "actions": [],
        "condition_rules": [rules]
      });
    }else{
      node.edges.push({
        "edge_type": "normal",
        "to_node_id": to_node_id,
        "actions": [
          {
            "operation": "set_to_global_info",
            "key": "parsing_failed",
            "val": false
          },{
            "operation": "set_to_global_info",
            "key": "sys_node_dialogue_cnt",
            "val": 0
          }
        ],
        "condition_rules": [rules]
      });
    }
  }

  function insertExceedThenGoToJSONFromUI(connectionsUI, nodeId, node){
    if (node.node_type == "entry" || node.ui_node_type == "router"){
      return;
    }

    var toNodeId = connectionsUI.find(".exceedThenGoTo").val() || 0;
    var roundLimit = parseInt(connectionsUI.find(".roundLimit").val()) || window.moduleData.setting.sys_node_dialogue_cnt_limit;
    node.node_dialogue_cnt_limit = roundLimit;

    node.edges.push({
      "edge_type": "hidden",
      "to_node_id": null,
      "condition_rules": [],
      "actions": [
        {
            "operation": "set_to_global_info",
            "key": "sys_node_dialogue_cnt_limit",
            "val": roundLimit
        }
      ]
    });

    node.edges.push({
      "edge_type": "exceedThenGoTo",
      "to_node_id": toNodeId,
      "condition_rules": [
        [
          {
            "source": "global_info",
            "functions": [
              {
                "content": "node_counter",
                "function_name": "counter_check"
              }
            ]
          }
        ]
      ],
      "actions": [
        {
          "operation": "set_to_global_info",
          "val": false,
          "key": "parsing_failed"
        },
        {
          "operation": "set_to_global_info",
          "key": "sys_node_dialogue_cnt",
          "val": 0
        }
      ]
    })
  }

  function insertElseIntoJSONFromUI(connectionsUI, nodeId, node){
    if (connectionsUI.find('[name=elseGoTo]').val() == 'null'){
      node.edges.push({
        "edge_type": "else_into",
        "to_node_id": nodeId,
        "condition_rules": [],
        "actions": [
          {
            "operation": "set_to_global_info",
            "key": "parsing_failed",
            "val": true
          }
        ]
      });
    }else{
      node.edges.push({
        "edge_type": "else_into",
        "to_node_id": connectionsUI.find('[name=elseGoTo]').val(),
        "condition_rules": [],
        "actions": [
          {
            "operation": "set_to_global_info",
            "key": "parsing_failed",
            "val": false
          },{
            "operation": "set_to_global_info",
            "key": "sys_node_dialogue_cnt",
            "val": 0
          }
        ]
      });
    }
  }

  function searchParserChange(obj){
    if(obj.value == "none"){
      $(obj).parent().find("span.name0").html("无");
    }else if(obj.value == "common_parser"){
      $(obj).parent().find("[name=parserTypeContent]").html('\
          <select name="parseTarget" style="width:150px; display:none; !important" class="multiselect margin-bottom-10 form-control" multiple="multiple">'
          + common_parser_options +
          '</select>');
      $(obj).parent().find("[name=requiredData]").html('\
          <select name="parseTarget" style="width:150px; display:none; !important" class="multiselect margin-bottom-10 form-control" multiple="multiple">'
          + common_parser_required_options +
          '</select>');
    }else if(obj.value == "hotel_parser"){
      $(obj).parent().find("span.name0").html('\
          <select name="parseTarget" style="width:150px; display:none; !important" class="multiselect margin-bottom-10 form-control" multiple="multiple">'
          + hotel_parser_options +
          '</select>');
    }else if(obj.value == "task_parser"){
      $(obj).parent().find("[name=parserTypeContent]").html('\
          <select name="parseTarget" style="width:150px; display:none; !important" class="multiselect margin-bottom-10 form-control" multiple="multiple">'
          + task_parser_options +  
          '</select>');
      $(obj).parent().find("[name=requiredData]").html('\
          <select name="parseTarget" style="width:150px; display:none; !important" class="multiselect margin-bottom-10 form-control" multiple="multiple">'
          + task_parser_required_options +  
          '</select>');
    }
    $(obj).parent().find("span.name0").children('.multiselect').multiselect({
      includeSelectAllOption: true,
      enableCaseInsensitiveFiltering: true
    });
  }

  function insertParamParserFunOptions(parserFunUI){
    parserFunUI.append('<option value="common_parser">通用语句解析器</option>');
    parserFunUI.append('<option value="task_parser">场景语句解析器</option>');
    parserFunUI.append('<option value="hotel_parser">酒店预订语句解析器</option>');
    parserFunUI.append('<option value="regular_exp">正则表示式</option>');
    parserFunUI.append('<option value="user_custom_parser">转换数据解析器</option>');
    parserFunUI.append('<option value="api_parser">Web API 调用</option>');
    searchFunctionChange(parserFunUI[0]);
  }

  function insertParserFunOptions(parserFunUI){
    parserFunUI.append('<option value="none">无</option>');
    parserFunUI.append('<option value="common_parser">通用语句解析器</option>');
    parserFunUI.append('<option value="task_parser">场景语句解析器</option>');
    parserFunUI.append('<option value="hotel_parser">酒店预订语句解析器</option>');
    searchParserChange(parserFunUI);
  }

  function insertSourceOptions(sourceUI){
    sourceUI.append('<option value="text">用户输入文本</option>');
    sourceUI.append('<option value="global_info">场景已收集数据</option>');
    sourceUI.append('<option value="cu">语句解析数据</option>');
    searchSourceChange(sourceUI[0]);
  }

  function searchSourceChange(obj){
    var searchType = $(obj).next();
    searchType.find('option').remove();
    if(obj.value=="text"){
      searchType.append('<option value="match">完全相符</option>');
      searchType.append('<option value="contains">包含文本</option>');
      searchType.append('<option value="regular_exp">正则表示式</option>');
      searchType.append('<option value="hotel_parser">酒店预订语句解析器</option>');
      searchType.append('<option value="common_parser">通用语句解析器</option>');
      searchType.append('<option value="task_parser">场景语句解析器</option>');
      searchType.append('<option value="user_custom_parser">转换数据解析器</option>');
      searchType.append('<option value="polarity_parser">是否判斷解析器</option>');
      searchType.append('<option value="api_parser">Web API 调用</option>');
      if ($(obj).prev().text() == "if" && $(obj).parent().parent().parent().parent().parent().parent().attr("id") == "connections" || "params_connections"){ //限制qq_similarity不能串接其他andIf, 限制只能出现在连线分页
        searchType.append('<option value="qq_similarity">语句相似度</option>');
      }
    }else if (obj.value=="global_info") {
      searchType.append('<option value="key_val_match">键值匹配</option>');
      searchType.append('<option value="key_key_match">键键匹配</option>');
      searchType.append('<option value="contain_key">包含键</option>');
      searchType.append('<option value="not_contain_key">不包含键</option>');
      searchType.append('<option value="list_length_match">序列长度匹配</option>');
      searchType.append('<option value="counter_check">轮次检查</option>');
      searchType.append('<option value="user_custom_transform">转换数据</option>');
      searchType.append('<option value="regular_exp_from_var">正则表示式</option>');
      searchType.append('<option value="assign_value">赋值</option>');
    }else if (obj.value=="cu") {
      searchType.append('<option value="cu_parser">语句解析数据提取</option>');
      searchType.append('<option value="custom_cu_parser">自定义语句解析数据提取</option>');
    }
    searchFunctionChange(searchType[0]);
  }

  function searchFunctionChange(obj){
    var CONSTANT = {
      CONTENT: "内容",
      COMPARE: "比较方式",
      VALUE: "值",
      PATTERN: "模式",
      OPERATION: "操作",
      INDEX: "第几符合词",
      URL: "连结",
      KEY: "键",
      FROM_KEY: "来源键",
      TO_KEY: "目的键",
      TRANS: "转换数据"
    }
    removeGlobalVarsTypeahead($(obj).parent().children("div.triggers1").find("input"));
    removeGlobalVarsTypeahead($(obj).parent().children("div.triggers2").find("input"));
    removeGlobalVarsTypeahead($(obj).parent().children("div.triggers3").find("input"));
    if(obj.value=="key_val_match"){
        var triggers0 = $(obj).parent().children("div.triggers0");
        triggers0.show();
        triggers0.children(".btn-group").remove();
        triggers0.children("select").remove();
        triggers0.children("input").remove();
        triggers0.append('\
          <select name="triggers0" style="width:425px; display:inline-block !important" class="form-control">\
            <option value="==">等于</option>\
            <option value="ignore_case_compare">忽略大小写等于</option>\
            <option value="!=">不等于</option>\
            <option value=">">大于</option>\
            <option value=">=">大于等于</option>\
            <option value="<">小于</option>\
            <option value="<=">小于等于</option>\
            <option value="reg_exp">正则表示式</option>\
          </select>');
        $(obj).parent().children("div.triggers1").hide();
        $(obj).parent().children("div.triggers2").show();
        $(obj).parent().children("div.triggers3").show();
        $(obj).parent().children("div.qq_threshold").hide();
        $(obj).parent().children("div.qq_sentences").hide();
        $(obj).parent().children("div.reg_exp").hide();
        $(obj).parent().children("a.andIf").show();
        $(obj).parent().parent().parent().children("div.thenGoto").show();

        $(obj).parent().find("span.name0").html(CONSTANT.COMPARE);
        $(obj).parent().find("span.name2").html(CONSTANT.KEY);
        $(obj).parent().find("span.name3").html(CONSTANT.VALUE);
        insertGlobalVarsTypeahead($(obj).parent().children("div.triggers2").find("input"));
    }else if(obj.value=="key_key_match"){
        var triggers0 = $(obj).parent().children("div.triggers0");
        triggers0.show();
        triggers0.children(".btn-group").remove();
        triggers0.children("select").remove();
        triggers0.children("input").remove();
        triggers0.append('\
          <select name="triggers0" style="width:425px; display:inline-block !important" class="form-control">\
            <option value="==">等于</option>\
            <option value="ignore_case_compare">忽略大小写等于</option>\
            <option value="!=">不等于</option>\
            <option value=">">大于</option>\
            <option value=">=">大于等于</option>\
            <option value="<">小于</option>\
            <option value="<=">小于等于</option>\
            <option value="in">包含于</option>\
          </select>');
        $(obj).parent().children("div.triggers1").hide();
        $(obj).parent().children("div.triggers2").show();
        $(obj).parent().children("div.triggers3").show();
        $(obj).parent().children("div.qq_threshold").hide();
        $(obj).parent().children("div.qq_sentences").hide();
        $(obj).parent().children("div.reg_exp").hide();
        $(obj).parent().children("a.andIf").show();
        $(obj).parent().parent().parent().children("div.thenGoto").show();

        $(obj).parent().find("span.name0").html(CONSTANT.COMPARE);
        $(obj).parent().find("span.name2").html(CONSTANT.KEY);
        $(obj).parent().find("span.name3").html(CONSTANT.KEY);
        insertGlobalVarsTypeahead($(obj).parent().children("div.triggers2").find("input"));
        insertGlobalVarsTypeahead($(obj).parent().children("div.triggers3").find("input"));
    }else if(obj.value=="assign_value"){
      $(obj).parent().children("div.triggers0").hide();
      $(obj).parent().children("div.triggers1").hide();
      $(obj).parent().children("div.triggers2").show();
      $(obj).parent().children("div.triggers3").show();
      $(obj).parent().children("div.qq_threshold").hide();
      $(obj).parent().children("div.qq_sentences").hide();
      $(obj).parent().children("div.reg_exp").hide();
      $(obj).parent().children("a.andIf").show();
      $(obj).parent().parent().parent().children("div.thenGoto").show();

      $(obj).parent().find("span.name2").html(CONSTANT.KEY);
      $(obj).parent().find("span.name3").html(CONSTANT.VALUE);
      insertGlobalVarsTypeahead($(obj).parent().children("div.triggers2").find("input"));
      insertGlobalVarsTypeahead($(obj).parent().children("div.triggers3").find("input"));
  } else if(obj.value == "list_length_match"){
        var triggers0 = $(obj).parent().children("div.triggers0");
        triggers0.show();
        triggers0.children(".btn-group").remove();
        triggers0.children("select").remove();
        triggers0.children("input").remove();
        triggers0.append('\
          <select name="triggers0" style="width:425px; display:inline-block !important" class="form-control">\
            <option value="==">等于</option>\
            <option value="!=">不等于</option>\
            <option value=">">大于</option>\
            <option value=">=">大于等于</option>\
            <option value="<">小于</option>\
            <option value="<=">小于等于</option>\
          </select>');
        $(obj).parent().children("div.triggers1").hide();
        $(obj).parent().children("div.triggers2").show();
        $(obj).parent().children("div.triggers3").show();
        $(obj).parent().children("div.qq_threshold").hide();
        $(obj).parent().children("div.qq_sentences").hide();
        $(obj).parent().children("div.reg_exp").hide();
        $(obj).parent().children("a.andIf").show();
        $(obj).parent().parent().parent().children("div.thenGoto").show();

        $(obj).parent().find("span.name0").html(CONSTANT.COMPARE);
        $(obj).parent().find("span.name2").html(CONSTANT.KEY);
        $(obj).parent().find("span.name3").html(CONSTANT.VALUE);
        insertGlobalVarsTypeahead($(obj).parent().children("div.triggers2").find("input"));
    }else if(obj.value=="regular_exp_from_var"){
        var triggers0 = $(obj).parent().children("div.triggers0");
        triggers0.show();
        triggers0.children(".btn-group").remove();
        triggers0.children("select").remove();
        triggers0.children("input").remove();
        triggers0.append('<input type="text" name="triggers0" style="width:425px; display:inline-block !important" class="form-control">');
        $(obj).parent().children("div.triggers1").show();
        $(obj).parent().children("div.triggers2").hide();
        $(obj).parent().children("div.triggers3").hide();
        $(obj).parent().children("div.qq_threshold").hide();
        $(obj).parent().children("div.qq_sentences").hide();
        $(obj).parent().children("div.reg_exp").show();
        $(obj).parent().children("a.andIf").show();
        $(obj).parent().parent().parent().children("div.thenGoto").show();

        $(obj).parent().find("span.name0").html(CONSTANT.PATTERN);
        $(obj).parent().find("span.name1").html(CONSTANT.FROM_KEY);
        insertGlobalVarsTypeahead($(obj).parent().children("div.triggers1").find("input"));
    }else if(obj.value=="regular_exp"){
        var triggers0 = $(obj).parent().children("div.triggers0");
        triggers0.show();
        triggers0.children(".btn-group").remove();
        triggers0.children("select").remove();
        triggers0.children("input").remove();
        triggers0.append('<input type="text" name="triggers0" style="width:425px; display:inline-block !important" class="form-control">');
        $(obj).parent().children("div.triggers1").hide();
        $(obj).parent().children("div.triggers2").hide();
        $(obj).parent().children("div.triggers3").hide();
        $(obj).parent().children("div.qq_threshold").hide();
        $(obj).parent().children("div.qq_sentences").hide();
        $(obj).parent().children("div.reg_exp").show();
        $(obj).parent().children("a.andIf").show();
        $(obj).parent().parent().parent().children("div.thenGoto").show();

        $(obj).parent().find("span.name0").html(CONSTANT.PATTERN);
    }else if(obj.value=="user_custom_transform"){
        var triggers0 = $(obj).parent().children("div.triggers0");
        triggers0.show();
        triggers0.children(".btn-group").remove();
        triggers0.children("select").remove();
        triggers0.children("input").remove();
        triggers0.append('<select name="triggers0" style="width:425px; display:inline-block !important" class="margin-top-10 form-control"></select>');
        insertMappingTableOptions(triggers0.children("select"));
        $(obj).parent().children("div.triggers1").show();
        $(obj).parent().children("div.triggers2").show();
        $(obj).parent().children("div.triggers3").hide();
        $(obj).parent().children("div.qq_threshold").hide();
        $(obj).parent().children("div.qq_sentences").hide();
        $(obj).parent().children("div.reg_exp").hide();
        $(obj).parent().children("a.andIf").show();
        $(obj).parent().parent().parent().children("div.thenGoto").show();

        $(obj).parent().find("span.name0").html(CONSTANT.TRANS);
        $(obj).parent().find("span.name1").html(CONSTANT.FROM_KEY);
        $(obj).parent().find("span.name2").html(CONSTANT.TO_KEY);
        insertGlobalVarsTypeahead($(obj).parent().children("div.triggers1").find("input"));
    }else if(obj.value=="user_custom_parser"){
        var triggers0 = $(obj).parent().children("div.triggers0");
        triggers0.show();
        triggers0.children(".btn-group").remove();
        triggers0.children("select").remove();
        triggers0.children("input").remove();
        triggers0.append('<select name="triggers0" style="width:425px; display:inline-block !important" class="margin-top-10 form-control"></select>');
        insertMappingTableOptions(triggers0.children("select"));
        $(obj).parent().children("div.triggers1").show();
        $(obj).parent().children("div.triggers2").hide();
        $(obj).parent().children("div.triggers3").hide();
        $(obj).parent().children("div.qq_threshold").hide();
        $(obj).parent().children("div.qq_sentences").hide();
        $(obj).parent().children("div.reg_exp").hide();
        $(obj).parent().children("a.andIf").show();
        $(obj).parent().parent().parent().children("div.thenGoto").show();

        $(obj).parent().find("span.name0").html(CONSTANT.TRANS);
        $(obj).parent().find("span.name1").html(CONSTANT.TO_KEY);
    }else if(obj.value=="qq_similarity"){
        $(obj).parent().children("div.triggers0").hide();
        $(obj).parent().children("div.triggers1").hide();
        $(obj).parent().children("div.triggers2").hide();
        $(obj).parent().children("div.triggers3").hide();
        $(obj).parent().children("div.qq_threshold").show();
        $(obj).parent().children("div.qq_sentences").show();
        $(obj).parent().children("div.reg_exp").hide();
        $(obj).parent().children("a.andIf").hide();
        $(obj).parent().parent().parent().children("div.thenGoto").hide();
    }else if(obj.value=="common_parser"){
        var triggers0 = $(obj).parent().children("div.triggers0");
        triggers0.show();
        triggers0.children(".btn-group").remove();
        triggers0.children("select").remove();
        triggers0.children("input").remove();
        triggers0.append('\
          <select name="triggers0" style="width:425px; display:none; !important" class="multiselect margin-bottom-10 form-control" multiple="multiple">'
          +common_parser_options+
          '</select>');
        triggers0.children('.multiselect').multiselect({
          includeSelectAllOption: true,
          enableCaseInsensitiveFiltering: true,
        });
        $(obj).parent().children("div.triggers1").hide();
        $(obj).parent().children("div.triggers2").hide();
        $(obj).parent().children("div.triggers3").hide();
        $(obj).parent().children("div.qq_threshold").hide();
        $(obj).parent().children("div.qq_sentences").hide();
        $(obj).parent().children("div.reg_exp").hide();
        $(obj).parent().children("a.andIf").show();
        $(obj).parent().parent().parent().children("div.thenGoto").show();
        $(obj).parent().find("span.name0").html(CONSTANT.CONTENT);
    }else if(obj.value=="hotel_parser"){
        var triggers0 = $(obj).parent().children("div.triggers0");
        triggers0.show();
        triggers0.children(".btn-group").remove();
        triggers0.children("select").remove();
        triggers0.children("input").remove();
        triggers0.append('\
          <select name="triggers0" style="width:425px; display:none; !important" class="multiselect margin-bottom-10 form-control" multiple="multiple">'
          +hotel_parser_options+
          '</select>');
        triggers0.children('.multiselect').multiselect({
          includeSelectAllOption: true,
          enableCaseInsensitiveFiltering: true,
        });
        $(obj).parent().children("div.triggers1").hide();
        $(obj).parent().children("div.triggers2").hide();
        $(obj).parent().children("div.triggers3").hide();
        $(obj).parent().children("div.qq_threshold").hide();
        $(obj).parent().children("div.qq_sentences").hide();
        $(obj).parent().children("div.reg_exp").hide();
        $(obj).parent().children("a.andIf").show();
        $(obj).parent().parent().parent().children("div.thenGoto").show();
        $(obj).parent().find("span.name0").html(CONSTANT.CONTENT);
    }else if(obj.value=="task_parser"){
        var triggers0 = $(obj).parent().children("div.triggers0");
        triggers0.show();
        triggers0.children(".btn-group").remove();
        triggers0.children("select").remove();
        triggers0.children("input").remove();
        triggers0.append('\
          <select name="triggers0" style="width:425px; display:none; !important" class="multiselect margin-bottom-10 form-control" multiple="multiple">'
          +task_parser_options+
          '</select>');
        triggers0.children('.multiselect').multiselect({
          includeSelectAllOption: true,
          enableCaseInsensitiveFiltering: true,
        });
        $(obj).parent().children("div.triggers1").hide();
        $(obj).parent().children("div.triggers2").hide();
        $(obj).parent().children("div.triggers3").hide();
        $(obj).parent().children("div.qq_threshold").hide();
        $(obj).parent().children("div.qq_sentences").hide();
        $(obj).parent().children("div.reg_exp").hide();
        $(obj).parent().children("a.andIf").show();
        $(obj).parent().parent().parent().children("div.thenGoto").show();
        $(obj).parent().find("span.name0").html(CONSTANT.CONTENT);
    }else if(obj.value=="polarity_parser"){
        var triggers0 = $(obj).parent().children("div.triggers0");
        triggers0.show();
        triggers0.children(".btn-group").remove();
        triggers0.children("select").remove();
        triggers0.children("input").remove();
        triggers0.append('\
          <select name="triggers0" style="width:425px; display:inline-block !important" class="form-control">'
            + polarity_options +
          '</select>');
        $(obj).parent().children("div.triggers1").hide();
        $(obj).parent().children("div.triggers2").hide();
        $(obj).parent().children("div.triggers3").hide();
        $(obj).parent().children("div.qq_threshold").hide();
        $(obj).parent().children("div.qq_sentences").hide();
        $(obj).parent().children("div.reg_exp").hide();
        $(obj).parent().children("a.andIf").show();
        $(obj).parent().parent().parent().children("div.thenGoto").show();
        $(obj).parent().find("span.name0").html(CONSTANT.TO_KEY);
    }else if(obj.value=="counter_check"){
        var triggers0 = $(obj).parent().children("div.triggers0");
        triggers0.show();
        triggers0.children(".btn-group").remove();
        triggers0.children("select").remove();
        triggers0.children("input").remove();
        triggers0.append('\
          <select name="triggers0" style="width:425px; display:inline-block !important" class="form-control">\
            <option value="node_counter">若超过节点对话轮数限制</option>\
            <option value="scenario_counter">若超过全场景对话数限制</option>\
          </select>');
        $(obj).parent().children("div.triggers1").hide();
        $(obj).parent().children("div.triggers2").hide();
        $(obj).parent().children("div.triggers3").hide();
        $(obj).parent().children("div.qq_threshold").hide();
        $(obj).parent().children("div.qq_sentences").hide();
        $(obj).parent().children("div.reg_exp").hide();
        $(obj).parent().children("a.andIf").show();
        $(obj).parent().parent().parent().children("div.thenGoto").show();
        $(obj).parent().find("span.name0").html(CONSTANT.CONTENT);
    }else if(obj.value=="cu_parser"){
        var triggers0 = $(obj).parent().children("div.triggers0");
        triggers0.show();
        triggers0.children(".btn-group").remove();
        triggers0.children("select").remove();
        triggers0.children("input").remove();
        triggers0.append('\
          <select name="triggers0" style="width:425px; display:inline-block !important" class="form-control">\
            <option value="Intent">Intent</option>\
            <option value="Intent_Rewrite">Intent_Rewrite</option>\
            <option value="SentenceType">SentenceType</option>\
            <option value="UserID">UserID</option>\
            <option value="SpeechAct">SpeechAct</option>\
            <option value="personStandard">personStandard</option>\
            <option value="polarity">polarity</option>\
            <option value="NE">NE</option>\
            <option value="NE_MT">NE_MT</option>\
            <option value="memory">memory</option>\
          </select>');
        $(obj).parent().children("div.triggers1").hide();
        $(obj).parent().children("div.triggers2").hide();
        $(obj).parent().children("div.triggers3").hide();
        $(obj).parent().children("div.qq_threshold").hide();
        $(obj).parent().children("div.qq_sentences").hide();
        $(obj).parent().children("div.reg_exp").hide();
        $(obj).parent().children("a.andIf").show();
        $(obj).parent().parent().parent().children("div.thenGoto").show();
        $(obj).parent().find("span.name0").html(CONSTANT.CONTENT);
    }else if(obj.value=="custom_cu_parser"){
        var triggers0 = $(obj).parent().children("div.triggers0");
        triggers0.show();
        triggers0.children(".btn-group").remove();
        triggers0.children("select").remove();
        triggers0.children("input").remove();
        triggers0.append('<input type="text" name="triggers0" style="width:425px; display:inline-block !important" class="form-control">');
        $(obj).parent().children("div.triggers1").hide();
        $(obj).parent().children("div.triggers2").hide();
        $(obj).parent().children("div.triggers3").hide();
        $(obj).parent().children("div.qq_threshold").hide();
        $(obj).parent().children("div.qq_sentences").hide();
        $(obj).parent().children("div.reg_exp").hide();
        $(obj).parent().children("a.andIf").show();
        $(obj).parent().parent().parent().children("div.thenGoto").show();
        $(obj).parent().find("span.name0").html(CONSTANT.CONTENT);
    }else{ 
        var triggers0 = $(obj).parent().children("div.triggers0");
        triggers0.show();
        triggers0.children(".btn-group").remove();
        triggers0.children("select").remove();
        triggers0.children("input").remove();
        triggers0.append('<input type="text" name="triggers0" style="width:425px; display:inline-block !important" class="form-control">');
        $(obj).parent().children("div.triggers1").hide();
        $(obj).parent().children("div.triggers2").hide();
        $(obj).parent().children("div.triggers3").hide();
        $(obj).parent().children("div.qq_threshold").hide();
        $(obj).parent().children("div.qq_sentences").hide();
        $(obj).parent().children("div.reg_exp").hide();
        $(obj).parent().children("a.andIf").show();
        $(obj).parent().parent().parent().children("div.thenGoto").show();

        if(obj.value=="api_parser"){
          $(obj).parent().find("span.name0").html(CONSTANT.URL);
          $(obj).parent().children("div.triggers1").show();
          $(obj).parent().find("span.name1").html(CONSTANT.KEY);
        }else{
          $(obj).parent().find("span.name0").html(CONSTANT.CONTENT);
        }

        if(obj.value=="contain_key" || obj.value=="not_contain_key"){
          insertGlobalVarsTypeahead(triggers0.find("input"));
        }
    }
  }

  function insertMappingTableOptions(element){
    if(window.templateUserMappingTableList.length > 0){
      element.append('<optgroup disabled label="系统预设词库">');
      for(var index in window.templateUserMappingTableList) {
        var tableName = window.templateUserMappingTableList[index];
        element.append('<option style="padding-left:4px;" value="' + tableName + '">'+ he.encode(tableName) + '</option>');
      }
      element.append('</optgroup>');
    }
    if(window.mappingTableList.length > 0){
      element.append('<optgroup disabled label="任务引擎词库">');
      for(var index in window.mappingTableList) {
        var tableName = window.mappingTableList[index];
        element.append('<option style="padding-left:4px;" value="' + tableName + '">'+ he.encode(tableName) + '</option>');
      }
      element.append('</optgroup>');
    }
  }

  function removeGlobalVarsTypeahead(input_ui){
    input_ui.typeahead('destroy');
  }

  function insertGlobalVarsTypeahead(input_ui){
    var data = [];
    for(var index in window.moduleData.nodes) {
      var node = window.moduleData.nodes[index];
      if(typeof node.global_vars !== 'undefined'){
        for(var id in node.global_vars){
          data.push({
            name: node.description+'节点： '+node.global_vars[id],
            id: node.global_vars[id]
          });
        }
      }
    }
    input_ui.typeahead({
      source: data,
      showHintOnFocus: 'all',
      items: 'all'
    });
    input_ui.change(function() {
      var current = input_ui.typeahead("getActive");
      if (current) {
        if (current.name == input_ui.val()) {
          input_ui.val(current.id);
        }
      }
    });
  }

  function getMappingTableList(){
    var robotData = G.getCookie('robotDataJson')
    if (!robotData) {
        window.top.location.reload()
        return;
    }
    var robotDataJson = JSON.parse(robotData);
    var appid = robotDataJson.appid;
    // get user's mapping table list
    return $.ajax({
      type: 'GET',
      url: `${BASE_URL}mapping_table_list.php?appid=${appid}`,
      dataType: 'json'
    }).then((respJSON) => {
      window.mappingTableList = respJSON;
      return respJSON;
    });
  }
  
  function getTemplateMappingTableList(){
    // get templateAdmin's mapping table list, user_id=4c8cad6375894d487327cd1e7c5d5ef4
    const user_id = G.getCookie('userid');
    if (user_id !== '4c8cad6375894d487327cd1e7c5d5ef4'){
        return $.ajax({
          type: 'GET',
          url: `${BASE_URL}mapping_table_list.php?user=templateadmin`,
          dataType: 'json'
        }).then(function(respJSON){
          window.templateUserMappingTableList = respJSON;
          return respJSON;
        });
    }else{
      // the user itself is templateAdmin, skip getting templateAdmin's mapping table list
      return $.Deferred().resolve().promise();
    }
  }

  function loadNodeEditPage(){
    if (window.currentNode == null){
      return;
    }
    getTemplateMappingTableList().then(getMappingTableList).then(function(){
      _loadNodeEditPage();
    }, function(){
      window.templateUserMappingTableList = [];
      window.mappingTableList = [];
      _loadNodeEditPage();
    });
  }

  function _loadNodeEditPage(){
    var configHTML = $("#configTemplate").html();
    $("#configureModule .modal-content").html(configHTML);
    initData(window.currentNode);
    var newNode = updateModuleData();
    setNodeData(newNode);
    updateConnections();
    checkScenarioFormat();
    $('.updateModuleForm').ajaxForm(function() {
      window.toastr.options = {"positionClass": "toast-bottom-right"};
      window.toastr.success('已保存');
    });
  }

  window.saveModuleSetting = saveModuleSetting;
  window.addMoreParameterParsers = addMoreParameterParsers;
  window.addMoreParameter = addMoreParameter;
  window.addMoreNLUParameter = addMoreNLUParameter;
  window.addMoreConditions = addMoreConditions;
  window.toggleExpertMode = toggleExpertMode;
  window.addMoreTriggers = addMoreTriggers;
  window.addMoreIfTrigger = addMoreIfTrigger;
  window.addMoreRegExpGroup = addMoreRegExpGroup;
  window.addMoreIfCondition = addMoreIfCondition;
  window.addMoreQQSentences = addMoreQQSentences;
  window.searchParserChange = searchParserChange;
  window.searchSourceChange = searchSourceChange;
  window.searchFunctionChange = searchFunctionChange;
  window.insertGlobalVarsIntoEditor = insertGlobalVarsIntoEditor;
  window.loadNodeEditPage = loadNodeEditPage;
  window.checkIfNodeChanged = checkIfNodeChanged;
  window.saveGlobalConnections = saveGlobalConnections;
  window.insertConditionsIntoUIFromJSON = insertConditionsIntoUIFromJSON;
  window.insertQQEdgesIntoUIFromJSON = insertQQEdgesIntoUIFromJSON;
  window.getMappingTableList = getMappingTableList;
  window.getTemplateMappingTableList = getTemplateMappingTableList;
})();