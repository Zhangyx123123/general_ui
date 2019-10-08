
<template>
  <div id="card-content" class="card">
    <div id="card-content-header">
      <div id="card-content-title">{{ this.categoryName }}</div>
      <div id="io-buttons">
        <search-input v-model="wordbankKeyword"></search-input>
        <!-- <text-button>{{ $t('wordbank.batch_import') }}</text-button> -->
        <text-button v-if="canExport" @click="exportWordbank">{{ $t('wordbank.export_all') }}</text-button>
      </div>
    </div>
    <div id="card-content-content">
      <div id="toolbar">
        <text-button v-if="canCreate" button-type="primary" @click="popAddWordbank">{{ $t('wordbank.add_wordbank') }}</text-button>
        <text-button
          v-if="canDelete"
          @click="deleteMultiWordbank"
          :button-type="this.checkedWordbank.length === 0 ? 'disable' : 'error'">
          {{ $t('wordbank.delete') }}
        </text-button>
        <text-button
          v-if="canEdit"
          @click="popMoveToCategory"
          :button-type="this.checkedWordbank.length === 0 ? 'disable' : 'default'">
          {{ $t('wordbank.moveto') }}
        </text-button>
      </div>
      <general-table id="content-table"
        :tableHeader="tableHeader" :tableData="tableData" :action="tableAction"
        @checkedChange="handleCheckedChange" checkbox
        showEmpty></general-table>
    </div>
    <div id="card-content-footer">
      <v-pagination size="small" :total="curTotal" :pageIndex="curPageIdx" :pageSize="pageLimit" :pageSizeOption="[25, 50, 100, 200, 500, 1000]" :layout="['prev', 'pager', 'next', 'sizer', 'jumper']" @page-change="handlePageChange" @page-size-change="handlePageSizeChange"></v-pagination>
    </div>

    <div id="content-blocker" v-if="isEditMode"></div>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import WordbankEditPop from './WordbankEditPop';
import MoveToPop from './MoveToPop';
import api from '../_api/wordbank';

