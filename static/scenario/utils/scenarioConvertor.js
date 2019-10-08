import general from './general';

export default {
  initialScenario(metadata) {
    const scenario = {
      "editingContent": {
        "version": "2.0",
        "metadata": JSON.parse(JSON.stringify(metadata)),
        "setting": {
          "sys_scenario_dialogue_cnt_limit": 30,
          "sys_node_dialogue_cnt_limit": 3
        },
        "msg_confirm": [],
        "nodes": [],
        "idToNerMap": {},
        "skills": {
          "mainSkill": {
            "skillName": "主任务",
            "triggerList": [],
            "entityCollectorList": [],
            "actionGroupList": [],
            "relatedEntities": {
              "relatedEntityCollectorList": [],
              "relatedEntityMatrix": []
            },
            "re_parsers": [],
            "tde_setting": {},
          }
        },
      },
      "editingLayout": {"0262995629637":{"position":{"left":300,"top":200}}},
    };
    return scenario;
  },
  convertToNodes(originalScenario) {
    let scenario = JSON.parse(JSON.stringify(originalScenario));
    scenario.nodes = [];
    scenario.nodes.push(this.newExitNode());
    Object.keys(scenario.skills).map((skillId) => {
      const skill = scenario.skills[skillId];
      scenario.nodes = scenario.nodes.concat(this.convertSkillToNodes(skillId, skill));
    });
    return scenario;
  },
  convertSkillToNodes(skillId, skill) {
    let nodes = []
    if (skillId === 'mainSkill'){
      nodes.push(this.newEntryNode(skill.triggerList, skillId));
    }
    nodes.push(this.newNluPcNode(skill.entityCollectorList, skill.re_parsers, skillId));
    nodes.push(this.newActionNode(skill.actionGroupList, skillId));
    return nodes;
  },
  newExitNode(){
    const node = {
      "node_id": "0",
      "description": "Exit",
      "node_type": "exit"
    };
    return node;
  },
  newEntryNode(triggerList, skillId) {
    let node = {
      'node_id': `wizard_mode_entry_node_${skillId}`,
      "description": "wizard_mode_entry_node",
      "node_type": "entry",
      "entry_condition_rules": [],
      "warnings": [],
      "edges": [{"to_node_id":null,"edge_type":"hidden","condition_rules":[],"actions":[{"operation":"set_to_global_info","key":"sys_scenario_dialogue_cnt","val":0},{"operation":"set_to_global_info","key":"sys_node_dialogue_cnt","val":0},{"operation":"set_to_global_info","key":"sys_scenario_dialogue_cnt_limit","val":30},{"operation":"set_to_global_info","key":"sys_node_dialogue_cnt_limit","val":3}]},{"to_node_id":null,"edge_type":"hidden","condition_rules":[]},{"to_node_id":null,"edge_type":"hidden","condition_rules":[]},{"to_node_id":"wizard_mode_nlu_pc_node_"+skillId,"edge_type":"else_into","condition_rules":[],"actions":[{"operation":"set_to_global_info","key":"parsing_failed","val":false},{"operation":"set_to_global_info","key":"sys_node_dialogue_cnt","val":0}]}],
    };
    for(var i=0; i<triggerList.length; i++){
      const trigger = triggerList[i];
      const rule = this.newEntryRule(trigger);
      node.entry_condition_rules.push(rule);
    };
    return node;
  },
  newEntryRule(trigger){
    let rule = [];
    switch (trigger.type){
      case "intent_engine":
        rule = this.createEntryRule("custom_cu_parser", "userDefine", [], trigger.intent_name);
        break;
      case "intent_zoo":
      rule = this.createEntryRule("cu_parser", "Intent", ["Intent"], trigger.intent_name);
        break;
    };
    return rule;
  },
  createEntryRule(functionName, content, contentTextArray, intentName) {
    const rule = [
      {
        "source": "cu",
        "functions": [
          {
            "function_name": functionName,
            "content": content,
            "content_text_array": contentTextArray
          }
        ]
      },
      {
        "source": "global_info",
        "functions": [
          {
            "content": [
              {
                "compare": "==",
                "val": intentName,
                "key": "Intent"
              }
            ],
            "function_name": "key_val_match"
          }
        ]
      }
    ];
    return rule;
  },
  newNluPcNode(entityCollectorList, re_parsers, skillId){
    const node = {
      'node_id': `wizard_mode_nlu_pc_node_${skillId}`,
      "description": "wizard_mode_nlu_pc_node",
      "node_type": "nlu_pc",
      "warnings": [],
      "edges": [{"to_node_id":`wizard_mode_action_node_${skillId}`,"edge_type":"else_into","condition_rules":[],"actions":[{"operation":"set_to_global_info","key":"parsing_failed","val":false},{"operation":"set_to_global_info","key":"sys_node_dialogue_cnt","val":0}]}],
      "content": {
        "entities": entityCollectorList,
        "re_parsers": re_parsers
      }
    };
    return node;
  },
  newActionNode(actionGroupList, scenario_id){
    let node = {
      'node_id': 'wizard_mode_action_node_'+scenario_id,
      "description": "wizard_mode_action_node",
      "node_type": "action",
      "warnings": [],
      "edges": [{"edge_type":"else_into","to_node_id":"0","condition_rules":[],"actions":[{"operation":"set_to_global_info","key":"parsing_failed","val":false},{"operation":"set_to_global_info","key":"sys_node_dialogue_cnt","val":0}]}],
    };
    node.content = JSON.parse(JSON.stringify(actionGroupList));
    node.content.forEach((actionGroup) => {
      actionGroup.conditionList = this.convertConditionList(actionGroup.conditionList);
    });
    return node;
  },
  convertConditionList(conditionList){
    let newConditionList = conditionList.map((condition) => {
      let object = null;
      if (condition.target.type === 'entity'){
        object = {
          "source": condition.comparisonOperator.source,
          "functions": [
            {
              "function_name": condition.comparisonOperator.functionName,
              "content": this.composeConditionContent(condition),
            }
          ]
        };
      } else if (condition.target.type === 'context'){
        object = {
          "source": "global_info",
          "functions": [
            {
              "function_name": "key_val_match",
              "content": [
                {
                  "key": "nlu_pc_act_type",
                  "val": this.convertStateName(condition.target.name),
                  "compare": "==",
                }
              ],
            }
          ]
        };
      }
      return object;
    });
    newConditionList = newConditionList.filter((object) => {
      return object !== null;
    });
    return [newConditionList];
  },
  composeConditionContent(condition){
    const funName = condition.comparisonOperator.functionName;
    if(funName == "contain_key" || funName == "not_contain_key"){
      return [
        {
          "key": condition.target.name,
        }
      ];
    }else if(funName == "key_val_match"){
      return [
        {
          "key": condition.target.name,
          "val": condition.content,
          "compare": condition.comparisonOperator.compare,
        }
      ];
    }else if(funName == "value_contains" || funName == "value_not_contains" ||
             funName == "value_in" || funName == "value_not_in"){
      return {
        "key": condition.target.name,
        "val": condition.content,
      };
    }
  },
  convertStateName(name){
    if (name === 'on_complete') {
      return 'task-finish-confirmed';
    } else if (name === 'on_cancel') {
      return 'on-cancel';
    } else if (name === 'on_transfer_to_manual') {
      return 'jump-out';
    } else if (name === 'on_parse_fail') {
      return 'jump-out';
    }
  },
  getEntityListIndex(entityList, entityName){
    for(let i=0; i<entityList.length; i++){
      if(entityList[i].slotName === entityName){
        return i;
      }
    }
    return -1;
  },
  convertToRegistryData(scenarioId, skill, skillId){
    const entityList = skill.entityCollectorList.map(function(item, index, array){
                        if (item.ner.sourceType === "custom"){
                          return {
                            slotName: item.entityName,
                            slotType: item.ner.slotType,
                            slotBizType: "OrderProperty",
                            slotValueOptions: item.ner.entitySynonymsList.map( elt => elt.entity )
                          }
                        }else{
                          return {
                            slotName: item.entityName,
                            slotType: item.ner.slotType,
                            slotBizType: "OrderProperty"
                          }
                        }
                      });
    let indices = [];
    skill.relatedEntities.relatedEntityMatrix.forEach(function(row){
      for(let i=1; i<row.length; i++){
        indices.push({
          product: row[0].entity,
          slotName: skill.relatedEntities.relatedEntityCollectorList[i].entityName,
          slotValue: row[i].entity
        });
      }
    });
    let products = [];
    if(skill.relatedEntities.relatedEntityCollectorList.length > 0){
      products = skill.relatedEntities.relatedEntityCollectorList[0].ner.entitySynonymsList.map(function(item, index, array){ 
        let tmpObj = {};
        tmpObj[skill.relatedEntities.relatedEntityCollectorList[0].entityName] = item.entity;
        return tmpObj;
      });
    }
    if (entityList.length > 0){
      if(skill.relatedEntities.relatedEntityCollectorList.length > 0){
        const productIndex = this.getEntityListIndex(entityList, skill.relatedEntities.relatedEntityCollectorList[0].entityName);
        entityList[productIndex].slotBizType = "Product";
        for(let i=1; i<skill.relatedEntities.relatedEntityCollectorList.length; i++){
          const tmpIndex =  this.getEntityListIndex(entityList, skill.relatedEntities.relatedEntityCollectorList[i].entityName);
          entityList[tmpIndex].slotBizType = "ProductPropertySearchable";
        }
      }else{
        // entityList[0].slotBizType = "Product";
      }
    }
    let data = {
      "taskId": 'wizard_mode_nlu_pc_node_'+skillId+'_'+scenarioId,
      "nlgTemplate": skill.tde_setting.nlgTemplate,
      "service": skill.tde_setting.service,
      "jumpOutTimes": isNaN(parseInt(skill.tde_setting.jumpOutTimes))? undefined : parseInt(skill.tde_setting.jumpOutTimes),
      "slotDefs": entityList,
      "intent": {
        "operate": "订",
        "target": "餐厅"
      },
      "products": products,
      "indices": indices
    };
    return data;
  },
};
