<template lang="html">
<div id="import-scenario-pop">
  <div class="import-format-radio-container">
    <input
      class="radio-import-format"
      type="radio"
      name="import-format"
      id="import-json"
      v-model="importFormat"
      value="json"
    />
    <label
      class="label-format-radio label-json"
      for="sensitive-default">
      {{ $t('task_engine_v3.import_scenario_pop.radio_json_format') }}
    </label>
    <div class="icon-container" v-tooltip="{ msg: $t('task_engine_v3.import_scenario_pop.tooltip_json_import')}">
      <icon icon-type="info" :enableHover="true" :size=18 />
    </div>
    <input
      class="radio-import-format"
      type="radio" name="import-format"
      id="import-xlsx"
      v-model="importFormat"
      value="xlsx"
    />
    <label
      class="label-format-radio label-xlsx"
      for="sensitive-default">
      {{ $t('task_engine_v3.import_scenario_pop.radio_xlsx_format') }}
    </label>
    <div class="icon-container" v-tooltip="{ msg: $t('task_engine_v3.import_scenario_pop.tooltip_xlsx_import')}">
      <icon icon-type="info" :enableHover="true" :size=18 />
    </div>
  </div>
  <div class="import-button-container">
    <input type="file" ref="fileChooser" id="fileChooser" :accept="acceptFile" @change="validateFile"/>
    <text-button
      class="button-import-scenario"
      width="96px"
      @click="openFileChooser"
      iconType="upload"
      :iconSize=15>
      {{ $t('task_engine_v3.import_scenario_pop.button_upload_file') }}
    </text-button>
    <div
      class="label-import-scenario"
      :class="{'error': !fileValid && fileName !== undefined, 'success': fileValid || fileName == undefined}">
      {{labelFileName}}
    </div>
  </div>
  <div
    class="button-download-template"
    @click="downloadTemplate">
    {{ $t('task_engine_v3.import_scenario_pop.button_download_template') }}
  </div>
</div>
</template>

<script>
import XLSX from 'xlsx';
import config from '@/modules/TaskEngine/_utils/config';

export default {
  name: 'create-skill-pop',
  components: {
  },
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      i18n: {},
      skillName: this.value.skillName,
      importFormat: 'json',
      acceptFile: '.json',
      file: undefined,
      fileName: undefined,
      fileValid: false,
    };
  },
  computed: {
    labelFileName() {
      if (this.fileName === undefined) {
        return this.$t('task_engine_v3.import_scenario_pop.label_choose_file');
      }
      return this.fileName;
    },
  },
  watch: {
    importFormat() {
      if (this.importFormat === 'json') {
        this.acceptFile = '.json';
      } else if (this.importFormat === 'xlsx') {
        this.acceptFile = '.xlsx';
      }
      if (this.fileName !== undefined) {
        this.validateFile();
      }
    },
    fileValid() {
      if (this.fileValid) {
        this.$emit('enableOK');
      } else {
        this.$emit('disableOK');
      }
    },
  },
  methods: {
    openFileChooser() {
      this.$refs.fileChooser.click();
    },
    validateFile() {
      const theFile = this.$refs.fileChooser.files[0] || undefined;
      const fileSizeLimit = config.MaximumFileSize;
      this.fileValid = false;
      if (!theFile) {
        this.fileValid = false;
        this.fileName = this.$t('task_engine_v3.import_scenario_pop.upload_file_undefined');
      } else if (theFile.size <= 0 || theFile.size > fileSizeLimit) {
        this.fileValid = false;
        this.fileName = this.$t('task_engine_v3.import_scenario_pop.upload_file_size_error');
      } else {
        this.invalidFileType(theFile).then((invalid) => {
          if (invalid) {
            this.fileValid = false;
            this.fileName = this.$t(
              'task_engine_v3.import_scenario_pop.upload_file_type_invalid',
              { format: this.acceptFile },
            );
          } else {
            this.fileValid = true;
            this.file = theFile;
            this.fileName = this.file.name;
          }
        });
      }
    },
    invalidFileType(file) {
      const promise = new Promise((resolve) => {
        if (this.importFormat === 'xlsx') {
          const fileName = file.name;
          if (fileName.indexOf('.xlsx') === -1) {
            resolve(true);
          } else {
            const reader = new FileReader();
            reader.onload = (e) => {
              const data = new Uint8Array(e.target.result);
              const workbook = XLSX.read(data, { type: 'array' });
              if (!workbook.Workbook) {
                resolve(true);
              } else {
                resolve(false);
              }
            };
            reader.readAsArrayBuffer(file);
          }
        } else {
          // this.importFormat === 'json'
          const validType = ['application/json'];
          resolve(validType.indexOf(file.type) === -1);
        }
      });
      return promise;
    },
    downloadTemplate() {
      window.open('/Files/te_spreadsheet_template.xlsx', '_blank');
    },
    validate() {
      if (this.fileValid) {
        this.$emit(
          'validateSuccess',
          {
            file: this.file,
            importFormat: this.importFormat,
          },
        );
      }
    },
  },
  beforeMount() {},
  mounted() {
    this.$on('validate', this.validate);
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
#import-scenario-pop{
  width: 550px;
  padding: 0px 24px 0px 24px;
  .import-format-radio-container{
    display: flex;
    flex-direction: row;
    align-items: center;
    .label-format-radio{
      height: 28px;
      font-size: 14px;
      line-height: 2;
      color: $color-font-normal;
      margin-left: 8px;
    }
    .icon-container{
      margin-left: 7.5px;
      margin-right: 22.5px;
    }
  }
  .import-button-container{
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 20px;
    #fileChooser{
      display: none;
    }
    .label-import-scenario{
      margin-left: 17px;
      height: 28px;
      font-size: 12px;
      line-height: 28px;
      &.error {
        color: $color-error;
      }
      &.success {
        color: $color-font-normal;
      }
    }
  }
  .button-download-template{
    width: 132px;
    margin-top: 20px;
    height: 28px;
    font-size: 12px;
    line-height: 28px;
    color: $color-primary;
    &:hover{
      text-decoration: underline;
    }
    @include click-button();
  }
}
</style>
