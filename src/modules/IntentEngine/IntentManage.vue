<template>
<div id="intent-manage">
  <div class="loading-container card w-fill h-fill" v-if="isTraining===true||isTesting===true">
    <template v-if="isTraining">
      <loading-line></loading-line>
      <div class="loading-msg"> {{$t('intent_engine.is_training')}}</div>
    </template>
    <template v-if="isTesting">
      <loading-line></loading-line>
      <div class="loading-msg"> {{$t('intent_engine.is_testing')}}</div>
    </template>
  </div>
  <router-view></router-view>
</div>
</template>
<script>

import { mapState } from 'vuex';
import eventBus from './_utils/eventBus';

import IntentTrainPage from './_components/IntentTrainPage';
import IntentTestPage from './_components/IntentTestPage';
import IntentTestRecordListPage from './_components/IntentTestRecordListPage';
import IntentTestRecordPage from './_components/IntentTestRecordPage';

export default {
  path: 'intent-manage',
  privCode: 'intent_manage',
  displayNameKey: 'intent_manage',
  name: 'intent-manage',
  components: {},
  childrenPath: [
    { path: '', component: IntentTrainPage },
    { path: 'test', component: IntentTestPage },
    { path: 'test/records', component: IntentTestRecordListPage },
    { path: 'test/record/:id', component: IntentTestRecordPage },
  ],
  data() {
    return {
      eventBus: eventBus.eventBus,
    };
  },
  computed: {
    ...mapState('intentTrain-module', {
      isTraining: 'isTraining',
    }),
    ...mapState('intentTest-module', {
      isTesting: 'isTesting',
    }),
  },
  watch: {},
  methods: {},
  mounted() {
    const that = this;
    this.eventBus.$on('startLoading', (msg, type = 'dot') => {
      that.$emit('startLoading', msg, type);
    });
    this.eventBus.$on('endLoading', () => {
      that.$emit('endLoading');
    });
  },
};
</script>

<style lang="scss" scoped>
#intent-manage{
  .loading-container{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    @include font-14px();
    color: $color-font-mark;
    .loading-msg {
      margin-top: 20px;
    }
  }
}
</style>
