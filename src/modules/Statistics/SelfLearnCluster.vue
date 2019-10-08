<template>
  <div id="self-learn-content" class="card w-fill h-fill">
    <div id="header">
      <div id="breadcrum">
        <span id="breadcrum-back" @click="backToDailyPage">{{ $t('pages.statistics.statistic_daily') }}</span>
        <icon icon-type="month_right" :size="20"></icon>
        {{ $t('statistics.cluster.title') }}
      </div>
      <div id="back-button">
        <text-button @click="backToDailyPage">{{ $t('general.go_back') }}</text-button>
      </div>
    </div>
    <div id="content">
      <div id="cluster-info">
        <div id="condition-block" class="info-row">
          <span id="condition-title">{{ $t('statistics.cluster.condition') }}：</span>
          <div id="condition-tag-block">
            <span v-for="condition in searchCondition" :key="condition" class="condition-tag">
              {{ condition }}
            </span>
          </div>
        </div>
        <div class="info-row">
          <span>{{ $t('statistics.cluster.result_count', {
            type: $t('statistics.cluster.type.by_search'),
            total: totalCount,
            ignore: ingoredCount,
            marked: markedCount,
            std: stdCount}) }}</span>
        </div>
      </div>
      <div id="cluster-result">
        <div id="cluster-group" class="cluster-block">
          <div class="cluster-header">
            <span>{{ $t('statistics.cluster.cluster_count', { num: clusterCount }) }}</span>
          </div>
          <general-table id="cluster-group-content" class="content-table cluster-content"
            :tableHeader="clusterGroupHeader"
            :tableData="clusterGroupData"
            :onclickRow="setClusterRecordData">
          </general-table>
        </div>
        <div id="cluster-question" class="cluster-block">
          <div class="cluster-header">
            <span>{{ $t('statistics.cluster.cluster_info', { title: currentClusterTitle, num: checkedDataRowCount }) }}</span>
            <text-button
              :button-type="dataRowCount > 0 && hasCheckedDataRow ? 'primary' : 'disable'"
              @click="doIgnore(checkedDataRow)">
              {{ $t('statistics.ignore.batch_ignore') }}</text-button>
            <div class="markBtn" ref="markBtn" :class="{'disabled': dataRowCount <= 0 || !hasCheckedDataRow}" v-dropdown="markDropdown">
              <text-button
                icon-type="header_dropdown_white" :icon-size="8" icon-align="right"
                :button-type="dataRowCount > 0 && hasCheckedDataRow ? 'primary' : 'disable'">
                {{ $t('statistics.mark.batch_mark') }}</text-button>
            </div>
          </div>
          <general-table class="content-table cluster-content"
            :tableHeader="clusterRecordHeader"
            :tableData="clusterRecordData"
            :isLoading="isTableLoading"
            @checkedChange="handleCheckedChange"
            checkbox>
          </general-table>
          <div class="cluster-footer">
            <v-pagination
              size="small"
              :pageIndex="pageIndex"
              :total="clusterRecordCount"
              :page-size="pageLimit"
              :pageSizeOption="[25, 50, 100, 200, 500, 1000]"
              :layout="['prev', 'pager', 'next', 'sizer', 'jumper']"
              @page-change="handlePageChange"
              @page-size-change="handlePageSizeChange" >
            </v-pagination>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import moment from 'moment';
import VIEW from './_data/dailyView';
import api from './_api/selflearn';
import dailyMixin from './_store/dailyMixin';

