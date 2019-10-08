import action from '@storybook/addon-actions';
import { withMarkdownNotes } from '@storybook/addon-notes';
import TextButton from '../../components/basic/TextButton';
import DescriptionContent from './DescriptionContent';
import ReminderExample from './ReminderExample';
import CustomContent from './CustomContent';
import README from './README.md';

export default [
  {
    name: 'PopWindow',
    func: withMarkdownNotes(README)((i18n) => {
      const template = `
        <div>
          <pop-windows id="popwindow"></pop-windows>
          <div class="div-block">
            <div class="headline">自訂彈窗：$pop</div> 
            <div class="line"> 
              <text-button
                button-type='primary'
                @click="showPop">
                點我出現 自訂 POP
              </text-button>
            </div>
            <div class="headline">自訂彈窗，顯示小彈窗：$pop</div> 
            <div class="line"> 
              <text-button
                button-type='primary'
                @click="showPopWithReminder">
                點我出現 自訂 POP
              </text-button>
            </div>
            <div class="headline">自訂彈窗，自訂按鈕文字並增加按鈕：$pop</div> 
            <div class="line"> 
              <text-button
                button-type='primary'
                @click="showPopCustomRightButton">
                點我出現 自訂 POP
              </text-button>
            </div>
            <div class="headline">自訂彈窗，增加左下角按鈕：$pop</div> 
            <div class="line"> 
              <text-button
                button-type='primary'
                @click="showPopCustomLeftButton">
                點我出現 自訂 POP
              </text-button>
            </div>
          </div>
          <div class="div-block">
            <div class="headline">確認彈窗：$popCheck</div>
            <div class="line"> 
              <text-button
                button-type='primary'
                @click="showCheckPop">
                點我出現 確認 POP
              </text-button>
            </div>
          </div>
          <div class="div-block">
            <div class="headline">警示彈窗：$popWarn</div>
            <div class="line">  
              <text-button
                button-type='error'
                @click="showWarnPop">
                點我出現 警示 POP
              </text-button>
            </div>
          </div>
          <div class="div-block">
            <div class="headline">說明彈窗：$popDescription</div> 
            <div class="line"> 
              <text-button
                button-type='error'
                @click="showDescriptionPop">
                點我出現 說明 POP
              </text-button>
            </div>
          </div>
          <div class="div-block">
            <div class="headline">錯誤彈窗：$popError</div> 
            <div class="line"> 
              <text-button
                button-type='error'
                @click="showErrorPop">
                點我出現 錯誤 POP
              </text-button>
            </div>
          </div>
        </div>`;

      return {
        components: { TextButton },
        methods: {
          showCheckPop() {
            const that = this;
            const option = {
              data: {
                msg: '編輯資料尚未儲存，確定要取消編輯嗎？',
              },
              callback: {
                ok: () => {
                  action('check pop callOK');
                },
              },
            };
            that.$popCheck(option);
          },
          showErrorPop() {
            const that = this;
            that.$popError('這是一個錯誤', '這個錯誤的相關資訊');
          },
          showPop() {
            const that = this;
            const option = {
              title: '自訂彈窗標題',
              component: CustomContent,
            };
            that.$pop(option);
          },
          showPopCustomLeftButton() {
            const that = this;
            const option = {
              title: '自訂彈窗標題',
              component: CustomContent,
              left_button: {
                msg: '左邊按鈕',
                type: 'error',
                closeAfterClick: true,
              },
            };
            that.$pop(option);
          },
          showPopCustomRightButton() {
            const that = this;
            const option = {
              title: '自訂彈窗標題',
              component: CustomContent,
              custom_button: [{
                msg: '右邊按鈕',
                closeAfterClick: true,
              }],
              ok_msg: '我是確認',
              cancel_msg: '我是取消',
            };
            that.$pop(option);
          },
          showDescriptionPop() {
            const that = this;
            const option = {
              title: '說明彈窗標題',
              component: DescriptionContent,
            };
            that.$popDescription(option);
          },
          showWarnPop() {
            const that = this;
            const option = {
              data: {
                msg: '你確定要刪除資料嗎？',
              },
              callback: {
                ok: () => {
                  action('warn pop CallOK');
                },
              },
            };
            that.$popWarn(option);
          },
          showPopWithReminder() {
            this.$pop({
              title: 'reminder',
              component: ReminderExample,
              validate: true,
              cancelValidate: true,
            });
          },
        },
        template: `<div>
        ${template}
        </div>`,
        i18n,
      };
    }),
  },
];
