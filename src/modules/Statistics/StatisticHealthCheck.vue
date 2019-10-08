<template>
  <div>
    <div class="health-check-wrapper card h-fill w-fill">
      <div class="loading-wrapper checking-wrapper" v-show="isChecking">
        <el-progress type="circle" :percentage="reportProgress"></el-progress>
        <p class="training-text">{{$t('statistics.health_check.in_training')}}</p>
      </div>
      <!-- 上一次报告有错误 -->
      <div class="report-error-wrapper" v-if="hasHealthData && generateReportError">
        <img src="../../assets/images/train_error.png"/>
        <h1 class="title">{{$t('statistics.health_check.report_gen_error')}}</h1>
        <p class="desc">{{$t('statistics.health_check.regen_report')}}</p>
        <div>
          <text-button class="generate-btn" button-type="fill" @click="handleGenerateReport">
            {{$t('statistics.health_check.recheck')}}</text-button>
          <text-button class="generate-btn" @click="handleToMaintainSSM">
            {{$t('statistics.health_check.to_ssm')}}</text-button>
        </div>
      </div>
      <!-- 有正确的报告 -->
      <div class="health-data-wrapper" v-else-if="hasHealthData && !generateReportError">
        <h1 class="title">{{$t('pages.statistics.statistic_heatlh_check')}}</h1>
        <div class="sub-bar">
          <div class="desc-box">
            <p class="desc">{{$t('statistics.health_check.desc1')}}</p>
            <p>{{$t('statistics.health_check.desc2')}}</p>
          </div>
          <div class="recheck-box">
            <span>{{$t('statistics.health_check.last_check_time')}}: {{healthData.last_check_time}}</span>
            <text-button v-show="healthData.recheck" class="update-indicator"
            :icon-type="'info_warning'" :icon-size="16">{{$t('statistics.health_check.data_changed')}}</text-button>
            <i class="loading-icon el-icon-loading" v-if="!ssmLqCountLoaded"></i>
            <text-button v-else-if="!hasSSMData" class="to-ssm-btn" button-type="primary"
            @click="handleToMaintainSSM">{{$t('statistics.health_check.to_ssm')}}</text-button>
            <text-button v-else-if="canGenerate && hasSSMData" class="recheck-btn"
            :button-type="healthData.recheck?'primary':'disable'"
            @click="handleGenerateReport">{{$t('statistics.health_check.recheck')}}</text-button>
          </div>
        </div>
        <div class="line">
          <!-- 健康度 -->
          <div class="card-box left-box health-overview-box">
            <h1 class="box-title">{{$t('statistics.health_check.health_value')}}</h1>
            <div class="health-wrapper">
              <div class="chart-icon-box">
                <i class="horizontal-line"></i>
              </div>
              <div id="health_chart" class="chart-box"></div>
              <div class="chart-legend">
                <div class="legend">
                  <i class="box dark-green"></i>
                  <span>{{$t('statistics.health_check.good')}}</span>
                </div>
                <div class="legend">
                  <i class="box normal-green"></i>
                  <span>{{$t('statistics.health_check.normal')}}</span>
                </div>
                <div class="legend">
                  <i class="box light-green"></i>
                  <span>{{$t('statistics.health_check.bad')}}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 语料质量 -->
          <div class="card-box right-box corpus-quality-box">
            <h1 class="box-title">{{$t('statistics.health_check.corpus_quality')}}</h1>
            <div class="action-type-box">
              <i class="circle red"></i>
              <span>{{$t('statistics.health_check.strong_recommend')}}</span>
              <i class="circle orange"></i>
              <span>{{$t('statistics.health_check.recommend')}}</span>
            </div>
            <div class="statistic-box">
              <div class="corpus-statistic-box">
                <label class="label">{{$t('statistics.health_check.corpus_total')}}</label>
                <span class="value">{{healthData.lq_quality.lq_count}}</span>
                <div class="gap"></div>
                <i class="circle red"></i>
                <label class="label">{{$t('statistics.health_check.quality_bad')}}</label>
                <span class="value">{{healthData.lq_quality.bad}}</span>
                <div class="gap"></div>
                <i class="circle orange"></i>
                <label class="label">{{$t('statistics.health_check.quality_normal')}}</label>
                <span class="value">{{healthData.lq_quality.recommended}}</span>
              </div>
            </div>
            <div class="download-box">
              <a class="download-link" target="_blank" :href="healthData.lq_quality.report_file_path">
              {{$t('statistics.health_check.download_report')}}</a>
              <p class="last-check-time" v-show="!healthData.recheck">
              {{$t('statistics.health_check.last_check_time')}}: {{healthData.last_check_time}}</p>
            </div>     
          </div>
        </div>
        <div class="line">
          <!-- 标准问题与语料比 -->
          <div class="card-box left-box sq-vs-corpus-box">
            <h1 class="box-title">{{$t('statistics.health_check.sq_vs_corpus')}}</h1>
            <div class="statistic-box proportion-statistic-box">
              <div class="proportion-statistic">
                <p class="label">{{$t('statistics.health_check.proportion')}}</p>
                <p class="bold-value">{{healthData.lq_sq_rate.sq_lq_rate}}</p>
                <div class="proportion-box">
                  <div>
                    <p class="label">{{$t('statistics.health_check.sq')}}</p>
                    <p class="value">{{healthData.lq_sq_rate.sq_count}}</p>
                  </div>
                  <div>
                    <p class="label">{{$t('statistics.health_check.corpus')}}</p>
                    <p class="value">{{healthData.lq_sq_rate.lq_count}}</p>
                  </div>
                </div>
              </div>
            </div>
            <p class="suggest-proportion">{{suggestSQLQProportion}}</p>
            <p class="suggest-proportion">{{goodSQLQProportion}}</p>
          </div>
          <!-- 语料数量分布 -->
          <div class="card-box right-box corpus-range-box">
            <div class="title-box">
              <h1 class="box-title">{{$t('statistics.health_check.corpus_range')}}</h1>
              <i class="box blue"></i>
              <span>{{$t('statistics.health_check.suggest_range')}}</span>
              <i class="box green"></i>
              <span class="gap">{{$t('statistics.health_check.standard_range')}}</span>
              <i class="loading-icon el-icon-loading" v-if="!ssmDataLoaded"></i>
              <text-button v-else type="normal" @click="handleCheckSSMData">
              {{$t('statistics.health_check.check_corpus_data')}}</text-button>
            </div>
            <div class="corpus-range-chart">
              <div id="corpus_range_chart"></div>
            </div>
          </div>
        </div>
      </div>
      <!-- 没有报告 & 没有ssm数据 -->
      <div v-else-if="!hasSSMData" class="no-data-wrapper">
        <div class="left-part">
          <h1 class="title">{{$t('statistics.health_check.no_ssm_data')}}</h1>
          <p class="desc">{{$t('statistics.health_check.no_ssm_data_desc')}}</p>
          <span class="operate-btn"></span>
          <text-button button-type="fill" class="operate-btn"
          @click="handleToMaintainSSM">{{$t('statistics.health_check.to_ssm')}}</text-button>
        </div>
        <img src="../../assets/icons/no_data.png">
      </div>
      <!-- 没有报告，有ssm数据，显示点击生成报告 -->
      <div v-else class="no-data-wrapper">
        <div class="left-part">
          <h1 class="title">{{$t('statistics.health_check.no_health_data')}}</h1>
          <span class="operate-btn"></span>
          <text-button button-type="fill" class="operate-btn"
          @click="handleGenerateReport">{{$t('statistics.health_check.start_health_check')}}</text-button>
        </div>
        <img src="../../assets/icons/no_data.png">
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import echarts from 'echarts';
import SSMDataList from './_components/SSMDataList';
import api from './_api/health_check';

