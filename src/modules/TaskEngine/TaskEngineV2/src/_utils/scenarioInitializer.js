import optionConfig from './optionConfig';

const ActionType = optionConfig.ActionType;

export default {
  s4_sort() { return Math.floor((1 + Math.random()) * 0x10000).toString(10).substring(1); },
  guid_sort() { return this.s4_sort() + this.s4_sort() + this.s4_sort(); },
  initialScenario(metadata, entryNodeName) {
    const entryNodeId = this.guid_sort();
    const scenario = {
      editingContent: {
        version: '1.1',
        metadata: JSON.parse(JSON.stringify(metadata)),
        setting: {
          sys_scenario_dialogue_cnt_limit: 30,
          sys_node_dialogue_cnt_limit: 3,
        },
        ui_data: {
          nodes: [
            {
              triggerTab: {
                rules: [],
              },
              nodeType: 'entry',
              nodeName: entryNodeName,
              warnings: [
                {
                  type: 'missing_entry_trigger',
                },
                {
                  type: 'missing_outbound_connection',
                },
              ],
              nodeId: entryNodeId,
              edgeTab: {
                elseInto: null,
                normalEdges: [],
              },
              settingBasicTab: {
                nodeType: 'entry',
                nodeName: entryNodeName,
              },
            },
          ],
        },
        nodes: [
          {
            node_id: '0',
            description: 'Exit',
            node_type: 'exit',
          },
          {
            node_id: entryNodeId,
            description: entryNodeName,
            node_type: 'entry',
            entry_condition_rules: [],
            warnings: [],
            edges: [],
          },
        ],
        msg_confirm: [],
        global_edges: [],
      },
      editingLayout: { [entryNodeId]: { position: { left: 300, top: 200 } } },
    };
    return scenario;
  },
  initialExitNode() {
    return {
      node_id: '0',
      description: 'Exit',
      node_type: 'exit',
    };
  },
  initialNode(nodeType, nodeName, nodeDialogueCntLimit, nodeId) {
    if (nodeType === 'dialogue') {
      return this.initialDialogueNode(nodeName, nodeDialogueCntLimit, nodeId);
    } else if (nodeType === 'nlu_pc') {
      return this.initialNLUPCNode(nodeName, nodeDialogueCntLimit);
    } else if (nodeType === 'restful') {
      return this.initialRestfulNode(nodeName);
    } else if (nodeType === 'parameter_collecting') {
      return this.initialPCNode(nodeName, nodeDialogueCntLimit);
    } else if (nodeType === 'action') {
      return this.initialActionNode(nodeName);
    } else if (nodeType === 'dialogue_2.0') {
      return this.initialDialogueNode2(nodeName, nodeDialogueCntLimit, nodeId);
    }
    return {};
  },
  initialActionNode(nodeName) {
    return {
      nodeId: this.guid_sort(),
      nodeName,
      nodeType: 'action',
      settingBasicTab: {
        nodeName,
        nodeType: 'action',
      },
      actionTab: {
        actionGroupList: [],
        waitForResponse: true,
      },
      edgeTab: {
        normalEdges: [],
        elseInto: '0',
      },
    };
  },
  initialPCNode(nodeName, nodeDialogueCntLimit) {
    return {
      nodeId: this.guid_sort(),
      nodeName,
      nodeType: 'parameter_collecting',
      settingBasicTab: {
        nodeName,
        nodeType: 'parameter_collecting',
      },
      paramsCollectingTab: {
        params: [],
      },
      paramsCollectingEdgeTab: {
        dialogueLimit: nodeDialogueCntLimit,
        normalEdges: [
          {
            edge_type: 'virtual_global_edges',
            to_node_id: null,
            actions: [],
            condition_rules: [[]],
          },
          {
            edge_type: 'pc_succeed',
            to_node_id: '0',
            actions: [{
              operation: 'set_to_global_info',
              key: 'sys_node_dialogue_cnt',
              val: 0,
            }],
            condition_rules: [[{
              source: 'global_info',
              functions: [{
                content: [],
                function_name: 'all_parameters_are_collected',
              }],
            }]],
          },
          {
            edge_type: 'pc_failed',
            to_node_id: '0',
            actions: [{
              operation: 'set_to_global_info',
              key: 'sys_node_dialogue_cnt',
              val: 0,
            }],
            condition_rules: [[{
              source: 'global_info',
              functions: [{
                content: 'node_counter',
                function_name: 'counter_check',
              }],
            }]],
          },
        ],
      },
    };
  },
  initialNLUPCNode(nodeName, nodeDialogueCntLimit) {
    return {
      nodeId: this.guid_sort(),
      nodeName,
      nodeType: 'nlu_pc',
      settingBasicTab: {
        nodeName,
        nodeType: 'nlu_pc',
      },
      entityCollectingTab: {
        entityCollectorList: [],
        relatedEntities: {
          relatedEntityCollectorList: [],
          relatedEntityMatrix: [],
        },
        re_parsers: [],
        tde_setting: {
          jumpOutTimes: nodeDialogueCntLimit,
        },
        register_json: {},
      },
      edgeTab: {
        normalEdges: [],
        elseInto: '0',
      },
    };
  },
  initialDialogueNode(nodeName, nodeDialogueCntLimit, nodeId) {
    return {
      nodeId: nodeId || this.guid_sort(),
      nodeName,
      nodeType: 'dialogue',
      settingTab: {
        nodeName,
        parser: 'none',
        targetEntities: [],
        skipIfKeyExist: [],
        initialResponse: '',
        failureResponse: '',
        parseFromThisNode: false,
      },
      edgeTab: {
        normalEdges: [],
        exceedThenGoto: '0',
        elseInto: '0',
        dialogueLimit: nodeDialogueCntLimit,
      },
    };
  },
  initialDialogueNode2(nodeName, nodeDialogueCntLimit, nodeId) {
    return {
      nodeId: nodeId || this.guid_sort(),
      nodeName,
      nodeType: 'dialogue_2.0',
      dialogue2SettingTab: {
        nodeName,
        parser: 'none',
        targetEntities: [],
        skipIfKeyExist: [],
        initialResponse: '',
        repeatResponse: '',
        rewindResponse: '',
        failureResponse: '',
        parseFromThisNode: false,
      },
      edgeTab2: {
        normalEdges: [],
        exceedThenGoto: '0',
        elseInto: '0',
        dialogueLimit: nodeDialogueCntLimit,
      },
    };
  },
  initialRestfulNode(nodeName) {
    return {
      nodeId: this.guid_sort(),
      nodeName,
      nodeType: 'restful',
      restfulSettingTab: {
        nodeType: 'restful',
        nodeName,
        url: '',
        method: 'GET',
        contentType: 'application/json',
        body: '',
        rtnVarName: '',
      },
      restfulEdgeTab: {
        restfulFailedThenGoto: '0',
        restfulSucceedThenGoto: '0',
      },
    };
  },
  initialEdgeTab(nodeType) {
    const edgeTab = {
      normalEdges: [],
      elseInto: '0',
    };
    if (nodeType === 'dialogue') {
      edgeTab.exceedThenGoto = 0;
      edgeTab.dialogueLimit = 0;
    }
    return edgeTab;
  },
  initialFunctionContent(funcName, nodeId) {
    const map = {
      match: '',
      contains: '',
      regular_exp: {
        pattern: '',
        operations: [
          {
            operation: 'set_to_global_info',
            index: 0,
            key: '',
          },
        ],
      },
      nlu_parser: {
        tags: '',
        key_suffix: `_${nodeId}`,
        has_context: false,
      },
      common_parser: {
        tags: '',
        key_suffix: `_${nodeId}`,
      },
      task_parser: {
        tags: '',
        key_suffix: `_${nodeId}`,
      },
      hotel_parser: {
        tags: '',
        key_suffix: `_${nodeId}`,
      },
      user_custom_parser: {
        trans: '',
        to_key: '',
      },
      polarity_parser: {
        key: 'POLARITY',
        key_suffix: `_${nodeId}`,
      },
      api_parser: '',
      key_val_match: [
        {
          compare: '==',
          key: '',
          val: '',
        },
      ],
      key_key_match: [
        {
          key2: '',
          key1: '',
          compare: '==',
        },
      ],
      contain_key: [
        {
          key: '',
        },
      ],
      not_contain_key: [
        {
          key: '',
        },
      ],
      list_length_match: [
        {
          compare: '==',
          key: '',
          val: '',
        },
      ],
      counter_check: 'node_counter',
      user_custom_transform: {
        trans: '',
        from_key: '',
        to_key: '',
      },
      regular_exp_from_var: {
        operations: [
          {
            index: 0,
            operation: 'set_to_global_info',
            key: '',
          },
        ],
        pattern: '',
        from_key: '',
      },
      assign_value: [
        {
          operation: 'set_to_global_info',
          key: '',
          val: '',
        },
      ],
      remove_key: [
        {
          key: '',
        },
      ],
      cu_parser: 'Intent',
      custom_cu_parser: '',
      intent_parser: {
        module: 'intent_engine_2.0',
        intentName: '',
      },
      custom_parser: {
        parser: '',
        key_suffix: `_${nodeId}`,
      },
    };
    return map[funcName];
  },
  initialFunctionContentV2(funcName, nodeId) {
    const map = {
      match: '',
      contains: '',
      regular_exp: {
        pattern: '',
        operations: [{
          operation: 'set_to_global_info',
          index: 0,
          key: '',
        }],
      },
      common_parser: {
        tags: '',
        key_suffix: `_${nodeId}`,
      },
      task_parser: {
        tags: '',
        key_suffix: `_${nodeId}`,
      },
      hotel_parser: {
        tags: '',
        key_suffix: `_${nodeId}`,
      },
      user_custom_parser: {
        trans: '',
        to_key: '',
      },
      polarity_parser: {
        key: 'POLARITY',
        key_suffix: `_${nodeId}`,
      },
      api_parser: '',
      key_val_match: {
        compare: '==',
        key: '',
        val: '',
      },
      key_key_match: {
        key2: '',
        key1: '',
        compare: '==',
      },
      contain_key: {
        key: '',
      },
      not_contain_key: {
        key: '',
      },
      list_length_match: {
        compare: '==',
        key: '',
        val: '',
      },
      counter_check: 'node_counter',
      user_custom_transform: {
        trans: '',
        from_key: '',
        to_key: '',
      },
      regular_exp_from_var: {
        operations: [{
          index: 0,
          operation: 'set_to_global_info',
          key: '',
        }],
        pattern: '',
        from_key: '',
      },
      assign_value: [{
        operation: 'set_to_global_info',
        key: '',
        val: '',
      }],
      remove_key: [{
        key: '',
      }],
      cu_parser: 'Intent',
      custom_cu_parser: '',
      intent_parser: {
        module: 'intent_engine_2.0',
        intentName: '',
      },
      nlu_parser: {
        tags: '',
        key_suffix: `_${nodeId}`,
        has_context: false,
      },
      custom_parser: {
        key_suffix: `_${nodeId}`,
      },
    };
    return map[funcName];
  },
  initialEdge(edgeType = 'normal') {
    return {
      edge_type: edgeType,
      to_node_id: null,
      actions: [],
      condition_rules: [
        [
          {
            source: 'text',
            functions: [
              {
                function_name: 'match',
                content: '',
              },
            ],
          },
        ],
      ],
    };
  },
  initialNormalEdge2() {
    return {
      edge_type: 'normal_2.0',
      to_node_id: null,
      actions: [],
      condition_rules: [],
    };
  },
  initialTriggerRule() {
    return {
      edge_type: 'normal',
      to_node_id: null,
      condition_rules: [
        [
          {
            source: 'text',
            functions: [
              {
                function_name: 'match',
                content: '',
              },
            ],
          },
        ],
      ],
    };
  },
  initialRule(source = 'text') {
    if (source === 'text') {
      return {
        source,
        functions: [{
          function_name: 'match',
          content: '',
        }],
      };
    } else if (source === 'global_info') {
      return {
        source,
        functions: [
          {
            function_name: 'key_val_match',
            content: {
              compare: '==',
              key: '',
              val: '',
            },
          },
        ],
      };
    }
    return {};
  },
  initialAction(actionType = 'parser') {
    switch (actionType) {
      case ActionType.CustomParser: {
        return {
          source: '',
          function: {
            function_name: ActionType.CustomParser,
            content: {},
          },
        };
      }
      case ActionType.Parser: {
        return {
          source: '',
          function: {
            function_name: '',
            content: {},
          },
        };
      }
      case ActionType.AssignValue: {
        return {
          source: 'global_info',
          function: {
            function_name: ActionType.AssignValue,
            content: {
              operation: 'set_key_to_value',
              key: '',
              val: '',
            },
          },
        };
      }
      case ActionType.WebAPI: {
        return {
          source: 'text',
          function: {
            function_name: 'api_parser',
            content: '',
          },
        };
      }
      case ActionType.JSScript: {
        return {
          source: 'text',
          function: {
            function_name: 'js_code',
            content: '',
          },
        };
      }
      case ActionType.ResponseText: {
        return {
          source: 'text',
          function: {
            function_name: 'response_text',
            content: '',
          },
        };
      }
      case ActionType.RemoveKey: {
        return {
          source: 'global_info',
          function: {
            function_name: 'remove_key',
            content: '',
          },
        };
      }
      default:
        return {};
    }
  },
  initialRegularOperation() {
    return {
      operation: 'set_to_global_info',
      index: 0,
      key: '',
    };
  },
  initialCandidateEdge() {
    return {
      to_node_id: null,
      tar_text: '',
    };
  },
  initialParser() {
    return {
      funcName: 'regular_exp',
      content: {
        operations: [
          {
            index: 0,
            operation: 'set_to_global_info',
            key: '',
          },
        ],
        pattern: '',
      },
      required: true,
    };
  },
  initialVarTemplate() {
    return {
      key: '',
      msg: '$global{}',
      type: 'string',
      isInputKeyTooltipShown: false,
      isInputTemplateTooltipShown: false,
    };
  },
};
