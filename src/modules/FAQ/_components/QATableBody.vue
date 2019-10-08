<template>
  <div id="qa-table-body" class="table">
    <div class="row" v-for="row in tableData" style="width:100%;" :key="row.standard_q">
      <div @contextmenu.stop.prevent="handleRightClick(row, $event)"
        id="standard_q" class="cell padding"> 
        <div class="standard-q-column">
          <div class="standard-q-text">
            <input @change="resetAllSelect()" type="checkbox" :value="row" v-model="selectedQuestions">
            <div class="question-text">
            {{row.standard_q}} 
            </div>
          </div>
          <div class="dummy"></div>
          <div class="more">
            <div class="text">...</div>
          </div>
        </div>
        <ol :class="{clickable: canEdit}" @click="showCategoryPop(row)">
          <!-- <span class="ans-category">
            {{ row.categories[row.categories.length - 1] }}
            <div class="tooltip">{{ row.categories.join("/") }}</div>
          </span> -->
          <li :class="{clickable: canEdit}" v-for="category in row.categories" style="word-break: break-all;" :key="category"> {{ category }} </li>
        </ol>
        <div :class="{clickable: canEdit}" @click="showSimilarQuestionPop(row)" class="similar-question-container"> {{ $t('qalist.similar_question') }}: {{ row.similar_count }}</div>
      </div>
      <div id="answer-container" class="cell">
          <div  class="table answer-row with-right-border no-left-border">
            <div class="row" v-for="(answer, index) in row.answers" @contextmenu.stop.prevent="handleAnswerRightClick(row, answer, $event)" :key="index">
              <div id="tags" class="cell padding" @dblclick="showDimensionSelector(row, answer)" v-if="answer.tags !== ''"> {{answer.tags}} </div>
              <div id="tags" class="cell padding" @dblclick="showDimensionSelector(row, answer)" v-else> {{$t('qalist.all_dimensions')}} </div>
              <!-- <div class="label cell padding" @dblclick="showLabelEditor(row, answer)">
                {{answer.labelName || $t('qalist.empty_label')}}
              </div> -->
              <div class="cell standard_a block-with-text" @dblclick="showEditor(row, answer)" >
                <qa-answer-content :answerContent="answer.standard_a"></qa-answer-content>
              </div>
              <!-- <div id="commands" class="cell default-box padding" @dblclick="showCommandSelector(row, answer)"> {{ answer.command }}</div>
              <div id="dynamic_menu" class="cell default-box padding" @dblclick="showRelatedQDynamicMenuEditor(row, answer)" 
                style="word-break: break-all;">
                <div class="dynamic-menu-container">
                  <div class="dynamic-menu-list">
                    <div v-if="answer.not_show_in_relative_q"> {{$t('qalist.select_not_in_recommendation')}} </div>
                    <ol v-if="answer.dynamic_menu.length > 0">
                      {{$t('qalist.dynamic_menu')}}:
                      <li v-for="menu in answer.dynamic_menu" :key="menu">
                        {{ menu }}
                      </li>
                    </ol>
                    <ol v-if="answer.related_q.length > 0">
                      {{$t('qalist.related_question')}}:
                      <li v-for="rq in answer.related_q" :key="rq">
                        {{ rq }}
                      </li>
                    </ol>
                  </div>
                  <div class="dummy"></div>
                  <div class="more">
                    <div class="text">...</div>
                  </div>
                </div>
              </div> -->
              <!-- <div id="start_time" class="cell default-box padding" @dblclick="showDatePicker(row, answer)">{{ removeSecond(answer.start_time) }}</div>
              <div id="end_time" class="cell default-box padding" @dblclick="showDatePicker(row, answer)">{{ removeSecond(answer.end_time) }}</div> -->
              <div class="valid_time cell default-box padding" @dblclick="showDatePicker(row, answer)">
                <template v-if="isForever(answer.start_time, answer.end_time)">{{ $t('qalist.forever_valid') }}</template>
                <template v-else>
                  <div>{{ getShowTimeString(answer.start_time, 'start') }}</div>
                  <div>{{ $t('qalist.to') }}</div>
                  <div>{{ getShowTimeString(answer.end_time, 'end') }}</div>
                </template>
              </div>
            </div>
          </div>
      </div>
      
    </div>
    <div class="empty-row" v-if="!tableData || tableData.length === 0">
      {{ $t('qalist.no_question') }}
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapGetters } from 'vuex';
// import i18nutils from '@/utils/i18nUtil';
import PickerUtil from '@/utils/vue/DatePickerUtil';
import DimensionSelector from '@/components/DimensionSelector';
import QAapi from '../_api/qalist';

