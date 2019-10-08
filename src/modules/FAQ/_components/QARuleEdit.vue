<template>
  <div class='qa-rule-edit-pop'>
    <div class='qa-rule-edit'>
      <div class="row" v-if="!addMode">
        <span class='row-name'>{{ $t('qa_rule.rule_id') }}</span>
        <div>{{ id }}</div>
      </div>
      <div class="row">
        <span class='row-name'>{{ $t('qa_rule.rule_name') }}</span>
        <input v-model="name"
          :class="{error: isNameError}"
          @keyup="checkName">
      </div>
      <div class="err-msg" v-if="isNameError">
        <template v-if="nameErrorType === 'empty'">{{ $t('error_msg.input_empty') }}</template>
        <template v-else-if="nameErrorType === 'existed'">{{ $t('qa_rule.err_existed_rule') }}</template>
      </div>
      <div class="row">
        <span class='row-name'>{{ $t('qa_rule.rule_target') }}</span>
        <label-switch :options="targetOption" v-model="ruleTarget" @input="checkAnswer"/>
      </div>
      <div class="row">
        <span class='row-name'>{{ $t('qa_rule.rule_answer') }}</span>
        <label-switch :options="answerOption" v-model="answerType" @input="checkAnswer"/>
      </div>
      <div class="row" v-if="answerType === 'cmd'">
        <span class='row-name'>{{ $t('qa_rule.answer_cmd_content') }}</span>
        <input v-model="cmd" @keyup="checkAnswer"/>
      </div>
      <div class="row" v-else>
        <span class='row-name'>{{ $t('qa_rule.answer_text_content') }}</span>
        <textarea v-model="answer" @keyup="checkAnswer"/>
      </div>
      <div class="err-msg" v-if="isAnswerError">
        <template v-if="answerErrorType === 'empty'">{{ $t('error_msg.input_empty') }}</template>
        <template v-else-if="answerErrorType === 'length'">{{ $t('qa_rule.err_content_too_long') }}</template>
      </div>
      <div class="row">
        <span class='row-name'>{{ $t('qa_rule.rule_type') }}</span>
        <label-switch :options="typeOption" v-model="ruleType"/>
      </div>
      <div class="block">
        <div class="row">
          <span class='row-name'>{{ $t('qa_rule.rule_time') }}</span>
          <label-switch :options="dateOptions" v-model="dateType"/>
        </div>
        <div class="row" v-if="dateType === 'custom'">
          <input type="date" v-model="startDate" @blur="checkDate"/>
          <input type="date" v-model="endDate" @blur="checkDate"/>
        </div>
        <div class="err-msg" v-if="isDateError">
          <template v-if="dateErrorType === 'start_empty'">{{ $t('error_msg.input_empty') }}</template>
          <template v-else-if="dateErrorType === 'end_empty'">{{ $t('error_msg.input_empty') }}</template>
          <template v-else-if="dateErrorType === 'invalid'">{{ $t('qa_rule.err_time_range') }}</template>
        </div>
      </div>
      <div class="block">
        <div class="row">
          <span class='row-name'>{{ $t('qa_rule.rule_content') }}</span>
          <text-button v-if="content.length < maxRuleContentLen" width="250px" @click="addRuleContent">+</text-button>
        </div>
        <div v-for="(c, idx) in content" :key="idx" class='row rule-row'>
          <label-switch :options="ruleOption" v-model="c.type"/>
          <input v-model="c.value">
          <div class='button'>
            <text-button @click="deleteRuleContent(idx)">{{$t('general.delete')}}</text-button>
          </div>
        </div>
        <div class="err-msg" v-if="isContentError">
          <template v-if="nameErrorType === 'empty'">{{ $t('error_msg.input_empty') }}</template>
          <template v-else-if="nameErrorType === 'existed'">{{ $t('qa_rule.err_existed_rule') }}</template>
        </div>
      </div>
    </div>
    <div class="spliter"></div>
    <div class="label-box">
      <div class="row">
        <span>{{ $t('qa_rule.link_label') }}</span>
      </div>
      <div class="text-area-wrapper">
          <input class="label-input"
          :placeholder="$t('qa_rule.add_label')"
          @keydown.13.stop="addLabel" v-model="labelAdded">
      </div>
      <div class="label-container">
        <div v-for="(label, idx) in labels" :key="idx" class="label-row">
          <span class="label-name">{{label.name}}</span>
          <span class="label-delete" @click="removeLabel(idx)">X</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import LabelSwitch from '@/components/basic/LabelSwitch';