export default {
  path: 'wordbank-list',
  privCode: 'wordbank',
  displayNameKey: 'wordbank_list',
  icon: 'white_folder',
  api,
  data() {
    return {
      categoryName: '',
      wordbanks: [],
      filteredWordbanks: [],
      currentWordbanks: [],

      wordbankKeyword: '',
      tableHeader: [
        {
          key: 'wordbank',
          text: this.$t('wordbank.wordbank'),
          width: '120px',
        },
        {
          key: 'synonym',
          text: this.$t('wordbank.synonym'),
          type: 'tag',
        },
      ],
      tableAction: [],
      checkedWordbank: [],

      curPageIdx: 1,
      pageLimit: 25,
    };
  },
  computed: {
    ...mapGetters([
      'wordbank',
      'currentCategory',
      'isEditMode',
      'showLanguage',
    ]),
    tableData() { // This is curPage
      // Handle empty data cause curPageIdx to zero;
      if (this.curPageIdx <= 0) {
        this.toFirstPage();
      }

      const startIdx = (this.curPageIdx - 1) * this.pageLimit;
      const endIdx = startIdx + this.pageLimit;
      return this.currentWordbanks.slice(startIdx, endIdx)
        .map((bank) => {
          const tablerow = {
            wid: bank.wid,
            wordbank: bank.name,
            synonym: bank.similar_words.slice(0, 40),
          };
          return tablerow;
        });
    },
    curTotal() {
      return this.currentWordbanks.length;
    },
    lastPageIdx() {
      return Math.floor((this.curTotal - 1) / this.pageLimit) + 1;
    },
    canCreate() {
      return this.$hasRight('create');
    },
    canDelete() {
      return this.$hasRight('delete');
    },
    canEdit() {
      return this.$hasRight('edit');
    },
    canExport() {
      return this.$hasRight('export');
    },
  },
  watch: {
    wordbanks() {
      this.wordbankKeyword = '';
      this.currentWordbanks = this.wordbanks;
      this.filteredWordbanks = [];
    },
    currentCategory() {
      this.loadCurrentWordbanks();
      this.currentWordbanks = this.wordbanks;
      this.checkedWordbank = [];
    },
    wordbankKeyword() {
      if (this.wordbankKeyword !== '') {
        this.filteredWordbanks = this.wordbanks
          .filter(word => word.name.indexOf(this.wordbankKeyword) !== -1);
        this.currentWordbanks = this.filteredWordbanks;
      } else {
        this.currentWordbanks = this.wordbanks;
        this.filteredWordbanks = [];
      }
      this.toFirstPage();
    },
    lastPageIdx() {
      if (this.curPageIdx > this.lastPageIdx) {
        this.toCurPage(this.lastPageIdx);
      }
    },
  },
  methods: {
    ...mapMutations([
      'setWordbank',
      'setCurrentCategory',
      'setWordbankEditMode',
      'updateWordbankInCategory',
      'addWordbankToCategory',
      'deleteWordbankFromCategory',
    ]),
    loadTableActionByPrivilege() {
      if (this.canEdit) {
        this.tableAction.push({
          text: this.$t('wordbank.edit'),
          type: 'primary',
          onclick: this.editWordbank,
        });
      } else {
        this.tableAction.push({
          text: this.$t('wordbank.view'),
          type: 'primary',
          onclick: this.viewWordbank,
        });
      }
      if (this.canDelete) {
        this.tableAction.push({
          text: this.$t('wordbank.delete'),
          type: 'error',
          onclick: this.deleteWordbank,
        });
      }
    },
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
      if (page <= 0) {
        this.toFirstPage();
      } else {
        this.toCurPage(page);
      }
      this.checkedWordbank = [];
    },
    handlePageSizeChange(pageSize) {
      this.pageLimit = pageSize;
      this.toFirstPage();
      this.checkedWordbank = [];
    },
    exportWordbank() {
      window.open(`/api/v3/dictionary/export?locale=${this.showLanguage}`, '_blank');
    },
    viewWordbank(data) {
      this.$api.getWordbank(data.wid)
      .then((wordbank) => {
        this.popViewWordbank(wordbank);
      });
    },
    editWordbank(data) {
      this.$api.getWordbank(data.wid)
      .then((wordbank) => {
        this.popEditWordbank(wordbank);
      });
    },
    isWordbankSensitive(wid) {  // By recursive through sensitive category
      let isIn = false;
      this.wordbank.children.forEach((child) => {
        if (child.name === this.$t('wordbank.sensitive_wordbank')) {
          isIn = this.isWordbankInSensitiveCategory(child, wid) || isIn;
        }
      });
      return isIn;
    },
    isWordbankInSensitiveCategory(wordbank, wid) {
      let hasWid = false;
      if (wordbank.wordbanks && wordbank.wordbanks.length !== 0) {
        hasWid = wordbank.wordbanks.findIndex(bank => bank.wid === wid) !== -1;
        if (hasWid) return hasWid;
      }
      if (wordbank.children && wordbank.children.length !== 0) {
        wordbank.children.forEach((child) => {
          hasWid = hasWid || this.isWordbankInSensitiveCategory(child, wid);
        });
      }
      return hasWid;
    },
    isCategorySensitive(cid) {  // By recursive through sensitive category
      let isIn = false;
      this.wordbank.children.forEach((child) => {
        if (child.name === this.$t('wordbank.sensitive_wordbank')) {
          isIn = this.isCategoryInSensitiveCategory(child, cid) || isIn;
        }
      });
      return isIn;
    },
    isCategoryInSensitiveCategory(wordbank, cid) {
      let hasCid = false;
      if (wordbank.cid === cid) return true;
      if (wordbank.children && wordbank.children.length !== 0) {
        wordbank.children.forEach((child) => {
          hasCid = hasCid || this.isCategoryInSensitiveCategory(child, cid);
        });
      }
      return hasCid;
    },
    popAddWordbank() {
      const wordbankProp = {
        wid: undefined,
        answer: '',
        editable: true,
        name: '',
        similar_words: [],
      };
      if (this.currentCategory.cid < 0) { // 'all' or 'no_category'
        wordbankProp.isSensitive = false;
      } else {
        wordbankProp.isSensitive = this.isCategorySensitive(this.currentCategory.cid);
      }

      const targetCid = this.currentCategory.cid < 0 ? -1 : this.currentCategory.cid;
      const options = {
        component: WordbankEditPop,
        title: this.$t('wordbank.add_wordbank'),
        data: {
          wordbank: wordbankProp,
        },
        disable_ok: true,
        validate: true,
        callback: {
          ok: (addedWordbank) => {
            this.$api.addWordbank(targetCid, addedWordbank)
            .then((bank) => {
              const payload = {
                cid: this.currentCategory.cid < 0 ? -1 : this.currentCategory.cid,
                newbank: bank,
              };
              this.addWordbankToCategory(payload);
              this.loadCurrentWordbanks();
            })
            .catch((err) => {
              console.log(err);
              this.$notifyFail(this.$t('wordbank.error.add_wordbank_fail'));
            });
          },
        },
      };
      this.$pop(options);
    },
    popEditWordbank(wordbank) {
      // check sensitive by wordbank cause wordbank might be opened through 'all' category
      wordbank.isSensitive = this.isWordbankSensitive(wordbank.wid);
      const options = {
        component: WordbankEditPop,
        title: this.$t('wordbank.edit_wordbank'),
        data: {
          wordbank,
        },
        validate: true,
        callback: {
          ok: (editedWordbank) => {
            this.$api.updateWordbank(editedWordbank)
            .then((bank) => {
              this.updateWordbankInCategory(bank);
              this.loadCurrentWordbanks();
            })
            .catch((err) => {
              console.log(err);
              this.$notifyFail(this.$t('wordbank.error.edit_wordbank_fail'));
            });
          },
        },
      };
      this.$pop(options);
    },
    popViewWordbank(wordbank) {
      // check sensitive by wordbank cause wordbank might be opened through 'all' category
      wordbank.isSensitive = this.isWordbankSensitive(wordbank.wid);
      const options = {
        component: WordbankEditPop,
        title: this.$t('wordbank.view_wordbank'),
        data: {
          wordbank,
          readonly: true,
        },
        buttons: ['ok'],
        validate: false,
      };
      this.$pop(options);
    },
    popMoveToCategory() {
      if (this.checkedWordbank.length === 0) {
        return;
      }
      const wordbanksToMove = this.checkedWordbank;
      const options = {
        component: MoveToPop,
        title: this.$t('wordbank.moveto_wordbank'),
        validate: true,
        callback: {
          ok: (toCid) => {
            const movePromises = [];
            wordbanksToMove.forEach((bank) => {
              movePromises.push(this.confirmMoveWordbank(bank.wid, toCid));
            });

            Promise.all(movePromises)
            .then((response) => {
              const hasError = response.filter(rsp => rsp.status === 'success').length !== response.length;
              if (hasError) {
                this.$notifyFail(this.$t('wordbank.error.move_wordbank_fail'));
                response.forEach((rsp) => {
                  if (rsp.status === 'fail') {
                    this.$notifyFail(`${rsp.name}: ${rsp.msg}`);
                  }
                });
              } else {
                this.$notify({ text: this.$t('wordbank.success.moved') });
                this.checkedWordbank = [];
              }
              response.forEach((rsp) => {
                if (rsp.status === 'success') {
                  const theBank = this.wordbanks
                    .find(wordbank => wordbank.name === rsp.name);
                  this.removeSuccessfullyMovedWordbank(theBank, toCid);
                }
              });
            })
            .catch((err) => {
              console.log(err);
              this.$notifyFail(this.$t('wordbank.error.move_wordbank_fail'));
            });
          },
        },
      };
      this.$pop(options);
    },
    confirmMoveWordbank(id, cid) {
      const that = this;
      const theWordbankIdx = that.wordbanks.findIndex(bank => bank.wid === id);
      const wordbankname = that.wordbanks[theWordbankIdx].name;
      return this.$api.moveToCategory(id, cid)
      .then((response) => {
        // TODO: only keep success return in 'then' block once api error criteria is fixed
        if (response.data.status === 0) {
          return { status: 'success', idx: theWordbankIdx, name: wordbankname };
        }
        return { status: 'fail', idx: theWordbankIdx, name: wordbankname, msg: response.data.result };
      })
      .catch(err => ({ status: 'fail', idx: theWordbankIdx, name: wordbankname, msg: err.response.data.result }));
    },
    removeSuccessfullyMovedWordbank(bank, toCid) {
      const targetWordbank = {
        answer: bank.answer,
        editable: bank.editable,
        name: bank.name,
        similar_words: bank.similar_words,
        wid: bank.wid,
      };
      this.deleteWordbankFromCategory(targetWordbank.wid);
      const payload = {
        cid: toCid,
        newbank: targetWordbank,
      };
      this.addWordbankToCategory(payload);
      this.loadCurrentWordbanks();
    },
    deleteWordbank(data) {
      const option = {
        data: {
          msg: this.$t('wordbank.delete_wordbank_msg', { name: data.wordbank }),
        },
        callback: {
          ok: () => {
            this.confirmDeleteWordbank(data.wid);
          },
        },
      };
      this.$popWarn(option);
    },
    confirmDeleteWordbank(wid) {
      this.$api.deleteWordbank(wid)
      .then(() => {
        this.deleteWordbankFromCategory(wid);
        this.loadCurrentWordbanks();
      })
      .catch((err) => {
        console.log(err);
        this.$notifyFail(this.$t('wordbank.error.delete_wordbank_fail'));
      });
    },
    deleteMultiWordbank() {
      if (this.checkedWordbank.length === 0) {
        return;
      }
      const option = {
        data: {
          msg: this.$t('wordbank.delete_multi_wordbank_msg'),
        },
        callback: {
          ok: () => {
            this.checkedWordbank.forEach((bank) => {
              this.confirmDeleteWordbank(bank.wid);
            });
            this.checkedWordbank = [];
          },
        },
      };
      this.$popWarn(option);
    },
    handleCheckedChange(checked) {
      this.checkedWordbank = checked;
    },
    loadCurrentWordbanks() {
      if (!this.isEditMode) {
        this.wordbanks = this.getWordbanksFromSubCategories(this.currentCategory);
        this.categoryName = this.currentCategory.name;
      }
    },
    getWordbanksFromSubCategories(wordbank) {
      let subWordbanks = [];
      if (wordbank.children && wordbank.children.length > 0) {
        wordbank.children.forEach((child) => {
          subWordbanks = subWordbanks.concat(this.getWordbanksFromSubCategories(child));
        });
      }
      return wordbank.wordbanks.concat(subWordbanks);
    },
  },
  mounted() {
    this.loadTableActionByPrivilege();
  },
};
</script>
<style lang="scss" scoped>
@import 'styles/variable';
#card-content {
  position: relative;
  display: flex;
  flex-direction: column;
  #card-content-header {
    flex: 0 0 60px;
    padding: 0 20px;
    border-bottom: 1px solid $color-borderline;
    display: flex;
    align-items: center;
    justify-content: space-between;
    #card-content-title {
      @include font-16px();
      color: $color-font-active;
    }
    #io-buttons {
      display: flex;
      justify-content: space-between;
      .text-button {
        margin: 0 5px;
      }
      :last-child {
        margin-right: 0px;
      }
    }
  }
  #card-content-content {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    #toolbar {
      flex: 0 0 auto;
      margin: 20px;
      display: flex;
      .text-button {
        margin: 0 5px;
      }
      :first-child {
        margin-left: 0px;
      }
    }

    #content-table {
      overflow: hidden;
    }
  }
  #card-content-footer {
    border-top: 1px solid $color-borderline;
    flex: 0 0 50px;
    padding-right: 12px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  #content-blocker {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.55);
    border-radius: 4px;
  }
}
</style>
