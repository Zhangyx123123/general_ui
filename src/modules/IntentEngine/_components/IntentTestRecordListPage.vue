<template>
<div id="intent-test-record-list-page" class="card w-fill h-fill">
  <div class="header">
    <div class="breadcrumb">
      <div class="header-title" @click="goToPage(-1)" style="cursor: pointer;">
        <template v-if="lastPath==='train'">
          {{ $t('pages.intent_engine.intent_manage') }}
        </template>
        <template v-if="lastPath==='test'">
          {{ $t('intent_engine.test_records.intent_test_data') }}
        </template>
      </div>
      <icon iconType="month_right" :size="18" style="margin: 0px 10px;"></icon>
      <div class="header-title">
        {{ $t('intent_engine.test_records.intent_test_record') }}
      </div>
    </div>
    <div class="right-align-header">
      <!-- <search-input v-model="searchKeyword" @focus="inSearchIntentMode"></search-input> -->
      <text-button class="return-button" @click="goToPage(-1)">{{ $t('general.go_back') }}</text-button>
    </div>
  </div>
  <div class="body">
    <div class="latest-record-block block">
      <div class="block-title">
        {{ $t('intent_engine.test_records.latest_records') }}
      </div>
      <general-scroll-table
        class="table"
        :tableData="latestRecordData"
        :tableHeader="recordTableHeader"
        :action="recordTableAction"
        showEmpty
        allowCustomHeader>
      </general-scroll-table>
    </div>
    <div class="saved-record-block block">
      <div class="block-title">
        {{ $t('intent_engine.test_records.saved_records') }}
      </div>
      <general-scroll-table
        class="table"
        :tableData="savedRecordData"
        :tableHeader="savedRecordTableHeader"
        :action="recordTableAction"
        showEmpty
        allowCustomHeader>
      </general-scroll-table>
    </div>
  </div>
</div>
</template>
<script>

import { mapState, mapGetters } from 'vuex';
import GeneralScrollTable from '@/components/GeneralScrollTable/GeneralScrollTable';
import api from '../_api/intentTest';
import intentApi from '../_api/intent';
import TestRecordListTableAction from './_tableColumn/TestRecordListTableAction';
import TestRecordListTableDownloadLink from './_tableColumn/TestRecordListTableDownloadLink';
import eventBus from '../_utils/eventBus';
import general from '../_utils/general';
import SaveRecordPop from './SaveRecordPop';

