<template lang="html">
<div id="node-edit-page" :style="pageStyle">
  <div class="nav-bar">
    <template v-for="(tab, idx) in tabs">
      <div class="tab-button"
        :key="tab.type"
        :class="{ 'active': tab.type === currentTab }"
        @click="changeTab(tab.type)">
        <icon :icon-type="tab.icon" :enableHover="false" :size=15></icon>
        <div class="tab-name">{{ tab.name }}</div>
      </div>
    </template>
  </div>
  <div class="content">
    <keep-alive>
      <trigger-edit-tab ref="triggerTab"
        v-if="currentTab === 'triggerTab'"
        :triggerTab="triggerTab"
        :globalVarOptions="globalVarOptions"
        :mapTableOptions="mapTableOptions"
        :jsCodeAlias="jsCodeAlias"
        :nodeId="nodeId"
        @update:valid="updateTabValidStatus('triggerTab', $event)"
        @update="triggerTab = $event"
      ></trigger-edit-tab>
      <setting-edit-tab ref="settingTab"
        v-if="currentTab === 'settingTab'"
        :settingTab="settingTab"
        :globalVarOptions="globalVarOptions"
        :nodeType="nodeType"
        @update:valid="updateTabValidStatus('settingTab', $event)"
        @update="settingTab = $event"
      ></setting-edit-tab>
      <setting-edit-tab2 ref="dialogue2SettingTab"
        v-if="currentTab === 'dialogue2SettingTab'"
        :settingTab="dialogue2SettingTab"
        :globalVarOptions="globalVarOptions"
        :nodeType="nodeType"
        @update:valid="updateTabValidStatus('dialogue2SettingTab', $event)"
        @update="dialogue2SettingTab = $event"
      ></setting-edit-tab2>
      <setting-basic-edit-tab ref="settingBasicTab"
        v-if="currentTab === 'settingBasicTab'"
        :settingBasicTab="settingBasicTab"
        @update:valid="updateTabValidStatus('settingBasicTab', $event)"
        @update="settingBasicTab = $event"
      ></setting-basic-edit-tab>
      <entity-collecting-edit-tab ref="entityCollectingTab"
        v-if="currentTab === 'entityCollectingTab'"
        :initialEntityCollectorList="entityCollectingTab.entityCollectorList || []"
        :initialIdToNerMap="{}"
        :initialRelatedEntities="entityCollectingTab.relatedEntities || {}"
        :initialREParsers="entityCollectingTab.re_parsers || []"
        :initialTDESetting="entityCollectingTab.tde_setting || {}"
        :initialRegisterJSON="entityCollectingTab.register_json || {}"
        @update:valid="updateTabValidStatus('entityCollectingTab', $event)"
        @update="entityCollectingTab.entityCollectorList = $event"
        @updateREParsers="entityCollectingTab.re_parsers = $event"
        @updateTDESetting="entityCollectingTab.tde_setting = $event"
        @updateRegisterJSON="entityCollectingTab.register_json = $event"
      ></entity-collecting-edit-tab>
      <action-edit-tab ref="actionTab"
        v-if="currentTab === 'actionTab'"
        :actionTab="actionTab"
        :initialEntityCollectorList="globalVarOptions"
        :initialToNodeOptions="toNodeOptions"
        :version="extData.version"
        @update:valid="updateTabValidStatus('actionTab', $event)"
        @update="actionTab = $event"
        @updateNewNodeOptions="updateNewNodeOptions"
      ></action-edit-tab>
      <params-collecting-edit-tab ref="paramsCollectingTab"
        v-if="currentTab === 'paramsCollectingTab'"
        :paramsCollectingTab="paramsCollectingTab"
        :mapTableOptions="mapTableOptions"
        :nodeId="nodeId"
        @update:valid="updateTabValidStatus('paramsCollectingTab', $event)"
        @update="paramsCollectingTab = $event"
      ></params-collecting-edit-tab>
      <params-collecting-edge-edit-tab ref="paramsCollectingEdgeTab"
        v-if="currentTab === 'paramsCollectingEdgeTab'"
        :paramsCollectingEdgeTab="paramsCollectingEdgeTab"
        :initialToNodeOptions="toNodeOptions"
        :globalVarOptions="globalVarOptions"
        :mapTableOptions="mapTableOptions"
        :jsCodeAlias="jsCodeAlias"
        :nodeId="nodeId"
        :nodeType="nodeType"
        @update:valid="updateTabValidStatus('paramsCollectingEdgeTab', $event)"
        @update="paramsCollectingEdgeTab = $event"
        @updateNewNodeOptions="updateNewNodeOptions"
      ></params-collecting-edge-edit-tab>
      <edge-edit-tab ref="edgeTab"
        v-if="currentTab === 'edgeTab'"
        :edgeTab="edgeTab"
        :initialToNodeOptions="toNodeOptions"
        :globalVarOptions="globalVarOptions"
        :mapTableOptions="mapTableOptions"
        :jsCodeAlias="jsCodeAlias"
        :nodeId="nodeId"
        :nodeType="nodeType"
        @update:valid="updateTabValidStatus('edgeTab', $event)"
        @update="edgeTab = $event"
        @updateNewNodeOptions="updateNewNodeOptions"
      ></edge-edit-tab>
      <edge-edit-tab2 ref="edgeTab2"
        v-if="currentTab === 'edgeTab2'"
        :edgeTab="edgeTab2"
        :initialToNodeOptions="toNodeOptions"
        :globalVarOptions="globalVarOptions"
        :mapTableOptions="mapTableOptions"
        :jsCodeAlias="jsCodeAlias"
        :nodeId="nodeId"
        :nodeType="nodeType"
        @update:valid="updateTabValidStatus('edgeTab2', $event)"
        @update="edgeTab2 = $event"
        @updateNewNodeOptions="updateNewNodeOptions"
      ></edge-edit-tab2>
      <restful-setting-edit-tab ref="restfulSettingTab"
        v-if="currentTab === 'restfulSettingTab'"
        :initialRestfulSettingTab="restfulSettingTab"
        :initialToNodeOptions="toNodeOptions"
        @update:valid="updateTabValidStatus('restfulSettingTab', $event)"
        @update="restfulSettingTab = $event"
      ></restful-setting-edit-tab>
      <restful-edge-edit-tab ref="restfulEdgeTab"
        v-if="currentTab === 'restfulEdgeTab'"
        :nodeId="node.nodeId"
        :initialRestfulEdgeTab="restfulEdgeTab"
        :initialToNodeOptions="toNodeOptions"
        @update:valid="updateTabValidStatus('restfulEdgeTab', $event)"
        @update="restfulEdgeTab = $event"
        @updateNewNodeOptions="updateNewNodeOptions"
      ></restful-edge-edit-tab>
    </keep-alive>
  </div>
