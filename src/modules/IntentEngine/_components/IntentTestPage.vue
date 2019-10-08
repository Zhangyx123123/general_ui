<template>
<div id="intent-test-page" class="card w-fill h-fill">
  <div class="header">
    <div class="breadcrumb">
      <div class="header-title" @click="goToPage(-1)" style="cursor: pointer;">
        {{ $t('pages.intent_engine.intent_manage') }}
      </div>
      <icon iconType="month_right" :size="18" style="margin: 0px 10px;"></icon>
      <div class="header-title">
        {{ $t('intent_engine.test_records.intent_test_data') }}
      </div>
    </div>
    <div class="right-align-header">
      <search-input v-model="searchKeyword" @focus="inSearchIntentMode"></search-input>
      <text-button class="return-button" @click="goToPage(-1)">{{ $t('general.go_back') }}</text-button>
    </div>
  </div>
  <div class="body">
    <div class="content">
      <div class="content-tool">
        <div class="content-tool-left">
          <text-button v-if="canImport"
            :button-type="allowImport ? 'default' : 'disable'"
            @click="importIntentTestList()">
            {{ $t('general.import') }}
          </text-button>
          <text-button v-if="canExport"
            :button-type="allowExport ? 'default' : 'disable'"
            @click="exportIntentTestList()">
            {{ $t('general.export') }}
          </text-button>
          <div class="intent-count-label">
            {{ $t('intent_engine.test_data.intent_num', {inum: intentList.length, cnum: corpusCounts}) }}
          </div>
        </div>
        <div class="content-tool-right">
          <div class="view-option-btn" ref="viewOptionsBtn" v-dropdown="viewOptions">
            <text-button
              :width="'64px'"
              :height="'28px'"
              :icon-type="'header_dropdown_gray'"
              :iconAlign="'right'"
              :icon-size="10">
              {{ $t('intent_engine.test_data.show_button') }}
            </text-button>
          </div>
        </div>
      </div>
      <template v-if="corpusGroupsWithoutIntent.length > 0">
        <div class="intent-list-title">
          {{ $t('intent_engine.test_data.test_corpus_without_intent') }}
          <icon iconType="info" :size="16" enableHover v-tooltip="withoutIntentTooltip"></icon>
        </div>
      </template>
        <intent-test-list class="intent-list"
          ref="corpusGroupsWithoutIntent"
          :initialIntentList="corpusGroupsWithoutIntent"
          :intentListType="'withoutIntent'"
          :showEditResult="showResult"
          :showSmallTestCorpusOnly="showSmallTestCorpusOnly"
          :keyword="searchKeyword"
          @update="setCorpusGroupsWithoutIntent($event)">
        </intent-test-list>
      <template v-if="intentList.length > 0">
        <div class="intent-list-title" :class="{'margin-top': corpusGroupsWithoutIntent.length > 0}">
          {{ $t('intent_engine.test_data.intent_and_test_corpus') }}
          <!-- <icon iconType="info" :size="16" enableHover v-tooltip="intentListTooltip"></icon> -->
        </div>
        <div class="closable-intro" v-if="showClosableIntro">
          {{ $t('intent_engine.test_data.intent_and_test_corpus_tooltip') }}
          <icon class="close-intro" iconType="info_close" :size="18" @click="closeTestCorpusIntro()"></icon>
        </div>
      </template>
        <intent-test-list class="intent-list"
          ref="intentList"
          :initialIntentList="intentList"
          :intentListType="'withIntent'"
          :showEditResult="showResult"
          :showSmallTestCorpusOnly="showSmallTestCorpusOnly"
          :keyword="searchKeyword"
          @update="setIntentList($event)">
        </intent-test-list>
    </div>
    <side-panel clase="side-panel" :mode="'testPage'"></side-panel>
  </div>
</div>
</template>
<script>

import { createNamespacedHelpers } from 'vuex';
import event from '@/utils/js/event';
import IntentTestList from './IntentTestList';
import SidePanel from './SidePanel';
import ImportIntentTestPop from './ImportIntentTestPop';
import api from '../_api/intentTest';
import eventBus from '../_utils/eventBus';
import DropdownMenuCheckBox from './_tableColumn/DropdownMenuCheckBox';

const { mapState, mapGetters, mapMutations } = createNamespacedHelpers('intentTest-module');