import labelAPI from '../_api/qalabel';

const maxContentLength = 200;
export default {
  api: labelAPI,
  name: 'qa-rule-edit',
  props: {
    origData: {
      type: Object,
      default: undefined,
    },
  },
  components: {
    LabelSwitch,
  },
  data() {
    return {
      name: '',
      id: '',
      content: [],
      ruleTarget: 0,
      ruleType: 0,
      cmd: '',
      answer: '',
      labels: [],
      labelAdded: '',
      answerType: '',

      startDate: moment(new Date()).format('YYYY-MM-DD'),
      endDate: moment(new Date()).format('YYYY-MM-DD'),

      addMode: true,
      existRules: [],
      existLabels: [],
      nameErrorType: '',
      answerErrorType: '',
      dateErrorType: '',
      contentErrorType: '',
      maxRuleContentLen: 5,
      status: true,

      dateType: 'forever',
      dateOptions: [
        {
          val: 'forever',
          text: this.$t('qa_rule.status_forever'),
        },
        {
          val: 'custom',
          text: this.$t('qa_rule.custom_date'),
        },
      ],
      ruleOption: [
        {
          val: 'keyword',
          text: this.$t('qa_rule.rule_type_keyword'),
        },
        {
          val: 'regex',
          text: this.$t('qa_rule.rule_type_regex'),
        },
      ],
      targetOption: [
        {
          val: 0,
          text: this.$t('qa_rule.rule_target_std'),
        },
        {
          val: 1,
          text: this.$t('qa_rule.rule_target_answer'),
        },
      ],
      typeOption: [
        {
          val: 0,
          text: this.$t('qa_rule.rule_type_replace'),
        },
        {
          val: 1,
          text: this.$t('qa_rule.rule_type_front'),
        },
        {
          val: 2,
          text: this.$t('qa_rule.rule_type_behind'),
        },
      ],
      answerOption: [
        {
          val: 'text',
          text: this.$t('qa_rule.answer_type_text'),
        },
        {
          val: 'cmd',
          text: this.$t('qa_rule.answer_type_cmd'),
        },
      ],
    };
  },
  computed: {
    isNameError() {
      return this.nameErrorType !== '';
    },
    isAnswerError() {
      return this.answerErrorType !== '';
    },
    isDateError() {
      if (this.dateType === 'forever') {
        return false;
      }
      return this.dateErrorType !== '';
    },
    isContentError() {
      return this.contentErrorType !== '';
    },
  },
  methods: {
    removeLabel(idx) {
      this.labels.splice(idx, 1);
    },
    addLabel(e) {
      const that = this;
      const labelName = that.labelAdded.trim();
      that.labelAdded = '';
      e.preventDefault();
      // insert existed label
      let idx = that.labels.findIndex(l => l.name === labelName);
      if (idx >= 0) {
        const t = that.labels.splice(idx, 1);
        that.labels.unshift(...t);
        return;
      }

      idx = that.existLabels.findIndex(l => l.name === labelName);
      if (idx < 0) {
        that.$api.addLabel(labelName).then((data) => {
          const l = data.result;
          const newLabel = {
            id: l.id,
            name: l.name,
          };
          that.existLabels.push(newLabel);
          that.labels.unshift(newLabel);
        });
      } else {
        that.labels.unshift(that.existLabels[idx]);
      }
    },
    addRuleContent() {
      this.content.push({
        type: 'keyword',
        value: '',
      });
    },
    deleteRuleContent(idx) {
      this.content.splice(idx, 1);
    },
    checkAll() {
      const that = this;
      return that.checkName() &&
        that.checkAnswer() &&
        that.checkDate();
    },
    validate() {
      const that = this;
      const rules = that.content.map(c => ({
        type: c.type,
        value: [c.value],
      }));

      let answerObj = that.answer;
      if (that.answerType === 'cmd') {
        answerObj = {
          type: 'cmd',
          subType: that.cmd,
          value: '',
          data: [],
        };
      }

      if (that.checkAll()) {
        const ret = {
          name: that.name,
          rule: rules,
          target: that.ruleTarget,
          answer: answerObj,
          type: that.ruleType,
          begin_time: new Date(that.startDate),
          end_time: new Date(that.endDate),
          labels: that.labels.map(l => l.id),
          status: 1,
          // TODO: set status in UI
          // status: that.status ? 1 : 0,
        };
        if (that.dateType === 'forever') {
          ret.begin_time = null;
          ret.end_time = null;
        }
        that.$emit('validateSuccess', ret);
      }
    },
    checkName() {
      const that = this;

      if (that.name === '') {
        that.nameErrorType = 'empty';
      } else if (that.existRules.indexOf(that.name) >= 0) {
        that.nameErrorType = 'existed';
      } else {
        that.nameErrorType = '';
      }
      that.$emit(that.isNameError ? 'disableOK' : 'enableOK');
      return !that.isNameError;
    },
    checkAnswer() {
      const that = this;
      let checkValue = '';
      if (that.answerType === 'cmd') {
        checkValue = that.cmd;
      } else {
        checkValue = that.answer;
      }

      if (checkValue === '') {
        that.answerErrorType = 'empty';
      } else if (checkValue.length > maxContentLength) {
        that.answerErrorType = 'length';
      } else {
        that.answerErrorType = '';
      }
      that.$emit(that.isAnswerError ? 'disableOK' : 'enableOK');
      return !that.isAnswerError;
    },
    checkDate() {
      const that = this;
      if (that.dateType === 'forever') {
        return true;
      }

      if (that.startDate === '') {
        that.dateErrorType = 'start_empty';
      } else if (that.endDate === '') {
        that.dateErrorType = 'end_empty';
      } else if (new Date(that.startDate) > new Date(that.endDate)) {
        that.dateErrorType = 'invalid';
      }
      return that.dateErrorType === '';
    },
    checkContent() {
      const that = this;
      that.content = that.content.filter(c => c.value !== '');
      if (that.content.length <= 0) {
        that.contentErrorType = 'empty';
      }
      return that.contentErrorType === '';
    },
    loadActivityFromProp() {
      const that = this;
      const origRule = that.origData.rule;
      that.name = origRule.name;
      that.content = origRule.rule.map((r) => {
        const ret = {
          type: r.type,
          value: r.value.length > 0 ? r.value[0] : '',
        };
        return ret;
      });
      that.ruleType = origRule.response_type;
      that.ruleTarget = origRule.target;
      that.answer = origRule.answer;
      const labels = [];
      origRule.labels.forEach((id) => {
        if (that.origData.existLabels[id]) {
          labels.push({
            id,
            name: that.origData.existLabels[id],
          });
        }
      });
      that.labels = labels;
      that.status = origRule.status === 1;
      if (origRule.begin_time !== null && origRule.end_time !== null) {
        that.startDate = moment(origRule.begin_time).format('YYYY-MM-DD');
        that.endDate = moment(origRule.end_time).format('YYYY-MM-DD');
        that.dateType = 'custom';
      } else {
        that.dateType = 'forever';
      }
    },
  },
  mounted() {
    const that = this;
    that.$on('validate', that.validate);
    if (!that.origData.addMode) {
      that.loadActivityFromProp();
      that.addMode = that.origData.addMode || true;
    }
    that.existRules = that.origData.existRules || [];
    that.existLabels = [];
    Object.keys(that.origData.existLabels).forEach((id) => {
      that.existLabels.push({
        id,
        name: that.origData.existLabels[id],
      });
    });
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';
.qa-rule-edit-pop {
  display: flex;
  height: 620px;
}
.qa-rule-edit {
  @include popForm(80px);
  .block {
    .err-msg {
      @include err-msg();
      margin-top: 10px;
      margin-left: 10px;
    }
    .rule-row {
      justify-content: center;
      .button {
        margin-left: 10px;
      }
    }
  }
}
.spliter {
  flex: 0 0 2px;
  margin: 0 10px;
}
.label-box {
  width: 330px;
  display: flex;
  flex-direction: column;
  .row {
    display: flex;
    align-items: center;
  }
  .text-area-wrapper {
    margin-top: 10px;
    padding: 2px 5px;
    overflow-y: hidden;
    border: 1px solid black;
    height: $default-line-height;
    input {
      display: block;
      width: 100%;
      height: 90%;
      border: none; 
      &:focus {
        outline: none;
      }
    }
    textarea {
      resize: none;
      white-space: nowrap;
      overflow-x: scroll;
      overflow-y: hidden;
      width: 100%;
      height: 90%;
      border: none;
      &:focus {
        outline: none;
      }
    }
  }
  .label-container {
    border: 1px solid gray;
    margin-top: 10px;
    flex: 1;
    padding: 5px 0;
    @include auto-overflow();
    .label-row {
      text-align: center;
      padding: 10px;
      .label-delete {
        color: $error-color;
        @include click-button();
        font-weight: bold;
      }
    }
  }
}
</style>
