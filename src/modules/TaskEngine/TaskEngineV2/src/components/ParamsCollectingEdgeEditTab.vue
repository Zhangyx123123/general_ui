<template lang="html">
<div id="params-collecting-edge-edit-tab">
  <draggable v-model="normalEdges" :options="{ghostClass:'ghost'}" @start="drag=true" @end="drag=false; emitUpdate();">
    <template v-for="(edge, index) in normalEdges">
      <condition-block
        class="condition-block"
        ref="conditionBlock"
        :key="edge.id"
        :nodeId="nodeId"
        :initialEdge="edge"
        :initialDialogueLimit="dialogueLimit"
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
</div>
</template>

<script>
import draggable from 'vuedraggable';
import DropdownSelect from '@/components/DropdownSelect';
import general from '@/modules/TaskEngine/_utils/general';
import ConditionBlock from './ConditionBlock';
import scenarioInitializer from '../_utils/scenarioInitializer';

export default {
  name: 'params-collecting-edge-edit-tab',
  components: {
    draggable,
    'dropdown-select': DropdownSelect,
    'condition-block': ConditionBlock,
  },
  props: {
    paramsCollectingEdgeTab: {
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
    const pcEdgeTab = this.paramsCollectingEdgeTab;
    const dialogueLimit = pcEdgeTab.dialogueLimit;

    // add tmp id for edges
    const normalEdges = pcEdgeTab.normalEdges.map((edge) => {
      const obj = { ...edge };
      obj.id = this.$uuid.v1();
      obj.valid = true;
      return obj;
    });

    // render toNodeOptions
    const options = this.initialToNodeOptions.filter(option => option.value !== this.nodeId);
    const toNodeOptions = [
      this.addNewDialogueNodeEdge,
      this.doNothingEdge,
      this.exitEdge,
    ].concat(options);

    return {
      normalEdges,
      dialogueLimit,
      newNodeOptions: undefined,
      toNodeOptions,
      satisfiedThenGotoOptions: [],
      selectStyle: {
        height: '36px',
        'border-radius': '5px',
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
      this.composeOptions([
        ...this.initialToNodeOptions,
        ...this.newNodeOptions.map(option => ({
          text: `${option.nodeName} (ID: ${option.nodeId})`,
          value: option.nodeId,
        })),
      ]);
    },
    composeOptions(fullOptions) {
      const options = fullOptions.filter(option => option.value !== this.nodeId);
      this.toNodeOptions = [
        this.addNewDialogueNodeEdge,
        this.doNothingEdge,
        this.exitEdge,
      ].concat(options);
    },
    updateNormalEdge(index, $event) {
      this.normalEdges[index] = $event;
      if (this.normalEdges[index].edge_type === 'pc_failed') {
        this.dialogueLimit = this.normalEdges[index].dialogueLimit;
        delete this.normalEdges[index].dialogueLimit;
      }
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
      const pcEdgeTab = {
        dialogueLimit: parseInt(this.dialogueLimit, 10) || null,
        normalEdges: this.normalEdges.map((edge) => {
          const { id, valid, ...rest } = edge;
          return rest;
        }),
        newNodeOptions: this.newNodeOptions,
      };
      this.$emit('update', pcEdgeTab);
      this.$emit('update:valid', this.isValid());
    },
    isValid() {
      for (let i = 0; i < this.normalEdges.length; i += 1) {
        const edge = this.normalEdges[i];
        if (!edge.valid) {
          return false;
        }
      }
      return true;
    },
    showToolTip() {
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
  beforeCreate() {
    this.doNothingEdge = { text: this.$t('task_engine_v2.to_node_option.do_nothing'), value: null };
    this.exitEdge = { text: `${this.$t('task_engine_v2.to_node_option.exit')} (ID: 0)`, value: '0' };
    this.addNewDialogueNodeEdge = {
      text: this.$t('task_engine_v2.to_node_option.add_new_dialogue_node'),
      value: 'add_new_dialogue_node',
      isButton: true,
    };
  },
  mounted() {
    this.$on('showToolTip', this.showToolTip);
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';

#params-collecting-edge-edit-tab{
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
