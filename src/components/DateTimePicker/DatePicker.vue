<template>
  <div class="vdp-datepicker" :class="[wrapperClass, isRtl ? 'rtl' : '']" ref="datepicker" v-tooltip="datepickerTooltip">
    <div :class="{'input-group' : bootstrapStyling}" class="tooltip-container">
      <!-- Calendar Button -->
      <span class="vdp-datepicker__calendar-button" :class="{'input-group-addon' : bootstrapStyling}" v-if="calendarButton" @click="showCalendar" v-bind:style="{'cursor:not-allowed;' : disabledPicker}">
        <i :class="calendarButtonIcon">
          {{ calendarButtonIconContent }}
          <span v-if="!calendarButtonIcon">&hellip;</span>
        </i>
      </span>
      <!-- Input -->
      <input v-if="inline"
        type="hidden"
        :class="[ inputClass, { 'form-control' : bootstrapStyling } ]"
        :name="name"
        :ref="refName"
        :id="id"
        @click="clickInput"
        :value="formattedValue"
        :open-date="openDate"
        :placeholder="placeholder"
        :clear-button="clearButton"
        :disabled="disabledPicker || readonly"
        :required="required"
        :readonly="readonly">
      <input v-else
        type="text"
        :class="[inputClass, {'form-control': bootstrapStyling, 'invalid-datepicker-input': !validity}]"
        :name="name"
        :ref="refName"
        :id="id"
        @click="clickInput"
        v-model="displayDate"
        :open-date="openDate"
        :placeholder="placeholder"
        :clear-button="clearButton"
        :disabled="disabledPicker || readonly"
        :required="required"
        :readonly="readonly">
      <!-- Clear Button -->
      <span class="vdp-datepicker__clear-button" :class="{'input-group-addon' : bootstrapStyling}" v-if="clearButton && selectedDate" @click="clearDate()">
        <i :class="clearButtonIcon">
          <span v-if="!clearButtonIcon">&times;</span>
        </i>
      </span>
    </div>

        <!-- Day View -->
        <template v-if="allowedToShowView('day')">
          <div :class="[calendarClass, 'vdp-datepicker__calendar']" v-show="showDayView" v-bind:style="calendarStyle">
              <header>
                  <span
                      @click="isRtl ? nextMonth() : previousMonth()"
                      class="prev"
                      v-bind:class="{ 'disabled' : isRtl ? nextMonthDisabled(pageTimestamp) : previousMonthDisabled(pageTimestamp) }">&lt;</span>
                  <span @click="showMonthCalendar" :class="allowedToShowView('month') ? 'up' : ''">{{ currMonthName }} {{ currYear }}
                  </span>
                  <span
                      @click="isRtl ? previousMonth() : nextMonth()"
                      class="next"
                      v-bind:class="{ 'disabled' : isRtl ? previousMonthDisabled(pageTimestamp) : nextMonthDisabled(pageTimestamp) }">&gt;</span>
              </header>
              <div :class="isRtl ? 'flex-rtl' : ''">
                <span class="cell day-header" v-for="d in daysOfWeek" :key="d.timestamp">{{ d }}</span>
                <template v-if="blankDays > 0">
                  <span class="cell day blank" v-for="d in blankDays" :key="d.timestamp"></span>
                </template><!--
                --><span class="cell day"
                    v-for="day in days"
                    :key="day.timestamp"
                    track-by="timestamp"
                    v-bind:class="dayClasses(day)"
                    @click="selectDate(day)">{{ day.date }}</span>
              </div>
          </div>
        </template>

        <!-- Month View -->
        <template v-if="allowedToShowView('month')">
          <div :class="[calendarClass, 'vdp-datepicker__calendar']" v-show="showMonthView" v-bind:style="calendarStyle">
              <header>
                  <span
                      @click="previousYear"
                      class="prev"
                      v-bind:class="{ 'disabled' : previousYearDisabled(pageTimestamp) }">&lt;</span>
                  <span @click="showYearCalendar" :class="allowedToShowView('year') ? 'up' : ''">{{ getPageYear() }}</span>
                  <span
                      @click="nextYear"
                      class="next"
                      v-bind:class="{ 'disabled' : nextYearDisabled(pageTimestamp) }">&gt;</span>
              </header>
              <span class="cell month"
                  v-for="month in months"
                  :key="month.timestamp"
                  track-by="timestamp"
                  v-bind:class="{ 'selected': month.isSelected, 'disabled': month.isDisabled }"
                  @click.stop="selectMonth(month)">{{ month.month }}</span>
          </div>
        </template>

        <!-- Year View -->
        <template v-if="allowedToShowView('year')">
          <div :class="[calendarClass, 'vdp-datepicker__calendar']" v-show="showYearView" v-bind:style="calendarStyle">
              <header>
                  <span @click="previousDecade" class="prev"
                      v-bind:class="{ 'disabled' : previousDecadeDisabled(pageTimestamp) }">&lt;</span>
                  <span>{{ getPageDecade() }}</span>
                  <span @click="nextDecade" class="next"
                      v-bind:class="{ 'disabled' : nextMonthDisabled(pageTimestamp) }">&gt;</span>
              </header>
              <span
                  class="cell year"
                  v-for="year in years"
                  :key="year.timestamp"
                  track-by="timestamp"
                  v-bind:class="{ 'selected': year.isSelected, 'disabled': year.isDisabled }"
                  @click.stop="selectYear(year)">{{ year.year }}</span>
          </div>
        </template>
  </div>
