<template>
  <div>
    <div v-if="inAddIntentStatus" id="pop-qa-add">
      <div class="row">
        <div class="row-title">{{ $t('statistics.add_new_intent') }}</div>
        <input class="row-input" v-model="newIntent">
      </div>
    </div>
    <div v-else id="pop-qa-mark">
      <div id="mark-header">
        <div class="toolbar-row">
          <div class="toolbar-left">
            <div class="row-title">
              {{ $t('statistics.user_question') }}：
            </div>
            <div class="row-content">
              {{ qa[0].user_q }}
              <span v-if="qa.length > 1">, ...</span>
            </div>
          </div>
        </div>
        <div class="toolbar-row">
          <div class="toolbar-left">
            <div class="row-title">
              {{ $t('statistics.mark.as') }}：
            </div>
            <div class="row-content">
              <template v-if="hasMultiOriginMarks">
                <div class="marked-q">
                  {{ $t('statistics.mark.multi') }}
                  <icon icon-type="close" :size="8" id="delete-tag" @click="toggleHasMultiOriginMarks" button></icon>
                </div>
              </template>
              <template v-else-if="markedIntent !== -1">
                <div class="marked-q" ref="markedIntent" v-tooltip="markedQuestionTooltip" v-if="selectedIntent !== undefined">
                  <div class="marked-tag" @mouseover="showFullMarkedQuestion" @mouseout="hideFullMarkedQuestion">
                    {{ selectedIntent }}
                  </div>
                  <icon icon-type="close" :size="8" id="delete-tag" @click="cancelMarkedQuestion" button></icon>
                </div>
              </template>
              <template v-else>
                {{ $t('general.empty') }}
              </template>
              <div class="toolbar-middle"><!--fill empty space--></div>
            </div>
          </div>
          <div class="toolbar-right">
            <search-input v-model="keyword"></search-input>
          </div>
        </div>
      </div>
      <div id="mark-content">
        <div class="header row">
          <div class="icon"></div>
          <div class="name">{{ $t('general.intent') }}</div>
        </div>
        <!-- <div class="row">
          <div class="icon"></div>
          <div class="name new" @click="inAddIntentStatus = true">
            {{this.$t('statistics.add_new_intent'),}}
          </div>
        </div> -->
        <div v-for="data in tableData" :key="data.id" @click="setChosenIntent(data)" class="row">
          <div class="icon">
            <icon v-if="data.icon" :icon-type="data.icon.iconType" :size="data.icon.iconSize" />
          </div>
          <div class="name">{{data.name}}</div>
          <div class="choose">
            <template v-if="data.icon">
              <div class="description">
                {{ $t('statistics.choose_sentence_type') }}
              </div>
              <div>
                <input type="radio" name="sentence-type" value="0" v-model="sentenceType">
                {{ $t('intent_engine.manage.positive') }}</div>
              <div>
                <input type="radio" name="sentence-type" value="1" v-model="sentenceType">
                {{ $t('intent_engine.manage.negative') }}</div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import misc from '@/utils/js/misc';
import event from '@/utils/js/event';
import api from '../_api/selflearn';
import ssmAPI from '../_api/ssm';
import intentAPI from '../_api/intent';

