<template lang="html">
<div id="restful-setting-edit-page">
  <div class="block">
    <div class="label-header">{{$t("task_engine_v2.setting_edit_tab.node_type")}}</div>
    <input class="input-rounded input-readonly"
      disabled
      :value="$t(`task_engine_v2.node_type.${nodeType}`)">
    </input>
  </div>
  <div class="block">
    <div class="label-header">{{$t("task_engine_v2.setting_edit_tab.node_name")}}</div>
    <input class="input-rounded" ref="required-input-name" v-tooltip="tooltip" @focus="onInputFocus"
      v-model="nodeName">
    </input>
  </div>
  <div class="block">
    <div class="label-header">{{$t("task_engine_v2.restful_setting_edit_tab.restful_data_retrieve")}}</div>
    <div class="row">
      <div class="label-text">{{$t("task_engine_v2.restful_setting_edit_tab.data_save_in_key")}}</div>
      <input class="input-key" ref="required-input-varname" v-tooltip="tooltip" @focus="onInputFocus" v-model="rtnVarName"></input>
    </div>
    <div class="row">
      <div class="label-text">{{$t("task_engine_v2.restful_setting_edit_tab.method")}}</div>
      <dropdown-select
        class="select select-method"
        ref="selectMethod"
        :value="[method]"
        @input="method=$event[0]"
        :options="methodOptions"
        :showCheckedIcon="false"
        width="200px"
        :inputBarStyle="selectStyle"
      />
    </div>
    <div class="row">
      <div class="label-text">{{$t("task_engine_v2.restful_setting_edit_tab.url")}}</div>
      <input class="input-url" ref="required-input-url" v-tooltip="tooltip" @focus="onInputFocus" v-model="url"></input>
    </div>
    <div class="label-sub-header">Header</div>
    <div class="row">
      <div class="label-text">Content-Type：</div>
      <dropdown-select
        class="select select-content-type"
        ref="selectContentType"
        :value="[contentType]"
        @input="contentType=$event[0]"
        :options="contentTypeOptions"
        :showCheckedIcon="false"
        width="200px"
        :inputBarStyle="selectStyle"
      />
    </div>
    <div class="label-sub-header">Body</div>
    <textarea class="text-body"
      v-model="body">
    </textarea>
  </div>
</div>
</template>

<script>
import event from '@/utils/js/event';
import DropdownSelect from '@/components/DropdownSelect';
import general from '@/modules/TaskEngine/_utils/general';

export default {
  name: 'restful-setting-edit-page',
  components: {
    'dropdown-select': DropdownSelect,
  },
  props: {
    initialRestfulSettingTab: {
      type: Object,
      required: true,
    },
  },
  data() {
    const restfulSettingTab = this.initialRestfulSettingTab;
    const nodeType = restfulSettingTab.nodeType;
    const nodeName = restfulSettingTab.nodeName;
    const url = restfulSettingTab.url;
    const method = restfulSettingTab.method;
    const contentType = restfulSettingTab.contentType;
    const body = restfulSettingTab.body;
    const rtnVarName = restfulSettingTab.rtnVarName;
    return {
      nodeType,
      nodeName,
      url,
      method,
      contentType,
      body,
      rtnVarName,
      methodOptions: this.getMethodOptions(),
      contentTypeOptions: this.getContentTypeOptions(),
      selectStyle: {
        height: '36px',
        'border-radius': '5px',
      },
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
    restfulSettingTab() {
      const result = {
        nodeType: this.nodeType,
        nodeName: this.nodeName,
        url: this.url,
        method: this.method,
        contentType: this.contentType,
        body: this.body,
        rtnVarName: this.rtnVarName,
      };
      // console.log(result);
      return result;
    },
  },
  watch: {
    restfulSettingTab: {
      handler() {
        this.$emit('update', this.restfulSettingTab);
        this.$emit('update:valid', this.isValid());
        // console.log(this.restfulEdgeTab);
      },
      deep: true,
    },
  },
  methods: {
    getMethodOptions() {
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      return methods.map(method => ({
        text: method,
        value: method,
      }));
    },
    getContentTypeOptions() {
      const contentType = ['application/json', 'application/x-www-form-urlencoded'];
      return contentType.map(type => ({
        text: type,
        value: type,
      }));
    },
    onInputFocus(evt) {
      evt.target.dispatchEvent(event.createEvent('tooltip-hide'));
    },
    isValid() {
      const requiredInputs = Object.keys(this.$refs).filter(refName => refName.indexOf('required-input-') !== -1);
      const elements = requiredInputs.map(refName => this.$refs[refName]);
      return general.isInputContentsValid(elements);
    },
    showToolTip() {
      const requiredInputs = Object.keys(this.$refs).filter(refName => refName.indexOf('required-input-') !== -1);
      const elements = requiredInputs.map(refName => this.$refs[refName]);
      general.showInputContentTooltip(elements);
    },
  },
  mounted() {
    this.$on('showToolTip', this.showToolTip);
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';

#restful-setting-edit-page{
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
    .label-sub-header{
      font-weight: 600;
      color: #37474F;
      font-size: 14px;
      line-height: 14px;
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
      .input-url{
        flex: 1 1 auto;
      }
    }
    .text-body{
      height: 200px;
      color: $color-font-normal;
    }
    input{
      height: 36px;
    }
  }
}
</style>
