import { text, object } from '@storybook/addon-knobs';
import { withMarkdownNotes } from '@storybook/addon-notes';
import NavBar from '../../components/NavigationBar';

import README from './README.md';

export default [{
  name: 'navigationBar',
  func: withMarkdownNotes(README)(() => {
    const pageMap = object('option', {
      basic: 'BASIC',
      emotion: 'EMOTION',
      timeout: 'TIMEOUT',
    });
    const currentPage = text('currentPage', '');
    const template = `
    <div>
      <div class="headline">NavigationBar</div>
      <nav-bar v-model=currentPage :options="pageMap"/>
      <br>
      current page: {{ currentPage }}
    </div>
    `;

    return {
      components: {
        NavBar,
      },
      data() {
        return {
          pageMap,
          currentPage,
        };
      },
      template,
    };
  }),
}];
