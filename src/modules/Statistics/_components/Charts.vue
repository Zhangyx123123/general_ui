<template>
  <div class='stats-chart'>
    <vue-c3 :handler="handler"></vue-c3>
  </div>
</template>

<script>
import Vue from 'vue';
import VueC3 from 'vue-c3';

export default {
  components: {
    VueC3,
  },
  props: {
    handler: {
      type: Object,
      default() {
        return new Vue();
      },
    },
    chartData: {
      type: Array,
      default() {
        return [];
      },
    },
    keyMap: {
      type: Object,
      default() {
        return {};
      },
    },
    type: {
      type: String,
      default: 'line',
    },
    nameKey: {
      type: String,
      default: '',
    },
    height: {
      type: Number,
      default: 150,
    },
    dayRangeType: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      data: undefined,
      errMsg: '',
      headerInfo: [],
    };
  },
  methods: {
    updateChart(inputData) {
      const datas = inputData || this.chartData;
      const keyMaps = this.keyMap;
      const showKeys = [];
      if (keyMaps) {
        Object.keys(keyMaps).forEach((key) => {
          datas.forEach((data) => {
            data[keyMaps[key]] = data[key];
          });
          showKeys.push(keyMaps[key]);
        });
      }
      const rightPad = (this.dayRangeType === -1) ? 60 : 20;
      let options = {};
      if (this.type === 'line') {
        options = {
          data: {
            json: datas,
            keys: {
              x: this.nameKey,
              value: showKeys,
            },
          },
          axis: {
            x: {
              type: 'category',
              tick: {
                count: 6,
              },
            },
          },
          padding: {
            left: 50,
            right: rightPad,
          },
        };
      } else if (this.type === 'bar') {
        options = {
          data: {
            json: datas,
            keys: {
              x: this.nameKey,
              value: showKeys,
            },
            type: 'bar',
          },
          axis: {
            x: {
              type: 'category',
            },
          },
          padding: {
            left: 50,
            right: rightPad,
          },
        };
      }
      options.size = {
        height: this.height - 10,
        padding: {
          right: 20,
          left: 20,
          top: 5,
          bottom: 5,
        },
      };
      this.handler.$emit('init', options);
    },
  },
  mounted() {
    const that = this;
    that.handler.$on('redraw', (data) => {
      that.updateChart(data);
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
  overflow-x: hidden;
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
