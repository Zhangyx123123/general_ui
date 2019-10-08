import { boolean } from '@storybook/addon-knobs';
import { withMarkdownNotes } from '@storybook/addon-notes';
import Toggle from '../../components/basic/Toggle';
import README from './README.md';

export default [{
  name: 'Toggle',
  func: withMarkdownNotes(README)(() => {
    const value = boolean('value', true);
    const big = boolean('big', false);
    const disabled = boolean('disabled', false);

    const falseValue = false;
    const trueValue = true;
    const template = `
      <div>
      <div class="div-block">
        <div class="headline">Toggle</div>
        <toggle v-model="value" :big="big" :disabled="disabled"></toggle>
      </div>
      <div>
        <div class="headline">Toggle 樣式</div>
        <div class="line">
          <toggle v-model="falseValue" ></toggle>
          <toggle v-model="trueValue" ></toggle>
        </div>
        <div class="line">
          <toggle v-model="falseValue" disabled></toggle>
          <toggle v-model="trueValue" disabled></toggle>
        </div>
        <div class="headline">Toggle 樣式: medium</div>
        <div class="line">
          <toggle v-model="falseValue" size="medium"></toggle>
          <toggle v-model="trueValue" size="medium"></toggle>
          <toggle v-model="trueValue" size="medium" showLabel></toggle>
          <toggle v-model="trueValue" size="medium" showLabel :label="{on: '開', off: '關'}"></toggle>
        </div>
        <div class="line">
          <toggle v-model="falseValue" size="medium" disabled></toggle>
          <toggle v-model="trueValue" size="medium" disabled></toggle>
        </div>
        <div class="headline">Toggle 樣式: big</div>
        <div class="line">
          <toggle v-model="falseValue" big></toggle>
          <toggle v-model="trueValue" big></toggle>
        </div>
        <div class="line">
          <toggle v-model="falseValue" big disabled></toggle>
          <toggle v-model="trueValue" big disabled></toggle>
        </div>
      </div>
      </div>
    `;

    return {
      components: {
        Toggle,
      },
      data() {
        return {
          value,
          falseValue,
          trueValue,
          big,
          disabled,
        };
      },
      template,
    };
  }),
}];
