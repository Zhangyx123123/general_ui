<template lang="html">
<div id="setting-edit-tab">
  <div class="block">
    <div class="label-header">{{$t("task_engine_v2.setting_edit_tab.node_type")}}</div>
    <input class="input-rounded input-readonly"
      disabled
      :value="$t(`task_engine_v2.node_type.${nodeType}`)"/>
  </div>
  <div class="block">
    <div class="label-header">{{$t("task_engine_v2.setting_edit_tab.node_name")}}</div>
    <input class="input-rounded" ref="input-content" v-tooltip="tooltip"
      v-model="nodeName"
      @focus="onInputFocus">
    </input>
  </div>
  <div class="block">
    <div class="label-header">{{$t("task_engine_v2.setting_edit_tab.default_q")}}</div>
    <div class="insert-var-button-row">
      <div ref="insertVarDropdown" class="button-insert var" v-dropdown="insertVarDropdown()">
        {{$t("task_engine_v2.setting_edit_tab.insert_var")}}
      </div>
      <div class="button-insert sys-var" v-dropdown="insertSysVarDropdown()">
        {{$t("task_engine_v2.setting_edit_tab.insert_sys_var")}}
      </div>
    </div>
    <textarea class="text-response"
      ref="defaultQ"
      v-model="initialResponse">
    </textarea>
  </div>
  <div class="block">
    <div class="label-header">{{$t("task_engine_v2.setting_edit_tab.parse_text")}}</div>
    <div class="row">
      <div class="label-text">{{$t("task_engine_v2.setting_edit_tab.parser")}}</div>
      <dropdown-select
        class="select select-parser"
        ref="selectParser"
        :value="[parser]"
        @input="onSelectParserInput($event)"
        :options="parserOptions"
        :showCheckedIcon="true"
        width="200px"
        :inputBarStyle="selectStyle"
      />
    </div>
    <div class="row">
      <div class="label-text">{{$t("task_engine_v2.setting_edit_tab.target_data")}}</div>
      <dropdown-select
        class="select select-target-entity"
        v-if="parser !== 'none'"
        ref="selectTargetEntity"
        :multi="true"
        v-model="targetEntities"
        :options="entityModuleOptions"
        :showCheckedIcon="true"
        :showSearchBar="true"
        width="200px"
        :inputBarStyle="selectStyle"
      />
    </div>
    <div class="row">
      <div class="label-text">{{$t("task_engine_v2.setting_edit_tab.skip_if_exist")}}</div>
      <dropdown-select
        class="select select-skip-if-key-exist"
        v-if="parser !== 'none'"
        ref="selectSkipIfKeyExist"
        :multi="true"
        v-model="skipIfKeyExist"
        :options="entityKeyNameOptions"
        :showCheckedIcon="true"
        :showSearchBar="true"
        width="200px"
        :inputBarStyle="selectStyle"
      />
    </div>
    <div class="row">
      <div class="label-text">{{$t("task_engine_v2.setting_edit_tab.parse_from_this_node")}}</div>
      <input class="checkbox" type="checkbox" v-if="parser !== 'none'" v-model="parseFromThisNode">
    </div>
  </div>
  <div class="block">
    <div class="label-header">{{$t("task_engine_v2.setting_edit_tab.parse_fail_q")}}</div>
    <textarea class="text-response" ref="fail-textarea"
      v-model="failureResponse">
    </textarea>
  </div>
</div>
</template>

<script>
import event from '@/utils/js/event';
import DropdownSelect from '@/components/DropdownSelect';
import general from '@/modules/TaskEngine/_utils/general';
import optionConfig from '../_utils/optionConfig';

