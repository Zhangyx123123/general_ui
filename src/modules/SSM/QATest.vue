<template>
<div id="qatest" class="page">
  <div class="qa-test-filter"> 
    <div class="filter-list row">
      {{ $t('qatest.user_dimension') }}：
      <template v-if="noDimensionSelected">{{ $t('qatest.unselect') }}</template>
      <template v-for="categoryType in tagTypes" v-if="!categoryType.allChecked">
        <div class="filter-item" v-for="value in categoryType.values" :key="value.text" v-if="value.checked" :data-key="categoryType.type" :data-val="value.text" ref="filters">
          <span class="filter-item-text">
            {{value.text}}
            <span v-on:click="cancelFilter(categoryType, value)" class="filter-item-cancel">
              x
            </span>
          </span>
        </div>
      </template>
      <span v-on:click="cancelAllFilter()" class="clear-all" v-if="!noDimensionSelected">{{ $t('qatest.clear_all') }}</span>
    </div>
  </div>
  <div class="content">
    <div class="qa-test-main">
      <div class="qa-test-title title">
        {{ $t('qatest.qatest') }}
      </div>
      <div class="qa-test-list">
        <div class="qa-test-container" ref="qaBox">
          <div class="qa-test-inner-container">
            <div v-for="(chat, idx) in chatData" :class="chat.role" class="qa-test-row" :key="idx">
              <div class="qa-test-text">
                <span>
                  <span v-html="chat.text"></span>
                  <span class="link" v-for="(line, idx) in chat.data" :key="idx" @click="sendUserText(line)">
                    {{ idx + 1 }}. {{ line }}
                  </span>
                </span>
              </div>
              <div class="empty-zone"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="qa-test-input">
        <textarea v-model="userInput"
          @keydown="checkKey"
          @compositionstart="inComposition = true"
          @compositionend="inComposition = false"/>
      </div>
      <div class="qa-test-control">
        <text-button @click="selectDimension">{{ $t('qatest.dimension') }}</text-button>
        <text-button main @click="sendText">{{ $t('qatest.submit') }}</text-button>
      </div>
    </div>
    <div class="qa-test-info">
      <div class="qa-test-info-block">
        <div class="qa-test-info-title title">
          {{ $t('qatest.analysis') }}
        </div>
        <div class="qa-test-info-content">
          <div>intent： {{intent || $t('qatest.unknown') }}</div>
          <div>emotion： {{emotion || $t('qatest.unknown')}}</div>
          <div>{{ $t('qatest.token') }}： {{ tokens }}</div>
        </div>
      </div>
      <div class="qa-test-info-block">
        <div class="qa-test-info-title title">
          {{ $t('qatest.match_result') }}
        </div>
        <div class="qa-test-info-content">
          <div v-for="result in matchResult" :key="result.std_q" class="similar-group">
            <div>{{ $t('qatest.similar_question') }}：{{result.std_q}}</div>
            <div>{{ $t('qatest.similar_score') }}：{{result.score}}</div>
            <br>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import DimensionSelector from '@/components/DimensionSelector';
import TextButton from '@/components/basic/TextButton';
import tagAPI from '@/api/tagType';
import api from '../FAQ/_api/qatest';
import listAPI from '../FAQ/_api/qalist';

