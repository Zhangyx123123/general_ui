<template>
<div id="robot-profile">
  <div class="card w-fill h-fill">
    <div class="header">
      {{ $t('robot_setting.chat_info_desc', {name: robotName}) }}
    </div>
    <div class="qa-list">
      <div v-for="(robotQA, idx) in filterQAs" :key="idx"
        class="qa" :class="[robotQA.expand ? 'expand' : '']"
        @click="expandRobotQA(robotQA)">
        <template v-if="!robotQA.expand">
        <div class="robot-q row">
          <icon :size=24 icon-type="profile_question" />
          <div class="content">{{ robotQA.main_question }}</div>
        </div>
        <div class="robot-a row">
          <icon :size=24 icon-type="profile_answer" />
          <div class="content" v-if="robotQA.show_answer !== ''">{{ robotQA.show_answer }}</div>
          <div class="content" v-else>{{ $t("robot_setting.answer_empty") }}</div>
        </div>
        </template>
        <template v-else>
          <div class="card-header row">
            <div class="robot-q row">
              <icon :size=24 icon-type="profile_question" />
              <div class="content">{{ robotQA.main_question }}</div>
            </div>
            <div class="robot-a row">
              <icon :size=24 icon-type="profile_answer" />
              <input :placeholder="$t('robot_setting.input_qa_placeholder')"
                @compositionstart="compositionstart"
                @compositionend="compositionend"
                @keydown="handleKey($event, robotQA, robotQA.answers[0], 'answer')"
                @blur="resetShowAnswer(robotQA)"
                v-model="newAnswer" v-if="canEdit">
              <span v-else>{{ robotQA.show_answer }}</span>
            </div>
            <div class="close-button">
              <icon icon-type="info_close" :size=18 @click="closeQA($event, robotQA)"/>
            </div>
          </div>
          <div class="card-content row">
            <div class="robot-q column">
              <div class="title">{{ $t('robot_setting.similar_question') }}</div>
              <div class="list">
                <div class="list-row" v-for="relate in robotQA.relate_questions" :key="relate.id"
                  :class="[relate.editMode ? 'edit-row' : '']" @mouseover="setHover(relate, true)"
                  @mouseout="setHover(relate, false)">
                  <template v-if="relate.editMode !== true">
                  <div class="list-content">{{ relate.content }}</div>
                  <div class="command" v-if="canEdit && relate.isHover">
                    <div class="clickable edit"
                    @click="startEdit(relate)">{{ $t('general.edit') }}</div>
                    <div class="clickable delete"
                    @click="deleteQuestion(robotQA, relate)">{{ $t('general.delete') }}</div>
                  </div>
                  </template>
                  <template v-else>
                    <input class="edit-input" ref="editInput" v-model="updateValue"
                    @blur="cancelEdit(relate)"
                    @keydown="handleKey($event, robotQA, relate, 'question')">
                  </template>
                </div>
                <div class="list-row add-row" v-if="canEdit">
                  <input
                  @compositionstart="compositionstart"
                  @compositionend="compositionend"
                  @keydown="handleKey($event, robotQA, undefined, 'question')"
                  :placeholder="$t('robot_setting.input_q_ext_placeholder')" v-model="newQuestion">
                  <text-button button-type="primary"
                  @click="addSimilaryQuestion(robotQA)">{{ $t('general.add') }}</text-button>
                </div>
              </div>
            </div>
            <div class="robot-a column" v-if="robotQA.answers.length > 0">
              <div class="title">{{ $t('robot_setting.extend_answer') }}</div>
              <div class="list">
                <div class="list-row" v-for="answer in robotQA.answers.slice(1)" :key="answer.id"
                  :class="[answer.editMode ? 'edit-row' : '']"
                  @mouseover="setHover(answer, true)"
                  @mouseout="setHover(answer, false)">
                  <template v-if="answer.editMode !== true">
                  <div class="list-content">{{ answer.content }}</div>
                  <div class="command" v-if="canEdit && answer.isHover">
                    <div class="clickable edit"
                    @click="startEdit(answer)">{{ $t('general.edit') }}</div>
                    <div class="clickable delete"
                    @click="deleteAnswer(robotQA, answer)">{{ $t('general.delete') }}</div>
                  </div>
                  </template>
                  <template v-else>
                    <input class="edit-input" ref="editInput" v-model="updateValue"
                    @blur="cancelEdit(answer)"
                    @keydown="handleKey($event, robotQA, answer, 'ext-answer')">
                  </template>
                </div>
                <div class="list-row add-row" v-if="canEdit">
                  <input :placeholder="$t('robot_setting.input_qa_ext_placeholder')" v-model="newExtAnswer"
                  @compositionstart="compositionstart"
                  @compositionend="compositionend"
                  @keydown="handleKey($event, robotQA, undefined, 'ext-answer')">
                  <text-button button-type="primary"
                  @click="addAnswer(robotQA, true)">{{ $t('general.add') }}</text-button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="footer">
      <v-pagination size="small" :total="curTotal"
        :pageIndex="curPageIdx" :pageSize="pageLimit"
        :layout="['prev', 'pager', 'next', 'jumper']"
        @page-change="handlePageChange"></v-pagination>
    </div>
  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex';
