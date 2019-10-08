<template>
  <div class="chat-tools">
    <div class="tools-top-header">
      <p>{{ $t('chat_tools.test_analysis') }}</p>
      <div class="btn-group">
        <text-button icon-type="down_template" @click="downloadTemplate">{{ $t('chat_tools.download_template') }}</text-button>
        <div id="import_tool">
          <input type="file" ref="fileChooser" id="fileChooser" accept=".xlsx" @change="validateFile"/>
          <text-button
            width="96px"
            @click="openFileChooser">
            {{ $t('general.batch_import') }}
          </text-button>
        </div>
      </div>
    </div>
    <div class="chat-search">
      <div class='chat-search-item'>
        <div class="left">
          APPID&nbsp;&nbsp;<input type="text" v-model.trim="appId">
          {{ $t('chat_tools.scenario') }}：&nbsp;&nbsp;<dropdown-select class="single-input"
              width='300px'
              :placeholder="$t('chat_tools.choose_scenario_placeholder')"
              :options="groupOptions" multi v-model="groupFilter"/>
        </div>
        <div class="right">
          <span class="show-test-result" v-if="correct !== undefined">
            {{ $t('chat_tools.test_finish_rate', {correct}) }}
          </span>
          <text-button @click="downResult">{{ $t('chat_tools.download_result') }}</text-button>
          <text-button @click="handleTest" :button-type="canStartTest ? 'default' : 'disable'">{{ $t('chat_tools.start_test') }}</text-button>
        </div>
      </div>
    </div>
    <div class="test-result-table">
      <div class="result-teble-header result-box">
        <span class="test-case">{{ $t('chat_tools.test_question') }}</span>
        <span class="excepted-result">{{ $t('chat_tools.test_except_result') }}</span>
        <span class="actual-result">{{ $t('chat_tools.test_actual_result') }}</span>
        <span class="response-module">{{ $t('chat_tools.test_module') }}</span>
        <span class="if-pass">{{ $t('chat_tools.test_is_pass') }}</span>
      </div>
      <div class="result-table-body">
        <div class="table-item">
          <div class="result-box result-box-body" v-for="(val, index) in sheetGroup" :key="index">
            <span class="test-case">{{val.input}}</span>
            <span class="excepted-result">{{val.expected}}</span>
            <span class="actual-result" :class="{'error': val.result === false}">{{val.actual}}</span>
            <span class="response-module" :class="{'error': val.result === false}">
              {{val.actualModule}}
              <div class="icon-container" v-tooltip="val.tips" v-if="val.result !== null">
                <icon icon-type="info" :size="18" enableHover></icon>
              </div>
            </span>
            <span class="if-pass" v-if="val.result === null">{{ $t('chat_tools.to_be_test') }}</span>
            <span class="if-pass" v-else :class="{'pass': val.result === true, 'wran': val.result === false}"></span>
          </div>
        </div>
      </div>
      <v-pagination v-if="curTotal>0"
        class="fix-bottom" size="small"
        :total="curTotal" :pageIndex="curPageIdx" :pageSize="pageLimit"
        :pageSizeOption="[25, 50, 100, 200, 500, 1000]"
        :layout="['prev', 'pager', 'next','jumper']"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"></v-pagination>
    </div>
  </div>
</template>

<script>
import DropdownSelect from '@/components/DropdownSelect';
import misc from '@/utils/js/misc';
import api from './_api/chattools';

