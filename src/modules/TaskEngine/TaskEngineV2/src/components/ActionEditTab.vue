<template lang="html">
<div id="action-edit-tab">
  <action-page
    :initialActionGroupList="actionGroupList"
    :initialEntityCollectorList="initialEntityCollectorList"  
    :initialSkillNameList="initialToNodeOptions"
    :version="version"
    @update:valid="updateValid"
    @update="updateActionGroupList"
    @updateNewNodeOptions="updateNewNodeOptions"
  ></action-page>
  <div class="block-container">
    <div class="wait-for-response-block block">
      <div class="row">
        <div class="label">
          {{$t("task_engine_v2.action_edit_tab.wait_for_response")}}
        </div>
        <input class="checkbox-content"
          type="checkbox"
          :checked="waitForResponse"
          @input="onInputWaitForResponse($event.target.checked)"
        ></input>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import general from '@/modules/TaskEngine/_utils/general';
import ActionPage from '@/modules/TaskEngine/TaskEngineV3/src/components/ActionPage';

export default {
  name: 'action-edit-tab',
  components: {
    'action-page': ActionPage,
  },
  props: {
    actionTab: {
      type: Object,
      required: true,
    },
    initialEntityCollectorList: {
      type: Array,
      required: true,
    },
    initialToNodeOptions: {
      type: Array,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
  },
  data() {
    const actionGroupList = this.actionTab.actionGroupList;
    let waitForResponse = this.actionTab.waitForResponse;
    if (waitForResponse === undefined) {
      waitForResponse = true;
    }
    return {
      actionGroupList,
      waitForResponse,
    };
  },
  watch: {
  },
  methods: {
    updateValid(valid) {
      this.$emit('update:valid', valid);
    },
    updateNewNodeOptions(newNodeOptions) {
      this.$emit('updateNewNodeOptions', newNodeOptions);
    },
    updateActionGroupList(actionGroupList) {
      this.actionGroupList = actionGroupList;
      this.emitUpdate();
    },
    onInputWaitForResponse(newValue) {
      this.waitForResponse = newValue;
      this.emitUpdate();
    },
    emitUpdate() {
      const actionTab = {
        actionGroupList: this.actionGroupList,
        waitForResponse: this.waitForResponse,
      };
      // console.log(actionTab);
      this.$emit('update', actionTab);
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

#action-edit-tab{
  display: flex;
  flex-direction: column;
  .block-container{
    display: flex;
    flex-direction: column;
    margin: 0px 0px 20px 0px;
    padding: 0px 20px 0px 20px;
    .block{
      display: flex;
      flex-direction: column;
      // background: #F3F7F9;
      padding: 20px 20px 20px 20px;
      border: 1px solid $color-borderline;
      border-radius: 5px;
      margin: 0px 0px 20px 0px;
      .row{
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 36px;
        .label{
          height: 36px;
          line-height: 36px;
          font-size: 16px;
        }
        input[type=checkbox]{
          @include general-checkbox();
        }
      }
    }
  }
}
</style>
