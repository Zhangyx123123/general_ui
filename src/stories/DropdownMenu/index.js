import { object } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withMarkdownNotes } from '@storybook/addon-notes';
import DropdownMenu from '../../components/basic/DropdownMenu';
import README from './README.md';

export default [{
  name: 'DropdownMenu',
  func: withMarkdownNotes(README)(() => {
    const dropdown1 = {
      options: [{
        text: '選項1',
        onclick: action('click option 1'),
      }, {
        text: '選項2',
        onclick: action('click option 2'),
      }, {
        text: '選項3',
        onclick: action('click option 3'),
        disabled: true,
      }, {
        text: '選項4',
        onclick: action('click option 4'),
      }, {
        text: '選項5',
        onclick: action('click option 5'),
        disabled: true,
      }, {
        text: '選項6',
        onclick: action('click option 6'),
        disabled: true,
      }],
      width: '300px',
    };
    const dropdown2 = {
      options: [{
        text: '選項1',
        onclick: action('click option 1'),
      }, {
        text: '選項2',
        onclick: action('click option 2'),
      }],
      alignLeft: true,
    };
    const option1 = object('dropdown options', dropdown1);
    const option2 = object('alignLeft options', dropdown2);

    const template = `
      <div style="position: relative; height: 100%;">
        <div class="div-block">
          <div class="headline">Dropdown Menu 自訂寬度</div> 
          <div class="line">
            <text-button v-dropdown="option1" style="position:relative;">點我</text-button>
          </div>
        </div>
        <div class="div-block">
          <div class="headline">Dropdown Menu 往左延伸</div> 
          <div class="line" style="margin-left: 300px">
            <text-button v-dropdown="option2" style="position:relative;">點我</text-button>
          </div>
        </div>
        <div class="div-block" style="position:absolute; bottom: 0; left: 0; right: 0;">
          <div class="headline">Dropdown Menu 高度超出視窗邊界自動往上</div> 
          <div class="line">
            <text-button v-dropdown="option1" style="position:relative;">點我</text-button>
          </div>
        </div>
      </div>`;
    return {
      components: {
        DropdownMenu,
      },
      data() {
        return {
          option1,
          option2,
        };
      },
      template,
    };
  }),
}];
