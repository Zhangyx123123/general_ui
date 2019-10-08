<template lang="html">
<div id="nlu-pc-setting-tab">
  <div class="block">
    <div class="label-header">{{$t("task_engine_v2.setting_edit_tab.node_type")}}</div>
    <input class="input-rounded input-readonly"
      disabled
      :value="$t(`task_engine_v2.node_type.${nodeType}`)">
    </input>
  </div>
  <div class="block">
    <div class="label-header">{{$t("task_engine_v2.setting_edit_tab.node_name")}}</div>
    <input class="input-rounded"
      ref="input-content" v-tooltip="tooltip" @focus="onInputFocus"
      v-model="nodeName">
    </input>
  </div>
</div>
</template>

<script>
import general from '@/modules/TaskEngine/_utils/general';
import event from '@/utils/js/event';

export default {
  name: 'nlu-pc-setting-tab',
  props: {
    settingBasicTab: {
      type: Object,
      required: true,
    },
  },
  data() {
    const settingTab = this.settingBasicTab;
    const nodeType = settingTab.nodeType;
    const nodeName = settingTab.nodeName;
    return {
      nodeType,
      nodeName,
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
    settingTab() {
      const result = {
        nodeName: this.nodeName,
        nodeType: this.nodeType,
      };
      // console.log(result);
      return result;
    },
  },
  watch: {
    settingTab: {
      handler() {
        this.$emit('update', this.settingTab);
        this.$emit('update:valid', this.isValid());
      },
      deep: true,
    },
  },
  methods: {
    onInputFocus(evt) {
      evt.target.dispatchEvent(event.createEvent('tooltip-hide'));
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

#nlu-pc-setting-tab{
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
  }
}
</style>
