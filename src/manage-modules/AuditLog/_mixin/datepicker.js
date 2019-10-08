import pickerUtil from '@/utils/vue/DatePickerUtil';

const datepicker = {
  data() {
    return {
      start: pickerUtil.createDateObj(),
      end: pickerUtil.createDateObj(),
      startValidity: true,
      endValidity: true,
      startDisableDate: undefined,
      endDisableDate: undefined,
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
  computed: {
    validTimeRange() {
      return this.end.dateObj > this.start.dateObj;
    },
    validInputString() {
      return this.startValidity && this.endValidity;
    },
    validFormInput() {
      return this.validTimeRange && this.validInputString;
    },
  },
  methods: {
    setUpTime(day) {
      const that = this;
      if (day === -1) {
        return;
      }
      const now = new Date();
      const endDate = new Date();
      const startDate = new Date();
      endDate.setDate(now.getDate());
      startDate.setDate(now.getDate() - day);
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
      that.$nextTick(() => {
        that.dayRange = day; // update lable switch after datepicker is updated
      });
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
    handleStartDateChanged(d) {
      this.dayRange = -1;
      this.start.dateObj = d;
      pickerUtil.initTimeObj(this.start);
      this.endDisableDate = {
        to: this.start.dateObj,
      };
    },
    handleEndDateChanged(d) {
      this.dayRange = -1;
      this.end.dateObj = d;
      pickerUtil.initTimeObj(this.end);
      this.startDisableDate = {
        from: this.end.dateObj,
      };
    },
    initDatetimePicker() {
      pickerUtil.initTime(this);
      this.startDisableDate = {
        from: this.end.dateObj,
      };
      this.endDisableDate = {
        to: this.start.dateObj,
      };
      this.$nextTick(() => {
        this.dayRange = 1; // update lable switch after datepicker is updated
      });
    },
  },
};

export default datepicker;
