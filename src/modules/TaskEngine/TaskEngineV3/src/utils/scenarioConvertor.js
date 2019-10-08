export default {
  initialScenario(metadata) {
    const scenario = {
      editingContent: {
        version: '2.0',
        metadata: JSON.parse(JSON.stringify(metadata)),
        setting: {
          sys_scenario_dialogue_cnt_limit: 30,
          sys_node_dialogue_cnt_limit: 3,
        },
        msg_confirm: [],
        nodes: [],
        idToNerMap: {},
        skills: {
          mainSkill: {
            skillName: '主任务',
            triggerList: [],
            entityCollectorList: [],
            actionGroupList: [],
            relatedEntities: {
              relatedEntityCollectorList: [],
              relatedEntityMatrix: [],
            },
            re_parsers: [],
            tde_setting: {},
          },
        },
      },
      editingLayout: { '0262995629637': { position: { left: 300, top: 200 } } },
    };
    return scenario;
  },
  convertToNodes(originalScenario) {
    const scenario = JSON.parse(JSON.stringify(originalScenario));
    scenario.nodes = [];
    scenario.nodes.push(this.newExitNode());
    Object.keys(scenario.skills).map((skillId) => {
      const skill = scenario.skills[skillId];
      scenario.nodes = scenario.nodes.concat(this.convertSkillToNodes(skillId, skill));
      return skillId;
    });
    return scenario;
  },
  convertSkillToNodes(skillId, skill) {
    const nodes = [];
    if (skillId === 'mainSkill') {
      nodes.push(this.newEntryNode(skill.triggerList, skillId));
    }
    nodes.push(this.newNluPcNode(
      skill.entityCollectorList,
      skill.re_parsers,
      skillId,
      skill.register_json,
    ));
    nodes.push(this.newActionNode(skill.actionGroupList, skillId));
    return nodes;
  },
  newExitNode() {
    const node = {
      node_id: '0',
      description: 'Exit',
      node_type: 'exit',
    };
    return node;
  },
  newEntryNode(triggerList, skillId) {
    const node = {
      node_id: `wizard_mode_entry_node_${skillId}`,
      description: 'wizard_mode_entry_node',
      node_type: 'entry',
      entry_condition_rules: [],
      warnings: [],
      edges: [{ to_node_id: null, edge_type: 'hidden', condition_rules: [], actions: [{ operation: 'set_to_global_info', key: 'sys_scenario_dialogue_cnt', val: 0 }, { operation: 'set_to_global_info', key: 'sys_node_dialogue_cnt', val: 0 }, { operation: 'set_to_global_info', key: 'sys_scenario_dialogue_cnt_limit', val: 30 }, { operation: 'set_to_global_info', key: 'sys_node_dialogue_cnt_limit', val: 3 }] }, { to_node_id: null, edge_type: 'hidden', condition_rules: [] }, { to_node_id: null, edge_type: 'hidden', condition_rules: [] }, { to_node_id: `wizard_mode_nlu_pc_node_${skillId}`, edge_type: 'else_into', condition_rules: [], actions: [{ operation: 'set_to_global_info', key: 'parsing_failed', val: false }, { operation: 'set_to_global_info', key: 'sys_node_dialogue_cnt', val: 0 }] }],
    };
    for (let i = 0; i < triggerList.length; i += 1) {
      const trigger = triggerList[i];
      const rule = this.newEntryRule(trigger);
      node.entry_condition_rules.push(rule);
    }
    return node;
  },
  newEntryRule(trigger) {
    let rule = [];
    switch (trigger.type) {
      case 'intent_engine':
        rule = this.createEntryRule('custom_cu_parser', 'userDefine', [], trigger.intent_name);
        break;
      case 'intent_zoo':
        rule = this.createEntryRule('cu_parser', 'Intent', ['Intent'], trigger.intent_name);
        break;
      case 'intent_engine_2.0':
        rule = this.createEntryRuleV2('intent_parser', trigger.intent_name, trigger.type);
        break;
      default:
        rule = this.createEntryRule('custom_cu_parser', 'userDefine', [], trigger.intent_name);
    }
    return rule;
  },
  createEntryRule(functionName, content, contentTextArray, intentName) {
    const rule = [
      {
        source: 'cu',
        functions: [
          {
            function_name: functionName,
            content,
            content_text_array: contentTextArray,
          },
        ],
      },
      {
        source: 'global_info',
        functions: [
          {
            content: [
              {
                compare: '==',
                val: intentName,
                key: 'Intent',
              },
            ],
            function_name: 'key_val_match',
          },
        ],
      },
    ];
    return rule;
  },
  createEntryRuleV2(functionName, intentName, module) {
    const rule = [
      {
        source: 'extend_data',
        functions: [
          {
            function_name: functionName,
            content: {
              intentName,
              module,
            },
          },
        ],
      },
    ];
    return rule;
  },
  newNluPcNode(entityCollectorList, reParsers, skillId, registerJson) {
    let entities;
    if (registerJson && registerJson.slotDefs) {
      entities = registerJson.slotDefs.map(slot => ({ entityName: slot.slotName, prompt: null }));
    } else {
      entities = entityCollectorList;
    }
    const node = {
      node_id: `wizard_mode_nlu_pc_node_${skillId}`,
      description: 'wizard_mode_nlu_pc_node',
      node_type: 'nlu_pc',
      warnings: [],
      edges: [{ to_node_id: `wizard_mode_action_node_${skillId}`, edge_type: 'else_into', condition_rules: [], actions: [{ operation: 'set_to_global_info', key: 'parsing_failed', val: false }, { operation: 'set_to_global_info', key: 'sys_node_dialogue_cnt', val: 0 }] }],
      content: {
        entities,
        reParsers,
      },
    };
    return node;
  },
  newActionNode(actionGroupList, scenarioId) {
    const node = {
      node_id: `wizard_mode_action_node_${scenarioId}`,
      description: 'wizard_mode_action_node',
      node_type: 'action',
      warnings: [],
      edges: [{ edge_type: 'else_into', to_node_id: '0', condition_rules: [], actions: [{ operation: 'set_to_global_info', key: 'parsing_failed', val: false }, { operation: 'set_to_global_info', key: 'sys_node_dialogue_cnt', val: 0 }] }],
    };
    node.content = JSON.parse(JSON.stringify(actionGroupList));
    node.content.forEach((actionGroup) => {
      actionGroup.conditionList = this.convertConditionList(actionGroup.conditionList);
      actionGroup.actionList = actionGroup.actionList.map((action) => {
        if (action.type === 'goto') {
          if (action.targetSkillId === '0' || action.targetSkillId === 'exit') {
            action.targetSkillId = '0';
          } else {
            action.targetSkillId = `wizard_mode_nlu_pc_node_${action.targetSkillId}`;
          }
        }
        return action;
      });
    });
    return node;
  },
  convertConditionList(conditionList) {
    let newConditionList = conditionList.map((condition) => {
      let object = null;
      if (condition.target.type === 'entity') {
        object = {
          source: condition.comparisonOperator.source,
          functions: [
            {
              function_name: condition.comparisonOperator.functionName,
              content: this.composeConditionContent(condition),
            },
          ],
        };
      } else if (condition.target.type === 'context') {
        object = {
          source: 'global_info',
          functions: [
            {
              function_name: 'key_val_match',
              content: [
                {
                  key: 'nlu_pc_act_type',
                  val: this.convertStateName(condition.target.name),
                  compare: '==',
                },
              ],
            },
          ],
        };
      }
      return object;
    });
    newConditionList = newConditionList.filter(object => object !== null);
    return [newConditionList];
  },
  composeConditionContent(condition) {
    const funName = condition.comparisonOperator.functionName;
    if (funName === 'contain_key' || funName === 'not_contain_key') {
      return [
        {
          key: condition.target.name,
        },
      ];
    } else if (funName === 'key_val_match') {
      return [
        {
          key: condition.target.name,
          val: condition.content,
          compare: condition.comparisonOperator.compare,
        },
      ];
    } else if (funName === 'value_contains' || funName === 'value_not_contains' ||
             funName === 'value_in' || funName === 'value_not_in') {
      return {
        key: condition.target.name,
        val: condition.content,
      };
    }
    return {};
  },
  convertStateName(name) {
    if (name === 'on_complete') {
      return 'task-finish-confirmed';
    } else if (name === 'on_cancel') {
      return 'on-cancel';
    } else if (name === 'on_transfer_to_manual') {
      return 'jump-out';
    } else if (name === 'on_parse_fail') {
      return 'jump-out';
    }
    return '';
  },
  getEntityListIndex(entityList, entityName) {
    for (let i = 0; i < entityList.length; i += 1) {
      if (entityList[i].slotName === entityName) {
        return i;
      }
    }
    return -1;
  },
  convertToRegistryData(scenarioId, skill, skillId) {
    if (skill.register_json && Object.keys(skill.register_json).length > 0) {
      // manually give register JSON
      const registerJson = JSON.parse(JSON.stringify(skill.register_json));
      registerJson.taskId = `wizard_mode_nlu_pc_node_${skillId}_${scenarioId}`;
      return registerJson;
    }
    const entityList = skill.entityCollectorList.map((item) => {
      if (item.ner.sourceType === 'custom') {
        return {
          slotName: item.entityName,
          slotType: item.ner.slotType,
          slotBizType: 'OrderProperty',
          slotValueOptions: item.ner.entitySynonymsList.map(elt => elt.entity),
        };
      }
      return {
        slotName: item.entityName,
        slotType: item.ner.slotType,
        slotBizType: 'OrderProperty',
        hidden: item.ner.hidden,
        needRecogize: item.ner.needRecogize,
        slotFinder: item.ner.slotFinder,
      };
    });
    const indices = [];
    skill.relatedEntities.relatedEntityMatrix.forEach((row) => {
      for (let i = 1; i < row.length; i += 1) {
        indices.push({
          product: row[0].entity,
          slotName: skill.relatedEntities.relatedEntityCollectorList[i].entityName,
          slotValue: row[i].entity,
        });
      }
    });
    let products = [];
    if (skill.relatedEntities.relatedEntityCollectorList.length > 0) {
      products = skill.relatedEntities.relatedEntityCollectorList[0].ner.entitySynonymsList
        .map((item) => {
          const tmpObj = {};
          tmpObj[skill.relatedEntities.relatedEntityCollectorList[0].entityName] = item.entity;
          return tmpObj;
        });
    }
    if (entityList.length > 0) {
      if (skill.relatedEntities.relatedEntityCollectorList.length > 0) {
        const productIndex = this.getEntityListIndex(entityList,
            skill.relatedEntities.relatedEntityCollectorList[0].entityName);
        entityList[productIndex].slotBizType = 'Product';
        for (let i = 1; i < skill.relatedEntities.relatedEntityCollectorList.length; i += 1) {
          const tmpIndex = this.getEntityListIndex(entityList,
              skill.relatedEntities.relatedEntityCollectorList[i].entityName);
          entityList[tmpIndex].slotBizType = 'ProductPropertySearchable';
        }
      }
    }
    const data = {
      taskId: `wizard_mode_nlu_pc_node_${skillId}_${scenarioId}`,
      nlgTemplate: skill.tde_setting.nlgTemplate,
      service: skill.tde_setting.service,
      jumpOutTimes: isNaN(parseInt(skill.tde_setting.jumpOutTimes, 10)) ?
          undefined : parseInt(skill.tde_setting.jumpOutTimes, 10),
      slotDefs: entityList,
      intent: {
        operate: '订',
        target: '餐厅',
      },
      products,
      indices,
    };
    return data;
  },
};