import api from './_api/robotV3';

export default {
  path: 'robot-profile',
  privCode: 'robot_profile',
  displayNameKey: 'robot_profile',
  icon: 'white_robot',
  api,
  computed: {
    ...mapGetters([
      'robotName',
    ]),
    curTotal() {
      return this.robotQAs.length;
    },
    filterQAs() {
      return this.robotQAs.slice(
        (this.curPageIdx - 1) * this.pageLimit,
        this.curPageIdx * this.pageLimit);
    },
    canEdit() {
      return this.$hasRight('edit');
    },
  },
  data() {
    return {
      curPageIdx: 1,
      pageLimit: 10,
      robotQAs: [],
      newQuestion: '',
      newAnswer: '',
      newExtAnswer: '',
      updateValue: '',
      inComposition: false,
    };
  },
  methods: {
    compositionstart() {
      this.inComposition = true;
    },
    compositionend() {
      this.inComposition = false;
    },
    setHover(elem, bool) {
      const that = this;
      elem.isHover = bool;
      that.$forceUpdate();
    },
    cancelEdit(obj) {
      obj.editMode = false;
      this.updateValue = '';
      this.$forceUpdate();
    },
    startEdit(obj) {
      const that = this;
      obj.editMode = true;
      that.updateValue = obj.content;
      that.$forceUpdate();
      that.$nextTick(() => {
        const inputs = that.$refs.editInput;
        if (inputs !== undefined && inputs.length > 0) {
          inputs[0].focus();
        }
      });
    },
    resetShowAnswer(robotQA) {
      if (robotQA.answers.length > 0) {
        this.newAnswer = robotQA.answers[0].content;
      }
    },
    deleteQuestion(robotQA, question) {
      this.$api.deleteRobotQAQuestion(robotQA.id, question.id).then(() => {
        const idx = robotQA.relate_questions.indexOf(question);
        if (idx >= 0) {
          robotQA.relate_questions.splice(idx, 1);
        }
      });
    },
    deleteAnswer(robotQA, answer) {
      const that = this;
      that.$api.deleteRobotQAAnswer(robotQA.id, answer.id).then(() => {
        const idx = robotQA.answers.indexOf(answer);
        if (idx >= 0) {
          robotQA.answers.splice(idx, 1);
        }
        if (robotQA.answers.length > 0) {
          that.newAnswer = robotQA.answers[0].content;
          robotQA.show_answer = robotQA.answers[0].content;
        } else {
          that.newAnswer = '';
          robotQA.show_answer = '';
        }
      });
    },
    handleKey(e, robotQA, obj, type) {
      const that = this;
      if (that.inComposition) {
        return;
      }
      that.updateValue = that.updateValue.trim();
      if (e.keyCode !== 13) {
        return;
      }
      if (type === 'question') {
        if (obj === undefined) {
          that.addSimilaryQuestion(robotQA);
        } else if (that.updateValue === '') {
          that.cancelEdit(obj);
        } else {
          if (that.updateValue.length > 50) {
            this.$notifyWarn(that.$t('robot_setting.question_maximum'));
            return;
          }
          that.updateSimilaryQuestion(robotQA, obj, that.updateValue).then(() => {
            that.cancelEdit(obj);
          });
        }
      } else if (type === 'answer') {
        //  回答：255个字
        that.newAnswer = that.newAnswer.trim();
        if (that.newAnswer.length > 255) {
          this.$notifyWarn(that.$t('robot_setting.answer_maximum'));
          return;
        }
        if (that.newAnswer === '') {
          that.deleteAnswer(robotQA, robotQA.answers[0]);
        } else if (robotQA.answers.length > 0) {
          that.updateAnswer(robotQA, robotQA.answers[0], that.newAnswer);
        } else {
          that.addAnswer(robotQA);
        }
      } else if (type === 'ext-answer') {
        if (obj === undefined) {
          that.addAnswer(robotQA, true);
        } else if (that.updateValue === '') {
          that.cancelEdit(obj);
        } else {
          if (that.updateValue.length > 255) {
            this.$notifyWarn(that.$t('robot_setting.answer_maximum'));
            return;
          }
          that.updateAnswer(robotQA, obj, that.updateValue).then(() => {
            that.cancelEdit(obj);
          });
        }
      }
    },
    addSimilaryQuestion(robotQA) {
      const that = this;
      that.newQuestion = that.newQuestion.trim();
      // 相似问题：50个字
      if (that.newQuestion === '') {
        return;
      }
      if (that.newQuestion.length > 50) {
        this.$notifyWarn(that.$t('robot_setting.question_maximum'));
        return;
      }
      const content = that.newQuestion;
      const sameQuestion = robotQA.relate_questions.filter(item => item.content === content);
      if (sameQuestion.length > 0) {
        this.$notifyWarn(that.$t('robot_setting.same_similar_question'));
        that.newQuestion = '';
        return;
      }

      that.$api.addRobotQARelateQuestion(robotQA.id, content).then((data) => {
        robotQA.relate_questions.push(data);
      });
      that.newQuestion = '';
    },
    addAnswer(robotQA, isExt) {
      const that = this;
      let content = '';

      if (!isExt) {
        that.newAnswer = that.newAnswer.trim();
        if (that.newAnswer.length > 255) {
          this.$notifyWarn(that.$t('robot_setting.answer_maximum'));
          return;
        }
        if (that.newAnswer === '' ||
          (robotQA.answers.length > 0 && that.newAnswer === robotQA.answers[0].content)) {
          return;
        }
        content = that.newAnswer;
      } else {
        that.newExtAnswer = that.newExtAnswer.trim();
        if (that.newExtAnswer.length > 255) {
          this.$notifyWarn(that.$t('robot_setting.answer_maximum'));
          return;
        }
        if (that.newExtAnswer === '') {
          return;
        }
        content = that.newExtAnswer;
        const sameAnswer = robotQA.answers.filter(item => item.content === content);
        if (sameAnswer.length > 0) {
          this.$notifyWarn(that.$t('robot_setting.same_extend_answer'));
          that.newExtAnswer = '';
          return;
        }
        that.newExtAnswer = '';
      }

      that.$api.addRobotQAAnswer(robotQA.id, content).then((data) => {
        robotQA.answers.push(data);
        if (robotQA.answers.length === 1) {
          robotQA.show_answer = data.content;
        }
      });
      that.newQuestion = '';
    },
    updateSimilaryQuestion(robotQA, question, content) {
      const that = this;
      if (question.content === content) {
        return new Promise((r => r(question)));
      }
      return that.$api.updateRobotQAQuestion(robotQA.id, question.id, content).then((data) => {
        question.content = data.content;
        question.id = data.id;
      });
    },
    updateAnswer(robotQA, answer, content) {
      const that = this;
      if (answer.content === content) {
        return new Promise((r => r(answer)));
      }
      return that.$api.updateRobotQAAnswer(robotQA.id, answer.id, content).then((data) => {
        answer.content = data.content;
        answer.id = data.id;
        document.activeElement.blur();
      });
    },
    handlePageChange(idx) {
      this.curPageIdx = idx;
      this.robotQAs.forEach((qa) => {
        qa.expand = false;
      });
    },
    closeQA(e, robotQA) {
      e.stopPropagation();
      robotQA.expand = false;
      robotQA.answers.forEach((a) => {
        a.editMode = false;
      });
      if (robotQA.answers.length > 0) {
        robotQA.show_answer = robotQA.answers[0].content;
      }
      robotQA.relate_questions.forEach((q) => {
        q.editMode = false;
      });
      this.$forceUpdate();
    },
    expandRobotQA(robotQA) {
      const that = this;
      if (robotQA.expand) {
        return;
      }
      that.robotQAs.forEach((qa) => {
        if (qa.expand) {
          qa.show_answer = qa.answers[0].content;
        }
        qa.expand = false;
      });
      robotQA.expand = true;

      if (robotQA.answers.length > 0) {
        that.newAnswer = robotQA.answers[0].content;
      } else {
        that.newAnswer = '';
      }
      that.newExtAnswer = '';
      that.newQuestion = '';
      that.$forceUpdate();
    },
    loadQAs() {
      const that = this;
      that.$startPageLoading();

      that.$api.getRobotQAs()
      .then((data) => {
        that.robotQAs = data;
        that.robotQAs.forEach((qa) => {
          if (qa.answers && qa.answers.length > 0) {
            qa.show_answer = qa.answers[0].content;
          } else {
            qa.show_answer = '';
          }

          qa.relate_questions.forEach((q) => {
            q.editMode = false;
            q.isHover = false;
          });
          qa.answers.forEach((answer) => {
            answer.editMode = false;
            answer.isHover = false;
          });

          qa.expand = false;
        });
      })
      .finally(() => {
        that.$emit('endLoading');
      });
    },
  },
  mounted() {
    this.loadQAs();
  },
};
</script>

