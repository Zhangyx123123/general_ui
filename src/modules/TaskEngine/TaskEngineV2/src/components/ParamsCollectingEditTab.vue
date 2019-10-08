<template lang="html">
<div id="params-collecting-edit-tab">
  <draggable v-model="params" :options="{ghostClass:'ghost'}" @start="drag=true" @end="drag=false; emitUpdate();">
    <template v-for="(param, index) in params">
      <params-collecting-block
        :key="param.id"
        ref="pcBlock"
        :nodeId="nodeId"
        :initialParam="param"
        :mapTableOptions="mapTableOptions"
        @update="updateParam(index, $event)"
        @deleteParam="deleteParam(index)">
      </params-collecting-block>
    </template>
  </draggable>
  <button
    class="button-add-params"
    @click="addParam()">
    {{$t("task_engine_v2.params_collecting_tab.button_add_params")}}
  </button>
  <div class="confirm-params-block block">
    <div class="condition-row">
      <div class="label">
        {{$t("task_engine_v2.params_collecting_tab.label_enable_confirm_msg")}}
      </div>
      <input class="checkbox-content"
        type="checkbox"
        :checked="enableConfirmMsg"
        @input="onInputEnableConfirmMsg($event.target.checked)"
      ></input>
    </div>
    <div class="confim-msgs" v-if="enableConfirmMsg===true">
      <textarea class="text-response"
        :value="confirmMsg"
        @input="onInputConfirmMsg($event.target.value)">
      </textarea>
      <div class="condition-row">
        <div class="label">
          {{$t("task_engine_v2.params_collecting_tab.parse_failed_msg")}}
        </div>
      </div>
      <textarea class="text-response"
        :value="confirmMsgParseFail"
        @input="onInputConfirmMsgParseFail($event.target.value)">
      </textarea>
    </div>
    
  </div>
</div>
</template>

<script>
import draggable from 'vuedraggable';
import DropdownSelect from '@/components/DropdownSelect';
import ParamsCollectingBlock from './ParamsCollectingBlock';
import scenarioInitializer from '../_utils/scenarioInitializer';

export default {
  name: 'params-collecting-edit-tab',
  components: {
    draggable,
    'dropdown-select': DropdownSelect,
    'params-collecting-block': ParamsCollectingBlock,
  },
  props: {
    paramsCollectingTab: {
      type: Object,
      required: true,
    },
    mapTableOptions: {
      type: Array,
      required: true,
    },
    nodeId: {
      type: String,
      required: true,
    },
  },
  data() {
    const paramsCollectingTab = this.paramsCollectingTab;
    // add tmp id for params
    const params = paramsCollectingTab.params.map((param) => {
      const obj = { ...param };
      obj.id = this.$uuid.v1();
      obj.valid = true;
      return obj;
    });
    return {
      enableConfirmMsg: paramsCollectingTab.enableConfirmMsg || false,
      confirmMsg: paramsCollectingTab.confirmMsg || '',
      confirmMsgParseFail: paramsCollectingTab.confirmMsgParseFail || '',
      params,
    };
  },
  watch: {
  },
  methods: {
    emitUpdate() {
      const paramsCollectingTab = {
        params: this.params.map((param) => {
          const { id, valid, ...rest } = param;
          return rest;
        }),
        enableConfirmMsg: this.enableConfirmMsg,
        confirmMsg: this.confirmMsg,
        confirmMsgParseFail: this.confirmMsgParseFail,
      };
      // console.log(paramsCollectingTab);
      this.$emit('update', paramsCollectingTab);
      this.$emit('update:valid', this.isValid());
    },
    updateParam(index, $event) {
      this.params[index] = { ...this.params[index], ...$event };
      this.emitUpdate();
    },
    addParam() {
      const param = {};
      param.id = this.$uuid.v1();
      param.valid = false;
      param.parsers = [];
      const parser = scenarioInitializer.initialParser();
      parser.id = this.$uuid.v1();
      param.parsers.push(parser);
      this.params.push(param);
      this.emitUpdate();
    },
    deleteParam(index) {
      this.params.splice(index, 1);
      this.emitUpdate();
    },
    onInputEnableConfirmMsg(newValue) {
      this.enableConfirmMsg = newValue;
      this.emitUpdate();
    },
    onInputConfirmMsg(newValue) {
      this.confirmMsg = newValue;
      this.emitUpdate();
    },
    onInputConfirmMsgParseFail(newValue) {
      this.confirmMsgParseFail = newValue;
      this.emitUpdate();
    },
    isValid() {
      for (let i = 0; i < this.params.length; i += 1) {
        const param = this.params[i];
        if (!param.valid) {
          return false;
        }
      }
      return true;
    },
    showToolTip() {
      const pcBlocks = this.$refs.pcBlock;
      if (pcBlocks) {
        let blocks = pcBlocks;
        if (!Array.isArray(blocks)) {
          blocks = [blocks];
        }
        blocks.forEach((block) => {
          block.$emit('showToolTip');
        });
      }
    },
  },
  beforeMount() {
  },
  mounted() {
    this.emitUpdate();
    this.$on('showToolTip', this.showToolTip);
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';

#params-collecting-edit-tab{
  display: flex;
  flex-direction: column;
  padding: 0px 30px 0px 20px;
  .block{
    display: flex;
    flex-direction: column;
    background: #F3F7F9;
    padding: 20px 20px 20px 20px;
    border: 1px solid $color-borderline;
    border-radius: 5px;
    margin: 0px 0px 20px 0px;
    .condition-row{
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 36px;
      .label{
        height: 36px;
        line-height: 36px;
        font-size: 16px;
      }
      .label-bold{
        font-weight: 600;
      }
      .label-margin-left{
        margin-left: 20px;
      }
      .input-limit{
        height: 36px;
        margin: 0px 10px 0px 10px;
        width: 40px;
      }
      .select{
        background: white;
        margin-left: 20px;
        border-radius: 5px;
      }
      input[type=checkbox]{
        @include general-checkbox();
      }
    }
    .confim-msgs{
      display: flex;
      flex-direction: column;
      .text-response{
        height: 100px;
        color: $color-font-normal;
        margin: 10px 0px 10px 0px;
      }
    }
  }
  .instruction{
    height: 60px;
    line-height: 20px;
    color: $color-font-normal;
    font-size: 14px;
  }
  .button-add-params{
    height: 40px;
    background: #46BE8A;
    border-radius: 5px;
    color: white;
    font-size: 18px;
    font-weight: 600;
    margin: 0px 0px 20px 0px;
    cursor: pointer;
    &:hover{
      transition: background-color 0.5s ease;
      background: lighten(#46BE8A, 10%);
    }
  }
}
</style>
