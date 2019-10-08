<template>
  <div class="robot-special-words">
    <div class="card w-fill h-fill">
      <nav-bar :options=pageMap v-model="currentPage"></nav-bar>
      <div class="words-list">
        <template v-for="words in wordsList">
        <div class="words" :key="words.type"
          v-if="words.page === currentPage">
          <div class="words-title">
            <div class="title-text">{{ words.name }}</div>
            <div class="icon-container" v-tooltip="words.tooltip">
              <icon icon-type="info" :size="18" enableHover></icon>
            </div>
          </div>
          <div class="button-container">
            <text-button v-if="canEdit" button-type="primary" @click="popAddWordsContent(words)">{{ $t('general.add') }}</text-button>
          </div>
          <div class="words-contents">
            <div class="row header">
              <div class="content">{{ $t('chat_skill.chat_skill') }}</div>
              <template v-if="canEdit">
              <div class="command">{{ $t('general.operation') }}</div>
              <div class="command"></div>
              </template>
            </div>
            <template v-if="words.contents.length === 0">
              <div class="row body">
                <div class="empty-row">{{ $t('chat_skill.add_new_msg', {item: words.name}) }}</div>
              </div>
            </template>
            <div v-for="content in words.contents" :key="content.id" class="row body">
              <div class="content">{{content.content}}</div>
              <template v-if="canEdit">
              <div class="command edit" @click="popEditWordsContent(words, content)">
                {{ $t('general.edit') }}
              </div>
              <div class="command delete" @click="popDeleteWordsContent(words, content)">
                {{ $t('general.delete') }}
              </div>
              </template>
            </div>
          </div>
        </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import misc from '@/utils/js/misc';
import NavBar from '@/components/NavigationBar';
import EditPop from './_components/RobotWordsEdit';
import api from './_api/chatskill';

const pageGroup = {
  basic: [1, 2, 3, 4, 5, 6, 12],
  emotion: [9, 10, 11],
  timeout: [7, 8],
  human: [13, 14, 15, 16, 17, 18, 19, 20],
};

export default {
  path: 'robot-chat-skill',
  privCode: 'robot_chat_skill',
  displayNameKey: 'robot_chat_skill',
  icon: 'white_chat',
  name: 'robot-chat-skill',
  components: {
    NavBar,
  },
  api,
  data() {
    return {
      currentPage: '',
      pageMap: {
        basic: this.$t('chat_skill.group_basic'),
        emotion: this.$t('chat_skill.group_emotion'),
        timeout: this.$t('chat_skill.group_timeout'),
        human: this.$t('chat_skill.group_human'),
      },
      wordsList: [],
    };
  },
  computed: {
    ...mapGetters([
      'userRole',
    ]),
    canEdit() {
      return this.$hasRight('edit');
    },
  },
  methods: {
    popAddWordsContent(words) {
      const that = this;
      that.$pop({
        title: `${that.$t('general.add')}${words.name}`,
        component: EditPop,
        data: {
          words,
          content: '',
        },
        validate: true,
        bindValue: false,
        callback: {
          ok(content) {
            that.addWordsContent(words, content);
          },
        },
      });
    },
    popEditWordsContent(words, contentObj) {
      const that = this;
      that.$pop({
        title: `${that.$t('general.edit')}${words.name}`,
        component: EditPop,
        data: {
          words,
          content: contentObj.content,
        },
        validate: true,
        bindValue: false,
        callback: {
          ok(content) {
            that.updateWordsContent(words, contentObj.id, content);
          },
        },
      });
    },
    popDeleteWordsContent(words, contentObj) {
      const that = this;
      that.$popWarn({
        data: {
          msg: that.$t('chat_skill.delete_check_msg', { item: contentObj.content }),
        },
        callback: {
          ok() {
            that.deleteWordsContent(words, contentObj.id);
          },
        },
      });
    },
    callAPI(calledAPI, ...params) {
      const that = this;
      that.$startPageLoading();
      calledAPI.bind(this)(...params)
        .catch((err) => {
          that.$notifyFail(that.$t('error_msg.request_fail'));
          console.log(err);
        })
        .finally(() => that.loadRobotWords());
    },
    addWordsContent(words, content) {
      const that = this;
      that.callAPI(that.$api.addRobotChatContentV2, words.type, content);
    },
    updateWordsContent(words, contentID, content) {
      const that = this;
      that.callAPI(that.$api.updateRobotChatContentV2, words.type, contentID, content);
    },
    deleteWordsContent(words, contentID) {
      const that = this;
      that.callAPI(that.$api.deleteRobotChatContentV2, words.type, contentID);
    },
    loadRobotWords() {
      const that = this;
      that.$startPageLoading();
      that.$api.getRobotChatListV2()
      .then((data) => {
        that.wordsList = data;
        that.wordsList.forEach((words) => {
          Object.keys(pageGroup).forEach((page) => {
            if (pageGroup[page].indexOf(words.type) >= 0) {
              words.page = page;
            }
          });

          words.tooltip = {
            msg: words.comment,
          };
        });
      })
      .finally(() => {
        that.$emit('endLoading');
      });
    },
    setupPage() {
      const target = misc.getParameterByName('page');
      if (target in pageGroup) {
        this.currentPage = target;
      } else {
        this.currentPage = 'basic';
      }
    },
  },
  beforeMount() {
    this.setupPage();
  },
  mounted() {
    this.loadRobotWords();
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';

$words-title-font-size: 16px;
$words-title-line-height: 24px;
$words-title-color: $color-font-normal;

$words-list-font-size: 14px;
$words-list-header-bg: #f7f7f7;
$words-list-data-bg: #fcfcfc;
$words-list-edit-color: $color-primary;
$words-list-delete-color: $color-error;

.words-list {
  display: flex;
  flex-direction: column;

  @include auto-overflow();
  @include customScrollbar();
  max-height: calc(100% - 60px);
  .words {
    padding: 20px 0;
    .words-title {
      display: flex;
      align-items: center;
      padding: 0 20px;
      padding-bottom: 16px;
      .title-text {
        color: $words-title-color;
        font-size: $words-title-font-size;
        line-height: $words-title-line-height;
        margin-right: 5px;
      }
      .icon-container {
        position: relative;
        display: flex;
        align-items: center;
      }
    }
    .button-container {
      padding: 0 20px;
    }
    .words-contents {
      padding-top: 11px;
      font-size: $words-list-font-size;

      display: flex;
      flex-direction: column;
      .row {
        flex: 0 0 50px;

        display: flex;
        align-items: center;
        box-shadow: inset 0 -1px 0 0 $color-borderline-disabled;
        &.header {
          background: $words-list-header-bg;
        }
        .content {
          flex: 1;
          padding: 0 20px;
          white-space:normal; 
          word-break:break-all;
        }
        &:not(.header) {
          .command {
            @include click-button();
          }
        }
        &.body {
          background: $words-list-data-bg;
          &:hover {
            background-color: #F6F9FF;
          }
        }
        .command {
          flex: 0 0 50px;
          padding: 0 10px;

          &.edit {
            color: $words-list-edit-color;
          }
          &.delete {
            color: $words-list-delete-color;
          }
        }
        .empty-row {
          flex: 1;
          padding: 0 20px;
        }
      }
    }
  } 
}
</style>
