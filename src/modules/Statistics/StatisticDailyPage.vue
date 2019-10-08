<template>
  <div class="content card h-fill w-fill">
    <div v-if="isClustering" id="cluster-loading">
      <loading-line></loading-line>
      <div id="clustering-msg">{{ clusterMsg }}</div>
    </div>
    <div v-show="!isClustering" class="page-content">
    <div class="page-header">
      {{ $t('pages.statistics.statistic_daily') }}
      <icon iconType="info" :size="16" enableHover v-tooltip="pageInfoTooltip"></icon>
    </div>
    <div class="header">
      <div class="filter-rows">
        <div class="row">
          <div class="row-title">{{ $t('statistics.time_range') }}</div>
          <div class="row-value">
            <label-switch class="switch" :options="timeOption" v-model="dayRange" @change="setUpTime"></label-switch>
            <datetime-picker
              :value="start"
              :disableDate="startDisableDate"
              @dateChanged="handleStartDateChanged"
              @validityChange="value => {startValidity = value}"
              ref="start"
            ></datetime-picker>
            ～
            <datetime-picker
              :value="end"
              :disableDate="endDisableDate"
              @dateChanged="handleEndDateChanged"
              @validityChange="value => {endValidity = value}"
              ref="end"
            ></datetime-picker>
          </div>
        </div>
        <template v-if="expertMode">
        <div class="row">
          <div class="row-title">{{ $t('statistics.category') }}</div>
          <div class="row-value">
            <dropdown-select class="single-input"
              :options="categoryOption"
              v-model="categoryFilter"
              width='300px'
              :placeholder="$t('general.please_choose')"/>
          </div>
          <div class="row-title">{{ $t('statistics.label') }}</div>
          <div class="row-value">
            <dropdown-select class="single-input"
              width='300px'
              :placeholder="$t('general.please_choose')"
              :options="labelsOptions" multi v-model="labelsFilter"/>
          </div>
        </div>
        <div class="row">
          <div class="row-title">{{ $t('statistics.confidence_score.title') }}</div>
          <div class="row-value short">
            <dropdown-select class="single-input"
              width='130px'
              :placeholder="$t('general.please_choose')"
              :options="scoreOptions" v-model="scoreType"/>
          </div>
          <div class="score-range"
            v-if="scoreType.length === 1 && scoreType[0] === 'range'">
            <input class="score-input"
              :placeholder="$t('statistics.min_score')"
              v-model="minScore"
              @keypress.enter="doSearch(1)">
            <span class="range-icon">~</span>
            <input class="score-input"
              :placeholder="$t('statistics.max_score')"
              v-model="maxScore"
              @keypress.enter="doSearch(1)">
          </div>
          <div class="row-title">{{ $t('statistics.user_id') }}</div>
          <div class="row-value short">
            <search-input fill v-model="userId" @search="doSearch(1)"/>
          </div>
          <div class="row-title">{{ $t('statistics.emotions.title') }}</div>
          <div class="row-value">
            <dropdown-select class="single-input"
              :options="emotionOptions" multi v-model="emotionFilters"
              :placeholder="$t('general.please_choose')"/>
          </div>
        </div>
        <div class="row">
          <div class="row-title">{{ $t('statistics.modules.title') }}</div>
          <div class="row-value">
            <dropdown-select class="single-input"
              width='300px'
              :hide-close="true"
              :options="moduleOptions" multi v-model="modulesFilter"
              :placeholder="$t('general.please_choose')"/>
          </div>
          <div class="row-title">{{ $t('statistics.platform.title') }}</div>
          <div class="row-value">
            <dropdown-select class="single-input"
              :options="platformOptions" multi v-model="platformFilters"
              :placeholder="$t('general.please_choose')"/>
          </div>
        </div>
        <div class="row">
          <div class="row-title">{{ $t('statistics.sex.title') }}</div>
          <div class="row-value">
            <dropdown-select class="single-input"
              :options="genderOptions" v-model="genderFilters"/>
          </div>
          <div class="row-title">{{ $t('statistics.ignore.title') }}</div>
          <div class="row-value">
            <dropdown-select class="single-input"
              :options="ignoreOptions" v-model="ignoreFilters"/>
          </div>
        </div>
        <div class="row">
          <div class="row-title">{{ $t('statistics.mark.title') }}</div>
          <div class="row-value">
            <dropdown-select class="single-input"
              :options="markOptions" v-model="markFilters"/>
          </div>
          <div class="row-title">{{ $t('statistics.keyword_search') }}</div>
          <div class="row-value">
            <div class="input">
              <search-input v-model="keyword" fill @search="doSearch(1)"/>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="row-title">{{ $t('general.intent') }}</div>
          <div class="row-value">
            <div class="input">
              <search-input v-model="intent" fill @search="doSearch(1)"/>
            </div>
          </div>
        </div>
        </template>
      </div>
      <div class="operation">
        <text-button button-type="primary" v-on:click="doSearch(1)" :disabled="!validFormInput">
          {{ $t('general.search') }}
        </text-button>
        <div @click="expertMode = !expertMode" class="show-more" :class="{more: expertMode}">
          <div class="text">
            {{ $t('statistics.export_mode') }}
          </div>
          <icon class="expand-icon" icon-type="expand" :size=12 />
        </div>
      </div>
    </div>
    <div class="button-container">
      <text-button v-if="canExport"
        v-on:click="doExport()"
        :disabled="!validFormInput"
        :button-type="totalCount > 0 ? 'default' : 'disable'">
        {{ $t('general.export') }}</text-button>
      <text-button
        :button-type="totalCount > 0 && hasCheckedDataRow ? 'primary' : 'disable'"
        @click="doIgnore(checkedDataRow)">
        {{ $t('statistics.ignore.batch_ignore') }}</text-button>
      <div id="markBtn" ref="markBtn" :class="{'disabled': totalCount <= 0 || !hasCheckedDataRow}" v-dropdown="markDropdown">
        <text-button
        icon-type="header_dropdown_white" :icon-size="8" icon-align="right"
          :button-type="totalCount > 0 && hasCheckedDataRow ? 'primary' : 'disable'">
          {{ $t('statistics.mark.batch_mark') }}</text-button>
      </div>
      <div id="clusterBtn" ref="clusterBtn" :class="{'disabled': totalCount <= 0}" v-dropdown="clusterDropdown">
        <text-button
          icon-type="header_dropdown_white" :icon-size="8" icon-align="right"
          :button-type="totalCount > 0 ? 'primary' : 'disable'"
          >
          {{ $t('statistics.cluster.title') }}</text-button>
      </div>
      <icon iconType="info" :size="16" v-tooltip="clusterTooltip" enableHover></icon>
      <div v-if="totalCount > 0" class="total-show">
        {{ $t('statistics.total_select_records', {num: totalCount, count: checkedDataRowCount }) }}
          <span v-if="totalCount > tableMaxRecord" @click="searchForMore" v-tooltip="searchTooltip" class="search-more">
            {{ $t('statistics.search_more') }}
          </span>
      </div>
    </div>
    <template v-if="showTable">
      <div class="table-container">
        <general-table
          :tableHeader="headerInfo"
          :tableData="tableData"
          :showEmptyMsg="[$t('general.no_search_data')]"
          :isLoading="isTableLoading"
          @checkedChange="handleCheckedChange"
          show-empty checkbox allow-custom-header
        ></general-table>
      </div>
      <div class="paginator">
        <v-pagination v-if="showPagination"
          size="small"
          :pageIndex="pageIndex"
          :pageSizeOption="[25, 50, 100, 200, 500, 1000]"
          v-on:page-change="doSearch"
          @page-size-change="handlePageSizeChange"
          :total="totalCount > tableMaxRecord ? tableMaxRecord : totalCount"
          :page-size="pageLimit"
          :layout="['prev', 'pager', 'next', 'sizer', 'jumper']">
        </v-pagination>
      </div>
    </template>

    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import event from '@/utils/js/event';