export default {
  path: 'health-check',
  privCode: 'health_check',
  displayNameKey: 'statistic_heatlh_check',
  icon: 'white_daily',
  name: 'health-check',
  api,

  data() {
    return {
      // 正在生成report
      isChecking: false,
      reportProgress: 0,
      // 有无线下数据
      SSMData: {},
      ssmDataLoaded: false,
      SSMLqCount: 0,
      ssmLqCountLoaded: false,
      healthData: {},
    };
  },
  computed: {
    ...mapGetters([
      'robotID',
      'showLanguage',
    ]),
    hasHealthData() {
      return this.healthData && this.healthData.health_score;
    },
    generateReportError() {
      return this.healthData && this.healthData.report_status === false;
    },
    hasSSMData() {
      return this.SSMLqCount && this.SSMLqCount > 0;
    },
    canGenerate() {
      return this.$hasRight('edit');
    },
    suggestSQLQProportion() {
      let str = '';
      if (this.healthData.lq_sq_rate && this.healthData.lq_sq_rate.remark instanceof Array
      && this.healthData.lq_sq_rate.remark[0]) {
        str = this.$t('statistics.health_check.suggest_proportion').replace(/%1/g, this.healthData.lq_sq_rate.remark[0]);
      }
      return str;
    },
    goodSQLQProportion() {
      let str = '';
      if (this.healthData.lq_sq_rate && this.healthData.lq_sq_rate.remark instanceof Array
      && this.healthData.lq_sq_rate.remark[1]) {
        str = this.$t('statistics.health_check.good_proportion').replace(/%1/g, this.healthData.lq_sq_rate.remark[1]);
      }
      return str;
    },
  },
  components: {
    SSMDataList,
  },
  created() {
    this.$startPageLoading();
    this.getReportStatus();
    this.getSSMData();
    this.getSSMLqCount();
    // this.getHealthReport();
  },
  destroyed() {
    if (this.timer) {
      window.clearTimeout(this.timer);
    }
  },
  mounted() {
    this.generateCharts();
  },
  methods: {
    // 获取SSM列表数据
    getSSMData() {
      this.$api.getSSMData(this.robotID).then((res) => {
        this.SSMData = res.result;
        this.ssmDataLoaded = true;
      }).catch((e) => {
        this.$notifyFail(e.message);
      });
    },
    getSSMLqCount() {
      this.$api.getSSMCorpusTotalCount(this.robotID).then((res) => {
        if (res.result) {
          this.SSMLqCount = res.result.lq_count || 0;
        }
        this.ssmLqCountLoaded = true;
      }).catch((e) => {
        this.$notifyFail(e.message);
      });
    },
    // 获取健康检查报告
    getHealthReport() {
      this.$startPageLoading();
      this.$api.getHealthReport(this.robotID).then((res) => {
        this.healthData = res.result;
        this.$nextTick(() => {
          this.generateCharts();
        });
      }).catch((e) => {
        this.$notifyFail(e.message);
      }).finally(() => {
        this.$endPageLoading();
      });
    },
    handleToMaintainSSM() {
      localStorage.setItem('path', 'ssm');
      window.location = '/ssm.html';
    },
    // 根据参数生成EChart图标
    generateCharts() {
      if (!this.hasHealthData) {
        return;
      }
      this.generateHealthChart(this.healthData.health_score.score,
        this.healthData.health_score.standard.score, 100);
      this.generateProportionLineChart(this.healthData.lq_distribution);
    },
    // 健康度仪表盘
    generateHealthChart(score = 85, scoreLevels = [15, 20], total = 100) {
      if (!document.getElementById('health_chart')) {
        return;
      }
      const ranges = [];
      const colors = ['#AEEAD8', '#5ED5B2', '#21C695'];
      if (scoreLevels instanceof Array && scoreLevels.length > 0) {
        if (scoreLevels[scoreLevels.length - 1] < 100) {
          scoreLevels.push(100);
        }
        scoreLevels.forEach((scoreL, index) => {
          ranges.push([scoreL / total, colors[index]]);
        });
      }
      const healtChart = echarts.init(document.getElementById('health_chart'));
      const healthOption = {
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%',
        },
        series: [
          {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            center: ['50%', '90%'],
            radius: 105,
            axisTick: { show: false },
            axisLabel: { show: false },
            splitLine: { show: false },
            axisLine: { // 仪表盘上不同区域的值和颜色
              show: true,
              lineStyle: {
                width: 105,
                color: ranges,
                // [[bad / total, '#AEEAD8'], [medium / total, '#5ED5B2'], [1, '#21C695']],
              },
            },
            title: { // 左上角标题：“标准问答数据”
              show: true,
              offsetCenter: ['-80', '-125'], // x, y，单位px
              textStyle: {
                color: '#333333',
                fontSize: 12,
              },
            },
            detail: {
              show: true,
              backgroundColor: '#fff',
              borderWidth: 0,
              width: 30,
              height: 20,
              offsetCenter: [0, 10],
              formatter: `{value} ${this.$t('statistics.health_check.score')}`,
              textStyle: {
                fontSize: 12,
                color: '#333333',
              },
            },
            pointer: { width: 0.5, length: '101%' },
            data: [{
              value: score,
              name: this.$t('statistics.health_check.standard_sq_data'),
              label: '',
              itemStyle: {
                normal: {
                  color: '#00857B',
                },
              },
              zlevel: 1,
            }],
          },
        ],
      };
      healtChart.setOption(healthOption);
    },
    // 语料分布线图
    generateProportionLineChart(distribution) {
      if (!document.getElementById('corpus_range_chart')) {
        return;
      }
      if (!distribution.recommended || !distribution.recommended.length
        || !distribution.current || !distribution.current.length) {
        return;
      }
      // 预处理数据
      const xAxisLabels = [];
      const recommenValues = [];
      const actualValues = [];
      distribution.recommended.forEach((item) => {
        xAxisLabels.push(item.label);
        recommenValues.push(item.sq_rate);
      });
      distribution.current.forEach((item) => {
        actualValues.push(item.sq_rate);
      });
      const corpusChart = echarts.init(document.getElementById('corpus_range_chart'));
      const corpusOption = {
        tooltip: {
          trigger: 'axis',
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            name: this.$t('statistics.health_check.xAxis'),
            data: xAxisLabels,
            axisLine: {
              lineStyle: {
                color: '#999999',
                width: 1,
                type: 'solid',
              },
            },
            axisLabel: {
              textStyle: {
                color: '#999999',
              },
              margin: 10,
            },
            axisTick: {
              show: false,
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: this.$t('statistics.health_check.yAxis'),
            axisLabel: {
              formatter: '{value}%',
              margin: 10,
              textStyle: {
                color: '#333',
              },
            },
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
          },
        ],
        series: [
          {
            name: this.$t('statistics.health_check.suggest_range'),
            type: 'line',
            symbol: 'emptyCircle',
            itemStyle: {
              normal: {
                color: '#6AD82D',
                lineStyle: {
                  width: 2,
                  color: '#6AD82D',
                },
              },
              emphasis: {
                label: { show: true },
              },
            },
            smooth: true,
            data: recommenValues,
          },
          {
            name: this.$t('statistics.health_check.actual_range'),
            type: 'line',
            symbol: 'emptyCircle',
            itemStyle: {
              normal: {
                color: '#3D80FF',
                lineStyle: {
                  width: 2,
                  color: '#3D80FF',
                },
              },
              emphasis: {
                label: { show: true },
              },
            },
            smooth: true,
            data: actualValues,
          },
        ],
      };
      corpusChart.setOption(corpusOption);
    },
    handleGenerateReport() {
      // 已有报告且ssm数据没有发生变化时，不能点击生成报告
      if (this.healthData && !this.healthData.recheck) {
        return;
      }
      this.isChecking = true;
      this.reportProgress = 0;
      this.$api.generateHealthReport(this.robotID, this.showLanguage).then(() => {
        this.getReportStatus();
      }).catch((e) => {
        this.$notifyFail(e.message);
        this.isChecking = false;
      });
    },
    getReportStatus() {
      this.$api.getHealthReportStatus(this.robotID).then((res) => {
        if (this.timer) {
          window.clearTimeout(this.timer);
        }
        // status = nodata, progress, done, error
        if (res.result.status === 'progress') {
          this.isChecking = true;
          this.reportProgress = res.result.progress;
          this.timer = window.setTimeout(() => {
            this.getReportStatus();
          }, 1000);
          this.$endPageLoading();
        } else {
          if (res.result.status === 'error') {
            this.$notifyFail(this.$t('statistics.health_check.report_error'));
          }
          this.isChecking = false;
          this.getHealthReport();
        }
      }).catch((e) => {
        this.$notifyFail(e.message);
        this.isChecking = false;
        this.$endPageLoading();
        if (this.timer) {
          window.clearTimeout(this.timer);
        }
      });
    },
    handleCheckSSMData() {
      const options = {
        title: this.$t('statistics.health_check.corpus_data'),
        component: SSMDataList,
        data: {
          ssmData: this.SSMData,
        },
        buttons: ['ok', 'cancel'],
      };
      this.$pop(options);
    },
  },
};
</script>

