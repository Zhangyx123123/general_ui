<template>
  <div>
    <div id="wordbank-upload-block" class="card h-fill w-fill">
      <div id="wordbank-upload-header">
        {{ $t('wordbank.upload_title.wordbank_upload') }}
      </div>
      <div id="wordbank-upload-content">
        <template v-if="canImport">
        <div class="upload-item-block">
          <!-- <div class="upload-item-title">{{ $t('wordbank.upload_title.batch_import') }}</div> -->
          <div id="import_content" class="upload-item-content">
            <div id="import_tool">
              <input type="file" ref="fileChooser" id="fileChooser" accept=".xlsx" @change="validateFile"/>
              <text-button
                width="96px"
                @click="openFileChooser">
                {{ $t('wordbank.batch_import') }}
              </text-button>
              <span id="filename">{{ newFileName }}</span>
            </div>
            <div id="import_button_hint"> {{ $t('wordbank.import_button_hint') }}</div>
          </div>
        </div>
        </template>

        <div class="upload-item-block">
          <div class="upload-item-title">{{ $t('wordbank.upload_title.last_import_result') }}</div>
          <div id="last_import_content" class="upload-item-content"
            :class="{'error': !isLastResultSuccess}">
            {{ lastImportResult }}
          </div>
        </div>

        <template v-if="canExport">
        <div class="upload-item-block">
          <div class="upload-item-title">{{ $t('wordbank.upload_title.download_imported_wordbank') }}</div>
          <div id="imported_content" class="upload-item-content">
            <div v-if="currentFile !== undefined">
              <span class="clickable-link" @click="logExport(currentFile.path)"> {{ currentFile.timeStr }}</span>
            </div>
            <div v-if="lastFile !== undefined">
              <span class="clickable-link" @click="logExport(lastFile.path)"> {{ lastFile.timeStr }}</span>
            </div>
          </div>
        </div>
        </template>

        <div class="upload-item-block">
          <div class="upload-item-title">{{ $t('wordbank.upload_title.batch_import_hint') }}</div>
          <div id="batch_import_hint_content" class="upload-item-content">
            <ol>
              <li v-for="(part, idx) in desc" :key="part.info">
                {{ part.info }}
                <span v-if="idx === 0" class="clickable-link" @click="downloadTemplate"> {{ $t('wordbank.download_template') }} </span>
                <p v-for="line in part.content" :key="line">
                  {{ line }}
                </p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import auditAPI from '@/api/audit';
import format from '@/utils/js/format';
import desc from './_data/wordbankImportDesc';
import api from './_api/wordbank';

function getPadedNum(num) {
  return num >= 10 ? num.toString() : `0${num}`;
}

