<template>
  <div id="statistic-dash" class="multi-card">
    <div class="content">
      <div class="card statistic" v-for="(chartInfo, index) in chartInfos" :key="chartInfo.name"
        :class="[chartInfo.cols === 2 ? 'w-fill': 'w-half', chartInfo.rowFirst ? 'first' : '', chartInfo.showType]">
        <template v-if="chartInfo.showType === 'chart'">
          <div class="statistic-title">{{ chartInfo.name }}</div>
          <div class="statistic-select">
            <div>
              <!-- Used for time select -->
              <label-switch
                :options="daysToOptions([1, 7, 30])"
                @change="selectChange(chartInfo, $event)"/>
              <!-- Used for dimension select -->
              <label-switch class='dimension-selector'
                v-if="chartInfo.types !== undefined"
                :options="typesToOption(chartInfo.types)"
                @change="typeSelectChange(chartInfo, $event)"/>
            </div>
          </div>
          <div class="statistic-content">
            <stats-chart v-on:finish="chartInfo.finish=true" v-model="chartInfos[index]"></stats-chart>
          </div>
        </template>
        <template v-else-if="chartInfo.showType === 'table'">
          <div class="statistic-title">{{ chartInfo.name }}</div>
          <div class="statistic-select">
            <label-switch
              :options="daysToOptions([1, 7, 30])"
              @change="selectChange(chartInfo, $event)"/>
          </div>
          <div class="statistic-content">
            <stats-table v-on:finish="chartInfo.finish=true" v-model="chartInfos[index]"></stats-table>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import format from '@/utils/js/format';
import tagAPI from '@/api/tagType';

import StatsChart from '../Statistics/_components/StatsChart';
import StatsTable from '../Statistics/_components/StatsTable';
import API from '../Statistics/_api/statistic';

function getTimeRange(days) {
  const now = new Date();
  const endDate = new Date();
  const startDate = new Date();
  endDate.setDate(now.getDate() - 1);
  startDate.setDate(now.getDate() - days);
  return [startDate, endDate];
}

