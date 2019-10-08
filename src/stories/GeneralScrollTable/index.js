import { object, boolean, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withMarkdownNotes } from '@storybook/addon-notes';
import GeneralTable from '../../components/GeneralScrollTable/GeneralScrollTable';
import README from './README.md';

export default [{
  name: 'GeneralScrollTable',
  func: withMarkdownNotes(README)((i18n) => {
    function clickToggle(rowdata, idx) {
      action('click toggle')(rowdata, idx);
    }

    const header = [{
      key: 'wordbank',
      text: '詞庫名稱',
      width: '120px',
      info: '這個欄位顯示的是詞庫名',
      lockedLeft: true,
    }, {
      key: 'synonym',
      text: '同義詞',
      width: '500px',
      type: 'tag',
      info: '這個欄位顯示的是 type="tag"',
    }, {
      key: 'status',
      text: '狀態',
      type: 'toggle',
      width: '100px',
      info: '這個欄位顯示的是 type="status"',
    }, {
      key: 'right',
      text: '固定右邊欄位',
      width: '100px',
      info: '這個欄位會固定在右邊',
      lockedRight: true,
    }, {
      key: 'default',
      text: '預設顯示的欄位',
      width: '300px',
      info: '這個欄位在可捲動時預設會顯示',
      default: true,
    }];
    const data = [{
      right: '我在右邊',
      default: '我預設會顯示出來',
      wordbank: '詞庫 AAAAA',
      synonym: ['同義詞 AA', '同義詞 aa'],
      status: {
        val: true,
        onclick: clickToggle,
      },
      action_enable: {
        edit: true,
        delete: true,
      },
    },
    {
      right: '我不會動',
      default: '我可以被捲動',
      wordbank: '詞庫 BBBBB',
      synonym: ['同義詞 BB', '同義詞 bb'],
      status: {
        val: true,
        onclick: clickToggle,
      },
      action_enable: {
        edit: true,
        delete: true,
      },
      action_clickable: {
        edit: true,
        delete: false,
      },
    },
    {
      right: '我在右邊',
      default: '我預設會顯示出來，而且可以被捲動',
      wordbank: '詞庫 CCCCC',
      synonym: ['同義詞 CC', '同義詞 cc'],
      status: {
        val: true,
        onclick: clickToggle,
      },
      action_enable: {
        edit: true,
        delete: false,
      },
    }];

    function clickEdit(rowdata, idx) {
      action('click edit')(rowdata, idx);
    }
    function clickDelete(rowdata, idx) {
      action('click delete')(rowdata, idx);
    }
    const actionType = [{
      key: 'edit',
      text: '編輯',
      type: 'primary',
      onclick: clickEdit,
    }, {
      key: 'delete',
      text: '刪除',
      type: 'error',
      onclick: clickDelete,
    }];

    const fontTypes = {
      'font-12': '12號字',
      'font-14': '14號字',
      'font-16': '16號字',
    };
    const fontType = select('字體大小', fontTypes, 'font-14');
    const checkbox = boolean('checkbox', false);
    const showEmpty = boolean('showEmpty', false);
    const tableHeader = object('table header', header);
    const tableData = object('table data', data);
    const click = object('action', actionType);

    const template = `
    <div width="100%">
      <div style="border-bottom: 1px solid #cccccc; padding-bottom:20px;margin-bottom: 20px">
      <div style="font-size: 18px; margin: 10px 0px">可橫向捲動的 GeneralTable</div>

      <general-table
        :fontClass="fontType"
        :tableHeader="tableHeader" 
        :tableData="tableData"
        :checkbox="checkbox"
        :action="click"
        :showEmpty="showEmpty" />
      </div>

      <div style="border-bottom: 1px solid #cccccc; padding-bottom:20px;margin-bottom: 20px">
      <div style="font-size: 18px; margin: 10px 0px">允許自選顯示的標題欄: allowCustomHeader</div>

      <general-table
        :fontClass="fontType"
        :tableHeader="tableHeader" 
        :tableData="tableData"
        :checkbox="checkbox"
        :action="click"
        allowCustomHeader
        :showEmpty="showEmpty" />
      </div>
    </div>`;

    return {
      components: {
        GeneralTable,
      },
      data() {
        return {
          tableHeader,
          tableData,
          checkbox,
          click,
          fontType,
          showEmpty,
        };
      },
      methods: {
      },
      template,
      i18n,
    };
  }),
}];