export default {
  path: 'qatest',
  privCode: 'qatest',
  displayNameKey: 'qatest',
  icon: 'white_chat',
  name: 'qa-test',
  components: {
    TextButton,
  },
  api: [api, listAPI, tagAPI],
  data() {
    return {
      i18n: {},
      userInput: '',
      chatData: [],
      intent: '',
      emotion: '',
      tokens: '',
      matchResult: [],
      inComposition: false,
      multiAnswerDelay: 2000, // milliseconds
      tagTypes: [],
    };
  },
  methods: {
    selectDimension() {
      const that = this;
      that.$pop({
        title: that.$t('qatest.filter_dimension'),
        component: DimensionSelector,
        data: this.tagTypes,
        extData: {
          type: 'radio',
        },
      });
    },
    scrollToBottom() {
      this.$refs.qaBox.scrollTop = this.$refs.qaBox.scrollHeight;
    },
    checkKey(e) {
      if (e.keyCode === 13 || e.key === 'Enter') {
        // If user is typping in composition mode,
        // skip Enter which made composition finish fist
        if (this.inComposition) {
          return;
        }
        if (!e.shiftKey) {
          if (this.userInput.trim().length > 0) {
            this.sendText();
          }
          e.preventDefault();
        }
      }
    },
    sendUserText(text) {
      const that = this;
      that.appendChat(text);

      const filter = {};
      if (that.$refs.filters) {
        that.$refs.filters.forEach((item) => {
          filter[item.dataset.key] = item.dataset.val;
        });
      }

      that.$api.QATest(text, filter).then((data) => {
        const res = data.data;
        if (res.status === 0 && res.result.answers && res.result.answers.length > 0) {
          that.appendChatArrayDelay(res.result.answers, 'robot');

          that.tokens = res.result.tokens.join(', ');
          that.emotion = res.result.emotion || that.$t('qatest.unknown');
          that.intent = res.result.intent || that.$t('qatest.unknown');
          that.matchResult = res.result.similar_question || [];
        } else {
          that.$popError(that.$t('error_msg.server_error'), res.message);
        }
      }, () => {
        // general.handleAPIError(that, err).catch((value) => {
        //   general.popErrorWindow(that, that.i18n.error_msg.server_error, value.errMsg);
        // });
      });
    },
    sendText() {
      const that = this;

      if (that.userInput.trim().length <= 0) {
        that.$popError(that.$t('error_msg.input_empty'));
        return;
      }
      that.sendUserText(that.userInput);
      that.userInput = '';
    },
    handleTextNode(node) {
      if (node.subType === 'text') {
        return node.value;
      } else if (node.subType === 'relatelist' || node.subType === 'guslist') {
        return node.value;
      }
      const convertedText = node.value.replace(/<a/g, '<a target="_blank"');
      return convertedText;
    },
    appendChatArrayDelay(chats, char) {
      const that = this;
      that.appendChat(chats[0], char);
      if (chats.length > 1) {
        setTimeout(() => {
          that.appendChatArrayDelay(chats.slice(1), char);
        }, that.multiAnswerDelay);
      }
    },
    appendChat(text, role) {
      const that = this;
      try {
        const answerObj = JSON.parse(text);
        console.log(answerObj);
        that.chatData.push({
          role: role || 'user',
          text: that.handleTextNode(answerObj),
          data: answerObj.data,
        });
      } catch (err) {
        that.chatData.push({
          role: role || 'user',
          text,
        });
      }
      that.$nextTick(that.scrollToBottom);
    },
    cancelAllFilter() {
      this.tagTypes.forEach((category) => {
        category.allChecked = true;
        category.values.forEach((value) => {
          value.checked = false;
        });
      });
    },
    cancelFilter(categoryType, value) {
      value.checked = false;
      const allNotChecked = categoryType.values.reduce((ret, val) => !val.checked && ret, true);
      categoryType.allChecked = allNotChecked;
    },
  },
  mounted() {
    const that = this;
    this.$api.getTagTypes().then((data) => {
      that.tagTypes = data;
    });
  },
  computed: {
    noDimensionSelected() {
      return this.tagTypes.reduce((ret, val) => ret && val.allChecked, true);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "styles/variable";

$row-height: 50px;
$column-header-color: $table-header-background;
$column-border-color: black;

#qatest {
  padding: 10px;
  .qa-test-filter {
    min-height: $row-height;
    line-height: $row-height;
    
    .filter-list {
      // overwrite the height property of row
      &.row {
        height: auto;
      }
      div {
        display: inline-block;
      }

      .filter-item {
        .filter-item-text {
          padding: 2px 5px;
          margin: 0px 5px;
          border: 1px solid $column-border-color;
          border-radius: 0.5em;
          background: $column-header-color;
          cursor: default;
        }
        .filter-item-cancel {
          margin: 0px 5px;
          user-select: none;
          cursor: pointer;
        }
      }

      .clear-all {
        display: inline-block;
        color: blue;
        text-decoration: underline;
        font-size: 0.8em;
        user-select: none;
        cursor: pointer;
      }
    }
  }
  .content {
    display: flex;
    align-items: stretch;
    // height: calc(100% - #{$row-height} - 20px);
    height: calc(100% - 50px);

    .qa-test-main {
      width: 80%;
      flex: 4 1 400px;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      
      .qa-test-title {
        border: 1px solid black;
      }

      .qa-test-list {
        flex: 1 1 auto;
        padding: 0;
        display: flex;
        flex-direction: column-reverse;
        align-items: stretch;
        .qa-test-container {
          flex: 1 1 100px;
          background: white;
          // border: 1px solid black;
          overflow-y: auto;
          align-items: stretch;
          border: 1px solid black;
          border-top: none;
          padding: 10px 0;

          .qa-test-inner-container {
            display: flex;
            flex-direction: column;
            .qa-test-row {
              display: flex;

              &.robot {
                .qa-test-text {
                  ul, ol {
                    list-style: initial;
                    padding-left: 20px;
                    padding-top: 10px;
                    line-height: 15px;
                  }
                  ol {
                    list-style: decimal;
                  }
                }
                .link {
                  text-decoration: underline;
                  color: #2b85e4;
                  cursor: pointer;
                }
              }
              &.user {
                flex-direction: row-reverse;
                .qa-test-text {
                  text-align: right;
                  span {
                    background: $page-menu-color;
                    color: white;
                  }
                }
              }
              & > .qa-test-text {
                flex: 1 1 500px;
                margin: 0 10px;
                margin-bottom: 10px;
                & > span {
                  display: inline-block;
                  word-break: break-all;
                  border: 1px solid $page-menu-color;
                  border-radius: 10px;
                  padding: 5px 10px;
                  white-space: pre-line;

                  a:visited {
                    color: blue;
                  }
                }
              }
              .empty-zone {
                flex: 1 1 100px;
              }
            }
          }
        }
      }
      .qa-test-input {
        flex: 0 0 100px;
        padding: 10px 0;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        
        textarea {
          resize: none;
          height: 100%;
          word-break: break-all;
        }
      }
      .qa-test-control {
        flex: 0 0 $row-height;
        line-height: $row-height;
        text-align: right;
      }
    }

    .qa-test-info {
      width: 20%;
      flex: 1 0 200px;
      padding: 0 0 0 10px;

      display: flex;
      flex-direction: column;
      align-items: stretch;
      .qa-test-info-block {
        flex: 1 1 100px;
        border: 1px solid $column-border-color;

        &:not(:first-child) {
          margin-top: 10px;
        }
      }
      .qa-test-info-content {
        line-height: $row-height;
        padding: 0 10px;
      }
    }
  }
  .title {
    text-align: center;
    line-height: $row-height;
    background: $column-header-color;
    border-bottom: 1px solid $column-border-color;
  }
}
</style>
