<template>
  <div>
    <div id="qa-date-picker-pop-container">
      <input value="forever" type="radio" v-model="value.type">
      <label class="flex center-align"> {{ $t('qalist.permanent') }}</label>
      <input value="self-defined" type="radio" v-model="value.type">
      <label class="flex center-align"> {{ $t('qalist.self_defined') }} </label>
      <div class="flex margin-left" v-if="value.type === 'self-defined'">
        <datetime-picker
          :value="value.picker"
          @dateChanged="handlePickerChanged"
          @validityChange="value => {startValidity = value}"
        ></datetime-picker>
        <div class="margin-left flex center-align" style="margin-right: 10px; height: 40px;"> {{ $t("qalist.to") }} </div>
        <datetime-picker
          :value="value.endPicker"
          @dateChanged="handleEndPickerChanged"
          @validityChange="value => {endValidity = value}"
        ></datetime-picker>
      </div>
    </div>
    <div style="width:100%; color:red; margin-top: 10px;" v-if="!validTimeRange"> {{ $t('qalist.starttime_later_than_endtime_warning') }} </div>
  </div>
</template>

<script>
import DatetimePicker from '@/components/DateTimePicker';
import PickerUtil from '@/utils/vue/DatePickerUtil';

export default {
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  methods: {
    validatePicker() {
      if (this.value.type === 'forever') {
        this.value.picker = PickerUtil.createForeverStartPickerObj();
        this.value.endPicker = PickerUtil.createForeverEndPicker();
      }
      this.$emit('validateSuccess', this.value);
    },
    handlePickerChanged(d) {
      this.value.picker.dateObj = d;
      PickerUtil.initTimeObj(this.value.picker);
    },
    handleEndPickerChanged(d) {
      this.value.endPicker.dateObj = d;
      PickerUtil.initTimeObj(this.value.endPicker);
    },
  },
  data() {
    return {
      startValidity: true,
      endValidity: true,
    };
  },
  computed: {
    validInputString() {
      return this.startValidity && this.endValidity;
    },
    validTimeRange() {
      return this.value.picker.dateObj < this.value.endPicker.dateObj;
    },
    validFormInput() {
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
  components: {
    'datetime-picker': DatetimePicker,
  },
  mounted() {
    this.$on('validate', this.validatePicker);
  },
};
</script>

<style lang="scss" scoped>
#qa-date-picker-pop-container {
  width: 800px;
  display: flex;

  input {
    height: 40px;
  }

  label {
    height: 40px;
  }

  .flex {
    display: flex;
  }
  .margin-left {
    margin-left: 10px;
  }

  .center-align {
    justify-content: center;
      align-items: center;
  }
}

</style>

