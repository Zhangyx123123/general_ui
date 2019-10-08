<template>
<div class="list" ref="qaBox">
  <div v-for="(data, idx) in chatData" :key="idx" :class="data.role" class="chat-box">
    <div class="chat-image" v-if="data.role !== 'user'">
      <div class="robot-icon">
        <icon :size=24 icon-type="robot"></icon>
      </div>
    </div>
    <div class="chat-item">
      <template v-if="data.content.type === 'text'">
        <template v-if="data.content.subType === 'guslist' || data.content.subType === 'relatelist'">
        <div class="chat-content">{{ data.content.value }}
          <div v-for="(sentence, idx) in data.content.data" :key="sentence" @click="sendUserText(sentence)" class='click-text'>
            {{ idx + 1 }}. {{ sentence }}
          </div>
        </div>
        </template>
        <template v-else-if="data.html">
          <div class="chat-content" v-html="data.content.value">
          </div>
        </template>
        <template v-else-if="data.content.subType === 'text'">
          <div class="chat-content">{{data.content.value}}</div>
        </template>
        <template v-else>
          <div class="chat-content">{{data.content.value.toString()}}</div>
        </template>
      </template>
      <template v-if="data.content.type === 'cmd'">
        <div class="chat-content"> 
          <div>
          [{{ $t('qatest.cmd') }}]：
          {{ $t(`qatest.cmdlist.${data.content.subType}`) !== `qatest.cmdlist.${data.content.subType}`
          ? $t(`qatest.cmdlist.${data.content.subType}`) : data.content.subType }}
          </div>
          <div v-if="data.content.value">
            {{ data.content.value.toString() }}
          </div>
        </div>
      </template>
      <div class="chat-time">{{ data.time }}</div>
      <div class="chat-analysis" v-if="data.analysis !== undefined && data.role === 'user' && showAnalysis" >
        <div>[{{ $t('qatest.intent') }}]：{{ data.analysis.intent }}</div>
        <div>[{{ $t('qatest.emotion') }}]：{{ data.analysis.emotion }}</div>
        <div>[{{ $t('qatest.module') }}]：{{ data.analysis.module }}</div>
        <div v-if="data.analysis.tokens !== undefined">[{{ $t('qatest.token') }}]：{{ data.analysis.tokens }}</div>
      </div>  
    </div>
  </div>
</div>  
</template>

<script>
export default {
  props: {
    records: {
      type: Array,
      default: [],
    },
    defaultShowAnalysis: {
      type: Boolean,
      default: false,
    },
    convertRecordToChatData: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      chatData: [],
      showAnalysis: true,
    };
  },
  methods: {
    handleReload(records) {
      this.chatData = this.recordToChat(records);
    },
    recordToChat(records) {
      const that = this;
      const chatData = [];
      records.forEach((record) => {
        chatData.push({
          role: 'user',
          time: record.log_time,
          content: {
            data: [],
            subType: 'text',
            type: 'text',
            value: record.user_q,
          },
          analysis: {
            emotion: record.emotion || that.$t('qatest.unknown'),
            intent: record.intent || that.$t('qatest.unknown'),
            module: record.module,
          },
        });
        chatData.push({
          role: 'robot',
          time: record.log_time,
          content: {
            data: [],
            subType: 'text',
            type: 'text',
            value: record.answer,
          },
          html: true,
        });
      });
      return chatData;
    },
    sendUserText(sentence) {
      this.$emit('send', sentence);
    },
  },
  mounted() {
    const that = this;
    if (that.convertRecordToChatData) {
      that.chatData = that.recordToChat(that.records);
    } else {
      that.chatData = that.records;
    }
    that.showAnalysis = that.defaultShowAnalysis;
    that.$on('reload', that.handleReload);
    that.$on('show-analysis', () => {
      that.showAnalysis = true;
    });
    that.$on('hide-analysis', () => {
      that.showAnalysis = false;
    });
    that.$on('scroll-bottom', () => {
      that.$refs.qaBox.scrollTop = that.$refs.qaBox.scrollHeight;
    });
  },
};
</script>

<style lang="scss" scoped>
$qa-test-bg: #f3f3f3;

$user-input-color: #666666;

$robot-icon-bg: #ffca43;
$robot-icon-border: #ffbc4d;
$robot-icon-size: 40px;
$robot-name-font-size: 16px;
$robot-name-color: #666666;

$chat-user-bg: #1875f0;
$chat-user-color: #ffffff;
$chat-robot-bg: #ffffff;
$chat-robot-color: #333333;
$chat-border-radius: 6px;
$chat-time-font-size: 12px;
$chat-info-font-size: 12px;
$chat-info-bg: #eeeeee;

@mixin chat-item() {
  .chat-item {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    @include customScrollbar();

    display: flex;
    flex-direction: column;
    .chat-content {
      padding: 10px;
      word-break: break-all;
      line-height: 1.57;
      border-radius: $chat-border-radius;

      .click-text {
        text-decoration: underline;
        color: blue;
        @include click-button();
      }
    }
    .chat-time {
      margin-top: 8px;
      font-size: $chat-time-font-size;
    }
    .chat-analysis {
      margin-top: 8px;
      line-height: 1.33;
      max-width: 230px;
      padding: 10px;
      font-size: $chat-info-font-size;
      border-radius: $chat-border-radius;
      background: $chat-info-bg;
    }
  }
}

.robot-icon {
  height: $robot-icon-size;
  width: $robot-icon-size;
  background: $robot-icon-bg;
  border: 1px solid $robot-icon-border;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.list {
  flex: 1;
  background: $qa-test-bg;

  display: flex;
  flex-direction: column;
  @include auto-overflow();
  padding: 0 20px;
  .chat-box {
    flex: 0 0 auto;
    margin-top: 20px;

    display: flex;
    align-items: stretch;

    .robot-icon {
      margin-right: 10px;
    }

    @include chat-item();
    &.robot {
      .chat-item {
        align-items: flex-start;
        .chat-content {
          background: $chat-robot-bg;
          color: $chat-robot-color;
        }
      }
    }
    &.user {
      .chat-item {
        align-items: flex-end;
        .chat-content {
          background: $chat-user-bg;
          color: $chat-user-color;
        }
      }
    }
  }
}
</style>
