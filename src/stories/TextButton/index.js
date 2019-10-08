import { text, select, number } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withMarkdownNotes } from '@storybook/addon-notes';
import TextButton from '../../components/basic/TextButton';
import README from './README.md';

export default [
  {
    name: 'TextButton',
    func: withMarkdownNotes(README)(() => {
      const width = text('寬度', '200px');
      const height = text('高度', '40px');
      const buttonTxt = text('文字', 'TextButton');
      const buttonTypes = {
        default: 'default 預設',
        fill: 'fill 一般按鈕',
        primary: 'primary 主要按鈕',
        disable: 'disable 失效按鈕',
        error: 'error 錯誤按鈕',
      };
      const iconAlignTypes = {
        left: 'left 靠左',
        right: 'right 靠右',
      };
      const buttonType = select('按鈕類型', buttonTypes, 'default');
      const iconType = text('iconType', 'search');
      const iconSize = number('iconSize', 16);
      const iconAlign = select('iconAlign', iconAlignTypes, 'left');
      const template = `
        <div class="div-block">
          <div class="headline">Text Button</div>
          <text-button
            width='${width}'
            height='${height}'
            button-type='${buttonType}'
            iconType="${iconType}"
            :iconSize="${iconSize}"
            iconAlign="${iconAlign}"
            @click="test">
            ${buttonTxt}
          </text-button>
        </div>
        <div class="div-block">
          <div class="headline">Text Button 樣式: button-type</div>
          <text-button>default</text-button>
          <text-button button-type="primary">primary</text-button>
          <text-button button-type="error">error</text-button>
          <text-button button-type="fill">fill</text-button>
          <text-button button-type="disable">disable</text-button>
        </div>
        <div class="div-block">
          <div class="headline">Text Button with Icon</div>
          <div style="display: flex; alignItems: center;">
            <text-button icon-type="search" icon-align="left" style="marginRight: 3px">icon在左邊</text-button>
            <text-button icon-type="search" icon-align="right">icon在右邊</text-button>
          </div>
        </div>
        `;

      return {
        components: { TextButton },
        methods: {
          test: action('click'),
        },
        template: `<div>
        ${template}
        </div>`,
      };
    }),
  },
];
