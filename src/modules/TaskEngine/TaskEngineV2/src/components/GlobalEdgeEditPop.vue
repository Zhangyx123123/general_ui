<template lang="html">
<div id="global-edge-edit-pop">
  <div class="instruction block" v-t="'task_engine_v2.global_edge_edit_pop.instruction'"></div>
  <div class="block-list-container">
    <draggable v-model="globalEdges" :options="{ghostClass:'ghost'}" @start="drag=true" @end="drag=false">
      <template v-for="(edge, index) in globalEdges">
        <condition-block
          class="condition-block"
          ref="conditionBlock"
          :key="edge.id"
          :nodeId="nodeId"
          :initialEdge="edge"
          :toNodeOptions="toNodeOptions"
          :globalVarOptions="globalVarOptions"
          :mapTableOptions="mapTableOptions"
          :jsCodeAlias="jsCodeAlias"
          @update="updateEdge(index, $event)"
          @deleteEdge="deleteEdge(index)"
          @addNewDialogueNode="addNewDialogueNode">
        </condition-block>
      </template>
    </draggable>
  </div>
  <button
    class="button-add-edge"
    @click="addEdge()">
    {{$t("task_engine_v2.global_edge_edit_pop.button_add_edge")}}
  </button>
</div>
</template>

<script>
import mappingtable from '@/modules/TaskEngine/_api/taskEngine_mappingtable';
import general from '@/modules/TaskEngine/_utils/general';
import draggable from 'vuedraggable';
import ConditionBlock from './ConditionBlock';
import scenarioInitializer from '../_utils/scenarioInitializer';

export default {
  name: 'global-edge-edit-pop',
  components: {
    draggable,
    ConditionBlock,
  },
  props: {
    extData: {
      type: Object,
      required: true,
    },
  },
  data() {
    // render globalEdges
    const globalEdges = this.extData.globalEdges.map((edge) => {
      const obj = { ...edge };
      obj.id = this.$uuid.v1();
      obj.valid = true;
      return obj;
    });
    const originalGlobalEdgesStr =
      JSON.stringify(globalEdges, general.JSONStringifyReplacer);

    // render toNodeOptions
    const toNodeOptions = [
      this.addNewDialogueNodeEdge,
      this.doNothingEdge,
      this.exitEdge,
    ].concat(this.extData.toNodeOptions);

    // render globalVarOptions
    const globalVarOptionsMap = this.extData.globalVarOptionsMap;
    const globalVarOptions = Object.values(globalVarOptionsMap)
    .reduce((acc, globalVarOption) => {
      acc.push(...globalVarOption);
      return acc;
    }, []);
    const jsCodeAlias = this.extData.jsCodeAlias || [];
    return {
      nodeId: '',
      jsCodeAlias,
      originalGlobalEdgesStr,
      globalEdges,
      toNodeOptions,
      globalVarOptions,
      mapTableOptions: [],
      newNodeOptions: [],
    };
  },
  methods: {
    addNewDialogueNode(newNodeID) {
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
      this.updateOptions();
    },
    updateOptions() {
      this.composeOptions([
        ...this.extData.toNodeOptions,
        ...this.newNodeOptions.map(option => ({
          text: `${option.nodeName} (ID: ${option.nodeId})`,
          value: option.nodeId,
        })),
      ]);
    },
    composeOptions(options) {
      this.toNodeOptions = [
        this.addNewDialogueNodeEdge,
        this.doNothingEdge,
        this.exitEdge,
      ].concat(options);
    },
    addEdge() {
      const edge = scenarioInitializer.initialEdge('global_normal');
      edge.id = this.$uuid.v1();
      edge.valid = false;
      this.globalEdges.push(edge);
    },
    deleteEdge(index) {
      this.globalEdges.splice(index, 1);
    },
    updateEdge(index, edge) {
      this.globalEdges[index] = edge;
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
    validate() {
      if (!this.isValid()) {
        this.showToolTip();
        return;
      }
      const edges = this.globalEdges.map(edge => ({
        edge_type: edge.edge_type,
        to_node_id: edge.to_node_id,
        condition_rules: edge.condition_rules,
        actions: [],
      }));
      this.$emit(
        'validateSuccess',
        { edges, newNodeOptions: this.newNodeOptions },
      );
    },
    cancelValidate() {
      const newGlobalEdgesStr = JSON.stringify(this.globalEdges, general.JSONStringifyReplacer);
      if (newGlobalEdgesStr === this.originalGlobalEdgesStr) {
        this.$emit('cancelValidateSuccess');
      } else {
        const that = this;
        that.$popCheck({
          bindValue: true,
          data: {
            msg: that.$t('task_engine_v2.global_edge_edit_pop.confirm_to_save_changes'),
          },
          callback: {
            ok() {
              that.validate();
            },
            cancel() {
              that.$emit('cancelValidateSuccess');
            },
          },
        });
      }
    },
    isValid() {
      for (let i = 0; i < this.globalEdges.length; i += 1) {
        const edge = this.globalEdges[i];
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
    this.loadMappingTableOptions();
    this.$on('validate', this.validate);
    this.$on('cancelValidate', this.cancelValidate);
  },
};
</script>

<style lang="scss" scoped>
#global-edge-edit-pop {
  width: 725px;
  height: 70vh;
  display: flex;
  flex-direction: column;
  padding: 25px 25px 0px 25px;
  .instruction{
    height: 60px;
    flex: 0 0 60px;
    line-height: 20px;
    color: $color-font-normal;
    font-size: 14px;
  }
  .block{
    background: #F3F7F9;
    padding: 20px 20px 20px 20px;
    border: 1px solid $color-borderline;
    border-radius: 5px;
    margin: 0px 0px 20px 0px;
  }
  .button-add-edge{
    height: 40px;
    flex: 0 0 40px;
    background: #46BE8A;
    border-radius: 5px;
    color: white;
    font-size: 18px;
    font-weight: 600;
    margin: 0px 0px 10px 0px;
    cursor: pointer;
    &:hover{
      transition: background-color 0.5s ease;
      background: lighten(#46BE8A, 10%);
    }
  }
  .block-list-container{
    display: flex;
    flex-direction: column;
    margin: 0px 0px 20px 0px;
    @include auto-overflow();
    @include customScrollbar();
  }
}
</style>
