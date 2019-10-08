<template>
<div id="side-panel">
  <div class="title">
    {{$t('intent_engine.side_panel.intent_train')}}
  </div>
  <div class="info" style="margin-top: 10px;">
    {{$t('intent_engine.side_panel.intent_train_info')}}
  </div>
  <div class="test-btn-container"
    v-tooltip="trainBtnTooltip"
    @mouseenter="showTrainBtnTooltip($event)"
    @mouseleave="hideTrainBtnTooltip($event)">
    <text-button class="button" style="margin-top: 10px;"
      :button-type="canTrain ? 'default' : 'disable'"
      :height="'40px'"
      @click="startTraining()">
      {{$t('intent_engine.side_panel.do_train')}}
    </text-button>
  </div>
  <div class="train-records">
    <div class="model">
      <div v-if="recentModels.length===0">
        {{$t('intent_engine.test_data.result_none')}}
      </div>
      <template v-for="(model, index) in recentModels">
        <div v-if="index===0"  :key="model.ie_model_id">
          {{`${$t('intent_engine.side_panel.last_success_train')}: ${model.trainDatetimeStr}`}}
        </div>
        <div v-if="index!==0 && showRecentTrainRecords"  :key="model.ie_model_id">
          {{`${$t('intent_engine.side_panel.success_train_record')}: ${model.trainDatetimeStr}`}}
        </div>
      </template>
    </div>
    <template v-if="recentModels.length > 1">
      <div class="link" v-if="showRecentTrainRecords===false" @click="showRecentTrainRecords=true">
        {{$t('intent_engine.side_panel.show_train_records')}}
      </div>
      <div class="link" v-if="showRecentTrainRecords===true" @click="showRecentTrainRecords=false">
        {{$t('intent_engine.side_panel.hide_train_records')}}
      </div>
    </template>
  </div>
  <div class="title" style="margin-top: 20px;">
    {{$t('intent_engine.side_panel.intent_test')}}
  </div>
  <div class="info" style="margin-bottom: 10px; margin-top: 10px;">
    {{$t('intent_engine.side_panel.intent_test_info')}}
  </div>
  <div class="hint" v-if="hasEmptyTestCorpus">
    {{$t('intent_engine.side_panel.edit_intent_test_corpus_hint')}}
  </div>
  <template v-if="mode==='trainPage'">
    <text-button class="button" :height="'40px'" @click="toPage('test')">
      {{$t('intent_engine.side_panel.go_to_intent_test')}}
    </text-button>
  </template>
  <template v-if="mode==='testPage'">
    <div class="test-btn-container"
      v-tooltip="testBtnTooltip"
      @mouseenter="showTestBtnTooltip($event)"
      @mouseleave="hideTestBtnTooltip($event)">
      <text-button class="button"
        :button-type="canTest ? 'primary' : 'disable'"
        :height="'40px'"
        @click="startTesting()">
        {{$t('intent_engine.side_panel.do_test')}}
      </text-button>
    </div>
  </template>
  <div class="link" @click="toPage('test/records')" style="margin-top: 10px;">
    {{$t('intent_engine.side_panel.go_to_intent_test_records')}}
  </div>
</div>
</template>
<script>

import { mapState, mapGetters, mapMutations } from 'vuex';
import event from '@/utils/js/event';
import intentApi from '../_api/intent';
import intentTestApi from '../_api/intentTest';
import eventBus from '../_utils/eventBus';
import general from '../_utils/general';
import DoIntentTestPop from './DoIntentTestPop';

const TRAIN_STATUS = {
  NOT_TRAINED: 'NOT_TRAINED',
  TRAINING: 'TRAINING',
  TRAINED: 'TRAINED',
  NEED_TRAIN: 'NEED_TRAIN',
  TRAIN_FAILED: 'TRAIN_FAILED',
};

const TEST_STATUS = {
  TESTING: 0,
  TESTED: 1,
  TEST_FAILED: 2,
  NEED_TEST: 3,
  PENDING: 4,
};

