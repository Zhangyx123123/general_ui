<script>
import eventUtil from '@/utils/js/event';

const CONFIG = {
  HOUR_TOKENS: ['HH', 'H', 'hh', 'h', 'kk', 'k'],
  MINUTE_TOKENS: ['mm', 'm'],
  SECOND_TOKENS: ['ss', 's'],
  APM_TOKENS: ['A', 'a'],
};

export default {
  name: 'VueTimepicker',

  props: {
    value: { type: Object },
    hideClearButton: { type: Boolean },
    format: { type: String },
    minuteInterval: { type: Number },
    secondInterval: { type: Number },
    id: { type: String },
    readonly: Boolean,
    disabled: Object,
    currentDate: Date,
    placeholder: {
      type: String,
      default: '',
    },
    allowEmpty: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      hours: [],
      minutes: [],
      seconds: [],
      apms: [],
      showDropdown: false,
      muteWatch: false,
      hourType: 'HH',
      minuteType: 'mm',
      secondType: '',
      apmType: '',
      hour: '',
      minute: '',
      second: '',
      apm: '',
      fullValues: undefined,
      displayTime: '00:00',
      validity: true,
      manualInput: false,
      selectInput: false,
      listStyle: {},

      timepickerTooltip: {
        msg: this.$t('error_msg.time_format_error'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
    };
  },

  computed: {
    formattedDisplayTime() {
      let formatString = String((this.format || 'HH:mm'));
      if (this.hour) {
        formatString = formatString.replace(new RegExp(this.hourType, 'g'), this.hour);
      }
      if (this.minute) {
        formatString = formatString.replace(new RegExp(this.minuteType, 'g'), this.minute);
      }
      if (this.second && this.secondType) {
        formatString = formatString.replace(new RegExp(this.secondType, 'g'), this.second);
      }
      if (this.apm && this.apmType) {
        formatString = formatString.replace(new RegExp(this.apmType, 'g'), this.apm);
      }
      return formatString;
    },
    showClearBtn() {
      if ((this.hour && this.hour !== '') || (this.minute && this.minute !== '')) {
        return true;
      }
      return false;
    },
    isSecondFormat() {
      return this.format === 'HH:mm:ss';
    },
    isFocus() {
      return this.showDropdown;
    },
  },

  watch: {
    format: 'renderFormat',
    minuteInterval(newInteval) {
      this.renderList('minute', newInteval);
    },
    secondInterval(newInteval) {
      this.renderList('second', newInteval);
    },
    value: 'readValues',
    formattedDisplayTime: 'fillValues',
    displayTime() {
      this.parseDisplayTime();
      if (this.displayTime === '') {
        this.$emit('displayEmpty', true);
      } else {
        this.$emit('displayEmpty', false);
      }
    },
    validity() {
      this.$emit('validityChange', this.validity);
      if (this.validity) {
        this.$refs.timepicker.dispatchEvent(eventUtil.createEvent('tooltip-hide'));
      } else {
        this.$refs.timepicker.dispatchEvent(eventUtil.createEvent('tooltip-show'));
      }
    },
    currentDate(val) {
      const hour = val.getHours();
      const min = val.getMinutes();
      this.hour = hour < 10 ? `0${hour}` : `${hour}`;
      this.minute = min < 10 ? `0${min}` : `${min}`;
      this.displayTime = `${this.hour}:${this.minute}`;

      if (this.isSecondFormat) {
        const sec = val.getSeconds();
        this.second = sec < 10 ? `0${sec}` : `${sec}`;
        this.displayTime = `${this.displayTime}:${this.second}`;
      }
      this.parseDisplayTime();
    },
  },

  methods: {
    parseDisplayTime() {
      if (this.selectInput) {
        this.manualInput = false;
        this.selectInput = false;
      } else {
        this.manualInput = true;
        this.selectInput = false;
      }

      if (this.displayTime.match(/^\d{4}$/)) {
        this.displayTime = `${this.displayTime.substring(0, 2)}:${this.displayTime.substring(2, 4)}`;
      }

      const pattern = this.isSecondFormat ? /^([01]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/ : /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;

      if (pattern.test(this.displayTime)) {
        this.validity = true;
        const result = this.displayTime.match(pattern);

        const currentDate = this.currentDate;
        let hour = parseInt(result[1], 10);
        let min = parseInt(result[2], 10);
        let sec = this.isSecondFormat ? parseInt(result[3], 10) : 0;
        currentDate.setHours(hour);
        currentDate.setMinutes(min);
        currentDate.setSeconds(sec);
        if (this.disabled && this.disabled.to && currentDate < this.disabled.to) {
          hour = this.disabled.to.getHours();
          min = this.disabled.to.getMinutes();
          sec = this.disabled.to.getSeconds();
        }
        if (this.disabled && this.disabled.from && currentDate > this.disabled.from) {
          hour = this.disabled.from.getHours();
          min = this.disabled.from.getMinutes();
          sec = this.disabled.from.getSeconds();
        }
        this.hour = hour < 10 ? `0${hour}` : `${hour}`;
        this.minute = min < 10 ? `0${min}` : `${min}`;
        this.second = sec < 10 ? `0${sec}` : `${sec}`;
        this.displayTime = this.isSecondFormat ? `${this.hour}:${this.minute}:${this.second}` : `${this.hour}:${this.minute}`;
        if (this.manualInput) {
          this.closeDropdown();
        }
      } else if (this.allowEmpty && this.displayTime === '') {
        this.validity = true;
      } else {
        this.validity = false;
      }
    },

    formatValue(type, i) {
      switch (type) {
        case 'H':
        case 'm':
        case 's':
          return String(i);
        case 'HH':
        case 'mm':
        case 'ss':
          return i < 10 ? `0${i}` : String(i);
        case 'h':
        case 'k':
          return String(i + 1);
        case 'hh':
        case 'kk':
          return (i + 1) < 10 ? `0${i + 1}` : String(i + 1);
        default:
          return '';
      }
    },

    checkAcceptingType(validValues, formatString, fallbackValue) {
      if (!validValues || !formatString || !formatString.length) { return ''; }
      for (let i = 0; i < validValues.length; i += 1) {
        if (formatString.indexOf(validValues[i]) > -1) {
          return validValues[i];
        }
      }
      return fallbackValue || '';
    },

    renderFormat(newFormat) {
      let newFormatCopy = newFormat || this.format;
      if (!newFormatCopy || !newFormatCopy.length) {
        newFormatCopy = 'HH:mm';
      }

      this.hourType = this.checkAcceptingType(CONFIG.HOUR_TOKENS, newFormatCopy, 'HH');
      this.minuteType = this.checkAcceptingType(CONFIG.MINUTE_TOKENS, newFormatCopy, 'mm');
      this.secondType = this.checkAcceptingType(CONFIG.SECOND_TOKENS, newFormatCopy);
      this.apmType = this.checkAcceptingType(CONFIG.APM_TOKENS, newFormatCopy);

      this.renderHoursList();
      this.renderList('minute');

      if (this.secondType) {
        this.renderList('second');
      }

      if (this.apmType) {
        this.renderApmList();
      }

      const self = this;
      this.$nextTick(() => {
        self.readValues();
      });
    },

    renderHoursList() {
      const hoursCount = (this.hourType === 'h' || this.hourType === 'hh') ? 12 : 24;
      this.hours = [];
      for (let i = 0; i < hoursCount; i += 1) {
        const hrText = this.formatValue(this.hourType, i);
        this.hours.push({
          text: hrText,
          isDisabled: false,
        });
      }
    },
    isDisabledHour(hr) {
      if (typeof this.disabled === 'undefined') {
        hr.isDisabled = false;
        return false;
      }
      let disabled = false;
      const targetDate = new Date(this.currentDate);
      targetDate.setHours(parseInt(hr.text, 10));
      if (typeof this.disabled.to !== 'undefined' && this.disabled.to && targetDate < this.disabled.to) {
        disabled = true;
      }
      if (typeof this.disabled.from !== 'undefined' && this.disabled.from && targetDate > this.disabled.from) {
        disabled = true;
      }
      hr.isDisabled = disabled;
      return disabled;
    },
    renderList(listType, interval) {
      let intervalCopy = interval;
      if (listType === 'second') {
        intervalCopy = interval || this.secondInterval;
      } else if (listType === 'minute') {
        intervalCopy = interval || this.minuteInterval;
      } else {
        return;
      }

      if (intervalCopy === 0) {
        intervalCopy = 60;
      } else if (intervalCopy > 60) {
        window.console.warn(`\`${listType}-interval\` should be less than 60. Current value is`, intervalCopy);
        intervalCopy = 1;
      } else if (intervalCopy < 1) {
        window.console.warn(`\`${listType}-interval\` should be NO less than 1. Current value is`, intervalCopy);
        intervalCopy = 1;
      } else if (!intervalCopy) {
        intervalCopy = 1;
      }

      if (listType === 'minute') {
        this.minutes = [];
      } else {
        this.seconds = [];
      }

      for (let i = 0; i < 60; i += intervalCopy) {
        if (listType === 'minute') {
          const mText = this.formatValue(this.minuteType, i);
          this.minutes.push({
            text: mText,
            isDisabled: false,
          });
        } else {
          const sText = this.formatValue(this.secondType, i);
          this.seconds.push({
            text: sText,
            isDisabled: false,
          });
        }
      }
    },
    isDisabledMinute(m) {
      if (typeof this.disabled === 'undefined') {
        m.isDisabled = false;
        return false;
      }
      let disabled = false;
      const targetDate = new Date(this.currentDate);
      targetDate.setMinutes(parseInt(m.text, 10));
      if (typeof this.disabled.to !== 'undefined' && this.disabled.to && targetDate <= this.disabled.to) {
        disabled = true;
      }
      if (typeof this.disabled.from !== 'undefined' && this.disabled.from && targetDate >= this.disabled.from) {
        disabled = true;
      }
      m.isDisabled = disabled;
      return disabled;
    },
    isDisabledSecond(s) {
      if (typeof this.disabled === 'undefined') {
        s.isDisabled = false;
        return false;
      }
      let disabled = false;
      const targetDate = new Date(this.currentDate);
      targetDate.setSeconds(parseInt(s.text, 10));
      if (typeof this.disabled.to !== 'undefined' && this.disabled.to && targetDate < this.disabled.to) {
        disabled = true;
      }
      if (typeof this.disabled.from !== 'undefined' && this.disabled.from && targetDate > this.disabled.from) {
        disabled = true;
      }
      s.isDisabled = disabled;
      return disabled;
    },

    renderApmList() {
      this.apms = [];
      if (!this.apmType) { return; }
      this.apms = this.apmType === 'A' ? ['AM', 'PM'] : ['am', 'pm'];
    },

    readValues() {
      if (!this.value || this.muteWatch) { return; }
      const timeValue = JSON.parse(JSON.stringify(this.value || {}));

      const values = Object.keys(timeValue);
      if (values.length === 0) { return; }

      if (values.indexOf(this.hourType) > -1) {
        this.hour = timeValue[this.hourType];
      }

      if (values.indexOf(this.minuteType) > -1) {
        this.minute = timeValue[this.minuteType];
      }

      if (values.indexOf(this.secondType) > -1) {
        this.second = timeValue[this.secondType];
      } else {
        this.second = 0;
      }

      if (values.indexOf(this.apmType) > -1) {
        this.apm = timeValue[this.apmType];
      }

      // this.fillValues();
    },

    fillValues() {
      if (this.manualInput) {
        // do not update the input value when user is typing manually
        this.manualInput = false;
      } else {
        // update the input value
        this.displayTime = this.formattedDisplayTime;
      }
      const fullValues = {};

      const baseHour = this.hour;
      const baseHourType = this.hourType;

      const hourValue = baseHour || baseHour === 0 ? Number(baseHour) : '';
      const baseOnTwelveHours = this.isTwelveHours(baseHourType);
      const apmValue = (baseOnTwelveHours && this.apm) ? String(this.apm).toLowerCase() : false;

      CONFIG.HOUR_TOKENS.forEach((token) => {
        if (token === baseHourType) {
          fullValues[token] = baseHour;
          return;
        }

        let value;
        let apm;
        switch (token) {
          case 'H':
          case 'HH':
            if (!String(hourValue).length) {
              fullValues[token] = '';
              return;
            } else if (baseOnTwelveHours) {
              if (apmValue === 'pm') {
                value = hourValue < 12 ? hourValue + 12 : hourValue;
              } else {
                value = hourValue % 12;
              }
            } else {
              value = hourValue % 24;
            }
            fullValues[token] = (token === 'HH' && value < 10) ? `0${value}` : String(value);
            break;
          case 'k':
          case 'kk':
            if (!String(hourValue).length) {
              fullValues[token] = '';
              return;
            } else if (baseOnTwelveHours) {
              if (apmValue === 'pm') {
                value = hourValue < 12 ? hourValue + 12 : hourValue;
              } else {
                value = hourValue === 12 ? 24 : hourValue;
              }
            } else {
              value = hourValue === 0 ? 24 : hourValue;
            }
            fullValues[token] = (token === 'kk' && value < 10) ? `0${value}` : String(value);
            break;
          case 'h':
          case 'hh':
            if (apmValue) {
              value = hourValue;
              apm = apmValue || 'am';
            } else if (!String(hourValue).length) {
              fullValues[token] = '';
              fullValues.a = '';
              fullValues.A = '';
              return;
            } else if (hourValue > 11) {
              apm = 'pm';
              value = hourValue === 12 ? 12 : hourValue % 12;
            } else {
              if (baseOnTwelveHours) {
                apm = '';
              } else {
                apm = 'am';
              }
              value = hourValue % 12 === 0 ? 12 : hourValue;
            }
            fullValues[token] = (token === 'hh' && value < 10) ? `0${value}` : String(value);
            fullValues.a = apm;
            fullValues.A = apm.toUpperCase();
            break;
          // no default
        }
      });

      if (this.minute || this.minute === 0) {
        const minuteValue = Number(this.minute);
        fullValues.m = String(minuteValue);
        fullValues.mm = minuteValue < 10 ? `0${minuteValue}` : String(minuteValue);
      } else {
        fullValues.m = '';
        fullValues.mm = '';
      }

      if (this.second || this.second === 0) {
        const secondValue = Number(this.second);
        fullValues.s = String(secondValue);
        fullValues.ss = secondValue < 10 ? `0${secondValue}` : String(secondValue);
      } else {
        fullValues.s = '';
        fullValues.ss = '';
      }

      this.fullValues = fullValues;
      this.updateTimeValue(fullValues);
      this.$emit('change', { data: fullValues });
    },

    updateTimeValue(fullValues) {
      this.muteWatch = true;

      const self = this;

      const baseTimeValue = JSON.parse(JSON.stringify(this.value || {}));
      const timeValue = {};

      Object.keys(baseTimeValue).forEach((key) => {
        timeValue[key] = fullValues[key];
      });

      this.$emit('input', timeValue);

      this.$nextTick(() => {
        self.muteWatch = false;
      });
    },

    isTwelveHours(token) {
      return token === 'h' || token === 'hh';
    },

    addEventListeners() {
      document.addEventListener('click', this.clickOrScrollOutside, false);
      document.addEventListener('scroll', this.clickOrScrollOutside, true);
      window.addEventListener('resize', this.reposition, false);
    },
    removeEventListeners() {
      document.removeEventListener('click', this.clickOrScrollOutside, false);
      document.removeEventListener('scroll', this.clickOrScrollOutside, true);
      window.removeEventListener('resize', this.reposition, false);
    },

    closeDropdown() {
      this.showDropdown = false;
      this.removeEventListeners();
    },

    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
      if (this.showDropdown) {
        this.addEventListeners();
      } else {
        this.removeEventListeners();
      }
    },

    select(type, obj) {
      if (obj.isDisabled) {
        return;
      }
      const value = obj.text;
      this.selectInput = true;
      this.manualInput = false;
      // if user selected input remains the same with the old data,
      // change the data to a different value first.
      if (type === 'hour' && this.hour === value) {
        this.hour = '000';
      } else if (type === 'minute' && this.minute === value) {
        this.minute = '000';
      } else if (type === 'second' && this.second === value) {
        this.second = '';
      } else if (type === 'apm' && this.apm === value) {
        this.apm = '';
      }

      this.$nextTick(() => {
        // set time on the next tick
        this.validity = true;
        if (type === 'hour') {
          this.hour = value;
        } else if (type === 'minute') {
          this.minute = value;
        } else if (type === 'second') {
          this.second = value;
        } else if (type === 'apm') {
          this.apm = value;
        }
        console.log('here');
        this.$refs.input.select();
      });
    },

    clearTime() {
      this.hour = '';
      this.minute = '';
      this.second = '';
      this.apm = '';
    },
    /**
     * Close if clicked outside the timepicker
     * @param  {Event} event
     */
    clickOrScrollOutside(event) {
      if (this.$el && !this.$el.contains(event.target)) {
        this.toggleDropdown();
        this.$emit('inputBlur');
      }
      return false;
    },
    selectAllText(target) {
      target.select();
    },
    clickInput(event) {
      this.reposition();
      this.toggleDropdown(event);
      if (this.showDropdown) {
        this.selectAllText(event.target);
      }
    },
    reposition() {
      const inputBox = this.$refs.timepicker.getBoundingClientRect();
      this.listStyle = {
        position: 'fixed',
        top: `${inputBox.top + inputBox.height + 3}px`,
        left: `${inputBox.left}px`,
      };
    },
    setValue(date) {
      if (this.value === undefined) {
        return;
      }
      const hour = date.getHours();
      const hourStr = hour >= 10 ? `${hour}` : `0${hour}`;
      const minutes = date.getMinutes();
      const minuteStr = minutes >= 10 ? `${minutes}` : `0${minutes}`;
      this.value.HH = hourStr;
      this.value.mm = minuteStr;
      this.displayTime = `${hourStr}:${minuteStr}`;
      this.hour = hour;
      this.minute = minutes;
      const obj = {};
      Object.keys(this.value).forEach((key) => {
        obj[key] = this.value[key];
      });
    },
    focus() {
      const that = this;
      that.reposition();
      that.$nextTick(() => {
        that.showDropdown = true;
        that.addEventListeners();
        that.selectAllText(that.$refs.input);
      });
    },
    tabHandler(e) {
      const that = this;
      that.$emit('tab', e);
      that.showDropdown = false;
      that.removeEventListeners();
    },
  },

  mounted() {
    this.renderFormat();

    this.$nextTick(() => {
      if (this.allowEmpty) {
        this.displayTime = '';  // always init displayDate to empty if allowEmpty
      }
    });
    this.$on('setTime', (val) => {
      this.setValue(val);
    });
  },
};
</script>

<template>
<span class="time-picker tooltip-container" ref="timepicker" v-tooltip="timepickerTooltip">
  <input
    class="display-time"
    :class="{'invalid-timepicker-input': !validity}"
    :id="id" v-model="displayTime"
    @click="clickInput"
    type="text"
    :readonly="readonly"
    :placeholder="placeholder"
    @keyup.esc="$emit('cancel')"
    @keyup.enter="$emit('finish')"
    @keydown.tab="$event.preventDefault()"
    @keyup.tab="tabHandler"
    ref="input"
  />
  <span class="clear-btn" v-if="!hideClearButton" v-show="!showDropdown && showClearBtn" @click.stop="clearTime">&times;</span>
  <div class="dropdown" v-show="showDropdown" :style="listStyle">
    <div class="select-list">
      <ul class="hours">
        <li class="hint" v-text="hourType"></li>
        <li v-for="(hr, idx) in hours" :key="idx" v-text="hr.text" :class="{active: hour === hr.text, disabled: isDisabledHour(hr)}" @click.stop="select('hour', hr)"></li>
      </ul>
      <ul class="minutes">
        <li class="hint" v-text="minuteType"></li>
        <li v-for="(m, idx) in minutes" :key="idx" v-text="m.text" :class="{active: minute === m.text, disabled: isDisabledMinute(m)}" @click.stop="select('minute', m)"></li>
      </ul>
      <ul class="seconds" v-if="secondType">
        <li class="hint" v-text="secondType"></li>
        <li v-for="(s, idx) in seconds" :key="idx" v-text="s.text" :class="{active: second === s.text, disabled: isDisabledSecond(s)}" @click.stop="select('second', s)"></li>
      </ul>
      <ul class="apms" v-if="apmType">
        <li class="hint" v-text="apmType"></li>
        <li v-for="(a, idx) in apms" :key="idx" v-text="a" :class="{active: apm === a}" @click.stop="select('apm', a)"></li>
      </ul>
    </div>
  </div>
</span>
</template>

<style lang="scss" scoped>
@import './vue-timepicker';
</style>