export default {
  api,
  mixins: [dailyMixin],
  data() {
    const that = this;
    return {
      totalCount: 0,
      ingoredCount: 0,
      markedCount: 0,
      stdCount: 0,
      clusterCount: 0,
      report: {},

      pageIndex: 1,
      questionCount: 0,
      pageLimit: 25,
      checkedDataRow: [],

      searchCondition: [],
      clusterGroupHeader: [
        {
          key: 'tag',
          text: that.$t('statistics.cluster.cluster_tag'),
          width: '195px',
        },
        {
          key: 'count',
          text: that.$t('statistics.cluster.cluster_q_count'),
          width: '116px',
        },
      ],
      clusterGroupData: [],
      clusterRecordHeader: [
        {
          key: 'user_q',
          text: that.$t('statistics.user_question'),
        },
        {
          key: 'action',
          text: that.$t('general.actions'),
          type: 'action',
        },
      ],
      clusterRecordData: [
        {
          value: '一個問題',
          action: [
            {
              text: '忽略',
              type: 'primary',
            },
            {
              text: '標註',
              type: 'primary',
            },
          ],
        },
      ],
      clusterRecordCount: 0,
      currentClusterRecord: [],
      currentClusterTitle: '',
      isTableLoading: false,
      markDropdown: {
        width: '120px',
        options: [
          {
            text: that.$t('statistics.stdq_mark'),
            onclick: () => {
              that.popSelfLearnMark(that.checkedDataRow);
            },
          },
          {
            text: that.$t('statistics.intent_mark'),
            onclick: () => {
              that.popSelfLearnIntentMark(that.checkedDataRow);
            },
          },
        ],
      },
    };
  },
  computed: {
    ...mapGetters([
      'dailyCurrentView',
      'clusterReport',
      'dailySearchParams',
    ]),
    dataRowCount() {
      return this.clusterRecordData.length;
    },
    checkedDataRowCount() {
      return this.checkedDataRow.length;
    },
    hasCheckedDataRow() {
      return this.checkedDataRowCount > 0;
    },
  },
  watch: {
  },
  methods: {
    ...mapMutations([
      'setDailyCurrentView',
    ]),
    backToDailyPage() {
      const that = this;
      that.setDailyCurrentView(VIEW.DAILY);
    },
    handlePageChange(page) {
      this.doSearch(page);
    },
    handlePageSizeChange(size) {
      this.pageLimit = size;
      this.doSearch(1);
    },
    handleCheckedChange(checked) {
      this.checkedDataRow = checked;
    },
    setMark(markedQuestion, record, tomark) {
      const that = this;
      that.apiSetMark(that.clusterRecordData, markedQuestion, record, tomark)
      .then((table) => {
        that.clusterRecordData = table;
      });
    },
    setIntentMark(markedIntent, positive, record) {
      const that = this;
      that.apiSetIntentMark(that.tableData, markedIntent, positive, record)
      .then((table) => {
        that.tableData = table;
      });
    },
    setIgnore(records, ignore) {
      const that = this;
      that.apiSetIgnore(that.clusterRecordData, records, ignore)
      .then((table) => {
        that.tableData = table;
      });
    },
    setClusterRecordData(cluster, idx) {
      const that = this;
      that.currentClusterTitle = cluster.tag;
      that.currentClusterRecord = cluster.records.map(r => r.id);
      that.clusterRecordCount = cluster.count;
      that.clusterGroupData = that.updateHighlightTableData(that.clusterGroupData, idx);
      that.doSearch(1);
    },
    updateHighlightTableData(tabledata, idx) {
      const updatedTable = tabledata.map((data, index) => {
        data.highlight = false;
        if (index === idx) {
          data.highlight = true;
        }
        return data;
      });
      return updatedTable;
    },
    doSearch(page) {
      const that = this;
      that.pageIndex = page;
      that.searchParams = that.getSearchParam();
      that.isTableLoading = true;
      that.$api.getRecords(that.searchParams, page, that.pageLimit).then((data) => {
        const res = data;
        that.checkedDataRow = []; // clear all checked
        that.clusterRecordData = that.receiveAPIData(res.data);
        that.isTableLoading = false;
      }, () => {
        that.isTableLoading = false;
      });
    },
    getSearchParam() {
      return {
        records: this.currentClusterRecord,
      };
    },
    receiveAPIData(datas) {
      const that = this;
      let tableData = datas.map((d) => {
        const data = {
          user_q: d.user_q,
          id: d.id,
          is_ignored: d.is_ignored,
          is_marked: d.is_marked,
        };
        return data;
      });
      tableData = that.appendTableDataAction(tableData);
      return tableData;
    },
    parseSearchCondition() {
      const that = this;
      const searchQuery = that.dailySearchParams;
      that.searchCondition = [];
      // starttime, endtime, convert second to millisecond
      const starttime = moment(searchQuery.start_time * 1000).format('YYYY/MM/DD HH:mm');
      const endtime = moment(searchQuery.end_time * 1000).format('YYYY/MM/DD HH:mm');
      that.searchCondition.push(`${that.$t('statistics.time_range')}: ${starttime} ~ ${endtime}`);
      // uid
      if (searchQuery.uid) {
        that.searchCondition.push(`${that.$t('statistics.user_id')}: ${searchQuery.uid}`);
      }
      // emotion
      if (searchQuery.emotions) {
        let emotionTag = `${that.$t('statistics.emotions.title')}:`;
        searchQuery.emotions.forEach((emotion) => {
          const tagi18n = `statistics.emotions.${emotion}`;
          emotionTag = `${emotionTag} ${that.$t(tagi18n)}`;
        });
        that.searchCondition.push(emotionTag);
      }
      // qtype
      if (searchQuery.question_types) {
        const tagi18n = `statistics.qtypes.${searchQuery.question_types[0]}`;
        const qTypeTag = `${that.$t('statistics.qtypes.title')}: ${that.$t(tagi18n)}`;
        that.searchCondition.push(qTypeTag);
      }
      // platform
      if (searchQuery.platforms) {
        let platformTag = `${that.$t('statistics.platform.title')}:`;
        searchQuery.platforms.forEach((platform) => {
          const tagi18n = `statistics.platform.${platform}`;
          platformTag = `${platformTag} ${that.$t(tagi18n)}`;
        });
        that.searchCondition.push(platformTag);
      }
      // gender
      if (searchQuery.genders) {
        if (searchQuery.genders === '0') {
          that.searchCondition.push(`${that.$t('statistics.sex.title')}: ${that.$t('statistics.sex.male')}`);
        } else {
          that.searchCondition.push(`${that.$t('statistics.sex.title')}: ${that.$t('statistics.sex.female')}`);
        }
      }
      // ignore
      if (searchQuery.is_ignored !== undefined) {
        if (searchQuery.is_ignored) {
          that.searchCondition.push(`${that.$t('statistics.ignore.title')}: ${that.$t('statistics.ignore.ignore')}`);
        } else {
          that.searchCondition.push(`${that.$t('statistics.ignore.title')}: ${that.$t('statistics.ignore.not_ignore')}`);
        }
      }
      if (searchQuery.is_marked !== undefined) {
        if (searchQuery.is_marked) {
          that.searchCondition.push(`${that.$t('statistics.mark.title')}: ${that.$t('statistics.mark.marked')}`);
        } else {
          that.searchCondition.push(`${that.$t('statistics.mark.title')}: ${that.$t('statistics.mark.not_marked')}`);
        }
      }
      if (searchQuery.keyword) {
        that.searchCondition.push(`${that.$t('statistics.keyword_search')}: ${searchQuery.keyword}`);
      }
    },
    setUpClusterReport() {
      const that = this;
      that.totalCount = that.clusterReport.results.total_size;
      that.ingoredCount = that.clusterReport.ignored_size;
      that.markedCount = that.clusterReport.marked_size;
      that.stdCount = that.clusterReport.skipped_size || 0;
      that.report = that.clusterReport.results;
      that.clusterCount = that.report.clusters.length;

      that.clusterGroupData = that.report.clusters.map((c) => {
        let centerQuestion = '';
        if (c.center_questions && c.center_questions.length > 0) {
          centerQuestion = c.center_questions[0];
        }
        if (centerQuestion === '' && c.tags && c.tags.length > 0) {
          centerQuestion = c.tags[0];
        }
        if (centerQuestion === '' && c.records && c.records.length > 0) {
          centerQuestion = c.records[0].value;
        }
        return {
          tag: centerQuestion, // use first center question as cluster name
          count: c.records.length,
          records: c.records,
        };
      });
      if (that.report.filtered.length > 0) {
        that.clusterCount += 1;
        that.clusterGroupData.push({
          tag: that.$t('statistics.cluster.others'),
          count: that.report.filtered.length,
          records: that.report.filtered,
        });
      }
      that.parseSearchCondition();
      that.setClusterRecordData(that.clusterGroupData[0], 0);
    },
  },
  mounted() {
    this.setUpClusterReport();
  },
  activated() {
    this.setUpClusterReport();
  },
};

