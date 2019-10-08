<template>
  <div id="qa-list-page">
    <div class="qa-list-page-content" style="height: 100%; min-width: 1080px;">
      <qa-selectors class="qalist-query-operations" ref="selector"></qa-selectors>
      <div class="qalist-display">
        <div id="qa-category">
      	  <qa-category 
            v-on:categoryChanged="handleCategoryChanged" 
            v-on:categoryChangedDone="handleCategoryChangedDone"
            ref="category" 
            v-on:itemClicked="handleTreeItemClicked">
          </qa-category>
        </div>
    	  <div id="qa-table">
    	  	<qa-table ref="qaTable" :tableData="rawData"></qa-table>
    	  </div> 
      </div>
    </div>
    <div style="display:none;"> {{ doQuery }} </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import Vue from 'vue';
import tagAPI from '@/api/tagType';
import qaAPI from './_api/qalist';
import labelAPI from './_api/qalabel';
import QASelectors from './_components/QASelectors';
import QACategory from './_components/QACategory';
import QATable from './_components/QATable';
import QAUpdatePop from './_components/QAUpdatePop';
import qaListUtil from './_store/QAListUtil';

Vue.component('qa-selectors', QASelectors);
Vue.component('qa-category', QACategory);
Vue.component('qa-table', QATable);