import GeneralTable from '@/components/GeneralScrollTable';
import DatetimePicker from '@/components/DateTimePicker';
import DropdownSelect from '@/components/DropdownSelect';
import pickerUtil from '@/utils/vue/DatePickerUtil';

import tagAPI from '@/api/tagType';
import auditAPI from '@/api/audit';
import api from './_api/selflearn';
import SSMAPI from './_api/ssm';
import VIEW from './_data/dailyView';
import dailyMixin from './_store/dailyMixin';

const STATS_RECORD_EXPORT = '/api/v1/stats/records/export';

export default {
  path: 'statistic-daily',
  privCode: 'statistic_daily',
  displayNameKey: 'statistic_daily',
  icon: 'white_daily',
  name: 'statistic-daily',
  components: {
    DatetimePicker,
    GeneralTable,
    DropdownSelect,
  },
  api: [tagAPI, api, auditAPI, SSMAPI],
  mixins: [dailyMixin],
  data() {
    const that = this;
    return {
      isMount: false, // use to prevent trigger doSearch in activated hook

      isClustering: false,
      clusteringCnt: 0,

      expertMode: false,
      start: pickerUtil.createDateObj(),
      end: pickerUtil.createDateObj(),

      headerInfo: [],
      tableData: [],
      tableAction: [],
      actionInfo: this.$t('statistics.action_info'),
      checkedDataRow: [],
      isTableLoading: false,

      showTable: false,
      totalCount: 0,
      markedCount: 0,
      ignoredCount: 0,
      enableClusterSize: 100, // const, only allow cluster if data is more than this num

      searchParams: undefined,
      keyword: '',
      intent: '',
      userId: '',
      startValidity: true,
      endValidity: true,
      pageIndex: 1,
      pageLimit: 100,
      startDisableDate: undefined,
      endDisableDate: undefined,
      emotionOptions: [
        {
          value: that.$t('statistics.emotions.angry'),
          text: that.$t('statistics.emotions.angry'),
        },
        {
          value: that.$t('statistics.emotions.not_satisfied'),
          text: that.$t('statistics.emotions.not_satisfied'),
        },
        {
          value: that.$t('statistics.emotions.satisfied'),
          text: that.$t('statistics.emotions.satisfied'),
        },
        {
          value: that.$t('statistics.emotions.neutral'),
          text: that.$t('statistics.emotions.neutral'),
        },
      ],
      moduleOptions: [
        { value: 'backfill', text: that.$t('statistics.modules.backfill') },
        { value: 'chat', text: that.$t('statistics.modules.chat') },
        { value: 'keyword', text: that.$t('statistics.modules.keyword') },
        { value: 'function', text: that.$t('statistics.modules.function') },
        { value: 'faq', text: that.$t('statistics.modules.faq') },
        { value: 'task_engine', text: that.$t('statistics.modules.task_engine') },
        { value: 'to_human', text: that.$t('statistics.modules.to_human') },
        { value: 'knowledge', text: that.$t('statistics.modules.knowledge') },
        { value: 'domain_kg', text: that.$t('statistics.modules.domain_kg') },
        { value: 'command', text: that.$t('statistics.modules.command') },
        { value: 'emotion', text: that.$t('statistics.modules.emotion') },
      ],
      platformOptions: [
        { value: 'weixin', text: that.$t('statistics.platform.wechat') },
        { value: 'app', text: that.$t('statistics.platform.app') },
        { value: 'web', text: that.$t('statistics.platform.web') },
        { value: 'ios', text: that.$t('statistics.platform.ios') },
      ],
      genderOptions: [
        { value: '', text: that.$t('statistics.sex.all') },
        { value: '0', text: that.$t('statistics.sex.male') },
        { value: '1', text: that.$t('statistics.sex.female') },
      ],
      ignoreOptions: [
        { value: '', text: that.$t('statistics.ignore.all') },
        { value: 'ignore', text: that.$t('statistics.ignore.ignore') },
        { value: 'not_ignore', text: that.$t('statistics.ignore.not_ignore') },
      ],
      markOptions: [
        { value: '', text: that.$t('statistics.mark.all') },
        { value: 'marked', text: that.$t('statistics.mark.marked') },
        { value: 'not_marked', text: that.$t('statistics.mark.not_marked') },
      ],
      scoreOptions: [
        { value: '', text: that.$t('general.all') },
        { value: 'low', text: that.$t('statistics.confidence_score.low') },
        { value: 'range', text: that.$t('statistics.confidence_score.range') },
      ],
      emotionFilters: [],
      modulesFilter: [''],
      platformFilters: [],
      genderFilters: [''],
      ignoreFilters: [''],
      markFilters: [''],
      categoryFilter: [],
      scoreType: [''],
      timeOption: [
        {
          text: `1${that.$t('statistics.day')}`,
          val: 1,
        },
        {
          text: `7${that.$t('statistics.day')}`,
          val: 7,
        },
        {
          text: `${that.$t('general.custom')}`,
          val: -1,
        },
      ],
      dayRange: 1,
      pageInfoTooltip: {
        msg: that.$t('statistics.tooltip'),
      },
      clusterTooltip: {
        msg: that.$t('statistics.cluster_info'),
      },
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
      clusterDropdown: {
        width: '330px',
        options: [
          {
            text: that.$t('statistics.cluster_dropdown.by_search', { num: that.totalCount }),
            onclick: that.runCluster,
          },
          {
            text: that.$t('statistics.cluster_dropdown.by_checked'),
            disabled: true,
          },
        ],
      },
      clusterMsg: '',
      tableMaxRecord: 10000,
      searchTooltip: {
        msg: that.$t('statistics.search_more_hint'),
      },
      searching: false,
      categoryRoot: undefined,
      categoryIDMap: {},
      categoryNameMap: {},
      categoryOption: [],
      // that map use cn hard-code, because that column is the result of emotion module
      // it will be zh-cn forever.
      emotionMap: {
        [that.$t('dimension.emotions.angry')]: [
          '愤怒', '憤怒'],
        [that.$t('dimension.emotions.not_satisfied')]: [
          '疑惑', '沮丧', '尴尬', '不满', '不高兴', '厌烦', '反感', '不喜欢', '厌恶',
          '疑惑', '沮喪', '尷尬', '不滿', '不高興', '厭煩', '反感', '不喜歡', '厭惡'],
        [that.$t('dimension.emotions.satisfied')]: [
          '喜欢', '感动', '高兴', '称赞',
          '喜歡', '感動', '高興', '稱讚'],
        [that.$t('dimension.emotions.neutral')]: [
          '伤心', '害怕', '惊讶', '无聊', '自责', '难过', '寂寞', '疲惫', '焦虑', '中性',
          '傷心', '害怕', '驚訝', '無聊', '自責', '難過', '寂寞', '疲憊', '焦慮', '中性'],
      },
      emotionRevMap: {},
      labelsFilter: [],
      labelsOptions: [],
      minScore: 0,
      maxScore: 100,

      headerWidth: {
        user_q: '120px',
        std_q: '120px',
        answer: '200px',
        log_time: '160px',
        module: '120px',
        intent: '120px',
      },
      defaultHeader: ['user_id', 'user_q', 'answer', 'log_time', 'module', 'emotion', 'intent'],
    };
  },
  watch: {
    checkedDataRow() {
      const that = this;
      that.reloadClusterDropdown();
    },
  },
  methods: {
    ...mapMutations([
      'setDailyCurrentView',
      'setClusterReport',
      'setDailySearchParams',
    ]),
    searchForMore() {
      const that = this;

      if (that.searching) {
        return;
      }
      that.searching = true;
      that.$api.getRecordsV2(that.searchParams, that.tableMaxRecord, 1).then((res) => {
        const lastData = res.data[0];
        const lastTime = new Date(lastData.log_time);
        that.$refs.end.$emit('setValue', lastTime);
        that.$nextTick(() => {
          that.doSearch(1).then(() => {
            that.searching = false;
          });
        });
      });
    },
    escapeRegExp(str) {
      return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
    },
    handlePageSizeChange(pageSize) {
      const that = this;
      that.pageLimit = pageSize;
      that.doSearch(1);
    },
    handleCheckedChange(checked) {
      this.checkedDataRow = checked;
    },
    reloadClusterDropdown() {
      const that = this;
      that.clusterDropdown.options = [];
      if (that.totalCount < that.enableClusterSize) {
        that.clusterDropdown.options.push({
          text: that.$t('statistics.cluster_dropdown.by_search_more', { num: that.totalCount, size: that.enableClusterSize }),
          disabled: true,
        });
      } else {
        that.clusterDropdown.options.push({
          text: that.$t('statistics.cluster_dropdown.by_search', { num: that.totalCount }),
          onclick: that.doClusterBySearch,
        });
      }
      if (that.checkedDataRowCount < that.enableClusterSize) {
        that.clusterDropdown.options.push({
          text: that.$t('statistics.cluster_dropdown.by_checked_more', { num: that.checkedDataRowCount, size: that.enableClusterSize }),
          disabled: true,
        });
      } else {
        that.clusterDropdown.options.push({
          text: that.$t('statistics.cluster_dropdown.by_checked', { num: that.checkedDataRowCount }),
          onclick: that.doClusterByChecked,
        });
      }
      that.$refs.clusterBtn.dispatchEvent(event.createEvent('dropdown-reload'));
    },
    doClusterBySearch() {
      const that = this;
      that.clusteringCnt = that.totalCount;
      that.runCluster(that.searchParams);
    },
    doClusterByChecked() {
      const that = this;
      that.clusteringCnt = that.checkedDataRowCount;
      const param = {
        records: that.checkedDataRow.map(row => row.id),
      };
      that.runCluster(param);
    },
    runCluster(params) {
      const that = this;
      // Show loading and keep polling till cluster done, and go to cluster page
      that.clusterMsg = that.$t('statistics.clustering_checking');
      that.isClustering = true;
      that.$api.startCluster(params)
      .then((reportId) => {
        that.clusterMsg = that.$t('statistics.clustering_msg', { num: that.clusteringCnt });
        setTimeout(() => {
          that.pollClusterReport(reportId);
        }, 3000);
      })
      .catch((err) => {
        console.log(err);
        const option = {
          data: {
            msg: that.$t('statistics.error.try_cluster_later'),
          },
          buttons: ['ok'],
          ok_msg: that.$t('statistics.error.got_it'),
        };
        that.isClustering = false;
        that.$popWarn(option);
      });
    },
    pollClusterReport(reportId) {
      const that = this;
      that.$api.pollClusterReport(reportId)
      .then((report) => {
        if (report.status === 0 && report.results === undefined) {
          setTimeout(() => {
            that.pollClusterReport(reportId);
          }, 3000);
          return;
        }

        if (report.status === -2) {
          that.$notifyFail(that.$t('statistics.error.too_few_valid_sentence'));
        } else if (report.status === -1) { // cluster fail
          that.$notifyFail(that.$t('statistics.error.cluster_fail'));
        } else if (report.status === 1) { // cluster success
          that.$notify({ text: that.$t('statistics.success.cluster_ok') });
          that.setDailyCurrentView(VIEW.DAILY_CLUSTER);
          that.setClusterReport(report);
        }
        that.$emit('endLoading');
        that.isClustering = false;
      })
      .catch(() => {
        that.$notifyFail(that.$t('statistics.error.cluster_fail'));
      });
    },
    setMark(markedQuestion, record, tomark) {
      const that = this;
      that.apiSetMark(that.tableData, markedQuestion, record, tomark)
      .then((table) => {
        that.tableData = table;
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
      that.apiSetIgnore(that.tableData, records, ignore)
      .then((table) => {
        that.tableData = table;
      });
    },
    getSearchParam() {
      const params = {
        start_time: this.start.getTimestamp(),
        end_time: this.end.getTimestamp(),
      };
      const that = this;

      // keyword
      if (that.trimmedKeyword) {
        const escapedKeyword = that.escapeRegExp(that.trimmedKeyword);
        params.keyword = escapedKeyword;
      }
      // id
      if (that.trimmedUserID) {
        params.uid = that.trimmedUserID;
      }
      if (that.emotionFilters.length > 0) {
        const group = that.getFilterValue(that.emotionOptions, that.emotionFilters);
        params.emotions = [];
        group.forEach((g) => {
          if (that.emotionMap[g]) {
            params.emotions.push(...that.emotionMap[g]);
          }
          params.emotions.push(g);
        });
      }
      if (that.modulesFilter.length > 0) {
        const group = that.getFilterValue(that.moduleOptions, that.modulesFilter);
        if (group.length > 0) {
          params.modules = group;
        }
      }
      if (that.labelsFilter.length > 0) {
        const group = that.getFilterValue(that.labelsOptions, that.labelsFilter);
        if (group.length > 0) {
          params.faq_robot_tags = group;
        }
      }
      if (that.platformFilters.length > 0) {
        const group = that.getFilterValue(that.platformOptions, that.platformFilters);
        params.platforms = group;
      }
      if (that.genderFilters.length > 0) {
        const group = that.getFilterValue(that.genderOptions, that.genderFilters);
        if (group.length > 0) {
          params.genders = group;
        }
      }
      if (that.ignoreFilters.length > 0) {
        const group = that.getFilterValue(that.ignoreOptions, that.ignoreFilters);
        if (group.length > 0) {
          params.is_ignored = group.indexOf('ignore') !== -1;
        }
      }
      if (that.markFilters.length > 0) {
        const group = that.getFilterValue(that.markOptions, that.markFilters);
        if (group.length > 0) {
          params.is_marked = group.indexOf('marked') !== -1;
        }
      }
      if (that.intent !== '') {
        params.intent = that.intent;
      }
      if (that.scoreType.length > 0) {
        if (that.scoreType[0] === 'low') {
          params.low_confidence_score = 5;
        } else if (that.scoreType[0] === 'range') {
          params.min_score = parseInt(that.minScore, 10);
          params.max_score = parseInt(that.maxScore, 10);
        }
      }
      if (that.categoryFilter.length > 0) {
        const searchID = that.categoryFilter[that.categoryFilter.length - 1];
        const category = that.categoryIDMap[searchID];
        if (category) {
          const dirs = [category.id];
          if (category !== that.categoryRoot) {
            const appendChilds = (dir) => {
              dirs.push(dir.id);
              dir.children.forEach((child) => {
                appendChilds(child);
              });
            };
            appendChilds(category);
          }
          params.faq_cats = dirs;
        }
      }
      return params;
    },
    getFilterValue(option, filter) {
      const group = [];
      option.forEach((opt) => {
        if (filter.indexOf(opt.value) >= 0) {
          if (opt.value === '') { // all
            return;
          }
          group.push(opt.value);
        }
      });
      return group;
    },
    doExport() {
      const that = this;
      const filename = 'record.csv';
      const module = 'statistic-daily';

      if (that.totalCount <= 0) {
        return;
      }

      that.$startPageLoading();
      that.$api.auditExportLog({
        module,
        filename,
      })
      .then(() => that.$api.getExportIDV2(that.searchParams).then(data => data.export_id))
      .then((exportID) => {
        const checkStatus = () => {
          that.$api.getExportStatusV2(exportID).then((data) => {
            if (data.status === 'RUNNING') {
              setTimeout(() => { checkStatus(); }, 1000);
              return;
            }
            if (data.status === 'COMPLETED') {
              const token = window.localStorage.getItem('token');
              window.open(`${STATS_RECORD_EXPORT}/${exportID}?token=Bearer%20${token}`);
            } else {
              that.$notifyFail(`${that.$t('general.export')}${that.$t('general.fail')}`);
            }
            that.$emit('endLoading');
          });
        };
        checkStatus();
      });
    },
    fillCategoryMap(category) {
      if (!category) {
        return;
      }
      const that = this;
      that.categoryIDMap[category.id] = category;
      if (that.categoryNameMap[category.name]) {
        that.categoryNameMap[category.name].push(category);
      } else {
        that.categoryNameMap[category.name] = [category];
      }
      if (!category.children) return;
      category.children.forEach((child) => {
        that.fillCategoryMap(child);
      });
    },
    convertAPIData(datas) {
      const that = this;
      datas.forEach((data) => {
        if (data.faq_cat_name) {
          data.faq_cat_id = data.faq_cat_name;
          if (that.categoryIDMap[data.faq_cat_id]) {
            data.faq_cat_name = that.categoryIDMap[data.faq_cat_id].name;
          } else {
            data.faq_cat_name = '';
          }
        }
        if (data.emotion) {
          if (that.emotionRevMap[data.emotion]) {
            data.emotion = that.emotionRevMap[data.emotion];
          } else {
            data.emotion = that.$t('dimension.emotions.neutral');
          }
        }
        const moduleKey = `statistics.modules.${data.module}`;
        if (data.module && that.$t(moduleKey) !== moduleKey) {
          data.module = that.$t(moduleKey);
        }
      });
    },
    refreshCategory() {
      const that = this;
      that.categoryOption = [
        { value: '', text: this.$t('general.all') },
      ];
      return that.$api.getSSMCategories(that.userID).then((data) => {
        if (!data) {
          return;
        }
        that.categoryRoot = data;
        that.fillCategoryMap(that.categoryRoot);
        if (data.name === '') {
          data.name = that.$t('qalist.un_category');
        }
        that.categoryOption.push({
          text: data.name,
          value: data.id,
        });
        if (!that.categoryRoot.children) return;
        that.categoryRoot.children.forEach((firstLayer) => {
          const opt = {
            text: firstLayer.name,
            value: firstLayer.id,
            options: [],
          };
          if (firstLayer.children) {
            firstLayer.children.forEach((secondLayer) => {
              opt.options.push({
                text: secondLayer.name,
                value: secondLayer.id,
              });
            });
          }
          that.categoryOption.push(opt);
        });
      });
    },
    refreshLabels() {
      const that = this;
      that.labelsOptions = [];
      return that.$api.getSSMLabels().then((data) => {
        that.labelsOptions = data.map(d => ({
          text: d.name,
          value: d.id,
        }));
      });
    },
    doSearch(page) {
      const that = this;
      that.pageIndex = page;
      that.searchParams = this.getSearchParam();
      that.setDailySearchParams(that.searchParams);
      that.isTableLoading = true;
      that.showTable = true;
      return that.refreshCategory()
      .then(() => that.refreshLabels())
      .then(() => that.$api.getRecordsV2(that.searchParams, page, that.pageLimit))
      .then((res) => {
        that.convertAPIData(res.data);
        that.tableData = that.appendTableDataAction(res.data);
        if (that.headerInfo === undefined || that.headerInfo.length <= 0) {
          that.headerInfo = that.receiveAPIHeader(res.table_header);
        }
        that.totalCount = res.total_size;
        that.markedCount = res.marked_size;
        that.ignoredCount = res.ignored_size;
        that.checkedDataRow = []; // clear all checked
        that.reloadClusterDropdown();
        that.isTableLoading = false;
        // that.showTable = true;
      })
      .catch((err) => {
        console.log({ err });
        that.$notifyFail(that.$t('statistics.error.search_fail'));
        that.isTableLoading = false;
      });
    },
    receiveAPIHeader(headerData) {
      const that = this;
      const headerMap = {};
      headerData.forEach((header) => {
        header.key = header.id;
        header.default = false;
        header.width = that.headerWidth[header.key];
        if (header.width === undefined) {
          header.width = '80px';
        }
        headerMap[header.key] = header;
      });
      that.defaultHeader.forEach((key) => {
        if (headerMap[key] === undefined) {
          return;
        }
        headerMap[key].default = true;
      });
      headerData.push({
        key: 'stdq_mark',
        text: that.$t('statistics.stdq_mark'),
        type: 'action',
        width: '100px',
        lockedRight: true,
      }, {
        key: 'intent_mark',
        text: that.$t('statistics.intent_mark'),
        type: 'action',
        width: '80px',
        lockedRight: true,
      }, {
        key: 'action',
        text: that.$t('statistics.action'),
        type: 'action',
        info: that.$t('statistics.action_info'),
        width: '80px',
        lockedRight: true,
      });
      return headerData;
    },
    setUpTime(day) {
      const that = this;
      if (day === -1) {
        return;
      }
      const now = new Date();
      const endDate = new Date();
      const startDate = new Date();
      endDate.setDate(now.getDate());
      startDate.setDate(now.getDate() - day);

      that.$refs.start.$emit('setValue', startDate);
      that.$refs.end.$emit('setValue', endDate);

      const startDateObj = that.setStartDateObj(startDate);
      const endDateObj = that.setEndDateObj(endDate);
      that.start = startDateObj;
      that.end = endDateObj;
      that.endDisableDate = {
        to: that.start.dateObj,
      };
      that.startDisableDate = {
        from: that.end.dateObj,
      };
      that.$nextTick(() => {
        that.dayRange = day;  // update lable switch after datepicker is updated
      });
    },
    setStartDateObj(d) {
      const startDateObj = pickerUtil.createDateObj();
      startDateObj.dateObj = d;
      pickerUtil.initTimeObj(startDateObj);
      return startDateObj;
    },
    setEndDateObj(d) {
      const endDateObj = pickerUtil.createDateObj();
      endDateObj.dateObj = d;
      pickerUtil.initTimeObj(endDateObj);
      return endDateObj;
    },
    handleStartDateChanged(d) {
      this.dayRange = -1;
      this.start.dateObj = d;
      pickerUtil.initTimeObj(this.start);
      this.endDisableDate = {
        to: this.start.dateObj,
      };
    },
    handleEndDateChanged(d) {
      this.dayRange = -1;
      this.end.dateObj = d;
      pickerUtil.initTimeObj(this.end);
      this.startDisableDate = {
        from: this.end.dateObj,
      };
    },
    refreshPlatforms() {
      const that = this;
      return that.$api.getTagTypes().then((data) => {
        data.forEach((d) => {
          if (d.type === 'platform' && d.values.length > 0) {
            const newPlatformOptions = [];
            d.values.forEach((v) => {
              newPlatformOptions.push({
                value: v.id,
                text: v.text,
              });
            });
            that.platformOptions = newPlatformOptions;
          }
        });
      });
    },
  },
  computed: {
    ...mapGetters([
      'robotID',
      'userID',
      'dailyCurrentView',
    ]),
    hasCheckedDataRow() {
      return this.checkedDataRow.length > 0;
    },
    checkedDataRowCount() {
      return this.checkedDataRow.length;
    },
    validTimeRange() {
      if (this.end !== undefined && this.start !== undefined) {
        return this.end.dateObj > this.start.dateObj;
      }
      return this.end === undefined || this.start === undefined;
    },
    validInputString() {
      return this.startValidity && this.endValidity;
    },
    validFormInput() {
      return this.validTimeRange && this.validInputString;
    },
    showPagination() {
      return this.showTable && this.totalCount > 0;
    },
    canExport() {
      return this.$hasRight('export');
    },
    trimmedUserID() {
      return this.userId.trim();
    },
    trimmedKeyword() {
      return this.keyword.trim();
    },
    trimmedIntent() {
      return this.intent.trim();
    },
  },
  beforeMount() {
    pickerUtil.initTime(this);
    this.startDisableDate = this.end ? {
      from: this.end.dateObj,
    } : undefined;
    this.endDisableDate = this.start ? {
      to: this.start.dateObj,
    } : undefined;
    this.$nextTick(() => {
      this.dayRange = 1;  // update lable switch after datepicker is updated
    });
  },
  activated() {
    if (this.isMount) { // activated by mount
      this.isMount = false;
    } else {            // activated by click goback button
      this.showTable = false;
      // Refill keyword
      const lastKeyword = this.keyword;
      this.keyword = '';
      this.$nextTick(() => {
        this.keyword = lastKeyword;
      });
      this.doSearch(1);
    }
  },
  mounted() {
    const that = this;
    that.isMount = true;
    that.$startPageLoading();
    that.refreshCategory()
    .then(() => that.refreshLabels())
    .then(() => that.refreshPlatforms())
    .then(() => {
      that.$emit('endLoading');
    });

    Object.keys(that.emotionMap).forEach((key) => {
      that.emotionMap[key].forEach((val) => {
        that.emotionRevMap[val] = key;
      });
    });
  },
};
</script>

<style lang="scss" scoped>

#cluster-loading {
  background-color: $color-white;
  @include font-14px();
  color: $color-font-mark;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  #clustering-msg {
    margin-top: 18px;
  }
}
.content {
  .page-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}

