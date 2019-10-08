<template>
  <div>
    <div v-if="inAddQuestionState" id="pop-qa-add">
      <div class="row">
        <div class="row-title">{{ $t('statistics.add_new_std_question') }}</div>
        <input class="row-input" v-model.trim="newQuestion">
      </div>
      <div class="row">
        <div class="row-title">{{ $t('general.answer') }}</div>
        <input class="row-input" v-model.trim="newAnswer">
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
              <template v-else-if="markedQuestion !== ''">
                <div class="marked-q" ref="markedQ" v-tooltip="markedQuestionTooltip"
                  >
                  <div class="marked-tag" @mouseover="showFullMarkedQuestion" @mouseout="hideFullMarkedQuestion">
                    {{ markedQuestion }}
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
      <general-table
        id="mark-content"
        :tableHeader="tableHeader"
        :tableData="tableDataWithNewQuestion"
        :showEmptyMsg="emptyMsg"
        :onclickRow="setChosenQuestion"
        showEmpty
      >
      </general-table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import misc from '@/utils/js/misc';
import event from '@/utils/js/event';
import api from '../_api/selflearn';
import ssmAPI from '../_api/ssm';

export default {
  api: [api, ssmAPI],
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
      appId: this.$cookie.get('appid'),
      qa: [],  // prop value.qa
      keyword: '',
      markedQuestion: '',
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
          key: 'question',
          text: this.$t('statistics.recommend_question'),
        },
      ],
      tableData: [],
      recommendQuestion: [],
      noRecommendMsg: [
        this.$t('statistics.recommend_empty_msg_1'),
        this.$t('statistics.recommend_empty_msg_2'),
      ],
      noSearchResultMsg: [
        this.$t('statistics.search_empty_msg'),
      ],
      emptyMsg: this.noRecommendMsg,
      markedQuestionTooltip: {
        msg: '',
        eventOnly: true,
        alignLeft: true,
      },

      inAddQuestionState: false,
      newQuestion: '',
      newAnswer: '',
    };
  },
  computed: {
    ...mapGetters([
      'robotID',
      'userID',
    ]),
    tableDataWithNewQuestion() {
      const that = this;
      const ret = [{
        onelineCommand: true,
        align: 'question',
        text: this.$t('statistics.add_new_std_question'),
        action: () => {
          that.inAddQuestionState = true;
        },
      }];
      ret.push(...this.tableData);
      return ret;
    },
    canAddNewQuestion() {
      return this.newQuestion !== '' && this.newAnswer !== '';
    },
  },
  watch: {
    canAddNewQuestion(val) {
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
      that.markedQuestionTooltip.msg = that.markedQuestion;
      that.$refs.markedQ.dispatchEvent(event.createEvent('tooltip-reload'));
      that.$refs.markedQ.dispatchEvent(event.createEvent('tooltip-show'));
    },
    hideFullMarkedQuestion(e) {
      const that = this;
      if (!misc.isEllipsisActive(e.target)) return;
      that.$refs.markedQ.dispatchEvent(event.createEvent('tooltip-hide'));
    },
    toggleHasMultiOriginMarks() {
      this.hasMultiOriginMarks = false;
    },
    cancelMarkedQuestion() {
      const emptyMarkedQuestion = '';
      this.updateMarkedIcon(emptyMarkedQuestion);
      this.$emit('enableOK');
    },
    setChosenQuestion(datarow) {
      const that = this;
      const chosenQuestion = datarow.question;
      that.updateMarkedIcon(chosenQuestion);
      that.$emit('enableOK');
    },
    updateTableEmptyMsg(msg) {
      this.emptyMsg = msg;
    },
    updateMarkedIcon(chosenQ) {
      const that = this;
      if (that.hasMultiOriginMarks) {
        that.toggleHasMultiOriginMarks();
      }
      const oldMarkedQIdx = that.tableData.findIndex(data => data.question === that.markedQuestion);
      if (oldMarkedQIdx !== -1) {
        that.tableData.splice(oldMarkedQIdx, 1, {
          question: that.markedQuestion,
        });
      }

      that.markedQuestion = chosenQ;
      const newMarkedQIdx = that.tableData.findIndex(data => data.question === that.markedQuestion);
      if (newMarkedQIdx !== -1) {
        that.tableData.splice(newMarkedQIdx, 1, {
          question: that.markedQuestion,
          icon: that.checkIcon,
        });
      }
    },
    searchKeyword() {
      const that = this;
      if (that.keyword === '') {
        that.tableData = that.recommendQuestion;
        that.updateMarkedIcon(that.markedQuestion);
        that.updateTableEmptyMsg(that.noRecommendMsg);
      } else {
        that.$api.searchStdQuestion(that.appId, that.userID, that.keyword)
        .then((stdQuestion) => {
          if (stdQuestion) {
            that.tableData = stdQuestion.map(q => ({
              question: q.content,
            }));
          } else {
            that.tableData = [];
          }
          that.updateMarkedIcon(that.markedQuestion);
          that.updateTableEmptyMsg(that.noSearchResultMsg);
        })
        .catch((err) => {
          console.log({ err });
          that.tableData = [];
          that.updateMarkedIcon(that.markedQuestion);
          that.updateTableEmptyMsg(that.noSearchResultMsg);
        })
        .finally(() => {
          that.keywordTimer = undefined;
        });
      }
    },
    resetAddingQuestion() {
      this.inAddQuestionState = false;
      this.newQuestion = '';
      this.newAnswer = '';
    },
    validate() {
      const that = this;

      if (that.inAddQuestionState) {
        that.$api.addStdQuestion(that.robotID, that.userID, that.newQuestion, that.newAnswer)
        .then((res) => {
          if (res.code < 0) {
            let msg = res.message;
            if (res.code === -9) {
              msg = that.$t('statistics.std_question_exists');
            }
            that.$notifyFail(msg);
            return;
          }
          that.tableData.unshift({
            question: that.newQuestion,
          });
          that.updateMarkedIcon(that.newQuestion);
          that.updateTableEmptyMsg(that.noSearchResultMsg);
          that.resetAddingQuestion();
        });
        return;
      }

      if (that.hasMultiOriginMarks) {
        that.$notifyFail(that.$t('statistics.error.multi_origin_mark_fail'));
        return;
      }
      that.value.markedQuestion = that.markedQuestion;
      that.$emit('validateSuccess', that.value);
    },
    validateCancel() {
      const that = this;
      if (that.inAddQuestionState) {
        that.resetAddingQuestion();
        return;
      }

      that.$emit('cancelValidateSuccess');
    },
    getOriginMark() {
      const that = this;
      const markedCount = that.qa.filter(q => q.is_marked).length;
      if (that.qa.length > 1) {
        if (markedCount > 0) {
          that.hasMultiOriginMarks = true;
        }
      } else if (markedCount > 0) {  // only one qa
        that.$api.getMarkedQuestion(that.qa[0].id)
        .then((question) => {
          if (question === '') {
            that.markedQuestion = '';
            that.$notifyFail(that.$t('statistics.error.not_marked_anymore'));
          } else {
            that.markedQuestion = question;
            that.updateMarkedIcon(that.markedQuestion);
          }
        }).catch((err) => {
          if (err.response.status === 400) {
            that.$notifyFail(that.$t('statistics.error.not_marked_anymore'));
          }
          that.markedQuestion = '';
        });
      }
    },
  },
  beforeMount() {
    const that = this;
    that.qa = that.value.qa;
    that.markedQuestion = that.value.markedQuestion;
  },
  mounted() {
    const that = this;

    const sentences = that.qa.map(q => q.user_q);
    that.$api.getRecommend(that.appId, that.userID, sentences)
    .then((recommend) => {
      if (recommend) {
        that.recommendQuestion = recommend.map(r => ({
          question: r.answer,
        }));
      } else {
        that.recommendQuestion = [];
      }
      that.tableData = that.recommendQuestion;
      that.updateTableEmptyMsg(that.noRecommendMsg);
    })
    .catch((err) => {
      console.log({ err });
      that.recommendQuestion = [];
      that.tableData = that.recommendQuestion;
      that.updateTableEmptyMsg(that.noRecommendMsg);
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
}
</style>
