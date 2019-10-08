<template>
  <div class="qa-answer-edit-box">
    <div class="qa-default-answer" v-if="data.defaultAnswer">
      <div class="center-align" style="color:red;">*</div>
      <div class="center-align margin-left">{{ $t('general.default') }}{{ $t('qalist.standard_a') }} </div>
    </div>
    <div class="qa-dimension clickable" @click="showDimensionSelector">
      <div>{{ $t('qalist.tags') }}</div>
      <div class="fa fa-chevron-down"></div>
    </div>
    <div class="margin-top flex" v-if="selectedDimensions.length > 0" style="flex-wrap: wrap;">
      <template v-for="(value, index) in selectedDimensions">
        <span class="filter-item-text margin-left margin-top" :key="index">
          {{ value.text }}
          <span v-on:click="unSelectDimension(value)" class="filter-item-cancel">
            x
          </span>
        </span>
      </template>
      <span class="filter-item-text margin-left margin-top clickable" style="color: #118EEB; border:none;"
        @click="unSelectAllDimensions">{{ $t('qalist.clear_all_dimensions') }}</span>
    </div>
    <div class="margin-top"></div>
    <qa-editor :extData="{fitParent: true}" :value="data.editorOptions" v-on:updateData="handleEditorChange" v-on:disableOK="disableOK" v-on:enableOK="enableOk"></qa-editor>
    <!-- <div class="margin-top  -->
    <div class="margin-top flex">
      <input class="center-align" type="radio" value="forever" v-model="data.timeType">
      <label class="center-align">{{ $t('qalist.permanent') }}</label>
      <input class="margin-left center-align" type="radio" value="self-defined" v-model="data.timeType">
      <label class="center-align">{{ $t('qalist.self_defined') }}</label>
      <div class="flex margin-left" v-if="data.timeType === 'self-defined'">
        <datetime-picker
          :value="data.picker"
          @dateChanged="handlePickerChanged"
          @validityChange="value => {startValidity = value}"
        ></datetime-picker>
        <div class="margin-left center-align flex" style="margin-right: 10px;"> {{ $t("qalist.to") }} </div>
        <datetime-picker
          :value="data.endPicker"
          @dateChanged="handleEndPickerChanged"
          @validityChange="value => {endValidity = value}"
        ></datetime-picker>
        <div class="error-text center-align" style="margin-left: 20px;" v-if="!validTimeRange"> {{ $t('qalist.starttime_later_than_endtime_warning') }} </div>
      </div>
    </div>
    <text-button @click="onAddAnswer">{{ $t('general.add') }}{{ $t('qalist.standard_a') }}</text-button>
    <text-button @click="onRemoveAnswer" v-if="!data.defaultAnswer">{{ $t('general.delete') }}{{ $t('qalist.standard_a') }}</text-button>
    <!-- <div class="margin-top center-align" style="display: inline-flex; width: 100px; cursor: pointer;" @click="onAddAnswer"> 
      {{ $t('general.add') }}{{ $t('qalist.standard_a') }}
    </div> -->
    <!-- <div class="margin-top center-align" style="display: inline-flex; width: 100px; cursor: pointer;" @click="onRemoveAnswer" v-if="!data.defaultAnswer"> 
      {{ $t('general.delete') }}{{ $t('qalist.standard_a') }}
    </div> -->
  </div>
</template>

<script>
import DimensionSelector from '@/components/DimensionSelector';
import DatetimePicker from '@/components/DateTimePicker';
// import CheckPop from '@/components/popForm/CheckPop';
// import i18nUtil from '@/utils/i18nUtil';
import PickerUtil from '@/utils/vue/DatePickerUtil';
import DynamicListInput from './DynamicListInput';
import QAAnswerEditorPop from './QAAnswerEditorPop';

