// import * as cookie from 'tiny-cookie';
// import ErrorAlert from '../components/ErrorAlert';
import event from '@/utils/js/event';

export default {
  popErrorWindow(context, msg, err) {
    context.$root.$popError(msg, err);
  },
  getLocalDateTimeIsoString() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  },
  composeV2Path(childPath) {
    const PAGE_PATH = '/task-engine-scenario-v2';
    return `${PAGE_PATH}/${childPath}`;
  },
  composeV3Path(childPath) {
    const PAGE_PATH = '/task-engine-scenario-v3';
    return `${PAGE_PATH}/${childPath}`;
  },
  JSONStringifyReplacer(key, value) {
    return ((value instanceof Object) && !(value instanceof Array)) ?
      Object.keys(value).sort().reduce((sorted, k) => {
        sorted[k] = value[k];
        return sorted;
      }, {}) : value;
  },
  suffixIndexToNodeName(newNodeName, nodeNames) {
    // suffix _${index} to newNodeName if there are other nodeNames are start with newNodeName
    let nodeNameList = nodeNames;
    if (!nodeNameList) {
      nodeNameList = window.moduleData.ui_data.nodes.map(node => node.nodeName);
    }
    const sameNameList = nodeNameList.filter(nodeName => nodeName.startsWith(newNodeName));
    if (sameNameList.length === 0) {
      return newNodeName;
    }
    let index = 1;
    sameNameList.forEach((name) => {
      const matches = name.match(`^${newNodeName}_(\\d+)(_copy)*$`);
      if (!matches) return;
      const oldIndex = parseInt(matches[1], 10) || -1;
      if (oldIndex >= index) {
        index = oldIndex + 1;
      }
    });
    return `${newNodeName}_${index}`;
  },
  isInputContentsValid(inputContentRefs) {
    if (inputContentRefs) {
      let inputContents = inputContentRefs;
      if (!Array.isArray(inputContents)) {
        inputContents = [inputContents];
      }
      for (let i = 0; i < inputContents.length; i += 1) {
        const el = inputContents[i];
        if (!el.value) {
          return false;
        }
      }
    }
    return true;
  },
  showInputContentTooltip(inputContentRefs) {
    if (inputContentRefs) {
      let inputContents = inputContentRefs;
      if (!Array.isArray(inputContents)) {
        inputContents = [inputContents];
      }
      inputContents.forEach((el) => {
        if (!el.value) {
          el.dispatchEvent(event.createEvent('tooltip-show'));
        }
      });
    }
  },

};
