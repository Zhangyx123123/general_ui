<template>
  <div class="statistic-session">
    <div class="card h-fill session-card session-list">
      <nav-bar :options="pageMap"/>
      <filter-field @search="doSearch(1)">
        <template slot="main-filter">
          <range-picker :name="$t('statistics.sessions_time')" ref="timeRange"/>
        </template>
        <template slot="filters">
          <search-input v-model="filterSession" :name="$t('statistics.session_id')" />
          <search-input v-model="filterUser" :name="$t('statistics.user_id')" />
          <range-input :name="$t('statistics.feedback_score')" :min=1 :max=5 :step=1 @input="handleScoreRange"/>
          <dropdown-select :name="$t('statistics.feedback_reason')" width="200px" ref="reasons" :options="reasons" v-model="currentReason"/>
          <dimension-select :name="$t('statistics.dimension')" ref="dimension"
            :options="tagInfo" @input="handleDimensionChange"/>
        </template>
      </filter-field>
      <template v-if="tableData !== undefined">
      <div class="action-bar">
        <text-button @click="doExport" v-if="recordNum > 0">{{ $t('general.export') }}</text-button>
        <text-button button-type="disable" v-else>{{ $t('general.export') }}</text-button>
        <div class="action-text">{{ $t('statistics.total_records', {num: recordNum }) }}</div>
        <span v-if="recordNum > tableMaxRecord" @click="searchForMore" v-tooltip="searchTooltip" class="search-more">
          {{ $t('statistics.search_more') }}
        </span>
      </div>
      <general-scroll-table class="table"
        :table-data="tableData"
        :table-header="tableHeader"
        :action="tableAction"
        allow-custom-header show-empty>
      </general-scroll-table>
      <div class="paginator">
        <v-pagination
          size="small"
          :pageIndex="nowPage"
          :pageSizeOption="constant.tableLimitOption"
          @page-change="doSearch"
          @page-size-change="setLimit"
          :total="recordNum > tableMaxRecord ? tableMaxRecord : recordNum"
          :page-size="nowLimit"
          :layout="constant.tableLayout">
        </v-pagination>
      </div>
      </template>
    </div>
    <transition name="zoom">
    <div class="card h-fill session-content" v-if="viewSession !== undefined">
      <div class="session-detail">
        <div class="session-id row">
          <div class="name">{{ $t('statistics.session_id') }}:</div>
          <div class="id">{{ viewSession.session_id }}</div>
          <div class="icon">
            <icon icon-type='close' :size=12 button @click="viewSession = undefined"/>
          </div>
        </div>
        <div class="session-feedback row">
          <div class="name">{{ $t('statistics.feedback_reason') }}:</div>
          <div>{{ viewSession.rating !== 0 ? viewSession.rating : '-' }} / {{ viewSession.feedback !== '' ? viewSession.feedback : '-' }}</div>
        </div>
        <div class="session-action row">
          <div class="action-left action"></div>
          <div class="action-right action">
            <div class="name">{{ $t('qatest.sentence_analysis') }}</div>
            <toggle v-model="showRecordAnalysis"/>
          </div>
        </div>
      </div>
      <div class="session-records">
        <chat-list :records="sessionRecords" ref="chatList"
          v-if="sessionRecords.length > 0"
          :default-show-analysis="showRecordAnalysis"/>
      </div>
    </div>
    </transition>
  </div>
</template>

<script>
import FilterField from '@/components/layout/FilterField';
import RangePicker from '@/components/DatetimeRangePicker';
import DropdownSelect from '@/components/DropdownSelect';
import DimensionSelect from '@/components/dropdown/DimensionSelector';
import GeneralScrollTable from '@/components/GeneralScrollTable';
import SearchInput from '@/components/basic/SearchInput';
import RangeInput from '@/components/basic/RangeInput';
import ChatList from '@/components/ChatList';
import constant from '@/utils/js/constant';
import auditAPI from '@/api/audit';
import tagAPI from '@/api/tagType';
import feedbackAPI from './_api/feedback';
import api from './_api/session';

const STATS_SESSION_EXPORT = '/api/v1/stats/sessions/export';

