<template lang="html">
<div id="action-group" class="action-group">
  <div class="label-first-action-type">{{labelFirstActionType}}</div>
  <div class="action-group-box">
    <div class="row">
      <div
        class="button-add-condition"
        @click="addNewCondition">
        {{$t("task_engine_v3.action_group.button_add_new_condition")}}
      </div>
      <div
        class="button-delete-action-group"
        @click="deleteThisActionGroup">
        {{$t("task_engine_v3.action_group.button_delete_action_group")}}
      </div>
    </div>
    <template v-for="(condition, index) in actionGroup.conditionList">
      <condition-card class="condition-card"
        :key="condition.conditionId"
        :initialCondition="condition"
        :index="index"
        :initialEntityCollectorList="initialEntityCollectorList"
        :version="version"
        @update="updateCondition(index, $event)"
        @deleteConditionButtonClick="deleteCondition(index)"
      ></condition-card>
    </template>
    <template v-for="(action, index) in actionGroup.actionList">
      <action-card
        :key="action.actionId"
        :initialAction="action"
        :initialSkillNameList="initialSkillNameList"
        :version="version"
        @update="updateAction(index, $event)"
        @addNewDialogueNode="addNewDialogueNode"
      ></action-card>
    </template>
  </div>
</div>
</template>

<script>
import i18nUtils from '../utils/i18nUtil';
import ConditionCard from '../components/ConditionCard';
import ActionCard from '../components/ActionCard';

export default {
  name: 'action-group',
  components: {
    'condition-card': ConditionCard,
    'action-card': ActionCard,
  },
  props: {
    initialActionGroup: {
      type: Object,
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
    const actionGroup = JSON.parse(JSON.stringify(this.initialActionGroup));
    actionGroup.conditionList.forEach((condition) => {
      if (condition.conditionId === undefined) {
        condition.conditionId = this.$uuid.v1();
      }
    });
    actionGroup.actionList.forEach((action) => {
      if (action.actionId === undefined) {
        action.actionId = this.$uuid.v1();
      }
    });
    return {
      i18n: {},
      actionGroup,
    };
  },
  computed: {
    firstActionType() {
      if (this.actionGroup.actionList.length > 0) {
        return this.actionGroup.actionList[0].type;
      }
      return '';
    },
    labelFirstActionType() {
      let label = '';
      if (this.firstActionType === 'msg') {
        label = this.$t('task_engine_v3.action_card.label_msg_type');
      }
      if (this.firstActionType === 'webhook') {
        label = this.$t('task_engine_v3.action_card.label_webhook_type');
      }
      if (this.firstActionType === 'goto') {
        if (this.version === '2.0') {
          label = this.$t('task_engine_v3.action_card.label_goto_type_2_0');
        } else {
          label = this.$t('task_engine_v3.action_card.label_goto_type');
        }
      }
      return label;
    },
  },
  watch: {},
  methods: {
    addNewDialogueNode(newNodeID) {
      this.$emit('addNewDialogueNode', newNodeID);
    },
    updateCondition(index, newCondition) {
      this.actionGroup.conditionList[index] = newCondition;
      this.$emit('update', this.actionGroup);
    },
    updateAction(index, newAction) {
      this.actionGroup.actionList[index] = newAction;
      this.$emit('update', this.actionGroup);
    },
    deleteThisActionGroup() {
      this.$emit('deleteActionGroupButtonClick');
    },
    addNewCondition() {
      this.actionGroup.conditionList.push({
        target: {
          name: '',
          displayText: '',
          type: '',
        },
        comparisonOperator: {
          displayText: '',
          source: '',
          functionName: '',
          needContent: false,
        },
        content: '',
        conditionId: this.$uuid.v1(),
      });
    },
    deleteCondition(index) {
      this.actionGroup.conditionList.splice(index, 1);
      this.$emit('update', this.actionGroup);
    },
  },
  beforeMount() {
  },
  mounted() {
    this.i18n = i18nUtils.getLocaleMsgs(this.$i18n);
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
#action-group{
  .label-first-action-type{
    height: 28px;
    font-size: 12px;
    line-height: 28px;
    color: #999999;
  }
  .action-group-box{
    padding: 10px;
    padding-left: 20px;
    padding-right: 20px;
    background-color: #ffffff;
    border: solid 1px #dbdbdb;
    border-radius: 4px;
    cursor: move;
    transition: all .2s ease-in-out;
    &:hover{
      box-shadow: 0 4px 9px 0 rgba(115, 115, 115, 0.2), 0 5px 8px 0 rgba(228, 228, 228, 0.5);
    }
    .row{
      position: relative;
      display: flex;
      flex-direction: row;
      .button-add-condition{
        width: 75px;
        height: 28px;
        font-size: 14px;
        line-height: 28px;
        color: $color-primary;
        &:hover {
          cursor: pointer;
          color: darken($color-primary, 15%);
        }
      }
      .button-delete-action-group{
        position: absolute;
        right: 0px;
        height: 28px;
        font-size: 14px;
        line-height: 28px;
        text-align: center;
        color: $color-error;
        &:hover {
          cursor: pointer;
          color: darken($color-error, 15%);
        }
      }
    }
  }
}
</style>
