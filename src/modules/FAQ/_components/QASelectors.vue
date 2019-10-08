<template>
  <div id="qalist-query-operations">
    <div class="row">
      <div class="title">{{ $t("qalist.validated_duration") }}:</div>
      <div style="height: 100%; display:inline-flex">
        <input style="height: 100%" class="center-align" type="radio" value="forever" v-model="timeType">
        <label class="center-align"> {{$t('qalist.permanent')}} </label>
        <input style="height: 100%" type="radio" value="self-defined" v-model="timeType">
        <label class="center-align"> {{$t('qalist.self_defined')}} </label>
        <template v-if="timeType === 'self-defined'">
          <qa-datetime-picker
            :value="start"
            @dateChanged="handlePickerChanged"
            @validityChange="value => {startValidity = value}"
            style="margin-left: 10px;"
          ></qa-datetime-picker>
          <div class="title center-align">{{ $t("qalist.to") }}</div>
          <qa-datetime-picker
            :value="end"
            @dateChanged="handleEndPickerChanged"
            @validityChange="value => {endValidity = value}"
          ></qa-datetime-picker>
        </template>
      </div>
      <div style="float: right">
        <div class="title">{{ $t("qalist.more") }}:</div>
        <text-button :disabled="!canImport" @click="popImportForm" :width="buttonWidth">{{ $t("qalist.batch_import") }}</text-button>
        <text-button :disabled="!canCreate" @click="popEditor" :width="buttonWidth">{{ $t("qalist.add_qa") }}</text-button>
        <!-- <div :class="{disabled: !canImport}" @click="popImportForm" class="text-button qalist-button datetime">{{ $t("qalist.batch_import") }}</div> -->
        <!-- <div :class="{disabled: !canCreate}" @click="popEditor" class="text-button qalist-button datetime">{{ $t("qalist.add_qa") }}</div> -->
        </div>
    	</div>
    	<div class="row">
    	  <!-- <div class="title">{{ $t("qalist.filter") }}:</div> -->
        <text-button @click="handleDimensionClick" :width="buttonWidth">{{ $t("qalist.tags") }}</text-button>
    	  <!-- <div @click="handleDimensionClick" class="text-button qalist-button datetime">{{ $t("qalist.tags") }}</div> -->
    	  <div id="keyword-text" class="title">{{ $t("qalist.keyword_search") }}:</div>
    	  <select v-model="keywordType">
          <option v-for="keywordOption in keywordOptions" v-bind:value="keywordOption.value" :key="keywordOption.value">
            {{ keywordOption.text }}
          </option>
    	  </select>
    	  <input v-model="keyword" class="qalist-button" type="text" name="keywords">
        <text-button @click="handleQuery" main :disabled="!validFormInput" :width="buttonWidth">{{ $t("qalist.query") }}</text-button>
        <!-- <div @click="handleQuery" class="text-button primary qalist-button datetime" :class="{disabled: !validFormInput}">
          {{ $t("qalist.query") }}
        </div> -->
    	  <div style="float: right">
          <text-button :disabled="!canExport" @click="showExportPop" :width="buttonWidth">{{ $t("qalist.batch_export") }}</text-button>
          <text-button :disabled="!canDelete" @click="deleteQuestions" :width="buttonWidth">{{ $t("qalist.delete") }}</text-button>
    	    <!-- <div :class="{disabled: !canExport}" @click="showExportPop" class="text-button qalist-button datetime">{{ $t("qalist.batch_export") }}</div>
    	    <div :class="{disabled: !canDelete}" @click="deleteQuestions" class="text-button qalist-button datetime">{{ $t("qalist.delete") }}</div> -->
    	  </div>
    	</div>
    	<div class="row auto-height" v-if="showed">
    	  <div class="title">{{ $t("qalist.filter") }}:</div>
        <div class="tags">
          <template v-for="subCategory in category.categories">
            <template v-for="value in subCategory.values" v-if="value.checked">
              <span class="filter-item" :key="value.text">
                {{ value.text }}
                <span v-on:click="cancelTag(value)" class="filter-item-cancel">
                  x
                </span>
              </span>
            </template>
          </template>
          <template v-for="command in commands" v-if="!command.allChecked">
            <template v-for="value in command.values" v-if="value.checked">
              <span class="filter-item" :key="value.text">
                {{ value.text }}
                <span v-on:click="cancelCommand(value)" class="filter-item-cancel">
                  x
                </span>
              </span>
            </template>
          </template>
          <!-- <template v-for="command in commands" v-if="command.allChecked">
            <template v-for="value in command.values">
              <span class="filter-item">
                {{ value.text }}
                <span v-on:click="cancelCommandInAllCheckedState(value, command)" class="filter-item-cancel">
                  x
                </span>
              </span>
            </template>
          </template> -->
          <div id="clear_all_dimenstions" class="filter-item" @click="clearAllDimension" style="border: 0px;"> {{ $t('qalist.clear_all_dimensions') }} </div>
        </div>
      </div>
      <div class="row" v-if="!validTimeRange && timeType !== 'forever'">
        <div style="display:flex; margin-top:10px; justify-content:center; color:red;"> {{ $t('qalist.starttime_later_than_endtime_warning') }} </div>
      </div>
  </div>
