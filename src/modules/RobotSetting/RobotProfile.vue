<template>
<div id="robot-profile">
  <div class="card w-fill h-fill">
    <div class="header">
      {{ $t('robot_setting.chat_info_desc', {name: robotName}) }}
    </div>
    <div class="table-header-container">
      <div class="row header">
        <div class="question">{{$t('general.question')}}</div>
        <div class="answer">{{$t('general.answer')}}</div>
        <div class="command" v-if="canEdit"></div>
      </div>
    </div>
    <div class="table-container">
      <!-- TODO: use new flex-table -->
      <div class="row"
        v-for="(data, idx) in tableData" :key="idx">
        <div class="question">{{data.main_question}}</div>
        <div class="answer">{{data.show_answer}}</div>
        <div class="command edit" @click="editQA(idx)" v-if="canEdit">
          {{$t('general.edit')}}
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex';
import GeneralTable from '@/components/GeneralTable';
import FlexTable from '@/components/FlexTable';
import api from './_api/robot';
import QAEditor from './_components/RobotQAEditForm';

export default {
  path: 'robot-profile',
  privCode: 'robot_profile',
  displayNameKey: 'robot_profile',
  icon: 'white_robot',
  components: {
    'general-table': GeneralTable,
    FlexTable,
  },
  data() {
    return {
      curPage: 0,
      tableData: [],
      tableHeader: [],
      dataCnt: 0,
      editButtonList: [],
    };
  },
  computed: {
    ...mapGetters([
      'robotName',
    ]),
    canEdit() {
      return this.$hasRight('edit');
    },
  },
  api,
  methods: {
    operationSuccess(data) {
      const res = data.data;
      if (res.status === 0) {
        this.showMessage(this.$t('error_msg.success'));
        this.initPage();
      } else {
        this.showError(this.$t('error_msg.request_fail'), res.message);
      }
      this.$emit('endLoading');
    },
    operationFail(err) {
      this.showError(this.$t('error_msg.request_fail'), err.message);
      this.$emit('endLoading');
    },
    showMessage(msg) {
      this.$notify({ text: msg });
      // pop.popErrorWindow(this, msg);
    },
    showError(err, info) {
      let text = err;
      if (info) {
        text = `${err}: ${info}`;
      }
      this.$notify({ text, type: 'fail' });
      // pop.popErrorWindow(this, err, info);
    },
    rebuild() {
      const that = this;
      that.$startPageLoading();
      this.rebuildRobotQAModel().then((data) => {
        that.operationSuccess(data);
      });
    },
    convertAPIData(datas) {
      return datas.map((data) => {
        if (!data.answers || data.answers.length === 0) {
          data.show_answer = '';
        } else {
          data.show_answer = data.answers[0];
        }

        data.buttons = this.editButtonList;
        return data;
      });
    },
    editQA(idx) {
      const that = this;
      const qaData = this.tableData[idx];
      that.$pop({
        title: this.$t('robot_setting.modify_qas'),
        data: qaData,
        component: QAEditor,
        validate: true,
        callback: {
          ok(retData) {
            qaData.answers = retData.filter(answer => true && answer);
            that.$api.updateRobotQAV2(qaData).then((data) => {
              that.operationSuccess(data);
            }, () => {
              // TODO
              // general.handleAPIError(that, err).catch(() => {
              //   that.operationFail(err);
              // });
            });
          },
        },
      });
    },
    setUpMsg() {
      const that = this;
      that.tableHeader = [
        {
          key: 'main_question',
          text: that.$t('general.question'),
          type: 'text',
          width: 1,
        },
        {
          key: 'show_answer',
          text: that.$t('general.answer'),
          type: 'text',
          width: 1,
        },
      ];
      if (that.canEdit) {
        that.tableHeader.push({
          text: '',
          btn_text: that.$t('general.edit'),
          type: 'icon-button',
          icon: 'edit',
          iconCallback: that.editQA,
          width: '70px',
          fixed: true,
        });
      } else {
        that.editButtonList = [];
      }
    },
    initPage() {
      const that = this;
      // this.showLoading = true;
      that.$startPageLoading();
      this.$api.getRobotQAListV2(this.curPage, 0).then((data) => {
        this.tableData = that.convertAPIData(data.qa_infos);
        this.dataCnt = data.count;
        that.$emit('endLoading');
      }).catch(() => {
        // general.handleAPIError(that, err).catch((value) => {
        //   that.showError(this.$t('error_msg.save_fail', value.errMsg));
        // });
        that.$emit('endLoading');
      });
    },
  },
  activated() {
    this.initPage();
  },
  mounted() {
    this.setUpMsg();
    this.initPage();
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';

$header-height: 60px;
$header-font-size: 16px;
$header-color: #333333;

$table-header-bg: #f7f7f7;
$table-row-height: 40px;
$edit-color: #1875f0;

.card {
  height: 100%;
  overflow-y: auto;
  padding-bottom: 10px;
  box-sizing: border-box;
  line-height: $default-line-height;

  display: flex;
  flex-direction: column;
  & > .header {
    font-size: $header-font-size;
    color: $header-color;
    flex: 0 0 $header-height;
    display: flex;
    align-items: center;
    padding: 0 20px;
  }
  .table-header-container {
    flex: 0 0 $table-row-height;
    display: flex;
    flex-direction: column;
  }
  .table-container {
    flex: 1;
    @include auto-overflow();

    display: flex;
    flex-direction: column;
  }
  .row {
    flex: 0 0 $table-row-height;
    box-shadow: inset 0 -1px 0 0 #eeeeee;
    &.header {
      background: $table-header-bg;
    }

    display: flex;
    align-items: center;
    .question {
      flex: 1;
      padding: 0 20px;

      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    .answer {
      flex: 1;
      padding: 0 20px;

      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    .command {
      flex: 0 0 50px;

      @include click-button();
      &.edit {
        color: $edit-color;
      }
    }
  }
}
</style>