export default {
  name: 'setting-edit-tab',
  components: {
    'dropdown-select': DropdownSelect,
  },
  props: {
    settingTab: {
      type: Object,
      required: true,
    },
    globalVarOptions: {
      type: Array,
      required: true,
    },
    nodeType: {
      type: String,
      required: true,
    },
  },
  data() {
    const settingTab = this.settingTab;

    // render entityModuleOptions, entityKeyNameOptions
    const entityModuleOptionsMap = optionConfig.getEntityModuleOptionsMap();
    const entityKeyNameOptionsMap = this.getEntityKeyNameOptionsMap();
    return {
      nodeName: settingTab.nodeName,
      parser: settingTab.parser,
      parserOptions: this.getParserOptions(),
      targetEntities: settingTab.targetEntities,
      skipIfKeyExist: settingTab.skipIfKeyExist,
      initialResponse: settingTab.initialResponse,
      failureResponse: settingTab.failureResponse,
      parseFromThisNode: settingTab.parseFromThisNode,
      entityModuleOptions: entityModuleOptionsMap[settingTab.parser],
      entityKeyNameOptions: entityKeyNameOptionsMap[settingTab.parser],
      selectStyle: {
        height: '36px',
        'border-radius': '5px',
      },
      varDropdown: undefined,
      tooltip: {
        msg: this.$t('task_engine_v2.err_empty'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
        absolute: true,
      },
    };
  },
  computed: {
    result() {
      const result = {
        nodeName: this.nodeName,
        parser: this.parser,
        targetEntities: this.targetEntities,
        skipIfKeyExist: this.skipIfKeyExist,
        initialResponse: this.initialResponse,
        failureResponse: this.failureResponse,
        parseFromThisNode: this.parseFromThisNode,
      };
      // console.log(result);
      return result;
    },
  },
  watch: {
    result: {
      handler() {
        this.$emit('update', this.result);
        this.$emit('update:valid', this.isValid());
      },
      deep: true,
    },
    globalVarOptions: {
      handler() {
        this.$nextTick(() => {
          if (this.$refs.insertVarDropdown) {
            this.$refs.insertVarDropdown.dispatchEvent(event.createEvent('dropdown-reload'));
          }
        });
      },
    },
  },
  methods: {
    onInputFocus(evt) {
      evt.target.dispatchEvent(event.createEvent('tooltip-hide'));
    },
    isValueEmpty(el) {
      let valid = true;
      if (!el.value) {
        valid = false;
        el.dispatchEvent(event.createEvent('tooltip-show'));
      }
      return valid;
    },
    onSelectParserInput(newValue) {
      const newParser = newValue[0];
      const originParser = this.parser;
      if (originParser === newParser) return;
      this.parser = newParser;
      if (originParser !== undefined) {
        this.targetEntities = [];
        this.skipIfKeyExist = [];
      }
      if (this.parser === 'none') return;

      const entityModuleOptionsMap = optionConfig.getEntityModuleOptionsMap();
      this.entityModuleOptions = entityModuleOptionsMap[this.parser];
      const entityKeyNameOptionsMap = this.getEntityKeyNameOptionsMap();
      this.entityKeyNameOptions = entityKeyNameOptionsMap[this.parser];

      if (this.$refs.selectTargetEntity) {
        this.$refs.selectTargetEntity.$emit('updateOptions', this.entityModuleOptions);
        this.$refs.selectTargetEntity.$emit('select', this.targetEntities);
      }
      if (this.$refs.selectSkipIfKeyExist) {
        this.$refs.selectSkipIfKeyExist.$emit('updateOptions', this.entityKeyNameOptions);
        this.$refs.selectSkipIfKeyExist.$emit('select', this.skipIfKeyExist);
      }
    },
    insertVarDropdown() {
      if (this.varDropdown === undefined) {
        this.varDropdown = { width: '500px' };
      }
      this.varDropdown.options = this.globalVarOptions.map(option => ({
        text: `${option.text}：${option.value}`,
        onclick: this.insertVarSelect.bind(this, `$global{${option.value}}`),
      }));
      return this.varDropdown;
    },
    insertSysVarDropdown() {
      return {
        options: [
          {
            text: this.$t('task_engine_v2.setting_edit_tab.all_sys_var'),
            onclick: this.insertVarSelect.bind(this, '$item_list'),
          },
          {
            text: this.$t('task_engine_v2.setting_edit_tab.unconfirmed_sys_var'),
            onclick: this.insertVarSelect.bind(this, '$msg_confirm'),
          },
        ],
        width: '200px',
      };
    },
    insertVarSelect(toInsert) {
      const selectStart = this.$refs.defaultQ.selectionStart;
      const selectEnd = this.$refs.defaultQ.selectionEnd;
      this.initialResponse = `${this.initialResponse.substring(0, selectStart)}${toInsert}${this.initialResponse.substring(selectEnd)}`;
      this.$nextTick(() => {
        this.$refs.defaultQ.selectionStart = selectStart + toInsert.length;
        this.$refs.defaultQ.selectionEnd = selectStart + toInsert.length;
        this.$refs.defaultQ.focus();
      });
    },
    getParserOptions() {
      return [
        {
          text: this.$t('task_engine_v2.parser.none'),
          value: 'none',
        },
        {
          text: this.$t('task_engine_v2.parser.common_parser'),
          value: 'common_parser',
        },
        {
          text: this.$t('task_engine_v2.parser.task_parser'),
          value: 'task_parser',
        },
        {
          text: this.$t('task_engine_v2.parser.hotel_parser'),
          value: 'hotel_parser',
        },
      ];
    },
    getEntityKeyNameOptionsMap() {
      const entityListMap = optionConfig.getEntityListMap();
      return {
        none: [],
        common_parser: entityListMap.common_parser.map(option => ({
          text: option,
          value: option,
        })),
        task_parser: entityListMap.task_parser.map(option => ({
          text: option,
          value: option,
        })),
        hotel_parser: entityListMap.hotel_parser.map(option => ({
          text: option,
          value: option,
        })),
      };
    },
    isValid() {
      return general.isInputContentsValid(this.$refs['input-content']);
    },
    showToolTip() {
      general.showInputContentTooltip(this.$refs['input-content']);
    },
  },
  mounted() {
    this.$on('showToolTip', this.showToolTip);
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';

#setting-edit-tab{
  display: flex;
  flex-direction: column;
  padding: 10px 20px 10px 20px;
  .block{
    display: flex;
    flex-direction: column;
    margin: 0px 0px 20px 0px;
    .label-header{
      font-weight: 600;
      color: #37474F;
      font-size: 18px;
      line-height: 18px;
      margin: 11px 0px 11px 0px;
    }
    .input-rounded{
      height: 36px;
      border-radius: 18px;
      background: white;
      &:disabled{
        background: #F3F7F9;
      }
    }
    .insert-var-button-row{
      display: flex;
      flex-direction: row;
      .button-insert{
        position: relative;
        display: flex;
        flex-direction: row;
        height: 36px;
        background: #E4EAEC;
        font-size: 14px;
        line-height: 36px;
        justify-content: center;
        border-radius: 2px;
        cursor: pointer;
        &:not(:first-child){
          margin: 0px 0px 0px 3px;
        }
        &:hover{
          background: lighten(#E4EAEC, 3%);
        }
      }
      .var{
        width: 100px;
      }
      .sys-var{
        width: 120px;
      }
    }
    .text-response{
      height: 100px;
      color: $color-font-normal;
    }
    .row{
      display: flex;
      flex-direction: row;
      align-items: center;
      &:not(:first-child){
        margin: 5px 0px 0px 0px;
      }
      .label-text{
        height: 36px;
        font-size: 14px;
        line-height: 36px;
        color: $color-font-normal;
        margin: 0px 10px 0px 0px;
      }
    }
  }
  input[type=checkbox]{
    @include general-checkbox();
  }
}
</style>
