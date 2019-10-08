import { object } from '@storybook/addon-knobs';
import { withMarkdownNotes } from '@storybook/addon-notes';
import README from './README.md';

export default [
  {
    name: 'Tooltip',
    func: withMarkdownNotes(README)(() => {
      const option1 = object('Tooltip#1', {
        msg: '我是 Hover 顯示的 Tooltip',
        alignLeft: false,
      });
      const option2 = object('Tooltip#2', {
        msg: '我是 點擊 顯示的 Tooltip',
        clickShow: true,
      });
      const option3 = object('Tooltip#3', {
        msg: '我過一陣子後就會消失了',
        animateShow: true,
        animateTime: 1000,
      });
      const option4 = object('setting', {
        msg: '我是一個錯誤提示',
        errorType: true,
        alignLeft: true,
        eventOnly: true,
      });
      const template = `
      <div>
        <div class="div-block">
          <div class="headline">Tooltip: 預設 Hover 顯示 </div> 
          <div class="line">alignLeft: true 讓 tooltip 往左延伸</div>
          <span v-tooltip="option1" class="line"> Hover 我顯示 Tooltip </span>
        </div>
        <div class="div-block">
          <div class="headline">Tooltip: 點擊 顯示 </div> 
          <span v-tooltip="option2" class="line"> 點我 顯示 Tooltip </span>
        </div>
        <div class="div-block">
          <div class="headline">Tooltip: 會自動消失</div> 
          <div class="line">對 DOM 元素觸發 tooltip-show 事件，在一定時間後會自動消失</div>
          <div class="line">
            <input v-tooltip="option3" ref='input3'>
            <button @click='showOption3'>顯示</button>
          </div>
        </div>
        <div class="div-block">
          <div class="headline">Tooltip: 錯誤樣式</div> 
          <div class="line">
            <input v-tooltip="option4" ref='input4'>
            <button @click='showOption4'>顯示</button>
          </div>
        </div>
      </div>`;

      return {
        data() {
          return {
            option1,
            option2,
            option3,
            option4,
          };
        },
        methods: {
          showOption3() {
            this.$refs.input3.dispatchEvent(new Event('tooltip-show'));
          },
          showOption4() {
            this.$refs.input4.dispatchEvent(new Event('tooltip-show'));
          },
        },
        template,
      };
    }),
  },
];
