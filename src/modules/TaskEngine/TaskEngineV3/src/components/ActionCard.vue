<template lang="html">
<div id="action-card" class="action-card">
  <div class="msg-action action-block" v-if="action.type=='msg'">
    <div class="label-response">{{$t("task_engine_v3.action_card.msg.label_response")}}</div>
    <input class="input-msg" v-model="action.msg"></input>
  </div>
  
  <div class="webhook-action action-block" v-if="action.type=='webhook'">
    <div class="row">
      <div class="label-variable label-webhook">{{$t("task_engine_v3.action_card.webhook.label_variable")}}</div>
      <input
        class="input-variable input-webhook"
        v-model="action.variable_name"
        :placeholder="$t('task_engine_v3.action_card.webhook.placeholder_input_variable')"
      />
    </div>
    <div class="row">
      <div class="label-method label-webhook">{{$t("task_engine_v3.action_card.webhook.label_method")}}</div>
      <dropdown-select
        v-model="methodModel"
        :options="methodOptions"
        width="180px"
      />
    </div>
    <div class="row">
      <div class="label-url label-webhook">{{$t("task_engine_v3.action_card.webhook.label_url")}}</div>
      <input
        class="input-url input-webhook"
        v-model="action.url"
        :placeholder="$t('task_engine_v3.action_card.webhook.placeholder_input_url')"
      />
    </div>
    <div class="row" v-if="action.method!='GET'">
      <div class="label-content-type label-webhook">{{$t("task_engine_v3.action_card.webhook.label_content_type")}}</div>
      <dropdown-select
        v-model="contentTypeModel"
        :options="contentTypeOptions"
        width="300px"
      />
    </div>
    <div class="row" v-if="action.method!='GET'">
      <div class="label-body label-webhook">{{$t("task_engine_v3.action_card.webhook.label_body")}}</div>
      <textarea class="textarea-body"
        v-model="action.body"
        :placeholder="$t('task_engine_v3.action_card.webhook.placeholder_input_body')">
      </textarea>
    </div>
    <div class="row" v-if="version!=='2.0'">
      <div class="label-body label-webhook">{{$t("task_engine_v3.action_card.webhook.label_webhook_success")}}</div>
      <dropdown-select
        :value="[action.webhookSuccessThenGoto]"
        @input="onSelectGoto($event[0], 'webhookSuccessThenGoto')"
        :options="skillOptions"
        :fixedListWidth="false"
        width="180px"
      />
    </div>
    <div class="row" v-if="version!=='2.0'">
      <div class="label-body label-webhook">{{$t("task_engine_v3.action_card.webhook.label_webhook_fail")}}</div>
      <dropdown-select
        :value="[action.webhookFailThenGoto]"
        @input="onSelectGoto($event[0], 'webhookFailThenGoto')"
        :options="skillOptions"
        :fixedListWidth="false"
        width="180px"
      />
    </div>
  </div>

  <div class="goto-action action-block" v-if="action.type=='goto'">
    <div class="label-goto">{{$t("task_engine_v3.action_card.goto.label_goto")}}</div>
    <dropdown-select
      class="select-skill"
      ref="selectSkill"
      :value="[action.targetSkillId]"
      @input="onSelectGoto($event[0], 'targetSkillId')"
      :options="skillOptions"
      :fixedListWidth="false"
      width="180px"
    />
  </div>
</div>
</template>

<script>
import scenarioInitializer from '@/modules/TaskEngine/TaskEngineV2/src/_utils/scenarioInitializer';
import i18nUtils from '../utils/i18nUtil';
import CreateSkillPop from './CreateSkillPop';

