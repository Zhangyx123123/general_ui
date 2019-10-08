<template>
  <div id="time-range-picker">
    <time-picker
      ref="startPicker"
      hide-clear-button
      :value="startTimeObj"
      :readonly="false"
      :currentDate="datetime"
      :format="secondFormat ? 'HH:mm:ss' : 'HH:mm'"
      :minute-interval="5"
      :placeholder="allowEmpty ? 'hh:mm:ss' : 'hh:mm'"
      :allowEmpty="allowEmpty"
      @change="onTimeSelected(startTimeObj, $event)"
      @validityChange="value => {timeValidity = value}"
      @displayEmpty="value => {timeEmpty = value}"
      @cancel="$emit('cancel')"
      @inputBlur="checkBlur"
      @finish="$refs.endPicker.focus()"
      @tab="switchInput($refs.endPicker, $event)"
    ></time-picker>
    ~
    <time-picker
      ref="endPicker"
      hide-clear-button
      :value="endTimeObj"
      :readonly="false"
      :currentDate="datetime"
      :format="secondFormat ? 'HH:mm:ss' : 'HH:mm'"
      :minute-interval="5"
      :placeholder="allowEmpty ? 'hh:mm:ss' : 'hh:mm'"
      :allowEmpty="allowEmpty"
      @change="onTimeSelected(endTimeObj, $event)"
      @validityChange="value => {timeValidity = value}"
      @displayEmpty="value => {timeEmpty = value}"
      @cancel="$emit('cancel')"
      @inputBlur="checkBlur"
      @finish="finish"
      @tab="switchInput($refs.startPicker, $event)"
    ></time-picker>
  </div>
</template>

<script>
import TimePicker from './DateTimePicker/TimePicker';

export default {
  components: {
    TimePicker,
  },
  props: {
    start: {
      type: String,
      required: false,
      default: '00:00',
    },
    end: {
      type: String,
      required: false,
      default: '00:00',
    },
  },
  data() {
    return {
      allowEmpty: false,
      secondFormat: false,
      startTimeObj: {
        HH: '00',
        mm: '00',
      },
      endTimeObj: {
        HH: '00',
        mm: '00',
      },
      datetime: new Date(),
    };
  },
  methods: {
    onTimeSelected(obj, input) {
      obj.HH = input.data.HH;
      obj.mm = input.data.mm;
    },
    focus() {
      this.$refs.startPicker.focus();
    },
    finish() {
      const startStr = `${this.startTimeObj.HH}:${this.startTimeObj.mm}`;
      const endStr = `${this.endTimeObj.HH}:${this.endTimeObj.mm}`;
      this.$emit('finish', {
        start: startStr,
        end: endStr,
      });
    },
    checkBlur() {
      const currentFocus = document.activeElement;
      if (this.$refs.startPicker.$el.contains(currentFocus) ||
        this.$refs.endPicker.$el.contains(currentFocus)) {
        return;
      }
      this.$emit('cancel');
    },
    switchInput(target, e) {
      target.focus();
      e.preventDefault();
    },
  },
  beforeMount() {
    let h;
    let m;
    [h, m] = this.start.split(':');
    this.startTimeObj = {
      HH: h,
      mm: m,
    };
    [h, m] = this.end.split(':');
    this.endTimeObj = {
      HH: h,
      mm: m,
    };
  },
};
</script>

<style lang="scss">
@import "styles/variable.scss";
#time-range-picker {
  display: inline-block;
  .time-picker {
    width: auto;
    input {
      width: 60px;
    }
  }
  &.second-format {
    .time-picker {
      width: auto;
      input {
        width: 100px;
      }
    }
  }
}
</style>