export default {
  path: 'chat-tools',
  privCode: 'management',
  displayNameKey: 'chat',
  name: 'chat-tools',
  api: [api],
  components: {
    DropdownSelect,
  },
  data() {
    return {
      appId: '',
      backupData: {},
      allowImport: true,
      fileValid: false,
      file: undefined,
      sheetGroup: [],
      allData: [],
      scenarioName: '对话场景',
      correct: undefined,
      keywords: '',
      curPageIdx: 1,
      pageLimit: 10,
      groupOptions: [],
      groupFilter: [],
    };
  },
  created() {
    this.appId = this.$cookie.get('appid');
    this.fetchTestHis();
  },
  watch: {
    groupFilter: {
      handler() {
        let filter = [];
        if (this.groupFilter.length === 0) {
          filter = this.allData;
        }
        for (let i = 0; i < this.groupFilter.length; i += 1) {
          this.allData.filter((item) => {
            if (item.group === this.groupFilter[i]) {
              filter.push(item);
            }
            return true;
          });
        }
        this.sheetGroup = filter.slice(this.curPageIdx - 1, this.pageLimit);
        this.backupData = filter;
        const passTotal = this.sheetGroup.filter(item => item.result === true);
        this.correct = (passTotal / this.sheetGroup.length).toFixed(2);
      },
      deep: true,
    },
  },
  methods: {
    downloadTemplate() {
      window.open(this.$api.getTemplatePath());
    },
    validateFile() {
      const theFile = this.$refs.fileChooser.files[0];
      if (!theFile) {
        this.fileValid = false;
        this.updateFilename(this.$t('chat_tools.test_file_format_error'));
      } else {
        this.fileValid = true;
        this.file = theFile;
        this.updateFilename();
      }
      if (this.fileValid) {
        this.uploadFile();
      }
    },
    uploadFile() {
      const that = this;
      that.$startPageLoading();
      that.$api.uploadFile(this.file, this.appId)
        .then((res) => {
          if (res.data.status === 0) {
            that.calculateRest(res.data.result.scripts);
            that.groupFilter = [];
          }
        })
        .catch(() => {
          that.$notifyFail(`${that.$t('general.upload')}${that.$t('general.fail')}`);
        })
        .finally(() => {
          that.$refs.fileChooser.value = '';
          that.$emit('endLoading');
        });
    },
    updateFilename(msg) {
      this.filename = msg || this.file.name;
    },
    openFileChooser() {
      this.$refs.fileChooser.click();
    },
    fetchTestHis() {
      const that = this;
      that.$api.getHisResult(this.appId)
        .then((res) => {
          if (res.data.status === 0) {
            that.calculateRest(res.data.result.scripts);
          }
        })
        .finally(() => {

        });
    },
    handleTest() {
      if (this.appId.length === 0) {
        this.$notifyFail(this.$t('chat_tools.notify_empty_appid'));
        return;
      }
      if (this.sheetGroup.length === 0) {
        this.$notifyFail(this.$t('chat_tools.no_data_to_test'));
        return;
      }
      const that = this;
      that.$startPageLoading();
      that.$api.startTest(this.appId)
        .then((res) => {
          if (res.data.status === 0) {
            that.calculateRest(res.data.result.scripts);
            that.groupFilter = [];
          } else {
            that.$notifyFail(res.data.message);
          }
        })
        .finally(() => {
          that.$emit('endLoading');
        });
    },
    calculateRest(data) {
      // 计算有多少分组
      const group = Object.keys(data);
      this.groupOptions = group.map(item => ({
        text: item,
        value: item,
      }));
      // 重组数据
      const total = [];
      Object.entries(data).forEach((item) => {
        item[1].map((val) => {
          val.group = item[0];
          val.tips = {
            msg: val.expectedModule,
          };
          total.push(val);
          return true;
        });
      });
      // backupData 用于前端分页计算总数
      this.backupData = total;
      this.sheetGroup = total.slice(this.curPageIdx - 1, this.pageLimit);
      // allData 用户处理过滤的原始数据
      this.allData = total;
      // 计算正确率
      const passTotal = this.sheetGroup.filter(item => item.result === true);
      this.correct = (passTotal / this.sheetGroup.length).toFixed(2);
    },
    downResult() {
      const a = document.createElement('a');
      a.setAttribute('id', 'exportHotExcel');
      event.target.parentNode.appendChild(a);
      const that = this;
      that.$api.getResult(that.appId)
        .then((res) => {
          const data = res.data;
          const blob = new Blob([data], { type: 'applicatoin/vnd.ms-excel' });
          const curtime = new Date();
          const filename = that.$t('chat_tools.test_result_filename_template', {
            timestamp: curtime.getTime(),
          });
          misc.downloadRawFile(blob, filename);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {

        });
    },
    handlePageChange(page) {
      if (page <= 0) {
        this.toFirstPage();
      } else {
        this.toCurPage(page);
      }
      const startIndex = (this.curPageIdx - 1) * this.pageLimit;
      this.$set(this, 'sheetGroup', this.backupData.slice(startIndex, startIndex + this.pageLimit));
    },
    handlePageSizeChange(pageSize) {
      this.pageLimit = pageSize;
      this.toFirstPage();
      this.sheetGroup = [];
    },
    toFirstPage() {
      this.curPageIdx = 1;
    },
    toCurPage(page) {
      this.curPageIdx = page;
    },
  },
  computed: {
    curTotal() {
      return this.backupData.length;
    },
    lastPageIdx() {
      return Math.floor((this.backupData - 1) / this.pageLimit) + 1;
    },
    canStartTest() {
      return this.sheetGroup.length > 0;
    },
  },
};
</script>

<style lang="scss" scoped>
  @import 'styles/variable.scss';
  #app-page{
    .app-body{
      padding: 0;
    }
  }
  #import_tool {
    display: flex;
    align-items: flex-end;
    margin-left: 20px;
    #fileChooser {
      display: none;
    }
    #filename {
      color: $color-success;
    }
  }
  .chat-tools{
    font-weight: 400!important;
    font-family:PingFangSC-Regular;
    width: calc(100% - 40px);
    height: calc(100% - 40px)!important;
    background:rgba(255,255,255,1);
    box-shadow:0px 0px 5px 0px rgba(102,102,102,0.08);
    border-radius:4px;
    margin: 20px;
    display: flex;
    flex-direction: column;
    padding-bottom: 20px!important;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
  }
  .tools-top-header{
    height: 66px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 20px 20px;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    font-size: 14px;
    .btn-group{
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    p{
      font-size: 18px;
    }
    span{
      display: inline-block;
      height: 28px;
      line-height: 28px;
      border-radius:2px;
      border:1px solid rgba(219,219,219,1);
      padding: 0 20px;
      margin-left: 20px;
      cursor: pointer;
      a{
        text-decoration: none;
        color: #666666;
      }
    }
  }
  .chat-search{
    padding: 0 20px;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
  }
  .chat-search-item{
    @include font-14px();
    height: 72px;
    width: 100%;
    background:rgba(247,247,247,1);
    border-radius:1px;
    border:1px solid rgba(238,238,238,1);
    margin-bottom: 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    input{
      margin-right: 20px;
      width: 200px;
      height: 32px;
    }
    .left{
      display: flex;
      flex-direction: row;
      align-items: center;
    }
  }
  .test-result-table{
    flex: 1;
    overflow: hidden;
    padding-bottom: 30px;
    position: relative;
    .fix-bottom{
      position: absolute;
      bottom: 0;
      right: 20px;
      color: #000000;
    }
    .result-teble-header{
      background: #E9E9E9;
    }
    .result-box{
      display: flex;
      flex: row;
      &.result-box-body{
        border-bottom:1px solid rgba(238,238,238,1);
      }
      span{
        padding: 10px 0 10px 20px;
        line-height: 20px;
        padding-left: 20px;
        box-sizing: border-box;
        -moz-box-sizing: border-box;
        -webkit-box-sizing: border-box;
        font-size: 14px;
        word-break:break-all;
        &.test-case{
          flex: 8;
        }
        &.excepted-result{
          flex: 6;
        }
        &.actual-result{
          flex: 6;
          &.error{
            color: #F76260;
          }
        }
        &.response-module{
          flex: 2;
          position: relative;
          .icon-container{
            display: inline-block;
            vertical-align: middle;
          }
          &.error{
            color: #F76260;
          }
        }
        &.if-pass{
          flex: 2;
          &.pass{
            background: url('../../assets/icons/test_result_correct.svg') no-repeat center;
            background-size: 20px;
          }
          &.wran{
            background: url('../../assets/icons/test_result_wraning.svg') no-repeat center;
            background-size: 20px;
          }
        }
      }
    }
    .result-table-body{
      height: calc(100% - 50px);
      overflow: hidden;
      .table-item{
        height: 100%;
        overflow-y: auto;
      }
    }
  }
</style>
