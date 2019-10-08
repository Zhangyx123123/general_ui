<template>
  <div class='stats-chart'>
    <div v-if="errMsg" class="err-msg">
      <!-- <div class="err-title">{{ $t('error_msg.get_stats_error') }}</div> -->
      <div class="err-detail">{{ errMsg }} </div>
    </div>
    <div v-if="value.showTable && !showLoading" class="table">
      <table>
        <tr>
          <td v-for="keyInfo in headerInfo" :key="keyInfo.id">
            {{ keyInfo.text }}
          </td>
        </tr>
        <tr v-for="data in this.data" :key="data.rank">
          <td v-for="keyInfo in headerInfo" :key="keyInfo.id">
            {{ data[keyInfo.id] }}
          </td>
        </tr>
      </table>
    </div>
    <div class="chart-container">
      <chart
        :handler="handler"
        :chartData="data"
        :keyMap="value.keyMaps"
        :type="value.type"
        :nameKey="value.nameKey"
        :height="value.height"></chart>
    </div>
    <div v-if="showLoading" class="loading">
      {{ $t('general.loading') }}
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

let loaded = false;

export default {
  components: {
    chart: () => import('./Charts').then((data) => {
      loaded = true;
      return data;
    }),
  },
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      data: undefined,
      errMsg: '',
      headerInfo: [],
      handler: new Vue(),
    };
  },
  methods: {
    updateChart() {
      const that = this;
      // use next tick to ensure the chart component can get latest data as prop
      that.$nextTick(() => {
        if (loaded) {
          that.handler.$emit('redraw');
        } else {
          setTimeout(() => {
            that.updateChart();
          }, 200);
        }
      });
    },
    getAjaxData() {
      this.value.getData(this.value.param).then((res) => {
        if (res) {
          this.data = this.value.customData ? this.value.customData(res.data) : res.data;
          this.headerInfo = [];
          if (this.value.header_info) {
            this.value.header_info.forEach((header) => {
              this.headerInfo.push(header);
            });
          }
          if (res.table_header) {
            res.table_header.forEach((header) => {
              this.headerInfo.push(header);
            });
          }
          if (res.header_info) {
            res.header_info.forEach((header) => {
              this.headerInfo.push(header);
            });
          }
          this.updateChart();
        } else {
          this.errMsg = this.$t('error_msg.data_not_ready');
        }
        this.$emit('finish');
      }, (err) => {
        this.errMsg = err.message;
        this.$emit('finish');
      });
    },
    getCsvData() {
      const that = this;
      const keys = that.headerInfo.map(header => header.id);
      let output = '';
      output += `${that.headerInfo.map(header => header.text).join(',')}\n`;

      that.data.forEach((row) => {
        output += `${keys.map(key => row[key]).join(',')}\n`;
      });
      return output;
    },
  },
  computed: {
    showLoading() {
      return this.errMsg === '' && !this.data;
    },
  },
  mounted() {
    this.getAjaxData();
    this.value.handler.$on('redraw', () => {
      this.getAjaxData();
    });
  },
};
</script>
<style lang="scss">
@import 'styles/lib/c3.scss';
</style>
<style lang="scss" scoped>
@import 'styles/variable.scss';
$row-height: $default-line-height;
$stat-card-height: 300px;

.stats-chart {
  overflow: hidden;
  height: 100%;
  position: relative;
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
    text-align: center;
    min-width: 95%;
    max-width: 95%;
    margin: 0 auto;
    table {
      border-collapse: collapse;
      margin: 0 auto;
      tr {
        td {
          word-break: break-all;
          border: 1px solid $page-header-color;
          padding: 5px 10px;
        }

        &:first-child {
          background: $page-header-color;
          color: white;
        }
      }
    }
  }
}
</style>