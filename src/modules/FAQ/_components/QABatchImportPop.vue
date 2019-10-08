<template>
  <div id="qa-batch-import">
    <div id="upload-title"> {{ $t('qalist.select_import_file') }}</div>
    <div class="row">
      {{$t('qalist.import_desc')}}
    </div>
    <div class="row">
      <text-button @click="showUploadFile" width="80px" >{{ $t('qalist.preview') }}</text-button>
      <!-- <div @click="showUploadFile" id="preview-button" class="text-button"> {{ $t('qalist.preview') }}</div> -->
      <input id="qa-file-inpput" style="display:none" type="file" @change="onFileChange">
      <div v-if="!selected" class="text margin"> {{ $t('qalist.file_not_select') }} </div>
      <div v-else class="text" style="max-width: 350px;"> {{ filename }}</div>
      <!-- <input type="radio" class="text margin" id="one" value="0" v-model="value.module">
      <label for="one" class="text">{{ $t('qalist.all_update') }}</label>
      <input type="radio" class="text margin" id="two" value="1" v-model="value.module">
      <label for="two" class="text"> {{ $t('qalist.alpha_update') }} </label> -->
    </div>
    <div class="row multi-line">
      <!-- <div class="line"><text-button @click="downloadTemplate(template)">{{ $t('qalist.download_template') }}</text-button></div> -->
      <div class="line"><text-button @click="download(lastTime)" v-if="lastTime">{{ lastTimeMsg }}</text-button></div>
      <div class="line"><text-button @click="download(lastTwice)" v-if="lastTwice">{{ lastTwiceMsg }}</text-button></div>
      <!-- <div @click="downloadTemplate(template)" class="text-button download-button"> {{ $t('qalist.download_template') }} </div> -->
      <!-- <div @click="download(lastTime)" class="text-button download-button margin" v-if="lastTime"> {{ lastTimeMsg }} </div>
      <div @click="download(lastTwice)" class="text-button download-button margin" v-if="lastTwice"> {{ lastTwiceMsg }} </div> -->
    </div>
  </div>
</template>

<script>
import pickerUtil from '@/utils/vue/DatePickerUtil';
import QAapi from '../_api/qalist';
// import i18nUtil from '@/utils/i18nUtil';

export default {
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  api: QAapi,
  data() {
    return {
      selected: false,
      filename: '',
      template: '/VipAdmin/vip-shop/assets/vip_template.xlsx',
      lastTime: undefined,
      lastTimeMsg: '',
      lastTwice: undefined,
      lastTwiceMsg: '',
    };
  },
  mounted() {
    const queryOptions = {
      num: 2,
      action: 'full_import',
      status: 'success',
    };
    this.$api.queryOperations(queryOptions).then((data) => {
      if (data.records && data.records.length > 0) {
        const lastDownloadSuccessMsg = this.$t('qalist.download_last_success');
        data.records.forEach((record, index) => {
          const d = new Date(record.updatedTime);
          if (index === 0) {
            this.lastTime = record;
            this.lastTimeMsg = `${lastDownloadSuccessMsg} - ${pickerUtil.toTimeStingByDatetime(d)}`;
          } else if (index === 1) {
            this.lastTwice = record;
            this.lastTwiceMsg = `${lastDownloadSuccessMsg} - ${pickerUtil.toTimeStingByDatetime(d)}`;
          }
        });
      }
    });
  },
  methods: {
    downloadTemplate(path) {
      window.open(path);
    },
    download(record) {
      this.$api.downloadFile(record.stateId);
    },
    showUploadFile() {
      document.getElementById('qa-file-inpput').click();
    },
    onFileChange(e) {
      const files = e.target.files || e.dataTransfer.files;
      if (files.length) {
        this.value.file = files[0];
        this.selected = true;
        this.filename = files[0].name;
      }
    },
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
$height: 30px;

#qa-batch-import {
  width: 600px;
  height: 180px;
  background-color: white;

  .row {
      display: flex;
      margin-top: 10px;
      &.multi-line {
        flex-direction: column;
        .line:not(:first-child) {
          margin-top: 10px;
        }
      }
  }

  .text {
      height: $height;
      line-height: $height;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
  }
  
  .margin {
    margin-left: 30px;
  }

  .download-button {
      word-wrap: break-word;
      word-break: break-all;
      font-size: 12px;
      white-space: normal;
      line-height: 15px;
      padding: 0px 10px;
      display: flex;
      align-items: center;
      justify-content: center;
  }

  #upload-title {
      display: block;
  }

  #preview-button {
      width: 80px;
      height: $height;
      line-height: 30px;
      border-radius: 5px;
      display: flex;
      justify-content: center;
  }


}

</style>