import AnswerCmdList from '../_data/answerCommandList';
// import auth from '@/auth';

import QACommandPop from './QACommandPop';
import QADynamicMenuPop from './QADynamicMenuPop';
import QADatePickerPop from './QADatePickerPop';
import qaAnswerContent from './QAAnswerContent';
import QASimilarQuestionPop from './QASimilarQuestionPop';
import QAAnswerEditorPop from './QAAnswerEditorPop';
import QAQuestionCategoryPop from './QAQuestionCategoryPop';
import QAUpdatePop from './QAUpdatePop';

Vue.component('qa-answer-content', qaAnswerContent);

export default {
  api: QAapi,
  watch: {
    tableData() {
      // reset allSelect when tableData change
      this.resetAllSelect();
    },
  },
  name: 'QATableBody',
  data() {
    return {
      selectedQuestions: [],
      maxDynamicMenuList: 6,
    };
  },
  mounted() {
    this.$root.$on('QASimilarQuestionPop::backToQASimilarQuestionPop', this.showSimilarQuestionPop);
  },
  beforeDestroy() {
    this.$root.$off('QASimilarQuestionPop::backToQASimilarQuestionPop', this.showSimilarQuestionPop);
  },
  methods: {
    showLabelEditor(row, answer) {
      console.log(row);
      console.log(answer);
    },
    isStartTimeForever(time) {
      return time === '' || time === PickerUtil.FOREVER_START_TIME;
    },
    isEndTimeForever(time) {
      return time === '' || time === PickerUtil.FOREVER_END_TIME;
    },
    isForever(start, end) {
      return this.isEndTimeForever(end) && this.isStartTimeForever(start);
    },
    getShowTimeString(time, showType) {
      const that = this;
      if (showType === 'start') {
        if (that.isStartTimeForever(time)) {
          return that.$t('qalist.no_limit');
        }
        return that.removeSecond(time);
      }
      if (that.isEndTimeForever(time)) {
        return that.$t('qalist.no_limit');
      }
      return that.removeSecond(time);
    },
    resetAllSelect() {
      // reset allSelect when checkbox values change
      this.$emit('resetAllSelect');
    },
    showCategoryPop(row) {
      if (!this.canEdit) {
        return;
      }
      const options = {
        component: QAQuestionCategoryPop,
        data: {
          categories: row.categories,
          categoryID: row.categoryID,
          newCategoryID: row.categoryID,
        },
        callback: {
          ok: (data) => {
            const oldId = parseInt(data.categoryID, 10);
            const newId = parseInt(data.newCategoryID, 10);
            if (oldId !== newId) {
              this.$api.queryQuestionDetail({ question_id: row.questionID }).then((detail) => {
                const updateOptions = {
                  content: row.standard_q,
                  categoryid: data.newCategoryID.toString(),
                  similar_question_count: parseInt(row.similar_count, 10),
                  question_id: row.questionID,
                  answer_json: JSON.stringify(this.createAnswerJson(detail.answerItem)),
                  edituser: this.$cookie.get('userid'),
                };
                return this.$api.updateQuestion(updateOptions).then(() => this.$root.$emit('QATable::SQUpdated'));
              }).then(() => {
                // update table
                this.$root.$emit('QATable::SQUpdated');
              }).catch(this.showUpdateFailWarning);
            }
          },
        },
      };
      // this.$root.$emit('showWindow', options);
      this.$pop(options);
    },
    removeSecond(timeStr) {
      return (timeStr) ? timeStr.substring(0, timeStr.length - 3) : '';
    },
    selectAllQuestion(allSelect) {
      if (allSelect) {
        this.tableData.forEach((row) => {
          this.selectedQuestions.push(row);
        });
      } else {
        this.selectedQuestions = [];
      }
    },
    encodedContent(content) {
      return content.replace(/<img.+?>/g, `[${this.$t('qalist.image')}]`);
    },
    showUpdateFailWarning() {
      const that = this;
      // const msg = i18nutils.getLocaleMsgs(this.$i18n);
      // const options = {
      //   buttons: ['ok'],
      //   data: {
      //     msg: that.$t('error_msg.update_qa_error'),
      //   },
      // };
      // that.$popCheck(options);
      this.$notify({ text: that.$t('error_msg.update_qa_error'), type: 'fail' });
      // this.$root.$emit('showWindow', options);
      this.$root.$emit('QATable::SQUpdated');
    },
    updateAnswer(row, answer, index, updatedValue) {
      const that = this;
      const testDiv = document.createElement('div');
      testDiv.innerHTML = updatedValue.newContent;

      if (!(/\S/.test(testDiv.innerText)) && testDiv.innerHTML.indexOf('<img') === -1) {
        return;
      }
      answer.standard_a = that.encodedContent(updatedValue.newContent);

      this.$api.queryQuestionDetail({ question_id: row.questionID })
        .then((data) => {
          data.answerItem[index].answerContent = updatedValue.newContent;
          // row.originAnswers = data.answerItem;
          const options = {
            content: row.standard_q,
            categoryid: row.categoryID,
            similar_question_count: parseInt(row.similar_count, 10),
            question_id: row.questionID,
            answer_json: JSON.stringify(that.createAnswerJson(data.answerItem)),
            edituser: that.$cookie.get('userid'),
          };
          return this.$api.updateQuestion(options).then(() => {
            that.$root.$emit('QATable::SQUpdated');
          });
        })
        .then(() => this.$api.activeQA())
        .then(() => {
          that.$notify({ text: that.$t('error_msg.save_success') });
        })
        .catch((err) => {
          this.showUpdateFailWarning(err);
        });
    },
    showEditor(row, answer) {
      const that = this;
      if (!this.canEdit) {
        return;
      }
      // const originAnswer = JSON.parse(JSON.stringify(answer));
      this.$api.queryQuestionDetail({ question_id: row.questionID }).then((response) => {
        const index = that.findAnswerIndex(response.answerItem, answer);
        let answerContent = response.answerItem[index].answerContent;
        answerContent = decodeURIComponent(answerContent);
        // that.$root.$emit('showWindow', {
        that.$pop({
          ok_msg: that.$t('general.save'),
          callback: {
            ok: (updatedValue) => { that.updateAnswer(row, answer, index, updatedValue); },
          },
          component: QAAnswerEditorPop,
          data: {
            content: answerContent,
            newContent: '',
          },
        });
      });
    },
    updateAnswerDimensions(row, answer, dimensions) {
      let tags = '';
      let first = true;
      const that = this;
      const selectedDimensions = [];
      const originAnswerFormatDimension = [];
      // display
      dimensions.forEach((dimenstionType) => {
        if (!dimenstionType.allChecked) {
          const values = dimenstionType.values;
          let dimensionStr = '';
          values.forEach((value, valueIndex) => {
            if (value.checked) {
              if (first) {
                tags += `${value.text}`;
                first = false;
              } else {
                tags += `,${value.text}`;
              }

              if (valueIndex === 0) {
                dimensionStr += `${value.text}`;
              } else {
                dimensionStr += `,${value.text}`;
              }

              selectedDimensions.push(value.tagId);
            }
          });
          originAnswerFormatDimension.push(dimensionStr);
        }
      });
      answer.tags = tags;

      this.$api.queryQuestionDetail({ question_id: row.questionID }).then((data) => {
        const index = that.findAnswerIndex(data.answerItem, answer);
        const localIndex = that.findAnswerIndex(row.originAnswers, answer);

        row.originAnswers[localIndex].dimension = originAnswerFormatDimension;
        data.answerItem[index].tags = selectedDimensions;
        const options = {
          content: row.standard_q,
          categoryid: row.categoryID,
          similar_question_count: parseInt(row.similar_count, 10),
          question_id: row.questionID,
          answer_json: JSON.stringify(that.createAnswerJson(data.answerItem)),
          edituser: that.$cookie.get('userid'),
        };
        return this.$api.updateQuestion(options).then(() => {
          that.$root.$emit('QATable::SQUpdated');
        });
      })
      .then(() => this.$api.activeQA())
      .then(() => {
        that.$notify({ text: that.$t('error_msg.save_success') });
      })
      .catch((err) => {
        that.showUpdateFailWarning(err);
      });
    },
    showDimensionSelector(row, answer) {
      if (!this.canEdit) {
        return;
      }

      const dimensions = this.qaTagTypes;
      const selectedValues = answer.tags.toLowerCase().split(',');
      dimensions.forEach((dimension) => {
        const values = dimension.values;
        values.forEach((value) => {
          if (selectedValues.indexOf(value.text.toLowerCase()) > -1) {
            value.checked = true;
            dimension.allChecked = false;
          }
        });
      });

      const options = {
        component: DimensionSelector,
        data: dimensions,
        callback: {
          ok: (selectedDimensions) => {
            this.updateAnswerDimensions(row, answer, selectedDimensions);
          },
        },
      };
      // this.$root.$emit('showWindow', options);
      this.$pop(options);
    },
    updateAnswerCommand(row, answer, data) {
      const that = this;
      // const msg = i18nutils.getLocaleMsgs(this.$i18n);
      const answerCmdStr = (data.selected === 'shopping') ? data.answerCMDMsg : this.$api.parseAnswerCommand(data.selected);
      answer.command = `${that.$t('qalist.command')}:${this.$api.parseAnswerCommand(data.selected)}`;
      if (data.selected === 'shopping') {
        answer.command += `[${answerCmdStr}]`;
      }

      this.$api.queryQuestionDetail({ question_id: row.questionID }).then((detailQ) => {
        const index = this.findAnswerIndex(detailQ.answerItem, answer);
        const localIndex = this.findAnswerIndex(row.originAnswers, answer);
        detailQ.answerItem[index].answerCMD = data.selected;
        detailQ.answerItem[index].answerCMDMsg = answerCmdStr;

        row.originAnswers[localIndex].Answer_CMD = data.selected;
        row.originAnswers[localIndex].Answer_CMD_Msg = answerCmdStr;
        const options = {
          content: row.standard_q,
          categoryid: row.categoryID,
          similar_question_count: parseInt(row.similar_count, 10),
          question_id: row.questionID,
          answer_json: JSON.stringify(this.createAnswerJson(detailQ.answerItem)),
          edituser: this.$cookie.get('userid'),
        };
        return this.$api.updateQuestion(options).then(() => this.$root.$emit('QATable::SQUpdated'));
      }).then(() => this.$api.activeQA()).catch((err) => {
        this.showUpdateFailWarning(err);
      });
    },
    showCommandSelector(row, answer) {
      if (!this.canEdit) {
        return;
      }
      const msg = this.$i18n.messages[this.$i18n.locale];
      const commands = AnswerCmdList.getLocaleData(msg.qalist);

      const options = {
        component: QACommandPop,
        data: {
          items: commands,
          selected: answer.Answer_CMD || commands[0].id,
          answerCMDMsg: (answer.Answer_CMD === 'shopping') ? answer.Answer_CMD_Msg : '',
        },
        callback: {
          ok: (data) => {
            this.updateAnswerCommand(row, answer, data);
          },
        },
      };
      this.$pop(options);
      // this.$root.$emit('showWindow', options);
    },
    getSelectedQuestions() {
      return this.selectedQuestions;
    },
    deleteSelectedQuestions() {
      const that = this;
      const ids = [];
      const options = {
        data: {
          msg: that.$t('qalist.delete_selected_standard_q'),
        },
        callback: {
          ok: () => {
            this.selectedQuestions.forEach((question) => {
              ids.push(question.questionID);
            });

            // delete question and reload QA
            const deleteOptions = {
              question_id: ids,
            };
            return this.$api.deleteQuestion(deleteOptions).then(() => {
              this.$root.$emit('QATable::rowDeleted');
              this.selectedQuestions = [];
            });
          },
        },
      };
      that.$popCheck(options);
      // this.$root.$emit('showWindow', options);
    },
    showSimilarQuestionPop(row) {
      const that = this;
      if (!this.canEdit) {
        return;
      }
      // const msg = i18nutils.getLocaleMsgs(this.$i18n);
      const options = {
        question_id: row.questionID,
        page_limit: 10000,
        cur_page: 0,
      };
      const okMsg = that.$t('general.save');
      const cancelMsg = that.$t('general.cancel');
      this.$api.querySimilarQuestions(options).then((data) => {
        this.$pop({
        // this.$root.$emit('showWindow', {
          component: QASimilarQuestionPop,
          ok_msg: okMsg,
          cancel_msg: cancelMsg,
          clickOutsideClose: false,
          buttons: ['ok', 'cancel'],
          data: {
            standard_q: row.standard_q,
            similar_count: data.similar_question.length,
            questionId: row.questionID,
            similarQuestions: data.similar_question,
            copiedQuestions: JSON.parse(JSON.stringify(data.similar_question)),
            everChange: false,
            row,
          },
          callback: {
            ok: (props) => {
              if (that.canEdit && props.everChange) {
                this.$root.$emit('QAList::loading', this.showLoading);
                this.$api.addSimilarQuestions(props.questionId, this.$cookie.get('userid'), props.copiedQuestions).then(() => {
                  this.$root.$emit('QAList::loaded', this.showLoading);
                  this.$root.$emit('QATable::SQUpdated');
                }).catch((err) => {
                  this.$root.$emit('QAList::loaded', this.showLoading);
                  this.showUpdateFailWarning(err);
                });
              }
            },
          },
        });
      });
    },
    createAnswerJson(answers) {
      const answerJsons = [];
      answers.forEach((answer) => {
        const answerJson = {
          id: answer.id || '0',
          dimension: answer.tags || [],
          answer: decodeURIComponent(answer.answerContent),
          relatedQ: answer.relativeQ,
          begin_time: answer.beginTime,
          end_time: answer.endTime,
          image: answer.image || '',
          dynamicMenu: answer.dynamicMenu || [],
          not_show_in_relative_q: answer.notShow === '1',
          answerCMD: (answer.answerCMD === 'no-order') ? '' : answer.answerCMD,
          answerCMDMsg: (answer.answerCMD === 'shopping') ? answer.answerCMDMsg : this.$api.parseAnswerCommand(answer.answerCMD),
        };
        answerJsons.push(answerJson);
      });
      return answerJsons;
    },
    deleteAnswer(row, answer) {
      // 注意!
      // 先fecth 其他 answer 的 detail (未處理過的answre content)
      // 將被刪除的answer從 answer arry中移除
      // 然後更新question
      if (row.answers.length === 1) {
        // no more answers delete question
        this.deleteQuestion(row);
        return;
      }

      this.$api.queryQuestionDetail({ question_id: row.questionID })
        .then((data) => {
          const index = row.answers.indexOf(answer);
          row.answers.splice(index, 1);
          row.originAnswers.splice(index, 1);
          data.answerItem.splice(index, 1);

          const options = {
            content: row.standard_q,
            categoryid: row.categoryID,
            similar_question_count: parseInt(row.similar_count, 10),
            question_id: row.questionID,
            answer_json: JSON.stringify(this.createAnswerJson(data.answerItem)),
            edituser: this.$cookie.get('userid'),
          };

          return this.$api.deleteAnswer(options);
        });
    },
    confirmDeleteAnswer(row, answer) {
      // show confirm message box
      const that = this;
      // this.$root.$emit('showWindow', {
      that.$popCheck({
        title: that.$t('qalist.delete_standard_a'),
        data: {
          msg: that.$t('qalist.confirm_delete_standard_a_msg'),
        },
        callback: {
          ok: () => { this.deleteAnswer(row, answer); },
        },
      });
    },
    handleAnswerRightClick(row, answer, $event) {
      if (!this.canDelete) {
        return;
      }

      // show context menu
      // const i18nobj = i18nutils.getLocaleMsgs(this.$i18n);
      const that = this;
      const options = {
        x: $event.clientX,
        y: $event.clientY,
        menu: [
          {
            text: that.$t('qalist.delete_standard_a'),
            callback: () => { this.confirmDeleteAnswer(row, answer); },
          },
        ],
      };
      this.$root.$emit('showContextMenu', options);
    },
    deleteQuestion(row) {
      // delete question and reload QA
      const options = {
        question_id: [row.questionID],
      };
      this.$api.deleteQuestion(options)
        .then(() => {
          this.$root.$emit('QATable::rowDeleted', row);
        });
    },
    confirmDeleteQuestion(row) {
      // show confirm message box
      const that = this;
      // this.$root.$emit('showWindow', {
      that.$popCheck({
        title: that.$t('qalist.delete_standard_q'),
        data: {
          msg: that.$t('qalist.confirm_delete_standard_q_msg'),
        },
        callback: {
          ok: () => { this.deleteQuestion(row); },
        },
        ok_msg: that.$t('general.ok'),
      });
    },
    showQuestionEdtior(row) {
      this.$api.queryQuestionDetail({ question_id: row.questionID }).then((response) => {
        response.answerItem.forEach((answer, index) => {
          const originAnswer = row.originAnswers[index];
          const answerContent = answer.answerContent;
          originAnswer.Content_String = decodeURIComponent(answerContent);
          originAnswer.id = answer.id;
          const options = {
            component: QAUpdatePop,
            data: {
              questionText: row.standard_q,
              answers: row.originAnswers,
              categoryid: row.categoryID,
              questionid: row.questionID,
            },
            callback: {
              ok: (q) => {
                q.question_id = row.questionID;
                q.answer_json = JSON.stringify(q.answer_json);
                this.$api.updateQuestion(q).then(() => {
                  this.$root.$emit('QATable::SQUpdated');
                  return this.$api.activeQA();
                }).catch((error) => {
                  this.showUpdateFailWarning(error);
                });
              },
            },
            validate: true,
          };
          // this.$root.$emit('showWindow', options);
          this.$pop(options);
        });
      });
    },
    listToString(list) {
      let str = '';
      let first = true;
      list.forEach((item) => {
        if (/\S/.test(item)) {
          if (first) {
            first = false;
            str += `${item}`;
          } else {
            str += `,${item}`;
          }
        }
      });
      return str;
    },
    updateAnswerDynamicMenu(row, answer, data) {
      if (data.selected === 'dynamic_menu') {
        answer.dynamic_menu = data.dynamic_menu.filter(value => true && value);
        answer.related_q = [];
      } else if (data.selected === 'relatedQ') {
        answer.related_q = data.related_q.filter(value => true && value);
        answer.dynamic_menu = [];
      } else if (data.selected === 'not_indicate') {
        answer.related_q = [];
        answer.dynamic_menu = [];
      }
      answer.not_show_in_relative_q = data.not_show;

      this.$api.queryQuestionDetail({ question_id: row.questionID }).then((response) => {
        const index = this.findAnswerIndex(response.answerItem, answer);
        const localIndex = this.findAnswerIndex(row.originAnswers, answer);
        if (data.selected === 'dynamic_menu') {
          response.answerItem[index].dynamicMenu = data.dynamic_menu;
          response.answerItem[index].relativeQ = [];
        } else if (data.selected === 'relatedQ') {
          response.answerItem[index].relativeQ = data.related_q;
          response.answerItem[index].dynamicMenu = [];
        } else if (data.selected === 'not_indicate') {
          response.answerItem[index].relativeQ = [];
          response.answerItem[index].dynamicMenu = [];
        }
        response.answerItem[index].notShow = (data.not_show) ? '1' : '0';
        row.originAnswers[localIndex].DynamicMenu = response.answerItem[index].dynamicMenu;
        row.originAnswers[localIndex].RelatedQuestion = response.answerItem[index].relativeQ;
        row.originAnswers[localIndex].Not_Show_In_Relative_Q = response.answerItem[index].notShow;
        const options = {
          content: row.standard_q,
          categoryid: row.categoryID,
          similar_question_count: parseInt(row.similar_count, 10),
          question_id: row.questionID,
          answer_json: JSON.stringify(this.createAnswerJson(response.answerItem)),
          edituser: this.$cookie.get('userid'),
        };
        return this.$api.updateQuestion(options).then(() => this.$root.$emit('QATable::SQUpdated'));
      }).then(() => this.$api.activeQA()).catch((err) => {
        this.showUpdateFailWarning(err);
      });
    },
    showRelatedQDynamicMenuEditor(row, answer) {
      if (!this.canEdit) {
        return;
      }
      const copiedDynamicMenu = JSON.parse(JSON.stringify(answer.dynamic_menu));
      const copiedRelatedQuestions = JSON.parse(JSON.stringify(answer.related_q));
      const options = {
        component: QADynamicMenuPop,
        data: {
          not_show: answer.not_show_in_relative_q,
          dynamic_menu: copiedDynamicMenu,
          related_q: copiedRelatedQuestions,
          selected: '',
        },
        callback: {
          ok: (data) => {
            this.updateAnswerDynamicMenu(row, answer, data);
          },
        },
        validate: true,
      };
      if (options.data.dynamic_menu.length > 0) {
        options.data.selected = 'dynamic_menu';
      } else if (options.data.related_q.length > 0) {
        options.data.selected = 'relatedQ';
      } else {
        options.data.selected = 'not_indicate';
      }
      // this.$root.$emit('showWindow', options);
      this.$pop(options);
    },
    updateStartEndTime(row, answer, data) {
      answer.start_time = PickerUtil.toTimeString(data.picker);
      answer.end_time = PickerUtil.toTimeString(data.endPicker);
      this.$api.queryQuestionDetail({ question_id: row.questionID }).then((response) => {
        const index = this.findAnswerIndex(response.answerItem, answer);
        const localIndex = this.findAnswerIndex(row.originAnswers, answer);

        response.answerItem[index].beginTime = answer.start_time;
        response.answerItem[index].endTime = answer.end_time;
        row.originAnswers[localIndex].Begin_Time = answer.start_time;
        row.originAnswers[localIndex].End_Time = answer.end_time;
        const options = {
          content: row.standard_q,
          categoryid: row.categoryID,
          similar_question_count: parseInt(row.similar_count, 10),
          question_id: row.questionID,
          answer_json: JSON.stringify(this.createAnswerJson(response.answerItem)),
          edituser: this.$cookie.get('userid'),
        };
        return this.$api.updateQuestion(options).then(() => this.$root.$emit('QATable::SQUpdated'));
      }).then(() => this.$api.activeQA()).catch((err) => {
        this.showUpdateFailWarning(err);
      });
    },
    showDatePicker(row, answer) {
      if (!this.canEdit) {
        return;
      }
      let type;
      let picker;
      let endPicker;
      const isStartTimeForever = answer.start_time === PickerUtil.FOREVER_START_TIME;
      const isEndTimeForever = answer.end_time === PickerUtil.FOREVER_END_TIME;

      const isForever = (isStartTimeForever && isEndTimeForever);
      const isEmpty = (!answer.start_time || !answer.end_time);
      if (isForever || isEmpty) {
        type = 'forever';
        picker = PickerUtil.createYesterdayFromNowPicker();
        endPicker = PickerUtil.createNowPicker();
      } else {
        type = 'self-defined';
        picker = PickerUtil.createPickerByTimeStr(answer.start_time);
        endPicker = PickerUtil.createPickerByTimeStr(answer.end_time);
      }
      const options = {
        component: QADatePickerPop,
        customContentClasses: ['visible-overflow'],
        data: {
          picker,
          endPicker,
          type,
        },
        callback: {
          ok: (data) => {
            this.updateStartEndTime(row, answer, data);
          },
        },
        validate: true,
      };
      // this.$root.$emit('showWindow', options);
      this.$pop(options);
    },
    handleRightClick(row, $event) {
      // show context menu
      // const i18nobj = i18nutils.getLocaleMsgs(this.$i18n);

      const that = this;
      const menu = [];
      if (this.canEdit) {
        menu.push({
          text: that.$t('qalist.edit_standard_q'),
          callback: () => { this.showQuestionEdtior(row); },
        });
      }
      if (this.canDelete) {
        menu.push({
          text: that.$t('qalist.delete_standard_q'),
          callback: () => { this.confirmDeleteQuestion(row); },
        });
      }
      if (menu.length <= 0) {
        return;
      }


      const options = {
        x: $event.clientX,
        y: $event.clientY,
        menu,
      };
      this.$root.$emit('showContextMenu', options);
    },
    findAnswerIndex(answers, targetAnswer) {
      let index = -1;
      let found = false;
      answers.forEach((answer, i) => {
        if (found) {
          return;
        }

        if (answer.id === targetAnswer.id) {
          index = i;
          found = true;
        }
      });
      return index;
    },
  },
  props: ['tableData'],
  computed: {
    ...mapGetters([
      'qaTagTypes',
    ]),
    canEdit() {
      // return auth.checkPrivilege('qalist', 'edit');
      return true;
    },
    canDelete() {
      // return auth.checkPrivilege('qalist', 'delete');
      return true;
    },
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
div {
  display: inline-block;
  vertical-align: top;
}
h1, h2 {
  font-weight: normal;
}

a {
  color: #42b983;
}

ul {
  list-style: circle inside;
  padding-left: 10px;
}

li {
  font-size: 12px;
  list-style-position:inside;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;   
}

.clickable {
  cursor: pointer;
}

input {
  min-width: 12px;
  min-height: 12px;
}


$fill-parent: 100%;
$fixed-height: 142px;

#qa-table-body {
    width: $fill-parent;
    height: $fill-parent;
    overflow-y: scroll; 

    &.table {
        display: table;
        table-layout: fixed;
        .row {
          & > .cell:last-child {
            border-right: solid black 1px;
          }
        }
        .row:first-child {
          & > .cell {
            border-top: none;
          }
        }
        .row:last-child {
          & > .cell {
            border-bottom: solid black 1px;
          }
        }
        .table {
            .cell:hover {
              background-color: #E8F3FF;
            }
            & > .row {
                & > .cell {
                    &:first-child {
                      border-left: none;
                    }
                    &:last-child {
                      border-right: none;
                    }
                }
                &:last-child {
                    & > .cell {
                        border-bottom: none;
                    }
                }
            }
        }
    }

    .table {
        width: $fill-parent;
        display: table;
        table-layout: fixed;
    }

    .row {
        display:table-row;
        max-height: 50px;
    }
    .empty-row {
      display: table-cell;
      text-align: center;
      height: 30px;
      line-height: 30px;
      font-size: 14px;
      border: 1px solid black;
      border-top: none;
    }

    .cell {
        border: solid black 1px;
        border-right: 0px;
        border-bottom: 0px;
        display: table-cell;
    }

    .padding {
        padding: 5px;
    }

    $width_5percent: 5%;
    .answer-row {
        width: 100%;
        height: 100%;

        .label {
          width: $width_5percent;
          word-break: break-all;
        }

        .standard_a {
            width: 50%;
        }

        .default-box {
            height: $fill-parent;
            word-wrap: break-word;
        }

        .answer-content {
            width: $fill-parent;
            height: 80%;
            word-wrap: break-word;
        }

        .table {
            width: $fill-parent;
            display: table;
            table-layout: fixed;
        }

        #tags {
            width: $width_5percent;
            word-wrap: break-word;
        }
    }

    #commands {
        width: $width_5percent;
    }

    .label {
        width: $width_5percent;
    }

    #dynamic_menu {
        width: 16%;
        $showline: 11;
        overflow: hidden;
        &:hover {
          background-color: #E8F3FF;
          & > .dynamic-menu-container > .more > .text {
            background-color: #E8F3FF;
          }
        }
        .dynamic-menu-container {
          width: 200%;
          height: #{$showline}em;
          overflow: hidden;
          line-height: 1em;
          .dynamic-menu-list {
            float: left;
            width: 50%;
            min-height: #{$showline}em;
            ol {
              li {
                font-size: 12px;
                list-style-position:inside;
                white-space: normal;
              }
              li:before {
                margin-right: 5px;
                content: "•";
              }
            }
            margin-right: 0;
          }
          .dummy {
            float: left;
            width: 50%;
            height: #{$showline}em;
            opacity: 0.8;
            pointer-events: none;
          }
          .more {
            width: 50%;
            float: left;
            margin-left: 0px;
            &:after {
              clear: both;
            }
            & > .text {
              width: 100%;
              margin-left: -100%;
              margin-top: -12px;
              height: 1em;
              background: #f2f2f2;
            }
            background: blue;
          }
        }
    }

    #start_time {
        width: $width_5percent;
    }

    #end_time {
        width: $width_5percent;
      //  border-right: solid black 1px;
    }

    .valid_time {
        width: 2 * $width_5percent;
        vertical-align: middle;
        & > div {
          display: block;
          text-align: center;
          line-height: 2em;
        }
    }

    .question-text {
      word-break: break-all;
      width: calc(100% - 25px);
    }

    .similar-question-container {
      color: #0099FF;
      bottom: 0;
    }


    #standard_q {
      width: 15%;
      height: auto;
      &:hover {
        background-color: #E8F3FF;
        & > .standard-q-column > .more > .text {
          background-color: #E8F3FF;
        }
      }
      .standard-q-column {
        width: 200%;
        height: 3em;
        overflow: hidden;
        .standard-q-text {        
          display: flex;
          align-items: flex-start;
          float: left;
          width: 50%;
          line-height: 1em;
          min-height: 2em;
          overflow: hidden;

          .question-text {
            word-break: break-all;
            width: calc(100% - 25px);
          }
        }
        .dummy {
          width: 50%;
          height: 3em;
        }
        .more {
          width: 10%;
          float: left;
          &:after {
            clear: both;
          }
          & > .text {
            width: 25px;
            margin-left: -20px;
            margin-top: -1em;
            background: #f2f2f2;
          }
          background: blue;
        }
      }
      ol {
        margin: 8px 0;
        height: 60px;
        li:before {
          margin-right: 5px;
          content: "•";
        }
      }
    }
    .ans-category {
      font-size: 12px;
      position: relative;

      .tooltip {
        position: absolute;
        visibility: hidden;
        background: white;
        box-shadow: 1px 1px 5px black;
        border-radius: 5px;

        line-height: 20px;
        box-sizing: border-box;
        padding: 5px 20px;
        white-space: nowrap;

        left: 0;
        top: -30px;
      }

      &:hover {
        .tooltip {
          visibility: visible;
        }
      }
    }
}
div {
  font-size: 12px;
}
</style>