<template>
<div id="edge-edit-tab">
  <div class="title">
    {{ $t('task_engine_v2.edge_edit_tab2.instruction') }}
    <span class="instruction" v-t="'task_engine_v2.edge_edit_tab2.instruction_hint'"></span>
    <div class="newbutton">
      <text-button :class="disabled1? 'disablestyle' : 'showstyle'"  @click.stop="showall">{{ $t('task_engine_v2.edge_edit_tab2.show_all')}}</text-button>
    <text-button :class="disabled2? 'disablestyle' : 'showstyle'" @click.stop="closeall">{{ $t('task_engine_v2.edge_edit_tab2.close_all')}}</text-button>
    </div>
  </div>
  <button class="button-add-edge" @click="addEdge">
    {{ $t("task_engine_v2.edge_edit_tab2.button_add_edge") }}
  </button>
  <draggable v-model="normalEdges" :options="{ghostClass:'ghost'}" @start="drag=true" @end="drag=false; emitUpdate();">
    <template v-for="(edge, index) in normalEdges">
      <condition-action-block
        class="condition-action-block"
        :ref="`conditionActionBlock`"
        :key="edge.id"
        :nodeId="nodeId"
        :initialEdge="edge"
        :toNodeOptions="toNodeOptions"
        :mapTableOptions="mapTableOptions"
        :globalVarOptions="globalVarOptions"
        :jsCodeAlias="jsCodeAlias"
        :showConditionsAndAction='showConditionsAndActions'
        :num='num'
        :index='index'
        @changeFlag='receiveFlag'
        @update="updateNormalEdge(index, $event)"
        @deleteEdge="deleteEdge(index)"
        @addNewDialogueNode="addNewDialogueNode">
      </condition-action-block>
    </template>
  </draggable>
  <div class="title" v-t="'task_engine_v2.edge_edit_tab2.exception_handle'"></div>
  <div class="section">
    <div class="block" v-if="exceedThenGoto !== null">
      <div class="label">
        {{ $t("task_engine_v2.edge_edit_tab2.label_exceed_limit") }}
      </div>
      <div class="condition-row">
        {{ $t("task_engine_v2.edge_edit_tab2.instruction_exeed_limit")}}
        <input class="input-limit" ref="input-content" v-tooltip="tooltip" @focus="onInputFocus"
          oninput="this.value = this.value.replace(/^0$/g, ''); this.value = this.value.replace(/[^0-9]/g, ''); this.value = this.value.replace(/(^[0-9]{1,2}).*/g, '$1');"
          v-model="dialogueLimit"/>
        {{ $t("task_engine_v2.edge_edit_tab2.label_time") }}
        {{ $t("task_engine_v2.edge_edit_tab2.label_then_goto") }}
        <dropdown-select
          class="select"
          ref="selectExceedThenGoto"
          :value="[exceedThenGoto]"
          @input="exceedThenGoto = $event[0]"
          :options="exceedThenGotoOptions"
          :fixedListWidth="false"
          :showCheckedIcon="false"
          :showSearchBar="true"
          width="200px"
          :inputBarStyle="selectStyle"/>
      </div>
    </div>
    <div class="block">
      <div class="label">
        {{ $t("task_engine_v2.edge_edit_tab2.label_default_goto") }}
      </div>
      <div class="condition-row">
        {{ $t("task_engine_v2.edge_edit_tab2.instruction_default_goto") }}
        {{ $t("task_engine_v2.edge_edit_tab2.label_then_goto") }}
        <dropdown-select
          class="select"
          ref="selectElseThenGoto"
          :value="[elseInto]"
          @input="elseInto = $event[0]"
          :options="elseIntoOptions"
          :fixedListWidth="false"
          :showCheckedIcon="false"
          :showSearchBar="true"
          width="200px"
          :inputBarStyle="selectStyle"/>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import event from '@/utils/js/event';
import draggable from 'vuedraggable';
import DropdownSelect from '@/components/DropdownSelect';
import general from '@/modules/TaskEngine/_utils/general';
import ConditionActionBlock from './ConditionActionBlock';
import scenarioInitializer from '../_utils/scenarioInitializer';

