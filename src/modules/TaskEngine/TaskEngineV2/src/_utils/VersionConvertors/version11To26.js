export default {
  convert(initialJsonData) {
    const jsonData = JSON.parse(JSON.stringify(initialJsonData));
    jsonData.moduleData.ui_data.nodes = jsonData.moduleData.ui_data.nodes.map(
        node => this.convertNode(node),
    );
    jsonData.moduleData.global_edges = jsonData.moduleData.global_edges.map(
      node => this.convertGlobalEdges(node),
    );
    jsonData.moduleData.version = '2.6';
    return jsonData;
  },
  convertNode(node) {
    this.convertNodeEdgeElseIntoO2N(node);
    const nodeType = node.nodeType;
    if (nodeType === 'exit') {
      return node;
    } else if (nodeType === 'entry') {
      node.triggerTab.rules = this.convertConditionRules(node.triggerTab.rules);
      return node;
    } else if (nodeType === 'entry' || nodeType === 'dialogue' || nodeType === 'nlu_pc' || nodeType === 'action') {
      node.edgeTab.normalEdges = node.edgeTab.normalEdges.map((edge) => {
        if (edge.edge_type === 'qq') {
          console.warn(`qq edge (语句相似度) is no longer supported. Found qq edge in ${node.nodeName}`);
          return edge;
        }
        edge.condition_rules = this.convertConditionRules(edge.condition_rules);
        return edge;
      });
      return node;
    } else if (nodeType === 'parameter_collecting') {
      const normalEdges = node.paramsCollectingEdgeTab.normalEdges.map((edge) => {
        if (edge.edge_type === 'qq') {
          console.warn(`qq edge (语句相似度) is no longer supported. Found qq edge in ${node.nodeName}`);
          return edge;
        }
        edge.condition_rules = this.convertConditionRules(edge.condition_rules);
        return edge;
      });
      node.paramsCollectingEdgeTab.normalEdges = normalEdges;
      return node;
    }
    return node;
  },
  convertConditionRules(conditionRules) {
    return conditionRules.map((andCondtions) => {
      // replace old cu_parser with intent_parser json
      const length = andCondtions.length;
      if (length < 2) {
        return andCondtions;
      }
      const conditions = [];
      for (let i = 0; i < length; i += 1) {
        const cond1 = andCondtions[i];
        if (i + 1 >= length) {
          conditions.push(cond1);
          return conditions;
        }
        const cond2 = andCondtions[i + 1];
        if ((cond1.functions[0].function_name === 'cu_parser' && cond1.functions[0].content === 'Intent') ||
            (cond1.functions[0].function_name === 'custom_cu_parser')) {
          if (cond2.functions[0].function_name === 'key_val_match' &&
              cond2.functions[0].content[0].compare === '==' &&
              cond2.functions[0].content[0].key === 'Intent') {
            i += 1;
            conditions.push(
              {
                source: 'text',
                functions: [
                  {
                    function_name: 'intent_parser',
                    content: {
                      module: 'intent_engine_2.0',
                      intentName: cond2.functions[0].content[0].val,
                      to_key: 'Intent',
                    },
                  },
                ],
              },
                );
          }
        } else {
          conditions.push(cond1);
        }
      }
      return conditions;
    });
  },
  convertNodeEdgeElseIntoO2N(uiNode) {
    if (uiNode.edgeTab && uiNode.edgeTab.elseInto === uiNode.nodeId) {
      uiNode.edgeTab.elseInto = 'parseFailedEdge';
    }
    if (uiNode.edgeTab2 && uiNode.edgeTab2.elseInto === uiNode.nodeId) {
      uiNode.edgeTab2.elseInto = 'parseFailedEdge';
    }
  },
  convertGlobalEdges(node) {
    if (node.edge_type === 'normal') {
      node.edge_type = 'global_normal';
    }
    return node;
  },
};
