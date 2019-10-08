<template lang="html">
<div id="condition-card">
  <div class="label-when" v-if="index==0">{{$t("task_engine_v3.condition_card.if")}}</div>
  <div class="label-when" v-if="index!=0">{{$t("task_engine_v3.condition_card.and")}}</div>  
  <dropdown-select
    class="select-target selector"
    ref="selectTarget"
    v-model="targetModel"
    :options="targetOptions"
    :fixedListWidth="false"
    width="160px"
    :placeholder="$t('general.please_choose')"
  />
  <dropdown-select
    v-if="needOperator"
    class="select-operator selector"
    ref="selectOperator"
    v-model="operatorModel"
    :options="operatorOptions"
    width="96px"
    :placeholder="$t('general.please_choose')"
  />
  <input
    v-if="needContent"
    class="input-content selector"
    type="text"
    v-model="condition.content"
  />
  <div class="button-delete-condition">
    <icon icon-type="delete" :enableHover="true" :size=20 @click="deleteThisCondition"/>
  </div>
</div>
</template>

<script>
import selectOptions from '../utils/selectOptions';

export default {
  name: 'condition-card',
  props: {
    initialCondition: {
      type: Object,
      required: true,
    },
    initialEntityCollectorList: {
      type: Array,
      required: true,
    },
    index: {
      type: Number,
    },
    version: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      condition: JSON.parse(JSON.stringify(this.initialCondition)),
      contextTargets: [],
      operators: [],
      operatorOptions: [],
    };
  },
  computed: {
    targetOptions() {
      let options = [];
      if (this.version === '2.0') {
        // append entity targets
        let entityOptions = this.entities.map(entity => ({
          text: entity.entityName,
          value: entity.entityName,
          inGroup: true,
        }));
        entityOptions = entityOptions.filter(option => option.text !== null);
        if (entityOptions.length > 0) {
          options.push(
            {
              text: this.$t('task_engine_v3.condition_card.target_type.entity'),
              isGroup: true,
            },
          );
          options = options.concat(entityOptions);
        }
        // append context targets
        options.push({
          text: this.$t('task_engine_v3.condition_card.target_type.context'),
          isGroup: true,
        });
        const contextOptions = this.contextTargets.map(contextTarget => ({
          text: contextTarget.displayText,
          value: contextTarget.name,
          inGroup: true,
        }));
        options = options.concat(contextOptions);
      } else if (this.version === '1.1') {
        // append entity targets
        let entityOptions = this.entities.map(entity => ({
          text: `${entity.text}：${entity.value}`,
          value: entity.value,
          inGroup: true,
        }));
        entityOptions = entityOptions.filter(option => option.text !== null);
        if (entityOptions.length > 0) {
          options.push(
            {
              text: this.$t('task_engine_v3.condition_card.target_type.entity'),
              isGroup: true,
            },
          );
          options = options.concat(entityOptions);
        }
      }
      return options;
    },
    targetModel: {
      get() {
        return [this.condition.target.name];
      },
      set(newSelected) {
        const contextTarget = this.contextTargets.find(target => newSelected[0] === target.name);
        if (contextTarget !== undefined) {
          this.condition.target = contextTarget;
          return;
        }
        this.condition.target = {
          displayText: newSelected[0],
          type: 'entity',
          name: newSelected[0],
        };
      },
    },
    operatorModel: {
      get() {
        const value = this.composeOperatorValue(this.condition.comparisonOperator);
        return [value];
      },
      set(newSelected) {
        this.condition.comparisonOperator = this.operators.find((operator) => {
          const value = this.composeOperatorValue(operator);
          return value === newSelected[0];
        });
      },
    },
    needOperator() {
      return this.condition.target.type === 'entity';
    },
    needContent() {
      return this.condition.comparisonOperator.needContent;
    },
    entities() {
      return JSON.parse(JSON.stringify(this.initialEntityCollectorList));
    },
  },
  watch: {
    condition: {
      handler() {
        this.$emit('update', this.condition);
      },
      deep: true,
    },
    targetOptions: {
      handler() {
        this.$refs.selectTarget.$emit('updateOptions', this.targetOptions);
      },
      deep: true,
    },
  },
  methods: {
    deleteThisCondition() {
      this.$emit('deleteConditionButtonClick');
    },
    composeOperatorValue(operator) {
      const compare = operator.compare || '';
      return `${operator.functionName}_${compare}`;
    },
  },
  activated() {},
  beforeMount() {
    this.operators = selectOptions.getOperators.call(this);
    this.operators.forEach((operator) => {
      this.operatorOptions.push({
        text: operator.displayText,
        value: this.composeOperatorValue(operator),
      });
    });
    this.contextTargets = selectOptions.getContextTargets.call(this);
  },
  mounted() {
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
#condition-card{
  display: flex;
  flex-direction: row;
  margin-top: 10px;
  align-items: center;
  .label-when{
    width: 28px;
    height: 28px;
    font-size: 14px;
    line-height: 28px;
    color: $color-font-normal;
  }
  .selector{
    height: 28px;
    margin-right: 10px;
  }
  .select-target{
    margin-left: 15px;
  }
  .select-operator{
  }
  .input-content{
    width: 144px;
  }

  .button-delete-condition{
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
