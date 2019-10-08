<template>
   <div id="learing-feedback" class="learning-page">
     <div class="display-container">
       <div id="table-body" class="display-area">
        <div id="table-header"> 
          <div class="content"> {{ $t('learning.feedback.description') }} </div>
        </div>
        <template v-for="record in records">
          <div class="table-no-hover-row" :key="record.content">
            <div class="content display-row" v-bind:class="{ 'disable-row': isRecordDisabled(record)}"> 
              <input type="checkbox" v-model="selectedRecords" :value="record" :disabled="isRecordDisabled(record)">
              <label class="feadback-content"> {{ record.content }} </label>
              <div @click="revoke(record)" class="clickable" style="margin-left: auto;" v-if="record.resolved"> {{ $t('learning.feedback.revoke') }} </div>
            </div>
          </div>
        </template>
        <div v-if="selected || inProgress" class="cover">
          <div class="wording" v-if="wording !== ''">
            {{ wording }}
          </div>
        </div>
       </div>
       <div class="bottom">
         <v-pagination :total="totalRecordCount" :pageSizeOption="[10]" :layout="['total', 'prev', 'pager', 'next', 'jumper']" v-on:page-change="handlePageChange"></v-pagination>
       </div>
     </div>
     <div v-if="!selected" class="display-container">
       <div class="resolve-container">
         <div id="resolve-reminder">{{ $t('learning.feedback.start_reminder') }}</div>
         <div @click="startResolving" id="resolve-button" 
              v-bind:class=" {'resolve-button-disabled': !selectedRecordsNumValid, 'resolve-button-enabled': selectedRecordsNumValid} "> 
              {{ $t('learning.feedback.start') }} 
          </div>
       </div>
     </div>
     <div v-else class="display-container">
       <div id="table-body" class="display-area">
        <div id="table-header"> 
          <div class="content vertical-align">
            {{ $t('learning.feedback.select_quesetion') }} 
            <div id="search-box" style="margin-left: auto;">
              <input ref="searchInput" v-model="keyword" style="height: 60%;" @keypress="pressToSearch" @focus="selectSearchAll">
              <span id="searchx" @click="search"> {{ $t('general.search') }} </span>
            </div>
          </div>
        </div>
        <div class="table-row">
            <div @click="addNewQuestion()" class="content display-row" style="cursor: pointer;">
              +{{ $t('learning.feedback.add_standardq') }}
            </div>
        </div>
        <div style="overflow:auto;">
          <template v-for="(question, index) in standardQs">
            <div class="table-no-hover-row" :key="question.content">
              <div class="content display-row">
                <input type="radio" name="question" :value="index" v-model="selectedQuestionIndex">
                <label> {{ question.content }} </label>
                <div @click="showSimilarQuestion(question)" style="margin-left: auto;" class="clickable"> {{ $t('learning.feedback.view') }} </div>
              </div>
            </div>
          </template>
        </div>
         <div class="table-no-hover-row" v-if="!searched && standardQs.length === 0">
          <div class="content display-row">
            {{ $t('learning.feedback.no_recommend_q') }}
          </div>
        </div>
        <div class="table-no-hover-row" v-if="searched && standardQs.length === 0">
          <div class="content display-row">
            {{ $t('learning.feedback.unmatched_standard_q') }}
          </div>
        </div>
        <div v-if="inSearching" class="cover">
          <div class="wording">
            {{ $t('general.loading') }}
          </div>
        </div>
       </div>
       <div class="bottom">
         <div @click="cancel()" class="button-cancel"> {{ $t('general.cancel') }}</div>
         <div @click="addToQuestion()" class="button-confirm" :class="{'button-confirm-disabled':selectedQuestionIndex === -1}">{{ $t('general.ok') }}</div>
       </div>
     </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import SimilarQuestionsPop from '../../_components/learning/SimilarQuestionsPop';
import QAUpdatePop from '../../_components/QAUpdatePop';
// import CheckPop from '@/components/popForm/CheckPop';

import QAAPI from '../../_api/qalist';
import LearningAPI from '../../_api/learning';