</div>
</template>

<script>
import general from '@/modules/TaskEngine/_utils/general';
import mappingtable from '@/modules/TaskEngine/_api/taskEngine_mappingtable';
import EntityCollectingEditTab from '@/modules/TaskEngine/TaskEngineV3/src/components/EntityCollectingPage';
import TriggerEditTab from './TriggerEditTab';
import SettingEditTab from './SettingEditTab';
import EdgeEditTab from './EdgeEditTab';
import EdgeEditTab2 from './EdgeEditTab2';
import ParamsCollectingEditTab from './ParamsCollectingEditTab';
import ParamsCollectingEdgeEditTab from './ParamsCollectingEdgeEditTab';
import SettingBasicEditTab from './SettingBasicEditTab';
import RestfulSettingEditTab from './RestfulSettingEditTab';
import RestfulEdgeEditTab from './RestfulEdgeEditTab';
// import ActionEditTab from '@/modules/TaskEngine/TaskEngineV3/src/components/ActionPage';
import ActionEditTab from './ActionEditTab';
import SettingEditTab2 from './SettingEditTab2';
import optionConfig from '../_utils/optionConfig';
import scenarioConvertor from '../_utils/scenarioConvertor';
import scenarioInitializer from '../_utils/scenarioInitializer';

export default {
  name: 'node-edit-page',
  components: {
    'trigger-edit-tab': TriggerEditTab,
    'setting-edit-tab': SettingEditTab,
    'setting-basic-edit-tab': SettingBasicEditTab,
    'edge-edit-tab': EdgeEditTab,
    'entity-collecting-edit-tab': EntityCollectingEditTab,
    'action-edit-tab': ActionEditTab,
    'restful-setting-edit-tab': RestfulSettingEditTab,
    'restful-edge-edit-tab': RestfulEdgeEditTab,
    'params-collecting-edit-tab': ParamsCollectingEditTab,
    'params-collecting-edge-edit-tab': ParamsCollectingEdgeEditTab,
    SettingEditTab2,
    EdgeEditTab2,
  },
  props: {
    extData: {
      type: Object,
      required: true,
    },
  },
  data() {
    // reserve original node json string
    const { warnings, ...nodeWithoutWarnings } = this.extData.node;
    const originalNodeString = JSON.stringify(nodeWithoutWarnings, general.JSONStringifyReplacer);
    // parse node
    const node = JSON.parse(JSON.stringify(this.extData.node));
    const toNodeOptions = JSON.parse(JSON.stringify(this.extData.toNodeOptions));
    const globalVarOptionsMap = JSON.parse(JSON.stringify(this.extData.globalVarOptionsMap));
    const nodeType = node.nodeType;
    // render tab data
    let tabs = [];
    const nodeType2TabsMap = optionConfig.nodeType2Tabs();
    if (nodeType in nodeType2TabsMap) {
      tabs = nodeType2TabsMap[nodeType];
    }
    let triggerTab;
    let settingTab;
    let edgeTab;
    let entityCollectingTab;
    let settingBasicTab;
    let paramsCollectingTab;
    let paramsCollectingEdgeTab;
    let restfulSettingTab;
    let restfulEdgeTab;
    let actionTab;
    let dialogue2SettingTab;
    let edgeTab2;
    tabs.forEach((tab) => {
      if (tab === 'triggerTab') {
        triggerTab = node.triggerTab;
      } else if (tab === 'settingTab') {
        settingTab = node.settingTab;
      } else if (tab === 'edgeTab') {
        if (node.edgeTab === undefined) {
          // only happen to old action node
          // initial edgeTab to action node
          node.edgeTab = scenarioInitializer.initialEdgeTab(nodeType);
        }
        edgeTab = node.edgeTab;
      } else if (tab === 'entityCollectingTab') {
        entityCollectingTab = node.entityCollectingTab;
      } else if (tab === 'settingBasicTab') {
        settingBasicTab = node.settingBasicTab;
      } else if (tab === 'paramsCollectingTab') {
        paramsCollectingTab = node.paramsCollectingTab;
      } else if (tab === 'paramsCollectingEdgeTab') {
        paramsCollectingEdgeTab = node.paramsCollectingEdgeTab;
      } else if (tab === 'restfulSettingTab') {
        restfulSettingTab = node.restfulSettingTab;
      } else if (tab === 'restfulEdgeTab') {
        restfulEdgeTab = node.restfulEdgeTab;
      } else if (tab === 'actionTab') {
        actionTab = node.actionTab;
      } else if (tab === 'dialogue2SettingTab') {
        dialogue2SettingTab = node.dialogue2SettingTab;
      } else if (tab === 'edgeTab2') {
        edgeTab2 = node.edgeTab2;
      }
    });
    const currentTab = this.extData.currentTab || tabs[0];
    const allTabs = this.getAllTabs();
    tabs = tabs.map((t) => {
      const tab = allTabs[t];
      tab.valid = true;
      return tab;
    });
    const jsCodeAlias = this.extData.jsCodeAlias || [];
    return {
      currentTab,
      tabs,
      originalNodeString,
      node,
      nodeType,
      nodeId: node.nodeId,
      toNodeOptions,
      globalVarOptions: [],
      globalVarOptionsMap,
      mapTableOptions: [],
      triggerTab,
      settingTab,
      settingBasicTab,
      entityCollectingTab,
      paramsCollectingTab,
      paramsCollectingEdgeTab,
      edgeTab,
      edgeTab2,
      restfulSettingTab,
      restfulEdgeTab,
      actionTab,
      dialogue2SettingTab,
      newNodeOptions: undefined,
      pageStyle: {
        width: '880px',
      },
      jsCodeAlias,
    };
  },
  watch: {
    nodeType() {
      if (this.nodeType && this.nodeType === 'nlu_pc') {
        this.pageStyle = {
          width: '1060px',
        };
      }
    },
    triggerTab: {
      handler() {
        this.collectGlobalVarOptions();
      },
    },
    settingTab: {
      handler() {
        this.collectGlobalVarOptions();
      },
    },
    settingBasicTab: {
      handler() {
        this.collectGlobalVarOptions();
      },
    },
    entityCollectingTab: {
      handler() {
        this.collectGlobalVarOptions();
      },
    },
    paramsCollectingTab: {
      handler() {
        this.collectGlobalVarOptions();
      },
    },
    paramsCollectingEdgeTab: {
      handler() {
        this.collectGlobalVarOptions();
      },
    },
    edgeTab: {
      handler() {
        this.collectGlobalVarOptions();
      },
    },
    edgeTab2: {
      handler() {
        this.collectGlobalVarOptions();
      },
    },
    restfulSettingTab: {
      handler() {
        this.collectGlobalVarOptions();
      },
    },
    restfulEdgeTab: {
      handler() {
        this.collectGlobalVarOptions();
      },
    },
    actionTab: {
      handler() {
        this.collectGlobalVarOptions();
      },
    },
    dialogue2SettingTab: {
      handler() {
        this.collectGlobalVarOptions();
      },
    },
  },
  methods: {
    updateNewNodeOptions(newNodeOptions) {
      this.newNodeOptions = newNodeOptions;
    },
    collectGlobalVarOptions() {
      const nodeResult = this.composeNodeResult();
      const dummySetting = { // only want to get global vars so use dummy setting
        scenarioName: '',
        scenarioDialogueCntLimit: 0,
        nodeDialogueCntLimit: 0,
      };
      const edges = scenarioConvertor.convertUiNodeToEdges(
        nodeResult,
        dummySetting,
        this.extData.globalEdges,
      );
      let nodeVars = [...scenarioConvertor.getGlobalVars(edges)];
      if (this.nodeType === 'restful') {
        nodeVars.push(nodeResult.restfulSettingTab.rtnVarName);
      } else if (this.nodeType === 'parameter_collecting') {
        nodeVars.push(...scenarioConvertor.getGlobalVarsFromParsers(
          scenarioConvertor.composePCContent(nodeResult.paramsCollectingTab.params).parsers,
        ));
      } else if (this.nodeType === 'nlu_pc') {
        nodeVars.push(...scenarioConvertor.composeNLUPCContent(
            nodeResult.entityCollectingTab.entityCollectorList,
            nodeResult.entityCollectingTab.re_parsers,
            nodeResult.entityCollectingTab.register_json,
          ).entities.map(entity => entity.entityName),
        );
      } else if (this.nodeType === 'action') {
        const vars = scenarioConvertor.getGlobalVarsFromActionGroup(
          nodeResult.actionTab.actionGroupList,
        );
        nodeVars.push(...vars);
      }
      nodeVars = [...new Set(nodeVars)];
      const nodeVarsOptions = nodeVars.map(v => ({
        text: nodeResult.nodeName,
        value: v,
      }));
      this.globalVarOptionsMap[nodeResult.nodeId] = nodeVarsOptions;
      this.globalVarOptions = [];
      Object.values(this.globalVarOptionsMap).forEach((globalVarOption) => {
        this.globalVarOptions.push(...globalVarOption);
      });
    },
    changeTab(tab) {
      this.currentTab = tab;
    },
    getAllTabs() {
      return {
        triggerTab: {
          type: 'triggerTab',
          name: this.$t('task_engine_v2.node_edit_page.tabs.trigger'),
          icon: 'setting',
        },
        settingTab: {
          type: 'settingTab',
          name: this.$t('task_engine_v2.node_edit_page.tabs.setting'),
          icon: 'setting',
        },
        settingBasicTab: {
          type: 'settingBasicTab',
          name: this.$t('task_engine_v2.node_edit_page.tabs.setting'),
          icon: 'setting',
        },
        edgeTab: {
          type: 'edgeTab',
          name: this.$t('task_engine_v2.node_edit_page.tabs.edge'),
          icon: 'setting',
        },
        edgeTab2: {
          type: 'edgeTab2',
          name: this.$t('task_engine_v2.node_edit_page.tabs.edge'),
          icon: 'setting',
        },
        entityCollectingTab: {
          type: 'entityCollectingTab',
          name: this.$t('task_engine_v3.scenario_edit_page.tab.entity_collecting'),
          icon: 'setting',
        },
        restfulSettingTab: {
          type: 'restfulSettingTab',
          name: this.$t('task_engine_v2.node_edit_page.tabs.setting'),
          icon: 'setting',
        },
        restfulEdgeTab: {
          type: 'restfulEdgeTab',
          name: this.$t('task_engine_v2.node_edit_page.tabs.edge'),
          icon: 'setting',
        },
        paramsCollectingTab: {
          type: 'paramsCollectingTab',
          name: this.$t('task_engine_v2.node_edit_page.tabs.params_collecting'),
          icon: 'setting',
        },
        paramsCollectingEdgeTab: {
          type: 'paramsCollectingEdgeTab',
          name: this.$t('task_engine_v2.node_edit_page.tabs.edge'),
          icon: 'setting',
        },
        actionTab: {
          type: 'actionTab',
          name: this.$t('task_engine_v2.node_edit_page.tabs.action'),
          icon: 'setting',
        },
        dialogue2SettingTab: {
          type: 'dialogue2SettingTab',
          name: this.$t('task_engine_v2.node_edit_page.tabs.setting'),
          icon: 'setting',
        },
      };
    },
    loadMappingTableOptions() {
      const mapTables = [];
      mappingtable.getTemplateMappingList().then((templateData) => {
        mapTables.push(...templateData.data);
        mappingtable.getMappingList().then((data) => {
          mapTables.push(...data.data);
          this.mapTableOptions = mapTables.map(table => ({
            text: table,
            value: table,
          }));
        });
      });
    },
    validResult(nodeResult) { // eslint-disable-line
      return true;
    },
    composeNodeResult() {
      const nodeResult = {
        nodeId: this.node.nodeId,
        nodeName: '',
        nodeType: this.node.nodeType,
        triggerTab: this.triggerTab,
        settingTab: this.settingTab,
        edgeTab: this.edgeTab,
        edgeTab2: this.edgeTab2,
        entityCollectingTab: this.entityCollectingTab,
        settingBasicTab: this.settingBasicTab,
        restfulSettingTab: this.restfulSettingTab,
        restfulEdgeTab: this.restfulEdgeTab,
        paramsCollectingTab: this.paramsCollectingTab,
        paramsCollectingEdgeTab: this.paramsCollectingEdgeTab,
        dialogue2SettingTab: this.dialogue2SettingTab,
        actionTab: this.actionTab,
      };
      if (this.node.nodeType === 'entry' ||
          this.node.nodeType === 'nlu_pc' ||
          this.node.nodeType === 'parameter_collecting' ||
          this.node.nodeType === 'action') {
        nodeResult.nodeName = this.settingBasicTab.nodeName;
      } else if (this.node.nodeType === 'restful') {
        nodeResult.nodeName = this.restfulSettingTab.nodeName;
      } else if (this.node.nodeType === 'dialogue_2.0') {
        nodeResult.nodeName = this.dialogue2SettingTab.nodeName;
      } else {
        nodeResult.nodeName = this.settingTab.nodeName;
      }
      return nodeResult;
    },
    updateTabValidStatus(tabType, valid) {
      this.tabs.find(tab => tab.type === tabType).valid = valid;
    },
    validate() {
      for (let i = 0; i < this.tabs.length; i += 1) {
        const tab = this.tabs[i];
        if (!tab.valid) {
          this.currentTab = tab.type;
          this.$nextTick(() => {
            this.$refs[this.currentTab].$emit('showToolTip');
          });
          return;
        }
      }
      const nodeResult = this.composeNodeResult();
      if (this.validResult(nodeResult)) {
        this.$emit(
            'validateSuccess',
            { nodeResult, newNodeOptions: this.newNodeOptions },
          );
      }
    },
    cancelValidate() {
      const nodeResult = this.composeNodeResult();
      const newNodeString = JSON.stringify(nodeResult, general.JSONStringifyReplacer);
      if (newNodeString === this.originalNodeString) {
        this.$emit('cancelValidateSuccess');
      } else {
        this.$emit('showReminder', {
          buttonRef: 'cancelBtn',
          content: this.$t('task_engine_v2.node_edit_page.popup.content'),
          ok_msg: this.$t('task_engine_v2.node_edit_page.popup.confirm'),
          cancel_msg: this.$t('task_engine_v2.node_edit_page.popup.cancel'),
          cancel: () => { },
          ok: () => { this.$emit('cancelValidateSuccess'); },
        });
      }
    },
  },
  beforeMount() {
    this.loadMappingTableOptions();
    this.collectGlobalVarOptions();
  },
  mounted() {
    this.$on('validate', this.validate);
    this.$on('cancelValidate', this.cancelValidate);
  },
};
</script>

<style lang="scss" scoped>
#node-edit-page {
  height: 70vh;
  display: flex;
  flex-direction: row;
  .nav-bar{
    display: flex;
    flex-direction: column;
    flex: 0 0 160px;
    border-right: 1px solid $color-borderline;
    .tab-button{
      display: flex;
      flex-direction: row;
      height: 44px;
      line-height: 44px;
      font-size: 14px;
      color: $color-font-normal;
      padding: 0px 0px 0px 30px;
      margin: 0px 0px 4px 0px;
      align-items: center;
      cursor: pointer;
      border-right: 2px solid transparent;
      &:hover{
        transition: border 0.3s ease;
        border-right: 2px solid #DDDDDD;
      }
      &.active{
        color: $color-primary;
        border-right: 2px solid $color-primary;
      }
      .tab-name{
        margin-left: 8px;
      }
    }
  }
  .content{
    flex: 1 1 auto;
    @include auto-overflow();
    @include customScrollbar();
  }
}
</style>
<style lang="scss">
#node-edit-page {
  button {
    outline: none;
  }
}
</style>
