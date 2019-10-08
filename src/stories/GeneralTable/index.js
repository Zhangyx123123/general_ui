import { object, boolean, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withMarkdownNotes } from '@storybook/addon-notes';
import GeneralTable from '../../components/GeneralTable';
import README from './README.md';

export default [{
  name: 'GeneralTable',
  func: withMarkdownNotes(README)((i18n) => {
    function clickToggle(rowdata, idx) {
      action('click toggle')(rowdata, idx);
    }

    const header = [{
      key: 'wordbank',
      text: '詞庫',
      width: '120px',
      info: '這個欄位顯示的是詞庫名',
    }, {
      key: 'synonym',
      text: '同義詞',
      type: 'tag',
      info: '這個欄位顯示的是同義詞',
    }, {
      key: 'status',
      text: '狀態',
      type: 'toggle',
      width: '80px',
      info: '這個欄位顯示的是狀態',
    }];
    const data = [{
      wordbank: '詞庫名稱',
      synonym: ['一個同義詞', '兩個同義詞'],
      status: {
        val: true,
        onclick: clickToggle,
      },
      action_enable: {
        edit: true,
        delete: true,
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
    const autoHeight = boolean('autoHeight', false);
    const showEmpty = boolean('showEmpty', false);
    const tableHeader = object('table header', header);
    const tableData = object('table data', data);
    const click = object('action', actionType);

    const template = `
    <div class="headline">General Table</div> 
      <general-table
        :fontClass="fontType"
        :autoHeight="autoHeight"
        :tableHeader="tableHeader" 
        :tableData="tableData"
        :checkbox="checkbox"
        :action="click"
        :showEmpty="showEmpty" />
    `;

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
          autoHeight,
          fontType,
          showEmpty,
        };
      },
      methods: {
      },
      template: `<div>${template}</div>`,
      i18n,
    };
  }),
}];
