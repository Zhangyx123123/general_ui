<template>
  <div id="qa-similar-questions-pop">
    <h2> {{ $t('qalist.set_similar_questoin') }}: </h2>
    <h3 class="margin-top"> {{ $t('qalist.standard_q') }}: {{ value.standard_q }} </h3>
    <div id="search-container" class="margin-top">
      <h3>{{ $t('general.search') }}{{ $t('qalist.similar_question') }}:</h3>
      <input style="margin-left: 5px;" id="keyword-search" maxlength="200" :placeholder="$t('qalist.please_input')"  v-model="filter" />
    </div> 
    <div class="margin-top" style="display:flex; justify-content: space-between; align-items:baseline">
      <h3> {{ $t('qalist.similar_question') }}: {{ filteredQuestion.length }} </h3>
      <text-button @click="batchAddQuestion" >{{ $t('qalist.batch_add') }}</text-button>
    </div>
    
    <div id="qa-similar-question-table" class="margin-top">
      <div id="table-header">
        <label class="cell-little"> {{ $t('qalist.sn') }} </label>
        <label class="cell-large"> {{ $t('qalist.similar_question') }} </label>
        <label class="cell-little"> {{ $t('general.operation') }} </label>
      </div>
      <div id="table-body">
        <div class="row" v-for="(question, index) in pagedQuestions" :key="question.content">
            <div ref="questions" :data-id="index" class="cell-large content-edit"
              @dblclick="setEditMode(pagedQuestions[index], index)">
              <textarea :data-id="index" ref="questionEdits" class="actual-input"
                maxlength="200"
                @blur="questionOnBlur(pagedQuestions[index], index)"
                @keydown="checkFinish(pagedQuestions[index], index, $event)"
                @input="autoHeight"/>
              <div :data-id="index" ref="questionShows" > {{ question.content }} </div>
            </div>
            <div style="display: flex;" class="cell-little content-delete">
              &nbsp;
              <div v-if="question.content !== ''" class="operation-button" @click="deleteQuestion(question)"> {{ $t('general.delete') }} </div>
              &nbsp;
            </div>
            <label class="cell-little content-num">
              <template v-if="question.content !== ''">
              {{ curPage * listPerPage + index + 1 }}
              </template>
            </label>
        </div>
      </div>
      <div id="add-similar-question" class="margin-top">
        <h3> {{ $t('general.add') }}{{ $t('qalist.similar_question') }}: </h3>
        <input style="margin-left: 5px;" id="add-question" maxlength="200" :placeholder="$t('qalist.add_similar_question')" v-model="tempQuestion">
        <text-button style="margin-left: 15px;" @click="addQuestionFromInput()"> {{ $t('general.add') }} </text-button>
      </div>
    </div>
    <v-pagination size="small" :pageIndex="pageWording" :total="filteredQuestion.length" :pageSize="this.listPerPage" :layout="['total', 'prev', 'pager', 'next', 'jumper']" v-on:page-change="handlePageChange"></v-pagination>
  </div>
</template>