export default {
  name: 'intent-test-page',
  privCode: 'intent_manage',
  api,
  components: {
    IntentTestList,
    SidePanel,
    ImportIntentTestPop,
  },
  props: {
  },
  data() {
    return {
      searchKeyword: '',
      keywordTimer: undefined,
      keywordTimerDelay: 1000, // ms
      searchIntentMode: false,
      eventBus: eventBus.eventBus,
      showClosableIntro: false,
      showResult: true,
      showSmallTestCorpusOnly: false,
      optionSelectStyle: {
        height: '28px',
        'border-radius': '2px',
      },
      withoutIntentTooltip: {
        msg: this.$t('intent_engine.test_data.test_corpus_without_intent_tooltip'),
      },
      intentListTooltip: {
        msg: this.$t('intent_engine.test_data.intent_and_test_corpus_tooltip'),
      },
      defaultViewOptions: {
        options: [],
        alignLeft: true,
        globalFix: false,
        width: '200px',
        optionType: 'custom',
        hideAfterOptionClicked: false,
      },
    };
  },
  computed: {
    ...mapState([
      'allIntents',
      'intentList',
      'corpusGroupsWithoutIntent',
    ]),
    ...mapGetters([
      'corpusCounts',
    ]),
    canImport() {
      return this.$hasRight('import');
    },
    canExport() {
      return this.$hasRight('export');
    },
    allowImport() {
      // return !this.isTraining && !this.fetchStatusError;
      return true;
    },
    allowExport() {
      // return !this.versionNotAvailable && this.hasIntents &&
      //   !this.isTraining && !this.fetchStatusError;
      return true;
    },
    viewOptions() {
      const viewOptions = { ...this.defaultViewOptions };
      viewOptions.options = [
        {
          text: this.$t('intent_engine.test_data.show_small_test_corpus_only', { num: 3 }),
          checked: this.showSmallTestCorpusOnly,
          onclick: () => {
            this.showSmallTestCorpusOnly = !this.showSmallTestCorpusOnly;
          },
          component: { ...DropdownMenuCheckBox },
        },
        {
          text: this.$t('intent_engine.test_data.show_result'),
          checked: this.showResult,
          onclick: () => {
            this.showResult = !this.showResult;
          },
          component: { ...DropdownMenuCheckBox },
        },
      ];
      return viewOptions;
    },
  },
  watch: {
    viewOptions() {
      this.$refs.viewOptionsBtn.dispatchEvent(event.createCustomEvent('dropdown-reload', this.viewOptions));
      // this.$refs.viewOptionsBtn.dispatchEvent(event.createEvent('dropdown-show'));
    },
    searchKeyword() {
      this.clearKeywordTimer();
      this.keywordTimer = setTimeout(
        () => { this.getTestIntents(); },
        this.keywordTimerDelay,
      );
    },
  },
  methods: {
    ...mapMutations([
      'setAllIntents',
      'setIntentList',
      'setCorpusGroupsWithoutIntent',
    ]),
    getTestIntents() {
      this.eventBus.$emit('startLoading');
      this.$api.getTestIntents(this.searchKeyword).then((data) => {
        this.updateAllIntents(data);
        // console.log(this.allIntents);
      }).catch((err) => {
        console.log(err);
      })
      .finally(() => {
        this.eventBus.$emit('endLoading');
      });
    },
    updateAllIntents(intents) {
      this.setAllIntents(intents);
      const intentList = [];
      const corpusGroupsWithoutIntent = [];
      this.allIntents.forEach((intent) => {
        if (intent.type === true) {
          intentList.push(intent);
        } else {
          corpusGroupsWithoutIntent.push(intent);
        }
      });
      this.setIntentList(intentList);
      this.$refs.intentList.$emit('renderIntentTestList', this.intentList);
      this.setCorpusGroupsWithoutIntent(corpusGroupsWithoutIntent);
      this.$refs.corpusGroupsWithoutIntent.$emit('renderIntentTestList', this.corpusGroupsWithoutIntent);
    },
    inSearchIntentMode(bool) {
      this.searchIntentMode = bool;
    },
    toPage(path) {
      this.$router.push(`/intent-manage/${path}`);
    },
    goToPage(steps) {
      this.$router.go(steps);
    },
    exportIntentTestList() {
      if (!this.allowExport) return;
      this.$api.exportIntentTestCorpus();
    },
    importIntentTestList() {
      if (!this.allowImport) return;
      const that = this;
      const popOption = {
        title: that.$t('intent_engine.import.test_data.title'),
        component: ImportIntentTestPop,
        disable_ok: true,
        validate: true,
        callback: {
          ok(file) {
            that.eventBus.$emit('startLoading');
            that.$api.importIntentTestCorpus(file).then(() => {
              that.getTestIntents();
              that.$notify({ text: that.$t('intent_engine.import.test_data.success') });
            }).catch((err) => {
              console.log(err);
              that.$notifyFail(that.$t('intent_engine.import.test_data.fail'));
            }).finally(() => {
              that.eventBus.$emit('endLoading');
            });
          },
        },
      };
      this.$pop(popOption);
    },
    closeTestCorpusIntro() {
      this.showClosableIntro = false;
    },
    clearKeywordTimer() {
      if (this.keywordTimer) {
        clearTimeout(this.keywordTimer);
      }
      this.keywordTimer = undefined;
    },
  },
  mounted() {
    this.getTestIntents();
  },
  beforeDestroy() {
    this.clearKeywordTimer();
  },
};
</script>

<style lang="scss" scoped>
#intent-test-page{
  display: flex;
  flex-direction: column;
  overflow-x: scroll;
  @include customScrollbar();
  .header {
    flex: 0 0 auto;
    min-width: 900px;
    height: 60px;
    padding: 0 20px;
    border-bottom: 1px solid $color-borderline-disabled;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .breadcrumb{
      display: flex;
      align-items: center;
      .header-title {
        @include font-16px();
        color: $color-font-active;
        min-width: 64px;
      }
    }
    .right-align-header{
      display: flex;
      align-items: center;
      .return-button{
        margin-left: 10px;
      }
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
          .text-button {
            margin-left: 10px;
            &:first-child {
              margin-left: 0px;
            }
          }
          .intent-count-label {
            flex: 1 1 auto;
            color: $color-font-mark;
            @include font-14px-line-height-28px();
            margin-left: 20px;
          }
        }
      }
      .intent-list-title{
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        color: $color-font-active;
        @include font-14px-line-height-28px();
        &.margin-top{
          margin-top: 20px;
        }
        .icon {
          margin-left: 6px;
        }
      }
      .closable-intro{
        position: relative;
        flex: 0 0 auto;
        margin: 10px 0px 10px 0px;
        padding: 10px 40px 10px 10px;
        background-color: #f8f8f8;
        border-radius: 4px;
        color: $color-font-normal;
        @include font-14px();
        .close-intro{
          position: absolute;
          right: 10px;
          top: 10px;
          &:hover {
            cursor: pointer;
          }
        }
      }
      .intent-list{
        flex: 0 0 auto;
      }
    }
    .side-panel{
      flex: 0 0 auto;
      width: 270px;
    }
  }
}
</style>