export default {
  name: 'side-panel',
  intentApi,
  intentTestApi,
  components: {},
  props: {
    mode: {
      type: String,
      required: false,
      default: () => 'trainPage',
    },
  },
  data() {
    return {
      models: [],
      trainStatus: undefined,
      trainStatusIntervalId: undefined,
      testStatus: undefined,  // type: TEST_STATUS
      testStatusIntervalId: undefined,
      eventBus: eventBus.eventBus,
      showRecentTrainRecords: false,
      beforeDestroy: false,
      trainBtnTooltip: {
        msg: this.$t('intent_engine.side_panel.tooltip.intent_and_corpus_unchanged'),
        alignLeft: true,
        eventOnly: true,
      },
      testBtnTooltip: {
        msg: this.$t('intent_engine.side_panel.tooltip.intent_test_is_empty'),
        alignLeft: true,
        eventOnly: true,
      },
    };
  },
  watch: {},
  computed: {
    ...mapGetters('intentTrain-module', {
      hasTrainIntents: 'hasIntents',
    }),
    ...mapState('intentTest-module', {
      testIntentList: 'intentList',
    }),
    ...mapGetters('intentTest-module', {
      testCorpusCounts: 'corpusCounts',
      hasEmptyTestCorpus: 'hasEmptyCorpus',
    }),
    canTrain() {
      return this.shouldTrain && this.hasTrainIntents;
    },
    shouldTrain() {
      return this.trainStatus === TRAIN_STATUS.NOT_TRAINED ||
             this.trainStatus === TRAIN_STATUS.NEED_TRAIN ||
             this.trainStatus === TRAIN_STATUS.TRAIN_FAILED;
    },
    canTest() {
      // return this.shouldTest && this.testCorpusCounts > 0 && this.uniqueModels.length > 0;
      return this.testCorpusCounts > 0 && this.uniqueModels.length > 0;
    },
    shouldTest() {
      return this.testStatus === TEST_STATUS.NEED_TEST ||
             this.testStatus === TRAIN_STATUS.TEST_FAILED;
    },
    recentModels() {
      if (this.models.recent_trained) {
        return this.models.recent_trained.map(model => ({
          ...model,
          trainDatetimeStr: general.timestampToDatetimeString(model.train_time),
        }));
      }
      return [];
    },
    uniqueModels() {
      const keyOrder = ['recent_trained', 'recent_tested', 'recent_saved'];
      const uniqueIds = {};
      const uniqueModels = [];
      if (this.models.in_used) {
        uniqueIds[this.models.in_used.ie_model_id] = 1;
        uniqueModels.push(
          {
            ...this.models.in_used,
            trainDatetimeStr: general.timestampToDatetimeString(this.models.in_used.train_time),
          },
        );
      }
      for (let i = 0; i < keyOrder.length; i += 1) {
        const models = this.models[keyOrder[i]];
        if (models && models.length > 0) {
          models.forEach((model) => {
            if (uniqueIds[model.ie_model_id] === undefined) {
              uniqueIds[model.ie_model_id] = 1;
              uniqueModels.push(
                {
                  ...model,
                  trainDatetimeStr: general.timestampToDatetimeString(model.train_time),
                },
              );
            }
          });
        }
      }
      return uniqueModels;
    },
  },
  methods: {
    ...mapMutations('intentTrain-module', {
      setIsTraining: 'setIsTraining',
    }),
    ...mapMutations('intentTest-module', {
      setIsTesting: 'setIsTesting',
      setLastPath: 'setLastPath',
    }),
    getModels() {
      intentTestApi.getModels.call(this).then((data) => {
        // console.log(data);
        this.models = data;
      });
    },
    startTraining() {
      if (!this.canTrain) return;
      const that = this;
      const option = {
        data: {
          msg: that.$t('intent_engine.side_panel.start_train_warning'),
        },
        callback: {
          ok: () => {
            that.setIsTraining(true);
            intentApi.startTraining.call(this).then(() => {
              that.trainStatus = TRAIN_STATUS.TRAINING;
            });
          },
        },
      };
      that.$popWarn(option);
    },
    startTesting() {
      if (!this.canTest) return;
      const that = this;
      const popOption = {
        title: that.$t('intent_engine.side_panel.do_intent_test.title'),
        component: DoIntentTestPop,
        validate: true,
        extData: {
          models: this.uniqueModels,
          testIntentCount: this.testIntentList.length,
          testCorpusCounts: this.testCorpusCounts,
        },
        callback: {
          ok(modelId) {
            that.eventBus.$emit('startTesting');
            that.setIsTesting(true);
            intentTestApi.testIntentTestCorpus.call(that, modelId).then(() => {
              that.testStatus = TEST_STATUS.TESTING;
            });
          },
        },
      };
      this.$pop(popOption);
    },
    startPollingTrainStatus() {
      if (!this.trainStatusIntervalId && !this.beforeDestroy) {
        this.trainStatusIntervalId = setInterval(() => {
          this.pollTrainStatus();
        }, 5000);
      }
    },
    stopPollingTrainStatus() {
      clearInterval(this.trainStatusIntervalId);
      this.trainStatusIntervalId = undefined;
    },
    pollTrainStatus() {
      const that = this;
      intentApi.getTrainingStatus.call(this).then((data) => {
        that.trainStatusChanged(data.status);
      }).catch(() => {
        // console.error(err);
        that.setIsTraining(false);
      }).finally(() => {
        if (!that.trainStatusIntervalId && !that.beforeDestroy) {
          that.startPollingTrainStatus();
        }
      });
    },
    trainStatusChanged(newStatus) {
      const prevStatus = this.trainStatus;
      this.trainStatus = newStatus;
      if (prevStatus !== TRAIN_STATUS.TRAINING) { // run trainStatusChanged for the first time
        if (newStatus === TRAIN_STATUS.TRAINING) {
          this.setIsTraining(true);
        }
      }

      if (prevStatus === undefined) {
        if (newStatus !== TRAIN_STATUS.TRAINING) {
          this.setIsTraining(false);
        }
      } else if (prevStatus === TRAIN_STATUS.TRAINING) {
        if (newStatus === TRAIN_STATUS.TRAINED) {
          this.$notify({ text: this.$t('intent_engine.training_success') });
          this.getModels();
        } else if (status === TRAIN_STATUS.TRAIN_FAILED) {
          this.$notifyFail(this.$('intent_engine.training_fail'));
        }
        if (newStatus !== TRAIN_STATUS.TRAINING) {
          this.setIsTraining(false);
        }
      }
      // console.log('prevStatus');
      // console.log(prevStatus);
      // console.log('newStatus');
      // console.log(newStatus);
    },
    startPollingTestStatus() {
      if (!this.testStatusIntervalId && !this.beforeDestroy) {
        this.testStatusIntervalId = setInterval(() => {
          this.pollTestStatus();
        }, 5000);
      }
    },
    stopPollingTestStatus() {
      clearInterval(this.testStatusIntervalId);
      this.testStatusIntervalId = undefined;
    },
    pollTestStatus() {
      const that = this;
      intentTestApi.getTestStatus.call(this).then((data) => {
        // console.log(data);
        that.testStatusChanged(data.status);
      }).catch(() => {
        // console.error(err);
        that.setIsTesting(false);
      }).finally(() => {
        if (!that.testStatusIntervalId && !that.beforeDestroy) {
          that.startPollingTestStatus();
        }
      });
    },
    testStatusChanged(newStatus) {
      const prevStatus = this.testStatus;
      this.testStatus = newStatus;
      if (prevStatus !== TEST_STATUS.TESTING) { // run testStatusChanged for the first time
        if (newStatus === TEST_STATUS.TESTING) {
          this.setIsTesting(true);
        }
      }

      if (prevStatus === undefined) {
        if (newStatus !== TEST_STATUS.TESTING) {
          this.setIsTesting(false);
        }
      } else if (prevStatus === TEST_STATUS.TESTING) {
        if (newStatus === TEST_STATUS.TESTED) {
          this.$notify({ text: this.$t('intent_engine.side_panel.testing_success') });
        } else if (newStatus === TEST_STATUS.TEST_FAILED) {
          this.$notifyFail(this.$t('intent_engine.side_panel.testing_fail'));
        }
        if (newStatus !== TEST_STATUS.TESTING) {
          this.setIsTesting(false);
        }
      }
      // console.log('prevStatus');
      // console.log(prevStatus);
      // console.log('newStatus');
      // if (newStatus === TEST_STATUS.TESTING) {
      //   console.log('TEST_STATUS.TESTING');
      // } else if (newStatus === TEST_STATUS.TESTED) {
      //   console.log('TEST_STATUS.TESTED');
      // } else if (newStatus === TEST_STATUS.TEST_FAILED) {
      //   console.log('TEST_STATUS.TEST_FAILED');
      // } else if (newStatus === TEST_STATUS.NEED_TEST) {
      //   console.log('TEST_STATUS.NEED_TEST');
      // } else if (newStatus === TEST_STATUS.PENDING) {
      //   console.log('TEST_STATUS.PENDING');
      // }
    },
    toPage(path) {
      if (this.mode === 'trainPage') {
        this.setLastPath('train');
      } else if (this.mode === 'testPage') {
        this.setLastPath('test');
      }
      this.$router.push(`/intent-manage/${path}`);
    },
    showTrainBtnTooltip(e) {
      if (!this.canTrain) {
        e.target.dispatchEvent(event.createEvent('tooltip-show'));
      }
    },
    hideTrainBtnTooltip(e) {
      e.target.dispatchEvent(event.createEvent('tooltip-hide'));
    },
    showTestBtnTooltip(e) {
      if (this.testCorpusCounts === 0) {
        e.target.dispatchEvent(event.createEvent('tooltip-show'));
      }
    },
    hideTestBtnTooltip(e) {
      e.target.dispatchEvent(event.createEvent('tooltip-hide'));
    },
  },
  mounted() {
    this.getModels();
    this.pollTrainStatus();
    this.pollTestStatus();
  },
  beforeDestroy() {
    this.beforeDestroy = true;
    this.stopPollingTrainStatus();
    this.stopPollingTestStatus();
  },
};
</script>

<style lang="scss" scoped>
#side-panel{
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  width: 270px;
  height: 100%;
  border-left: 1px solid $color-borderline-disabled;
  padding: 20px 17px 20px 25px;
  overflow-y: scroll;
  @include customScrollbar();
  .title{
    @include font-16px-line-height-28px();
  }
  .info{
    @include font-14px();
  }
  .button{
    flex: 0 0 auto;
    @include font-14px-line-height-28px();
    cursor: pointer;
  }
  .test-btn-container{
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
  }
  .model{
    @include font-12px-line-height-28px();
    color: $color-font-mark;
  }
  .link{
    flex: 0 0 auto;
    @include font-12px-line-height-28px();
    color: $app-active-color;
    @include clickable-text();
  }
  .hint{
    @include font-12px-line-height-28px();
    color: $color-warning; 
  }
  .margin-bottom{
    margin-bottom: 10px;
  }
}
</style>
