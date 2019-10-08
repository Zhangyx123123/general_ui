<template>
  <div class='datetimepicker' v-tooltip="datetimePickerTooltip" ref="picker">
    <div class='picker' id="date-picker">
      <date-picker
        ref="datepicker"
        :value="datetime ? datetime.dateObj : undefined"
        :readonly="false"
        :disabled="disableDate"
        :placeholder="'yyyy/mm/dd'"
        :allowEmpty="allowEmpty"
        format="yyyy/MM/dd"
        language="zh"
        @selected="onDateSelected"
        @validityChange="value => {dateValidity = value}"
        @displayEmpty="value => {dateEmpty = value}"
      ></date-picker>
    </div>
    <div class='picker' id="time-picker" :class="{'second-format': secondFormat}">
      <time-picker
        ref="timepicker"
        hide-clear-button
        :value="datetime ? datetime.timeObj : undefined"
        :readonly="false"
        :currentDate="datetime ? datetime.dateObj : undefined"
        :disabled="disableDate"
        :format="secondFormat ? 'HH:mm:ss' : 'HH:mm'"
        :minute-interval="5"
        :placeholder="allowEmpty ? 'hh:mm:ss' : 'hh:mm'"
        :allowEmpty="allowEmpty"
        @change="onTimeSelected"
        @validityChange="value => {timeValidity = value}"
        @displayEmpty="value => {timeEmpty = value}"
      ></time-picker>
    </div>
  </div>
</template>

<script>
import event from '@/utils/js/event';
import datePickerUtil from '@/utils/vue/DatePickerUtil';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';

export default {
  props: {
    value: {
      type: Object,
      required: true,
    },
    disableDate: {
      type: Object,
      required: false,
    },
    secondFormat: {
      type: Boolean,
      default: false,
      required: false,
    },
    allowEmpty: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  computed: {
    validity() {
      if (this.allowEmpty) {
        return this.emptyValidity && (this.dateValidity && this.timeValidity);
      }
      return this.dateValidity && this.timeValidity;
    },
    emptyValidity() {
      const bothEmpty = this.dateEmpty && this.timeEmpty;
      const bothNonEmpty = !this.dateEmpty && !this.timeEmpty;
      return bothEmpty || bothNonEmpty;
    },
  },
  watch: {
    validity() {
      const that = this;
      that.$emit('validityChange', that.validity);
    },
    emptyValidity() {
      const that = this;
      if (that.allowEmpty) {
        if (that.emptyValidity) {
          if (this.dateEmpty && this.timeEmpty) {
            that.$emit('pickerEmptyChange', true);
          } else {
            that.$emit('pickerEmptyChange', false);
          }
          that.$refs.picker.dispatchEvent(event.createEvent('tooltip-hide'));
        } else {
          that.$refs.picker.dispatchEvent(event.createEvent('tooltip-show'));
          that.$emit('pickerEmptyChange', false);
        }
      }
    },
  },
  methods: {
    onDateSelected(d) {
      if (!this.datetime) {
        return;
      }
      this.datetime.dateObj = d;
      this.emitUpdate();
    },
    onTimeSelected(t) {
      const obj = {};
      Object.keys(this.datetime.timeObj).forEach((key) => {
        obj[key] = t.data[key];
      });
      this.datetime.timeObj = obj;
      this.emitUpdate();
    },
    emitUpdate() {
      const syncedDate = new Date(this.datetime.getTimestamp() * 1000);
      this.$emit('dateChanged', syncedDate);
      this.$emit('input', syncedDate);
    },
    setValue(date) {
      if (!this.datetime) {
        return;
      }
      this.datetime.dateObj = date;
      const hour = date.getHours();
      const minutes = date.getMinutes();
      this.datetime.timeObj = {
        HH: hour >= 10 ? `${hour}` : `0${hour}`,
        mm: minutes >= 10 ? `${minutes}` : `0${minutes}`,
        ss: '00',
      };
      this.$refs.timepicker.$emit('setTime', date);
      this.$refs.datepicker.$emit('setDate', date);
    },
  },
  components: {
    DatePicker,
    TimePicker,
  },
  data() {
    return {
      dateValidity: true,
      timeValidity: true,

      dateEmpty: false,
      timeEmpty: false,
      datetimePickerTooltip: {
        msg: this.$t('error_msg.time_format_error'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      datetime: undefined,
    };
  },
  mounted() {
    const timeString = datePickerUtil.toTimeString(this.value);
    this.datetime = datePickerUtil.createPickerByTimeStr(timeString);
    this.$on('setValue', (val) => {
      this.setValue(val);
    });
  },
};
</script>
<style lang="scss">
@import "styles/variable.scss";
$row-height: 30px;
$light-main: $page-header-color;

.datetimepicker {
  display: flex;
  align-items: center;
  position: relative;
  @include font-12px();
  

  .picker {
    display: inline-block;
  }
  #date-picker {
    margin-right: 5px;
    input {
      width: 100px;
    }
  }
  #time-picker {
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
}
</style>
 