</template>

<script>
// import i18nUtil from '@/utils/i18nUtil';
// import CheckPop from '@/components/popForm/CheckPop';
import { mapMutations, mapGetters } from 'vuex';
import DimensionSelector from '@/components/DimensionSelector';
import DatetimePicker from '@/components/DateTimePicker';
import pickerUtil from '@/utils/vue/DatePickerUtil';
import TextButton from '@/components/basic/TextButton';
// import auth from '@/auth';
// import general from '@/utils/general';
import ImportPop from './QABatchImportPop';
import ExportPop from './QAExportPop';
import CommandSelector from './CommandSelector';
import CategoryList from '../_data/categoryList';
import QAapi from '../_api/qalist';

export default {
  name: 'qa-selectors',
  api: QAapi,
  components: {
    'qa-datetime-picker': DatetimePicker,
    TextButton,
  },
  data() {
    return {
      buttonWidth: '120px',
      category: {},
      dimensionShowed: false,
      commandShowed: false,
      start: pickerUtil.createDateObj(),
      end: pickerUtil.createDateObj(),
      commands: [],
      keywordType: 'all',
      keyword: '',
      timeType: 'forever',
      startValidity: true,
      endValidity: true,
      checkTimer: undefined,
      keywordOptions: [
        { value: 'all', text: this.$t('qalist.all') },
        { value: 'question', text: this.$t('qalist.question') },
        { value: 'answer', text: this.$t('qalist.answer') },
        // { value: 'dynamic_menu', text: this.$t('qalist.select_dynamic_menu') },
        // { value: 'related_question', text: this.$t('qalist.select_related_questions') },
        // { value: 'not_show', text: this.$t('qalist.select_not_in_recommendation') },
      ],
    };
  },
  computed: {
    ...mapGetters([
      'qaTagTypes',
    ]),
    storeCategories() {
      if (this.category.categories === undefined) {
        this.category.categories = JSON.parse(JSON.stringify(this.qaTagTypes));
      }
      return this.category.categories;
    },
    showed() {
      return (this.dimensionShowed || this.commandShowed);
    },
    canEdit() {
      return this.$checkPrivilege('qalist', 'edit');
    },
    canCreate() {
      return this.$checkPrivilege('qalist', 'create');
    },
    canDelete() {
      return this.$checkPrivilege('qalist', 'delete');
    },
    canExport() {
      return this.$checkPrivilege('qalist', 'export');
    },
    canImport() {
      return this.$checkPrivilege('qalist', 'import');
    },
    validInputString() {
      return this.startValidity && this.endValidity;
    },
    validTimeRange() {
      return this.start.dateObj < this.end.dateObj;
    },
    validFormInput() {
      if (this.timeType === 'forever') {
        return true;
      }
      return this.validTimeRange && this.validInputString;
    },
  },
  methods: {
    ...mapMutations([
      'setQAQueryOptions',
    ]),
    reset() {
      this.timeType = 'forever';
      this.keyword = '';
      this.keywordType = 'all';
      this.clearAllDimension();
    },
    showExportDownloadPop(response) {
      const that = this;
      // const msg = i18nUtil.getLocaleMsgs(this.$i18n);
      if (response.status === 'failed') {
        this.showCheckPop(that.$t('error_msg.export_fail'));
      } else {
        const d = new Date(response.createdTime);
        const dateStr = pickerUtil.toTimeStingByDatetime(d);
        const displayMsg = `${that.$t('qalist.export_download_msg')}: ${dateStr}`;
        // this.$root.$emit('showWindow', {
        that.$popCheck({
          // component: CheckPop,
          ok_msg: that.$t('general.save'),
          buttons: ['ok'],
          callback: {
            ok: () => {
              this.$api.downloadFile(response.stateId);
            },
          },
          data: {
            msg: displayMsg,
          },
        });
      }
    },
    showExportPop() {
      const that = this;
      if (!this.canExport) {
        return;
      }
      const updateQueryOptions = {
        cur_page: 0,
      };
      this.setSearchQueryOptions(updateQueryOptions);
      this.setQAQueryOptions(updateQueryOptions);

      // const msg = i18nUtil.getLocaleMsgs(this.$i18n);
      const options = {
        disable_ok: true,
        component: ExportPop,
        buttons: ['cancel'],
        data: {
          msg: that.$t('qalist.preparing_data'),
        },
        callback: {
          ok: (response) => {
            setTimeout(() => { that.showExportDownloadPop(response); }, 0);
          },
        },
        ok_msg: that.$t('general.save'),
        cancel_msg: that.$t('general.force_cancel'),
        validate: true,
      };
      // this.$root.$emit('showWindow', options);
      this.$pop(options);
    },
    popEditor() {
      if (!this.canCreate) {
        return;
      }
      this.$root.$emit('QASelector::addQuestion');
    },
    deleteQuestions() {
      if (!this.canDelete) {
        return;
      }
      this.$root.$emit('QASelector::deleteQuestions');
    },
    showCheckPop(msg) {
      const that = this;
      // this.$root.$emit('showWindow', {
      that.$popCheck({
        // component: CheckPop,
        data: {
          msg,
        },
        buttons: ['ok'],
      });
    },
    showImportError(msg, id, popOptions) {
      const that = this;
      // this.$root.$emit('showWindow', {
      that.$popCheck({
        // component: CheckPop,
        data: {
          msg,
          id,
        },
        ok_msg: popOptions.ok_msg,
        cancel_msg: that.$t('general.close'),
        callback: {
          ok: () => { this.$api.downloadFile(id); },
        },
      });
    },
    checkImportStatus(id) {
      this.$api.queryOperationProgress(id).then((data) => {
        if (data.status === 'success') {
          this.showCheckPop(this.$t('error_msg.import_success'));
          this.$root.$emit('QASelector::fileimported');
        } else if (data.status === 'running') {
          this.checkTimer = setTimeout(() => {
            this.checkImportStatus.bind(this)(id);
          }, 2000);
        } else {
          // somehow, failed
          const defaultMsg = this.$t('qalist.import_fail_msg');

          // TODO: define error code or something like error code with backend,
          // and display message by error code
          const errMsg = (data.extraInfo.indexOf('问答库模板') > -1) ? data.extraInfo : defaultMsg;

          const popOptions = {
            ok_msg: this.$t('qalist.export_file'),
          };
          this.showImportError(errMsg, id, popOptions);
          this.$root.$emit('QASelector::fileimportFailed');
        }
      });
    },
    importFile(values) {
      const that = this;
      that.$root.$emit('QASelector::fileimportStart');
      const importType = (values.module === '0') ? 'full' : 'incre';
      this.$api.importQuestions(that.$cookie.get('userid'), importType, values.file).then((data) => {
        // upload success, start polling
        const options = {
          // component: CheckPop,
          data: {
            msg: that.$t('qalist.upload_success'),
          },
          buttons: ['ok'],
        };
        that.$root.$emit('QASelector::fileimportUploaded');
        // that.$root.$emit('showWindow', options);
        that.$popCheck(options);
        that.checkImportStatus(data.stateId);
      }).catch(() => {
        this.$root.$emit('QASelector::fileimportFailed');
      });
    },
    popImportForm() {
      if (!this.canImport) {
        return;
      }
      this.$pop({
      // this.$root.$emit('showWindow', {
        component: ImportPop,
        data: {
          file: undefined,
          module: '0',
        },
        callback: {
          ok: (data) => { this.importFile(data); },
        },
      });
    },
    cancelTag(tag) {
      tag.checked = false;
      this.updateDimenstion();
    },
    cancelCommandInAllCheckedState(value, command) {
      // clear allChecked flag and select back rest command
      command.allNotChecked = false;
      command.values.forEach((v) => {
        v.checked = true;
      });
      value.checked = false;
      this.updateCommands();
    },
    cancelCommand(value) {
      value.checked = false;
      this.updateCommands();
    },
    updateDimenstion() {
      // parse selected dimension and update state in store
      const dimensions = [];
      this.storeCategories.forEach((element) => {
        if (!element.allChecked) {
          const values = element.values;
          const allUnChecked = values.reduce((ret, v) => ret && !v.checked, true);
          if (allUnChecked) {
            element.allChecked = allUnChecked;
          } else {
            const dimensionObj = {
              typeId: this.$api.getDiemensionTypeId(element.type),
              tagContent: '',
            };

            let first = true;
            values.forEach((value) => {
              if (value.checked) {
                if (first) {
                  first = false;
                  dimensionObj.tagContent += `#${value.text}#`;
                } else {
                  dimensionObj.tagContent += `,#${value.text}#`;
                }
              }
            });
            dimensions.push(dimensionObj);
          }
        }

        if (dimensions.length > 0) {
          this.dimensionShowed = true;
        } else {
          this.dimensionShowed = false;
        }

        this.setQAQueryOptions({ dimension: JSON.stringify(dimensions) });
      });
    },
    handleDimensionClick() {
      const originCategories = JSON.parse(JSON.stringify(this.storeCategories));
      this.$pop({
      // this.$root.$emit('showWindow', {
        component: DimensionSelector,
        data: this.category.categories,
        callback: {
          cancel: () => {
            this.category.categories = originCategories;
          },
          ok: this.updateDimenstion,
        },
      });
    },
    updateCommands() {
      let shouldShow = false;
      const updateQueryOptions = {};

      this.commands.forEach((command) => {
        if (command.type === 'command') {
          command.values.forEach((box) => {
            if (box.id === 'select_related_questions') {
              updateQueryOptions.relative_question = (box.checked) ? 1 : 0;
            } else if (box.id === 'select_dynamic_menu') {
              updateQueryOptions.dynamic_menu = (box.checked) ? 1 : 0;
            } else {
              updateQueryOptions.not_show = (box.checked) ? 1 : 0;
            }
            shouldShow = (shouldShow || box.checked);
          });
        }
      });

      this.commandShowed = shouldShow;
      this.setQAQueryOptions(updateQueryOptions);
    },
    handleCommandClick() {
      const originCommands = JSON.parse(JSON.stringify(this.commands));
      this.$pop({
      // this.$root.$emit('showWindow', {
        component: CommandSelector,
        data: this.commands,
        callback: {
          ok: this.updateCommands,
          cancel: () => {
            this.commands = originCommands;
          },
        },
      });
    },
    initCommand() {
      // const msg = i18nUtil.getLocaleMsgs(this.$i18n);
      const that = this;
      this.commands = [
        {
          type: 'command',
          text: that.$t('qalist.command'),
          noCommandText: that.$t('qalist.no_command'),
          allNotChecked: true,
          values: [
            {
              id: 'select_related_questions',
              text: that.$t('qalist.select_related_questions'),
              checked: false,
            },
            {
              id: 'select_dynamic_menu',
              text: that.$t('qalist.select_dynamic_menu'),
              checked: false,
            },
            {
              id: 'select_not_in_recommendation',
              text: that.$t('qalist.select_not_in_recommendation'),
              checked: false,
            },
          ],
        },
      ];
    },
    setSearchQueryOptions(queryOptions) {
      queryOptions.search_question = false;
      queryOptions.search_answer = false;
      queryOptions.search_dm = false;
      queryOptions.search_rq = false;
      queryOptions.not_show = false;
      queryOptions.search_all = false;

      if (this.timeType === 'forever') {
        const foreverStartPicker = pickerUtil.createForeverStartPickerObj();
        const foreverEndPicker = pickerUtil.createForeverEndPicker();
        queryOptions.begin_time = pickerUtil.toTimeString(foreverStartPicker);
        queryOptions.end_time = pickerUtil.toTimeString(foreverEndPicker);
        queryOptions.timeset = false;
      } else {
        queryOptions.begin_time = pickerUtil.toTimeString(this.start);
        queryOptions.end_time = pickerUtil.toTimeString(this.end);
        queryOptions.timeset = true;
      }

      queryOptions.key_word = this.keyword.trim();

      if (this.keywordType === 'question') {
        queryOptions.search_question = true;
      } else if (this.keywordType === 'answer') {
        queryOptions.search_answer = true;
      } else if (this.keywordType === 'dynamic_menu') {
        queryOptions.search_dm = true;
      } else if (this.keywordType === 'related_question') {
        queryOptions.search_rq = true;
      } else if (this.keywordType === 'not_show') {
        queryOptions.not_show = true;
      } else if (this.keywordType === 'all' && /\S/.test(this.keyword)) {
        queryOptions.search_all = true;
      }
    },
    handleQuery() {
      // update qaQueryOptions and emit query event
      const updateQueryOptions = {
        cur_page: 0,
      };

      this.setSearchQueryOptions(updateQueryOptions);

      this.setQAQueryOptions(updateQueryOptions);

      this.$root.$emit('QASelector::doQuery');
    },
    clearAllDimension() {
      this.dimensionShowed = false;
      // this.commandShowed = false;

      // this.commands.forEach((command) => {
      //   command.allNotChecked = true;
      //   command.values.forEach((value) => {
      //     value.checked = false;
      //   });
      // });
      // this.updateCommands();

      this.storeCategories.forEach((element) => {
        element.allChecked = true;
        const values = element.values;

        values.forEach((value) => {
          value.checked = false;
        });
      });
      this.updateDimenstion();
    },
    handlePickerChanged(d) {
      this.start.dateObj = d;
      pickerUtil.initTimeObj(this.start);
    },
    handleEndPickerChanged(d) {
      this.end.dateObj = d;
      pickerUtil.initTimeObj(this.end);
    },
  },
  beforeMount() {
    const msg = this.$i18n.messages[this.$i18n.locale];
    pickerUtil.initTime(this);
    const categories = CategoryList.getLocaleData(msg);
    this.category = categories[0];
    this.category.categories = undefined;

    // this.initCommand();
  },
  beforeDestroy() {
    if (this.checkTimer) {
      clearTimeout(this.checkTimer);
    }
  },
  watch: {
    timeType() {
      if (this.timeType === 'self-defined') {
        pickerUtil.initTime(this);
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
$button-height: 30px;

div {
  display: inline-block;
  font-size: 16px;
  margin-right: 20px;
  vertical-align: middle;
}
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  display: inline-block;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

$fill-parent: 100%;
$operations-heigth: 25%;

#qalist-query-operations {
  width: $fill-parent;
  min-height: 12%;
  height: auto;
}

 #clear_all_dimenstions {
  color: #118EEB;
  cursor: pointer;
}


.row {
  width: $fill-parent;
  height: 50px;
  padding-bottom: 10px;
  &.auto-height {
    height: auto;
  }
}

.qalist-button {
  border-radius: 5px;
  height: $button-height;

  &input {
    margin-left: 27px;
    width: 140px;
  }
}

.tags {
  width: 70%;
  display: inline-flex;
  flex-wrap: wrap;
}

.filter-item{
  display: flex;
  height: 30px;
  align-items:center;
  justify-content:center;
  color: #0099FF;
  border: 1px solid #0099FF;
  border-radius: 5px;
  padding:3px;
  margin-top: 5px;
  margin-left: 6px;
}
.filter-item-cancel{
  font-size: 20px;
  margin-left: 10px;
  cursor: pointer;
}
  
select {
  width: 90px;
  height: $button-height;
  border: 1px solid black;
}
  
.title{
  font-weight: bold;
}
  
.date {
  width:160px;
  height: $button-height;
  line-height: $button-height;
}
  
.datetime {
  width: 120px;
  height: $button-height;
  line-height: $button-height;
}
  
.filter-button {
  width: 60px;
  height: $button-height;
  line-height: $button-height;
  border-color: #118EEB;
  color: #118EEB;
}
  
#keyword-text {
  margin-left: 20px;
}

.center-align {
  display: flex;
  justify-content: center;
  align-items: center
}
</style>