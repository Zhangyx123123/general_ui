<template>
  <div class="statistic-audit">
    <div class="card w-fill h-fill">
      <div class="header">
        <div class="filter">
          <div class="row">
            <div class="row-title">{{ $t('statistics.time_range') }}</div>
            <datetime-picker
              :value="start"
              :disableDate="startDisableDate"
              @dateChanged="handleStartDateChanged"
              @validityChange="value => {startValidity = value}"
            ></datetime-picker>
            ～
            <datetime-picker
              :value="end"
              :disableDate="endDisableDate"
              @dateChanged="handleEndDateChanged"
              @validityChange="value => {endValidity = value}"
            ></datetime-picker>
            <div class="row-title inline">{{ $t('statistics.user_id') }}</div>
            <input v-model="userNick">
          </div>
          <template v-if="expertMode">
          <div class="row">
            <div class="row-title">{{ $t('statistics.audit.op_module') }}</div>
            <label-switch :options="listToOptions(moduleList)" v-model="selectModule"/>
          </div>
          <div class="row">
            <div class="row-title">{{ $t('statistics.audit.op_type') }}</div>
            <label-switch :options="listToOptions(actionList)" v-model="selectAction"/>
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
      <!-- <div class="row" v-if="!validTimeRange">
        <label class="error_msg">{{ $t('error_msg.time_range_error') }}</label>
      </div> -->
      <div class="button-container row" v-if="canExport || totalCount > 0">
        <text-button v-if="canExport"
          v-on:click="doExport()"
          :disabled="!validFormInput"
          :button-type="totalCount > 0 ? 'default' : 'disable'">{{ $t('general.export') }}</text-button>
        <div v-if="totalCount > 0" class="total-show">
          {{ $t('statistics.total_records', {num: totalCount}) }}
        </div>
      </div>
      <template v-if="showTable">
      <div class="table-container" v-if="showTable">
        <general-table auto-height show-empty :tableData="tableData" :tableHeader="headerInfo" ></general-table>
      </div>
      <div class="paginator">
        <v-pagination size="small" v-if="showPagination" :pageIndex="pageIndex" :pageSizeOption="[25, 50, 100, 200, 500, 1000]" v-on:page-change="doSearch" @page-size-change="handlePageSizeChange" :total="totalCount" :page-size="pageLimit" :layout="['prev', 'pager', 'next', 'sizer', 'jumper']"></v-pagination>
      </div>
      </template>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import DatetimePicker from '@/components/DateTimePicker';
import GeneralTable from '@/components/GeneralTable';
import pickerUtil from '@/utils/vue/DatePickerUtil';
import csvUtil from '@/utils/js/csv';
import miscUtil from '@/utils/js/misc';
import auditAPI from '@/api/audit';

import api from './_api/statistic';
// import auth from '@/auth';

const timeFormatWithoutSecond = 'YYYYMMDDHHmm';
const timeFormatFull = 'YYYY-MM-DD HH:mm:ss';

