<template>
<div id="intent-test-record-page" class="card w-fill h-fill">
  <div class="header">
    <div class="breadcrumb">
      <div class="header-title" @click="goToPage(-1)" style="cursor: pointer;">
        {{ $t('intent_engine.test_records.intent_test_record') }}
      </div>
      <icon iconType="month_right" :size="18" style="margin: 0px 10px;"></icon>
      <div class="header-title" v-if="record.saved">
        {{ `${record.name} ( ${$t('intent_engine.test_records.test_record')} ${recordVersion})` }}
      </div>
      <div class="header-title" v-if="!record.saved">
        {{ `${$t('intent_engine.test_records.test_record')} ${recordVersion}` }}
      </div>
    </div>
    <div class="right-align-header">
      <search-input v-model="searchKeyword" @focus="inSearchIntentMode"></search-input>
      <text-button class="return-button" @click="goToPage(-1)">{{ $t('general.go_back') }}</text-button>
    </div>
  </div>
  <div class="body">
    <div class="statistics-box">
      <div class="text active">
        {{$t('intent_engine.test_record.test_data')}}
      </div>
      <div class="text normal margin-bottom">
        {{`${$t('intent_engine.test_data.num_test_corpus', {cnum: record.test_sentences_count})}`}}
      </div>

      <div class="text active">
        {{$t('intent_engine.test_record.intent_model_version')}}
      </div>
      <div class="text normal">
        {{modelVersion}}
      </div>
      <div class="text normal margin-bottom">
        {{`${$t('intent_engine.test_record.intent_statistics', {inum: record.intents_count, cnum: record.sentences_count})}`}}
      </div>
      <div class="text normal margin-bottom">
        {{`${$t('intent_engine.test_records.tester')}：${record.tester}`}}
      </div>
      <div class="seperater margin-bottom"></div>

      <div class="text active margin-bottom">
        {{`${$t('intent_engine.test_record.accuracy')}: ${accuracy}%`}}
      </div>
      <div class="text active margin-bottom">
        {{`${$t('intent_engine.test_record.recall')}: ${recall}%`}}
      </div>
      <div class="text active margin-bottom">
        {{`${$t('intent_engine.test_record.precision')}: ${precision}%`}}
      </div>
      <div class="seperater margin-bottom"></div>

      <div class="text normal margin-bottom">
        {{`True Positive：${record.true_positives}`}}
      </div>
      <div class="text normal margin-bottom">
        {{`True Negative：${record.true_negatives}`}}
      </div>
      <div class="text normal margin-bottom">
        {{`False Positive：${record.false_positives}`}}
      </div>
      <div class="text normal margin-bottom">
        {{`False Negative：${record.false_negatives}`}}
      </div>
    </div>
    <div class="content">
      <div class="tool-bar">
        <div class="link" v-if="!record.saved" @click="saveRecord()">
          {{$t('intent_engine.test_records.store_record')}}
        </div>
        <div class="link" v-if="record.saved" @click="unsaveRecord()">
          {{$t('intent_engine.test_records.unstore_record')}}
        </div>
        <div class="link" @click="restoreRecord()">
          {{$t('intent_engine.test_records.restore_record')}}
        </div>
        <div class="download-option-btn" ref="downloadOptionsBtn" v-dropdown="downloadOptions">
          <text-button
            :width="'64px'"
            :height="'28px'"
            :icon-type="'header_dropdown_gray'"
            :iconAlign="'right'"
            :icon-size="10">
            {{ $t('general.download') }}
          </text-button>
        </div>
      </div>
      <template v-if="corpusGroupsWithoutIntent.length > 0">
        <div class="intent-list-title  margin-top">
          {{ $t('intent_engine.test_data.test_corpus_without_intent') }}
          <icon iconType="info" :size="16" enableHover v-tooltip="intentTypeTooltip"></icon>
        </div>
        <intent-test-list class="intent-list"
          ref="corpusGroupsWithoutIntent"
          :initialIntentList="corpusGroupsWithoutIntent"
          :intentListType="'withoutIntent'"
          :intentListMode="'result'">
        </intent-test-list>
      </template>
      <template v-if="intentList.length > 0">
        <div class="intent-list-title margin-top">
          {{ $t('intent_engine.test_data.intent_and_test_corpus') }}
          <icon iconType="info" :size="16" enableHover v-tooltip="intentTypeTooltip"></icon>
        </div>
        <intent-test-list class="intent-list"
          ref="intentList"
          :initialIntentList="intentList"
          :intentListType="'withIntent'"
          :intentListMode="'result'"
          :keyword="searchKeyword">
        </intent-test-list>
      </template>
    </div>
  </div>
</div>
</template>
<script>

import { mapGetters } from 'vuex';
import IntentTestList from './IntentTestList';
import SaveRecordPop from './SaveRecordPop';
import eventBus from '../_utils/eventBus';
import api from '../_api/intentTest';
import intentApi from '../_api/intent';
import general from '../_utils/general';

