<template>
<div id="block">
  <template v-if="mode==='select-model'">
    <div class="current-test-data-info">
      {{$t('intent_engine.side_panel.do_intent_test.current_test_corpus_info', {inum: testIntentCount, cnum: testCorpusCounts})}}
    </div>
    <div class="label">
      {{`${$t('intent_engine.side_panel.do_intent_test.select_label')}：`}}
    </div>
    <div class="table-container">
      <general-scroll-table class="table"
        :tableData="selectTableData"
        :tableHeader="selectTableHeader"
        :action="selectTableAction"
        :onclickRow="selectModel"
        showEmpty>
      </general-scroll-table>  
    </div>
  </template>
  <template v-if="mode==='show-diff'">
    <div class="current-test-data-info">
      {{diffInfo}}
    </div>
    <div class="label">
      {{`${$t('intent_engine.side_panel.do_intent_test.diff_label')}：`}}
    </div>
    <div class="table-container">
      <general-scroll-table class="table"
        :tableData="diffTableData"
        :tableHeader="diffTableHeader"
        :action="diffTableAction"
        showEmpty
        columnBoder>
      </general-scroll-table>  
    </div>
  </template>
</div>
</template>
<script>
import GeneralScrollTable from '@/components/GeneralScrollTable/GeneralScrollTable';
import SelectTableShowDiffLink from './_tableColumn/SelectTableShowDiffLink';

export default {
  components: {
    GeneralScrollTable,
  },
  props: {
    extData: {
      type: Object,
      required: true,
    },
  },
  data() {
    const selectTableHeader = [
      {
        key: 'check',
        text: '',
        width: '80px',
        type: 'icon',
        default: true,
      },
      {
        key: 'model',
        text: this.$t('intent_engine.side_panel.do_intent_test.intent_model_header'),
        width: '440px',
        default: true,
      },
      {
        key: 'testCorpus',
        text: this.$t('intent_engine.side_panel.do_intent_test.test_corpus_header'),
        width: '160px',
        type: 'custom',
        default: true,
      },
    ];
    return {
      models: [],
      selectedModel: undefined,
      compareDiffModel: undefined,
      testIntentCount: 0,
      testCorpusCounts: 0,
      selectTableHeader,
      selectTableData: [],
      selectTableAction: [],
      diffTableData: [],
      diffTableAction: [],
      mode: 'select-model', // select-model / show-diff
      checkIcon: {
        iconType: 'check_green',
        iconSize: 20,
      },
    };
  },
  computed: {
    diffInfo() {
      return this.$t(
        'intent_engine.side_panel.do_intent_test.diff_info',
        {
          t_inum: this.testIntentCount,
          t_cnum: this.testCorpusCounts,
          model: this.selectedModel.trainDatetimeStr,
          m_inum: this.selectedModel.intents_count,
          m_cnum: this.selectedModel.sentences_count,
        },
      );
    },
    diffTableHeader() {
      return [
        {
          key: 'model',
          text: this.$t('intent_engine.side_panel.do_intent_test.model_diff_header', {
            model: this.compareDiffModel.trainDatetimeStr,
            inum: this.compareDiffModel.diffs.intents.length,
          }),
          width: '340px',
          default: true,
        },
        {
          key: 'test',
          text: this.$t('intent_engine.side_panel.do_intent_test.test_diff_header', {
            inum: this.compareDiffModel.diffs.test_intents.length,
          }),
          width: '340px',
          default: true,
        },
      ];
    },
  },
  watch: {
  },
  methods: {
    renderSelectTableData() {
      // console.log(this.extData.models);
      this.models = this.extData.models;
      this.testIntentCount = this.extData.testIntentCount;
      this.testCorpusCounts = this.extData.testCorpusCounts;
      this.selectTableData = this.models.map((model, index) => {
        const rtn = {
          ...model,
          check: this.composeCheckIcon(index),
          model: this.composeModelInfo(model),
          testCorpus: this.composeDiffLink(model),
        };
        return rtn;
      });
      this.selectedModel = this.selectTableData[0] || undefined;
    },
    composeCheckIcon(index) {
      if (index === 0) {
        return this.checkIcon;
      }
      return undefined;
    },
    composeModelInfo(model) {
      const info = this.$t('intent_engine.side_panel.do_intent_test.model_statistics', { inum: model.intents_count, cnum: model.sentences_count });
      return `${model.trainDatetimeStr} (${info})`;
    },
    composeDiffLink(model) {
      const link = { ...SelectTableShowDiffLink };
      let text;
      if (model.diffs_count === 0) {
        text = this.$t('intent_engine.side_panel.do_intent_test.no_diff');
      } else {
        text = this.$t('intent_engine.side_panel.do_intent_test.check_diffs', { inum: model.diffs_count });
      }
      const that = this;
      link.data = () => ({
        linkData: {
          diffCount: model.diffs_count,
          text,
          onclick: () => {
            that.showDiff(model);
          },
        },
      });
      return link;
    },
    selectModel(newModel) {
      if (this.mode === 'show-diff') {
        return;
      }
      this.selectedModel = newModel;
      this.selectTableData = this.selectTableData.map((modelData) => {
        if (modelData.ie_model_id === newModel.ie_model_id) {
          modelData.check = this.checkIcon;
        } else {
          modelData.check = undefined;
        }
        return modelData;
      });
    },
    showDiff(model) {
      this.compareDiffModel = model;
      this.diffTableData = [];
      const rowNum = Math.max(model.diffs.intents.length, model.diffs.test_intents.length);
      for (let i = 0; i < rowNum; i += 1) {
        const modelIntent = model.diffs.intents[i];
        const testIntent = model.diffs.test_intents[i];
        const data = {
          model: modelIntent || '',
          test: testIntent || '',
        };
        this.diffTableData.push(data);
      }
      this.toMode('show-diff');
    },
    toMode(mode) {
      if (mode === 'select-model') {
        this.$emit('changeOKMsg', this.$t('general.ok'));
      } else if (mode === 'show-diff') {
        this.$emit('changeOKMsg', this.$t('general.go_back'));
      }
      this.mode = mode;
    },
    validate() {
      if (this.mode === 'show-diff') {
        this.toMode('select-model');
        return;
      }
      if (this.selectedModel) {
        this.$emit('validateSuccess', this.selectedModel.ie_model_id);
      }
    },
  },
  mounted() {
    this.renderSelectTableData();
    this.$on('validate', this.validate);
  },
};
</script>
<style lang="scss" scoped>

#block {
  display: flex;
  flex-direction: column;
  width: 680px;
  height: 400px;
  border-top: solid 1px $color-borderline-disabled;
  @include font-14px-line-height-28px();
  .current-test-data-info{
    flex: 0 0 auto;
    margin: 10px 20px 0px 20px;
    color: $color-font-active;
  }
  .label{
    flex: 0 0 auto;
    margin: 20px 20px 0px 20px;
    color: $color-font-normal;
  }
  .table-container{
    flex: 0 0 auto;
    margin: 12px 0px 0px 0px;
    .table{
      height: 300px;
    }
  }
}
</style>