<template>
  <div id="statistic-analysis" class="page">
    <div class="content card h-fill w-fill">
      <div class="radio-container page-radio-container">
        <div v-for="chartInfo in chartInfos" :key="chartInfo.name">
          <input :id="chartInfo.code" type="radio" v-model="picked" :value="chartInfo.code" name="picked">
          <div class="header-title">
            <label :for="chartInfo.code">{{ chartInfo.name }}</label>
          </div>
        </div>
        <div v-for="tableInfo in tableInfos" :key="tableInfo.name">
          <input :id="tableInfo.code" type="radio" v-model="picked" :value="tableInfo.code" name="picked">
          <div class="header-title">
            <label :for="tableInfo.code">{{ tableInfo.name }}</label>
          </div>
        </div>
      </div>
      <div :class="{hide: picked != chartInfo.code}" class="statistic-chart" v-for="(chartInfo, index) in chartInfos" :key="chartInfo.name">
        <div class="radio-container select-radio-container">
          <div>{{ $t('statistics.time') }}：</div>
          <div v-for="days in [1, 7, 30]" :key="days">
            <input :disabled="!chartInfo.finish" :id="`${chartInfo.code}_${days}`" type="radio" v-model="chartInfo.param.days" :value="days" :name="chartInfo.code + '_days'">
            <div>
              <label :for="`${chartInfo.code}_${days}`" v-on:click="reloadChartWithDay(chartInfo, days)" >{{ `${days}${$t('statistics.day')}` }}</label>
            </div>
          </div>
          <div>
            <input :disabled="!chartInfo.finish" :id="`${chartInfo.code}_custom`" type="radio" :name="chartInfo.code + '_days'" v-model="chartInfo.param.days" :value=-1>
            <div>
              <label :for="`${chartInfo.code}_custom`">{{ $t('general.custom') }}</label>
            </div>
          </div>
          <div @click="chartInfo.param.days = -1">
            <date-picker
              v-model="chartInfo.startDate"
              :readonly="false"
              format="yyyy/MM/dd"
              language="zh"
              @selected="reloadChartWithRange(chartInfo, 'start')"
              :ref="`${chartInfo.code}_start_picker`"
              :disabled="{to: earliestDate, from: latestDate}"
            ></date-picker>
            ～
            <date-picker
              v-model="chartInfo.endDate"
              :readonly="false"
              format="yyyy/MM/dd"
              language="zh"
              @selected="reloadChartWithRange(chartInfo, 'end')"
              :ref="`${chartInfo.code}_end_picker`"
              :disabled="{to: earliestDate, from: latestDate}"
            ></date-picker>
          </div>
        </div>
        <div class="radio-container select-radio-container" v-if="chartInfo.types.length > 0">
          <div>{{ $t('statistics.selection') }}：</div>
          <div v-for="typeInfo in chartInfo.types" :key="typeInfo.key">
            <input :disabled="!chartInfo.finish" :id="`${chartInfo.code}_${typeInfo.key}`" type="radio" v-model="chartInfo.param.category" :value="typeInfo.key" :name="chartInfo.code + '_types'">
            <div>
              <label :for="`${chartInfo.code}_${typeInfo.key}`" v-on:click="reloadChartWithType(chartInfo, typeInfo)" >{{ typeInfo.msg }}</label>
            </div>
          </div>
        </div>
        <div class="button-container">
          <text-button v-on:click="exportCSV(chartInfo)" v-if="canExport">{{ $t('general.export') }}</text-button>
        </div>
        <div class="statistic-content">
          <stats-chart :ref="chartInfo.code" v-on:finish="chartInfo.finish=true" v-model="chartInfos[index]"></stats-chart>
        </div>
      </div>
      <div :class="{hide: picked != tableInfo.code}" class="statistic-chart" v-for="(tableInfo, index) in tableInfos" :key="tableInfo.name">
        <div class="radio-container select-radio-container">
          <div>{{ $t('statistics.time') }}：</div>
          <div v-for="days in [1, 7, 30]" :key="days">
            <input :disabled="!tableInfo.finish" :id="`${tableInfo.code}_${days}`" type="radio" v-model="tableInfo.param.days" :value="days" :name="tableInfo.code + '_days'">
            <div>
              <label :for="`${tableInfo.code}_${days}`" v-on:click="reloadChartWithDay(tableInfo, days)" >{{ `${days}${$t('statistics.day')}` }}</label>
            </div>
          </div>
          <div>
            <input :disabled="!tableInfo.finish" :id="`${tableInfo.code}_custom`" type="radio" :name="tableInfo.code + '_days'" v-model="tableInfo.param.days" :value=-1>
            <div>
              <label :for="`${tableInfo.code}_custom`">{{ $t('general.custom') }}</label>
            </div>
          </div>
          <div @click="tableInfo.param.days = -1">
            <date-picker
              v-model="tableInfo.startDate"
              :readonly="false"
              format="yyyy/MM/dd"
              language="zh"
              @selected="reloadChartWithRange(tableInfo, 'start')"
              :ref="`${tableInfo.code}_start_picker`"
              :disabled="{to: earliestDate}"
            ></date-picker>
            ～
            <date-picker
              v-model="tableInfo.endDate"
              :readonly="false"
              format="yyyy/MM/dd"
              language="zh"
              @selected="reloadChartWithRange(tableInfo, 'end')"
              :ref="`${tableInfo.code}_end_picker`"
              :disabled="{to: earliestDate}"
            ></date-picker>
          </div>
        </div>
        <div class="button-container">
          <text-button v-on:click="exportCSV(tableInfo)" v-if="canExport">{{ $t('general.export') }}</text-button>
        </div>
        <div class="statistic-content">
          <stats-table :ref="tableInfo.code" v-on:finish="tableInfo.finish=true" v-model="tableInfos[index]"></stats-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import DatePicker from '@/components/DateTimePicker/DatePicker';