<style lang="scss" scoped>
.health-check-wrapper{
  min-width: 940px;
  .loading-wrapper{
    position: absolute;
    width: calc(100% - 60px);
    height: 100%;
    background-color: #FFFFFF5C;
    z-index: 20;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .checking-wrapper{
    background-color: #FFFFFF;
    .training-text{
      margin-top: 50px;
      @include font-16px();
    }
  }
  .report-error-wrapper{
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    img{
      width: 262px;
    }
    .title{
      margin-top: 30px;
      color: $color-font-active;
      font-size: 20px;
    }
    .desc{
      margin-top: 10px;
      margin-bottom: 40px;
      @include font-14px();
    }
    .generate-btn{
      width: 140px;
      height: 46px;
      @include font-14px();
      margin-right: 20px;
      &:last-child{
        margin-right: 0px;
      }
    }
  }
  .health-data-wrapper{
    padding: 20px;
    .title{
      @include font-16px();
      color: $color-font-active;
      margin-bottom: 20px;
    }
    .sub-bar{
      width: 100%;
      height: 68px;
      padding: 0px 20px;
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      background-color: $page-base;
      border: 1px solid $color-borderline-disabled;
      .desc-box{
        flex: 1;
        .desc{
          color: $color-font-active;
          @include font-12px();
          margin-bottom: 8px;
        }
      }
      .recheck-box{
        display: flex;
        align-items: center;
        .loading-icon{
          margin-left: 20px;
        }
        .update-indicator{
          margin-left: 40px;
        }
        .recheck-btn{
          margin-left: 20px;
          width: 90px;
        }
        .to-ssm-btn{
          margin-left: 20px;
          width: 120px;
        }
      }
    }
    .line{
      display: flex;
      &:last-child{
        margin-top: 40px;    
      }
      .card-box{
        border: 1px solid $color-borderline-disabled;
        padding: 20px;
        .box-title{
          font-size: 16px;
          color: $color-font-active;
          margin-bottom: 10px;
        }
        .circle{
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 8px;
          &.red{
            background-color: #F25C62;
          }
          &.orange{
            background-color: #FECC16;
          }
        }
        .box{
          display: inline-block;
          width: 16px;
          height: 16px;
          border-radius: 2px;
          margin-left: 30px;
          &.green{
            background-color: #6AD82D;
          }
          &.blue{
            background-color: $button-blue-hover;
          }
          &.dark-green{
            background-color: #21C695,
          }
          &.normal-green{
            background-color: #5ED5B2,
          }
          &.light-green{
            background-color: #AEEAD8,
          }
        }
        .statistic-box{
          border: 1px solid $page-base;
          background-color: $color-disabled;
          padding: 15px 20px;
          .label{
            color: $color-font-normal;
            @include font-14px();
          }
          .value{
            color: $color-font-active;
            font-weight: bold;
            @include font-14px();
          }
          .bold-value{
            color: $color-font-active;
            font-size: 24px;
          }
        } 
      }
      .left-box{
        flex: 5;
        margin-right: 20px;
        min-width: 340px;
      }
      .right-box{
        flex: 7;
        min-width: 440px;
      }
      .health-overview-box{
        .health-wrapper{
          display: flex;
          align-items: flex-end;
          .chart-icon-box{
            width: 20px;
            height: 140px;
            .horizontal-line{
              display: inline-block;
              width: 100%;
              height: 0px;
              border: 0.6px solid #00857B;
            }
          }
          .chart-box{  
            width: 250px;
            height: 150px;
            position: relative;
            top: 10px;
          }
          .chart-legend{
            flex: 1;
            text-align: right;
            .legend{
              margin-top: 14px;
              span{
                @include font-12px();
                margin-left: 10px;
                display: inline-block;
                vertical-align: top;
              }
            }
          }
        }
      }
      .corpus-quality-box{
        .action-type-box{
          margin: 20px 0px 10px 0px;
          span{
            margin-left: 6px;
            @include font-14px();
            color: $color-font-active;
            margin-bottom: 20px;
          }
          .orange{
            margin-left: 20px;
          }
        }
        .corpus-statistic-box{
          display: flex;
          align-items: center;
          .gap{
            flex: 1;
          }
          .circle{
            margin-right: 10px;
          }
          .value{
            margin-left: 10px;
          }
        }
        .download-box{
          min-height: 40px;
          vertical-align: bottom;
          margin-top: 10px;
          display: flex;
          justify-content: flex-end;
          flex-direction: column;
          .download-link{
            color: $active-color;
            @include font-14px();
            cursor: pointer;
          }
          .last-check-time{
            margin-top: 5px;
            @include font-14px();
            color: $color-font-active;
          }
        }
      }
      .sq-vs-corpus-box{
        .proportion-statistic-box{
          margin-top: 25px;
          margin-bottom: 20px;
          .proportion-statistic{
            text-align: center;
            padding-top: 5px;
            .bold-value{
              margin-top: 5px;
              margin-bottom: 15px;
            }
            .proportion-box{
              display: flex;
              >div{
                flex: 1;
                text-align: center;
                &:first-child{
                  box-shadow: 1px 0px 0px 0px rgba(233,233,233,1);
                }
              }
            }
          }
        }
        .suggest-proportion{
          @include font-14px();
          &:last-child{
            margin-top: 6px;
          }
        } 
      }
      .corpus-range-box{
        padding: 20px 0px 0px 0px;
        height: 290px;
        overflow: hidden;
        .title-box{
          display: flex;
          align-items: center;
          margin: -6px 20px 20px 20px;
          position: relative;
          z-index: 10;
          .box-title{
            display: inline-block;
            margin-bottom: 0px;
            margin-right: 10px;
          }
          span{
            margin-left: 10px;
            @include font-14px();
          }
          .gap{
            flex: 1;
          }
        }
        .corpus-range-chart{
          width: calc(100% + 15px);
          margin-left: -25px;
          height: 285px;
          top: -40px;
          position: relative;
          >div{
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }
  .no-data-wrapper{
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .left-part{
      flex: 1;
      padding: 80px;
      .title{
        color: $color-font-active;
        font-size: 38px;
        line-height: 54px;
        margin-bottom: 10px;
      }
      .desc{
        font-size: 20px;
        line-height: 30px;
        color: $color-font-normal;
      }
      .operate-btn{
        margin-top: 50px;
        width: 180px;
        height: 46px;
        @include font-14px();
      }
    }
    img{
      width: 574px;
    }
  }
}
</style>
