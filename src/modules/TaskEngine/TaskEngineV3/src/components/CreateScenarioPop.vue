<template lang="html">
<div id="scenario-editor-pop">
  <div class="edit-title">{{$t("task_engine_v3.create_scenario_pop.label_name_the_scenario")}}</div>
  <div class="edit-data">
    <input ref="scenarioName" v-tooltip="noNameTooltip" v-model="scenarioName" :placeholder="$t('task_engine_v3.create_scenario_pop.placeholder_enter_scenario_name')" :class="{'error': isNoNameTooltipShown}"></input>
  </div>
</div>
</template>

<script>
import event from '@/utils/js/event';

export default {
  name: 'scenario-editor-pop',
  components: {
  },
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      i18n: {},
      scenarioName: this.value.scenarioName,
      noNameTooltip: {
        msg: this.$t('task_engine_v3.error_msg.please_enter_the_scenario_name'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      isNoNameTooltipShown: false,
    };
  },
  computed: {},
  watch: {
    scenarioName() {
      if (this.scenarioName.trim() !== '') {
        this.$refs.scenarioName.dispatchEvent(event.createEvent('tooltip-hide'));
        this.isNoNameTooltipShown = false;
      }
    },
  },
  methods: {
    validate() {
      this.scenarioName = this.scenarioName.trim();
      if (this.scenarioName === '') {
        this.$refs.scenarioName.dispatchEvent(event.createEvent('tooltip-reload'));
        this.$refs.scenarioName.dispatchEvent(event.createEvent('tooltip-show'));
        this.$refs.scenarioName.focus();
        this.isNoNameTooltipShown = true;
      } else {
        this.$emit('validateSuccess', this.scenarioName);
      }
    },
  },
  beforeMount() {
  },
  mounted() {
    this.$on('validate', this.validate);
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';
$row-height: $default-line-height;
@import "../scss/teVariable.scss";
@import "../scss/createScenarioPop.scss";
</style>