export default {
  name: 'intent-test-record-page',
  api,
  components: {
    IntentTestList,
  },
  props: {
  },
  data() {
    return {
      searchKeyword: '',
      keywordTimer: undefined,
      keywordTimerDelay: 1000, // ms
      searchIntentMode: false,
      record: {},
      allIntents: [],
      intentList: [],
      corpusGroupsWithoutIntent: [],
      eventBus: eventBus.eventBus,
      intentTypeTooltip: {
        msg: this.$t('intent_engine.manage.tooltip.page_info'),
      },
      downloadOptions: {
        alignLeft: true,
        globalFix: false,
        width: '200px',
        options: [
          {
            text: this.$t('intent_engine.test_record.export_intent_test_corpus'),
            onclick: () => {
              this.$api.exportTestRecord(this.record.id);
            },
          },
          {
            text: this.$t('intent_engine.test_record.export_intent_train_corpus'),
            onclick: () => {
              intentApi.exportModel.call(this, this.robotID, this.record.ie_model_version);
            },
          },
        ],
      },
    };
  },
  computed: {
    ...mapGetters([
      'robotID',
    ]),
    accuracy() {
      const a = ((this.record.tp + this.record.tn) * 100) /
        (this.record.tp + this.record.tn + this.record.fp + this.record.fn);
      return Math.round(a);
    },
    recall() {
      const r = ((this.record.tp) * 100) /
        (this.record.tp + this.record.fn);
      return Math.round(r);
    },
    precision() {
      const p = ((this.record.tp) * 100) /
        (this.record.tp + this.record.fp);
      return Math.round(p);
    },
    modelVersion() {
      return general.timestampToDatetimeString(this.record.ie_model_updated_time);
    },
    recordVersion() {
      return general.timestampToDatetimeString(this.record.updated_time);
    },
  },
  watch: {
    allIntents() {
      this.intentList = [];
      this.corpusGroupsWithoutIntent = [];
      this.allIntents.forEach((intent) => {
        if (intent.type === true) {
          this.intentList.push(intent);
        } else {
          this.corpusGroupsWithoutIntent.push(intent);
        }
      });
      if (this.$refs.intentList) {
        this.$refs.intentList.$emit('renderIntentTestList', this.intentList);
      }
      if (this.$refs.corpusGroupsWithoutIntent) {
        this.$refs.corpusGroupsWithoutIntent.$emit('renderIntentTestList', this.corpusGroupsWithoutIntent);
      }
    },
    searchKeyword() {
      this.clearKeywordTimer();
      this.keywordTimer = setTimeout(
        () => { this.getTestRecord(this.intentTestID); },
        this.keywordTimerDelay,
      );
    },
  },
  methods: {
    getTestRecord(intentTestID) {
      this.eventBus.$emit('startLoading');
      this.$api.getTestRecord(intentTestID, this.searchKeyword).then((data) => {
        // console.log(data);
        const { test_intents, ...record } = data;
        record.tp = record.true_positives;
        record.tn = record.true_negatives;
        record.fp = record.false_positives;
        record.fn = record.false_negatives;
        this.record = record;
        this.allIntents = data.test_intents;
      }).finally(() => {
        this.eventBus.$emit('endLoading');
      });
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
    saveRecord() {
      const that = this;
      const popOption = {
        title: that.$t('intent_engine.test_records.save_record_pop.save_record'),
        component: SaveRecordPop,
        validate: true,
        disable_ok: true,
        callback: {
          ok(recordName) {
            that.eventBus.$emit('startLoading');
            that.$api.saveTestRecord(this.$route.params.id, recordName).then(() => {
              that.getTestRecord(that.intentTestID);
            }).catch((err) => {
              console.log(err);
              that.eventBus.$emit('endLoading');
            });
          },
        },
      };
      this.$pop(popOption);
    },
    unsaveRecord() {
      const that = this;
      const option = {
        data: {
          msg: that.$t('intent_engine.test_records.unsave_warning'),
        },
        callback: {
          ok: () => {
            that.eventBus.$emit('startLoading');
            that.$api.unsaveTestRecord(this.$route.params.id).then(() => {
              that.toPage('test/records');
            }).catch((err) => {
              console.log(err);
              that.eventBus.$emit('endLoading');
            });
          },
        },
      };
      that.$popWarn(option);
    },
    restoreRecord() {
      const that = this;
      const option = {
        data: {
          msg: that.$t('intent_engine.test_records.restore_warning'),
        },
        callback: {
          ok: () => {
            that.eventBus.$emit('startLoading', that.$t('intent_engine.is_restoring'), 'line');
            that.$api.restoreTestRecord(this.$route.params.id).then(() => {
              that.$notify({ text: this.$t('intent_engine.restore_success') });
            }).catch(() => {
              that.$notifyFail(this.$('intent_engine.restore_fail'));
            }).finally(() => {
              that.eventBus.$emit('endLoading');
            });
          },
        },
      };
      that.$popWarn(option);
    },
    clearKeywordTimer() {
      if (this.keywordTimer) {
        clearTimeout(this.keywordTimer);
      }
      this.keywordTimer = undefined;
    },
  },
  mounted() {
    this.intentTestID = this.$route.params.id;
    this.eventBus.$emit('startLoading');
    this.getTestRecord(this.intentTestID);
  },
  beforeDestroy() {
    this.clearKeywordTimer();
  },
};
</script>

<style lang="scss" scoped>
#intent-test-record-page{
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
    min-width: 900px;
    min-height: 540px;
    .statistics-box{
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      margin: 20px 20px 10px 20px;
      padding: 10px;
      width: 240px;
      height: calc(100% - 30px);
      border-radius: 4px;
      border: 1px solid $color-borderline;
      .margin-bottom {
        margin-bottom: 10px;
      }
      .text {
        @include font-14px-line-height-28px();
        margin-left: 10px;
        margin-right: 10px;
      }
      .active{
        color: $color-font-active;
      }
      .normal{
        color: $color-font-normal;
      }
      .seperater{
        height: 1px;
        background-color: $color-borderline;
      }
    }
    .content{
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      padding: 20px 20px 10px 0px;
      overflow-y: scroll;
      @include customScrollbar();
      .tool-bar{
        flex: 0 0 auto;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        .link{
          @include font-14px-line-height-28px();
          @include clickable-text();
          color: $app-active-color;
          margin-right: 20px;
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
      .intent-list{
        flex: 0 0 auto;
      }
    }
  }
}
</style>