export default {
  path: 'statistic-session',
  privCode: 'statistic_daily',
  displayNameKey: 'statistic_session',
  name: 'statistic-session',
  api: [api, auditAPI, tagAPI, feedbackAPI],
  components: {
    FilterField,
    RangePicker,
    DropdownSelect,
    SearchInput,
    RangeInput,
    GeneralScrollTable,
    DimensionSelect,
    ChatList,
  },
  data() {
    return {
      pageMap: {
        sessions: this.$t('pages.statistics.statistic_session'),
      },
      scoreMin: undefined,
      scoreMax: undefined,
      scoreOption: [
        { text: 1, value: 1 },
        { text: 2, value: 2 },
        { text: 3, value: 3 },
        { text: 4, value: 4 },
        { text: 5, value: 5 },
      ],

      filterSession: '',
      filterUser: '',

      tableData: undefined,
      tableHeader: undefined,
      tableAction: [
        {
          key: 'view',
          text: this.$t('general.view'),
          type: 'primary',
          onclick: this.showSessionDetail,
          width: '100px',
        },
      ],
      tableMaxRecord: 10000,
      searchTooltip: {
        msg: this.$t('statistics.search_more_hint'),
      },
      searching: false,

      recordNum: 0,
      nowPage: 1,
      nowLimit: 25,
      constant,

      leftColumn: ['session_id'],
      dftShowColumn: ['start_time', 'user_id', 'rating', 'feedback'],
      columnWidth: {
        session_id: '120px',
        start_time: '180px',
        end_time: '180px',
        user_id: '120px',
        rating: '60px',
        feedback: '240px',
      },

      tagInfo: [],
      dimension: {},
      reasons: [],
      currentReason: [],

      viewSession: undefined,
      sessionRecords: [],
      showRecordAnalysis: true,
    };
  },
  watch: {
    showRecordAnalysis(value) {
      const event = value ? 'show-analysis' : 'hide-analysis';
      if (this.$refs.chatList) {
        this.$refs.chatList.$emit(event);
      }
    },
  },
  methods: {
    searchForMore() {
      const that = this;

      if (that.searching) {
        return;
      }
      that.searching = true;
      const filter = that.getSearchParam();
      this.$api.getSessionList(that.tableMaxRecord, 1, filter).then((rsp) => {
        const lastTime = new Date(rsp.data[0].start_time);
        that.$refs.timeRange.$emit('set-start', lastTime);
        that.$nextTick(() => {
          that.doSearch(1);
        });
      });
    },
    setLimit(limit) {
      this.nowLimit = limit;
      this.nowPage = 1;
      this.doSearch(1);
    },
    fixHeaderFormat(headers) {
      const that = this;
      const headerMap = {};
      headers.forEach((header) => {
        headerMap[header.key] = header;
        header.default = false;
        header.width = that.columnWidth[header.key] || '180px';
      });
      that.leftColumn.forEach((col) => {
        headerMap[col].lockedLeft = true;
      });
      that.dftShowColumn.forEach((col) => {
        headerMap[col].default = true;
      });
      return headers;
    },
    fixDataFormat(datas) {
      datas.forEach((data) => {
        data.rating = data.rating === 0 ? '' : data.rating;
      });
      return datas;
    },
    getSearchParam() {
      const that = this;
      const range = that.$refs.timeRange.getCurrentValue();
      const filter = {
        start_time: parseInt(range.start.getTime() / 1000, 10),
        end_time: parseInt(range.end.getTime() / 1000, 10),
        ...that.dimension,
      };

      if (that.scoreMax !== undefined && that.scoreMin !== undefined) {
        filter.rating_max = that.scoreMax;
        filter.rating_min = that.scoreMin;
      }

      if (that.currentReason.length > 0 && that.currentReason[0] !== '') {
        filter.feedback = that.currentReason[0];
      }

      if (that.filterUser.trim() !== '') {
        filter.uid = that.filterUser;
      }
      if (that.filterSession.trim() !== '') {
        filter.session_id = that.filterSession;
      }
      return filter;
    },
    doSearch(page) {
      const that = this;
      that.viewSession = undefined;
      that.nowPage = page === undefined ? 1 : page;
      const filter = that.getSearchParam();
      that.$startPageLoading();
      that.searching = true;
      this.$api.getSessionList(that.nowPage, that.nowLimit, filter).then((rsp) => {
        that.tableData = that.fixDataFormat(rsp.data);
        if (that.tableHeader === undefined) {
          that.tableHeader = that.fixHeaderFormat(rsp.table_header);
        }
        that.recordNum = rsp.total_size;
      })
      .finally(() => {
        that.searching = false;
        that.$emit('endLoading');
      });
    },
    doExport() {
      const that = this;
      const filename = 'record.csv';
      const module = 'statistic-analysis';
      const filter = that.getSearchParam();

      if (that.recordNum <= 0) {
        return;
      }

      that.$startPageLoading();
      that.$api.auditExportLog({
        module,
        filename,
      })
      .then(() => that.$api.getSessionExportID(filter).then(data => data.export_id))
      .then((exportID) => {
        const checkStatus = () => {
          that.$api.getExportStatus(exportID).then((data) => {
            if (data.status === 'RUNNING') {
              setTimeout(() => { checkStatus(); }, 1000);
              return;
            }
            if (data.status === 'COMPLETED') {
              const token = window.localStorage.getItem('token');
              window.open(`${STATS_SESSION_EXPORT}/${exportID}?token=Bearer%20${token}`);
            } else {
              that.$notifyFail(`${that.$t('general.export')}${that.$t('general.fail')}`);
            }
          });
        };
        checkStatus();
      })
      .catch((err) => {
        that.$notifyFail(`${that.$t('general.export')}${that.$t('general.fail')}`);
        console.log(err);
      })
      .finally(() => {
        that.$emit('endLoading');
      });
    },
    setupDimension() {
      const that = this;
      that.$api.getTagTypes().then((data) => {
        that.tagInfo = data.map(d => ({
          key: d.type,
          text: d.text,
          values: d.values.map(v => ({
            key: v.id,
            text: v.text,
          })),
        }));
        that.$refs.dimension.$emit('set-option', that.tagInfo);
      });
    },
    showSessionDetail(session) {
      const that = this;
      that.viewSession = session;
      if (session.records !== undefined) {
        that.sessionRecords = session.records;
        that.$refs.chatList.$emit('reload', that.sessionRecords);
      } else {
        that.$startPageLoading();
        that.$api.getRecordOfSession(session.session_id).then((rsp) => {
          rsp.data.sort(x => x.log_time);
          rsp.data.reverse();
          that.sessionRecords = rsp.data;
          that.$refs.chatList.$emit('reload', that.sessionRecords);
          if (that.viewSession !== undefined) {
            that.viewSession.records = rsp.data;
          }
        })
        .finally(() => {
          that.$emit('endLoading');
        });
      }
    },
    handleScoreRange(value) {
      if (value.start) {
        this.scoreMin = value.start;
      }
      if (value.end) {
        this.scoreMax = value.end;
      }
    },
    handleDimensionChange(value) {
      this.dimension = value;
    },
    setupFeedbackReason() {
      const that = this;
      that.$api.getFeedbackReasons().then((data) => {
        that.reasons = data.result.map(reason => ({
          value: reason.content,
          text: reason.content,
        }));
        that.reasons.unshift({ value: '', text: this.$t('general.all') });
        that.currentReason = [''];
        that.$refs.reasons.$emit('set-option', that.reasons);
      });
    },
  },
  mounted() {
    this.setupDimension();
    this.setupFeedbackReason();
  },
};
</script>

