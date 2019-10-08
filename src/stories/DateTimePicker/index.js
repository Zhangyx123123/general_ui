// import { text, select, number } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withMarkdownNotes } from '@storybook/addon-notes';
import pickerUtil from '@/utils/vue/DatePickerUtil';
import DatePicker from '../../components/DateTimePicker/DatePicker';
import TimePicker from '../../components/DateTimePicker/TimePicker';
import DatetimePicker from '../../components/DateTimePicker';
import RangePicker from '../../components/DatetimeRangePicker';

import README from './README.md';

export default [
  {
    name: 'DatePicker',
    func: withMarkdownNotes(README)((i18n) => {
      const latestDate = new Date();
      const earliestDate = new Date();
      latestDate.setDate(latestDate.getDate());
      earliestDate.setDate(earliestDate.getDate() - 7);

      const startDate = new Date(latestDate);
      const startDateObj = pickerUtil.createDateObj();
      const template = `
      <div v-if="startDate && startDateObj">
        <div class="div-block">
          <div class="headline">DatePicker</div>
            <date-picker
              v-model="startDate"
              :readonly="false"
              :disabled="{to: earliestDate}"
              format="yyyy/MM/dd"
              language="zh"
              @selected="handleSelectDate"
            ></date-picker>
          </div>
        </div>
        <div class="div-block">  
          <div class="headline">DatetimePicker</div>
          <div class="line">
            <datetime-picker
              :value="startDateObj"
              :disableDate="{to: earliestDate}"
              @dateChanged="handleDateChanged"
              @validityChange="handleDateValidityChanged"
            ></datetime-picker>
          </div>
          <div class="headline">DatetimePicker: second format</div>
          <div class="line">
            <datetime-picker
              :value="startDateObj"
              :disableDate="{to: earliestDate}"
              :secondFormat="true"
              @dateChanged="handleDateChanged"
              @validityChange="handleDateValidityChanged"
            ></datetime-picker>
          </div>
        </div>
      </div>
        `;

      return {
        components: {
          DatePicker,
          TimePicker,
          DatetimePicker,
        },
        data() {
          return {
            startDate,
            startDateObj,
            earliestDate,
          };
        },
        methods: {
          handleSelectDate: action('select date'),
          handleDateValidityChanged: action('validity change'),
          handleDateChanged: action('date changed'),
        },
        template: `<div>
        ${template}
        </div>`,
        i18n,
      };
    }),
  },
  {
    name: 'Range Picker',
    func: withMarkdownNotes('FIXME!!')((i18n) => {
      const template = `
      <div>
        <div class="div-block">
          <div class="headline">預設狀態</div>
          <range-picker/>
        </div>
        <div class="div-block">
        <div class="headline">給予預設值</div>
          <range-picker :start-time="start" :end-time="end"
          @update="handleUpdate"/>
        </div>
      </div>
        `;

      return {
        components: {
          RangePicker,
        },
        data() {
          return {
            start: 1547803636,
            end: 1547903636,
          };
        },
        methods: {
          handleUpdate: action('select date'),
        },
        template: `<div>
        ${template}
        </div>`,
        i18n,
      };
    }),
  },
];