<script>
// import i18nUtil from '@/utils/i18nUtil';
// import CheckPop from '@/components/popForm/CheckPop';
import BatchAdd from './QABatchSimilarQuestionPop';

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
      curPage: 0,
      tempQuestion: '',
      filter: '',
      pageWording: 1,
      loading: false,
      action: '',
      dirtyQuestions: {},
      listPerPage: 9,
    };
  },
  computed: {
    showed() {
      return (this.value.copiedQuestions.length > 0);
    },
    pagedQuestions() {
      const pagedQuestions = this.filteredQuestion;
      const num = pagedQuestions.length;
      const start = this.curPage * this.listPerPage;
      const end = (num >= this.listPerPage) ? start + this.listPerPage : num;
      let ret = pagedQuestions.slice(start, end);
      if (ret.length < this.listPerPage) {
        const diff = this.listPerPage - ret.length;
        ret = ret.concat(Array.from({ length: diff }, () => ({
          content: '',
        })));
      }
      return ret;
    },
    filteredQuestion() {
      if (this.filter === '') {
        return this.value.copiedQuestions;
      }
      const filteredQuestion = [];
      this.value.copiedQuestions.forEach((q) => {
        if (q.content.indexOf(this.filter) > -1 || this.dirtyQuestions[q.content]) {
          filteredQuestion.push(q);
        }
      });

      this.curPage = 0;
      this.pageWording = 1;
      return filteredQuestion;
    },
  },
  mounted() {
  },
  methods: {
    autoHeight(e) {
      e.target.style.height = `${e.target.scrollHeight}px`;
    },
    checkFinish(question, index, e) {
      if (e.keyCode === 13) {
        e.target.blur();
        // this.questionOnBlur(question, index);
        e.preventDefault();
        e.stopPropagation();
        return true;
      }
      return false;
    },
    handlePageChange(page) {
      const showPage = page > 0 ? page : 1;
      const that = this;

      that.pageWording = 0;
      that.curPage = 0;
      that.$nextTick(() => {
        that.pageWording = showPage;
        that.curPage = showPage - 1;
      });
    },
    showOperationFailedWarning() {
      const that = this;
      this.loading = true;
      // const msg = i18nUtil.getLocaleMsgs(this.$i18n);
      this.action = that.$t('qalist.operation_failed');
      setTimeout(() => {
        this.loading = false;
      }, 2000);
    },
    addQuestion(question, pushFromBack) {
      if (/\S/.test(question)) {
        this.filter = '';
        this.value.everChange = true;
        const isDuplicate = this.isDuplicateQuestion(question);
        if (!isDuplicate) {
          if (pushFromBack) {
            this.pushNewQuestion(question);
          } else {
            this.appendNewQuestion(question);
          }
        } else {
          this.showAlert(this.$t('qalist.duplicate_question'));
        }
      }
    },
    addQuestionFromInput() {
      if (/\S/.test(this.tempQuestion)) {
        this.addQuestion(this.tempQuestion);
        this.tempQuestion = '';
      }
    },
    batchAddQuestion() {
      const options = {
        component: BatchAdd,
        ok_msg: this.$t('general.add'),
        cancel_msg: this.$t('general.cancel'),
        data: {
          batchQuestions: '',
        },
        callback: {
          ok: (data) => {
            this.filter = '';
            const questions = data.batchQuestions.split(/\n/);
            let hasDuplicate = false;
            questions.forEach((question) => {
              if (question.trim() !== '') {
                if (this.isDuplicateQuestion(question)) {
                  hasDuplicate = true;
                } else {
                  this.value.everChange = true;
                  this.appendNewQuestion(question);
                }
              }
            });
            if (hasDuplicate) {
              this.showAlert(this.$t('qalist.duplicate_batch_question'));
            }
          },
        },
      };
      this.$pop(options);
    },
    pushNewQuestion(question) {
      this.value.copiedQuestions = this.value.copiedQuestions.concat([{ content: question }]);
      this.value.everChange = true;
    },
    appendNewQuestion(question) {
      this.value.copiedQuestions.splice(0, 0, { content: question });
    },
    isDuplicateQuestion(question) {
      let isDuplicate = false;
      this.value.copiedQuestions.forEach((cq) => {
        if (question === cq.content) {
          isDuplicate = true;
        }
      });
      return isDuplicate;
    },
    showAlert(msg, okFunc) {
      const opts = {
        // component: CheckPop,
        ok_msg: this.$t('general.ok'),
        cancel_msg: this.$t('general.cancel'),
        data: {
          msg,
        },
      };
      if (okFunc !== undefined) {
        opts.callback = {
          ok: okFunc,
        };
      }
      // this.$root.$emit('showWindow', opts);
      this.$popCheck(opts);
    },
    deleteQuestion(sq) {
      const that = this;
      // show confirm pop
      const options = {
        // component: CheckPop,
        ok_msg: that.$t('general.ok'),
        cancel_msg: that.$t('general.cancel'),
        callback: {
          ok: () => {
            that.value.everChange = true;
            if (sq !== '') {
              const index = that.value.copiedQuestions.indexOf(sq);
              that.value.copiedQuestions.splice(index, 1);
              const totalQues = that.value.copiedQuestions.length;
              const totalPage = Math.ceil(totalQues / that.listPerPage, 10);
              if (that.pageWording !== 0 && that.pageWording > totalPage) {
                that.handlePageChange(totalPage);
              }
            }
          },
        },
        data: {
          msg: this.$t('qalist.confirm_delete_similar_question'),
          info: sq.content,
        },
      };
      // this.$root.$emit('showWindow', options);
      this.$popCheck(options);
    },
    setEditMode(question, index) {
      const questionContainer = this.$refs.questions.filter(x => x.dataset.id === `${index}`)[0];
      questionContainer.classList.add('focus');

      const questionArea = this.$refs.questionEdits.filter(x => x.dataset.id === `${index}`)[0];
      questionArea.value = question.content;
      questionArea.focus();
    },
    questionOnBlur(question, index) {
      const questionContainer = this.$refs.questions.filter(x => x.dataset.id === `${index}`)[0];
      questionContainer.classList.remove('focus');

      const questionArea = this.$refs.questionEdits.filter(x => x.dataset.id === `${index}`)[0];
      const newContent = questionArea.value;
      questionArea.value = '';
      questionArea.style.height = '';

      if (newContent.trim() === question.content.trim()) {
        return;
      }
      if (question.content.trim() !== '') {
        if (newContent.trim() === '') {
          this.deleteQuestion(question);
        } else {
          this.modifyQuestion(question, newContent, index);
        }
      } else if (question.content.trim() === '' && newContent.trim() !== '') {
        this.addQuestion(newContent, true);
      }
    },
    modifyQuestion(question, newContent, index) {
      let isDuplicate = false;
      this.value.copiedQuestions.forEach((cq) => {
        if (newContent === cq.content && question !== cq) {
          isDuplicate = true;
        }
      });
      if (!isDuplicate) {
        question.content = newContent;
        this.value.everChange = true;
        this.dirtyQuestions[newContent] = true;
        return true;
      }
      this.showAlert(this.$t('qalist.duplicate_question'), () => {
        this.setEditMode(question, index);
      });
      return false;
    },
  },
  watch: {
    filter() {
      // when filter changed, reset dirtyQuestions
      this.dirtyQuestions = {};
    },
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
$height: 30px;

#qa-similar-questions-pop {
    width: 400px;
    background-color: white;
    font-size: 12px;
    position: relative;

    .margin-top {
      margin-top: 10px;
    }

    h2 {
        font-weight: bold;
    }

    h3 {
      word-break: break-all;
    }

    #search-container {
      display: flex;
      height: $height;
      line-height: $height;
    }

    #keyword-search {
        width: 200px;
        height: $height;
    }

    #qa-similar-question-table {
      width: 100%;
      min-height: 300px;
      margin: 10px 0;
    }

    #table-header {
      display: flex;
      height: 20px;
      line-height: 20px;
      text-align: center;
      border: solid 1px black;

      background-color: #6da6db;
      color: white;
    }

    #add-similar-question{
      display: flex;
      height: $height;
      line-height: $height;
    }

    #add-question {
      width: 150px;
    }

    .cell-little {
        width: 20%;
    }
    .cell-large {
        width: 60%;
        border: solid 1px black;
        border-top: 0px;
        border-bottom: 0px;
        word-break: break-all;
    }

    .row {
        width: 100%;
        display: flex;
        text-align: center;
        border: solid 1px black;

        &:first-child {
          border-top: 0px;
        }
        &:not(:last-child) {
          border-bottom: 0px;
        }

        line-height: 20px;
        .content-num {
          order: 1;
          width: 20%;
          flex:1 1 20px;
        }
        .content-edit {
          order: 2;
          width: 60%;
          flex:3 3 60px;
          overflow: visible;

          &.focus {
            background: #e8f3ff;
            & ~ label, & + div {
              background: #e8f3ff;
            }

            .actual-input {
              height: 100%;
            }
          } 

          position: relative;
          .actual-input {
            z-index: 1;
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            resize: none;
  
            padding: 0px;
            height: 0;
            border: 0px;
            background-color: #e8f3ff;

            overflow-y: hidden;
          }

        }
        .content-delete {
          order: 3;
          width: 20%;
          flex:1 1 20px;
          color: blue;
        }
    }

    .operation-button {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      cursor: pointer;
      justify-content: center;
    }
}

</style>