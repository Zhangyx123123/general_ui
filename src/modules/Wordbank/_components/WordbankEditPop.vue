<template>
  <div id="pop-wordbank-edit">
    <div id="edit-header">
      <div id="toolbar-first" class="toolbar-row">
        <div id="wordbank-name" class="input-item">
          <span>{{ $t('wordbank.wordbank') }}：</span>
          <input type="text" ref="wordbankName" v-model="wordbankName"
            v-tooltip="wordbankNameTooltip" :maxlength="lengthLimit" :disabled="readonly">
        </div>
        <div id="sentitive-answer" v-if="wordbank.isSensitive">
          <span>{{ $t('wordbank.sensitive_word') }}：</span>
          <input type="radio" name="sensitive" id="sensitive-default" :value="true" v-model="isDefaultSensitive" :disabled="readonly">
          <label for="sensitive-default"> {{ $t('wordbank.default') }}</label>
          <input type="radio" name="sensitive" id="sensitive-define" :value="false" v-model="isDefaultSensitive" :disabled="readonly">
          <label for="sensitive-define"> {{ $t('wordbank.define') }}</label>
          <input type="text" v-model="sensitiveAnswer" ref="sensitiveInputBox" :disabled="readonly">
        </div>
      </div>
      <div id="toolbar-second" class="toolbar-row">
        <div v-if="!readonly" id="wordbank-synonym" class="input-item">
          <span>{{ $t('wordbank.synonym') }}：</span>
          <input type="text"
            ref="synonymInput"
            v-model="newSynonym"
            v-tooltip="synonymTooltip"
            :maxlength="synonymLengthLimit"
            :placeholder="$t('wordbank.placeholder_synonym')"
            @compositionstart="setCompositionState(true)"
            @compositionend="setCompositionState(false)"
            @keydown.enter="detectCompositionState"
            @keyup.enter="addSynonym"
            >
          <text-button :button-type="this.checkedSynonyms.length === 0 ? 'disable' : 'error'" @click="deleteMultiSynonym">{{ $t('wordbank.delete') }}</text-button>
        </div>
        <div id="toolkit">
          <search-input v-model="synonymKeyword"></search-input>
          <!-- <text-button> {{ $t('wordbank.batch_import') }}</text-button> -->
        </div>
      </div>
    </div>
    <div id="edit-content">
      <general-table id="synonym-table" 
        :tableHeader="tableHeader" :tableData="curPage" :action="tableAction"
        @checkedChange="handleCheckedChange" checkbox showEmpty></general-table>
    </div>
    <div id="edit-footer">
      <v-pagination size="small" :total="curTotal" :pageIndex="curPageIdx" :pageSize="pageLimit" :pageSizeOption="[25, 50, 100, 200, 500, 1000]" :layout="['prev', 'pager', 'next', 'sizer', 'jumper']" @page-change="handlePageChange" @page-size-change="handlePageSizeChange"></v-pagination>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import event from '@/utils/js/event';

