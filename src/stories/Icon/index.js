import { text, number, boolean } from '@storybook/addon-knobs';
import { withMarkdownNotes } from '@storybook/addon-notes';
import Icon from '../../components/basic/Icon';
import README from './README.md';

export default [
  {
    name: 'Icon',
    func: withMarkdownNotes(README)(() => {
      const iconType = text('iconType', 'info');
      const iconSize = number('iconSize', 30);
      const allowHover = boolean('enableHover', true);
      const button = boolean('button', false);
      const template = `
        <div style="height: 300px; width: 300px">
          <icon
            iconType="${iconType}"
            :size="${iconSize}"
            :enableHover="${allowHover}"
            :button="${button}"
            >
          </icon>
        </div>`;

      return {
        components: { Icon },
        data() {
          return {
            iconType,
            iconSize,
            allowHover,
            button,
          };
        },
        template: `<div>
        ${template}
        </div>`,
      };
    }),
  },
];
