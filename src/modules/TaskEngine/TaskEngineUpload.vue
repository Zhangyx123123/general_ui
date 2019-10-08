<template>
  <div id="task-engine-upload">
    <div class="content card h-fill w-fill">
      <div class="row title">
        {{ $t("task_engine.task_engine_upload") }}
      </div>
      <div class="row">
        <div>
          <text-button main @click="triggerUpload" class="file-selector">{{ $t("general.upload") }}</text-button>
          <span>{{ fileName }}</span>
          <input type="file" ref="uploadInput" v-on:change="changeFile()" accept=".csv">
        </div>
        <div class="import_button_hint"> {{ $t('task_engine.import_button_hint') }}</div>
      </div>
      <div class="row">
        {{ $t("general.description") }}：
        <div>
          <ol>
            <li v-for="(line, idx) in desc" :key="idx">
              {{ line }}
              <span v-if="idx === 0" class="clickable-link" @click="downloadTemplate">
                {{ $t('task_engine.download_template') }}
              </span>
            </li>
          </ol>
        </div>
      </div>
      <div class="table-container" style="max-width: 600px;">
        <general-table :tableData="tableData" :tableHeader="tableHeader" :action="action"></general-table>
      </div>
    </div>
  </div>
</template>

<script>
import misc from '@/utils/js/misc';
import generalTable from '@/components/GeneralTable';
import config from '@/modules/TaskEngine/_utils/config';
import api from './_api/taskEngine';
import importDesc from './_data/taskEngineImportDesc';

export default {
  path: 'task-engine-upload',
  privCode: 'task_engine',
  displayNameKey: 'task_engine_upload',
  icon: 'white_task_engine_upload',
  name: 'task-engine-upload',
  api,
  components: {
    generalTable,
  },
  data() {
    return {
      desc: '',
      fileName: '',
      i18n: {},
      tableHeader: [],
      tableData: [],
      action: [],
    };
  },
  methods: {
    downloadTemplate() {
      const csvData = '中国国际航空,CA\r\nairchina,CA\r\nair china,CA\r\n中国东方航空,MU\r\nchina eastern airlines,MU\r\n';
      const blobData = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvData], { type: 'text/csv' });
      misc.downloadRawFile(blobData, 'task_engine_template.csv');
    },
    setUpDescription(locale) {
      this.desc = importDesc[locale];
    },
    triggerUpload() {
      this.$refs.uploadInput.click();
    },
    changeFile() {
      const files = this.$refs.uploadInput.files;
      const file = files[0] || undefined;
      if (file) {
        this.fileName = file.name;
        this.upload();
      } else {
        this.fileName = '';
      }
    },
    upload() {
      const files = this.$refs.uploadInput.files;
      const file = files[0] || undefined;
      const that = this;
      const appid = that.$cookie.get('appid');
      if (file.size <= 0 || file.size > config.MaximumFileSize) {
        that.$notifyFail(that.$t('error_msg.upload_file_size_error'));
      } else {
        that.$startPageLoading();
        that.$api.uploadMapping(appid, file).then((data) => {
          const res = data.data;
          if (res.return === 0) {
            that.$notify({ text: that.$t('error_msg.success') });
            that.$refs.uploadInput.value = '';
            that.changeFile();
            that.loadList();
          } else {
            that.$notifyFail(`${that.$t('error_msg.save_fail')}:${res.error}`);
          }
          that.$emit('endLoading');
        }, (err) => {
          that.$refs.uploadInput.value = '';
          that.$notifyFail(`${that.$t('error_msg.save_fail')}:${err.message}`);
          that.$emit('endLoading');
        });
      }
    },
    deleteMapping(itemData) {
      const that = this;
      const fileName = itemData.file_name;

      that.$startPageLoading();
      that.$api.deleteMappingList(fileName).then(() => {
        that.$emit('endLoading');
        that.$notify({ text: that.$t('error_msg.delete_success') });
        that.loadList();
      }, (err) => {
        that.$notifyFail(`${that.$t('error_msg.delete_fail')}:${err.message}`);
        that.$emit('endLoading');
      });
    },
    downloadMapping(itemData) {
      const that = this;
      const fileName = itemData.file_name;
      const user = itemData.user;

      that.$startPageLoading();
      that.$api.downloadMappingList(fileName, user).then((data) => {
        that.$emit('endLoading');
        const csvData = data.data;
        const blobData = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvData], { type: 'text/csv' });
        misc.downloadRawFile(blobData, `${fileName}.csv`);
      }, (err) => {
        that.$notifyFail(`${that.$t('error_msg.save_fail')}:${err.message}`);
        that.$emit('endLoading');
      });
    },
    setUpMsg() {
      const that = this;
      that.tableHeader = [
        {
          key: 'file_name',
          text: that.$t('general.file'),
        },
      ];
      that.action.push({
        key: 'export',
        text: that.$t('general.export'),
        type: 'primary',
        onclick: that.downloadMapping,
      }, {
        key: 'delete',
        text: that.$t('general.delete'),
        type: 'error',
        onclick: that.deleteMapping,
      });
    },
    loadList() {
      const that = this;

      that.$startPageLoading();
      that.tableData = [];
      const userid = that.$cookie.get('userid');
      if (userid !== '4c8cad6375894d487327cd1e7c5d5ef4') { // add template data for none template user
        that.$api.getTemplateMappingList().then((data) => {
          const files = data.data;
          files.forEach((file) => {
            that.tableData.push({
              file_name: file,
              action_enable: {
                export: true,
                delete: false,
              },
              user: 'templateadmin',
            });
          });
          that.$emit('endLoading');
        }, (err) => {
          that.$notifyFail(`${that.$t('error_msg.data_format_err')}:${err.message}`);
          that.$emit('endLoading');
        });
      }
      that.$api.getMappingList().then((data) => {
        const files = data.data;
        if (files) {
          files.forEach((file) => {
            that.tableData.push({
              file_name: file,
              action_enable: {
                export: true,
                delete: true,
              },
              user: userid,
            });
          });
        } else {
          that.$notify({ text: that.$t('error_msg.data_format_err') });
        }
        that.$emit('endLoading');
      }, (err) => {
        that.$notifyFail(`${that.$t('error_msg.data_format_err')}:${err.message}`);
        that.$emit('endLoading');
      });
    },
  },
  activated() {
    this.loadList();
  },
  mounted() {
    this.setUpDescription(this.$i18n.locale);
    this.setUpMsg();
    this.loadList();
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';
$row-height: $default-line-height;

.clickable-link {
  @include click-button();
  color: $color-primary;
  text-decoration: underline;
}
.import_button_hint {
  @include font-12px();
  margin-top: 5px;
  color: $color-font-mark;
}

#task-engine-upload {
  .content {
    display: flex;
    flex-direction: column;
    .row {
      flex: 0 0 auto;
      padding-left: 20px;

      &.title {
        @include font-16px();
        color: $color-font-active;
        flex: 0 0 60px;
        border-bottom: 1px solid $color-borderline;
        display: flex;
        align-items: center;
      }
      &:not(.title) {
        margin-top: 20px;
      }

      .text-button {
        margin-right: 10px;
      }
      input[type=file] {
        visibility: hidden;
      }
      .file-selector {
        & ~ input {
          display: none;
        }
      }
    }
    .table-container {
      flex: 1;
    }
    ol {
      list-style: decimal inside none;
      line-height: $row-height;
    }
  }
}

</style>