</script>
<style lang="scss" scoped>
#self-learn-content {
  display: flex;
  flex-direction: column;
  #header {
    flex: 0 0 60px;
    padding: 0 20px;
    border-bottom: 1px solid $color-borderline;
    display: flex;
    align-items: center;
    justify-content: space-between;
    #breadcrum {
      @include font-16px();
      color: $color-font-active;
      display: flex;
      align-items: center;
      #breadcrum-back {
        cursor: pointer;
      }
      .icon {
        margin: 0 3px;
      }
    }
  }
  #content {
    flex: 1;
  }
}

#content {
  display: flex;
  flex-direction: column;
  #cluster-info {
    @include font-14px();
    padding: 20px;
    .info-row {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }

    #condition-block {
      display: flex;
      align-items: center;
      #condition-title {
        flex: 0 0 80px;
      }
      #condition-tag-block {
        display: flex;
        flex-wrap: wrap;
        .condition-tag {
          white-space: nowrap;
          background-color: #eee;
          margin: 3px 5px;
          padding: 2px 6px;
          border-radius: 2px;
        }
      }
    }
  }
  #cluster-result {
    flex: 1;
    display: flex;
    #cluster-group {
      flex: 0 0 320px;
      .cluster-header {
        padding-left: 20px;
      }
      .cluster-content {
        border-right: 2px solid $color-borderline;
      }
    }
    #cluster-question {
      flex: 1;
      .cluster-header {
        .text-button {
          margin-left: 10px;
          &.disabled {
            pointer-events: none;
          }
        }
        .markBtn {
          display: inline-block;
          &.disabled {
            pointer-events: none;
          }
        }
      }
    }
    .cluster-block {
      display: flex;
      flex-direction: column;
      .cluster-header {
        flex: 0 0 28px;
        color: $color-font-active;
        @include font-14px();
        margin-bottom: 12px;
      }
      .cluster-content {
        flex: 1;
        // min-height: 0px;
        // overflow: hidden;

        .content-table {
          overflow: hidden; // not hidden cause no scroll?
        }
      }
      .cluster-footer {
        flex: 0 0 50px;
        border-top: 1px solid $color-borderline;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
    }
  }
}
</style>