export default {
  api: [QAAPI, LearningAPI],
  data() {
    return {
      keyword: '',
      standardQs: [],
      recommendQs: [],
      selectedQuestionIndex: -1,
      selectedRecords: [],
      selected: false,
      inProgress: false,
      inSearching: false,
      wording: '',
      currentPage: 0,
      searched: false,
    };
  },
  computed: {
    ...mapGetters([
      'learningSelectedCollection',
      'learningSelectedCluster',
      'searchCategoryID',
    ]),
    records() {
      const records = this.learningSelectedCluster.records;
      return records;
    },
    totalRecordCount() {
      return this.learningSelectedCluster.totalRecords;
    },
    selectedRecordsNumValid() {
      return (this.selectedRecords.length > 0) && (this.selectedRecords.length <= 20);
    },
  },
  watch: {
    keyword() {
      if (this.keyword === '') {
        this.standardQs = this.recommendQs;
        this.selectedQuestionIndex = -1;
        this.searched = false;
      }
    },
  },
  methods: {
    ...mapMutations([
      'doQuery',
      'setSelectedCluster',
    ]),
    changeLearningRecordPage(page) {
      const that = this;
      const collection = that.learningSelectedCollection;
      const cluster = that.learningSelectedCluster;

      return that.$api.queryRecords(collection.id, cluster.id, page, 10)
      .then((records) => {
        const fullCluster = {
          id: cluster.id,
          label: cluster.label,
          records,
          totalRecords: cluster.totalRecords,
        };
        that.setSelectedCluster(fullCluster);
      });
    },
    isRecordDisabled(record) {
      return record.resolved || record.content.length > 150;
    },
    selectSearchAll() {
      this.$refs.searchInput.select();
    },
    pressToSearch(event) {
      if (event.keyCode === 13) {
        this.search();
      }
    },
    search() {
      if (!(/\S/.test(this.keyword))) {
        // empty string show notification
        const msg = this.$t('learning.feedback.keyword_emtpy');
        this.showMessagePop(msg);
        return;
      }
      const queryOptions = {
        dimension: [],
        set_time_range: 0,
        permanent: 1,
        begin_time: '',
        end_time: '',
        set_key_word: 1,
        key_word_type: '问题',
        key_word: this.keyword,
        relative_question: 0,
        dynamic_menu: 0,
        not_show: 0,
        category_id: 0,
        page_limit: 100,
        cur_page: 0,
      };
      this.inSearching = true;
      this.$api.getContent(queryOptions)
      .then(this.parseQuestions)
      .catch(() => {
        const msg = this.$t('error_msg.handle_learning_error');
        this.showMessagePop(msg);
      })
      .finally(() => {
        this.inSearching = false;
        this.searched = true;
        this.selectedQuestionIndex = -1;
      });
    },
    parseQuestions(response) {
      const newStandardQs = [];
      response.content.forEach((question) => {
        const standardQ = {
          id: question.questionID,
          content: question.standard_q,
        };
        newStandardQs.push(standardQ);
      });
      this.standardQs = newStandardQs;
    },
    addToQuestion() {
      const selectedQuestion = this.standardQs[this.selectedQuestionIndex];
      if (!selectedQuestion) {
        return;
      }

      if (this.wording !== '') {
        return;
      }

      this.addToQuestionImpl(selectedQuestion);
    },
    addToQuestionImpl(selectedQuestion) {
      // to add a record as a similar question to a standard question
      // we shoud:
      // 1. query similar questions of the standard question
      // 2. add the record to similar questions and update
      // 3. notify learning api
      this.wording = this.$t('general.loading');
      return this.querySimilarQuestions(selectedQuestion.id)
      .then(response => this.parseSimilarQuestions(response))
      .then(similarQuestions => this.updateSimiarQuestions(selectedQuestion, similarQuestions))
      .then(() => this.setRecordResolved(selectedQuestion))
      .then(() => this.block(500))
      .then(() => this.changeLearningRecordPage(this.currentPage))
      .then(() => this.doQuery(true))
      .catch((err) => {
        console.error(err);
        const msg = this.$t('error_msg.handle_learning_error');
        this.showMessagePop(msg);
      })
      .finally(() => {
        this.wording = '';
        this.cancel();
        this.selectedRecords = [];
      });
    },
    querySimilarQuestions(id) {
      const queryOptions = {
        question_id: id,
        page_limit: 10000,
        cur_page: 0,
      };
      return this.$api.querySimilarQuestions(queryOptions);
    },
    parseSimilarQuestions(response) {
      const similarQuestions = [];
      response.similar_question.forEach((sq) => {
        similarQuestions.push({ content: sq.content });
      });
      return similarQuestions;
    },
    updateSimiarQuestions(selectedQuestion, similarQuestions) {
      const user = this.$cookie.get('userid');

      this.selectedRecords.forEach((record) => {
        similarQuestions.push({ content: record.content });
      });

      return this.$api.addSimilarQuestions(selectedQuestion.id, user, similarQuestions);
    },
    removeFromSiliarQuestions(record, similarQuestions) {
      const newSimilarQuestions = [];
      similarQuestions.forEach((similarQuestion) => {
        if (similarQuestion.content !== record.content) {
          newSimilarQuestions.push(similarQuestion);
        }
      });
      return newSimilarQuestions;
    },
    setRecordResolved(selectedQuestion) {
      const resolvedRecords = [];
      this.selectedRecords.forEach((record) => {
        resolvedRecords.push(record.id);
      });
      return this.$api.resolveRecords(selectedQuestion.content, resolvedRecords);
    },
    block(time) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, time);
      });
    },
    showSimilarQuestion(question) {
      this.querySimilarQuestions(question.id)
      .then((response) => {
        const similarQuestions = [];
        response.similar_question.forEach((sq) => {
          similarQuestions.push(sq);
        });
        return similarQuestions;
      })
      .then((similarQuestions) => {
        if (this.selected) {
          this.showSimilarQuestionPop(question.content, similarQuestions);
        }
      });
    },
    showSimilarQuestionPop(questionContent, similarQuestions) {
      const options = {
        component: SimilarQuestionsPop,
        data: {
          question: questionContent,
          similarQuestions,
        },
        buttons: ['ok'],
        ok_msg: this.$t('general.close'),
      };
      this.$pop(options);
    },
    setSelected(selected) {
      this.selected = selected;
    },
    addNewQuestion() {
      this.$pop({
        component: QAUpdatePop,
        ok_msg: this.$t('general.save'),
        cancel_msg: this.$t('general.cancel'),
        data: {
          categoryid: this.searchCategoryID,
        },
        callback: {
          ok: (question) => {
            question.answer_json.forEach((ans) => {
              ans.images = this.checkInsertedImageId(ans.answer, ans.images);
            });
            question.answer_json = JSON.stringify(question.answer_json);
            return this.$api.createQuestion(question)
                  .then(() => this.$api.querySingleQuestion(question.content))
                  .then((newQuesiton) => {
                    const id = newQuesiton.questionID;
                    const content = question.content;
                    return this.addToQuestionImpl({ id, content });
                  })
                  .then(() => this.$api.activeQA())
                  .then(() => this.doQuery(true));
          },
        },
        validate: true,
      });
    },
    checkInsertedImageId(content, answerImgs) {
      const imgReg = /<img.*?src="(.*?)".*?\/>/g;
      let match = imgReg.exec(content);
      const imgurls = [];
      const imgIds = [];
      while (match !== null) {
        if (imgurls.indexOf(match[1]) === -1) {
          imgurls.push(match[1]);
        }
        match = imgReg.exec(content);
      }
      imgurls.forEach((url) => {
        const insertedImg = answerImgs.filter(img => img.url === url);
        if (insertedImg.length > 0) {
          imgIds.push(insertedImg[0].id);
        }
      });
      return imgIds;
    },
    revoke(record) {
      // to revoke a chat record from a standard question
      // 1. query the similar questions of the standard question
      // 2. delete the chat record in the similar questions & update similar questions
      // 3. notify learning api

      let cachedQuestion;
      this.wording = this.$t('general.loading');
      this.inProgress = true;
      return this.$api.querySingleQuestion(record.stdQuestion)
      .then((question) => {
        cachedQuestion = question;
        return cachedQuestion;
      })
      .then(question => this.querySimilarQuestions(question.questionID))
      .then(this.parseSimilarQuestions)
      .then(similarQuestions => this.removeFromSiliarQuestions(record, similarQuestions))
      .then((similarQuestions) => {
        const user = this.$cookie.get('userid');
        return this.$api.addSimilarQuestions(cachedQuestion.questionID, user, similarQuestions);
      })
      .catch((error) => {
        const NotFoundMsg = 'Request failed with status code 404';
        if (error.message === NotFoundMsg) {
          // because question might be  earased after full import
          // so we ignore the 404 not found here
          console.error(error);
        } else {
          throw error;
        }
      })
      .then(() => this.$api.revokeRecord(record))
      .then(() => this.changeLearningRecordPage(this.currentPage))
      .then(() => this.doQuery(true))
      .then(() => {
        const msg = this.$t('learning.feedback.revoke_success');
        this.showMessagePop(msg);
      })
      .catch(() => {
        const msg = this.$t('error_msg.handle_learning_error');
        this.showMessagePop(msg);
      })
      .finally(() => {
        this.wording = '';
        this.inProgress = false;
      });
    },
    cancel() {
      this.keyword = '';
      this.standardQs = [];
      this.recommendQs = [];
      this.searched = false;
      this.setSelected(false);
      this.selectedQuestionIndex = -1;
    },
    handlePageChange(pageIndex) {
      this.currentPage = pageIndex - 1;
      this.inProgress = true;
      this.wording = this.$t('general.loading');
      this.changeLearningRecordPage(this.currentPage)
      .catch(() => {
        const msg = this.$t('error_msg.handle_learning_error');
        this.showMessagePop(msg);
      })
      .finally(() => {
        this.wording = '';
        this.inProgress = false;
      });
    },
    showMessagePop(msg) {
      const options = {
        buttons: ['ok'],
        data: {
          msg,
        },
      };
      this.$popCheck(options);
    },
    startResolving() {
      if (this.selectedRecords.length === 0) {
        const msg = this.$t('learning.feedback.should_select');
        this.showMessagePop(msg);
      } else if (this.selectedRecords.length > 20) {
        const msg = this.$t('learning.feedback.should_select_less');
        this.showMessagePop(msg);
      } else {
        const requestRecords = this.selectedRecords.map(record => record.content);
        this.$api.queryRecommendForMe(requestRecords)
        .then((response) => {
          this.recommendQs = response.slice(0, 15).map(ques => ({
            id: ques.questionId,
            content: ques.content,
          }));
          this.standardQs = this.recommendQs;
          this.setSelected(true);
        })
        .catch(() => {
          const msg = this.$t('error_msg.handle_learning_error');
          this.showMessagePop(msg);
        });

        this.setSelected(true);
      }
    },
  },
};
</script>

