import { number } from '@storybook/addon-knobs';
import { withMarkdownNotes } from '@storybook/addon-notes';
import LoadingLine from '../../components/basic/LoadingLine';
import LoadingDot from '../../components/basic/LoadingDot';
import README from './README.md';

export default [{
  name: 'Loading',
  func: withMarkdownNotes(README)(() => {
    const magnifyLine = number('Line: magnify', 0.5);
    const magnifyDot = number('Dot: magnify', 0.5);
    const template = `
      <div>
        <div class="div-block">
          <div class="headline">Loading Line 預設大小</div>
          <loading-line></loading-line>
          <br><br>
          <div class="headline">Loading Line 自訂大小</div>
          <loading-line :magnify="magnifyLine"></loading-line>
        </div>
        <div class="div-block">
          <div class="headline">Loading Dot 預設大小</div>
          <loading-dot></loading-dot>
          <br><br>
          <div class="headline">Loading Dot 自訂大小</div>
          <loading-dot :magnify="magnifyDot"></loading-dot>
        </div>
      </div>`;
    return {
      components: {
        LoadingLine,
        LoadingDot,
      },
      data() {
        return {
          magnifyLine,
          magnifyDot,
        };
      },
      template,
    };
  }),
}];
