<template>
  <div id="qa-update-qa-container">
    <div style="margin-left: 17%;">
      <label>{{ $t('qalist.belong_categories') }}</label>
      <label @click="categoryShowed = !categoryShowed" style="background-color:#d9d9d9; cursor:pointer;"> {{ categoryText }} </label>
      <div id="categories" v-if="categoryShowed">
        <tree-item :treeData="un_category" :parent="-1" :level="0" v-on:itemClicked="setCategory"></tree-item>
        <template v-for="(tree, idx) in categories.children">
          <tree-item :treeData="tree" :parent="0" :level="tree.level" v-on:itemClicked="setCategory" :key="idx"></tree-item>
        </template>
      </div>
      <div id="qa-question-input" class="margin-top">
        <div class="center-align" style="color: red;">*</div>
        <div class="center-align margin-left"> {{ $t('qalist.standard_q') }} </div>
        <input maxlength="200" class="margin-left" v-model="questionText" />
      </div>
      <div class="qa-answer-edit-boxes margin-top" v-for="(answer, index) in answers" :key="index">
        <qa-answer-edit-box
         ref="answerBox"
         :id="answer.id || 0"
         :onAddAnswer="answer.onAddAnswer"
         :onRemoveAnswer="answer.onRemoveAnswer"
         :defaultAnswer="answer.default" 
         :dimensions="answer.dimensions" 
         :editorOptions="answer.editorOptions"
         :picker="answer.picker"
         :timeType="answer.timeType"
         :command="answer.command"
         :commandMsg="answer.commandMsg"
         :relatedQuestions="answer.relatedQuestions"
         :dynamicMenu="answer.dynamicMenu"
         :notShowInRelativeQ="answer.notShowInRelativeQ"
         :endPicker="answer.endPicker"
         v-on:enableOK="enableOK"
         v-on:disableOK="disableOK">
        </qa-answer-edit-box>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import pickerUtil from '@/utils/vue/DatePickerUtil';
// import i18nUtil from '@/utils/i18nUtil';
import TreeItem from './TreeItem';
import QAAnswerEditBox from './QAAnswerEditBox';
// import CheckPop from '@/components/popForm/CheckPop';
import QAapi from '../_api/qalist';

const FOREVER_START_TIME = '1970-01-01 00:00:00';
const FOREVER_END_TIME = '2999-12-31 23:59:00';

