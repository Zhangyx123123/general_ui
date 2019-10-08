<template>
  <div class="range-picker">
    <div class="range-title" v-if="name !== undefined ">{{ name }}</div>
    <label-switch :options="timeOption" v-model="dayRange" @change="setUpTimeViaDay"></label-switch>
    <datetime-picker
      :value="start"
      :disableDate="startDisableDate"
      @dateChanged="handleStartDateChanged"
      @validityChange="value => {startValidity = value}"
      ref="start"
    ></datetime-picker>
    <div>
    ～
    </div>
    <datetime-picker
      :value="end"
      :disableDate="endDisableDate"
      @dateChanged="handleEndDateChanged"
      @validityChange="value => {endValidity = value}"
      ref="end"
    ></datetime-picker>
  </div>
</template>

<script>
import LabelSwitch from '@/components/basic/LabelSwitch';
import pickerUtil from '@/utils/vue/DatePickerUtil';
import DatetimePicker from './DateTimePicker';

export default {
  props: {
    // default start is 24hr ago
    startTime: {
      type: [Date, Number],
      required: false,
      default: undefined,
    },
    // default end is now
    endTime: {
      type: [Date, Number],
      required: false,
      default: undefined,
    },
    name: {
      type: String,
      required: false,
    },
  },
  components: {
    DatetimePicker,
    LabelSwitch,
  },
  data() {
    const obj = {
      start: pickerUtil.createDateObj(),
      end: pickerUtil.createDateObj(),
    };
    const startDisableDate = obj.end ? {
      from: obj.end.dateObj,
    } : undefined;
    const endDisableDate = obj.start ? {
      to: obj.start.dateObj,
    } : undefined;
    pickerUtil.initTime(obj);
    return {
      start: obj.start,
      end: obj.end,
      startDisableDate,
      endDisableDate,
      startValidity: true,
      endValidity: true,
      timeOption: [
        {
          text: `1${this.$t('statistics.day')}`,
          val: 1,
        },
        {
          text: `7${this.$t('statistics.day')}`,
          val: 7,
        },
        {
          text: `${this.$t('general.custom')}`,
          val: -1,
        },
      ],
      dayRange: 1,
    };
  },
  watch: {
    startValidity() {
      this.validateThenEmit();
    },
    endValidity() {
      this.validateThenEmit();
    },
  },
  methods: {
    validateThenEmit() {
      if (this.startValidity && this.endValidity) {
        this.$emit('input', {
          start: this.start,
          end: this.end,
        });
      }
    },
    handleStartDateChanged(d) {
      this.dayRange = -1;
      this.start.dateObj = d;
      pickerUtil.initTimeObj(this.start);
      this.endDisableDate = {
        to: this.start.dateObj,
      };
      this.emitUpdate();
    },
    handleEndDateChanged(d) {
      this.dayRange = -1;
      this.end.dateObj = d;
      pickerUtil.initTimeObj(this.end);
      this.startDisableDate = {
        from: this.end.dateObj,
      };
      this.emitUpdate();
    },
    emitUpdate() {
      this.$emit('update', {
        start: this.start.dateObj,
        end: this.end.dateObj,
      });
    },
    setUpTimeViaDay(day) {
      const that = this;
      if (day === -1) {
        return;
      }
      const now = new Date();
      const endDate = new Date();
      const startDate = new Date();
      endDate.setDate(now.getDate());
      startDate.setDate(now.getDate() - day);

      that.setUpTime(startDate, endDate);
      that.$nextTick(() => {
        that.dayRange = day;  // update lable switch after datepicker is updated
      });
    },
    setUpTime(startDate, endDate) {
      const that = this;

      const startDateObj = that.setStartDateObj(startDate);
      const endDateObj = that.setEndDateObj(endDate);
      that.start = startDateObj;
      that.end = endDateObj;
      that.endDisableDate = {
        to: that.start.dateObj,
      };
      that.startDisableDate = {
        from: that.end.dateObj,
      };

      that.$refs.start.$emit('setValue', startDate);
      that.$refs.end.$emit('setValue', endDate);
    },
    setStartDateObj(d) {
      const startDateObj = pickerUtil.createDateObj();
      startDateObj.dateObj = d;
      pickerUtil.initTimeObj(startDateObj);
      return startDateObj;
    },
    setEndDateObj(d) {
      const endDateObj = pickerUtil.createDateObj();
      endDateObj.dateObj = d;
      pickerUtil.initTimeObj(endDateObj);
      return endDateObj;
    },
    getCurrentValue() {
      return {
        start: this.start.dateObj,
        end: this.end.dateObj,
      };
    },
  },
  mounted() {
    const that = this;
    let dayRange = 1;
    if (that.startTime !== undefined && that.endTime !== undefined) {
      let startDate = that.startTime;
      if (!(startDate instanceof Date)) {
        startDate = new Date(parseInt(startDate, 10) * 1000);
      }
      let endDate = that.endTime;
      if (!(endDate instanceof Date)) {
        endDate = new Date(parseInt(endDate, 10) * 1000);
      }
      that.setUpTime(startDate, endDate);
      dayRange = -1;
    }
    that.$nextTick(() => {
      that.dayRange = dayRange;  // update lable switch after datepicker is updated
    });

    that.$on('set-start', (value) => {
      that.$refs.start.$emit('setValue', value);
    });
    that.$on('set-end', (value) => {
      that.$refs.end.$emit('setValue', value);
    });
  },
};

</script>

<style lang="scss" scoped>
.range-picker {
  display: inline-flex;
  align-items: center;
  & > div {
    margin-right: 5px;
  }
  .range-title {
    @include font-14px();
    margin-right: 10px;
    white-space: nowrap;
  }
}
</style>
