<template lang="html">
<div id="trigger-edit-tab">
  <div class="instruction block" v-t="'task_engine_v2.trigger_edit_tab.instruction'"></div>
  <draggable v-model="rules" :options="{ghostClass:'ghost'}" @start="drag=true" @end="drag=false; emitUpdate();">
    <template v-for="(rule, index) in rules">
      <condition-block
        class="condition-block"
        ref="conditionBlock"
        :key="rule.id"
        :nodeId="nodeId"
        :initialEdge="rule"
        :toNodeOptions="[]"
        :globalVarOptions="globalVarOptions"
        :mapTableOptions="mapTableOptions"
        :jsCodeAlias="jsCodeAlias"
        @update="updateRule(index, $event)"
        @deleteEdge="deleteRule(index)">
      </condition-block>
    </template>
  </draggable>
  <button
    v-t="'task_engine_v2.trigger_edit_tab.button_add_rule'"
    class="button-add-rule"
    @click="addRule()">
  </button>
</div>

</template>

<script>
import draggable from 'vuedraggable';
import ConditionBlock from './ConditionBlock';
import scenarioInitializer from '../_utils/scenarioInitializer';

export default {
  name: 'trigger-edit-tab',
  components: {
    draggable,
    'condition-block': ConditionBlock,
  },
  props: {
    triggerTab: {
      type: Object,
      required: true,
    },
    globalVarOptions: {
      type: Array,
      required: true,
    },
    mapTableOptions: {
      type: Array,
      required: true,
    },
    jsCodeAlias: {
      type: Array,
      default: () => [],
    },
    nodeId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      rules: this.triggerTab.rules.map(rule => ({
        id: this.$uuid.v1(),
        to_node_id: null,
        edge_type: 'normal',
        condition_rules: [rule],
        valid: false,
        tab: 'TriggerEditTab',
      })),
    };
  },
  watch: {
  },
  methods: {
    addRule() {
      const rule = scenarioInitializer.initialTriggerRule();
      rule.id = this.$uuid.v1();
      rule.valid = false;
      rule.tab = 'TriggerEditTab';
      this.rules.push(rule);
      this.emitUpdate();
    },
    deleteRule(index) {
      this.rules.splice(index, 1);
      this.emitUpdate();
    },
    updateRule(index, rule) {
      this.rules[index] = rule;
      this.emitUpdate();
    },
    emitUpdate() {
      const triggerTab = {
        rules: this.rules.map(r => r.condition_rules[0]),
      };
      // console.log(triggerTab);
      this.$emit('update', triggerTab);
      this.$emit('update:valid', this.isValid());
    },
    isValid() {
      for (let i = 0; i < this.rules.length; i += 1) {
        const edge = this.rules[i];
        if (!edge.valid) {
          return false;
        }
      }
      return true;
    },
    showToolTip() {
      const conditionBlocks = this.$refs.conditionBlock;
      if (conditionBlocks) {
        let blocks = conditionBlocks;
        if (!Array.isArray(blocks)) {
          blocks = [blocks];
        }
        blocks.forEach((block) => {
          block.$emit('showToolTip');
        });
      }
    },
  },
  mounted() {
    this.$on('showToolTip', this.showToolTip);
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';

#trigger-edit-tab{
  display: flex;
  flex-direction: column;
  padding: 0px 30px 0px 20px;
  .instruction{
    height: 60px;
    line-height: 20px;
    color: $color-font-normal;
    font-size: 14px;
  }
  .block{
    background: #F3F7F9;
    padding: 20px 20px 20px 20px;
    border: 1px solid $color-borderline;
    border-radius: 5px;
    margin: 0px 0px 20px 0px;
  }
  .button-add-rule{
    height: 40px;
    background: #46BE8A;
    border-radius: 5px;
    color: white;
    font-size: 18px;
    font-weight: 600;
    margin: 20px 0px 10px 0px;
    cursor: pointer;
    &:hover{
      transition: background-color 0.5s ease;
      background: lighten(#46BE8A, 10%);
    }
  }
}
</style>