export default {
  api: [api, ssmAPI, intentAPI],
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      qa: [],  // prop value.qa
      keyword: '',
      hasMultiOriginMarks: false,
      keywordTimer: undefined,
      checkIcon: {
        iconType: 'check_green',
        iconSize: 20,
      },
      tableHeader: [
        {
          key: 'icon',
          text: '',
          type: 'icon',
        },
        {
          key: 'name',
          text: this.$t('general.intent'),
        },
      ],
      tableData: [],
      noIntentMsg: [
        this.$t('statistics.recommend_empty_msg_1'),
        this.$t('statistics.recommend_empty_msg_2'),
      ],
      noSearchResultMsg: [
        this.$t('statistics.search_empty_msg'),
      ],
      emptyMsg: this.noIntentMsg,
      markedQuestionTooltip: {
        msg: '',
        eventOnly: true,
        alignLeft: true,
      },

      inAddIntentStatus: false,
      newQuestion: '',
      newAnswer: '',

      markedIntent: -1,
      newIntent: '',
      intents: [],
      intentMap: {},
      sentenceType: 0,
    };
  },
  computed: {
    ...mapGetters([
      'robotID',
      'userID',
    ]),
    selectedIntent() {
      return this.intentMap[this.markedIntent];
    },
    canAddNewIntent() {
      return this.newIntent !== '';
    },
  },
  watch: {
    canAddNewIntent(val) {
      if (val) {
        this.$emit('enableOK');
      }
    },
    keyword() {
      const that = this;
      if (that.keywordTimer !== undefined) {
        clearTimeout(that.keywordTimer);
        that.keywordTimer = undefined;
      }
      that.keywordTimer = setTimeout(that.searchKeyword, 300);
    },
  },
  methods: {
    showFullMarkedQuestion(e) {
      const that = this;
      if (!misc.isEllipsisActive(e.target)) return;
      that.markedQuestionTooltip.msg = that.intentMap[that.markedIntent];
      that.$refs.markedIntent.dispatchEvent(event.createEvent('tooltip-reload'));
      that.$refs.markedIntent.dispatchEvent(event.createEvent('tooltip-show'));
    },
    hideFullMarkedQuestion(e) {
      const that = this;
      if (!misc.isEllipsisActive(e.target)) return;
      that.$refs.markedIntent.dispatchEvent(event.createEvent('tooltip-hide'));
    },
    toggleHasMultiOriginMarks() {
      this.hasMultiOriginMarks = false;
    },
    cancelMarkedQuestion() {
      const emptyMarkedIntentID = -1;
      this.updateMarkedIcon(emptyMarkedIntentID);
      this.$emit('enableOK');
    },
    setChosenIntent(datarow) {
      const that = this;
      const chosenIntent = datarow.id;
      that.updateMarkedIcon(chosenIntent);
      that.$emit('enableOK');
    },
    updateTableEmptyMsg(msg) {
      this.emptyMsg = msg;
    },
    updateMarkedIcon(chosenIntent) {
      const that = this;
      if (that.hasMultiOriginMarks) {
        that.toggleHasMultiOriginMarks();
      }
      const oldMarkedQIdx = that.tableData.findIndex(data => data.id === that.markedIntent);
      if (oldMarkedQIdx !== -1) {
        that.tableData.splice(oldMarkedQIdx, 1, {
          id: that.markedIntent,
          name: that.intentMap[that.markedIntent],
        });
      }

      that.markedIntent = chosenIntent;
      const newMarkedQIdx = that.tableData.findIndex(data => data.id === that.markedIntent);
      if (newMarkedQIdx !== -1) {
        that.tableData.splice(newMarkedQIdx, 1, {
          id: that.markedIntent,
          name: that.intentMap[that.markedIntent],
          icon: that.checkIcon,
        });
      }
    },
    searchKeyword() {
      const that = this;
      if (that.keyword === '') {
        that.tableData = that.intents;
        that.updateMarkedIcon(that.markedIntent);
        that.updateTableEmptyMsg(that.noIntentMsg);
      } else {
        const filteredIntent = that.intents.filter(intent =>
          intent.name.indexOf(that.keyword) >= 0);
        that.tableData = filteredIntent;
        that.updateMarkedIcon(that.markedIntent);
        that.updateTableEmptyMsg(that.noIntentMsg);
        that.keywordTimer = undefined;
      }
    },
    resetAddingIntent() {
      this.inAddIntentStatus = false;
      this.newIntent = '';
    },
    validate() {
      const that = this;

      if (that.inAddIntentStatus) {
        const idx = that.intents.findIndex(intent => intent.name === that.newIntent);
        if (idx >= 0) {
          that.markedIntent = that.intents[idx].id;
        }
        // that.$api.addStdQuestion(that.robotID, that.newQuestion, that.newAnswer)
        // .then(() => {
        //   that.tableData.unshift({
        //     question: that.newQuestion,
        //   });
        //   that.updateMarkedIcon(that.newQuestion);
        //   that.updateTableEmptyMsg(that.noSearchResultMsg);
        //   that.resetAddingIntent();
        // })
        // .catch((err) => {
        //   if (err.error_code === -12) {
        //     that.$notifyFail(that.$t('statistics.std_question_exists'));
        //   }
        // });
        // return;
      }

      if (that.hasMultiOriginMarks) {
        that.$notifyFail(that.$t('statistics.error.multi_origin_mark_fail'));
        return;
      }
      that.value.markedIntent = that.markedIntent;
      that.value.positive = that.sentenceType === 0;
      that.$emit('validateSuccess', that.value);
    },
    validateCancel() {
      const that = this;
      if (that.inAddIntentStatus) {
        that.resetAddingIntent();
        return;
      }

      that.$emit('cancelValidateSuccess');
    },
    getOriginMark() {
      const that = this;
      const markedCount = that.qa.filter(q => q.marked_intent !== '').length;
      if (that.qa.length > 1) {
        if (markedCount > 0) {
          that.hasMultiOriginMarks = true;
        }
      } else if (markedCount > 0) {  // only one qa
        that.$api.getMarkedIntent(that.qa[0].id)
        .then((intentInfo) => {
          if (intentInfo.id === -1) {
            that.markedIntent = -1;
            that.$notifyFail(that.$t('statistics.error.not_marked_anymore'));
          } else {
            that.markedIntent = intentInfo.id;
            that.sentenceType = intentInfo.positive ? 0 : 1;
            that.updateMarkedIcon(that.markedIntent);
          }
        }).catch(() => {
          if (that.qa[0].marked_intent !== undefined) {
            that.$notifyFail(that.$t('statistics.error.not_marked_anymore'));
          }
          that.markedIntent = -1;
        });
      }
    },
  },
  beforeMount() {
    const that = this;
    that.qa = that.value.qa;
    that.markedIntent = that.value.markedIntent;
  },
  mounted() {
    const that = this;

    that.$api.getIntents().then((intents) => {
      that.intents = intents.map(intent => ({
        name: intent.name,
        id: intent.id,
      }));
      that.intentMap = {};
      that.intents.forEach((intent) => {
        that.intentMap[intent.id] = intent.name;
      });
      that.tableData = that.intents;
    })
    .catch((err) => {
      console.log({ err });
      that.intents = [];
      that.tableData = that.intents;
      that.updateTableEmptyMsg(that.noIntentMsg);
    })
    .finally(() => {
      that.getOriginMark();
    });

    that.$on('validate', that.validate);
    that.$on('cancelValidate', that.validateCancel);
    that.$emit('disableOK');
  },
};
</script>

