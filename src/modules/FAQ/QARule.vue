<template>
  <div class='qa-rule'>
    <div class="actions row">
      <text-button main icon-type="white_add" @click="popAddRule">{{$t('general.add')}}{{$t('qa_rule.rule')}}</text-button>
      <search-input v-model="keyword"></search-input>
    </div>
    <div class="table-container">
      <flex-table :data="rules" :columns="tableHeader"/>
    </div>
  </div>
</template>

<script>
import FlexTable from '@/components/FlexTable';
import RuleEditPop from './_components/QARuleEdit';
import labelAPI from './_api/qalabel';
import ruleAPI from './_api/qarule';

export default {
  path: 'qa-rule',
  privCode: 'qa_rule',
  displayNameKey: 'qa_rule',
  icon: 'white_chat',
  name: 'qa-rule',
  components: {
    'flex-table': FlexTable,
  },
  api: [labelAPI, ruleAPI],
  data() {
    return {
      keyword: '',
      rules: [],
      labelMap: {},
      tableHeader: [
        // {
        //   key: 'id',
        //   text: this.$t('qa_rule.rule_id'),
        //   type: 'text',
        //   fixed: true,
        //   width: '40px',
        // },
        {
          key: 'label_count',
          text: this.$t('qa_rule.label_count'),
          type: 'text',
          width: 1,
        },
        {
          key: 'name',
          text: this.$t('qa_rule.rule_name'),
          type: 'text',
          width: 1,
        },
        {
          key: 'answer_content',
          text: this.$t('qa_rule.rule_answer'),
          type: 'text',
          width: 3,
        },
        {
          key: 'status_text',
          text: this.$t('qa_rule.rule_status'),
          type: 'text',
          width: 1,
        },
        {
          text: '',
          type: 'icon-button',
          fixed: true,
          width: '90px',
          icon: 'edit',
          iconCallback: this.popEditRule,
          btn_text: this.$t('general.edit'),
        },
        {
          text: '',
          type: 'icon-button',
          fixed: true,
          width: '90px',
          icon: 'delete',
          iconCallback: this.popDeleteRule,
          btn_text: this.$t('general.delete'),
        },
      ],
    };
  },
  methods: {
    popAddRule() {
      const that = this;
      that.$pop({
        title: `${that.$t('general.add')}${that.$t('qa_rule.rule')}`,
        component: RuleEditPop,
        validate: true,
        data: {
          existRules: that.rules.map(act => act.name),
          existLabels: that.labelMap,
          addMode: true,
        },
        bindValue: false,
        callback: {
          ok(retData) {
            that.$startPageLoading();
            that.$api.addRule(retData)
            .then(() => that.loadRules(), (err) => {
              // TODO: handle add error
              console.log(err);
            })
            .then(() => {
              that.$emit('endLoading');
            });
          },
        },
      });
    },
    popEditRule(idx, rule) {
      const that = this;
      that.$pop({
        title: `${that.$t('general.edit')}${that.$t('qa_rule.rule')}`,
        component: RuleEditPop,
        validate: true,
        data: {
          existRules: that.rules
            .filter(r => r.id !== rule.id)
            .map(r => r.name),
          existLabels: that.labelMap,
          rule,
          addMode: false,
        },
        bindValue: false,
        callback: {
          ok(retData) {
            that.$startPageLoading();
            that.$api.updateRule(rule.id, retData)
            .then(() => that.loadRules(), (err) => {
              // TODO: handle add error
              console.log(err);
              that.$emit('endLoading');
            });
          },
        },
      });
    },
    popDeleteRule(idx, rule) {
      const that = this;
      that.$popCheck({
        title: `${that.$t('general.delete')}${that.$t('qa_rule.rule')}`,
        data: {
          msg: that.$t('qa_rule.delete_rule_name', { rule: rule.name }),
        },
        callback: {
          ok() {
            that.$startPageLoading();
            that.$api.deleteRule(rule.id)
            .then(() => that.loadRules(), () => {
              // TODO: handle delete error
              that.$notifyFail(that.$t('qa_label.err_detele_label_has_rule'));
            })
            .then(() => {
              that.$emit('endLoading');
            });
          },
        },
      });
    },
    loadRules() {
      const that = this;
      that.rules = [];
      that.$startPageLoading();
      return that.$api.loadLabels().then((labels) => {
        that.labelMap = {};
        labels.forEach((label) => {
          that.labelMap[label.id] = label.name;
        });
        return that.$api.loadRules();
      })
      .then((rules) => {
        const now = new Date();
        rules.forEach((rule) => {
          rule.label_count = rule.labels.length;
          if (rule.begin_time === null && rule.end_time === null) {
            rule.status_valid = true;
            rule.status_text = that.$t('qa_rule.status_forever');
          } else if (rule.end_time < now) {
            rule.status_valid = false;
            rule.status_text = that.$t('qa_rule.status_timeout');
          } else {
            rule.status_valid = true;
            rule.status_text = that.$t('qa_rule.status_valid');
          }

          try {
            const answerObj = JSON.parse(rule.answer);
            answerObj.forEach((answer) => {
              rule.answer_content += `${answer}  `;
            });
          } catch (e) {
            rule.answer_content = rule.answer;
          }
        });
        that.rules = rules;
      }, (err) => {
        // TODO handle load error
        console.log(err);
      })
      .then(() => {
        that.$emit('endLoading');
      });
    },
  },
  mounted() {
    this.loadRules();
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';
.qa-rule {
  display: flex;
  flex-direction: column;
  .row {
    @include flex-row();
  }
  .table-container {
    flex: 1;
  }
}
</style>