export default {
  props: {
    value: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      readonly: false,

      wordbank: {},
      isDefaultSensitive: undefined,

      wid: undefined,
      wordbankName: '',
      sensitiveAnswer: '',
      synonyms: [],
      filteredSynonyms: [],
      currentSynonyms: [],

      newSynonym: '',
      compositionState: false,
      wasCompositioning: false,
      tableHeader: [{
        key: 'synonym',
        text: this.$t('wordbank.synonym'),
      }],
      // tableData: [],
      tableAction: [],

      checkedSynonyms: [],
      synonymKeyword: '',

      curPageIdx: 1,
      pageLimit: 100,
      lengthLimit: 35,
      synonymLengthLimit: 64,

      synonymTooltip: {
        msg: this.$t('wordbank.error.synonym_duplicate'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      wordbankNameTooltip: {
        msg: '',
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
    };
  },
  computed: {
    ...mapGetters([
      'currentCategory',
    ]),
    curPage() {
      const startIdx = (this.curPageIdx - 1) * this.pageLimit;
      const endIdx = startIdx + this.pageLimit;
      return this.currentSynonyms.slice(startIdx, endIdx).map((word) => {
        const data = {
          synonym: word,
        };
        return data;
      });
    },
    curTotal() {
      return this.currentSynonyms.length;
    },
    lastPageIdx() {
      return Math.floor((this.curTotal - 1) / this.pageLimit) + 1;
    },
    isWordbankNameValid() {
      return !this.isWordbankNameEmpty && !this.isWordbankNameTooLong
        && !this.isWordbankNameDuplicate;
    },
    isWordbankNameEmpty() {
      return this.wordbankName.trim() === '';
    },
    isWordbankNameTooLong() {
      return this.wordbankName.length > this.lengthLimit;
    },
    isWordbankNameDuplicate() {
      if (this.wordbankName === this.wordbank.name) { // same, don't check
        return false;
      }
      return this.currentCategory.wordbanks
        .findIndex(bank => bank.name === this.wordbankName) !== -1;
    },
    isNewSynonymValid() {
      return !this.isNewSynonymEmpty && !this.isNewSynonymTooLong;
    },
    isNewSynonymEmpty() {
      this.newSynonym = this.newSynonym.trim();
      return this.newSynonym === '';
    },
    isNewSynonymTooLong() {
      this.newSynonym = this.newSynonym.trim();
      return this.newSynonym.length > this.synonymLengthLimit;
    },
    isDuplicate() {
      return this.synonyms.filter(synonym => synonym === this.newSynonym).length > 0;
    },
  },
  watch: {
    isDefaultSensitive() {
      if (this.wordbank.isSensitive) {
        if (this.isDefaultSensitive) {
          this.$nextTick(() => {
            this.sensitiveAnswer = '';
            this.$refs.sensitiveInputBox.disabled = true;
          });
        } else {
          this.$nextTick(() => {
            this.$refs.sensitiveInputBox.disabled = false;
          });
        }
      }
    },
    synonymKeyword() {
      if (this.synonymKeyword !== '') {
        this.filteredSynonyms = this.synonyms
          .filter(word => word.indexOf(this.synonymKeyword) !== -1);
        this.currentSynonyms = this.filteredSynonyms;
      } else {
        this.currentSynonyms = this.synonyms;
        this.filteredSynonyms = [];
      }
      this.toFirstPage();
    },
    isDuplicate() {
      if (!this.isDuplicate) {
        this.$refs.synonymInput.dispatchEvent(event.createEvent('tooltip-hide'));
      }
    },
    isWordbankNameEmpty() {
      this.updateNameTooltip();
    },
    isWordbankNameDuplicate() {
      this.updateNameTooltip();
    },
  },
  methods: {
    toFirstPage() {
      this.curPageIdx = 1;
      // const elem = this.$refs.synonymList;
      // elem.scrollTop = 0;
    },
    toCurPage(page) {
      this.curPageIdx = page;
      // const elem = this.$refs.synonymList;
      // elem.scrollTop = 0;
    },
    handlePageChange(page) {
      this.toCurPage(page);
      this.checkedSynonyms = [];
    },
    handlePageSizeChange(pageSize) {
      this.pageLimit = pageSize;
      this.toFirstPage();
      this.checkedSynonyms = [];
    },
    handleCheckedChange(checkedData) {
      this.checkedSynonyms = checkedData;
    },
    setCompositionState(bool) {
      this.compositionState = bool;
    },
    detectCompositionState() {
      this.wasCompositioning = this.compositionState;
    },
    deleteSynonym(toDelete) {
      const idx = this.synonyms.findIndex(synonym => synonym === toDelete.synonym);
      if (idx !== -1) {
        this.synonyms.splice(idx, 1);
        if (this.currentSynonyms === this.filteredSynonyms) {
          const filteredIdx = this.filteredSynonyms.findIndex(word => word === toDelete.synonym);
          this.filteredSynonyms.splice(filteredIdx, 1);
        }
        if (this.curPageIdx > this.lastPageIdx) {
          this.toCurPage(this.lastPageIdx);
        }
      }
    },
    deleteMultiSynonym() {
      const toDeletes = this.checkedSynonyms;
      toDeletes.forEach((toDelete) => {
        this.deleteSynonym(toDelete);
      });
      this.checkedSynonyms = [];
    },
    addSynonym() {
      if (this.wasCompositioning) {
        return;
      }
      if (this.isDuplicate) {
        this.$refs.synonymInput.dispatchEvent(event.createEvent('tooltip-show'));
        return;
      }
      if (this.isNewSynonymValid) {
        this.synonyms.splice(0, 0, this.newSynonym);
        this.currentSynonyms = this.synonyms;
        this.toFirstPage();
      }
      this.newSynonym = '';
      this.$nextTick(() => {
        this.synonymKeyword = '';
      });
    },
    updateNameTooltip() {
      if (!this.isWordbankNameValid) {
        this.$emit('disableOK');
        if (this.isWordbankNameEmpty) {
          this.wordbankNameTooltip.msg = this.$t('wordbank.error.wordbank_name_empty');
        } else if (this.isWordbankNameDuplicate) {
          this.wordbankNameTooltip.msg = this.$t('wordbank.error.wordbank_name_duplicate');
        } // TODO: else if wordbank name too long
        this.$refs.wordbankName.dispatchEvent(event.createEvent('tooltip-reload'));
        this.$refs.wordbankName.dispatchEvent(event.createEvent('tooltip-show'));
      } else {
        this.$emit('enableOK');
        this.$refs.wordbankName.dispatchEvent(event.createEvent('tooltip-hide'));
      }
    },
    setReadonly() {
      this.readonly = this.value.readonly ? this.value.readonly : false;
      if (!this.readonly) {
        this.tableAction.push({
          text: this.$t('wordbank.delete'),
          type: 'error',
          onclick: this.deleteSynonym,
        });
      }
    },
    setWordbankEdit() {
      this.wordbank = this.value.wordbank;
      this.wid = this.wordbank.wid;
      this.wordbankName = this.wordbank.name;
      this.synonyms = this.wordbank.similar_words;
      this.currentSynonyms = this.synonyms;
      this.sensitiveAnswer = this.wordbank.answer;
      this.isDefaultSensitive = this.sensitiveAnswer.length === 0;
    },
    validate() {
      const wordbankNameElem = this.$refs.wordbankName;
      if (!this.isWordbankNameValid) {
        wordbankNameElem.focus();
        return;
      }
      if (this.isWordbankNameDuplicate) {
        wordbankNameElem.focus();
        this.$refs.wordbankName.dispatchEvent(event.createEvent('tooltip-show'));
        return;
      }
      const editedWordbank = {
        wid: this.wid,
        name: this.wordbankName.trim(),
        similar_words: this.synonyms,
        answer: this.sensitiveAnswer,
      };
      this.$emit('validateSuccess', editedWordbank);
    },
  },
  mounted() {
    this.setWordbankEdit();
    this.setReadonly();
    this.$on('validate', this.validate);
  },
};
</script>
<style lang="scss" scoped>
@import 'styles/variable';

#pop-wordbank-edit {
  @include font-14px();
  max-width: 960px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  #edit-header {
    flex: 0 0 90px;
  }
  #edit-content {
    flex: 0 0 200px;
    display: flex;
    flex-direction: column;
    @media (min-height: 768px) {
      flex: 0 0 300px;
    }

    #synonym-table {
      flex: 1;
      overflow: hidden;
    }
  }
  #edit-footer {
    border-top: 1px solid $color-borderline;
    flex: 0 0 50px;
    padding-right: 12px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}

#edit-header {
  display: flex;
  flex-direction: column;
  padding-bottom: 10px;
  .toolbar-row {
    margin: 5px 20px;
    display: flex;
    align-items: center;
    .input-item {
      margin-right: 10px;
      span {
        display: inline-block;
        width: 60px;
      }
    }
  }
  #toolbar-first {
    justify-content: flex-start;
    #wordbank-name {
      flex: 0 0 300px;
      display: flex;
      align-items: center;
      input[type=text] {
        width: 240px;
      }
    }
    #sensitive-answer {
      flex: 1 0 auto;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      input[type=text] {
        width: 380px;
      }
    }
  }
  #toolbar-second {
    justify-content: space-between;
    #wordbank-synonym {
      display: flex;
      align-items: center;
      input[type=text] {
        width: 380px;
      }
      .text-button {
        margin-left: 20px;
      }
    }
    #toolkit {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      .search-input {
        height: 28px;
      }
      .text-button {
        margin-left: 10px;
      }
    }
  }
}

#edit-content {
  height: 100%;
}
</style>