export default {
  path: 'wordbank-upload',
  privCode: 'wordbank',
  displayNameKey: 'wordbank_upload',
  icon: 'white_wordbank_upload',
  api: [api, auditAPI],
  data() {
    return {
      newFileName: '',
      fileValid: false,
      file: undefined,

      lastImportResult: '',
      isLastResultSuccess: true,
      lastResultErr: '',
      desc: '',

      lastFile: undefined,
      currentFile: undefined,
    };
  },
  computed: {
    ...mapGetters(['showLanguage']),
    canImport() {
      return this.$hasRight('import');
    },
    canExport() {
      return this.$hasRight('export');
    },
  },
  methods: {
    logExport(path) {
      window.open(path, '_blank');
    },
    downloadTemplate() {
      window.open(`/Files/wordbank_template.xlsx?locale=${this.showLanguage}`, '_blank');
    },
    openFileChooser() {
      this.$refs.fileChooser.click();
    },
    validateFile() {
      const fileSizeLimit = 2 * 1024 * 1024;
      const theFile = this.$refs.fileChooser.files[0];
      if (!theFile) {
        this.fileValid = false;
        this.updateFilename(this.$t('wordbank.upload_file_undefined'));
      } else if (theFile.size <= 0 || theFile.size > fileSizeLimit) {
        this.fileValid = false;
        this.updateFilename(this.$t('wordbank.upload_file_size_error'));
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
      that.$api.uploadFile(this.file)
        .then((data) => {
          const res = data.data;
          if (res.status === 0) {
            that.$notify({ text: that.$t('wordbank.result.success') });
          }
        })
        .catch((err) => {
          if (err.response.status === 400) {
            that.$notifyFail(that.$t('wordbank.error.import_format_invalid'));
          } else {
            that.$notifyFail(that.$t('wordbank.result.fail'));
          }
        })
        .finally(() => {
          that.loadAllAjaxStatus(true);
          that.$refs.fileChooser.value = '';
          that.$emit('endLoading');
        });
    },
    updateFilename(msg) {
      this.filename = msg || this.file.name;
    },
    setUpDescription(locale) {
      this.desc = desc[locale];
    },
    loadAllAjaxStatus(background) {
      const that = this;
      if (!background) {
        that.$startPageLoading();
      }
      that.$api.getLastResult().then((data) => {
        const res = data.data;
        if (res.status === 0) {
          const handleResult = res.result;
          if (handleResult && handleResult.length !== 0) {
            const resultStatus = that.$t(`wordbank.result.${handleResult.status}`);
            that.lastImportResult = `${resultStatus} ( ${format.datetimeToString(res.result.start_time)} )`;
            that.lastResultErr = res.result.message;
            that.isLastResultSuccess = handleResult.status === 'success';
            setTimeout(() => {
              that.loadAllAjaxStatus(true);
            }, 10000);
          } else {
            that.lastImportResult = that.$t('wordbank.result.empty');
          }
        }
      })
      .then(() => that.$api.getDownloadMeta())
      .then((data) => {
        const res = data.data;
        if (res.status === 0) {
          that.updateFileInfo(res.result);
        }
        that.$emit('endLoading');
      })
      .catch((err) => {
        that.lastImportResult = that.$t('error_msg.request_fail');
        that.lastResultErr = err.message;
        that.isLastResultSuccess = false;
        that.$emit('endLoading');
      });
    },
    updateFileInfo(fileInfos) {
      const current = fileInfos.currentFile;
      const last = fileInfos.lastFile;
      const that = this;

      if (current) {
        that.currentFile = that.convertFileInfo(current);
      } else {
        that.currentFile = undefined;
      }

      if (last) {
        that.lastFile = that.convertFileInfo(last);
      } else {
        that.lastFile = undefined;
      }
    },
    convertFileInfo(fileInfo) {
      const time = new Date(fileInfo.time);
      const month = time.getMonth() + 1;
      const day = time.getDate();
      const hour = time.getHours();
      const min = time.getMinutes();
      const seconds = time.getSeconds();

      return {
        timeStr: `${time.getFullYear()}-${getPadedNum(month)}-${getPadedNum(day)} ${getPadedNum(hour)}:${getPadedNum(min)}:${getPadedNum(seconds)}`,
        path: `${api.DOWNLOAD_PATH}/${fileInfo.filename}`,
      };
    },
    initPage() {
      this.loadAllAjaxStatus();
    },
  },
  mounted() {
    this.setUpDescription(this.$i18n.locale);
    this.initPage();
  },
};
</script>
<style lang="scss" scoped>
@import 'styles/variable.scss';

#wordbank-upload-block {
  @include font-14px();
  display: flex;
  flex-direction: column;

  #wordbank-upload-header {
    @include font-16px();
    color: $color-font-active;
    height: 60px;
    border-bottom: 1px solid $color-borderline;
    display: flex;
    align-items: center;
    padding: 20px;
  }
  #wordbank-upload-content {
    flex: 1;
    padding: 20px;
    @include auto-overflow();
    @include customScrollbar();
  }

  .upload-item-block {
    &:not(:last-child) {
      margin-bottom: 20px;
    }
    .upload-item-title {
      @include font-16px();
      font-weight: 500;
      color: $color-font-active;
      margin-bottom: 10px;
    }
  }
}

#import_content {
  #import_tool {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    #fileChooser {
      display: none;
    }
    #filename {
      color: $color-success;
    }
  }
  #import_button_hint {
    @include font-12px();
    color: $color-font-mark;
  }
}

#last_import_content {
  color: $color-success;
  &.error {
    color: $color-error;
  }
}

#imported_content {
  :not(:last-child) {
    margin-bottom: 10px;
  }
};

#batch_import_hint_content {
  color: $color-font-normal;
  ol {
    margin-left: 20px; 
    list-style-type:decimal;
    li {
      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }
  }
  
}
.clickable-link {
  color: $color-primary;
  text-decoration: underline;
  @include click-button();
}
</style>