export default {
  path: 'qalist',
  privCode: 'qalist',
  displayNameKey: 'qalist',
  icon: 'white_SQ',
  data() {
    return {
      requestLock: false,
      rawData: [],
      loading: true,
      checkingTimer: null,
    };
  },
  api: [qaAPI, tagAPI],
  computed: {
    ...mapGetters([
      'doQueryState',
      'searchCategoryID',
      'curPage',
      'qaQueryOptions',
      'qaQueryDimension',
    ]),
    doQuery() {
      if (this.doQueryState) {
        this.refreshQAList();
      }
      this.setDoQuery(false);
      return '';
    },
  },
  mounted() {
    // register event listener
    const that = this;
    that.bindEvent();
    that.resetSearchOptions();
    const queryOptions = {
      num: 1,
      action: 'full_import',
      status: 'running',
    };
    that.$api.getTagTypes().then((data) => {
      that.setTagTypes(data);
    })
    .then(() => that.$api.queryOperations(queryOptions))
    .then((data) => {
      if (data.records && data.records.length > 0) {
          // someone is importing
        that.showFileImporting();
        that.pollingServerImportStatus(data.records[0].stateId);
      } else {
        that.loading = false;
        that.$emit('endLoading');
        that.queryQA();
      }
    })
    .catch(that.handleError.bind(that));
  },
  updated() {
    this.$refs.qaTable.setPageIndex(this.curPage);
  },
  beforeDestroy() {
    if (this.checkingTimer) {
      clearTimeout(this.checkingTimer);
    }
    this.unBindEvent();
  },
  methods: {
    ...mapMutations({
      setDoQuery: 'doQuery',
      setTagTypes: 'setTagTypes',
      setQAQueryOptions: 'setQAQueryOptions',
    }),
    resetSearchOptions() {
      const defaultOption = qaListUtil.genDefaultQueryOptions();
      this.setQAQueryOptions(defaultOption);
    },
    bindEvent() {
      // bind event
      this.$root.$on('QATable::pageChanged', this.hanldePageChanged);
      this.$root.$on('QATable::rowDeleted', this.handleRowDeleted);
      this.$root.$on('QATable::SQUpdated', this.queryQA);
      this.$root.$on('QASelector::deleteQuestions', this.deleteQuestions);
      this.$root.$on('QASelector::addQuestion', this.addQuestion);
      this.$root.$on('QASelector::doQuery', this.queryQA);
      this.$root.$on('QASelector::fileimported', this.handleFileImported);
      this.$root.$on('QASelector::fileimportStart', this.showFileUploading);
      this.$root.$on('QASelector::fileimportUploaded', this.showFileImporting);
      this.$root.$on('QASelector::fileimportFailed', this.hideLoading);

      this.$root.$on('QAList::loading', this.showLoading);
      this.$root.$on('QAList::loaded', this.hideLoading);
    },
    unBindEvent() {
      // unbind event
      this.$root.$off('QATable::pageChanged', this.hanldePageChanged);
      this.$root.$off('QATable::rowDeleted', this.handleRowDeleted);
      this.$root.$off('QATable::SQUpdated', this.queryQA);
      this.$root.$off('QASelector::deleteQuestions', this.deleteQuestions);
      this.$root.$off('QASelector::addQuestion', this.addQuestion);
      this.$root.$off('QASelector::doQuery', this.queryQA);
      this.$root.$off('QASelector::fileimported', this.handleFileImported);
      this.$root.$off('QASelector::fileimportStart', this.showFileUploading);
      this.$root.$off('QASelector::fileimportUploaded', this.showFileImporting);
      this.$root.$off('QASelector::fileimportFailed', this.hideLoading);

      this.$root.$off('QAList::loading', this.showLoading);
      this.$root.$off('QAList::loaded', this.hideLoading);
    },
    showLoading() {
      this.loading = true;
      this.$startPageLoading();
    },
    hideLoading() {
      this.loading = false;
      this.$endPageLoading();
    },
    handleFileImported() {
      // reset search options
      this.resetSearchOptions();

      this.loading = false;
      this.$endPageLoading();
      this.refreshQAList();
    },
    showFileUploading() {
      this.loading = true;
      this.$startPageLoading(this.$t('qalist.in_uploading'));
    },
    showFileImporting() {
      // in FQA import status
      this.loading = true;
      this.$startPageLoading(this.$t('qalist.import_success'));
    },
    showImportError(msg, id) {
      const that = this;
      const option = {
        data: {
          msg,
          id,
        },
        ok_msg: this.$t('qalist.export_file'),
        cancel_msg: that.$t('general.close'),
        callback: {
          ok: () => { that.$api.downloadFile(id); },
        },
      };
      that.$popCheck(option);
    },
    pollingServerImportStatus(id) {
      this.$api.queryOperationProgress(id).then((data) => {
        if (data.status === 'running') {
          this.checkingTimer = setTimeout(() => {
            this.pollingServerImportStatus.bind(this)(id);
          }, 2000);
        } else if (data.status === 'success') {
          this.refreshQAList();
          this.checkingTimer = null;
        } else { // fail
          const defaultMsg = this.$t('qalist.import_fail_msg');
          const errMsg = (data.extraInfo.indexOf('问答库模板') > -1) ? data.extraInfo : defaultMsg;

          this.showImportError(errMsg, id);
          this.hideLoading();
          this.refreshQAList();
        }
      }).catch(this.handleError.bind(this));
    },
    handleCategoryChanged() {
      this.loading = true;
      this.$startPageLoading();
    },
    handleCategoryChangedDone() {
      this.loading = false;
      this.$endPageLoading();
      this.refreshQAList();
    },
    deleteQuestions() {
      const that = this;
      if (!that.$refs.qaTable) {
        return;
      }
      const selectedQuestions = that.$refs.qaTable.getSelectedQuestions();
      if (selectedQuestions.length > 0) {
        that.$refs.qaTable.deleteSelectedQuestions();
      } else {
        const options = {
          data: {
            msg: that.$t('qalist.not_select_any_question'),
          },
          buttons: ['ok'],
        };
        that.$popCheck(options);
        // that.$root.$emit('showWindow', options);
      }
    },
    handleRowDeleted() {
      this.$refs.qaTable.unSetAllSelect();
      this.queryQA();
    },
    handleTreeItemClicked(categoryID) {
      const updateOptions = qaListUtil.genDefaultQueryOptions();
      updateOptions.category_id = categoryID;
      this.setQAQueryOptions(updateOptions);
      this.$refs.selector.reset();
      this.queryQA();
    },
    hanldePageChanged(pageIndex) {
      this.setQAQueryOptions({ cur_page: pageIndex - 1 });
      this.queryQA();
    },
    requestAddQuestion(q) {
      q.answer_json = JSON.stringify(q.answer_json);
      return this.$api.createQuestion(q).then(() => {
        this.queryQA();
        return this.$api.activeQA();
      });
    },
    addQuestion() {
      const that = this;
      this.$pop({
      // this.$root.$emit('showWindow', {
        component: QAUpdatePop,
        ok_msg: that.$t('general.save'),
        cancel_msg: that.$t('general.cancel'),
        data: {
          categoryid: this.searchCategoryID,
        },
        callback: {
          ok: (question) => {
            this.requestAddQuestion(question);
          },
        },
        validate: true,
      });
    },
    handleError() {
      this.loading = false;
      this.$endPageLoading();
      // const that = this;
      // general.handleAPIError(that, error).catch(() => {
      //   that.showLoadingFailPop();
      //   console.log(error);
      // });
    },
    showLoadingFailPop() {
      // show loading failed message
      const that = this;
      that.loading = false;
      that.$emit('endLoading');
      const warningOptions = {
        buttons: ['ok'],
        data: {
          msg: that.$t('qalist.qa_loading_failed_msg'),
        },
      };
      that.$popCheck(warningOptions);
      // that.$root.$emit('showWindow', warningOptions);
    },
    queryQA() {
      const that = this;
      if (!that.loading) {
        that.loading = true;
        that.$startPageLoading();
        const options = JSON.parse(JSON.stringify(that.qaQueryOptions));
        options.dimension = JSON.stringify(that.qaQueryDimension);

        const labels = {};

        return labelAPI.loadLabels.bind(this)().then((data) => {
          data.forEach((d) => {
            labels[d.id] = d.name;
          });
          return that.$api.filterQuestions(that.qaQueryOptions);
        }).then((data) => {
          data.content.forEach((q) => {
            q.answers.forEach((a) => {
              a.labelName = labels[a.label];
            });
          });
          that.rawData = data;
          that.loading = false;
          that.$emit('endLoading');
        }).catch(that.handleError.bind(that));
      }
      return Promise.resolve(null);
    },
    refreshQAList() {
      this.loading = false;
      this.$endPageLoading();
      this.queryQA().then(() => {
        this.loading = true;
        this.$startPageLoading();
        return this.$refs.category.updateCategory();
      }).then(() => {
        this.loading = false;
        this.$endPageLoading();
      }).catch(this.handleError.bind(this));
    },
  },
  beforeRouteLeave(to, from, next) {
    // hide all context menu before leave this page;
    this.$hideContextMenu();
    next();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
div {
  display: inline-block;
}
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  display: inline-block;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

$fill-parent: 100%;

#qalist-display {
  width: $fill-parent;
  height: 80%;
}

#qa-table {
  vertical-align: top;
}

#qa-category {
  width: 200px;
  // height: $fill-parent;
  margin-right: 30px;
}
  
#qa-table {
  width: calc(100% - 260px);
  height: $fill-parent;
  display: inline-block;
}

.qa-list-page-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  .qalist-query-operations {
    flex: 0 0 auto;
  }
  .qalist-display {
    flex: 1;
    display: flex;
    align-items: stretch;
  }
}
</style>
