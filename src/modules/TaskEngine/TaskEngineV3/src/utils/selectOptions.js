

export default {
  // context target options used in ConditionCard.vue
  getContextTargets() {
    return [
      {
        displayText: this.$t('task_engine_v3.condition_card.context_targets.on_complete'),
        type: 'context',
        name: 'on_complete',
      },
      {
        displayText: this.$t('task_engine_v3.condition_card.context_targets.on_cancel'),
        type: 'context',
        name: 'on_cancel',
      },
      {
        displayText: this.$t('task_engine_v3.condition_card.context_targets.on_transfer_to_manual'),
        type: 'context',
        name: 'on_transfer_to_manual',
      },
      {
        displayText: this.$t('task_engine_v3.condition_card.context_targets.on_parse_fail'),
        type: 'context',
        name: 'on_parse_fail',
      },
    ];
  },
  // target operator options used in ConditionCard.vue
  getOperators() {
    return [
      {
      // 存在
        displayText: this.$t('task_engine_v3.condition_card.operators.present'),
        functionName: 'contain_key',
        source: 'global_info',
        needContent: false,
      },
      {
      // 不存在
        displayText: this.$t('task_engine_v3.condition_card.operators.not_present'),
        functionName: 'not_contain_key',
        source: 'global_info',
        needContent: false,
      },
      {
      // 包含
        displayText: this.$t('task_engine_v3.condition_card.operators.contain'),
        functionName: 'value_contains',
        source: 'global_info',
        needContent: true,
      },
      {
      // 不包含
        displayText: this.$t('task_engine_v3.condition_card.operators.not_contain'),
        functionName: 'value_not_contains',
        source: 'global_info',
        needContent: true,
      },
      {
      // 大于
        displayText: this.$t('task_engine_v3.condition_card.operators.greater_than'),
        functionName: 'key_val_match',
        source: 'global_info',
        needContent: true,
        compare: '>',
      },
      {
      // 小于
        displayText: this.$t('task_engine_v3.condition_card.operators.smaller_than'),
        functionName: 'key_val_match',
        source: 'global_info',
        needContent: true,
        compare: '<',
      },
      {
      // 等于
        displayText: this.$t('task_engine_v3.condition_card.operators.equal_to'),
        functionName: 'key_val_match',
        source: 'global_info',
        needContent: true,
        compare: '==',
      },
      {
      // 不等于
        displayText: this.$t('task_engine_v3.condition_card.operators.not_equal_to'),
        functionName: 'key_val_match',
        source: 'global_info',
        needContent: true,
        compare: '!=',
      },
      {
      // 属于
        displayText: this.$t('task_engine_v3.condition_card.operators.belong_to'),
        functionName: 'value_in',
        source: 'global_info',
        needContent: true,
      },
      {
      // 不属于
        displayText: this.$t('task_engine_v3.condition_card.operators.not_belong_to'),
        functionName: 'value_not_in',
        source: 'global_info',
        needContent: true,
      },
    ];
  },
};
