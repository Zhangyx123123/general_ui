import { object, text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withMarkdownNotes } from '@storybook/addon-notes';
import LabelSwitch from '../../components/basic/LabelSwitch';
import README from './README.md';

export default [{
  name: 'LabelSwitch',
  func: withMarkdownNotes(README)(() => {
    const items = [
      {
        text: '1天',
        val: '1',
      },
      {
        text: '7天',
        val: '7',
      },
      {
        text: '30天',
        val: '30',
      },
    ];
    const value = text('value', '1');
    const labelItems = object('options', items);
    const template = `
      <div class="div-block">
        <div class="headline">Label Switch</div>
        <label-switch v-model="value" :options="labelItems" @change="chooseLabel"></label-switch>
      </div>`;

    return {
      components: {
        LabelSwitch,
      },
      data() {
        return {
          labelItems,
          value,
        };
      },
      methods: {
        chooseLabel(val) {
          action('change')(val);
        },
      },
      template,
    };
  }),
}];
