import { withMarkdownNotes } from '@storybook/addon-notes';
import README from './README.md';

export default [{
  name: 'Welcome',
  func: withMarkdownNotes(README)(() => {
    const template = `
      <div>
      <div class="div-block">
        <h2 style="font-size: 20px;">右方 ACTION PANEL 說明：</h2><br>
        <p style="font-size: 14px; line-height: 20px;">
          <b>NOTES：</b> 元件的使用說明與範例<br>
          <b>KNOBS：</b> 更改 KNOBS 裡的資訊查看元件效果<br>
          <b>ACTION LOGGER：</b> 與元件互動時觸發的 Event Log<br>
        </p>
      </div>
      <div>
        <h2 style="font-size: 20px;">此頁 NOTES 裡的 Design Guide </h2><br>
        <p style="font-size: 14px; line-height: 20px;">
          ＊ General CSS Style<br>
          ＊ Page Layout<br>
          ＊ Scrollbar<br>
          ＊ VPagination 分頁器 <br>
        </p>
      </div>
      </div>
    `;

    return {
      template,
    };
  }),
}];
