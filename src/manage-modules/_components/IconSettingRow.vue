<template>
  <div class="icon-row">
    <div class="icon-title">{{ name }}</div>
    <div class="icon-content">
      <div class="example-icon">
        <img :src="iconPath" />
      </div>
      <div class="setting-area">
        <div class="upload-area row">
          <div class="name" v-if="setName">
            {{ $t('general.icon') }}:
          </div>
          <div class="content">
            <div class="upload-row">
              <text-button icon-type="upload" @click="openFileChooser">{{ $t('general.upload') }}{{ $t('general.file') }}</text-button>
              <input type="file" ref="fileChooser" id="fileChooser" accept=".png" @change="validateFile"/>
              <div class="file-info">{{ filename }}</div>
            </div>
            <div class="upload-info">
              {{ uploadInfo }}
            </div>
          </div>
        </div>
        <div class="name-area row" v-if="setName">
          <div class="name">
            {{ $t('general.name') }}:
          </div>
          <div class="content">
            <input v-model="settingName">
          </div>
        </div>
      </div>
      <div class="current" v-if="showCurrent">
        <div class="current-image">
          <slot name="current"></slot>
        </div>
        <text-button button-type="error" @click="handleRemove">{{ $t('general.remove') }}{{ $t('general.image') }}</text-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    iconPath: {
      type: String,
      required: true,
    },
    uploadInfo: {
      type: String,
      required: true,
    },
    setName: {
      type: Boolean,
      required: false,
      default: false,
    },
    currentName: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      fileValid: false,
      filename: '',
      file: undefined,
      settingName: '',
      timer: undefined,
      showCurrent: false,
    };
  },
  watch: {
    settingName(val) {
      const that = this;
      if (that.timer !== undefined) {
        clearTimeout(that.timer);
        that.timer = undefined;
      }
      that.timer = setTimeout(() => {
        that.$emit('updateName', val);
      }, 300);
    },
  },
  methods: {
    openFileChooser() {
      this.$refs.fileChooser.click();
    },
    updateFilename(msg) {
      this.filename = msg;
    },
    validateFile() {
      const fileSizeLimit = 1 * 1024 * 1024;
      const theFile = this.$refs.fileChooser.files[0];
      if (!theFile) {
        this.fileValid = false;
        this.updateFilename(this.$t('wordbank.upload_file_undefined'));
      } else if (theFile.size <= 0 || theFile.size > fileSizeLimit) {
        this.fileValid = false;
        this.updateFilename(this.$t('wordbank.upload_file_size_error'));
      } else {
        this.fileValid = true;
        this.updateFilename('');
      }

      if (this.fileValid) {
        this.uploadFile(theFile);
      }
    },
    uploadFile(file) {
      this.$emit('upload', file);
    },
    handleRemove() {
      this.$emit('remove');
    },
  },
  mounted() {
    const that = this;
    that.settingName = that.currentName;
    that.$on('showCurrent', () => {
      that.showCurrent = true;
    });
    that.$on('hideCurrent', () => {
      that.showCurrent = false;
    });
    that.$on('clearFile', () => {
      that.$refs.fileChooser.value = '';
      that.filename = '';
    });
  },
};
</script>

<style lang="scss" scoped>
.icon-row {
  display: flex;
  flex-direction: column;
}
.icon-title {
  @include font-14px();
  margin-bottom: 10px;
}
.icon-content {
  display: flex;
  .example-icon {
    flex: 0 0 100px;
  }
  .setting-area {
    flex: 0 0 400px;
    padding-left: 30px;

    .row {
      &:not(:first-child) {
        margin-top: 10px;
      }
      display: flex;
      align-items: flex-start;
      .name {
        height: 28px;
        line-height: 28px;
        margin-right: 20px;
      }
    }
    .upload-area {
      .upload-row {
        display: flex;
        align-items: center;
        #fileChooser {
          display: none;
        }
        .file-info {
          margin-left: 20px;
        }
      }
      .upload-info {
        margin-top: 5px;
        @include font-12px();
        color: #999999;
      }
    }
  }
  .current {
    flex: 1;

    display: flex;
    align-items: flex-end;
    .current-image {
      flex: 0 0 auto;
      margin-right: 20px;
    }
  }
}
</style>
