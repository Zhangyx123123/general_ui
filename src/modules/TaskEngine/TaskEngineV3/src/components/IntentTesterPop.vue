<template lang="html">
<div id="intent-tester-pop">
  <div class="intent-tester-title">
    <div>{{$t("task_engine_v3.intent_tester_pop.label_test_intent")}}</div>
  </div>
  <div class="intent-tester-box">
    <div class="label">{{$t("task_engine_v3.intent_tester_pop.label_intent_test_phrase")}}</div>
    <div class="row-container">
      <input v-model="testPhrase" :placeholder="$t('task_engine_v3.intent_tester_pop.placeholder_user_says')"></input>
      <button class="btn-basic btn-white" @click="">{{$t("task_engine_v3.intent_tester_pop.button_start_to_predict")}}</button>
    </div>
    <div class="label">{{$t("task_engine_v3.intent_tester_pop.label_intent_predict_result")}}</div>
    <div class="row-container">
      <input v-model="intentName" readonly class="predicted-intent"></input>
      <button class="btn-basic btn-white btn-hidden" @click=""></button>
    </div>
    <button class="btn-basic btn-white btn-upload" @click="">{{$t("task_engine_v3.intent_tester_pop.button_upload_batch_phrases")}}</button>
  </div>
</div>
</template>

<script>
import i18nUtils from '../utils/i18nUtil';

export default {
  name: 'intent-tester-pop',
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
      testPhrase: '我想要请假',
      intentName: '申请休假',
    };
  },
  computed: {
  },
  watch: {
  },
  methods: {
  },
  beforeMount() {},
  mounted() {
    this.i18n = i18nUtils.getLocaleMsgs(this.$i18n);
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
@import "../scss/intentTesterPop.scss";
</style>