</template>

<script>

import moment from 'moment';
import eventUtil from '@/utils/js/event';
import DateUtils from './DateUtils';
import DateLanguages from './DateLanguages';

export default {
  props: {
    value: {
      validator(val) {
        return val === null || val instanceof Date || typeof val === 'string';
      },
    },
    name: String,
    refName: String,
    id: String,
    format: {
      type: [String, Function],
      default: 'dd MMM yyyy',
    },
    language: {
      type: String,
      default: 'en',
    },
    openDate: {
      validator(val) {
        return val === null || val instanceof Date || typeof val === 'string';
      },
    },
    fullMonthName: Boolean,
    disabled: Object,
    highlighted: Object,
    placeholder: String,
    inline: Boolean,
    calendarClass: [String, Object],
    inputClass: [String, Object],
    wrapperClass: [String, Object],
    mondayFirst: Boolean,
    clearButton: Boolean,
    clearButtonIcon: String,
    calendarButton: Boolean,
    calendarButtonIcon: String,
    calendarButtonIconContent: String,
    bootstrapStyling: Boolean,
    initialView: String,
    disabledPicker: Boolean,
    required: Boolean,
    minimumView: {
      type: String,
      default: 'day',
    },
    maximumView: {
      type: String,
      default: 'year',
    },
    readonly: Boolean,
    allowEmpty: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const startDate = this.openDate ? new Date(this.openDate) : new Date();
    return {
      /*
       * Vue cannot observe changes to a Date Object so date must be stored as a timestamp
       * This represents the first day of the current viewing month
       * {Number}
       */
      pageTimestamp: startDate.setDate(1),
      /*
       * Selected Date
       * {Date}
       */
      selectedDate: null,
      /*
       * Flags to show calendar views
       * {Boolean}
       */
      showDayView: false,
      showMonthView: false,
      showYearView: false,
      /*
       * Positioning
       */
      calendarHeight: 0,
      displayDate: '',
      validity: true,
      manualInput: false,
      selectInput: false,
      calendarStyle: {},

      datepickerTooltip: {
        msg: this.$t('error_msg.time_format_error'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
    };
  },
  watch: {
    value(value) {
      this.setValue(value);
    },
    openDate() {
      this.setPageDate();
    },
    initialView() {
      this.setInitialView();
    },
    displayDate() {
      this.parseDisplayDate();
      if (this.displayDate === '') {
        this.$emit('displayEmpty', true);
      } else {
        this.$emit('displayEmpty', false);
      }
    },
    formattedValue: 'refreshDisplayDate',
    validity() {
      this.$emit('validityChange', this.validity);
      if (this.validity) {
        this.$refs.datepicker.dispatchEvent(eventUtil.createEvent('tooltip-hide'));
      } else {
        this.$refs.datepicker.dispatchEvent(eventUtil.createEvent('tooltip-show'));
      }
    },
  },
  computed: {
    computedInitialView() {
      if (!this.initialView) {
        return this.minimumView;
      }

      return this.initialView;
    },
    pageDate() {
      return new Date(this.pageTimestamp);
    },
    formattedValue() {
      if (!this.selectedDate) {
        return null;
      }

      return typeof this.format === 'function'
        ? this.format(this.selectedDate)
        : DateUtils.formatDate(new Date(this.selectedDate), this.format, this.translation);
    },
    translation() {
      return DateLanguages.translations[this.language];
      // return this.language;
    },
    currMonthName() {
      const monthName = this.fullMonthName ?
                        this.translation.months.original : this.translation.months.abbr;
      return DateUtils.getMonthNameAbbr(this.pageDate.getMonth(), monthName);
    },
    currYear() {
      return this.pageDate.getFullYear();
    },
    /**
     * Returns the day number of the week less one for the first of the current month
     * Used to show amount of empty cells before the first in the day calendar layout
     * @return {Number}
     */
    blankDays() {
      const d = this.pageDate;
      const dObj = new Date(d.getFullYear(), d.getMonth(), 1, d.getHours(), d.getMinutes());
      if (this.mondayFirst) {
        return dObj.getDay() > 0 ? dObj.getDay() - 1 : 6;
      }
      return dObj.getDay();
    },
    daysOfWeek() {
      if (this.mondayFirst) {
        const tempDays = this.translation.days.slice();
        tempDays.push(tempDays.shift());
        return tempDays;
      }
      return this.translation.days;
    },
    days() {
      const d = this.pageDate;
      const days = [];
      // set up a new date object to the beginning of the current 'page'
      const dObj = new Date(d.getFullYear(), d.getMonth(), 1, d.getHours(), d.getMinutes());
      const daysInMonth = DateUtils.daysInMonth(dObj.getFullYear(), dObj.getMonth());
      for (let i = 0; i < daysInMonth; i += 1) {
        days.push({
          date: dObj.getDate(),
          timestamp: dObj.getTime(),
          isSelected: this.isSelectedDate(dObj),
          isDisabled: this.isDisabledDate(dObj),
          isHighlighted: this.isHighlightedDate(dObj),
          isHighlightStart: this.isHighlightStart(dObj),
          isHighlightEnd: this.isHighlightEnd(dObj),
          isToday: dObj.toDateString() === (new Date()).toDateString(),
          isWeekend: dObj.getDay() === 0 || dObj.getDay() === 6,
          isSaturday: dObj.getDay() === 6,
          isSunday: dObj.getDay() === 0,
        });
        dObj.setDate(dObj.getDate() + 1);
      }
      return days;
    },
    months() {
      const d = this.pageDate;
      const months = [];
      // set up a new date object to the beginning of the current 'page'
      const dObj = new Date(d.getFullYear(), 0, d.getDate(), d.getHours(), d.getMinutes());
      for (let i = 0; i < 12; i += 1) {
        months.push({
          month: DateUtils.getMonthName(i, this.translation.months.original),
          timestamp: dObj.getTime(),
          isSelected: this.isSelectedMonth(dObj),
          isDisabled: this.isDisabledMonth(dObj),
        });
        dObj.setMonth(dObj.getMonth() + 1);
      }
      return months;
    },
    years() {
      const d = this.pageDate;
      const years = [];
      // set up a new date object to the beginning of the current 'page'
      const dObj = new Date(Math.floor(d.getFullYear() / 10) * 10,
                            d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
      for (let i = 0; i < 10; i += 1) {
        years.push({
          year: dObj.getFullYear(),
          timestamp: dObj.getTime(),
          isSelected: this.isSelectedYear(dObj),
          isDisabled: this.isDisabledYear(dObj),
        });
        dObj.setFullYear(dObj.getFullYear() + 1);
      }
      return years;
    },
    isOpen() {
      return this.showDayView || this.showMonthView || this.showYearView;
    },
    isInline() {
      return !!this.inline;
    },
    isRtl() {
      return this.translation.rtl === true;
    },
  },
  methods: {
    addEventListeners() {
      // hide on click or scroll outside
      document.addEventListener('click', this.clickOrScrollOutside);
      document.addEventListener('scroll', this.clickOrScrollOutside, true);
      // reposition when resize
      window.addEventListener('resize', this.reposition);
    },
    removeEventListeners() {
      document.removeEventListener('click', this.clickOrScrollOutside, false);
      document.removeEventListener('scroll', this.clickOrScrollOutside, true);
      window.removeEventListener('resize', this.reposition, false);
    },
    parseDisplayDate() {
      if (this.selectInput) {
        this.manualInput = false;
        this.selectInput = false;
        return;
      }
      this.manualInput = true;
      this.selectInput = false;

      if (this.displayDate.match(/^\d{8}$/)) {
        this.displayDate = `${this.displayDate.substring(0, 4)}/${this.displayDate.substring(4, 6)}/${this.displayDate.substring(6, 8)}`;
      }

      const valid = moment(this.displayDate, 'YYYY/MM/DD', true).isValid();
      if (valid) {
        this.validity = true;
        const d = new Date(this.displayDate);
        this.setDate(d.getTime());
        this.close();
      } else if (this.allowEmpty && this.displayDate === '') {
        this.validity = true;
      } else {
        this.validity = false;
      }
    },

    refreshDisplayDate() {
      if (this.manualInput) {
        // do not update the input value when user is typing manually
        this.manualInput = false;
      } else {
        // update the input value
        this.displayDate = this.formattedValue;
      }
    },
    /**
     * Close all calendar layers
     */
    close() {
      this.showDayView = false;
      this.showMonthView = false;
      this.showYearView = false;
      if (!this.isInline) {
        this.$emit('closed');
        this.removeEventListeners();
      }
    },
    resetDefaultDate() {
      if (this.selectedDate === null) {
        this.setPageDate();
        return;
      }
      this.setPageDate(this.selectedDate);
    },
    reposition() {
      const inputBox = this.$refs.datepicker.getBoundingClientRect();
      this.calendarStyle = {
        position: this.isInline ? 'static' : 'fixed',
        top: `${inputBox.top + inputBox.height + 3}px`,
        left: `${inputBox.left}px`,
      };
    },
    clickInput(event) {
      this.reposition();
      this.showCalendar(event);
      if (this.isOpen) {
        this.selectAllText(event);
      }
    },
    selectAllText(event) {
      event.target.select();
    },
    /**
     * Effectively a toggle to show/hide the calendar
     * @return {mixed} [description]
     */
    showCalendar() {
      if (this.disabledPicker || this.isInline) {
        return false;
      }
      if (this.isOpen) {
        return this.close();
      }
      this.hideOrReposition();
      this.setInitialView();
      if (!this.isInline) {
        this.$emit('opened');
      }
      return true;
    },
    hideOrReposition() {
      const that = this;
      window.test = that;
      that.addEventListeners();
    },
    setInitialView() {
      const initialView = this.computedInitialView;

      if (!this.allowedToShowView(initialView)) {
        throw new Error(`initialView '${this.initialView}' cannot be rendered based on minimum '${this.minimumView}' and maximum '${this.maximumView}'`);
      }

      switch (initialView) {
        case 'year':
          this.showYearCalendar();
          break;
        case 'month':
          this.showMonthCalendar();
          break;
        default:
          this.showDayCalendar();
          break;
      }
    },
    allowedToShowView(view) {
      const views = ['day', 'month', 'year'];
      const minimumViewIndex = views.indexOf(this.minimumView);
      const maximumViewIndex = views.indexOf(this.maximumView);
      const viewIndex = views.indexOf(view);

      return viewIndex >= minimumViewIndex && viewIndex <= maximumViewIndex;
    },
    showDayCalendar() {
      if (!this.allowedToShowView('day')) return false;

      this.close();
      this.showDayView = true;
      if (!this.isInline) {
        this.addEventListeners();
      }
      return true;
    },
    showMonthCalendar() {
      if (!this.allowedToShowView('month')) return false;

      this.close();
      this.showMonthView = true;
      if (!this.isInline) {
        this.addEventListeners();
      }
      return true;
    },
    showYearCalendar() {
      if (!this.allowedToShowView('year')) return false;

      this.close();
      this.showYearView = true;
      if (!this.isInline) {
        this.addEventListeners();
      }
      return true;
    },
    setDate(timestamp) {
      // validate date constraints
      let date = new Date(timestamp);
      if ((this.disabled) && (this.disabled.to || this.disabled.from)) {
        if (date < this.disabled.to) {
          date = this.disabled.to;
          this.setValue(date);
        }

        if (date > this.disabled.from) {
          date = this.disabled.from;
          this.setValue(date);
        }
      }
      this.selectedDate = new Date(date);
      this.setPageDate(date);
      this.$emit('input', new Date(date));
      this.$emit('selected', new Date(date));
    },
    clearDate() {
      this.selectedDate = null;
      this.$emit('input', null);
      this.$emit('selected', null);
      this.$emit('cleared');
    },
    /**
     * @param {Object} day
     */
    selectDate(day) {
      if (day.isDisabled) {
        this.$emit('selectedDisabled', day);
        return false;
      }
      this.selectInput = true;
      this.manualInput = false;
      this.validity = true;
      if (day.timestamp === this.selectedDate.getTime()) {
        // if user selected input remains the same with the old data,
        // change the data to a different value first.
        this.setDate(0);
      }
      this.$nextTick(() => {
        // set date on the next tick
        this.setDate(day.timestamp);
      });
      if (this.isInline) {
        this.showDayCalendar();
      } else {
        this.close();
      }
      return true;
    },
    /**
     * @param {Object} month
     */
    selectMonth(month) {
      if (month.isDisabled) {
        return false;
      }

      const date = new Date(month.timestamp);
      if (this.allowedToShowView('day')) {
        this.setPageDate(date);
        this.$emit('changedMonth', month);
        this.showDayCalendar();
      } else {
        this.selectInput = true;
        this.manualInput = false;
        this.setDate(date);
        this.close();
      }
      return true;
    },
    /**
     * @param {Object} year
     */
    selectYear(year) {
      if (year.isDisabled) {
        return false;
      }

      const date = new Date(year.timestamp);
      if (this.allowedToShowView('month')) {
        this.setPageDate(date);
        this.$emit('changedYear', year);
        this.showMonthCalendar();
      } else {
        this.selectInput = true;
        this.manualInput = false;
        this.setDate(date);
        this.close();
      }
      return true;
    },
    /**
     * @return {Number}
     */
    getPageDate() {
      return this.pageDate.getDate();
    },
    /**
     * @return {Number}
     */
    getPageMonth() {
      return this.pageDate.getMonth();
    },
    /**
     * @return {Number}
     */
    getPageYear() {
      return this.pageDate.getFullYear();
    },
    /**
     * @return {String}
     */
    getPageDecade() {
      const sD = Math.floor(this.pageDate.getFullYear() / 10) * 10;
      return `${sD}'s`;
    },
    changeMonth(incrementBy) {
      const date = this.pageDate;
      date.setMonth(date.getMonth() + incrementBy);
      this.setPageDate(date);
      this.$emit('changedMonth', date);
    },
    previousMonth() {
      if (!this.previousMonthDisabled()) {
        this.changeMonth(-1);
      }
    },
    previousMonthDisabled() {
      if (!this.disabled || !this.disabled.to) {
        return false;
      }
      const d = this.pageDate;
      return this.disabled.to.getMonth() >= d.getMonth() &&
        this.disabled.to.getFullYear() >= d.getFullYear();
    },
    nextMonth() {
      if (!this.nextMonthDisabled()) {
        this.changeMonth(+1);
      }
    },
    nextMonthDisabled() {
      if (!this.disabled || !this.disabled.from) {
        return false;
      }
      const d = this.pageDate;
      return this.disabled.from.getMonth() <= d.getMonth() &&
        this.disabled.from.getFullYear() <= d.getFullYear();
    },
    changeYear(incrementBy, emit = 'changedYear') {
      const date = this.pageDate;
      date.setYear(date.getFullYear() + incrementBy);
      this.setPageDate(date);
      this.$emit(emit);
    },
    previousYear() {
      if (!this.previousYearDisabled()) {
        this.changeYear(-1);
      }
    },
    previousYearDisabled() {
      if (!this.disabled || !this.disabled.to) {
        return false;
      }
      return this.disabled.to.getFullYear() >= this.pageDate.getFullYear();
    },
    nextYear() {
      if (!this.nextYearDisabled()) {
        this.changeYear(1);
      }
    },
    nextYearDisabled() {
      if (!this.disabled || !this.disabled.from) {
        return false;
      }
      return this.disabled.from.getFullYear() <= this.pageDate.getFullYear();
    },
    previousDecade() {
      if (!this.previousDecadeDisabled()) {
        this.changeYear(-10, 'changeDecade');
      }
    },
    previousDecadeDisabled() {
      if (!this.disabled || !this.disabled.to) {
        return false;
      }
      return Math.floor(this.disabled.to.getFullYear() / 10) * 10 >=
            Math.floor(this.pageDate.getFullYear() / 10) * 10;
    },
    nextDecade() {
      if (!this.nextDecadeDisabled()) {
        this.changeYear(10, 'changeDecade');
      }
    },
    nextDecadeDisabled() {
      if (!this.disabled || !this.disabled.from) {
        return false;
      }
      return Math.ceil(this.disabled.from.getFullYear() / 10) * 10 <=
            Math.ceil(this.pageDate.getFullYear() / 10) * 10;
    },
    /**
     * Whether a day is selected
     * @param {Date}
     * @return {Boolean}
     */
    isSelectedDate(dObj) {
      return this.selectedDate && this.selectedDate.toDateString() === dObj.toDateString();
    },
    /**
     * Whether a day is disabled
     * @param {Date}
     * @return {Boolean}
     */
    isDisabledDate(date) {
      let disabled = false;

      if (typeof this.disabled === 'undefined') {
        return false;
      }

      if (typeof this.disabled.dates !== 'undefined') {
        this.disabled.dates.forEach((d) => {
          if (date.toDateString() === d.toDateString()) {
            disabled = true;
            return true;
          }
          return false;
        });
      }
      if (typeof this.disabled.to !== 'undefined' && this.disabled.to) {
        if (moment(date).isBefore(this.disabled.to, 'day')) {
          disabled = true;
        }
      }
      if (typeof this.disabled.from !== 'undefined' && this.disabled.from) {
        if (moment(date).isAfter(this.disabled.from, 'day')) {
          disabled = true;
        }
      }
      if (typeof this.disabled.ranges !== 'undefined') {
        this.disabled.ranges.forEach((range) => {
          if (typeof range.from !== 'undefined' && range.from && typeof range.to !== 'undefined' && range.to) {
            if (date < range.to && date > range.from) {
              disabled = true;
              return true;
            }
          }
          return false;
        });
      }
      if (typeof this.disabled.days !== 'undefined' && this.disabled.days.indexOf(date.getDay()) !== -1) {
        disabled = true;
      }
      if (typeof this.disabled.daysOfMonth !== 'undefined' && this.disabled.daysOfMonth.indexOf(date.getDate()) !== -1) {
        disabled = true;
      }
      if (typeof this.disabled.customPredictor === 'function' && this.disabled.customPredictor(date)) {
        disabled = true;
      }
      return disabled;
    },
    /**
     * Whether a day is highlighted (only if it is not disabled already)
     * @param {Date}
     * @return {Boolean}
     */
    isHighlightedDate(date) {
      if (this.isDisabledDate(date)) {
        return false;
      }

      let highlighted = false;

      if (typeof this.highlighted === 'undefined') {
        return false;
      }

      if (typeof this.highlighted.dates !== 'undefined') {
        this.highlighted.dates.forEach((d) => {
          if (date.toDateString() === d.toDateString()) {
            highlighted = true;
            return true;
          }
          return false;
        });
      }

      if (this.isDefined(this.highlighted.from) && this.isDefined(this.highlighted.to)) {
        highlighted = date >= this.highlighted.from && date <= this.highlighted.to;
      }

      if (typeof this.highlighted.days !== 'undefined' && this.highlighted.days.indexOf(date.getDay()) !== -1) {
        highlighted = true;
      }

      if (typeof this.highlighted.daysOfMonth !== 'undefined' && this.highlighted.daysOfMonth.indexOf(date.getDate()) !== -1) {
        highlighted = true;
      }

      if (typeof this.highlighted.customPredictor === 'function' && this.highlighted.customPredictor(date)) {
        highlighted = true;
      }

      return highlighted;
    },
    /**
     * Whether a day is highlighted and it is the first date
     * in the highlighted range of dates
     * @param {Date}
     * @return {Boolean}
     */
    isHighlightStart(date) {
      return this.isHighlightedDate(date) &&
        (this.highlighted.from instanceof Date) &&
        (this.highlighted.from.getFullYear() === date.getFullYear()) &&
        (this.highlighted.from.getMonth() === date.getMonth()) &&
        (this.highlighted.from.getDate() === date.getDate());
    },
    /**
     * Whether a day is highlighted and it is the first date
     * in the highlighted range of dates
     * @param {Date}
     * @return {Boolean}
     */
    isHighlightEnd(date) {
      return this.isHighlightedDate(date) &&
        (this.highlighted.to instanceof Date) &&
        (this.highlighted.to.getFullYear() === date.getFullYear()) &&
        (this.highlighted.to.getMonth() === date.getMonth()) &&
        (this.highlighted.to.getDate() === date.getDate());
    },
    /**
     * Helper
     * @param  {mixed}  prop
     * @return {Boolean}
     */
    isDefined(prop) {
      return typeof prop !== 'undefined' && prop;
    },
    /**
     * Whether the selected date is in this month
     * @param {Date}
     * @return {Boolean}
     */
    isSelectedMonth(date) {
      return (this.selectedDate &&
        this.selectedDate.getFullYear() === date.getFullYear() &&
        this.selectedDate.getMonth() === date.getMonth());
    },
    /**
     * Whether a month is disabled
     * @param {Date}
     * @return {Boolean}
     */
    isDisabledMonth(date) {
      let disabled = false;

      if (typeof this.disabled === 'undefined') {
        return false;
      }

      if (typeof this.disabled.to !== 'undefined' && this.disabled.to) {
        if (
          (
            date.getMonth() < this.disabled.to.getMonth() &&
            date.getFullYear() <= this.disabled.to.getFullYear()
          ) ||
          date.getFullYear() < this.disabled.to.getFullYear()
        ) {
          disabled = true;
        }
      }
      if (typeof this.disabled.from !== 'undefined' && this.disabled.from) {
        if (
          this.disabled.from &&
          (
            (
              date.getMonth() > this.disabled.from.getMonth() &&
              date.getFullYear() >= this.disabled.from.getFullYear()
            ) ||
            date.getFullYear() > this.disabled.from.getFullYear()
          )
        ) {
          disabled = true;
        }
      }
      return disabled;
    },
    /**
     * Whether the selected date is in this year
     * @param {Date}
     * @return {Boolean}
     */
    isSelectedYear(date) {
      return this.selectedDate && this.selectedDate.getFullYear() === date.getFullYear();
    },
    /**
     * Whether a year is disabled
     * @param {Date}
     * @return {Boolean}
     */
    isDisabledYear(date) {
      let disabled = false;
      if (typeof this.disabled === 'undefined' || !this.disabled) {
        return false;
      }

      if (typeof this.disabled.to !== 'undefined' && this.disabled.to) {
        if (date.getFullYear() < this.disabled.to.getFullYear()) {
          disabled = true;
        }
      }
      if (typeof this.disabled.from !== 'undefined' && this.disabled.from) {
        if (date.getFullYear() > this.disabled.from.getFullYear()) {
          disabled = true;
        }
      }

      return disabled;
    },
    /**
     * Set the datepicker value
     * @param {Date|String|null} date
     */
    setValue(date) {
      let dateCopy = date;
      if (typeof dateCopy === 'string') {
        const parsed = new Date(date);
        dateCopy = isNaN(parsed.valueOf()) ? null : parsed;
      }
      if (!dateCopy) {
        this.setPageDate();
        this.selectedDate = null;
        return;
      }
      this.displayDate = moment(date).format('YYYY/MM/DD');
      this.selectedDate = dateCopy;
      this.setPageDate(dateCopy);
    },
    setPageDate(date) {
      let dateCopy = date;
      if (!dateCopy) {
        if (this.openDate) {
          dateCopy = new Date(this.openDate);
        } else {
          dateCopy = new Date();
        }
      }
      this.pageTimestamp = (new Date(dateCopy)).setDate(1);
    },
    /**
     * Close the calendar if clicked outside the datepicker
     * @param  {Event} event
     */
    clickOrScrollOutside(event) {
      if (this.$el && !this.$el.contains(event.target)) {
        if (this.isInline) {
          return this.showDayCalendar();
        }
        this.resetDefaultDate();
        this.close();
        this.removeEventListeners();
      }
      return false;
    },
    dayClasses(day) {
      return {
        selected: day.isSelected,
        disabled: day.isDisabled,
        highlighted: day.isHighlighted,
        today: day.isToday,
        weekend: day.isWeekend,
        sat: day.isSaturday,
        sun: day.isSunday,
        'highlight-start': day.isHighlightStart,
        'highlight-end': day.isHighlightEnd,
      };
    },
    init() {
      if (this.value) {
        this.setValue(this.value);
      }
      this.$nextTick(() => {
        if (this.allowEmpty) {
          this.displayDate = '';  // always init displayDate to empty if allowEmpty
        }
      });
      if (this.isInline) {
        this.setInitialView();
      }
    },
  },
  mounted() {
    const that = this;
    that.init();
    that.$on('setDate', (val) => {
      that.setValue(val);
    });
  },
};
</script>

<style lang="scss">
@import "styles/variable";

$background-active: $color-button;
$color-date-active: $color-white;
$color-date-now: #4A90E2;
$color-date-disabled: $color-font-disabled;

.rtl {
  direction: rtl;
}

.vdp-datepicker {
  color: $color-font-active;
  text-align: left;
  * {
    box-sizing: border-box;
  }
}

.vdp-datepicker__calendar {
  position: fixed;
  z-index: 100;
  background: $color-white;
  width: 218px;
  border: 1px solid $color-borderline;
  border-radius: 2px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  padding: 10px;
  margin-top: 10px;
  header {
    display: block;
    line-height: 30px;
    span {
      display: inline-block;
      text-align: center;
      width: calc(100% - (100%/7)*2);
      float: left;
    }
    .prev, .next {
      width: calc(100%/7);
      float: left;
      text-indent: -10000px;
      position: relative;
    }
    .prev:after, .next:after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translateX(-50%) translateY(-50%);
      border: 6px solid transparent;
    }
    .prev {
      &:after {
        border-right: 10px solid $color-icon;
        margin-left: -5px;
      }
      &.disabled:after {
        border-right: 10px solid $color-borderline;
      }
    }
    .next {
      &:after {
        border-left: 10px solid $color-icon;
        margin-left: 5px;
      }
      &.disabled:after {
        border-left: 10px solid $color-borderline;
      }
    }
    .prev:not(.disabled), .next:not(.disabled), .up:not(.disabled) {
      cursor: pointer;
    }
    .prev:not(.disabled):hover, .next:not(.disabled):hover, .up:not(.disabled):hover {
      background: $color-date-disabled;
    }
  }
  .disabled {
    color: $color-date-disabled;
    cursor: default;
  }
  .flex-rtl {
    display: flex;
    width: inherit;
    flex-wrap: wrap;
  }
  .cell {
    display: inline-block;
    padding: 0 5px;
    width: calc(100%/7);
    height: 28px;
    line-height: 28px;
    text-align: center;
    vertical-align: middle;
    // border: 1px solid transparent;
    border-radius: 2px;
    &:not(.blank):not(.disabled) {
      &.day, &.month, &.year {
        cursor: pointer;
      }
      &.day:hover, &.month:hover, &.year:hover {
        background: $background-active;
        color: $color-date-active;
      }
    }
    &.selected {
      background: $background-active;
      color: $color-date-active;
      &:hover, &.highlighted {
        background: $background-active;
        color: $color-date-active;
      }
    }
    &.highlighted {
      background: #cae5ed;
    }
    &.grey {
      color: #888;
      &:hover {
        background: inherit;
      }
    }
    &.day-header {
      font-size: 75%;
      white-space: no-wrap;
      color: $color-font-mark;
      cursor: inherit;
      &:hover {
        background: inherit;
      }
    }
  }
  .month, .year {
    width: 33.333%;
  }
}

.vdp-datepicker__clear-button, .vdp-datepicker__calendar-button {
  cursor: pointer;
  font-style: normal;
}

.vdp-datepicker__clear-button.disabled, .vdp-datepicker__calendar-button.disabled {
  color: #999;
  cursor: default;
}
</style>