export default {
  components: {
    draggable,
    DropdownSelect,
    ConditionActionBlock,
  },
  props: {
    edgeTab: {
      type: Object,
      required: true,
    },
    initialToNodeOptions: {
      type: Array,
      required: true,
    },
    globalVarOptions: {
      type: Array,
      required: true,
    },
    mapTableOptions: {
      type: Array,
      required: true,
    },
    nodeId: {
      type: String,
      required: true,
    },
    nodeType: {
      type: String,
      required: true,
    },
    jsCodeAlias: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    const edgeTab = this.edgeTab;
    const exceedThenGoto = edgeTab.exceedThenGoto || null;
    const elseInto = edgeTab.elseInto;
    const dialogueLimit = edgeTab.dialogueLimit || null;

    // add tmp id for edges
    const normalEdges = edgeTab.normalEdges.map((edge) => {
      const obj = { ...edge };
      obj.id = this.$uuid.v1();
      obj.valid = true;
      return obj;
    });

    this.doNothingEdge = { text: this.$t('task_engine_v2.to_node_option.do_nothing_zh'), value: null };
    this.exitEdge = { text: this.$t('task_engine_v2.to_node_option.exit_zh'), value: '0' };
    this.parseFailedEdge = {
      text: this.$t('task_engine_v2.to_node_option.parse_fail'),
      value: 'parseFailedEdge',
    };
    this.addNewDialogueNodeEdge = {
      text: this.$t('task_engine_v2.to_node_option.add_new_dialogue_node_2'),
      value: 'add_new_dialogue_node',
      isButton: true,
    };

    // render toNodeOptions, exceedThenGotoOptions, elseIntoOptions
    const {
      toNodeOptions,
      exceedThenGotoOptions,
      elseIntoOptions,
    } = this.composeOptions(this.initialToNodeOptions, this.nodeType);
    return {
      normalEdges,
      dialogueLimit,
      newNodeOptions: undefined,
      toNodeOptions,
      exceedThenGoto,
      exceedThenGotoOptions,
      elseInto,
      elseIntoOptions,
      selectStyle: {
        height: '32px',
        'border-radius': '2px',
      },
      tooltip: {
        msg: this.$t('task_engine_v2.err_empty'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
        absolute: true,
      },
      showConditionsAndActions: true,
      num: 0,
      disabled1: true,
      disabled2: false,
    };
  },
  watch: {
    'normalEdges.length': function (newV, oldV) { // eslint-disable-line
      if (newV > oldV) {
        this.$nextTick(() => {
          this.$refs.conditionActionBlock[newV - 1].$el.scrollIntoView();
        });
      }
    },
    dialogueLimit: {
      handler() {
        this.emitUpdate();
      },
    },
    exceedThenGoto: {
      handler() {
        if (this.exceedThenGoto === 'add_new_dialogue_node') {
          const newNodeID = scenarioInitializer.guid_sort();
          this.addNewDialogueNode(newNodeID);
          this.exceedThenGoto = newNodeID;
        }
        this.emitUpdate();
      },
    },
    elseInto: {
      handler() {
        if (this.elseInto === 'add_new_dialogue_node') {
          const newNodeID = scenarioInitializer.guid_sort();
          this.addNewDialogueNode(newNodeID);
          this.elseInto = newNodeID;
        }
        this.emitUpdate();
      },
    },
  },
  methods: {
    showall() {
      this.showConditionsAndActions = true;
      this.num += 1;
      this.disabled1 = true;
      this.disabled2 = false;
      this.normalEdges.forEach((item) => {
        item.open = 1;
      });
    },
    closeall() {
      this.showConditionsAndActions = false;
      this.num += 1;
      this.disabled1 = false;
      this.disabled2 = true;
      this.normalEdges.forEach((item) => {
        item.open = 0;
      });
    },
    receiveFlag(count) {
      this.normalEdges.forEach((item, index) => {
        if (index === count.index) {
          item.open = count.open;
        }
      });
      this.judge();
    },
    judge() {
      let jishu = 0;
      this.normalEdges.forEach((item) => {
        jishu += item.open;
      });
      if (jishu === this.normalEdges.length) {
        this.zhankai = true;
        this.disabled1 = true;
        this.disabled2 = false;
      } else if (!jishu) {
        this.zhankai = false;
        this.disabled2 = true;
        this.disabled1 = false;
      } else {
        this.disabled1 = false;
        this.disabled2 = false;
      }
    },
    addNewDialogueNode(newNodeID) {
      if (this.newNodeOptions === undefined) {
        this.newNodeOptions = [];
      }
      const nodeNames = [
        ...window.moduleData.ui_data.nodes.map(node => node.nodeName),
        ...this.newNodeOptions.map(option => option.nodeName),
      ];
      const newNodeName = general.suffixIndexToNodeName(
                            this.$t('task_engine_v2.node_type.dialogue2'),
                            nodeNames,
                          );
      this.newNodeOptions.push({
        nodeName: newNodeName,
        nodeId: newNodeID,
        nodeType: 'dialogue_2.0',
      });
      this.$emit('updateNewNodeOptions', this.newNodeOptions);
      this.updateOptions();
    },
    updateOptions() {
      const { toNodeOptions, exceedThenGotoOptions, elseIntoOptions } = this.composeOptions(
        [
          ...this.initialToNodeOptions,
          ...this.newNodeOptions.map(option => ({
            text: `${option.nodeName} (ID: ${option.nodeId})`,
            value: option.nodeId,
          })),
        ],
        this.nodeType,
      );
      this.toNodeOptions = toNodeOptions;
      this.exceedThenGotoOptions = exceedThenGotoOptions;
      this.elseIntoOptions = elseIntoOptions;
    },
    composeOptions(options, nodeType) {
      let toNodeOptions;
      let exceedThenGotoOptions;
      let elseIntoOptions;
      if (nodeType === 'entry') {
        toNodeOptions = [
          this.addNewDialogueNodeEdge,
          this.doNothingEdge,
        ].concat(options);
        exceedThenGotoOptions = [];
        elseIntoOptions = [
          this.addNewDialogueNodeEdge,
        ].concat(options);
      } else if (nodeType === 'dialogue' || nodeType === 'dialogue_2.0') {
        toNodeOptions = [
          this.addNewDialogueNodeEdge,
          this.doNothingEdge,
          this.exitEdge,
        ].concat(options);
        exceedThenGotoOptions = [
          this.addNewDialogueNodeEdge,
          this.exitEdge,
        ].concat(options);
        elseIntoOptions = [
          this.addNewDialogueNodeEdge,
          this.parseFailedEdge,
          this.exitEdge,
        ].concat(options);
      } else { // nodeType = nlu_pc or action
        toNodeOptions = [
          this.addNewDialogueNodeEdge,
          this.doNothingEdge,
          this.exitEdge,
        ].concat(options);
        exceedThenGotoOptions = [];
        elseIntoOptions = [
          this.addNewDialogueNodeEdge,
          this.exitEdge,
        ].concat(options);
      }
      return { toNodeOptions, exceedThenGotoOptions, elseIntoOptions };
    },
    updateNormalEdge(index, $event) {
      this.normalEdges[index] = $event;
      this.emitUpdate();
    },
    addEdge() {
      const edge = scenarioInitializer.initialNormalEdge2();
      edge.id = this.$uuid.v1();
      edge.valid = true;
      edge.open = 1;
      this.normalEdges.push(edge);
      this.judge();
      this.emitUpdate();
    },
    deleteEdge(index) {
      this.normalEdges.splice(index, 1);
      this.judge();
      this.emitUpdate();
    },
    emitUpdate() {
      const edgeTab = {
        elseInto: this.elseInto || null,
        normalEdges: this.normalEdges.map((edge) => {
          const { id, valid, ...rest } = edge;
          return rest;
        }),
      };
      if (this.dialogueLimit !== null) {
        edgeTab.dialogueLimit = parseInt(this.dialogueLimit, 10) || null;
      }
      if (this.exceedThenGoto !== null) {
        edgeTab.exceedThenGoto = this.exceedThenGoto;
      }
      this.$emit('update', edgeTab);
      this.$emit('update:valid', this.isValid());
    },
    onInputFocus(evt) {
      evt.target.dispatchEvent(event.createEvent('tooltip-hide'));
    },
    isValid() {
      const valid = general.isInputContentsValid(this.$refs['input-content']);
      if (!valid) {
        return false;
      }
      for (let i = 0; i < this.normalEdges.length; i += 1) {
        const edge = this.normalEdges[i];
        if (!edge.valid) {
          return false;
        }
      }
      return true;
    },
    showToolTip() {
      general.showInputContentTooltip(this.$refs['input-content']);
      const conditionActionBlocks = this.$refs.conditionActionBlock;
      if (conditionActionBlocks) {
        let blocks = conditionActionBlocks;
        if (!Array.isArray(blocks)) {
          blocks = [blocks];
        }
        blocks.forEach((block) => {
          block.$emit('showToolTip');
        });
      }
    },
  },
  mounted() {
    this.$on('showToolTip', this.showToolTip);
  },
};
</script>

<style lang="scss" scoped>
#edge-edit-tab {
  padding: 0 20px;
  @include font-14px();
  color: $color-font-active;
  .instruction {
    color: $color-font-mark;
  }
  .title {
    margin: 20px 0 10px;
    position: relative;
    .newbutton {
      float: right;
      .showstyle {
        background: #4b4b64;
        color: rgba(255,255,255,1);
        width: 80px;
      }
      .disablestyle {
        background: rgba(204,204,204,1);
        color: rgba(255,255,255,1);
        width: 80px;
      } 
    }
  }
  .condition-action-block:not(:last-of-type) {
    margin-bottom: 10px;
  }
  .section {
    background-color: $color-disabled;
    padding: 20px;
    .block {
      &:not(:last-child) {
        margin-bottom: 20px;
      }
      .label {
        margin-bottom: 10px;
      }
      .condition-row {
        display: flex;
        align-items: center;
        color: $color-font-normal;
        .input-limit {
          height: 32px;
          margin: 0px 10px;
          width: 50px;
        }
        .select {
          background: white;
          margin-left: 10px;
          border-radius: 2px;
        }
      }
    }
  }
  .button-add-edge {
    border-color: $color-primary;
    position: sticky;
    z-index: 1;
    top: 0;
    width: 100%;
    height: 32px;
    background: $color-primary;
    color: white;
    margin-bottom: 20px;
    cursor: pointer;
    border-radius: 3px;
  }
}
</style>
