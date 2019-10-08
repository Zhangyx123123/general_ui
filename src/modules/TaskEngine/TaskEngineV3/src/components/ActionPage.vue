<template lang="html">
<div id="action-page" class="page action-page">
  <div class="add-action-container">
    <div class="row" v-if="version === '2.0'">
      <div class="label-add-action">{{$t("task_engine_v3.action_page.label_add_action_2_0")}}</div>
      <div class="icon-container" v-tooltip="{ msg: $t('task_engine_v3.action_page.description_2_0')}">
        <icon icon-type="info" :enableHover="true" :size=18 />
      </div>
    </div>
    <div class="row"  v-if="version !== '2.0'">
      <div class="label-add-action">{{$t("task_engine_v3.action_page.label_add_action")}}</div>
      <div class="icon-container" v-tooltip="{ msg: $t('task_engine_v3.action_page.description')}">
        <icon icon-type="info" :enableHover="true" :size=18 />
      </div>
    </div>
    <div class="row row-margin-top">
      <text-button
        class="button-add-action-group"
        button-type='primary'
        @click="addNewActionGroup('msg')">
        {{$t("task_engine_v3.action_page.button_add_new_msg")}}
      </text-button>
      <text-button
        class="button-add-action-group"
        button-type='primary'
        @click="addNewActionGroup('webhook')">
        {{$t("task_engine_v3.action_page.button_add_new_webhook")}}
      </text-button>
      <text-button v-if="version==='2.0'"
        class="button-add-action-group"
        button-type='primary'
        @click="addNewActionGroup('goto')">
        {{$t("task_engine_v3.action_page.button_add_new_goto")}}
      </text-button>
      <text-button v-if="version!=='2.0'"
        class="button-add-action-group"
        button-type='primary'
        @click="addNewActionGroup('goto')">
        {{$t("task_engine_v3.action_page.button_add_new_edge")}}
      </text-button>
    </div>
  </div>
  <div class="action-group-list-container">
    <draggable v-model="actionGroupList" :options="{ghostClass:'ghost'}" @start="drag=true" @end="drag=false; emitUpdate();">
      <div class="action-group-container" v-for="(actionGroup, index) in actionGroupList">
        <action-group :key="actionGroup.actionGroupId"
          :initialActionGroup="actionGroup"
          :initialEntityCollectorList="initialEntityCollectorList"
          :initialSkillNameList="skillNameList"
          :version="version"
          @update="updateActionGroup(index, $event)"
          @deleteActionGroupButtonClick="deleteActionGroup(index)"
          @addNewDialogueNode="addNewDialogueNode"
        ></action-group>
      </div>
    </draggable>
  </div>
</div>
</template>

<script>
import general from '@/modules/TaskEngine/_utils/general';
import draggable from 'vuedraggable';
import ActionGroup from '../components/ActionGroup';

export default {
  name: 'action-page',
  components: {
    draggable,
    'action-group': ActionGroup,
  },
  props: {
    initialActionGroupList: {
      type: Array,
      required: true,
    },
    initialEntityCollectorList: {
      type: Array,
      required: true,
    },
    initialSkillNameList: {
      type: Array,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      actionGroupList: JSON.parse(JSON.stringify(this.initialActionGroupList)),
      skillNameList: [],
      newNodeOptions: [],
    };
  },
  computed: {},
  watch: {
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
      this.$emit('updateNewNodeOptions', this.newNodeOptions);
      this.updateOptions();
    },
    updateOptions() {
      this.composeSkillNameList([
        ...this.initialSkillNameList,
        ...this.newNodeOptions.map(option => ({
          text: `${option.nodeName} (ID: ${option.nodeId})`,
          value: option.nodeId,
        })),
      ]);
    },
    composeSkillNameList(newSkillNameList) {
      this.skillNameList = newSkillNameList;
    },
    updateActionGroup(index, newActionGroup) {
      this.actionGroupList[index] = newActionGroup;
      this.emitUpdate();
    },
    addNewActionGroup(type) {
      const actionGroup = {
        actionGroupId: this.$uuid.v1(),
        actionList: [],
        conditionList: [],
      };
      if (type === 'msg') {
        actionGroup.actionList.push({
          type: 'msg',
          msg: '',
          actionId: this.$uuid.v1(),
        });
      } else if (type === 'webhook') {
        actionGroup.actionList.push({
          type: 'webhook',
          variable_name: '',
          method: 'GET',
          url: '',
          contentTypes: 'application/json',
          body: '',
          webhookSuccessThenGoto: null,
          webhookFailThenGoto: null,
          actionId: this.$uuid.v1(),
        });
      } else if (type === 'goto') {
        actionGroup.actionList.push({
          type: 'goto',
          targetSkillId: '0',
          actionId: this.$uuid.v1(),
        });
      }
      this.actionGroupList.push(actionGroup);
      this.emitUpdate();
    },
    deleteActionGroup(index) {
      this.actionGroupList.splice(index, 1);
      this.emitUpdate();
    },
    rerender() {
      this.actionGroupList = JSON.parse(JSON.stringify(this.initialActionGroupList));
    },
    emitUpdate() {
      this.$emit('update', this.actionGroupList);
      this.$emit('update:valid', this.isValid());
    },
    isValid() {
      return true;
    },
    showToolTip() {
      general.showInputContentTooltip(this.$refs['input-content']);
    },
  },
  beforeMount() {
    this.composeSkillNameList(JSON.parse(JSON.stringify(this.initialSkillNameList)));
  },
  mounted() {
    this.$on('rerender', this.rerender);
    this.$on('showToolTip', this.showToolTip);
  },
  activated() {
    this.rerender();
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
#action-page{
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  .add-action-container{
    flex: 0 0 auto;
    margin: 20px 20px 0px 20px;
    padding: 10px 20px;
    height: 86px;
    background: #f8f8f8;
    border-radius: 4px;
    .row{
      display: flex;
      flex-direction: row;
      .label-add-action{
        color: $color-font-active;
        line-height: 28px;
        font-size: 14px;
      }
      .icon-container{
        margin-left: 4px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .button-add-action-group{
        margin-right: 10px;
      }
    }
    .row-margin-top{
      margin-top: 10px;
    }
  }
  .action-group-list-container{
    flex: 1 1 auto;
    margin: 10px 0px 20px 0px;
    padding: 0px 20px 0px 20px;
    .action-group-container{
      padding-bottom: 10px;
      &:active{
        box-shadow: none;
      }
      // &:last-child{
      //   margin-bottom: 80px;
      // }
      &.ghost{
        background-color: #f8f8f8;
      }
    }
  }
}
</style>
