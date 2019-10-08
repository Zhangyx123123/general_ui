<template>
<div id="intent-train-page" class="card w-fill h-fill">
  <div class="header">
    <div class="header-title">
      {{ $t('pages.intent_engine.intent_manage') }}
    </div>
    <div class="right-align-header">
      <search-input v-model="searchKeyword" @focus="inSearchIntentMode"></search-input>
    </div>
  </div>
  <div class="body">
    <div class="content">
      <div class="content-tool">
        <div class="content-tool-left">
          <text-button v-if="canAdd" :button-type="allowAdd ? 'primary' : 'disable'" @click="addIntent">{{ $t('intent_engine.manage.add_intent') }}</text-button>
          <text-button v-if="canEdit && showBatchDelete" :button-type="allowEdit ? 'error' : 'disable'" @click="deleteIntents">{{ $t('intent_engine.manage.delete_intents') }}</text-button>
          <text-button v-if="canImport" :button-type="allowImport ? 'default' : 'disable'" @click="importIntentList">{{ $t('general.import') }}</text-button>
          <text-button v-if="canExport" :button-type="allowExport ? 'default' : 'disable'" @click="exportIntentList(currentVersion)">{{ $t('general.export') }}</text-button>
          <div class="intent-count-label">
            {{ $t('intent_engine.manage.intent_num', {inum: intentList.length, cnum: corpusCounts}) }}
          </div>
        </div>
        <div v-if="!hasIntents" class="content-tool-right">
          <text-button @click="downloadTemplate">{{ $t('intent_engine.import.download_template') }}</text-button>
        </div>
      </div>
      <div v-if="!hasIntents && !isAddIntent" class="init_page">
        {{ $t('intent_engine.manage.no_data.title') }}<br>
        {{ $t('intent_engine.manage.no_data.hint_left') }}<br>
        {{ $t('intent_engine.manage.no_data.hint_right') }}
      </div>
      <div v-else-if="hasIntents || isAddIntent">
        <intent-list
          :intentList="intentList"
          :canEditIntent="canEdit && allowEdit"
          :canDeleteIntent="canEdit && allowEdit"
          :addIntentMode="isAddIntent"
          :searchIntentMode="searchIntentMode"
          :searchIntentWithKeyword="isSearchKeyword"
          :keyword="searchKeyword"
          @addIntentDone="finishAddIntent($event)"
          @deleteIntentDone="refreshIntentPage()"
          @cancelSearch="inSearchIntentMode(false)"
          @checkedIntent="handleIntentChecked"
          ref="intents">
        </intent-list>
      </div>
    </div>
    <side-panel clase="side-panel" :mode="'trainPage'"></side-panel>
  </div>
</div>
</template>

<script>
import { mapGetters as rootMapGetters, createNamespacedHelpers } from 'vuex';
import api from '../_api/intent';
import SidePanel from './SidePanel';
import IntentList from './IntentList';
import ImportIntentPop from './ImportIntentPop';
import eventBus from '../_utils/eventBus';

const { mapState, mapGetters, mapMutations } = createNamespacedHelpers('intentTrain-module');

