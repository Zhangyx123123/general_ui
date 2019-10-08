import scenarioConvertorV3 from '@/modules/TaskEngine/TaskEngineV3/src/utils/scenarioConvertor';
import optionConfig from './optionConfig';
import scenarioInitializer from './scenarioInitializer';
import api from '../../../_api/taskEngine';

export default {
  convertUiNodesToNodes(uiNodes, setting, globalEdges) {
    const nodes = uiNodes.map((uiNode) => {
      const newUiNode = JSON.parse(JSON.stringify(uiNode));
      return this.convertUiNodeToNode(newUiNode, setting, globalEdges);
    });
    const exitNode = scenarioInitializer.initialExitNode();
    return [exitNode].concat(nodes);
  },
  // convert uiNode to node
  convertUiNodeToNode(uiNode, setting, globalEdges) {
    // console.log(uiNode);
    const edges = this.convertUiNodeToEdges(uiNode, setting, globalEdges);
    const nodeInfo = this.getNodeInfo(edges);
    const node = {
      node_id: uiNode.nodeId,
      node_type: uiNode.nodeType,
      description: uiNode.nodeName,
      edges,
      content: {},
      node_info: nodeInfo,
    };
    if (uiNode.nodeType === 'entry') {
      node.entry_condition_rules = uiNode.triggerTab.rules;
    } else if (uiNode.nodeType === 'dialogue') {
      node.content = this.composeDialogueContent(uiNode);
      node.default_parser_with_suffix = uiNode.settingTab.parseFromThisNode;
      node.node_dialogue_cnt_limit = uiNode.edgeTab.dialogueLimit;
    } else if (uiNode.nodeType === 'nlu_pc') {
      node.content = this.composeNLUPCContent(
        uiNode.entityCollectingTab.entityCollectorList,
        uiNode.entityCollectingTab.re_parsers,
        uiNode.entityCollectingTab.register_json,
      );
    } else if (uiNode.nodeType === 'restful') {
      node.content = this.composeRestfulContent(uiNode);
    } else if (uiNode.nodeType === 'parameter_collecting') {
      node.content = this.composePCContent(
        uiNode.paramsCollectingTab.params,
        uiNode.paramsCollectingTab.enableConfirmMsg,
        uiNode.paramsCollectingTab.confirmMsg,
        uiNode.paramsCollectingTab.confirmMsgParseFail,
      );
    } else if (uiNode.nodeType === 'action') {
      node.content = this.composeActionContent(
        uiNode.actionTab.actionGroupList,
        uiNode.actionTab.waitForResponse,
      );
    } else if (uiNode.nodeType === 'dialogue_2.0') {
      node.content = this.composeDialogue2Content(uiNode);
      node.node_dialogue_cnt_limit = uiNode.edgeTab2.dialogueLimit;
    }
    return node;
  },
  getNodeInfo(edges) {
    let isLastNode = true;
    edges.forEach((edge) => {
      if (edge.edge_type === 'global_normal') return;
      if (!edge.to_node_id) return;
      const toNodeId = edge.to_node_id;
      if (toNodeId !== '0' && toNodeId !== null && toNodeId !== undefined) {
        isLastNode = false;
      }
    });
    return {
      is_last_node: isLastNode,
    };
  },
  composeActionContent(initialActionGroupList, waitForResponse) {
    const actionGroupList = JSON.parse(JSON.stringify(initialActionGroupList));
    actionGroupList.forEach((actionGroup) => {
      actionGroup.conditionList =
          scenarioConvertorV3.convertConditionList(actionGroup.conditionList);
    });
    return {
      action_group_list: actionGroupList,
      wait_for_response: waitForResponse,
    };
  },
  composePCContent(params, enableConfirmMsg, confirmMsg, confirmMsgParseFail) {
    const content = {};
    content.parsers = [];
    content.questions = [];
    content.enable_confirm_msg = enableConfirmMsg || false;
    content.confirm_msg = confirmMsg || '';
    content.confirm_msg_parse_fail = confirmMsgParseFail || '';
    params.forEach((param) => {
      const conditionRules = [];
      const skipIfKeyExistList = [];
      param.parsers.forEach((parser) => {
        const rule = this.composePCNodeParserRule(parser);
        conditionRules.push([rule]);

        let required = true;
        if (parser.required !== undefined) {
          required = parser.required;
        }
        // add the vars to skipIfKeyExistList if their required checkbox is set to true
        if (required === true) {
          rule.functions.forEach((func) => {
            const vars = this.getGlobalVarsFromFunction(func);
            skipIfKeyExistList.push(...vars);
          });
        }
      });
      content.parsers.push({ condition_rules: conditionRules });
      const question = this.composePCNodeQuestion(param, skipIfKeyExistList);
      content.questions.push(question);
    });
    return content;
  },
  composePCNodeParserRule(parser) {
    const rule = {
      source: 'text',
      functions: [{
        content: parser.content,
        function_name: parser.funcName,
      }],
    };
    // set skipIfKeyExist if exist
    if (parser.skipIfKeyExist !== undefined) {
      rule.functions[0].skipIfKeyExist = parser.skipIfKeyExist;
    }
    return rule;
  },
  composePCNodeQuestion(param, skipIfKeyExistList) {
    const question = {
      msg: param.msg,
      parse_failed_msg: param.parse_failed_msg,
      condition_rules: [[{
        source: 'global_info',
        functions: [{
          content: skipIfKeyExistList.map(key => ({ key })),
          function_name: 'not_contain_key',
        }],
      }]],
    };
    return question;
  },
  composeNLUPCContent(entityCollectorList, reParsers, registerJson) {
    let entities;
    // console.log(entityCollectorList);
    if (registerJson && registerJson.slotDefs) {
      entities = registerJson.slotDefs.map(slot => ({ entityName: slot.slotName, prompt: null }));
    } else {
      entities = entityCollectorList;
    }
    return {
      entities,
      reParsers,
    };
  },
  composeDialogueContent(uiNode) {
    const questions = [];
    if (uiNode.settingTab.parser !== 'none' &&
        uiNode.settingTab.skipIfKeyExist.length > 0) {
        // a default parser had been selected
        // insert skip_response
      let skipIfKeyExist = uiNode.settingTab.skipIfKeyExist;
      const parseFromThisNode = uiNode.settingTab.parseFromThisNode;
      if (parseFromThisNode) {
        const nodeId = uiNode.nodeId;
        skipIfKeyExist = skipIfKeyExist.map(key => `${key}_${nodeId}`);
      }
      const skipQ = this.questionTemplste('skip_response');
      skipQ.condition_rules = skipIfKeyExist.map(key => [
        this.conditionContainKey([key]),
      ]);
      questions.push(skipQ);
    }
    // insert failure_response
    const failureQ = this.questionTemplste('failure_response');
    failureQ.msg = uiNode.settingTab.failureResponse;
    failureQ.condition_rules = [[this.conditionParsingFailedIs(true)]];
    questions.push(failureQ);

    // insert initial_response
    const initialQ = this.questionTemplste('initial_response');
    initialQ.msg = uiNode.settingTab.initialResponse;
    questions.push(initialQ);
    return {
      questions,
    };
  },
  composeDialogue2Content(uiNode) {
    const skipDialogue = uiNode.dialogue2SettingTab.skipDialogue;
    // insert failure_response
    const failureResponse = {
      msg: uiNode.dialogue2SettingTab.failureResponse,
    };
    // insert initial_response
    const initialResponse = {
      msg: uiNode.dialogue2SettingTab.initialResponse,
    };
    const repeatResponse = {
      msg: uiNode.dialogue2SettingTab.repeatResponse,
    };
    const rewindResponse = {
      msg: uiNode.dialogue2SettingTab.rewindResponse,
    };
    return {
      skip_dialogue: skipDialogue,
      questions: {
        failure_response: failureResponse,
        initial_response: initialResponse,
        repeat_response: repeatResponse,
        rewind_response: rewindResponse,
      },
    };
  },
  composeRestfulContent(uiNode) {
    if (!uiNode.restfulSettingTab) return {};
    const tab = uiNode.restfulSettingTab;
    const content = {
      requests: [
        {
          body: {
            content: tab.body,
          },
          headers: {
            'Content-Type': tab.contentType,
          },
          method: tab.method,
          rtn_var_name: tab.rtnVarName,
          url: tab.url,
        },
      ],
    };
    return content;
  },
  questionTemplste(type) {
    return {
      question_type: type,
      msg: null,
      condition_rules: [],
    };
  },
  // convert tab data to edges
  convertUiNodeToEdges(uiNode, setting, initialGlobalEdges) {
    const globalEdges = this.changeSuffixOfGlobalEdges(
      uiNode.nodeId,
      this.addResetDialogueCntAndParseFailedAction(initialGlobalEdges),
    );
    let edges = [];
    if (uiNode.nodeType === 'entry') {
      const hiddenEdges = this.composeEntryNodeHiddenEdges(uiNode, setting);
      const normalEdges = this.addResetDialogueCntAndParseFailedAction(uiNode.edgeTab.normalEdges);
      const elseInto = this.edgeElseInto(uiNode.nodeId, uiNode.edgeTab.elseInto);
      edges = [
        ...hiddenEdges,
        ...normalEdges,
        ...globalEdges,
        elseInto,
      ];
    } else if (uiNode.nodeType === 'dialogue') {
      const hiddenEdges = this.composeDialogueNodeHiddenEdges(uiNode);
      const hiddenSetCntLimit = this.edgeHiddenSetNodeDialogueCntLimit(
        uiNode.edgeTab.dialogueLimit,
      );
      const normalEdges = this.addResetDialogueCntAndParseFailedAction(uiNode.edgeTab.normalEdges);
      const exceedThenGoto = this.edgeExceedThenGoTo(uiNode.edgeTab.exceedThenGoto);
      const elseInto = this.edgeElseInto(uiNode.nodeId, uiNode.edgeTab.elseInto);
      edges = [
        hiddenSetCntLimit,
        ...hiddenEdges,
        ...normalEdges,
        ...globalEdges,
        exceedThenGoto,
        elseInto,
      ];
    } else if (uiNode.nodeType === 'nlu_pc') {
      const elseInto = this.edgeElseInto(uiNode.nodeId, uiNode.edgeTab.elseInto);
      const normalEdges = this.addResetDialogueCntAndParseFailedAction(uiNode.edgeTab.normalEdges);
      edges = [
        ...normalEdges,
        ...globalEdges,
        elseInto,
      ];
    } else if (uiNode.nodeType === 'restful') {
      const tab = uiNode.restfulEdgeTab;
      const succeedEdge = this.edgeRestfulSucceed(tab.restfulSucceedThenGoto);
      const failedEdge = this.edgeRestfulFailed(tab.restfulFailedThenGoto);
      edges = [failedEdge, succeedEdge];
    } else if (uiNode.nodeType === 'parameter_collecting') {
      const tab = uiNode.paramsCollectingEdgeTab;
      const hiddenSetCntLimit = this.edgeHiddenSetNodeDialogueCntLimit(
        tab.dialogueLimit,
      );
      let normalEdges = this.addResetDialogueCntAndParseFailedAction(tab.normalEdges);
      normalEdges = this.insertGlobalEdges(normalEdges, globalEdges);
      edges = [
        hiddenSetCntLimit,
        ...normalEdges,
      ];
    } else if (uiNode.nodeType === 'action') {
      if (uiNode.edgeTab === undefined) {
        // only happen to old action node
        // initial edgeTab to action node
        uiNode.edgeTab = scenarioInitializer.initialEdgeTab(uiNode.nodeType);
      }
      const elseInto = this.edgeElseInto(uiNode.nodeId, uiNode.edgeTab.elseInto);
      const normalEdges = this.addResetDialogueCntAndParseFailedAction(uiNode.edgeTab.normalEdges);
      edges = [
        ...normalEdges,
        ...globalEdges,
        elseInto,
      ];
    } else if (uiNode.nodeType === 'dialogue_2.0') {
      const hiddenSetCntLimit = this.edgeHiddenSetNodeDialogueCntLimit(
        uiNode.edgeTab2.dialogueLimit,
      );
      const normalEdges = uiNode.edgeTab2.normalEdges;
      const exceedThenGoto = this.edgeExceedThenGoTo(uiNode.edgeTab2.exceedThenGoto);
      const elseInto = this.edgeElseInto(uiNode.nodeId, uiNode.edgeTab2.elseInto);
      edges = [
        hiddenSetCntLimit,
        ...normalEdges,
        ...globalEdges,
        exceedThenGoto,
        elseInto,
      ];
    }
    return edges;
  },
  addResetDialogueCntAndParseFailedAction(initialEdges) {
    const edges = JSON.parse(JSON.stringify(initialEdges));
    return edges.map((edge) => {
      if (edge.to_node_id !== null) {
        edge.actions = [
          this.actionSetParseFailed(false),
          this.actionSetNodeDialogueCnt(0),
        ];
      } else {
        edge.actions = [];
      }
      return edge;
    });
  },
  insertGlobalEdges(normalEdges, globalEdges) {
    let index = -1;
    normalEdges.find((edge, idx) => {
      if (edge.edge_type === 'virtual_global_edges') {
        index = idx;
        return true;
      }
      return false;
    });
    if (index === -1) {
      return normalEdges;
    }
    const normalEdgesA = normalEdges.slice(0, index);
    const normalEdgesB = normalEdges.slice(index + 1);
    return [
      ...normalEdgesA,
      ...globalEdges,
      ...normalEdgesB,
    ];
  },
  composeEntryNodeHiddenEdges(uiNode, setting) {
    const hidden1 = this.hiddenEdgeTemplate();
    hidden1.actions = [
      this.actionSetNodeDialogueCnt(0),
      this.actionSetScenarioDialogueCnt(0),
      this.actionSetScenarioDialogueCntLimit(setting.scenarioDialogueCntLimit),
      this.actionSetNodeDialogueCntLimit(setting.nodeDialogueCntLimit),
    ];
    return [
      hidden1,
      this.hiddenEdgeTemplate(),
      this.hiddenEdgeTemplate(),
    ];
  },
  composeDialogueNodeHiddenEdges(uiNode) {
    const parser = uiNode.settingTab.parser;
    if (parser === 'none') {
      return this.composeNoParserHiddenEdges(uiNode);
    }
    return this.composeWithParserHiddenEdges(uiNode);
  },
  composeNoParserHiddenEdges(uiNode) {
    const dialogueLimit = uiNode.edgeTab.dialogueLimit;
    const hidden1 = this.hiddenEdgeTemplate();
    hidden1.actions = [
      this.actionUpdateConfirmStatus(),
      this.actionSetNodeDialogueCntLimit(dialogueLimit),
    ];
    return [
      hidden1,
      this.hiddenEdgeTemplate(),
      this.hiddenEdgeTemplate(),
    ];
  },
  composeWithParserHiddenEdges(uiNode) {
    const nodeId = uiNode.nodeId;
    const parser = uiNode.settingTab.parser;
    const dialogueLimit = uiNode.edgeTab.dialogueLimit;
    const targetEntities = uiNode.settingTab.targetEntities;
    let skipIfKeyExist = uiNode.settingTab.skipIfKeyExist;
    const parseFromThisNode = uiNode.settingTab.parseFromThisNode;

    const hidden1 = this.hiddenEdgeTemplate();
    if (parseFromThisNode) {
      skipIfKeyExist = skipIfKeyExist.map(key => `${key}_${nodeId}`);
    }
    hidden1.condition_rules = [[
      this.conditionNotContainKey(skipIfKeyExist),
    ]];
    hidden1.actions = [
      this.actionSetParseFailed(true),
      this.actionUpdateConfirmStatus(),
      this.actionSetNodeDialogueCntLimit(dialogueLimit),
    ];

    const hidden2 = this.hiddenEdgeTemplate();
    hidden2.condition_rules = [[
      this.conditionNotContainKey(skipIfKeyExist),
      this.conditionParser(parser, targetEntities, nodeId),
    ]];
    hidden2.actions = [
      this.actionSetParseFailed(false),
    ];

    const hidden3 = this.hiddenEdgeTemplate();
    if (skipIfKeyExist.length > 0) {
      hidden3.to_node_id = nodeId;
      hidden3.condition_rules = [[
        this.conditionDialogueCntLessThan(dialogueLimit),
        this.conditionCounterCheck('scenario_counter_rev'),
        this.conditionNotContainKey(skipIfKeyExist),
      ]];
    }
    const hiddenEdges = [hidden1, hidden2, hidden3];
    return hiddenEdges;
  },
  getGlobalVarsFromParsers(parsers) {
    const globalVars = [];
    parsers.forEach((parser) => {
      parser.condition_rules.forEach((rules) => {
        rules.forEach((rule) => {
          let functions = [];
          if (rule.functions && rule.functions instanceof Array) {
            functions = rule.functions;
          }
          functions.forEach((func) => {
            const vars = this.getGlobalVarsFromFunction(func);
            globalVars.push(...vars);
          });
        });
      });
    });
    return globalVars;
  },
  getGlobalVarsFromActionGroup(actionGroupList) {
    const globalVars = [];
    actionGroupList.forEach((actionGroup) => {
      actionGroup.actionList.forEach((action) => {
        if (action.type === 'webhook') {
          globalVars.push(action.variable_name);
        }
      });
    });
    return globalVars;
  },
  changeSuffixOfGlobalEdges(nodeId, globalEdges) {
    return globalEdges.map((edge) => {
      if (edge.condition_rules &&
          edge.condition_rules instanceof Array &&
          edge.condition_rules.length > 0) {
        edge.condition_rules[0] = edge.condition_rules[0].map((rule) => {
          if (rule.functions && rule.functions instanceof Array) {
            rule.functions = rule.functions.map((func) => {
              const funcName = func.function_name;
              if (funcName === 'hotel_parser' ||
                  funcName === 'common_parser' ||
                  funcName === 'task_parser') {
                if (func.content && func.content.key_suffix) {
                  func.content.key_suffix = `_${nodeId}`;
                }
              }
              return func;
            });
          }
          return rule;
        });
      }
      return edge;
    });
  },
  getGlobalVars(edges) {
    const globalVars = [];
    edges.forEach((edge) => {
      if (edge.edge_type === 'normal_2.0') {
        edge.condition_rules.forEach((rule) => {
          const vars = this.getGlobalVarsFromFunction(rule.function);
          globalVars.push(...vars);
        });
        edge.actions.forEach((action) => {
          const vars = this.getGlobalVarsFromFunction(action.function);
          globalVars.push(...vars);
        });
      } else {
        let andRules = [];
        if (edge.condition_rules &&
          edge.condition_rules instanceof Array &&
          edge.condition_rules.length > 0) {
          andRules = edge.condition_rules[0];
        }
        andRules.forEach((rule) => {
          let functions = [];
          if (rule.functions && rule.functions instanceof Array) {
            functions = rule.functions;
          }
          functions.forEach((func) => {
            const vars = this.getGlobalVarsFromFunction(func);
            globalVars.push(...vars);
          });
        });
      }
    });
    return globalVars;
  },
  getGlobalVarsFromFunction(func) {
    const funcName = func.function_name;
    let vars = [];
    if (funcName === 'regular_exp') {
      if (func.content && func.content.operations && func.content.operations instanceof Array) {
        vars = func.content.operations.map(o => o.key);
      }
    } else if (funcName === 'hotel_parser') {
      if (func.content && func.content.tags && func.content.key_suffix) {
        vars = func.content.tags.split(',').filter(
          tag => tag !== 'multiselect-all',
        ).map(
          tag => tag + func.content.key_suffix,
        );
      }
    } else if (funcName === 'common_parser') {
      if (func.content && func.content.tags && func.content.key_suffix) {
        vars = func.content.tags.split(',').filter(
          tag => tag !== 'multiselect-all',
        ).map((tag) => {
          // remove '_module'
          const key = tag.replace('_module', '');
          return key + func.content.key_suffix;
        });
      }
    } else if (funcName === 'task_parser') {
      if (func.content && func.content.tags && func.content.key_suffix) {
        vars = func.content.tags.split(',').filter(
          tag => tag !== 'multiselect-all',
        ).map((tag) => {
          // snake_case to CamelCase
          const key = tag.replace(/_([\w])/g, m => m[1].toUpperCase());
          return key + func.content.key_suffix;
        });
      }
    } else if (funcName === 'nlu_parser') {
      if (func.content && func.content.tags && func.content.key_suffix) {
        vars = func.content.tags.split(',').map((tag) => {
          let key = tag;
          if (tag === 'TIME_FUTURE' || tag === 'TIME_PAST') {
            key = 'TIME';
          }
          if (tag === 'SELECT_CUSTOMIZE_OPTIONS' || tag === 'SELECT_OPTIONS_IN_KEY') {
            key = 'SELECT';
          }
          return key + func.content.key_suffix;
        });
      }
    } else if (funcName === 'user_custom_parser') {
      if (func.content && func.content.to_key) {
        vars = [func.content.to_key];
      }
    } else if (funcName === 'polarity_parser') {
      if (func.content && func.content.key && func.content.key_suffix) {
        // vars = [func.content.key + func.content.key_suffix];
        vars = [func.content.key];
      }
    } else if (funcName === 'user_custom_transform') {
      if (func.content && func.content.to_key) {
        vars = [func.content.to_key];
      }
    } else if (funcName === 'regular_exp_from_var') {
      if (func.content && func.content.operations && func.content.operations instanceof Array) {
        vars = func.content.operations.map(o => o.key);
      }
    } else if (funcName === 'assign_value') {
      if (func.content && Array.isArray(func.content)) {
        vars = [func.content[0].key];
      }
    } else if (funcName === 'api_parser') {
      if (func.skipIfKeyExist) {
        vars = func.skipIfKeyExist;
      }
    } else if (funcName === 'cu_parser') {
      vars = [func.content];
    }
    return vars;
  },
  appendActionToGlobalEdges(initialGlobalEdges) {
    let globalEdges = JSON.parse(JSON.stringify(initialGlobalEdges));
    globalEdges = globalEdges.map((edge) => {
      edge.actions = [
        this.actionSetParseFailed(false),
        this.actionSetNodeDialogueCnt(0),
      ];
      return edge;
    });
    return globalEdges;
  },
  edgeRestfulSucceed(toNode) {
    return {
      actions: [this.actionSetNodeDialogueCnt(0)],
      condition_rules: [[
        this.conditionRestfulSucceed(),
      ]],
      edge_type: 'restful_succeed',
      to_node_id: toNode,
    };
  },
  edgeRestfulFailed(toNode) {
    return {
      actions: [this.actionSetNodeDialogueCnt(0)],
      condition_rules: [[
        this.conditionRestfulFailed(),
      ]],
      edge_type: 'restful_failed',
      to_node_id: toNode,
    };
  },
  edgeHiddenSetNodeDialogueCntLimit(cnt) {
    const edge = this.hiddenEdgeTemplate();
    edge.actions = [
      this.actionSetNodeDialogueCntLimit(cnt),
    ];
    return edge;
  },
  edgeExceedThenGoTo(toNode) {
    return {
      to_node_id: toNode,
      edge_type: 'exceedThenGoTo',
      condition_rules: [
        [
          this.conditionCounterCheck('node_counter'),
        ],
      ],
      actions: [
        this.actionSetParseFailed(false),
        this.actionSetNodeDialogueCnt(0),
      ],
    };
  },
  edgeElseInto(nodeId, toNode) {
    const edge = {
      to_node_id: toNode,
      edge_type: 'else_into',
      condition_rules: [],
      actions: [],
    };
    if (toNode === 'parseFailedEdge') {
      edge.to_node_id = nodeId;
      edge.actions = [
        this.actionSetParseFailed(true),
      ];
    } else {
      edge.actions = [
        this.actionSetParseFailed(false),
        this.actionSetNodeDialogueCnt(0),
      ];
    }
    return edge;
  },
  conditionParsingFailedIs(val) {
    return this.conditionKeyValMatch('==', 'parsing_failed', val);
  },
  conditionDialogueCntLessThan(val) {
    return this.conditionKeyValMatch('<', 'sys_node_dialogue_cnt', val);
  },
  conditionKeyValMatch(compare, key, val) {
    return {
      source: 'global_info',
      functions: [
        {
          content: [
            {
              compare,
              key,
              val,
            },
          ],
          function_name: 'key_val_match',
        },
      ],
    };
  },
  conditionCounterCheck(content) {
    return {
      source: 'global_info',
      functions: [
        {
          content,
          function_name: 'counter_check',
        },
      ],
    };
  },
  conditionParser(parser, tags, nodeId) {
    const tagsString = tags.join(',');
    const keySuffix = `_${nodeId}`;
    return {
      source: 'text',
      functions: [
        {
          content: {
            key_suffix: keySuffix,
            tags: tagsString,
          },
          function_name: parser,
        },
      ],
    };
  },
  conditionContainKey(keys) {
    const content = keys.map(key => ({ key }));
    return {
      source: 'global_info',
      functions: [
        {
          content,
          function_name: 'contain_key',
        },
      ],
    };
  },
  conditionNotContainKey(keys) {
    const content = keys.map(key => ({ key }));
    return {
      source: 'global_info',
      functions: [
        {
          content,
          function_name: 'not_contain_key',
        },
      ],
    };
  },
  conditionRestfulSucceed() {
    return {
      functions: [
        {
          content: '',
          function_name: 'restful_succeed',
        },
      ],
      source: 'global_info',
    };
  },
  conditionRestfulFailed() {
    return {
      functions: [
        {
          content: '',
          function_name: 'restful_failed',
        },
      ],
      source: 'global_info',
    };
  },
  hiddenEdgeTemplate() {
    return {
      to_node_id: null,
      edge_type: 'hidden',
      condition_rules: [],
      actions: [],
    };
  },
  actionSetParseFailed(parseFailed) {
    return this.actionSetToGlobalInfo('parsing_failed', parseFailed);
  },
  actionUpdateConfirmStatus() {
    return {
      operation: 'update_confirm_status',
    };
  },
  actionSetNodeDialogueCnt(cnt) {
    return this.actionSetToGlobalInfo('sys_node_dialogue_cnt', cnt);
  },
  actionSetNodeDialogueCntLimit(cnt) {
    return this.actionSetToGlobalInfo('sys_node_dialogue_cnt_limit', cnt);
  },
  actionSetScenarioDialogueCnt(cnt) {
    return this.actionSetToGlobalInfo('sys_scenario_dialogue_cnt', cnt);
  },
  actionSetScenarioDialogueCntLimit(cnt) {
    return this.actionSetToGlobalInfo('sys_scenario_dialogue_cnt_limit', cnt);
  },
  actionSetToGlobalInfo(key, val) {
    return {
      operation: 'set_to_global_info',
      key,
      val,
    };
  },
  convertToTDERegistryData(scenarioId, entityCollectingTab, nodeId) {
    if (entityCollectingTab.register_json &&
        Object.keys(entityCollectingTab.register_json).length > 0) {
      // manually give register JSON
      const registerJson = JSON.parse(JSON.stringify(entityCollectingTab.register_json));
      registerJson.taskId = `${nodeId}_${scenarioId}`;
      return registerJson;
    }
    const entityList = entityCollectingTab.entityCollectorList.map((item) => {
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
    entityCollectingTab.relatedEntities.relatedEntityMatrix.forEach((row) => {
      for (let i = 1; i < row.length; i += 1) {
        indices.push({
          product: row[0].entity,
          slotName: entityCollectingTab.relatedEntities.relatedEntityCollectorList[i].entityName,
          slotValue: row[i].entity,
        });
      }
    });
    let products = [];
    if (entityCollectingTab.relatedEntities.relatedEntityCollectorList.length > 0) {
      products = entityCollectingTab.relatedEntities
      .relatedEntityCollectorList[0].ner.entitySynonymsList.map((item) => {
        const tmpObj = {};
        tmpObj[entityCollectingTab.relatedEntities.relatedEntityCollectorList[0].entityName]
            = item.entity;
        return tmpObj;
      });
    }
    if (entityList.length > 0) {
      if (entityCollectingTab.relatedEntities.relatedEntityCollectorList.length > 0) {
        const productIndex = this.getEntityListIndex(entityList,
            entityCollectingTab.relatedEntities.relatedEntityCollectorList[0].entityName);
        entityList[productIndex].slotBizType = 'Product';
        for (let i = 1;
          i < entityCollectingTab.relatedEntities.relatedEntityCollectorList.length; i += 1) {
          const tmpIndex = this.getEntityListIndex(entityList,
              entityCollectingTab.relatedEntities.relatedEntityCollectorList[i].entityName);
          entityList[tmpIndex].slotBizType = 'ProductPropertySearchable';
        }
      }
    }
    const data = {
      taskId: `${nodeId}_${scenarioId}`,
      nlgTemplate: entityCollectingTab.tde_setting.nlgTemplate,
      service: entityCollectingTab.tde_setting.service,
      jumpOutTimes: isNaN(parseInt(entityCollectingTab.tde_setting.jumpOutTimes, 10)) ?
          undefined : parseInt(entityCollectingTab.tde_setting.jumpOutTimes, 10),
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
  registerNluTdeScenario(scenarioId, nodes) {
    const that = this;
    nodes.filter(node => node.nodeType === 'nlu_pc').forEach((node) => {
      const entityCollectingTab = node.entityCollectingTab;
      if ((entityCollectingTab.entityCollectorList &&
           entityCollectingTab.entityCollectorList.length > 0) ||
          (entityCollectingTab.register_json &&
           Object.keys(entityCollectingTab.register_json).length > 0)) {
        const data = that.convertToTDERegistryData(
          scenarioId, entityCollectingTab, node.nodeId);
        api.registerNluTdeScenario(data);
      }
    });
  },
  parseTriggerIntents(uiNodes) {
    const triggerIntents = {};
    const entryNode = uiNodes.find(uiNode => uiNode.nodeType === 'entry');
    entryNode.triggerTab.rules.forEach((andCondtions) => {
      andCondtions.forEach((condtion) => {
        if (condtion.functions[0].function_name === 'intent_parser' &&
            condtion.functions[0].content &&
            condtion.functions[0].content.intentName) {
          triggerIntents[condtion.functions[0].content.intentName] = 1;
        }
      });
    });
    return Object.keys(triggerIntents);
  },
  traverseEdges(nodes, globalEdges) {
    // initial node_info
    let nodeConnections = {};
    nodes.forEach((node) => {
      nodeConnections[node.node_id] = {
        hasInboundConnection: false,
        hasOutboundConnection: false,
        hasExitConnection: false,
        hasInnerConnection: false,
        hasConnectionToNotExistNode: false,
      };
    });

    nodes.forEach((node) => {
      const nodeId = node.node_id;
      if (nodeId === '0') return;
      node.edges.forEach((edge) => {
        const edgeType = edge.edge_type || 'normal';
        if (edgeType === 'qq') {
          nodeConnections = this.traverseQQEdge(nodeId, edge, nodeConnections);
        } else {
          nodeConnections = this.traverseEdge(nodeId, edge, edgeType, nodeConnections);
        }
      });
      globalEdges.forEach((edge) => {
        const edgeType = edge.edge_type || 'normal';
        if (edgeType === 'qq') {
          nodeConnections = this.traverseQQEdge(nodeId, edge, nodeConnections);
        } else {
          nodeConnections = this.traverseEdge(nodeId, edge, edgeType, nodeConnections);
        }
      });
      if (node.node_type === 'action') {
        let actionGroupList = [];
        if (node.content instanceof Object) {
          actionGroupList = node.content.action_group_list;
        } else if (node.content instanceof Array) {
          actionGroupList = node.content;
        }
        nodeConnections = this.traverseActionGroupList(nodeId, actionGroupList, nodeConnections);
      }
    });
    return nodeConnections;
  },
  traverseActionGroupList(nodeId, actionGroupList, nodeConnections) {
    actionGroupList.forEach((actionGroup) => {
      actionGroup.actionList.forEach((action) => {
        if (action.type === 'webhook') {
          let toNodeId = action.webhookSuccessThenGoto;
          this.setNodeConnections(nodeConnections, nodeId, toNodeId);
          toNodeId = action.webhookFailThenGoto;
          this.setNodeConnections(nodeConnections, nodeId, toNodeId);
        } else if (action.type === 'goto') {
          const toNodeId = action.targetSkillId;
          this.setNodeConnections(nodeConnections, nodeId, toNodeId);
        }
      });
    });
    return nodeConnections;
  },
  setNodeConnections(nodeConnections, nodeId, toNodeId) {
    if (toNodeId === null || toNodeId === nodeId || nodeConnections[toNodeId] === undefined) return;
    if (toNodeId === '0') {
      nodeConnections[nodeId].hasExitConnection = true;
    } else {
      nodeConnections[toNodeId].hasInboundConnection = true;
      nodeConnections[nodeId].hasOutboundConnection = true;
    }
  },
  traverseQQEdge(nodeId, edge, nodeConnections) {
    if (!edge.candidate_edges) return nodeConnections;
    edge.candidate_edges.forEach((e) => {
      const toNodeId = e.to_node_id;
      if (toNodeId === null || toNodeId === nodeId) {
        return;
      }
      if (nodeConnections[toNodeId] === undefined) {
        nodeConnections[nodeId].hasConnectionToNotExistNode = true;
        return;
      }

      if (toNodeId === '0') {
        nodeConnections[nodeId].hasExitConnection = true;
      } else {
        nodeConnections[toNodeId].hasInboundConnection = true;
        nodeConnections[nodeId].hasOutboundConnection = true;
      }
    });
    return nodeConnections;
  },
  traverseEdge(nodeId, edge, edgeType, nodeConnections) {
    const toNodeId = edge.to_node_id;
    if (toNodeId === null) {
      return nodeConnections;
    }
    if (nodeConnections[toNodeId] === undefined) {
      nodeConnections[nodeId].hasConnectionToNotExistNode = true;
      return nodeConnections;
    }
    if (edgeType === 'hidden') { // hidden edge
      if (toNodeId === nodeId) {
        nodeConnections[nodeId].hasInnerConnection = true;
      }
    } else {
      if (edgeType === 'else_into') {
        if (toNodeId === nodeId) {
          // inner connection: the node connect to itself
          nodeConnections[nodeId].hasInnerConnection = true;
        }
      }
      if (toNodeId === nodeId) {
        return nodeConnections;
      } else if (toNodeId === '0') {
        nodeConnections[nodeId].hasExitConnection = true;
      } else {
        nodeConnections[toNodeId].hasInboundConnection = true;
        nodeConnections[nodeId].hasOutboundConnection = true;
      }
    }
    return nodeConnections;
  },
  generateWarnings(uiNodes, nodeConnections) {
    uiNodes.forEach((uiNode) => {
      uiNode.warnings = [];
      const nodeType = uiNode.nodeType || 'normal';
      const nodeId = uiNode.nodeId;
      this.checkNodeFormat(uiNode, nodeConnections, nodeType, nodeId);
      // has inbound connection or not
      if (nodeType !== 'entry' &&
          nodeConnections[nodeId].hasInboundConnection === false) {
        uiNode.warnings.push({
          type: 'missing_inbound_connection',
          // warning_msg: '请新增至少一个指向此节点的连线',
        });
      }
      // has exit connection or not
      if (nodeConnections[nodeId].hasExitConnection === true) {
        uiNode.warnings.push({
          type: 'has_exit_connection',
          // warning_msg: '出口节点',
        });
      }
      // has outbound connection or not
      if (nodeConnections[nodeId].hasOutboundConnection === false &&
          nodeConnections[nodeId].hasExitConnection === false) {
        uiNode.warnings.push({
          type: 'missing_outbound_connection',
          // warning_msg: '请在此节点新增至少一个指向其他节点的连线',
        });
      }
      // has connection to not exist node
      if (nodeConnections[nodeId].hasConnectionToNotExistNode === true) {
        uiNode.warnings.push({
          type: 'hss_connection_to_not_exist_node',
        // warning_msg: '存在有问题的连线，连线指向不存在或是已经被删除的节点。',
        });
      }
    });
  },
  checkNodeFormat(uiNode, nodeConnections, nodeType, nodeId) {
    if (nodeType === 'entry') {
      if (!uiNode.triggerTab.rules || uiNode.triggerTab.rules.length === 0) {
        uiNode.warnings.push({
          type: 'missing_entry_trigger',
          // warning_msg: '缺少触发条件',
        });
      }
    } else if (nodeType === 'dialogue') {
      if (!uiNode.settingTab.initialResponse || uiNode.settingTab.initialResponse === '') {
        uiNode.warnings.push({
          type: 'missing_response',
          // warning_msg: '预设文本栏位不能为空白，请填入询问语句。',
        });
      }
      if (nodeConnections[nodeId].hasInnerConnection === true) {
        if (!uiNode.settingTab.failureResponse || uiNode.settingTab.failureResponse === '') {
          uiNode.warnings.push({
            type: 'missing_failure_response',
            // warning_msg: '解析失败文本栏位不能为空白，请填入解析失败时的提示语句。',
          });
        }
      }
    } else if (nodeType === 'dialogue_2.0') {
      if (!uiNode.dialogue2SettingTab.initialResponse || uiNode.dialogue2SettingTab.initialResponse === '') {
        uiNode.warnings.push({
          type: 'missing_response_dialogue_2',
          // warning_msg: '预设话术栏位不能为空白，请填入询问语句。',
        });
      }
      if (nodeConnections[nodeId].hasInnerConnection === true) {
        if (!uiNode.dialogue2SettingTab.failureResponse || uiNode.dialogue2SettingTab.failureResponse === '') {
          uiNode.warnings.push({
            type: 'missing_failure_response_dialogue_2',
            // warning_msg: '解析失败话术栏位不能为空白，请填入解析失败时的提示语句。',
          });
        }
      }
    } else if (nodeType === 'parameter_collecting') {
      let params = [];
      if (uiNode.paramsCollectingTab && uiNode.paramsCollectingTab.params) {
        params = uiNode.paramsCollectingTab.params;
      }
      let missingMsg = false;
      let missingParseFailedMsg = false;
      params.forEach((param) => {
        if (param.msg === '') {
          missingMsg = true;
        }
        if (param.parse_failed_msg === '') {
          missingParseFailedMsg = true;
        }
      });
      if (missingMsg === true) {
        uiNode.warnings.push({
          type: 'missing_response_pc',
          // warning_msg: '参数询问文本栏位不能为空白，请填入询问语句。',
        });
      }
      if (missingParseFailedMsg === true) {
        uiNode.warnings.push({
          type: 'missing_failure_response_pc',
          // warning_msg: '解析失败文本栏位不能为空白，请填入解析失败时的提示语句。',
        });
      }
    }
  },
  addBackContentTextArray(context, nodes, globalEdges) {
    nodes.forEach((node) => {
      const nodeId = node.node_id;
      if (nodeId === '0') return;
      node.edges.forEach((edge) => {
        const edgeType = edge.edge_type || 'normal';
        this.addContentTextArrayToEdge(edge, edgeType, context);
      });
    });
    globalEdges.forEach((edge) => {
      this.addContentTextArrayToEdge(edge, edge.edge_type, context);
    });
  },
  addContentTextArrayToEdge(edge, edgeType, context) {
    if (edgeType === 'hidden' || edgeType === 'exceedThenGoTo' || edgeType === 'qq') return;
    const counterCheckOptions = optionConfig.getCounterCheckOptions(context);
    if (edge.condition_rules &&
        edge.condition_rules.length > 0) {
      const andRules = edge.condition_rules[0];
      andRules.forEach((rule) => {
        if (rule.functions && rule.functions.length > 0) {
          rule.functions.forEach((func) => {
            this.addContentTextArrayToFunc(func, counterCheckOptions);
          });
        }
      });
    }
  },
  addContentTextArrayToFunc(func, counterCheckOptions) {
    const funcName = func.function_name;
    if (funcName === 'hotel_parser') {
      const tags = func.content.tags.split(',');
      const array = tags.filter(
        tag => tag !== 'multiselect-all',
      ).map(tag => tag);
      func.content_text_array = array;
    } else if (funcName === 'common_parser') {
      const tags = func.content.tags.split(',');
      const array = tags.filter(
        tag => tag !== 'multiselect-all',
      ).map((tag) => {
        // remove '_module'
        const key = tag.replace('_module', '');
        return key;
      });
      func.content_text_array = array;
    } else if (funcName === 'task_parser') {
      const tags = func.content.tags.split(',');
      const array = tags.filter(
        tag => tag !== 'multiselect-all',
      ).map((tag) => {
        // snake_case to CamelCase
        const key = tag.replace(/_([\w])/g, m => m[1].toUpperCase());
        return key;
      });
      func.content_text_array = array;
    } else if (funcName === 'counter_check') {
      const content = func.content;
      const option = counterCheckOptions.find(o => o.value === content);
      if (option) {
        func.content_text_array = [option.text];
      }
    } else if (funcName === 'cu_parser') {
      const content = func.content;
      func.content_text_array = [content];
    }
  },
  parseCustomParsers(uiNodes) {
    const customParsers = {};
    uiNodes.forEach((uiNode) => {
      const newUiNode = JSON.parse(JSON.stringify(uiNode));
      this.parseCustomParser(newUiNode, customParsers);
    });
    return customParsers;
  },
  parseCustomParser(uiNode, customParsers) {
    if (uiNode.nodeType === 'entry') {
      const normalEdges = uiNode.edgeTab.normalEdges;
      normalEdges.forEach((edge) => {
        if (edge.condition_rules &&
          edge.condition_rules instanceof Array &&
          edge.condition_rules.length > 0) {
          const andRules = edge.condition_rules[0];
          andRules.forEach((rule) => {
            if (rule.functions && rule.functions.length > 0) {
              rule.functions.forEach((func) => {
                if (func.function_name === 'custom_parser') {
                  customParsers[func.content.parser] = func.content.parserData;
                }
              });
            }
          });
        }
      });
    } else if (uiNode.nodeType === 'dialogue') {
      const normalEdges = uiNode.edgeTab.normalEdges;
      normalEdges.forEach((edge) => {
        if (edge.condition_rules &&
          edge.condition_rules instanceof Array &&
          edge.condition_rules.length > 0) {
          const andRules = edge.condition_rules[0];
          andRules.forEach((rule) => {
            if (rule.functions && rule.functions.length > 0) {
              rule.functions.forEach((func) => {
                if (func.function_name === 'custom_parser') {
                  customParsers[func.content.parser] = func.content.parserData;
                }
              });
            }
          });
        }
      });
    } else if (uiNode.nodeType === 'parameter_collecting') {
      const params = uiNode.paramsCollectingTab.params;
      params.forEach((param) => {
        param.parsers.forEach((parser) => {
          if (parser.funcName === 'custom_parser') {
            customParsers[parser.content.parser] = parser.content.parserData;
          }
        });
      });
      const normalEdges = uiNode.paramsCollectingEdgeTab.normalEdges;
      normalEdges.forEach((edge) => {
        if (edge.condition_rules &&
          edge.condition_rules instanceof Array &&
          edge.condition_rules.length > 0) {
          const andRules = edge.condition_rules[0];
          andRules.forEach((rule) => {
            if (rule.functions && rule.functions.length > 0) {
              rule.functions.forEach((func) => {
                if (func.function_name === 'custom_parser') {
                  customParsers[func.content.parser] = func.content.parserData;
                }
              });
            }
          });
        }
      });
    } else if (uiNode.nodeType === 'dialogue_2.0') {
      const normalEdges = uiNode.edgeTab2.normalEdges;
      normalEdges.forEach((edge) => {
        edge.actions.forEach((action) => {
          if (action.type === 'custom_parser') {
            customParsers[action.parser] = action.function.content.parserData;
          }
        });
      });
    }
  },
};
