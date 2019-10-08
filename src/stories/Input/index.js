import { text, boolean, number } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withMarkdownNotes } from '@storybook/addon-notes';
import InfoInput from '../../components/basic/InfoInput';
import SearchInput from '../../components/basic/SearchInput';
import READMEInput from './README_Input.md';
import READMEInfoInput from './README_InfoInput.md';
import READMESearchInput from './README_SearchInput.md';

export default [
  {
    name: 'Input',
    func: withMarkdownNotes(READMEInput)(() => {
      const basicInput = '<input></input>';
      const errorInput = '<input class="error"></input>';
      return {
        template: `
          <div>
            <div class="div-block">
              <div class="headline">Input</div>
              <div>${basicInput}</div>
            </div>
            <div class="div-block">
              <div class="headline">Input with Error</div>
              <div>${errorInput}</div>
            </div>
          </div>
        `,
      };
    }),
  },
  {
    name: 'Info Input',
    func: withMarkdownNotes(READMEInfoInput)((i18n) => {
      const type = text('type', 'password');
      const inputText = text('input text (v-model)', 'I am Input Text');
      const placeholder = text('placeholder', 'I am placeholder');
      const fill = boolean('fill', false);
      const disabled = boolean('disabled', false);
      const maxlength = number('maxlength', 20);
      const error = boolean('error', false);
      const errorMsg = text('errorMsg', 'This is error msg');
      const msg = text('msg', 'This is info msg');
      const autocomplete = text('autocomplete', 'new-password');

      const template = `
        <div class="div-block">
          <div class="headline">Info Input</div>
          <info-input
            :type="type"
            v-model="inputText"
            :placeholder="placeholder"
            :msg="msg"
            :fill="fill"
            :disabled="disabled"
            :maxlength="maxlength"
            :error="error"
            :errorMsg="errorMsg"
            :autocomplete="autocomplete"
            @input="handleInput">
          </info-input>
        </div>
        <div class="div-block">
          <div class="headline">Info Input: 預設</div>
          <div class="line">
            <info-input
              v-model="inputText"
              placeholder="請輸入文字"
              msg="這個 Input 不得輸入超過20個字"
              :maxlength=20>
            </info-input>
          </div>
          <div class="headline">Info Input: disable</div>
          <div class="line">
            <info-input
              v-model="inputText"
              placeholder="請輸入文字"
              msg="這個 Input 不得輸入超過20個字"
              :maxlength=20
              disabled>
            </info-input>
          </div>
          <div class="headline" style="margin-bottom:40px">Info Input: error</div>
          <div class="line">
            <info-input
              v-model="inputText"
              placeholder="請輸入文字"
              msg="這個 Input 不得輸入超過20個字"
              :maxlength=20
              :error="triggerError"
              :errorMsg="triggerErrorMsg">
            </info-input>
          </div>
          <div class="headline">Info Input: fill</div>
          <div class="line">
            <info-input
              v-model="inputText"
              placeholder="請輸入文字"
              msg="這個 Input 不得輸入超過20個字"
              :maxlength=20
              fill>
            </info-input>
          </div>
          </info-input>
        </div>
        <div class="div-block">
          <div class="headline">Info Input: password</div>
          <info-input
            type="password"
            v-model="inputText"
            placeholder="請輸入密碼"
            msg="密碼格式限制 20 個字以內"
            :maxlength=20>
          </info-input>
        </div>
      `;

      return {
        components: {
          InfoInput,
        },
        data() {
          return {
            type,
            inputText,
            placeholder,
            msg,
            fill,
            disabled,
            maxlength,
            error,
            errorMsg,
            autocomplete,
            triggerError: false,
            triggerErrorMsg: '',
          };
        },
        methods: {
          handleInput(val) {
            action('input', val);
          },
        },
        mounted() {
          this.$nextTick(() => {
            this.triggerErrorMsg = '這個 Input 的格式不正確';
            this.triggerError = true;
          });
        },
        template: `
        <div>
          ${template}
        </div>`,
        i18n,
      };
    }),
  },
  {
    name: 'Search Input',
    func: withMarkdownNotes(READMESearchInput)((i18n) => {
      const inputText = text('keyword (v-model)', 'keyword');
      const fill = boolean('fill', false);
      const template = `
        <div class="div-block">
          <div class="headline">Search Input</div>
          <div class="line">
            <search-input
              v-model="inputText"
              :fill="fill"
              @input="handleInput"
            >
            </search-input>
          </div>
          <div class="headline">Search Input: fill</div>
          <div class="line">
            <search-input
              v-model="inputText"
              fill
              @input="handleInput"
            >
            </search-input>
          </div>
        </div>`;

      return {
        components: {
          SearchInput,
        },
        data() {
          return {
            inputText,
            fill,
          };
        },
        methods: {
          handleInput(val) {
            action('input')(val);
          },
        },
        template,
        i18n,
      };
    }),
  },
];