export default {
  name: 'intent-train-page',
  api,
  privCode: 'intent_manage',
  components: {
    SidePanel,
    IntentList,
  },
  props: {},
  data() {
    return {
      fetchStatusError: false,
      trainStatus: undefined,  // 'TRAINED', 'NOT_TRAINED', 'TRAINING'
      trainBtnClicked: false,
      searchKeyword: '',
      searchIntentMode: false,
      keywordTimer: null,
      keywordDelay: 1000, // ms

      isAddIntent: false,
      isSearchKeyword: false,    // call search api with keyword or not
      corpusCounts: 0,
      currentVersion: '',
      trainButtonTooltip: {
        msg: this.$t('intent_engine.manage.train_button_tooltip'),
        alignLeft: true,
      },
      trainingProgress: 50,
      lastTrainedTime: '',
      pageInfoTooltip: {
        msg: this.$t('intent_engine.manage.tooltip.page_info'),
      },
      showBatchDelete: false,
      eventBus: eventBus.eventBus,
    };
  },
  computed: {
    ...rootMapGetters([
      'robotID',
    ]),
    ...mapState([
      'intentList',
    ]),
    ...mapGetters([
      'hasIntents',
    ]),
    versionNotAvailable() {
      return !this.hasIntents && this.currentVersion === '';
    },
    canImport() {
      return this.$hasRight('import');
    },
    canExport() {
      return this.$hasRight('export');
    },
    allowImport() {
      return !this.isTraining && !this.fetchStatusError;
    },
    allowExport() {
      return !this.versionNotAvailable && this.hasIntents &&
        !this.isTraining && !this.fetchStatusError;
    },
    canEdit() {
      return this.$hasRight('edit') && !this.versionNotAvailable;
    },
    canAdd() {
      return this.$hasRight('edit');
    },
    allowEdit() {
      return !this.isTraining;
    },
    allowAdd() {
      return !this.isTraining && !this.fetchStatusError;
    },
    allowLoadPage() {
      return !this.fetchStatusError;
    },
    isTraining() {
      return this.trainStatus === 'TRAINING';
    },
  },
  watch: {
    intentList() {
      const that = this;
      that.corpusCounts = that.intentList.reduce((acc, intent) => acc + intent.total, 0);
    },
    searchKeyword() {
      this.clearKeywordTimer();
      this.keywordTimer = setTimeout(
        () => { this.refreshIntentPage(); },
        this.keywordDelay,
      );
    },
  },
  methods: {
    ...mapMutations([
      'setIntentList',
    ]),
    downloadTemplate() {
      window.open('/Files/intent_template.xlsx', '_blank');
    },
    addIntent() {
      if (!this.allowAdd) return;
      this.isAddIntent = true;
      this.searchKeyword = '';
    },
    deleteIntents() {
      const that = this;
      const deleteIDs = that.$refs.intents.getCheckedIntentIDs();
      this.eventBus.$emit('startLoading');
      that.$api.deleteIntents(deleteIDs).then(() => {
        that.$notify({ text: that.$t('intent_engine.manage.notify.delete_intent_success') });
      })
      .catch((err) => {
        console.log(err);
        that.$notifyFail(that.$t('intent_engine.manage.notify.delete_intent_fail'));
      })
      .finally(() => {
        that.eventBus.$emit('endLoading');
        that.refreshIntentPage();
      });
    },
    handleIntentChecked() {
      const deleteIDs = this.$refs.intents.getCheckedIntentIDs();
      if (deleteIDs.length > 0) {
        this.showBatchDelete = true;
      } else {
        this.showBatchDelete = false;
      }
    },
    finishAddIntent(done) {
      this.isAddIntent = false;
      if (done) {
        this.refreshIntentPage();
      }
    },
    inSearchIntentMode(bool) {
      this.searchIntentMode = bool;
    },
    exportIntentList(version) {
      if (!this.allowExport) return;
      const EXPORT_INTENT_URL = 'api/v2/intents/export';
      if (version) {
        window.open(`${EXPORT_INTENT_URL}?version=${version}`);
      } else {
        window.open(`${EXPORT_INTENT_URL}?appid=${this.robotID}`);
      }
    },
    importIntentList() {
      const that = this;
      if (!that.allowImport) return;

      const popOption = {
        title: that.$t('intent_engine.import.title'),
        component: ImportIntentPop,
        disable_ok: true,
        validate: true,
        callback: {
          ok(file) {
            that.eventBus.$emit('startLoading');
            that.$api.importIntents(file)
            .then((res) => {
              that.currentVersion = res.version;
              that.refreshIntentPage();
              that.$notify({ text: that.$t('intent_engine.import.success') });
            })
            .catch((err) => {
              console.log(err);
              that.$notifyFail(that.$t('intent_engine.import.fail'));
            })
            .finally(() => {
              that.eventBus.$emit('endLoading');
            });
          },
        },
      };
      that.$pop(popOption);
    },
    refreshIntentPage() {
      const that = this;
      if (!this.allowLoadPage) return;
      this.eventBus.$emit('startLoading');
      // that.$api.getIntents()
      that.$api.getIntentsDetail(that.searchKeyword)
      .then((intents) => {
        that.isSearchKeyword = that.searchKeyword !== '';

        const intentList = [];
        intents.forEach((intent) => {
          intentList.push({
            id: intent.id,
            name: intent.name,
            total: intent.count,
            positiveCount: intent.positive_count,
            negativeCount: intent.negative_count,
          });
        });
        this.setIntentList(intentList);
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status < 500) {
          if (err.response.status === 404) {
            that.$notifyFail(that.$t('intent_engine.version_not_exist'));
          } else {
            that.$notifyFail(that.$t('http_status.400'));
          }
        }
      })
      .finally(() => {
        this.eventBus.$emit('endLoading');
      });
    },
    clearKeywordTimer() {
      if (this.keywordTimer) {
        clearTimeout(this.keywordTimer);
      }
      this.keywordTimer = undefined;
    },
  },
  mounted() {
    this.eventBus.$emit('startLoading');
    this.refreshIntentPage();
  },
  beforeDestroy() {
    this.clearKeywordTimer();
  },
};
</script>

<style lang="scss" scoped>
#intent-train-page{
  display: flex;
  flex-direction: column;
  overflow-x: scroll;
  @include customScrollbar();
  .header {
    flex: 0 0 auto;
    height: 60px;
    min-width: 900px;
    padding: 0 20px;
    border-bottom: 1px solid $color-borderline-disabled;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .header-title {
      @include font-16px();
      color: $color-font-active;
      min-width: 64px;
    }
    .right-align-header{
      display: flex;
      align-items: center;
    }
  }
  .body{
    flex: 1 1 auto;
    display: flex;
    flex-direction: row;
    min-width: 900px;
    min-height: 540px;
    height: calc(100% - 60px);
    .content{
      flex: 1 1 auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      overflow-y: scroll;
      @include customScrollbar();
      .content-tool {
        flex: 0 0 auto;
        margin-bottom: 20px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        .content-tool-left{
          display: flex;
          flex-direction: row;
          align-items: center;
          .text-button {
            margin-left: 10px;
            &:first-child {
              margin-left: 0px;
            }
          }
          .intent-count-label {
            @include font-14px();
            color: $color-font-mark;
            flex: 1;
            margin-left: 20px;
          }
        }
      }
      .intent-list {
        flex: 1 1 auto;
      }
      .init_page {
        @include font-14px();
        color: $color-font-disabled;
        flex: 1 1 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
    }
    .side-panel{
      flex: 0 0 auto;
      width: 270px;
    }
  }
}
</style>