.page-header {
  flex: 0 0 60px;
  padding: 0 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid $color-borderline;
  @include font-16px();
  color: $color-font-active;
  display: flex;
  align-items: center;
  .icon {
    margin-left: 6px;
  }
}

.header {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-end;
  padding-right: 20px;
  padding-bottom: 10px;
  box-shadow: inset 0 -1px 0 0 #e9e9e9;
  .filter-rows {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .operation {
    flex: 0 0 auto;
    display: flex;
    margin-bottom: 10px;
    .show-more {
      @include click-button();
      display: flex;
      align-items: center;
      margin-left: 12px;
      .text {
        margin-right: 5px;
      }
      &:not(.more) {
        .expand-icon {
          transform: rotate(180deg);
        }
      }
    }
  }
}

.row {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  .row-title {
    @include font-14px();
    flex: 0 0 auto;
    min-width: 56px;
    margin-right: 10px;
    margin-left: 20px;
  }
  .row-value {
    flex: 0 0 300px;
    display: flex;
    align-items: center;
    &.short {
      flex: 0 0 130px;
    }
    .label-switch {
      flex: 0 0 auto;
      margin-right: 5px;
    }
    .datetimepicker{
      margin: 0 5px;
    }
    .input {
      // padding-left: 10px;
      flex: 1;
      display: flex;
    }
    .single-input {
      display: block;
      flex: 1;
      // width: 300.px;
    }
  }
  .score-range {
    display: flex;
    align-items: center;
    margin-left: 10px;
    .range-icon {
      margin: 0 4px;
    }
    .score-input {
      display: block;
      width: 60px;
    }
  }
}

.button-container {
  flex: 0 0 auto;
  line-height: $default-line-height;
  display: flex;
  align-items: center;
  padding: 20px;
  .total-show:not(:first-child) {
    margin-left: 10px;
    @include font-14px();
  }
  .search-more {
    @include click-button();
    color: $color-primary;
  }
  .text-button {
    &:not(:first-child) {
      margin-left: 10px;
    }
    &.disabled {
      pointer-events: none;
    }
  }
  #clusterBtn {
    margin-left: 10px;
    position: relative;
    &.disabled {
      pointer-events: none;
    }
  }
  #markBtn {
    margin-left: 10px;
    position: relative;
    &.disabled {
      pointer-events: none;
    }
  }
  .icon {
    margin-left: 7px;
  }
}

.table-container {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  @include auto-overflow();
}
.paginator {
  box-shadow: inset 0 1px 0 0 #e9e9e9;
  padding-right: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 50px;
}

</style>
