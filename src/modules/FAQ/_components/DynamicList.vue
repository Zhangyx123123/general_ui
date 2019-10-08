<template>
  <div class="dynamic-list-input">
    <div class="dynamic-input" v-for="(val, idx) in pagedInputs" :key="idx">
      <input type="text" maxlength="200" :data-idx="idx" :value="val" :disabled="readOnly" @change="setVal"/>
      <div class="dynamic-button icon delete-icon">
        <span @click="deleteRow(idx)">
          <div class="row"></div>
          <div class="vertical"></div>
        </span>
      </div>
      <div class="dynamic-button icon" :class="{disabled: !isRowFull }" v-if="showAddPageBtn(idx)">
        <span @click="addPage">
          <div class="row"></div>
          <div class="vertical"></div>
        </span>
      </div>
    </div>
    <div id="dynamic-clearbtn" class="text-button auto-size primary" @click="clearAllContents" >{{ $t('qalist.clear_all_rows') }}</div>
    <div class="dynamic-list-pagination">
      <span id="dynamic-total">{{$t('qalist.total')}} {{curTotalRowWord}} {{$t('qalist.rows')}}
      </span>  
      <v-pagination id="dynamic-paginator" size="small" :showPagingCount="1" :total="curTotalRow" :pageIndex="curPageWord" :pageSize="rowNum" :layout="['prev', 'pager', 'next', 'jumper']" @page-change="handlePageChange"></v-pagination>
    </div>
  </div>
</template>

<script>
// import CheckPop from '@/components/popForm/CheckPop';