export default {
  path: 'statistic-audit',
  privCode: 'statistic_audit',
  displayNameKey: 'statistic_audit',
  icon: 'white_audit',
  name: 'statistic-audit',
  api: [api, auditAPI],
  components: {
    DatetimePicker,
    GeneralTable,
  },
  methods: {
    listToOptions(actions) {
      const keys = Object.keys(actions);
      keys.sort();
      const options = keys.map(key => ({
        text: actions[key],
        val: key,
      }));
      return options;
    },
    handleStartDateChanged(d) {
      this.start.dateObj = d;
      pickerUtil.initTimeObj(this.start);
      this.endDisableDate = {
        to: this.start.dateObj,
      };
    },
    handleEndDateChanged(d) {
      this.end.dateObj = d;
      pickerUtil.initTimeObj(this.end);
      this.startDisableDate = {
        from: this.end.dateObj,
      };
    },
    handlePageSizeChange(pageSize) {
      const that = this;
      that.pageLimit = pageSize;
      that.doSearch(1);
    },
    doExport() {
      const that = this;
      if (that.totalCount <= 0) {
        return;
      }

      const module = 'statistic-audit';
      const startTimeString = moment(that.start.getTimestamp() * 1000)
        .format(timeFormatWithoutSecond);
      const endTimeString = moment(that.end.getTimestamp() * 1000)
        .format(timeFormatWithoutSecond);
      const filename = `${that.$t('statistics.audit_record_filename')}_${startTimeString}_${endTimeString}.csv`;

      const params = {
        start_time: that.start.getTimestamp(),
        end_time: that.end.getTimestamp(),
        filters: {
          module: '-1',
          operation: '-1',
        },
        export: true,
      };
      // only in export mode, filter with module and action
      if (that.expertMode) {
        params.filters = {
          module: that.selectModule,
          operation: that.selectAction,
        };
      }
      if (that.userNick) {
        params.filters.uid = that.userNick;
      }
      that.$startPageLoading();

      that.$api.auditExportLog({
        module,
        filename,
      }).then(() => that.$api.getAuditLog(params)).then((data) => {
        let recordArray = data.data.result.data;
        recordArray = that.convertAPIDataToTable(recordArray);
        const csvData = csvUtil.convertToCSV(recordArray, this.headerInfo);
        const blobData = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvData], { type: 'text/csv' });
        miscUtil.downloadRawFile(blobData, filename);
        that.$emit('endLoading');
      }, () => {
        that.$emit('endLoading');
      });
    },
    doSearch(page) {
      this.pageIndex = page;
      const that = this;
      const params = {
        start_time: that.start.getTimestamp(),
        end_time: that.end.getTimestamp(),
        filters: {
          module: '-1',
          operation: '-1',
        },
        page,
        limit: that.pageLimit,
      };
      // only in export mode, filter with module and action
      if (that.expertMode) {
        params.filters = {
          module: that.selectModule,
          operation: that.selectAction,
        };
      }
      if (that.userNick) {
        params.filters.uid = that.userNick;
      }

      that.$startPageLoading();
      that.$api.getAuditLog(params).then((data) => {
        const res = data.data;
        if (res.status === 0) {
          that.showTable = true;
          that.tableData = that.convertAPIDataToTable(res.result.data);
          that.totalCount = res.result.total;
        } else {
          that.$popError(that.$t('error_msg.get_stats_error'), res.message);
        }
        that.$emit('endLoading');
      }, () => {
        that.$emit('endLoading');
      });
    },
    convertAPIDataToTable(datas) {
      const that = this;
      datas.forEach((data) => {
        data.create_time = moment(data.create_time).format(timeFormatFull);
        data.result = data.result === 0 ? that.$t('general.fail') : that.$t('general.success');
        data.module = that.moduleList[data.module];
        data.operation = this.actionList[data.operation];
      });
      return datas;
    },
    mapCodeToString(datas) {
      const that = this;
      datas.forEach((data) => {
        data.result = data.result === 0 ? that.$t('general.fail') : that.$t('general.success');
        data.module = this.moduleList[data.module];
        data.operation = this.actionList[data.operation];
      });
      return datas;
    },
  },
  data() {
    return {
      start: pickerUtil.createDateObj(),
      end: pickerUtil.createDateObj(),
      userNick: '',
      expertMode: false,
      actionList: {
        '-1': this.$t('general.all'),
        0: this.$t('privileges.actions.create'),
        1: this.$t('privileges.actions.edit'),
        2: this.$t('privileges.actions.delete'),
        3: this.$t('privileges.actions.import'),
        4: this.$t('privileges.actions.export'),
        6: this.$t('privileges.actions.login'),
        7: this.$t('privileges.actions.publish'),
        8: this.$t('privileges.actions.active'),
        9: this.$t('privileges.actions.deactive'),
      },
      selectAction: '-1',
      moduleList: {
        '-1': this.$t('general.all'),
        0: this.$t('pages.robot_setting.robot_chat_skill'),
        1: this.$t('pages.robot_setting.robot_function'),
        2: this.$t('pages.ssm.module_name'),
        3: this.$t('pages.robot_setting.robot_profile'),
        // 4: '开关管理',
        5: this.$t('pages.wordbank.module_name'),
        6: this.$t('pages.statistics.module_name'),
        7: this.$t('pages.privileges.user_manage'),
        8: this.$t('pages.privileges.role_manage'),
        9: this.$t('pages.task_engine.module_name'),
        10: this.$t('pages.intent_engine.module_name'),
      },
      selectModule: '-1',
      tableData: [],
      headerInfo: [
        {
          text: this.$t('statistics.audit.user_id'),
          key: 'user_id',
          type: 'text',
          wrap: true,
          width: '10%',
        },
        {
          text: this.$t('statistics.audit.op_module'),
          key: 'module',
          type: 'map-text',
          map: this.moduleList,
          width: '10%',
        },
        {
          text: this.$t('statistics.audit.op_type'),
          key: 'operation',
          type: 'map-text',
          map: this.actionList,
          width: '10%',
        },
        {
          text: this.$t('statistics.audit.content'),
          key: 'content',
          type: 'raw-text',
          wrap: true,
          width: '40%',
        },
        {
          text: this.$t('statistics.audit.result'),
          key: 'result',
          type: 'map-text',
          map: {
            0: this.$t('general.fail'),
            1: this.$t('general.success'),
          },
          width: '10%',
        },
        {
          text: this.$t('statistics.audit.create_time'),
          key: 'create_time',
          type: 'text',
          width: '10%',
        },
        {
          text: this.$t('statistics.audit.ip_source'),
          key: 'user_ip',
          type: 'text',
          width: '10%',
        },
      ],
      showTable: false,
      totalCount: 0,
      startValidity: true,
      endValidity: true,
      pageIndex: 1,
      pageLimit: 25,
      startDisableDate: undefined,
      endDisableDate: undefined,

    };
  },
  computed: {
    canExport() {
      return this.$hasRight('export');
    },
    validTimeRange() {
      return this.end.dateObj > this.start.dateObj;
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
  },
  beforeMount() {
    pickerUtil.initTime(this);
    this.startDisableDate = {
      from: this.end.dateObj,
    };
    this.endDisableDate = {
      to: this.start.dateObj,
    };
  },
  activated() {
    pickerUtil.initTime(this);
    this.userNick = '';
    this.selectAction = '-1';
    this.selectModule = '-1';
    this.showTable = false;
    this.totalCount = 0;
  },
};
/*
*/
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';

$main-color: black;
$row-height: $default-line-height;
$title-color: #666666;

.card {
  padding: 10px 0 0 0;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 0 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-end;
  .filter {
    flex: 1;
  }
  .operation {
    flex: 0 0 auto;
    display: flex;
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

.statistic-audit {
  .row {
    flex: 0 0 auto;
    margin-top: 10px;
    line-height: $row-height;
    display: flex;
    align-items: center;

    .row-title {
      @include font-14px();
      width: 60px;
      margin-right: 20px;
      color: $title-color;
      &.inline {
        margin-left: 20px;
      }
    }
    &.button-container {
      margin-top: 0;
      padding: 20px;
      .total-show:not(:first-child) {
        margin-left: 10px;
      }
      border-top: 1px solid $color-borderline;
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
    box-shadow: inset 0 1px 0 0 $color-borderline-disabled;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 0 0 50px;
    padding-right: 12px;
  }
}
</style>