<style lang="scss" scoped>
#pop-qa-mark {
  width: 768px;
  height: 378px;
  display: flex;
  flex-direction: column;
}
#pop-qa-add {
  width: 450px;
  height: 80px;
  display: flex;
  flex-direction: column;

  .row {
    margin-right: 20px;
    margin-left: 20px;
    display: flex;
    align-items: center;

    &:not(:first-child) {
      margin-top: 10px;
    }

    .row-title {
      flex: 0 0 80px;
      margin-right: 10px;
    }
    .row-input {
      display: block;
      flex: 1;
    }
  }
}

#mark-header {
  padding: 0 24px;
  @include font-14px();
  .toolbar-row {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .toolbar-left {
      flex: 1;
      display: flex;
      align-items: center;
      overflow: hidden;
      .row-title {
        flex: 0 0 80px;
      }
      .row-content {
        overflow: hidden;
        .marked-q {
          background-color: #eeeeee; 
          padding: 3px 6px;
          border-radius: 2px;
          display: flex;
          align-items: center;
          overflow: hidden;
          .marked-tag {
            flex: 0 1 500px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          #delete-tag {
            margin-left: 5px;
          }
        }
      }
    }
    .toolbar-right {
      flex: 0 0 160px;
      margin-left: 10px;
    }
  }
  
}
#mark-content {
  margin-top: 10px;
  flex: 1;
  border-bottom: 1px solid $color-borderline;

  display: flex;
  flex-direction: column;
  overflow: auto;
  @include auto-overflow();

  .header {
    box-shadow: inset 0 -1px 0 0 #e9e9e9;
    background-color: #f7f7f7;
  }
  .row {
    @include font-14px();
    @include click-button();
    padding: 0 20px;
  
    flex: 0 0 50px;
    display: flex;
    align-items: center;

    .icon {
      flex: 0 0 50px;
      display: flex;
      justify-content: center;
    }
    .name {
      flex: 1;
      &.new {
        color: #1875f0;
      }
    }
    .choose {
      flex: 0 0 auto;
      display: flex;

      .description {
        margin-right: 12px;
      }
    }
  }
}
</style>
