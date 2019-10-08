import optionConfig from './optionConfig';
import version11To26 from './VersionConvertors/version11To26';

export default {
  convertJsonToVersion(toVersion, originalJsonData) {
    let jsonData = originalJsonData;
    let jsonVersion;
    if ('version' in jsonData.moduleData) {
      jsonVersion = jsonData.moduleData.version;
    } else {
      jsonVersion = '1.0';
    }
    let converted = false;
    while (jsonVersion !== toVersion || converted !== true) {
      if (jsonVersion === '1.0') {
        jsonData = this.convertJson_1_0_to_1_1(jsonData);
      } else if (jsonVersion === '1.1' || jsonVersion === '2.6') {
        jsonData = version11To26.convert(jsonData);
      }
      converted = true;

      if ('version' in jsonData.moduleData) {
        jsonVersion = jsonData.moduleData.version;
      } else {
        console.error('The version info is missing in json data');
        return jsonData;
      }
    }
    return jsonData;
  },
  convertJson_1_0_to_1_1(initialJsonData) {
    const jsonData = JSON.parse(JSON.stringify(initialJsonData));
    const nodes = jsonData.moduleData.nodes.filter(
      node => node.node_id !== '0',
    ).map(
      node => this.convertNode(node),
    );
    jsonData.moduleData.ui_data = {
      nodes,
    };
    if (!('global_edges' in jsonData.moduleData)) {
      jsonData.moduleData.global_edges = [];
    }
    jsonData.moduleData.version = '1.1';
    return jsonData;
  },
  convertNode(initialNode) {
    const node = JSON.parse(JSON.stringify(initialNode));
    const nodeType = node.node_type;
    // render tab data
    let tabs = [];
    const nodeType2TabsMap = optionConfig.nodeType2Tabs();
    if (nodeType in nodeType2TabsMap) {
      tabs = nodeType2TabsMap[nodeType];
    }
    const tabData = {};
    tabs.forEach((tab) => {
      if (tab === 'triggerTab') {
        tabData.triggerTab = this.parseTriggerTab(node);
      } else if (tab === 'settingTab') {
        tabData.settingTab = this.parseSettingTab(node);
      } else if (tab === 'edgeTab') {
        tabData.edgeTab = this.parseEdgeTab(node);
      } else if (tab === 'settingBasicTab') {
        tabData.settingBasicTab = this.parseSettingBasicTab(node);
      } else if (tab === 'entityCollectingTab') {
        tabData.entityCollectingTab = {
          relatedEntities: {
            relatedEntityCollectorList: [],
            relatedEntityMatrix: [],
          },
          tde_setting: {},
        };
      } else if (tab === 'restfulSettingTab') {
        tabData.restfulSettingTab = this.parseRestfulSettingTab(node);
      } else if (tab === 'restfulEdgeTab') {
        tabData.restfulEdgeTab = this.parseRestfulEdgeTab(node);
      } else if (tab === 'paramsCollectingTab') {
        tabData.paramsCollectingTab = this.parseParamsCollectingTab(node);
      } else if (tab === 'paramsCollectingEdgeTab') {
        tabData.paramsCollectingEdgeTab = this.parseParamsCollectingEdgeTab(node);
      }
    });
    return {
      nodeId: node.node_id,
      nodeName: node.description || '',
      nodeType,
      triggerTab: tabData.triggerTab,
      settingTab: tabData.settingTab,
      edgeTab: tabData.edgeTab,
      settingBasicTab: tabData.settingBasicTab,
      entityCollectingTab: tabData.entityCollectingTab,
      restfulSettingTab: tabData.restfulSettingTab,
      restfulEdgeTab: tabData.restfulEdgeTab,
      paramsCollectingTab: tabData.paramsCollectingTab,
      paramsCollectingEdgeTab: tabData.paramsCollectingEdgeTab,
    };
  },
  removeActionsAndContentTextArray(normalEdges) {
    return normalEdges.map((edge) => {
      if (edge.edge_type === 'normal') { // remove unneeded content_text_array and actions
        edge.actions = [];
        edge.condition_rules.forEach((condition) => {
          condition.forEach((ifCase) => {
            ifCase.functions.forEach((fun) => {
              delete fun.content_text_array;
            });
          });
        });
      }
      return edge;
    });
  },
  parseTriggerTab(node) {
    if (!node.entry_condition_rules) return undefined;
    const rules = node.entry_condition_rules;
    rules.forEach((condition) => {
      condition.forEach((ifCase) => {
        ifCase.functions.forEach((fun) => {
          delete fun.content_text_array;
        });
      });
    });
    return {
      rules,
    };
  },
  parseSettingBasicTab(node) {
    const tab = {};
    // render nodeType, nodeName
    tab.nodeType = node.node_type || '';
    tab.nodeName = node.description || '';
    return tab;
  },
  parseSettingTab(node) {
    const tab = {};
    // parse nodeName
    tab.nodeName = node.description || '';

    // parse parser, targetEntities, skipIfKeyExist
    const c = node.edges[1].condition_rules;
    if (c.length > 0 && c[0].length > 1) {
      tab.parser = c[0][1].functions[0].function_name;
      if (typeof c[0][1].functions[0].content === 'object') {
        tab.targetEntities = c[0][1].functions[0].content.tags.split(',');
      }
      if (typeof c[0][1].functions[0].content === 'string') {
        tab.targetEntities = c[0][1].functions[0].content.split(',');
      }
      tab.skipIfKeyExist = c[0][0].functions[0].content.map(obj => obj.key.split('_')[0]);
    } else {
      tab.parser = 'none';
      tab.targetEntities = [];
      tab.skipIfKeyExist = [];
    }

    if (node.ui_node_type === 'router') {
      tab.initialResponse = '$skip_dialogue';
      tab.failureResponse = '';
    } else {
      // parse responses
      const qLength = node.content.questions.length;
      let initResp = node.content.questions.find(
        q => q.question_type === 'initial_response',
      );
      if (initResp === undefined) {
        initResp = node.content.questions[qLength - 1];
      }
      let failResp = node.content.questions.find(
        q => q.question_type === 'failure_response',
      );
      if (failResp === undefined) {
        failResp = node.content.questions[qLength - 2];
      }
      tab.initialResponse = initResp.msg;
      tab.failureResponse = failResp.msg;
    }

    // parse parseFromThisNode
    tab.parseFromThisNode = node.default_parser_with_suffix;
    return tab;
  },
  parseEdgeTab(node) {
    const edges = node.edges || [];
    if (edges.length > 0 && edges[0].edge_type === undefined) {
      return this.parseEdgeTabWithoutEdgeType(node);
    }
    return this.parseEdgeTabWithEdgeType(node);
  },
  parseEdgeTabWithEdgeType(node) {
    const tab = {};
    const nodeType = node.node_type || '';

    // render edges, normalEdges
    const edges = node.edges || [];
    tab.normalEdges = edges.filter(edge => edge.edge_type === 'normal' || edge.edge_type === 'qq');
    tab.normalEdges = this.removeActionsAndContentTextArray(tab.normalEdges);

    // render exceedThenGoto
    if (nodeType !== 'entry') {
      let exceedGotoEdge = edges.find(edge => edge.edge_type === 'exceedThenGoTo');
      if (!exceedGotoEdge) {
        exceedGotoEdge = edges.find((edge) => {
          if (edge.condition_rules &&
            edge.condition_rules.length > 0 &&
            edge.condition_rules[0].length > 0 &&
            edge.condition_rules[0][0].functions &&
            edge.condition_rules[0][0].functions.length > 0 &&
            edge.condition_rules[0][0].functions[0].content_text_array &&
            edge.condition_rules[0][0].functions[0].content_text_array.length > 0 &&
            edge.condition_rules[0][0].functions[0].content_text_array[0] === '若超过节点对话轮数限制'
            ) {
            edge.edge_type = 'exceedThenGoTo';
            return true;
          }
          return false;
        });
      }
      if (exceedGotoEdge) {
        tab.exceedThenGoto = exceedGotoEdge.to_node_id;
      } else {
        tab.exceedThenGoto = '0';
      }
    }
    // render elseInto
    const elseIntoEdge = edges.find(edge => edge.edge_type === 'else_into');
    if (elseIntoEdge === undefined) {
      tab.elseInto = null;
    } else {
      tab.elseInto = elseIntoEdge.to_node_id;
    }

    // render dialogueLimit
    if (node.node_dialogue_cnt_limit) {
      tab.dialogueLimit = node.node_dialogue_cnt_limit;
    } else {
      const dialogueLimitEdge = edges.find(edge =>
        edge.edge_type === 'hidden' &&
        edge.actions &&
        edge.actions.length >= 1 &&
        edge.actions[0].key === 'sys_node_dialogue_cnt_limit',
      );
      if (dialogueLimitEdge) {
        tab.dialogueLimit = dialogueLimitEdge.actions[0].val;
      } else {
        tab.dialogueLimit = 3;
      }
    }
    return tab;
  },
  parseEdgeTabWithoutEdgeType(node) {
    const tab = {};
    tab.exceedThenGoto = '0';
    tab.normalEdges = [];
    for (let index = 0; index < node.edges.length; index += 1) {
      const edge = node.edges[index];
      if (index === 0 && node.edges.length >= 3) {
        // skip the parser function on conditions UI (which is selected in setting page)
        // insert parser function into setting page
        if (edge.actions &&
            edge.actions.length >= 1 &&
            edge.actions[0].key === 'sys_node_dialogue_cnt_limit') {
          tab.dialogueLimit = edge.actions[0].val;
        } else {
          tab.dialogueLimit = 3;
        }
        index += 2;
      } else if (index === node.edges.length - 1) {
        // else edge
        tab.elseInto = edge.to_node_id;
      } else if (edge.edge_type === 'qq') {
        // qq edges
        tab.normalEdges.push(edge);
      } else {
        // normal edges
        edge.edge_type = 'normal';
        edge.condition_rules.forEach((condition) => {
          condition.forEach((ifCase) => {
            ifCase.functions.forEach((fun) => {
              if (fun.function_name === 'task_parser' ||
                  fun.function_name === 'common_parser' ||
                  fun.function_name === 'hotel_parser') {
                if (typeof fun.content === 'string') {
                  fun.content = {
                    tags: fun.content,
                    key_suffix: `_${node.node_id}`,
                  };
                }
              }
            });
          });
        });
        tab.normalEdges.push(edge);
        tab.normalEdges = this.removeActionsAndContentTextArray(tab.normalEdges);
      }
    }
    return tab;
  },
  parseRestfulSettingTab(node) {
    let tab = {};
    if (node.content && node.content.requests &&
        node.content.requests.length > 0) {
      const request = node.content.requests[0];
      tab = {
        nodeType: node.node_type || '',
        nodeName: node.description || '',
        url: request.url,
        method: request.method,
        contentType: request.headers['Content-Type'],
        body: request.body.content,
        rtnVarName: request.rtn_var_name,
      };
    }
    return tab;
  },
  parseRestfulEdgeTab(node) {
    const edges = node.edges || [];
    const restfulFailedEdge = edges.find((edge) => {
      if (edge.condition_rules && edge.condition_rules.length > 0 &&
          edge.condition_rules[0].length > 0 &&
          edge.condition_rules[0][0].functions &&
          edge.condition_rules[0][0].functions.length > 0) {
        const funcName = edge.condition_rules[0][0].functions[0].function_name;
        if (funcName === 'restful_failed') {
          return true;
        }
      }
      return false;
    });
    const restfulSucceedEdge = edges.find((edge) => {
      if (edge.condition_rules && edge.condition_rules.length > 0 &&
          edge.condition_rules[0].length > 0 &&
          edge.condition_rules[0][0].functions &&
          edge.condition_rules[0][0].functions.length > 0) {
        const funcName = edge.condition_rules[0][0].functions[0].function_name;
        if (funcName === 'restful_succeed') {
          return true;
        }
      }
      return false;
    });
    const tab = {
      restfulFailedThenGoto: restfulFailedEdge.to_node_id,
      restfulSucceedThenGoto: restfulSucceedEdge.to_node_id,
    };
    return tab;
  },
  parseParamsCollectingEdgeTab(node) {
    const tab = {};
    node.edges[0].edge_type = 'pc_succeed';
    tab.dialogueLimit = node.edges[1].actions[0].val;
    node.edges[2].edge_type = 'pc_failed';
    tab.normalEdges = node.edges.filter(edge => edge.edge_type !== 'hidden');
    tab.normalEdges = this.removeActionsAndContentTextArray(tab.normalEdges);
    return tab;
  },
  parseParamsCollectingTab(node) {
    const tab = {
      enableConfirmMsg: false,
      confirmMsg: '',
      confirmMsgParseFail: '',
    };
    tab.params = [];
    node.content.questions.forEach((q, index) => {
      const param = {};
      param.msg = q.msg;
      param.parse_failed_msg = q.parse_failed_msg;
      param.parsers = [];
      const conditionRules = node.content.parsers[index].condition_rules;
      conditionRules.forEach((conditionRule) => {
        const parser = {};
        parser.content = conditionRule[0].functions[0].content;
        parser.funcName = conditionRule[0].functions[0].function_name;
        if (parser.funcName === 'api_parser' && conditionRule[0].functions[0].content_text_array) {
          parser.skipIfKeyExist = conditionRule[0].functions[0].content_text_array;
        }
        param.parsers.push(parser);
      });
      tab.params.push(param);
    });
    return tab;
  },
};
