<template>
  <div id="similar-questions-container">
    <div id="title"> {{ $t('learning.feedback.view') }}: {{ numText }}</div>
    <div id="similar-question-title">
      <div class="row-text">
          {{ $t('learning.feedback.standardq') }}: {{value.question}}
      </div>
    </div>
    <template v-for="sq in limitedSimilarQuestions">
      <div class="row" :key="sq.content">
        <div class="row-text">
          {{ sq.content }}
        </div>
      </div>
    </template>
  </div>
</template>

<script>

export default {
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  computed: {
    limitedSimilarQuestions() {
      return this.value.similarQuestions.slice(0, 20);
    },
    numText() {
      let num = this.value.similarQuestions.length >= 20 ? 20 : this.value.similarQuestions.length;
      num = num.toString();
      return this.$t('learning.feedback.current_similar_questions').replace('%NUM', num);
    },
  },
};
</script>

<style  lang='scss'>
  @mixin verticalCenterAlign() {
    display: flex;
    align-items: center;
    padding: 10px;
  }
  #similar-questions-container {
      width: 400px;
      height: 300px;

      $title-height: 60px;
      $row-height: 30px;

      border: solid 1px #cccccc;
      overflow-y: auto;

      #title {
          width: 100%;
          height: $row-height;
          background: #118EEB;
          color: white;
          @include verticalCenterAlign();

      }

      #similar-question-title {
          width: 100%;
          height: $row-height;
          @include verticalCenterAlign();
          border-bottom: solid 1px #cccccc;
          font-weight: bolder;
      }

      .row {
          height: $row-height;
          @include verticalCenterAlign();
          border-bottom: solid 1px #cccccc;
          padding: 20px;
      }

      .row-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 22px;
      }
  }
</style>