<style lang="scss" scoped>
.zoom-enter-active, .zoom-leave-active {
  transition: max-width .5s;
  max-width: 320px;
}
.zoom-enter, .zoom-leave-to {
  transition: max-width .5s;
  max-width: 0px;
}

.statistic-session {
  display: flex;
  .session-list {
    flex: 1;
  }
  .session-content {
    flex: 0 0 320px;
    margin-left: 10px;
  }
}
.session-card {
  display: flex;
  flex-direction: column;

  .action-bar {
    flex: 0 0 50px;
    padding: 20px;

    display: flex;
    align-items: center;
    .action-text {
      margin: 0 20px;
    }
    .search-more {
      @include click-button();
      color: $color-primary;
    }
  }
  .table {
    flex: 1;
  }
  .paginator {
    flex: 0 0 50px;

    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
.session-content {
  display: flex;
  flex-direction: column;

  .session-detail {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 10px;
    .name {
      margin-right: 10px;
    }

    .session-id {
      .id {
        flex: 1;
        @include textEllipsis();
      }
      .icon {
        flex: 0 0 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .row {
      flex: 0 0 28px;
      display: flex;
      align-items: center;
    }
    .session-action {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .action {
        display: flex;
        align-items: center;
      }
    }
  }
  .session-records {
    flex: 1;
    background: #f3f3f3;
    overflow-y: auto;
    @include customScrollbar();
  }
}
</style>