export default {
  path: 'statistic-dash',
  privCode: 'statistic_dash',
  displayNameKey: 'statistic_dash',
  icon: 'white_dashboard',
  api: [tagAPI, API],
  components: {
    StatsChart,
    StatsTable,
  },
  methods: {
    typesToOption(types) {
      return types.map(type => ({
        text: type.msg,
        val: type.key,
      }));
    },
    daysToOptions(days) {
      const that = this;
      return days.map(day => ({
        text: `${day} ${that.$t('statistics.day')}`,
        val: day,
      }));
    },
    typeSelectChange(chartInfo, val) {
      chartInfo.param.category = val;
      chartInfo.finish = false;
      chartInfo.handler.$emit('redraw');
    },
    selectChange(chartInfo, val) {
      chartInfo.param.days = val;
      const range = getTimeRange(val);
      const startDate = range[0];
      const endDate = range[1];
      chartInfo.param.t1 = format.dateToString(startDate);
      chartInfo.param.t2 = format.dateToString(endDate);
      chartInfo.finish = false;
      if (chartInfo.handler) {
        chartInfo.handler.$emit('redraw');
      }
      if (chartInfo.tableHandler) {
        chartInfo.tableHandler.$emit('redraw');
      }
    },
    setUpMsgs() {
      const that = this;
      this.chartInfos = [
        {
          handler: new Vue(),
          finish: false,
          name: `${that.$t('statistics.visit_record')}(${that.$t('statistics.time')})`,
          type: 'line',
          param: {
            days: 1,
            type: 'time',
          },
          cols: 2,
          getData: that.$api.getVisitStats2,
          keyMaps: {
            total_asks: that.$t('statistics.total_asks_num'),
            conversations: that.$t('statistics.session_num'),
            unique_users: that.$t('statistics.unique_user'),
          },
          nameKey: 'time_txt',
          customData(datas) {
            return datas.quantities;
          },
          showType: 'chart',
        },
        {
          handler: new Vue(),
          finish: false,
          name: `${that.$t('statistics.qa_record')}`,
          type: 'bar',
          param: {
            days: 1,
            type: 'barchart',
            filter: 'qtype',
          },
          getData: that.$api.getVisitStats2,
          keyMaps: {
            total_asks: that.$t('statistics.total_asks_num'),
          },
          customData(datas) {
            datas.forEach((data) => {
              data.total_asks = data.q.total_asks;
            });
            return datas;
          },
          rowFirst: true,
          nameKey: 'name',
          showType: 'chart',
        },
        // {
        //   tableHandler: new Vue(),
        //   finish: false,
        //   name: `${that.$t('statistics.hot_question')} Top 20`,
        //   param: {
        //     days: 1,
        //     type: 'top',
        //   },
        //   getData: that.$api.getTopQuestions2,
        //   tableColumns: {
        //     question: {
        //       text: that.$t('statistics.user_question'),
        //     },
        //     q: {
        //       text: that.$t('statistics.count'),
        //       width: '80px',
        //     },
        //   },
        //   rowFirst: true,
        //   showType: 'table',
        // },
        {
          tableHandler: new Vue(),
          finish: false,
          name: `${that.$t('statistics.failed_question')} Top 20`,
          param: {
            days: 1,
            type: 'unused',
          },
          getData: that.$api.getTopQuestions2,
          tableColumns: {
            question: {
              text: that.$t('statistics.user_question'),
            },
            q: {
              text: that.$t('statistics.count'),
              width: '80px',
            },
          },
          showType: 'table',
        },
        {
          handler: new Vue(),
          finish: false,
          name: `${that.$t('statistics.visit_record')}(${that.$t('statistics.dimension')})`,
          type: 'bar',
          param: {
            days: 1,
            type: 'barchart',
            filter: 'category',
            category: 'platform',
          },
          cols: 2,
          getData: that.$api.getVisitStats2,
          keyMaps: {
            total_asks: that.$t('statistics.total_asks_num'),
          },
          nameKey: 'name',
          wrapWidth: 20,
          customData(datas) {
            datas.forEach((data) => {
              data.total_asks = data.q.total_asks;
            });
            return datas;
          },
          types: that.tagTypes,
          rowFirst: true,
          showType: 'chart',
        },
      ];
      this.chartInfos.forEach((info) => {
        const range = getTimeRange(1);
        info.param.t1 = format.dateToString(range[0]);
        info.param.t2 = format.dateToString(range[1]);
        info.height = 210;
      });
      this.tableInfos.forEach((info) => {
        const range = getTimeRange(1);
        info.param.t1 = format.dateToString(range[0]);
        info.param.t2 = format.dateToString(range[1]);
      });
    },
  },
  data() {
    return {
      chartInfos: [],
      tableInfos: [],
      tagTypes: [],
    };
  },
  deactivated() {
    this.chartInfos = [];
    this.tableInfos = [];
  },
  mounted() {
    const that = this;
    that.$startPageLoading();
    that.$api.getTagTypes().then((data) => {
      that.tagTypes = data.map(d => ({
        key: d.type,
        msg: d.text,
      }));
      that.setUpMsgs();
    }, (err) => {
      console.log(err);
    })
    .finally(() => {
      that.$emit('endLoading');
    });
    that.chartInfos.forEach((chartInfo) => {
      chartInfo.handler.$emit('redraw');
    });
    that.tableInfos.forEach((tableInfo) => {
      tableInfo.tableHandler.$emit('redraw');
    });
  },
};
</script>
<style lang="scss" scoped>
@import 'styles/variable.scss';
$row-height: $default-line-height;
$stat-card-height: 300px;

#statistic-dash {
  @include auto-overflow();
  @include customScrollbar();
  & > .content {
    .statistic {
      height: $stat-card-height;
      float: left;
      overflow: hidden;
      &:last-child {
        margin-bottom: 20px;
      }
      &.chart {
        .statistic-content {
          overflow:hidden;
          padding: 0 20px;
        }
      }
      &.table {
        .statistic-content {
          @include auto-overflow();
        }
      }

      .statistic-title {
        width: 100%;
        text-align: left;
        height: 60px;
        padding: 0 20px;
        display: flex;
        align-items: center;
        font-size: 16px;
        line-height: 16px;
        color: #333333;
      }
      .statistic-select {
        padding: 10px 20px;
        padding-top: 0px;
        .dimension-selector {
          margin-left: 20px;
        }
      }
      .statistic-content {
        height: calc(#{$stat-card-height} - 100px);
      }
    }
  }
}
</style>
