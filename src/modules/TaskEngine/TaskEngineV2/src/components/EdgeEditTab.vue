<template lang="html">
<div id="edge-edit-tab">
  <div class="instruction block">
    {{$t("task_engine_v2.edge_edit_tab.instruction")}}
  </div>
  <draggable v-model="normalEdges" :options="{ghostClass:'ghost'}" @start="drag=true" @end="drag=false; emitUpdate();">
    <template v-for="(edge, index) in normalEdges">
      <condition-block
        class="condition-block"
        ref="conditionBlock"
        :key="edge.id"
        :nodeId="nodeId"
        :initialEdge="edge"
        :toNodeOptions="toNodeOptions"
        :mapTableOptions="mapTableOptions"
        :globalVarOptions="globalVarOptions"
        :jsCodeAlias="jsCodeAlias"
        @update="updateNormalEdge(index, $event)"
        @deleteEdge="deleteEdge(index)"
        @addNewDialogueNode="addNewDialogueNode">
      </condition-block>
    </template>
  </draggable>
  <button
    class="button-add-edge"
    @click="addEdge()">
    {{$t("task_engine_v2.edge_edit_tab.button_add_edge")}}
  </button>
  <div class="exceed_limit block" v-if="exceedThenGoto !== null">
    <div class="condition-row">
      <div class="label label-bold">
        {{$t("task_engine_v2.edge_edit_tab.label_exceed_limit")}}
      </div>
      <div class="label label-margin-left">
        {{$t("task_engine_v2.edge_edit_tab.instruction_exeed_limit")}}
      </div>
      <input class="input-limit" ref="input-content" v-tooltip="tooltip" @focus="onInputFocus"
        oninput="this.value = this.value.replace(/^0$/g, ''); this.value = this.value.replace(/[^0-9]/g, ''); this.value = this.value.replace(/(^[0-9]{1,2}).*/g, '$1');"
        v-model="dialogueLimit">
      </input>
      <div class="label">
        {{$t("task_engine_v2.edge_edit_tab.label_time")}}
      </div>
      <div class="label label-margin-left">
        {{$t("task_engine_v2.edge_edit_tab.label_then_goto")}}
      </div>
      <dropdown-select
        class="select select-goto"
        ref="selectExceedThenGoto"
        :value="[exceedThenGoto]"
        @input="exceedThenGoto = $event[0]"
        :options="exceedThenGotoOptions"
        :fixedListWidth="false"
        :showCheckedIcon="false"
        :showSearchBar="true"
        width="200px"
        :inputBarStyle="selectStyle"
      />
    </div>
  </div>
  <div class="default_goto block">
    <div class="condition-row">
      <div class="label label-bold">
        {{$t("task_engine_v2.edge_edit_tab.label_default_goto")}}
      </div>
      <div class="label label-margin-left">
        {{$t("task_engine_v2.edge_edit_tab.instruction_default_goto")}}
      </div>
      <div class="label label-margin-left">
        {{$t("task_engine_v2.edge_edit_tab.label_then_goto")}}
      </div>
      <dropdown-select
        class="select select-goto"
        ref="selectElseThenGoto"
        :value="[elseInto]"
        @input="elseInto = $event[0]"
        :options="elseIntoOptions"
        :fixedListWidth="false"
        :showCheckedIcon="false"
        :showSearchBar="true"
        width="200px"
        :inputBarStyle="selectStyle"
      />
    </div>
  </div>
</div>
</template>

<script>
import event from '@/utils/js/event';
import draggable from 'vuedraggable';
import DropdownSelect from '@/components/DropdownSelect';
import general from '@/modules/TaskEngine/_utils/general';
import ConditionBlock from './ConditionBlock';
import scenarioInitializer from '../_utils/scenarioInitializer';

export default {
  name: 'edge-edit-tab',
  components: {
    draggable,
    'dropdown-select': DropdownSelect,
    'condition-block': ConditionBlock,
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
    jsCodeAlias: {
      type: Array,
      default: () => [],
    },
    nodeId: {
      type: String,
      required: true,
    },
    nodeType: {
      type: String,
      required: true,
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

    this.doNothingEdge = { text: this.$t('task_engine_v2.to_node_option.do_nothing'), value: null };
    this.exitEdge = { text: `${this.$t('task_engine_v2.to_node_option.exit')} (ID: 0)`, value: '0' };
    this.parseFailedEdge = {
      text: this.$t('task_engine_v2.to_node_option.parse_fail'),
      value: 'parseFailedEdge',
    };
    this.addNewDialogueNodeEdge = {
      text: this.$t('task_engine_v2.to_node_option.add_new_dialogue_node'),
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
        height: '36px',
        'border-radius': '5px',
      },
      tooltip: {
        msg: this.$t('task_engine_v2.err_empty'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
        absolute: true,
      },
    };
  },
  watch: {
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
    addNewDialogueNode(newNodeID) {
      if (this.newNodeOptions === undefined) {
        this.newNodeOptions = [];
      }
      const nodeNames = [
        ...window.moduleData.ui_data.nodes.map(node => node.nodeName),
        ...this.newNodeOptions.map(option => option.nodeName),
      ];
      const newNodeName = general.suffixIndexToNodeName(
                            this.$t('task_engine_v2.node_type.dialogue'),
                            nodeNames,
                          );
      this.newNodeOptions.push({
        nodeName: newNodeName,
        nodeId: newNodeID,
        nodeType: 'dialogue',
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
      } else if (nodeType === 'dialogue') {
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
      const edge = scenarioInitializer.initialEdge();
      edge.id = this.$uuid.v1();
      edge.valid = false;
      this.normalEdges.push(edge);
      this.emitUpdate();
    },
    deleteEdge(index) {
      this.normalEdges.splice(index, 1);
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
      // console.log(edgeTab);
      this.$emit('update', edgeTab);
      this.$emit('update:valid', this.isValid());
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
    onInputFocus(evt) {
      evt.target.dispatchEvent(event.createEvent('tooltip-hide'));
    },
    showToolTip() {
      general.showInputContentTooltip(this.$refs['input-content']);
      const conditionBlocks = this.$refs.conditionBlock;
      if (conditionBlocks) {
        let blocks = conditionBlocks;
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
@import 'styles/variable.scss';

#edge-edit-tab{
  display: flex;
  flex-direction: column;
  padding: 0px 30px 0px 20px;
  .block{
    background: #F3F7F9;
    padding: 20px 20px 20px 20px;
    border: 1px solid $color-borderline;
    border-radius: 5px;
    margin: 0px 0px 20px 0px;
    .condition-row{
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 36px;
      .label{
        height: 36px;
        line-height: 36px;
        font-size: 16px;
      }
      .label-bold{
        font-weight: 600;
      }
      .label-margin-left{
        margin-left: 20px;
      }
      .input-limit{
        height: 36px;
        margin: 0px 10px 0px 10px;
        width: 40px;
      }
      .select{
        background: white;
        margin-left: 20px;
        border-radius: 5px;
      }
    }
  }
  .instruction{
    height: 60px;
    line-height: 20px;
    color: $color-font-normal;
    font-size: 14px;
  }
  .button-add-edge{
    height: 40px;
    background: #46BE8A;
    border-radius: 5px;
    color: white;
    font-size: 18px;
    font-weight: 600;
    margin: 20px 0px 10px 0px;
    cursor: pointer;
    &:hover{
      transition: background-color 0.5s ease;
      background: lighten(#46BE8A, 10%);
    }
  }
}
</style>