export default {
  name: 'QAAnswerEditBox',
  props: {
    id: {
      type: Number,
      required: true,
    },
    value: {
      type: Object,
      default() {
        return {};
      },
    },
    onAddAnswer: {
      type: Function,
      required: true,
    },
    onRemoveAnswer: {
      type: Function,
      required: true,
    },
    defaultAnswer: {
      type: Boolean,
    },
    dimensions: {
      type: Array,
    },
    editorOptions: {
      type: Object,
    },
    picker: {
      type: Object,
    },
    endPicker: {
      type: Object,
    },
    relatedQuestions: {
      type: Array,
      default() {
        return [];
      },
    },
    dynamicMenu: {
      type: Array,
      default() {
        return [];
      },
    },
    command: {
      type: String,
      default() {
        return '';
      },
    },
    commandMsg: {
      type: String,
      default() {
        return '';
      },
    },
    timeType: {
      type: String,
      default() {
        return 'forever';
      },
    },
    notShowInRelativeQ: {
      type: Boolean,
    },
  },
  data() {
    const data = JSON.parse(JSON.stringify(this.$options.propsData));
    data.picker = this.$options.propsData.picker;
    data.endPicker = this.$options.propsData.endPicker;
    return {
      data,
      editing: false,
      startValidity: true,
      endValidity: true,
    };
  },
  computed: {
    selectedDimensions() {
      const dimensions = this.data.dimensions;
      const selected = [];
      dimensions.forEach((subDimenstion, dimensionIndex) => {
        if (!subDimenstion.checked) {
          subDimenstion.values.forEach((value, valueIndex) => {
            if (value.checked) {
              selected.push({
                text: value.text,
                valueIndex,
                dimensionIndex,
              });
            }
          });
        }
      });
      return selected;
    },
    validInputString() {
      return this.startValidity && this.endValidity;
    },
    validTimeRange() {
      return this.picker.dateObj < this.endPicker.dateObj;
    },
    validFormInput() {
      if (this.data.timeType === 'forever') {
        return true;
      }
      return this.validTimeRange && this.validInputString;
    },
  },
  watch: {
    validFormInput() {
      if (this.validFormInput) {
        this.$emit('enableOK');
      } else {
        this.$emit('disableOK');
      }
    },
  },
  methods: {
    handlePickerChanged(d) {
      this.picker.dateObj = d;
      PickerUtil.initTimeObj(this.picker);
    },
    handleEndPickerChanged(d) {
      this.endPicker.dateObj = d;
      PickerUtil.initTimeObj(this.endPicker);
    },
    checkOk() {
      let ok = true;
      ok = this.validTimeRange || this.data.timeType === 'forever';

      if (this.defaultAnswer && !(/\S/.test(this.data.editorOptions.newContent))) {
        ok = false;
      }

      return ok;
    },
    showDynamicMenuInput() {
      // const msg = i18nUtil.getLocaleMsgs(this.$i18n);
      const that = this;
      const options = {};
      if (this.data.relatedQuestions.length > 0) {
        that.$popCheck({
          buttons: ['ok'],
          data: {
            msg: that.$t('qalist.relatedQ_dynamic_alarm_msg'),
          },
        });
      } else {
        options.component = DynamicListInput;
        options.data = {
          contents: that.data.dynamicMenu,
          contentMaxNum: 99,
        };
        options.callback = {
          ok: () => { that.checkList(that.data.dynamicMenu); },
          cancel: () => { that.checkList(that.data.dynamicMenu); },
        };
        options.buttons = ['ok'];
        that.showWindow(options);
      }
    },
    showRelatedQuestionInput() {
      const that = this;
      // const msg = i18nUtil.getLocaleMsgs(this.$i18n);
      const options = {};
      if (this.data.dynamicMenu.length > 0) {
        that.$popCheck({
          buttons: ['ok'],
          data: {
            msg: that.$t('qalist.relatedQ_dynamic_alarm_msg'),
          },
        });
      } else {
        options.component = DynamicListInput;
        options.data = {
          contents: that.data.relatedQuestions,
          contentMaxNum: 99,
        };
        options.callback = {
          ok: () => { that.checkList(that.data.relatedQuestions); },
          cancel: () => { that.checkList(that.data.relatedQuestions); },
        };
        options.buttons = ['ok'];
        that.showWindow(options);
      }
    },
    showDimensionSelector() {
      const oldDimensions = JSON.parse(JSON.stringify(this.data.dimensions));
      const options = {
        component: DimensionSelector,
        data: this.data.dimensions,
        callback: {
          cancel: () => { this.data.dimensions = oldDimensions; },
        },
      };
      this.showWindow(options);
    },
    showWindow(options) {
      // this.$refs.pop.showWindow(options);
      // this.$root.$emit('showWindow', options);
      this.$pop(options);
    },
    submitAnswer() {
      const that = this;
      if (!(/\S/.test(this.data.editorOptions.newContent))) {
        // const msg = i18nUtil.getLocaleMsgs(this.$i18n);
        const options = {
          // component: CheckPop,
          buttons: ['ok'],
          data: {
            msg: that.$t('qalist.edit_box_empty_alarm_msg'),
          },
        };
        // this.showWindow(options);
        that.$popCheck(options);
      } else {
        this.data.editorOptions.content = this.data.editorOptions.newContent;
        this.onSubmitAnswer(this.id, this.data);
      }
    },
    unSelectAllDimensions() {
      this.data.dimensions.forEach((dimension) => {
        dimension.allChecked = true;
        dimension.values.forEach((value) => {
          value.checked = false;
        });
      });
    },
    unSelectDimension(value) {
      this.data.dimensions[value.dimensionIndex].values[value.valueIndex].checked = false;
      const dimension = this.data.dimensions[value.dimensionIndex];
      const allNotChecked = dimension.values.reduce((ret, v) => ret && !v.checked, true);
      if (allNotChecked) {
        dimension.allChecked = allNotChecked;
      }
    },
    checkList(list) {
      const copiedList = list.slice();
      copiedList.forEach((text, index) => {
        if (!(/\S/.test(text))) {
          list.pop(index, 1);
        }
      });
    },
    toggleShowInRelativeQ() {
      this.data.notShowInRelativeQ = !this.data.notShowInRelativeQ;
    },
    handleEditorChange(newContent) {
      this.data.editorOptions.content = newContent;
    },
    disableOK() {
      if (this.defaultAnswer) {
        this.$emit('disableOK', {});
      }
    },
    enableOk() {
      if (this.defaultAnswer) {
        this.$emit('enableOK', {});
      }
    },
  },
  components: {
    'qa-editor': QAAnswerEditorPop,
    'datetime-picker': DatetimePicker,
    'dimension-selector': DimensionSelector,
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
  .qa-answer-edit-box {
    width: 100%;
    border: solid 1px gray;
    padding: 20px;

    .center-align {
      display: flex;
      align-items:center;
      justify-content:center;
    }

    .margin-left {
      margin-left: 10px;
    }

    .margin-top {
      margin-top: 10px;
    }

    .qa-default-answer {
      display: flex;
      height: 50px;
    }

    .flex {
      display: flex;
    }

    .qa-dimension {
      height: 30px;
      display: flex;
    }

    .button {
      width: 100px;
      font-size: 13px;
      height: 30px;
      border: solid 1px gray;
      border-radius: 3px;
      cursor: pointer;
    }

    .buttonChecked {
      background-color: gray;
    }

    .clickable {
      cursor: pointer;
    }

    .pop-window {
        background-color:gray;
        z-index: 1001;
        top: 400px;
        width: 900px;
    }

    .filter-item-text {
      display: flex;
      align-items: center;
      justify-content: center;
      border: solid 1px black;
      height: 30px;
      padding: 5px;
      border-radius: 5px;
    }

    .filter-item-cancel {
      font-size: 20px;
      margin-left: 10px;
      cursor: pointer;
    }

    .error-text {
      color:red;
    }

    /deep/ .dynamic_input {
        overflow:hidden;
    }

    input[type="radio"] {
      height: 40px;
    }
  }
</style>
