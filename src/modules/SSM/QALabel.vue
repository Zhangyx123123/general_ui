<template>
  <div class='qa-label'>
    <div class="card w-fill h-fill">
      <div class="header">
        <div class="header-left">
          <span class="title">{{$t('qa_label.title')}}</span>
          <span class="subtitle">{{$t('qalist.total')}} {{labelsCount}} {{$t('qa_label.label_row')}}{{$t('qa_label.label')}}</span>
        </div>
        <search-input v-model="keyword"></search-input>
      </div>
      <div class="content">
        <div class="toolbar">
          <text-button button-type="primary" @click="popAddLabel">{{ $t('qa_label.add_label') }}</text-button>
        </div>
        <general-table id="label-table" 
          :tableHeader="tableHeader"
          :tableData="pageData"
          :action="tableAction"
          showEmpty></general-table>
      </div>
      <div class="footer">
        <v-pagination size="small" :total="filterCount" :pageIndex="curPage" :pageSize="pageSize" :pageSizeOption="[25, 50, 100, 200, 500, 1000]"  :layout="['prev', 'pager', 'next', 'sizer', 'jumper']" @page-change="handlePageChange" @page-size-change="handlePageSizeChange">
        </v-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import apiBF from '@/api/BF';
import api from './_api/qalabel';
import EditLabelPop from './_components/EditLabelPop';

export default {
  path: 'qa-label',
  privCode: 'qa_label',
  displayNameKey: 'qa_label',
  icon: 'white_chat',
  name: 'qa-label',
  api: [api, apiBF],
  data() {
    return {
      keyword: '',
      labels: [],
      labelsCount: 0,
      tableHeader: [
        {
          key: 'name',
          text: this.$t('qa_label.label_name'),
        },
      ],
      tableAction: [
        {
          text: this.$t('general.edit'),
          onclick: this.popEditLabel,
          type: 'primary',
        },
        {
          text: this.$t('general.delete'),
          onclick: this.removeLabel,
          type: 'error',
        },
      ],
      curPage: 1,
      pageSize: 25,
    };
  },
  computed: {
    ...mapGetters([
      'robotID',
      'userID',
    ]),
    canEdit() {
      return this.$hasRight('edit');
    },
    tableData() {
      const that = this;
      return that.labels.filter(tag => that.keyword === '' || tag.name.indexOf(that.keyword) >= 0);
    },
    filterCount() {
      return this.tableData.length;
    },
    pageData() {
      const startIdx = (this.curPage - 1) * this.pageSize;
      const endIdx = startIdx + this.pageSize;
      return this.tableData.slice(startIdx, endIdx);
    },
    lastPage() {
      return Math.ceil(this.filterCount / this.pageSize);
    },
  },
  watch: {
    keyword() {
      this.toFirstPage();
    },
    lastPage() {
      if (this.lastPage !== 0 && this.lastPage < this.curPage) {
        this.toPrevPage();
      }
    },
  },
  methods: {
    toFirstPage() {
      this.curPage = 1;
    },
    toPrevPage() {
      this.curPage -= 1;
    },
    handlePageChange(page) {
      this.curPage = page;
    },
    handlePageSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.toFirstPage();
    },
    initKeyword() {
      this.keyword = '';
    },
    popAddLabel() {
      const option = {
        title: this.$t('qa_label.add_label'),
        component: EditLabelPop,
        validate: true,
        data: {
          labelList: this.labels,
        },
        callback: {
          ok: (label) => {
            this.addLabel(label);
          },
        },
      };
      this.$pop(option);
    },
    addLabel(label) {
      const that = this;
      const params = {
        appid: that.robotID,
        name: label,
        type: 'userdefine',
        category: 'sq',
      };
      that.$api.addLabel(params)
      .then((res) => {
        if (res.error_code === 0) {
          that.loadLabels();
          that.initKeyword();
          that.toFirstPage();
        } else {
          that.$notifyFail(res.error_message);
        }
      })
      .catch((err) => {
        // TODO: handle add error
        console.log(err);
        // that.$notifyFail();
      })
      .finally(() => {
        that.$emit('endLoading');
      });
    },
    popEditLabel(labelItem) {
      const option = {
        title: this.$t('qa_label.edit_label'),
        component: EditLabelPop,
        validate: true,
        data: {
          label: labelItem.name,
          labelList: this.labels,
        },
        callback: {
          ok: (editedlabel) => {
            this.editLabel(editedlabel, labelItem.id);
          },
        },
      };
      this.$pop(option);
    },
    editLabel(label, id) {
      const that = this;
      const params = {
        appid: that.robotID,
        name: label,
        type: 'userdefine',
        category: 'sq',
        id,
      };
      that.$api.updateLabel(params)
      .then((res) => {
        if (res.error_code === 0) {
          that.loadLabels();
        } else {
          that.$notifyFail(res.error_message);
        }
      })
      .catch((err) => {
        console.log(err);
        // that.$notifyFail();
      })
      .finally(() => {
        that.$emit('endLoading');
      });
    },
    removeLabel(item) {
      const that = this;
      that.$popWarn({
        data: {
          msg: that.$t('qa_label.delete_label_name', { tag: item.name }),
        },
        callback: {
          ok() {
            that.$startPageLoading();
            const params = {
              appid: that.robotID,
              tagid: item.id,
            };
            that.$api.deleteLabel(params)
            .then((res) => {
              if (res.error_code === 0) {
                that.loadLabels();
              } else {
                that.$popError(res.error_message);
              }
            }, () => {
              // TODO: handle delete error
              that.$notifyFail(that.$t('qa_label.err_detele_label_has_rule'));
            })
            .finally(() => {
              that.$emit('endLoading');
            });
          },
        },
      });
    },
    loadLabels() {
      const that = this;
      that.$startPageLoading();
      that.$api.loadLabels(that.robotID)
      .then((rsp) => {
        if (rsp.error_code === 0) {
          const labels = rsp.data.tag;
          that.labelsCount = labels.length;
          that.labels = labels;
          that.labels.forEach((label) => {
            if (label.type === 'system') {
              label.action_enable = false;
            }
          });
        } else {
          that.$popError(rsp.error_message);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        that.$emit('endLoading');
      });
    },
  },
  mounted() {
    this.$api.focusRobot(this.userID, this.robotID)
    .then(() => {
      this.loadLabels();
    });
  },
};
</script>

<style lang="scss" scoped>
.card {
  display: flex;
  flex-direction: column;
  .header {
    flex: 0 0 60px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid $color-borderline;
    .header-left {
      .title {
        @include font-16px();
        color: $color-font-active;
      }
      .subtitle {
        margin-left: 20px;
        @include font-16px();
        color: $color-font-mark;
      }
    }
  }
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    .toolbar {
      flex: 0 0 auto;
      padding: 20px;
    }
    #label-table {
      flex: 1;
      overflow: hidden;
    }
  }
  .footer {
    flex: 0 0 50px;
    border-top: 1px solid $color-borderline;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