export default {
  name: 'action-card',
  props: {
    initialAction: {
      type: Object,
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
    const action = JSON.parse(JSON.stringify(this.initialAction));
    if (action.type === 'webhook') {
      if (action.webhookSuccessThenGoto === undefined) {
        action.webhookSuccessThenGoto = null;
      }
      if (action.webhookFailThenGoto === undefined) {
        action.webhookFailThenGoto = null;
      }
    }
    return {
      i18n: {},
      action,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      contentTypes: ['application/json', 'application/x-www-form-urlencoded'],
      skills: [],
    };
  },
  computed: {
    skillOptions() {
      const skillNameList = [];
      if (this.version === '2.0') {
        skillNameList.push({
          text: this.$t('task_engine_v3.action_card.goto.button_add_new_skill'),
          value: 'add_new_skill',
          isButton: true,
        });
        skillNameList.push({
          text: this.$t('task_engine_v3.action_card.goto.option_finish_scenario'),
          value: '0',
        });
      } else {
        skillNameList.push({
          text: this.$t('task_engine_v2.to_node_option.add_new_dialogue_node'),
          value: 'add_new_dialogue_node',
          isButton: true,
        });
        skillNameList.push({
          text: this.$t('task_engine_v2.to_node_option.do_nothing'),
          value: null,
        });
        skillNameList.push({
          text: `${this.$t('task_engine_v2.to_node_option.exit')} (ID: 0)`,
          value: '0',
        });
      }
      skillNameList.push(...JSON.parse(JSON.stringify(this.initialSkillNameList)));
      return skillNameList;
    },
    methodOptions() {
      const options = [];
      this.methods.forEach((method) => {
        options.push({
          text: method,
          value: method,
        });
      });
      return options;
    },
    methodModel: {
      get() {
        return [this.action.method];
      },
      set(newValue) {
        this.action.method = newValue[0];
      },
    },
    contentTypeOptions() {
      const options = [];
      this.contentTypes.forEach((type) => {
        options.push({
          text: type,
          value: type,
        });
      });
      return options;
    },
    contentTypeModel: {
      get() {
        return [this.action.contentTypes];
      },
      set(newValue) {
        this.action.contentTypes = newValue[0];
      },
    },
  },
  watch: {
    action: {
      handler() {
        this.$emit('update', this.action);
      },
      deep: true,
    },
  },
  methods: {
    onSelectGoto(toNode, key) {
      if (toNode === 'add_new_skill') {
        this.addNewSkill();
      } else if (toNode === 'add_new_dialogue_node') {
        const newNodeID = scenarioInitializer.guid_sort();
        this.$emit('addNewDialogueNode', newNodeID);
        this.action[key] = newNodeID;
      } else {
        this.action[key] = toNode;
      }
      this.$emit('update', this.action);
    },
    addNewSkill() {
      const that = this;
      that.$pop({
        title: this.i18n.task_engine_v3.create_skill_pop.label_title,
        component: CreateSkillPop,
        validate: true,
        data: {
          skillName: '',
        },
        callback: {
          ok: (skillName) => {
            that.$root.$emit('addNewSkill', skillName);
          },
        },
      });
    },
  },
  beforeMount() {
    this.i18n = i18nUtils.getLocaleMsgs(this.$i18n);
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
#action-card{
  margin-top: 10px;
  .msg-action{
    display: flex;
    flex-direction: row;
    .label-response{
      width: 28px;
      height: 28px;
      font-size: 14px;
      line-height: 28px;
      color: $color-font-normal;
    }
    .input-msg{
      flex: 1 1 auto;
      margin-left: 15px;
    }
  }
  .webhook-action{
    .row{
      display: flex;
      flex-direction: row;
      margin-top: 10px;
      .label-webhook{
        width: 122px;
        height: 28px;
        font-size: 14px;
        line-height: 28px;
        color: $color-font-normal;
        margin-right: 10px;
      }
      .input-webhook{
        width: 180px;
      }
      .input-url, .input-body{
        flex: 1 1 auto;
      }
      .textarea-body{
        flex: 1 1 auto;
        width: 180px;
        height: 100px;
        color: $color-font-normal;
      }
    }
  }
  .goto-action{
    display: flex;
    flex-direction: row;
    .label-goto{
      width: 28px;
      height: 28px;
      font-size: 14px;
      line-height: 28px;
      color: $color-font-normal;
    }
    .select-skill{
      margin-left: 15px;
    }
  }
}
</style>
