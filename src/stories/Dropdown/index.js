import { object, boolean, array, text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withMarkdownNotes } from '@storybook/addon-notes';
import DropdownSelect from '../../components/DropdownSelect';
import DropdownCascader from '../../components/basic/DropdownCascader';
import DimensionSelect from '../../components/dropdown/DimensionSelector';
import README from './README.md';
import READMECascader from './README_Cascader.md';

export default [{
  name: 'DropdownSelect',
  func: withMarkdownNotes(README)((i18n) => {
    const options = [{
      value: 'option1',
      text: '選項1',
    }, {
      value: 'option2',
      text: '選項2',
    }];
    const multiChoiceDft = false;
    const checkValues = array('value', ['option2']);
    const multiChoice = boolean('multiChoice', multiChoiceDft);
    const showCheck = boolean('showCheck', true);
    const width = text('width', '150px');
    const option = object('options', options);
    const fixedListWidth = boolean('fixedListWidth', true);
    const placeholder = text('placeholder', '請選擇');

    const flatOptions = [
      {
        value: 'option1',
        text: '選項 1',
      },
      {
        value: 'option2',
        text: '選項 2',
      },
      {
        value: 'option3',
        text: '選項 3',
      },
      {
        value: 'option4',
        text: '選項 4',
      },
      {
        value: 'option5',
        text: '選項 5',
      },
    ];
    const groupOptions = [
      {
        isGroup: true,
        text: '選項群組 1',
      },
      {
        inGroup: true,
        value: 'option2',
        text: '群組1 選項A',
      },
      {
        inGroup: true,
        value: 'option3',
        text: '群組1 選項B',
      },
      {
        isGroup: true,
        text: '選項群組 2222222222222222222222222',
      },
      {
        inGroup: true,
        value: 'option5',
        text: '群組2 選項C',
      },
    ];

    const template = `
      <div class="div-block">
        <div class="headline">DropdownSelect</div>
        <div class="line">
        <dropdown-select
          :options=option
          :multi=multiChoice
          :showCheckedIcon=showCheck
          :width=width
          :fixedListWidth="fixedListWidth"
          v-model="checkValues"
          :placeholder="placeholder"
          @input="input"
        />
        </div>

        <div class="headline">DropdownSelect prop:action 傳入其他操作</div>
        <dropdown-select
          :options=option
          :multi=multiChoice
          :showCheckedIcon=showCheck
          :width=width
          :fixedListWidth="fixedListWidth"
          v-model="checkValues"
          :placeholder="placeholder"
          :action="action"
          @input="input"
        />
      </div>
      <div class="div-block">
        <div class="headline">DropdownSelect 單選</div>
        <div class="line">
        <dropdown-select
          :options=flatOptions
          width="300px"
          v-model="checkValues"
          placeholder="DropdownSelect 單選"
          @input="input"
        />
        </div>
        <div class="headline">DropdownSelect 單選 無勾選Icon</div>
        <div class="line">
        <dropdown-select
          :options=flatOptions
          width="300px"
          v-model="checkValues"
          :showCheckedIcon="false"
          placeholder="DropdownSelect 單選 無勾選Icon"
          @input="input"
        />
        </div>
        <div class="headline">DropdownSelect 單選 可搜尋選項</div>
        <div class="line">
        <dropdown-select
          :options=flatOptions
          width="300px"
          v-model="checkValues"
          placeholder="DropdownSelect 單選 可搜尋選項"
          :showSearchBar="true"
          @input="input"
        />
        </div>
        <div class="headline">DropdownSelect 單選 error樣式</div>
        <div class="line">
        <dropdown-select
          :options=flatOptions
          width="300px"
          v-model="checkValues"
          placeholder="DropdownSelect 單選 error樣式"
          :showError="true"
          @input="input"
        />
        </div>
        <div class="headline">DropdownSelect 單選 disabled樣式</div>
        <div class="line">
        <dropdown-select
          :options=flatOptions
          width="300px"
          v-model="checkValues"
          placeholder="DropdownSelect 單選 disabled樣式"
          :disabled="true"
          @input="input"
        />
        </div>
        <div class="headline">DropdownSelect 多選</div>
        <div class="line">
        <dropdown-select
          :options=flatOptions
          multi
          width="300px"
          v-model="checkValues"
          placeholder="DropdownSelect 多選"
          @input="input"
        />
        </div>
        <div class="headline">DropdownSelect 多選 disabled 樣式</div>
        <div class="line">
        <dropdown-select
          :options=flatOptions
          multi
          width="300px"
          v-model="checkValues"
          placeholder="DropdownSelect 多選 disabled 樣式"
          :disabled="true"
          @input="input"
        />
        </div>
      </div>
      <div class="div-block">
        <div class="headline">DropdownSelect 選項分組 單選</div>
        <div class="line">
        <dropdown-select
          :options=groupOptions
          width="300px"
          :fixedListWidth="fixedListWidth"
          v-model="checkValues"
          placeholder="DropdownSelect 選項分組 單選"
          @input="input"
        />
        </div>
        <div class="line">
        <div class="headline">DropdownSelect 選項分組 多選</div>
        <dropdown-select
          :options=groupOptions
          multi
          width="300px"
          :fixedListWidth="fixedListWidth"
          v-model="checkValues"
          placeholder="DropdownSelect 選項分組 多選"
          @input="input"
        />
        </div>
        <div class="headline">DropdownSelect 選項分組 多選 可點組別選取</div>
        <dropdown-select
          :options=groupOptions
          multi allowSelectGroup
          width="300px"
          :fixedListWidth="fixedListWidth"
          v-model="checkValues"
          placeholder="選項分組 多選 可點組別選取"
          @input="input"
        />
      </div>
      `;

    return {
      components: {
        DropdownSelect,
      },
      data() {
        return {
          option,
          showCheck,
          multiChoice,
          checkValues,
          width,
          fixedListWidth,
          placeholder,

          flatOptions,
          groupOptions,

          action: {
            onclick: this.onclickAction,
            text: '點我觸發其他動作',
          },
        };
      },
      methods: {
        input(val) {
          action('input')(val);
        },
        onclickAction(val) {
          action('點擊 action')(val);
          console.log({ val });
        },
      },
      template: `<div>${template}</div>`,
      i18n,
    };
  }),
},
{
  name: 'DropdownCascader',
  func: withMarkdownNotes(READMECascader)((i18n) => {
    const options = [
      {
        text: '第一層沒選項',
        value: 'first-no-data',
      },
      {
        text: '第一層',
        value: 'first-layer',
        options: [{
          text: '第二層',
          value: 'second-layer',
        }, {
          text: '第二層很長很長很長很長很長很長很長很長很長',
          value: 'seconde-layer-longer',
        }],
      },
      {
        text: '第一層很長很長很長很長很長很長很長很長很長',
        value: 'first-layer-longer',
        options: [{
          text: '第二層-2',
          value: 'second-layer-2',
        }, {
          text: '第二層-2很長很長很長很長很長很長很長很長很長',
          value: 'seconde-layer-longer2',
        }],
      },
      {
        text: '哈囉你好嗎',
        value: 'hello',
        options: [{
          text: '哈囉第一個',
          value: 'hello-1',
        }, {
          text: '哈囉第二個',
          value: 'hello-2',
        }, {
          text: '哈囉第三個',
          value: 'hello-3',
        }, {
          text: '哈囉第四個',
          value: 'hello-4',
        }, {
          text: '哈囉第五個很長很長很長很長很長',
          value: 'hello-5',
        }],
      },
      {
        text: '再來一組',
        value: 'onemore',
        options: [{
          text: '更多',
          value: 'more more',
        }],
      },
      {
        text: '第五組',
        value: 'fifth',
        options: [{
          text: '第五組的項目',
          value: 'fifth option',
        }],
      },
    ];

    const checkValues = array('value', ['option2']);
    const option = object('options', options);
    const width = text('width', '300px');
    const placeholder = text('placeholder', '請選擇');

    const template = `
      <div class="div-block">
        <div class="headline">Dropdown Cascader</div>
          <dropdown-cascader
            :options=option
            :width=width
            v-model="checkValues"
            :placeholder="placeholder"
            @input="input"
          />
        </div>
      </div>`;

    return {
      components: {
        DropdownCascader,
      },
      data() {
        return {
          option,
          checkValues,
          width,
          placeholder,
        };
      },
      methods: {
        input(val) {
          action('input')(val);
        },
      },
      template,
      i18n,
    };
  }),
},
{
  name: 'DimensionSelect',
  func: withMarkdownNotes(README)((i18n) => {
    const template = `
      <div class="div-block">
        <div class="headline">DimensionSelect</div>
        <div class="line">
          <dimension-select :options="options"/>
        </div>
      </div>
      `;

    return {
      components: {
        DimensionSelect,
      },
      data() {
        return {
          options: [{
            key: 'platform',
            text: '平台',
            values: [
              { key: 'a', text: 'A' },
              { key: 'b', text: 'B' },
            ],
          }, {
            key: 'size',
            text: 'Screen',
            values: [
              { key: 'D1', text: 'D1' },
              { key: 'HD', text: 'HD' },
              { key: 'FHD', text: 'FHD' },
            ],
          }],
        };
      },
      methods: {
        input(val) {
          action('input')(val);
        },
        onclickAction(val) {
          action('點擊 action')(val);
          console.log({ val });
        },
      },
      template: `<div>${template}</div>`,
      i18n,
    };
  }),
}];
