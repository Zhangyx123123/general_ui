<template>
<div id="scenario-info">
  <div class="row">
    <div class="title" v-t="'task_engine_v2.scenario_info.robot_id'"></div>
    <div class="content">{{ appId }}</div>
  </div>
  <div class="row">
    <div class="title" v-t="'task_engine_v2.scenario_info.scenario_id'"></div>
    <div class="content">{{ scenarioId }}</div>
  </div>
  <div class="row">
    <span class="title" v-t="'task_engine_v2.scenario_info.scenario_dialogue_cnt_limit'"></span>
    <input ref="scenarioDialogueCnt" type="number" v-model.trim="scenarioDialogueCntLimit" v-tooltip="scenarioDialogueCntLimitTooltip" @focus="inputFocus"/>
  </div>
  <div class="row">
    <div class="title" v-t="'task_engine_v2.scenario_info.default_node_dialogue_cnt_limit'"></div>
    <input ref="nodeDialogueCnt" type="number" v-model.trim="nodeDialogueCntLimit" v-tooltip="nodeDialogueCntLimitTooltip" @focus="inputFocus"/>
  </div>
  <div class="row">
    <div class="title" v-t="'task_engine_v2.scenario_info.scenario_last_update_time'"></div>
    <div class="content">{{ updateTime }}</div>
  </div>
</div>
</template>

<script>
import event from '@/utils/js/event';

export default {
  props: {
    value: {
      type: Object,
    },
  },
  data() {
    return {
      nodeDialogueCntLimit: this.value.setting.nodeDialogueCntLimit,
      scenarioDialogueCntLimit: this.value.setting.scenarioDialogueCntLimit,
      scenarioId: this.value.metadata.scenario_id,
      updateTime: this.value.metadata.update_time,
      appId: this.$store.state.appid,
      scenarioDialogueCntLimitTooltip: {
        msg: this.$t('task_engine_v2.err_empty'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      nodeDialogueCntLimitTooltip: {
        msg: this.$t('task_engine_v2.err_empty'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
    };
  },
  methods: {
    validate() {
      let valid = true;
      if (!this.$refs.scenarioDialogueCnt.value) {
        valid = false;
        this.$refs.scenarioDialogueCnt.dispatchEvent(event.createEvent('tooltip-show'));
      }
      if (!this.$refs.nodeDialogueCnt.value) {
        valid = false;
        this.$refs.nodeDialogueCnt.dispatchEvent(event.createEvent('tooltip-show'));
      }
      if (valid) {
        this.$emit('validateSuccess', {
          ...this.value.setting,
          nodeDialogueCntLimit: +this.nodeDialogueCntLimit,
          scenarioDialogueCntLimit: +this.scenarioDialogueCntLimit,
        });
      }
    },
    inputFocus(e) {
      e.target.dispatchEvent(event.createEvent('tooltip-hide'));
    },
  },
  mounted() {
    this.$on('validate', this.validate);
  },
};
</script>

<style lang="scss" scoped>
#scenario-info {
  width: 650px;
  padding: 20px;
  border-top: #e9e9e9 solid 1px;
  border-bottom: #e9e9e9 solid 1px;
  .row {
    &:not(:last-child) {
      margin-bottom: 20px;
    }
    display: flex;
    align-items: center;
    .title, .content {
      @include font-14px();
      color: $color-font-normal;
    }
    .title {
      text-align: right;
      width: 112px;
      margin-right: 20px;
    }
    input {
      flex: 1;
      border-radius: 2px;
    }
  }
}
</style>