export default {
  props: {
    value: {
      type: Object,
      default: {},
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      rowNum: 9,
      maxPageIndex: 10, // page 11
      curPageIndex: 0,
      curPageWord: 1,
    };
  },
  computed: {
    pagedInputs() {
      const start = this.curPageIndex * this.rowNum;
      const end = start + this.rowNum;
      return this.value.contents.slice(start, end);
    },
    isRowFull() {
      return (this.pagedInputs.indexOf('') === -1);
    },
    curTotalRowWord() {
      return this.value.contents.filter(content => content !== '').length;
    },
    curTotalRow() {
      const lenOfLastPageValues = this.value.contents.slice(-this.rowNum).filter(content => content !== '').length;
      if (lenOfLastPageValues === 0) {
        return (this.value.totalRow - this.rowNum) + 1;
      }
      return (this.value.totalRow - this.rowNum) + lenOfLastPageValues;
    },
    lastPageIndex() {
      return (this.curTotalRow === 0) ? 0 : parseInt((this.curTotalRow - 1) / this.rowNum, 10);
    },
  },
  methods: {
    deleteRow(idx) {
      const realIdx = (this.curPageIndex * this.rowNum) + idx;
      this.value.contents.splice(realIdx, 1);
      this.value.contents.push('');
      const lastPageIsEmpty = (this.value.contents.slice(-this.rowNum).filter(content => content !== '').length === 0);
      const atLastPage = (this.curPageIndex === this.lastPageIndex);
      if (lastPageIsEmpty && !atLastPage) {
        this.value.contents.splice(-this.rowNum, this.rowNum);
      }
      this.handleContentChange();
    },
    handlePageChange(pageWord) {
      const isEmptyRows = (this.curTotalRowWord === 0);
      if (isEmptyRows) {
        this.toFirstPage();
      } else {
        const isDeleted = this.deleteEmptyPage();
        if (isDeleted) {
          if (this.curPageWord > pageWord) { // go prevPage
            this.toAssignedPage(pageWord);
          } else if (this.curPageWord < pageWord) { // go nextPage
            this.toPrevOfAssignedPage(pageWord);
          } else if (this.curPageWord === pageWord) { // go samePage
            if (this.curPageIndex - 1 === this.lastPageIndex) {
              this.toPrevOfAssignedPage(pageWord);
            } else {
              this.toAssignedPage(pageWord);
            }
          }
        } else {
          this.toAssignedPage(pageWord);
        }
      }
    },
    handleContentChange() {
      this.value.totalRow = this.value.contents.length;
      this.$emit('contentChange', this.value.contents);
    },
    showAddPageBtn(idx) {
      const isLastPage = (this.curPageIndex === this.lastPageIndex);
      const isLastRow = ((idx + 1) === this.rowNum);
      const isMaxPage = (this.curPageIndex === this.maxPageIndex);
      return isLastPage && isLastRow && !isMaxPage;
    },
    addPage() {
      this.curPageWord = this.curPageWord + 1;
      this.curPageIndex = this.curPageIndex + 1;
      this.value.contents = this.value.contents.concat(Array(this.rowNum).fill(''));
      this.handleContentChange();
    },
    deleteEmptyPage() {
      const start = this.curPageIndex * this.rowNum;
      const valueInCurPage = this.value.contents.slice(start, start + this.rowNum);
      if (valueInCurPage.filter(val => val === '').length === this.rowNum) {
        this.value.contents.splice(start, this.rowNum);
        this.handleContentChange();
        return true;
      }
      return false;
    },
    setVal(event) {
      const e = event || window.event;
      const index = (this.curPageIndex * this.rowNum) + parseInt(e.currentTarget.dataset.idx, 10);
      const val = e.currentTarget.value.trim();
      if (e && e.currentTarget) {
        if (!this.isDuplicate(index, val)) {
          this.updateContents(index, val);
        } else {
          this.warnDuplicatePop(index, val);
        }
      }
    },
    clearAllContents() {
      const options = {
        // component: CheckPop,
        ok_msg: this.$t('general.ok'),
        cancel_msg: this.$t('general.cancel'),
        callback: {
          ok: () => {
            this.value.contents = [];
            this.value.contents = this.value.contents.concat(Array(this.rowNum).fill(''));
            this.toFirstPage();
            this.handleContentChange();
          },
        },
        data: {
          msg: `${this.$t('qalist.warn_clear_all_rows')}`,
        },
      };
      // this.$root.$emit('showWindow', options);
      this.$popCheck(options);
    },
    isDuplicate(index, val) {
      if (val === '') {
        return false;
      }
      const dupVals = this.value.contents.filter(
        (content, idx) => content === val && idx !== index);
      return (dupVals.length > 0);
    },
    warnDuplicatePop(index, val) {
      const options = {
        // component: CheckPop,
        ok_msg: this.$t('general.ok'),
        cancel_msg: this.$t('general.cancel'),
        callback: {
          ok: () => {
            this.updateContents(index, val);
            this.value.contents = this.value.contents.filter(content => content !== '');
            this.deleteDuplicate();
            this.setContentToRowNum();
            this.handleContentChange();
            if (this.curPageIndex > this.lastPageIndex) {
              this.toLastPage();
            }
          },
          cancel: () => {
            this.updateContents(index, val);
          },
        },
        data: {
          msg: this.$t('qalist.warn_duplicate_input_questions'),
        },
      };
      this.$root.$emit('showWindow', options);
    },
    updateContents(index, val) {
      this.value.contents.splice(index, 1, val);
      this.handleContentChange();
    },
    deleteDuplicate() {
      const len = this.value.contents.length;
      let val = '';
      for (let idx = len - 1; idx > 0; idx -= 1) {
        val = this.value.contents[idx];
        if (this.value.contents.slice(0, idx).includes(val)) {
          this.value.contents.splice(idx, 1);
        }
      }
    },
    toFirstPage() {
      this.resetPageIndex();
      this.$nextTick(() => {
        this.curPageIndex = 0;
        this.curPageWord = 1;
      });
    },
    toLastPage() {
      this.resetPageIndex();
      this.$nextTick(() => {
        this.curPageIndex = this.lastPageIndex;
        this.curPageWord = this.lastPageIndex + 1;
      });
    },
    toAssignedPage(pageWord) {
      this.resetPageIndex();
      this.$nextTick(() => {
        this.curPageWord = pageWord;
        this.curPageIndex = this.curPageWord - 1;
      });
    },
    toPrevOfAssignedPage(pageWord) {
      this.resetPageIndex();
      this.$nextTick(() => {
        this.curPageWord = pageWord - 1;
        this.curPageIndex = this.curPageWord - 1;
      });
    },
    /** reset for using nextTick to rerender view */
    resetPageIndex() {
      this.curPageWord = 0;
      this.curPageIndex = 0;
    },
    setContentToRowNum() {
      const lenOfContent = this.value.contents.length;
      const lenOfLastPageValues = lenOfContent % this.rowNum;
      if (lenOfLastPageValues !== 0 || lenOfContent === 0) {
        const len = this.rowNum - lenOfLastPageValues;
        this.value.contents = this.value.contents.concat(Array(len).fill(''));
      }
    },
  },
  mounted() {
    this.setContentToRowNum();
    this.handleContentChange();
  },
};
</script>
<style lang="scss" scoped>
.dynamic-list-input{
  width: 430px;
}
.dynamic-list-input .dynamic-input{
  position: relative;
  input {
    display: inline;
    border: 1px solid #515151;
    border-radius: 5px;
    margin: 0 10px;
    padding: 5px;
    // padding-right: 20px;
    // width: 360px;
  }

  input:focus ~ .delete-icon {
    visibility: visible;
  }
  input:hover ~ .delete-icon {
    visibility: visible;
  }
  .delete-icon {
    visibility: hidden;
    opacity: 0.8;
    background: white;
    transform: rotate(45deg) scale(0.8, 0.8);
    position: absolute;
    left: 350px;
    top: calc(50% - 8px);

    &:hover {
      visibility: visible;
    }
  }
}

.dynamic-list-pagination{
  display: flex;
  align-items: center;
  justify-content: space-between;
}

#dynamic-clearbtn{
  width: 60px;
  height: 30px;
  line-height: 30px;
  margin-left: 10px;
  padding: 0;
  font-size: 12px;
}

.dynamic-list-pagination #dynamic-total{
  font-size: 12px;
  margin: 0 10px;
  width: 60px;
}
</style>
