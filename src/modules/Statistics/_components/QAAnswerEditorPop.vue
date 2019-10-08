<template>
  <div class="qa-answer-editor">
    <div class="answer-title">{{ $t('qalist.answer') }} : {{ $t('qalist.multi_answer_explain') }}</div>
    <div class="answer-row" v-for="(answer, idx) in answers" :key="idx">
      <div class="answer-row-prefix">{{ $t('qalist.sentence') }}{{ idx + 1 }}</div>
      <textarea v-model="answer.value" @input="updateData" @blur="blurTextarea(idx)" ref="textarea"/>
    </div>
    <div class="answer-row" v-if="showAdd">
      <div class="answer-row-prefix"></div>
      <div class="answer-row-add" @click="addAnswerSentence">
        <icon icon-type="add"/>{{$t('qalist.add_answer_sentence')}}
      </div>
    </div>
  </div>
</template>

<script>
const MAX_ANSWER_SPLIT = 5;
export default {
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
      answers: [],
    };
  },
  computed: {
    showAdd() {
      return this.answers.length < MAX_ANSWER_SPLIT;
    },
  },
  mounted() {
    this.initInput(this.value.content);
  },
  methods: {
    initInput(content) {
      try {
        this.answers = JSON.parse(content);
      } catch (e) {
        const div = document.createElement('div');
        div.innerHTML = content;
        this.answers = [this.genTextNode(div.innerText)];
      }
    },
    updateData() {
      const reduceAnswer = this.answers.reduce((s, ans) => ans.value.trim() + s, '');
      if (reduceAnswer === '') {
        this.$emit('disableOK', {});
      } else {
        const updateAnswer = this.answers.filter(ans => ans.value.trim() !== '');
        this.value.newContent = JSON.stringify(updateAnswer);
        this.$emit('updateData', this.value.newContent);
        this.$emit('enableOK', {});
      }
    },
    blurTextarea(idx) {
      if (this.answers[idx].value.trim() === '') {
        this.answers.splice(idx, 1);
      }
    },
    addAnswerSentence() {
      const that = this;
      that.answers.push(that.genTextNode(''));
    },
    genTextNode(text) {
      return {
        type: 'text',
        subType: 'text',
        data: [],
        value: text,
      };
    },
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
@import 'styles/variable.scss';

.qa-answer-editor {
  width: 600px;
  .answer-row {
    margin-top: 20px;
    display: flex;
    align-items: center;
    .answer-row-prefix {
      flex: 0 0 80px;
    }
    textarea {
      @include general-textarea();
      font-size: 14px;
      height: 80px;
      flex: 1;
    }
    .answer-row-add {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px black dotted;
      margin-left: 10px;
      @include click-button();

      &:hover {
        opacity: 0.9;
        background: #EEEEEE;
      }
    }
  }
}
</style>