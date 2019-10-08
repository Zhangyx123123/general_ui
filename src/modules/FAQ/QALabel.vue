<template>
  <div class='qa-label'>
    <div class="actions row">
      <text-button main icon-type="white_add" @click="popAddTag">{{$t('general.add')}}{{$t('qa_label.label')}}</text-button>
      <search-input v-model="keyword"></search-input>
    </div>
    <div class="table-container">
      <flex-table :data="tableData" :columns="tableHeader"/>
    </div>
  </div>
</template>

<script>
import FlexTable from '@/components/FlexTable';
import api from './_api/qalabel';
import EditTagPop from './_components/QATagEdit';

export default {
  path: 'qa-label',
  privCode: 'qa_label',
  displayNameKey: 'qa_label',
  icon: 'white_chat',
  name: 'qa-label',
  components: {
    'flex-table': FlexTable,
  },
  api,
  data() {
    return {
      keyword: '',
      labels: [],
      tableHeader: [
        {
          key: 'id',
          text: this.$t('qa_label.label_id'),
          type: 'text',
          fixed: true,
          width: '60px',
        },
        {
          key: 'name',
          text: this.$t('qa_label.label_name'),
          type: 'text',
          width: 'auto',
        },
        {
          key: 'rule_count',
          text: this.$t('qa_label.rule_count'),
          type: 'text',
          width: '150px',
          fixed: true,
        },
        {
          text: '',
          type: 'icon-button',
          fixed: true,
          width: '90px',
          icon: 'edit',
          iconCallback: this.popEditLabel,
          btn_text: this.$t('general.edit'),
        },
        {
          text: '',
          type: 'icon-button',
          fixed: true,
          width: '90px',
          icon: 'delete',
          iconCallback: this.popDeleteLabel,
          btn_text: this.$t('general.delete'),
        },
      ],
    };
  },
  computed: {
    tableData() {
      const that = this;
      return that.labels.filter(label => that.keyword === '' || label.name.indexOf(that.keyword) >= 0);
    },
  },
  methods: {
    popEditLabel(idx, label) {
      const that = this;
      that.$pop({
        title: `${that.$t('general.add')}${that.$t('qa_label.label')}`,
        component: EditTagPop,
        data: {
          name: label.name,
          id: label.id,
          addMode: false,
        },
        bindValue: false,
        validate: true,
        callback: {
          ok(retData) {
            that.$startPageLoading();
            that.$api.updateTag(label.id, retData).then(() => {
              that.loadLabels();
            });
          },
        },
      });
    },
    popDeleteLabel(idx, label) {
      const that = this;
      that.$popCheck({
        title: `${that.$t('general.delete')}${that.$t('qa_label.label')}`,
        data: {
          msg: that.$t('qa_label.delete_label_name', { label: label.name }),
        },
        callback: {
          ok() {
            that.$startPageLoading();
            that.$api.deleteLabel(label.id).then(() => {
              that.loadLabels();
            }, () => {
              // TODO: handle delete error
              that.$notifyFail(that.$t('qa_label.err_detele_label_has_rule'));
            })
            .then(() => {
              that.$emit('endLoading');
            });
          },
        },
      });
    },
    popAddTag() {
      const that = this;
      that.$pop({
        title: `${that.$t('general.add')}${that.$t('qa_label.label')}`,
        component: EditTagPop,
        validate: true,
        data: {
          existTags: that.labels.map(label => label.name),
        },
        bindValue: false,
        callback: {
          ok(name) {
            that.$startPageLoading();
            that.$api.addTag(name).then(() => {
              that.loadLabels();
            }, (err) => {
              // TODO: handle add error
              console.log(err);
            })
            .then(() => {
              that.$emit('endLoading');
            });
          },
        },
      });
    },
    loadLabels() {
      const that = this;
      that.$startPageLoading();
      that.$api.loadLabels().then((labels) => {
        that.labels = labels;
      }, () => {
        // TODO: handle error if status code is not 500,
      })
      .then(() => {
        that.$emit('endLoading');
      });
    },
  },
  mounted() {
    this.loadLabels();
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';
.qa-label {
  display: flex;
  flex-direction: column;
  .row {
    @include flex-row();
  }
  .table-container {
    flex: 1;
  }
}
</style>
