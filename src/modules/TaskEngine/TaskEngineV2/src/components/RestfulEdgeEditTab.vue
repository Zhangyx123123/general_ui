<template lang="html">
<div id="restful-edge-edit-page">
  <div class="block">
    <div class="label label-bold">
      {{$t("task_engine_v2.restful_edge_edit_tab.success")}}
    </div>
    <div class="row">
      <div class="label label-margin-left">
        {{$t("task_engine_v2.restful_edge_edit_tab.label_then_goto")}}
      </div>
      <dropdown-select
        class="select select-goto"
        ref="selectSucceedThenGoto"
        :value="[restfulSucceedThenGoto]"
        @input="restfulSucceedThenGoto=$event[0]"
        :options="toNodeOptions"
        :fixedListWidth="false"
        :showCheckedIcon="false"
        :showSearchBar="true"
        width="200px"
        :inputBarStyle="selectStyle"
      />
    </div>
  </div>
  <div class="block">
    <div class="label label-bold">
      {{$t("task_engine_v2.restful_edge_edit_tab.fail")}}
    </div>
    <div class="row">
      <div class="label label-margin-left">
        {{$t("task_engine_v2.restful_edge_edit_tab.label_then_goto")}}
      </div>
      <dropdown-select
        class="select select-goto"
        ref="selectSucceedThenGoto"
        :value="[restfulFailedThenGoto]"
        @input="restfulFailedThenGoto=$event[0]"
        :options="toNodeOptions"
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
import DropdownSelect from '@/components/DropdownSelect';
import general from '@/modules/TaskEngine/_utils/general';
import scenarioInitializer from '../_utils/scenarioInitializer';

export default {
  name: 'restful-edge-edit-page',
  components: {
    'dropdown-select': DropdownSelect,
  },
  props: {
    nodeId: {
      type: String,
      required: true,
    },
    initialRestfulEdgeTab: {
      type: Object,
      required: true,
    },
    initialToNodeOptions: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      restfulFailedThenGoto: '',
      restfulSucceedThenGoto: '',
      newNodeOptions: undefined,
      toNodeOptions: [],
      selectStyle: {
        height: '36px',
        'border-radius': '5px',
        background: 'white',
      },
    };
  },
  computed: {
    exitEdge() {
      return { text: `${this.$t('task_engine_v2.to_node_option.exit')} (ID: 0)`, value: '0' };
    },
    addNewDialogueNodeEdge() {
      return {
        text: this.$t('task_engine_v2.to_node_option.add_new_dialogue_node'),
        value: 'add_new_dialogue_node',
        isButton: true,
      };
    },
    restfulEdgeTab() {
      const result = {
        restfulSucceedThenGoto: this.restfulSucceedThenGoto,
        restfulFailedThenGoto: this.restfulFailedThenGoto,
        newNodeOptions: this.newNodeOptions,
      };
      // console.log(result);
      return result;
    },
  },
  watch: {
    restfulEdgeTab: {
      handler() {
        if (this.restfulSucceedThenGoto === 'add_new_dialogue_node') {
          const newNodeID = scenarioInitializer.guid_sort();
          this.addNewDialogueNode(newNodeID);
          this.restfulSucceedThenGoto = newNodeID;
        }
        if (this.restfulFailedThenGoto === 'add_new_dialogue_node') {
          const newNodeID = scenarioInitializer.guid_sort();
          this.addNewDialogueNode(newNodeID);
          this.restfulFailedThenGoto = newNodeID;
        }
        this.$emit('update', this.restfulEdgeTab);
        this.$emit('update:valid', this.isValid());
        // console.log(this.restfulEdgeTab);
      },
      deep: true,
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
        this.exitEdge,
      ].concat(options);
    },
    renderTabContent() {
      // render restfulSucceedThenGoto, restfulFailedThenGoto
      const restfulEdgeTab = JSON.parse(JSON.stringify(this.initialRestfulEdgeTab));
      this.restfulSucceedThenGoto = restfulEdgeTab.restfulSucceedThenGoto;
      this.restfulFailedThenGoto = restfulEdgeTab.restfulFailedThenGoto;

      // render toNodeOptions
      this.composeOptions(this.initialToNodeOptions);
    },
    isValid() {
      return true;
    },
    showToolTip() {
      general.showInputContentTooltip(this.$refs['input-content']);
    },
  },
  beforeMount() {
    this.renderTabContent();
  },
  mounted() {
    this.$on('showToolTip', this.showToolTip);
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';

#restful-edge-edit-page{
  display: flex;
  flex-direction: column;
  padding: 10px 30px 0px 20px;
  .block{
    background: #F3F7F9;
    padding: 16px 20px 16px 20px;
    border: 1px solid $color-borderline;
    border-radius: 5px;
    margin: 0px 0px 20px 0px;
  }
  .row{
    display: flex;
    flex-direction: row;
    align-items: center;
    .select-goto{
      margin-left: 20px;
    }
  }
  .label{
    height: 36px;
    line-height: 36px;
    font-size: 16px;
  }
  .label-bold{
    font-size: 18px;
    font-weight: 600;
  }
  .label-margin-left{
    margin-left: 10px;
  }
}
</style>