import general from '@/utils/js/misc';
import formatUtil from '@/utils/js/format';
import auditAPI from '@/api/audit';
import api from './_api/statistic';
import StatsChart from './_components/StatsChart';
import StatsTable from './_components/StatsTable';

export default {
  path: 'statistic-analysis',
  privCode: 'statistic_analysis',
  displayNameKey: 'statistic_analysis',
  icon: 'white_daily',
  name: 'statistic-analysis',
  components: {
    StatsChart,
    StatsTable,
    DatePicker,
  },
  api: [api, auditAPI],
  methods: {
    exportCSV(chartInfo) {
      const that = this;
      const refName = chartInfo.code;
      const csvData = that.$refs[refName][0].getCsvData();
      const blobData = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvData], { type: 'text/csv' });
      const filename = `${refName}.csv`;
      const module = 'statistic-analysis';

      const param = chartInfo.param;
      const name = chartInfo.name;
      let info = `${name}\n${that.$t('statistics.time')}-${param.t1}~${param.t2}`;
      const type = param.category;
      if (chartInfo.types && chartInfo.types.length > 0) {
        const typeInfo = chartInfo.types.find(x => x.key === type);
        if (typeInfo) {
          info = `${info}, ${that.$t('statistics.selection')}-${typeInfo.msg}`;
        }
      }

      this.$api.auditExportLog({
        module,
        filename,
        info,
      }).then(() => {
        general.downloadRawFile(blobData, filename);
      }, (err) => {
        that.$popErrorWindow(that.$t('error_msg.export_fail'), err);
      });
    },
    reloadChartWithRange(info, type) {
      const that = this;
      if (info.startDate > info.endDate) {
        if (type === 'start') {
          info.endDate = info.startDate;
          that.$refs[`${info.code}_end_picker`][0].$emit('setDate', info.startDate);
        } else {
          info.startDate = info.endDate;
          that.$refs[`${info.code}_start_picker`][0].$emit('setDate', info.endDate);
        }
      }
      info.param.t1 = formatUtil.dateToString(info.startDate);
      info.param.t2 = formatUtil.dateToString(info.endDate);
      if (info.handler) {
        info.handler.$emit('redraw');
      }
      if (info.tableHandler) {
        info.tableHandler.$emit('redraw');
      }
    },
    reloadChartWithDay(info, day) {
      const that = this;
      info.finish = false;
      info.param.days = day;

      const now = new Date();
      const endDate = new Date();
      const startDate = new Date();
      endDate.setDate(now.getDate() - 1);
      startDate.setDate(now.getDate() - day);
      info.startDate = startDate;
      info.endDate = endDate;
      info.param.t1 = formatUtil.dateToString(info.startDate);
      info.param.t2 = formatUtil.dateToString(info.endDate);

      that.$refs[`${info.code}_start_picker`][0].$emit('setDate', info.startDate);
      that.$refs[`${info.code}_end_picker`][0].$emit('setDate', info.endDate);
    },
    reloadChartWithType(chartInfo, typeInfo) {
      chartInfo.finish = false;
      chartInfo.param.category = typeInfo.key;
      if (chartInfo.handler) {
        chartInfo.handler.$emit('redraw');
      }
      if (chartInfo.tableHandler) {
        chartInfo.tableHandler.$emit('redraw');
      }
    },
    setUp() {
      const that = this;
      that.setUpTagTypes().then(() => {
        that.setUpMsgs();
      });
    },
    setUpTagTypes() {
      const that = this;
      return that.$api.getFAQTagTypes().then((data) => {
        that.tagTypes = data;
      });
    },
    setUpMsgs() {
      const that = this;

      const tagTypes = that.tagTypes.map(t => ({
        key: t.code,
        msg: t.name,
      }));

      that.chartInfos = [
        {
          handler: new Vue(),
          finish: false,
          showTable: true,
          name: `${that.$t('statistics.visit_record')}(${that.$t('statistics.time')})`,
          code: 'visit_time',
          type: 'line',
          param: {
            days: 1,
            type: 'time',
          },
          getData: this.$api.getVisitStats2,
          keyMaps: {
            total_asks: that.$t('statistics.total_asks_num'),
            conversations: that.$t('statistics.session_num'),
            unique_users: that.$t('statistics.unique_user'),
          },
          tableColumns: {
            total_asks: that.$t('statistics.total_asks_num'),
            conversations: that.$t('statistics.session_num'),
            unique_users: that.$t('statistics.unique_user'),
          },
          nameKey: 'time_txt',
          customData(datas) {
            return datas.quantities;
          },
          types: [
          ],
        },
        {
          handler: new Vue(),
          showTable: true,
          finish: false,
          name: `${that.$t('statistics.visit_record')}(${that.$t('statistics.dimension')})`,
          code: 'visit_dimension',
          type: 'bar',
          param: {
            days: 1,
            type: 'barchart',
            filter: 'category',
            category: 'platform',
          },
          getData: this.$api.getVisitStats2,
          keyMaps: {
            total_asks: that.$t('statistics.total_asks_num'),
          },
          nameKey: 'name',
          customData(datas) {
            datas.forEach((data) => {
              Object.keys(data.q).forEach((key) => {
                data[key] = data.q[key];
              });
            });
            return datas;
          },
          types: tagTypes,
          header_info: [
            {
              text: '',
              id: 'name',
            },
          ],
        },
      ];
      this.tableInfos = [
        {
          tableHandler: new Vue(),
          finish: false,
          name: `${that.$t('statistics.hot_question')} Top 20`,
          code: 'top_hot',
          param: {
            days: 1,
            type: 'top',
          },
          getData: this.$api.getTopQuestions2,
          tableColumns: {
            question: {
              text: that.$t('statistics.standard_question'),
              width: '500px',
              wrap: true,
            },
            path: {
              text: that.$t('statistics.standard_question_path'),
              width: '300px',
              wrap: true,
            },
            q: that.$t('statistics.count'),
          },
          types: [
          ],
        },
        {
          tableHandler: new Vue(),
          finish: false,
          name: `${that.$t('statistics.failed_question')} Top 20`,
          code: 'top_unused',
          param: {
            days: 1,
            type: 'unused',
          },
          getData: this.$api.getTopQuestions2,
          tableColumns: {
            question: {
              text: that.$t('statistics.user_question'),
              width: '500px',
              wrap: true,
            },
            q: that.$t('statistics.count'),
            first_time_txt: {
              text: that.$t('statistics.question_first_time'),
              width: '130px',
            },
            last_time_txt: {
              text: that.$t('statistics.question_last_time'),
              width: '130px',
            },
          },
          types: [
          ],
        },
        {
          tableHandler: new Vue(),
          finish: false,
          name: `${that.$t('statistics.unresolve_question')} Top 20`,
          code: 'top_unresolve',
          param: {
            days: 1,
            type: 'unsolved',
          },
          getData: this.$api.getTopQuestions2,
          tableColumns: {
            question: {
              text: that.$t('statistics.user_question'),
              width: '300px',
              wrap: true,
            },
            count: that.$t('statistics.count'),
            std_q: {
              text: that.$t('statistics.standard_question'),
              width: '200px',
              wrap: true,
            },
            score: that.$t('statistics.score'),
            answer: {
              text: that.$t('statistics.answer'),
              width: '300px',
              wrap: true,
            },
          },
          types: [
          ],
        },
      ];

      this.chartInfos.forEach((info) => {
        const now = new Date();
        info.endDate = new Date();
        info.startDate = new Date();
        info.endDate.setDate(now.getDate() - 1);
        info.startDate.setDate(now.getDate() - 1);
        info.param.t1 = formatUtil.dateToString(info.startDate);
        info.param.t2 = formatUtil.dateToString(info.endDate);
      });
      this.tableInfos.forEach((info) => {
        const now = new Date();
        info.endDate = new Date();
        info.startDate = new Date();
        info.endDate.setDate(now.getDate() - 1);
        info.startDate.setDate(now.getDate() - 1);
        info.param.t1 = formatUtil.dateToString(info.startDate);
        info.param.t2 = formatUtil.dateToString(info.endDate);
      });
    },
  },
  data() {
    const latestDate = new Date();
    const earliestDate = new Date();
    latestDate.setDate(latestDate.getDate() - 1);
    earliestDate.setDate(earliestDate.getDate() - 365);
    return {
      chartInfos: [],
      tableInfos: [],
      picked: 'visit_time',
      i18n: {},
      latestDate,
      earliestDate,
      tagTypes: [],
    };
  },
  activated() {
    this.picked = 'visit_time';
    this.chartInfos.forEach((chartInfo) => {
      chartInfo.param.days = 1;
      if (chartInfo.param.category) {
        chartInfo.param.category = 'platform';
      }
      chartInfo.handler.$emit('redraw');
    });
    this.tableInfos.forEach((tableInfo) => {
      tableInfo.param.days = 1;
      tableInfo.tableHandler.$emit('redraw');
    });
  },
  mounted() {
    this.setUp();
  },
  computed: {
    canExport() {
      // return auth.checkPrivilege('statistic-analysis', 'export');
      return true;
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable';
$row-height: 40px;
$header-color: black;
$darker-base: #999999;
$main-color: black;
$light-main: lighten($main-color, 15%);

#statistic-analysis {
  .content {
    position: relative;
    .radio-container {
      div {
        display: inline-block;
        input[type=text] {
          padding: 5px;
        }
        input[type=radio] {
          display: none;
          & + div {
            height: $row-height;
            label {
              line-height: $row-height;
              color: grey;
              cursor: pointer;
              user-select: none;

              &:hover {
                color: black;
              }
            }
          }

          &:disabled:not(:checked) + div {
            label {
              cursor: not-allowed;
              &:hover {
                color: grey;
              }
            }
          }

          &:checked + div {
            label {
              color: black;
            }
          }
        }
      }
    }

    .button-container {
      margin: 10px 0;
    }

    .select-radio-container {
      div {
        input[type=radio] {
          & + div {
            padding: 5px 10px;
            label {
              padding: 2px 10px;
            }
          }

          &:checked + div {
            label {
              background: $active-color;
              color: white;
            }
          }
        }
      }
    }

    .page-radio-container {
      text-align: center;
      border-bottom: 2px solid $darker-base;
      div {
        margin-bottom: -1px;
        input {
          & + div {
            label {
              font-size: 1.2em;
            }
            padding: 5px 20px;
          }

          &:checked + div {
            border-bottom: 1px solid $main-color;
          }
        }
      }
    }
    .statistic-chart {
      width: 95%;
      position: absolute;

      &.hide {
        left: -100%;
      }

      .statistic-title {
        width: 100%;
        background: $light-main;
        line-height: $row-height;
        color: white;
        text-align: center;
      }
      .statistic-select {
        line-height: $row-height;
        text-align: center;
        select {
          width: 200px;
        }
      }
      .statistic-content {
        overflow-x: auto;
        overflow-y: hidden;
      }
    }
    .stats-chart {
      height: 100%;
      min-height: 100px;
      position: relative;
      overflow: visible;
      .loading {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .err-msg {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .err-title {
          font-size: 2em;
        }
      }
      .hide {
        display: none;
      }
      .table {
        margin: 10px 0;
        text-align: center;
        table {
          border-collapse: collapse;
          margin: 0 auto;
          tr {
            td {
              border: 1px solid black;
              padding: 5px 10px;
              vertical-align: middle;

              &:first-child {
                white-space: nowrap
              }

              &.wrap {
                white-space: initial;
                word-break: break-all;
              }
            }
    
            &:first-child {
              background: $header-color;
              color: white;
            }
          }
        }
      }
    }
  }
}
</style>
