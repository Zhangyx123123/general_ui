<template>
  <div>
    <div class="row">
      <span>{{ $t('wordbank.word') }}：</span>
      <template v-if="extData.nameEditable">
        <input v-model="name" ref="nameInput" :class="{error: showNameError}" @blur="checkName">
        <span class="err-msg" v-if="showNameError">{{ $t('wordbank.err_name_empty') }}</span>
      </template>
      <template v-else>
        <span> {{ name }} </span>
      </template>
    </div>
    <div class="block">
      <div class="row">
        <span>{{ $t('wordbank.synonym') }}：</span>
        <span class="info">{{ $t('wordbank.synonym_note') }}</span>
      </div>
      <div class="row">
        <tag-input
          :maxlength=maxTagLength
          :origTags=origData.text
          @selectedTagsChanged=updateSynonyms
          area
        ></tag-input>
        <div class="err-msg" v-if="!isSynonymsTooLong">{{ $t('wordbank.err_synonym_length', {length: maxTagLength}) }}</div>
        <div class="err-msg" v-if="!isSynonymsTooMany">{{ $t('wordbank.err_synonym_total_length', {length: maxTotalLength}) }}</div>
      </div>
    </div>
    <div class="block" v-if="extData.setupAnswer">
      <div class="row">
        <span>{{ $t('wordbank.sensitive_answer') }}：</span>
        <span class="info">{{ $t('wordbank.sensitive_answer_note') }}</span>
      </div>
      <div class="row">
        <label-switch :options=answerOpts v-model="answerType" @change="typeChange"></label-switch>
      </div>
      <div class="row">
        <template v-if="answerType === 'default'">
          <loading size="30px" v-if="defaultAnswers === undefined"/>
          <div v-for="(answer, idx) in defaultAnswers" :key="idx" class='list-input-container'>
            <input disabled :value="answer" size=50/>
          </div>
        </template>
        <template v-else-if="answerType === 'custom'">
          <input size=50 :placeholder="$t('wordbank.custom_answer_note')" v-model="customAnswer">
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import TagInput from '@/components/basic/TagInput';
import LabelSwitch from '@/components/basic/LabelSwitch';
import api from '../_api/wordbank';

export default {
  api,
  props: {
    origData: {
      type: Object,
      default() {
        return { name: '', text: [] };
      },
    },
    extData: {
      type: Object,
    },
  },
  data() {
    return {
      text: [],
      name: '',
      customAnswer: '',
      maxTagLength: 35,
      maxTotalLength: 5000,
      errMsg: '',
      answerType: 'default',
      answerOpts: [
        { text: this.$t('wordbank.default_answer'), val: 'default' },
        { text: this.$t('wordbank.custom_answer'), val: 'custom' },
      ],
      defaultAnswers: undefined,
      showNameError: false,
    };
  },
  components: {
    'tag-input': TagInput,
    'label-switch': LabelSwitch,
  },
  methods: {
    checkName() {
      const that = this;
      if (that.name === undefined || that.name === '') {
        that.showNameError = true;
        that.$emit('disableOK');
      } else {
        that.showNameError = false;
        that.$emit('enableOK');
      }
    },
    typeChange(answerType) {
      const that = this;
      if (answerType === 'custom') {
        return;
      }
      // reload default answer every time
      that.defaultAnswers = undefined;
      that.$api.getDefaultSensitiveAnswer().then((data) => {
        that.defaultAnswers = data;
      });
    },
    validate() {
      const that = this;
      if (that.name === undefined || that.name === '') {
        that.showNameError = true;
        that.$nextTick(() => {
          that.$refs.nameInput.focus();
        });
        that.$emit('disableOK');
        return;
      }

      if (!that.isSynonymsValid) {
        return;
      }

      const retObj = Object.assign({}, that.origData);
      retObj.text = that.text;
      retObj.similar_words = retObj.text.join(',');
      retObj.name = that.name;
      retObj.answer = that.customAnswer;
      if (that.answerType === 'default') {
        retObj.answer = '';
      }
      that.$emit('validateSuccess', retObj);
    },
    updateSynonyms(synonyms) {
      const that = this;
      that.text = synonyms;
      if (!that.isSynonymsValid) {
        that.$emit('disableOK');
      }
    },
  },
  computed: {
    isSynonymsValid() {
      return this.isSynonymsTooLong && this.isSynonymsTooMany;
    },
    isSynonymsTooLong() {
      const that = this;
      return that.text.reduce((ret, t) => ret && t.length <= that.maxTagLength, true);
    },
    isSynonymsTooMany() {
      return this.text.join(',').length <= this.maxTotalLength;
    },
  },
  mounted() {
    const that = this;
    that.$on('validate', that.validate);
    if (that.origData.answer && that.origData.answer !== '') {
      that.answerType = 'custom';
    } else {
      that.answerType = 'default';
    }
    that.$nextTick(() => {
      that.$refs.nameInput.focus();
    });

    if (that.origData.name) {
      that.name = that.origData.name;
    }
    if (that.origData.answer) {
      that.customAnswer = that.origData.answer;
    }
    that.$api.getDefaultSensitiveAnswer().then((data) => {
      that.defaultAnswers = data;
    });
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable';
.block {
  margin-top: 30px;
}
.row {
  margin-bottom: 10px;
  input {
    border: 1px solid black;
    padding: 10px;
    &.error {
      border: 1px solid $error-color;
    }
  }
  .list-input-container {
    &:not(:last-child) {
      input {
        border-bottom: none;
      }
    }
  }
  .info {
    color: gray;
    font-size: 0.9em;
  }
  .err-msg {
    color: $error-color;
    font-weight: bold;
  }
  div.err-msg {
    margin-top: 5px;
  }
  span.err-msg {
    margin-left: 5px;
  }
}
</style>
