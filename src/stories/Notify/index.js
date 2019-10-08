import { withMarkdownNotes } from '@storybook/addon-notes';
import TextButton from '../../components/basic/TextButton';
import README from './README.md';

export default [
  {
    name: 'Notification',
    func: withMarkdownNotes(README)(() => {
      const template = `
        <div>
          <div class="div-block">
            <div class="headline">一般通知：$notifyInfo</div>
            <div class="line"> 
              <text-button
                button-type='primary'
                @click="showNotify">
                點我出現 一般通知
              </text-button>
            </div>
          </div>
          <div class="div-block">
            <div class="headline">成功通知：$notify</div> 
            <div class="line"> 
              <text-button
                button-type='primary'
                @click="showNotifySuccess">
                點我出現 成功通知
              </text-button>
            </div>
          </div>
          <div class="div-block">
            <div class="headline">警示通知：$notifyWarn</div>
            <div class="line">  
              <text-button
                button-type='error'
                @click="showNotifyWarning">
                點我出現 警告通知
              </text-button>
            </div>
          </div>
          <div class="div-block">
            <div class="headline">錯誤通知：$notifyError</div> 
            <div class="line"> 
              <text-button
                button-type='error'
                @click="showNotifyError">
                點我出現 錯誤通知
              </text-button>
            </div>
          </div>
          <notification></notification>
        </div>`;

      return {
        components: { TextButton },
        methods: {
          showNotify() {
            this.$notifyInfo('注意系統維修');
          },
          showNotifyError() {
            this.$notifyFail('目前系統問題，請找 IT 人員');
          },
          showNotifySuccess() {
            this.$notify({ text: '新增帳號成功' });
          },
          showNotifyWarning() {
            this.$notifyWarn('警示訊息');
          },
        },
        template: `<div>
        ${template}
        </div>`,
      };
    }),
  },
];
