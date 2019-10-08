<template lang="html">
<div id="intent-editor-pop">
  <div class="intent-editor-title">
    <div>{{titleString}}</div>
  </div>
  <div class="intent-editor-box">
    <div class="intent-name-container">
      <div>{{$t("task_engine_v3.intent_editor_pop.label_intent_name")}}</div>
      <input v-model="intentName" v-bind:readonly="editorType==='edit_intent'" :placeholder="$t('task_engine_v3.intent_editor_pop.placeholder_intent_name')"></input>
    </div>
    <div class="label-training-phrase">{{$t("task_engine_v3.intent_editor_pop.label_training_phrase")}}</div>
    <div class="training-phrase-editor">
      <div class="training-phrase-container">
        <input v-model="newPhrase" :placeholder="$t('task_engine_v3.intent_editor_pop.placeholder_user_says')"></input>
        <div class="button-edit-phrase button-add-new-phrase" @click="addNewPhrase">
          <a>+</a>
        </div>
      </div>
      <template v-for="(phrase, index) in phraseList">
        <div class="training-phrase-container">
          <div class="phrase-item" :key="index">{{phrase}}</div>
          <div class="button-edit-phrase button-delete-phrase" @click="deletePhrase(index)"><a>-</a></div>
        </div>
      </template>
    </div>
  </div>
</div>
</template>

<script>
import i18nUtils from '../utils/i18nUtil';

export default {
  name: 'intent-editor-pop',
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
      newPhrase: '',
      editorType: this.value.editor_type,
      intentName: this.value.intent_name,
      phraseList: this.value.sentences.map(item => item.sentence),
    };
  },
  computed: {
    titleString() {
      if (this.editorType === 'edit_intent') {
        return this.$t('task_engine_v3.intent_editor_pop.label_edit_intent');
      } else if (this.editorType === 'add_new_intent') {
        return this.$t('task_engine_v3.intent_editor_pop.label_add_new_intent');
      }
      return this.$t('task_engine_v3.intent_editor_pop.label_edit_intent');
    },
  },
  watch: {
    phraseList() {
      // console.log(this.phraseList);
    },
  },
  methods: {
    addNewPhrase() {
      this.phraseList.push(this.newPhrase);
      this.newPhrase = '';
    },
    deletePhrase(index) {
      this.phraseList.splice(index, 1);
    },
    validateIntent() {
      const newSentences = this.phraseList.map(phrase => ({
        keywords: [],
        sentence: phrase,
      }));
      const intent = {
        app_id: this.value.app_id,
        intent_id: this.value.intent_id,
        intent_name: this.intentName,
        sentences: newSentences,
      };
      this.$emit('validateSuccess', intent);
    },
  },
  beforeMount() {},
  mounted() {
    this.i18n = i18nUtils.getLocaleMsgs(this.$i18n);
    this.$on('validate', this.validateIntent);
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
@import "../scss/intentEditorPop.scss";
</style>