<style lang="scss" scoped>

$header-height: 60px;
$header-font-size: 16px;
$header-color: #333333;

@mixin card-header() {
  position: relative;
  .robot-q {
    flex: 0 0 calc(50% - 30px);
    flex-basis: calc(50% - 30px);
    &:first-child {
      margin-right: 60px;
    }
  }
  .robot-a {
    flex: 1;
    input {
      margin-left: 10px;
      margin-right: 80px;
      flex: 1;
    }
    span {
      margin-left: 10px;
      margin-right: 80px;
    }
  }
  .close-button {
    display: flex;
    align-items: center;
  }
}

@mixin card-content() {
  flex: 0 0 auto;

  display: flex;
  align-items: flex-start;
  .column {
    &.robot-q {
      flex: 0 0 calc(50% - 20px);
      flex-basis: calc(50% - 20px);
    }
    &.robot-a {
      flex: 0 0 calc(50% - 30px);
      flex-basis: calc(50% - 30px);
    }
    height: auto;
    &:first-child {
      margin-right: 50px;
    }
    .title {
      color: $color-font-active;
    }
    .list {
      margin-top: 10px;
      padding-left: 10px;
      border-left: solid 3px rgba(74, 144, 226, 0.24);
      height: auto;

      display: flex;
      flex-direction: column;
      .list-row {
        flex: 0 0 auto;

        display: flex;
        align-items: center;
        &.add-row {
          input {
            flex: 1;
            margin-right: 10px;
          }
        }
        &:not(.add-row):not(.edit-row) {
          padding: 4px 10px;
        }
        &:not(.add-row):not(.edit-row):hover {
          background-color: #f7f7f7;
        }
        &:not(:last-child) {
          margin-bottom: 10px;
        }
        .list-content {
          flex: 1;
          max-width: 450px;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        .command {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          .clickable {
            @include click-button();
          }
          .edit {
            color: $color-primary;
          }
          .delete {
            color: $color-error;
            margin-left: 10px;
          }
        }
        .edit-input {
          flex: 1;
        }
      }
    }
  }
}

.card {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  line-height: $default-line-height;

  display: flex;
  flex-direction: column;
  // page header
  & > .header {
    font-size: $header-font-size;
    color: $header-color;
    flex: 0 0 $header-height;
    display: flex;
    align-items: center;
    padding: 0 20px;
    box-shadow: inset 0 -1px 0 0 $color-borderline;
  }

  // card list css
  .qa-list {
    flex: 1;
    padding: 20px;
    padding-right: 0;
    @include auto-overflow();
    @include customScrollbar();
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;

    // every single card
    .qa {
      flex: 0 0 calc(50% - 20px);
      flex-basis: calc(50% - 20px);
      margin-bottom: 20px;
      padding: 15px 16px;
      margin-right: 20px;
      transition: all .5s ease-in-out;
      height: 90px;
      border-radius: 4px;
      transition: all .2s ease-in-out;
      // expand will set width to 100% and use animate
      &.expand {
        flex: 0 0 calc(100% - 20px);
        flex-basis: calc(100% - 20px);
        height: auto;
        box-shadow: 0 4px 9px 0 rgba(115, 115, 115, 0.2), 0 5px 8px 0 rgba(228, 228, 228, 0.5);
      }
      &:hover {
        box-shadow: 0 4px 9px 0 rgba(115, 115, 115, 0.2), 0 5px 8px 0 rgba(228, 228, 228, 0.5);
      }
      @include click-button();

      background-color: #ffffff;
      border: solid 1px #dbdbdb;
      display: flex;
      flex-direction: column;
      .row {
        @include font-14px();
        display: flex;
        align-items: center;
        // overflow: hidden;
        // text-overflow: ellipsis;
        .content {
          margin-left: 15px;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          max-width: 450px;
          &.empty {
            color: $color-font-disabled;
          }
        }
      }
      & > .row {
        &:not(:last-child) {
          margin-bottom: 15px;
        }
      }

      // after expand, use css below
      // first line in card
      .card-header {
        @include card-header();
      }

      // content part of card
      .card-content {
        @include card-content();
      }
    }
  }
  .footer {
    flex: 0 0 50px;
    display: flex;
    padding-right: 12px;
    justify-content: flex-end;
    align-items: center;
    border-top: 1px solid $color-borderline;
  }
}
</style>