export default {
  api: QAapi,
  props: {
    value: {
      type: Object,
      default() {
        return {
        };
      },
    },
  },
  data() {
    return {
      answers: undefined,
      savedAnswers: [],
      questionText: '',
      originQuestionText: '',
      categories: [],
      categorymap: {},
      selectedCategory: -1,
      categoryShowed: false,
      un_category: {
      },
    };
  },
  computed: {
    ...mapGetters([
      'qaTagTypes',
    ]),
    categoryText() {
      const that = this;
      if (this.selectedCategory === -1) {
        // const msg = i18nUtil.getLocaleMsgs(this.$i18n);
        return that.$t('qalist.un_category');
      }
      return this.categorymap[this.selectedCategory];
    },
  },
  mounted() {
    // const msg = i18nUtil.getLocaleMsgs(this.$i18n);
    const that = this;
    that.un_category = { text: that.$t('qalist.un_category'), children: {}, id: -1 };
    that.$on('validate', that.validateQuestion);
    this.$api.getCategories().then((updatedData) => {
      that.categories = updatedData;
      that.createCategoryMap();
      that.categorymap[that.un_category.id] = that.un_category.text;

      if (that.value.questionText) {
        that.questionText = that.value.questionText;
        that.originQuestionText = that.value.questionText;
      }

      if (that.value.categoryid) {
        that.selectedCategory = that.value.categoryid;
      }

      if (!that.value.answers || that.value.answers.length === 0) {
        that.answers = [];
        that.answers.push(that.createEmptyAnswerObj());
      } else {
        that.answers = [];
        that.value.answers.forEach((answer, index) => {
          const transformedAnswer = that.transformAnswer(answer);
          if (index === 0) {
            transformedAnswer.default = true;
          }
          that.answers.push(transformedAnswer);
          that.savedAnswers.push(transformedAnswer);
        });
      }
    });
  },
  methods: {
    showWarning(msg) {
      const options = {
        // component: CheckPop,
        buttons: ['ok'],
        data: {
          msg,
        },
      };
      // this.$root.$emit('showWindow', options);
      this.$popCheck(options);
    },
    validateQuestion() {
      const that = this;
      if (!(/\S/.test(this.questionText))) {
        // show empty question message
        // const msg = i18nUtil.getLocaleMsgs(this.$i18n);
        that.showWarning(that.$t('qalist.question_empty_warning_msg'));
      } else {
        // if adding a new question, check if question conflict
        // else updating a question & question content is modified, check question conflict
        const addQuestion = (that.originQuestionText === '');
        const questionChanged = (that.originQuestionText !== '') && (that.questionText !== that.originQuestionText);
        const shouldCheck = addQuestion || questionChanged;
        if (shouldCheck) {
          this.$api.querySingleQuestion(that.questionText)
          .then(() => {
            that.showWarning(that.$t('qalist.question_exist'));
          })
          .catch(() => {
            // 404 means question does not conflict
            that.formQuestion();
          });
        } else {
          that.formQuestion();
        }
      }
    },
    formQuestion() {
      const that = this;
      const question = {
        content: that.questionText,
        categoryid: that.selectedCategory,
        similar_question_count: 0,
        answer_json: [],
        createuser: that.$cookie.get('userid'),
      };
      let validated = true;
      for (let i = 0; i < that.$refs.answerBox.length; i += 1) {
        const answerEditorBox = that.$refs.answerBox[i];
        const answer = answerEditorBox.data;
        const testDiv = document.createElement('div');

        // test contains string or at least image tags
        testDiv.innerHTML = answer.editorOptions.content;
        if ((/\S/.test(testDiv.innerText)) || testDiv.innerHTML.indexOf('<img') > -1) {
          const json = {
            id: answer.id,
            answer: answer.editorOptions.content,
            dynamicMenu: answer.dynamicMenu,
            relatedQ: answer.relatedQuestions,
            answerCMD: answer.command,
            answerCMDMsg: (answer.command === 'shopping') ? answer.commandMsg : this.$api.parseAnswerCommand(answer.command),
            not_show_in_relative_q: answer.notShowInRelativeQ,
            image: '',
          };

          // create dimensions
          const dimension = [];
          let tagString = '';
          let firsted = true;
          answer.dimensions.forEach((category) => {
            if (!category.checked) {
              category.values.forEach((value) => {
                if (value.checked) {
                  if (firsted) {
                    firsted = false;
                    tagString += `${value.text}`;
                  } else {
                    tagString += `,${value.text}`;
                  }
                  dimension.push(value.tagId);
                }
              });
            }
          });
          json.dimension = dimension;
          json.tagString = tagString;

          // create begin_time/end_time
          if (answer.timeType === 'forever') {
            json.begin_time = FOREVER_START_TIME;
            json.end_time = FOREVER_END_TIME;
          } else {
            json.begin_time = pickerUtil.toTimeString(answer.picker);
            json.end_time = pickerUtil.toTimeString(answer.endPicker);
          }
          question.answer_json.push(json);
        } else if (answer.defaultAnswer) {
          validated = false;
          this.showWarning(that.$t('qalist.answer_empty_warning_msg'));
          break;
        }
      }

      if (validated) {
        this.$emit('validateSuccess', question);
      }
    },
    createEmptyAnswerObj() {
      const that = this;
      const dimensions = that.qaTagTypes;
      const picker = pickerUtil.createYesterdayFromNowPicker();
      const endPicker = pickerUtil.createNowPicker();
      return {
        default: !(that.answers.length > 0),
        onAddAnswer: that.addNewAnswer,
        onRemoveAnswer: that.removeAnswer,
        dimensions,
        editorOptions: {
          content: '',
          newContent: '',
        },
        picker,
        endPicker,
        timeType: 'forever',
        command: '',
        commandMsg: '',
        relatedQuestions: [],
        dynamicMenu: [],
        notShowInRelativeQ: false,
      };
    },
    addNewAnswer() {
      const answerObj = this.createEmptyAnswerObj();
      this.answers.push(answerObj);
    },
    removeAnswer(index) {
      this.answers.splice(index, 1);
    },
    setCategory(categoryid) {
      this.selectedCategory = categoryid;
      this.categoryShowed = false;
    },
    createCategoryMap() {
      let queue = [];
      queue.push(this.categories);
      while (queue.length > 0) {
        const category = queue.shift();
        if (category.children && category.children.length > 0) {
          queue = queue.concat(category.children);
        }
        this.categorymap[category.id] = category.text;
      }
    },
    getDimensionsFromMap(answerDimensionMap) {
      const that = this;
      const dimensions = that.qaTagTypes;
      const dimensionMap = {};
      dimensions.forEach((d) => {
        dimensionMap[d.id] = d;
      });
      Object.keys(answerDimensionMap).forEach((id) => {
        const answerValues = answerDimensionMap[id].toLowerCase().split(',');
        const allValue = dimensionMap[id].values;
        allValue.forEach((value) => {
          const valueIndex = answerValues.indexOf(value.text.toLowerCase());
          if (valueIndex >= 0) {
            value.checked = true;
            dimensionMap[id].allChecked = false;
          }
        });
      });
      return dimensions;
    },
    getDimensions(answerDimensions) {
      const that = this;
      const dimensions = that.qaTagTypes;
      answerDimensions.forEach((answerDimension, dimensionIndex) => {
        const answerValues = answerDimension.toLowerCase().split(',');
        const allValue = dimensions[dimensionIndex].values;
        allValue.forEach((value) => {
          const valueIndex = answerValues.indexOf(value.text.toLowerCase());
          if (valueIndex >= 0) {
            value.checked = true;
            dimensions[dimensionIndex].allChecked = false;
          }
        });
      });
      return dimensions;
    },
    transformAnswer(answer) {
      //   picker,
      //   endPicker,
      //   timeType: 'forever',
      let timeType = 'forever';
      let picker = pickerUtil.createYesterdayFromNowPicker();
      let endPicker = pickerUtil.createNowPicker();
      if (answer.Begin_Time !== FOREVER_START_TIME || answer.End_Time !== FOREVER_END_TIME) {
        timeType = 'self-defined';
        picker = pickerUtil.createPickerByTimeStr(answer.Begin_Time);
        endPicker = pickerUtil.createPickerByTimeStr(answer.End_Time);
      }
      const transformedAnswer = {
        id: answer.id,
        command: (answer.Answer_CMD === 'no-order') ? '' : answer.Answer_CMD,
        commandMsg: (answer.Answer_CMD === 'shopping') ? answer.Answer_CMD_Msg : '',
        default: false,
        onAddAnswer: this.addNewAnswer,
        onRemoveAnswer: this.removeAnswer,
        notShowInRelativeQ: !(answer.Not_Show_In_Relative_Q === '0'),
        relatedQuestions: answer.RelatedQuestion,
        dynamicMenu: answer.DynamicMenu,
        editorOptions: {
          content: answer.Content_String,
          newContent: answer.Content_String,
        },
        dimensions: this.getDimensionsFromMap(answer.dimension_map),
        picker,
        endPicker,
        timeType,
      };
      return transformedAnswer;
    },
    enableOK() {
      let ok = true;
      this.$refs.answerBox.forEach((box) => {
        ok = ok && box.checkOk();
      });
      if (ok) {
        this.$emit('enableOK', {});
      }
    },
    disableOK() {
      this.$emit('disableOK', {});
    },
  },
  components: {
    'qa-answer-edit-box': QAAnswerEditBox,
    'tree-item': TreeItem,
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
$container_width: 70%;
#qa-update-qa-container {
  width: 100vw;
  height: 100vh;

  .center-align {
    display: flex;
    align-items:center;
    justify-content:center;
  }

  .margin-left {
    margin-left: 10px;
  }

  .margin-top {
    margin-top: 20px;
  }

  #qa-question-input {
    width: $container_width;
    height: 50px;
    display: flex;
    border: solid 1px gray;
    padding-left: 20px;

    input {
      width: 600px;
      height: 75%;
      border: solid 1px gray;
      margin-top: 7.5px;
    }
  }

  .qa-answer-edit-box {
    width: $container_width;
  }

  #categories {
    width: 500px;
    height: 500px;
    position: absolute;
    background-color: white;
    border: 1px solid gray;
    z-index:1002;
    overflow: auto;
  }

  #categories /deep/ div {
    display: inline-block;
  }

  #categories /deep/ .tree-item {
    padding-left: 2em;
  }
}

#qa-update-qa-container /deep/ .tree-item-list {
  list-style: none;
}
</style>