export default {
  name: 'intent-test-record-list-page',
  api,
  components: {
    GeneralScrollTable,
  },
  props: {
  },
  data() {
    const recordTableHeader = [
      {
        key: 'tester',
        text: this.$t('intent_engine.test_records.tester'),
        width: '170px',
        default: true,
      },
      {
        key: 'test_record',
        text: this.$t('intent_engine.test_records.test_record'),
        width: '260px',
        type: 'custom',
        default: true,
      },
      {
        key: 'intent_model',
        text: this.$t('intent_engine.test_records.intent_model'),
        width: '190px',
        type: 'custom',
        default: true,
      },
      {
        key: 'accuracy',
        text: this.$t('intent_engine.test_record.accuracy'),
        width: '135px',
        default: true,
      },
      {
        key: 'recall',
        text: this.$t('intent_engine.test_record.recall'),
        width: '135px',
        default: true,
      },
      {
        key: 'precision',
        text: this.$t('intent_engine.test_record.precision'),
        width: '135px',
        default: true,
      },
      {
        key: 'action',
        text: this.$t('general.operation'),
        width: '70px',
        type: 'custom',
        lockedRight: true,
      },
    ];
    const savedRecordTableHeader = [
      {
        key: 'test_record_name',
        text: this.$t('intent_engine.test_records.test_record_name'),
        width: '170px',
        lockedLeft: true,
      },
      ...recordTableHeader,
    ];
    return {
      // searchKeyword: '',
      searchIntentMode: false,
      latestRecords: [],
      savedRecords: [],
      recordTableHeader,
      savedRecordTableHeader,
      recordTableAction: [],
      eventBus: eventBus.eventBus,
    };
  },
  computed: {
    ...mapGetters([
      'robotID',
    ]),
    ...mapState('intentTest-module', [
      'lastPath',
    ]),
    latestRecordData() {
      return this.renderRecordData(this.latestRecords, 'latest');
    },
    savedRecordData() {
      return this.renderRecordData(this.savedRecords, 'saved');
    },
  },
  watch: {},
  methods: {
    getTestRecords() {
      this.$api.getTestRecords().then((data) => {
        // console.log(data);
        this.latestRecords = data.latest;
        this.savedRecords = data.saved;
      }).finally(() => {
        this.eventBus.$emit('endLoading');
      });
    },
    renderRecordData(records, type) {
      return records.map((record) => {
        const testRecord = this.composeRecordDownloadLink(record);
        const intentModel = this.composeModelDownloadLink(record);
        const rtn = {
          intent_test_id: record.intent_test.id,
          ie_model_version: record.ie_model.version,
          test_record: testRecord,
          intent_model: intentModel,
          accuracy: this.composeStatData(record, 'accuracy'),
          recall: this.composeStatData(record, 'recall'),
          precision: this.composeStatData(record, 'precision'),
          tester: record.intent_test.tester,
          action: this.composeRecordAction(record, type),
        };
        if (type === 'saved') {
          rtn.test_record_name = record.intent_test.name;
        }
        return rtn;
      });
    },
    composeRecordDownloadLink(record) {
      const that = this;
      const modelStats = this.$t('intent_engine.test_records.intent_statistics', { cnum: record.intent_test.test_sentences_count });
      const text = `${general.timestampToDatetimeString(record.intent_test.updated_time)} (${modelStats})`;
      const link = { ...TestRecordListTableDownloadLink };
      link.data = () => ({
        linkData: {
          text,
          onclick: () => {
            that.exportRecord(record);
          },
        },
      });
      return link;
    },
    composeModelDownloadLink(record) {
      const that = this;
      const link = { ...TestRecordListTableDownloadLink };
      link.data = () => ({
        linkData: {
          text: general.timestampToDatetimeString(record.ie_model.updated_time),
          onclick: () => {
            that.exportModel(record);
          },
        },
      });
      return link;
    },
    composeStatData(record, type) {
      const tp = record.intent_test.true_positives;
      const fp = record.intent_test.false_positives;
      const tn = record.intent_test.true_negatives;
      const fn = record.intent_test.false_negatives;
      if (type === 'accuracy') {
        const a = ((tp + tn) * 100) / (tp + tn + fp + fn);
        if (a >= 0) {
          return `${Math.round(a)}%`;
        }
        return 'NaN';
      } else if (type === 'recall') {
        const r = ((tp) * 100) / (tp + fn);
        if (r >= 0) {
          return `${Math.round(r)}%`;
        }
        return 'NaN';
      } else if (type === 'precision') {
        const p = (tp * 100) / (tp + fp);
        if (p >= 0) {
          return `${Math.round(p)}%`;
        }
        return 'NaN';
      }
      return '';
    },
    composeRecordAction(record, type) {
      const that = this;
      const options = [
        {
          // detail
          text: this.$t('intent_engine.test_records.see_record_detail'),
          onclick: () => {
            that.seeRecordDetail(record);
          },
        },
        {
          // restore
          text: this.$t('intent_engine.test_records.restore_record'),
          onclick: () => {
            that.restoreRecord(record);
          },
        },
      ];
      if (type === 'saved') {
        const ops = [
          {
            // edit record name
            text: this.$t('intent_engine.test_records.edit_record_name'),
            onclick: () => {
              that.editRecordName(record);
            },
          },
          {
            // unsave
            text: this.$t('intent_engine.test_records.unstore_record'),
            onclick: () => {
              that.unsaveRecord(record);
            },
          },
        ];
        options.splice(1, 0, ...ops);
      } else {
        const option = {
          // save
          text: this.$t('intent_engine.test_records.store_record'),
          onclick: () => {
            that.saveRecord(record);
          },
        };
        options.splice(1, 0, option);
      }
      // replace data in TestRecordListTableAction
      const action = { ...TestRecordListTableAction };
      action.data = () => ({
        options,
      });
      return action;
    },
    inSearchIntentMode(bool) {
      this.searchIntentMode = bool;
    },
    seeRecordDetail(record) {
      this.toPage(`test/record/${record.intent_test.id}`);
    },
    saveRecord(record) {
      const that = this;
      const popOption = {
        title: that.$t('intent_engine.test_records.save_record_pop.save_record'),
        component: SaveRecordPop,
        validate: true,
        extData: {},
        disable_ok: true,
        callback: {
          ok(recordName) {
            that.$api.saveTestRecord(record.intent_test.id, recordName).then(() => {
              that.getTestRecords();
            });
          },
        },
      };
      this.$pop(popOption);
    },
    editRecordName(record) {
      const that = this;
      const popOption = {
        title: that.$t('intent_engine.test_records.save_record_pop.edit_saved_record'),
        component: SaveRecordPop,
        validate: true,
        extData: {
          recordName: record.intent_test.name,
        },
        disable_ok: true,
        callback: {
          ok(recordName) {
            that.$api.patchTestRecord(record.intent_test.id, recordName).then(() => {
              that.getTestRecords();
            });
          },
        },
      };
      this.$pop(popOption);
    },
    unsaveRecord(record) {
      const that = this;
      const option = {
        data: {
          msg: that.$t('intent_engine.test_records.unsave_warning'),
        },
        callback: {
          ok: () => {
            that.$api.unsaveTestRecord(record.intent_test.id).then(() => {
              that.getTestRecords();
            });
          },
        },
      };
      that.$popWarn(option);
    },
    restoreRecord(record) {
      const that = this;
      const option = {
        data: {
          msg: that.$t('intent_engine.test_records.restore_warning'),
        },
        callback: {
          ok: () => {
            that.eventBus.$emit('startLoading', that.$t('intent_engine.is_restoring'), 'line');
            that.$api.restoreTestRecord(record.intent_test.id).then(() => {
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
    exportRecord(record) {
      this.$api.exportTestRecord(record.intent_test.id);
    },
    exportModel(record) {
      intentApi.exportModel.call(this, this.robotID, record.ie_model.version);
    },
    toPage(path) {
      this.$router.push(`/intent-manage/${path}`);
    },
    goToPage(steps) {
      this.$router.go(steps);
    },
  },
  mounted() {
    this.eventBus.$emit('startLoading');
    this.getTestRecords();
  },
};
</script>

<style lang="scss" scoped>
#intent-test-record-list-page{
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
    flex-direction: column;
    min-width: 900px;
    min-height: 540px;
    overflow-y: scroll;
    @include customScrollbar();
    .block{
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      .block-title{
        flex: 0 0 auto;
        padding: 20px;
        color: $color-font-active;
        @include font-16px-line-height-28px();
      }
      .table{
        flex: 0 0 auto;
      }
    }
  }
}
</style>
