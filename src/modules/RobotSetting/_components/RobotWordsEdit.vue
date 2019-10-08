<template>
  <div class="robot-words-edit">
    <div class="info">{{ origData.words.comment }}</div>
    <div class="input">
      <input id="content" ref="input" v-model="content" :class="{'error': errorTooltipShown }" v-tooltip="errorTooltip">
    </div>
  </div>
</template>

<script>
import event from '@/utils/js/event';

export default {
  name: 'robot-words-edit',
  props: {
    origData: {
      type: Object,
      default: {
        words: {},
        content: '',
      },
      required: true,
    },
  },
  data() {
    return {
      content: '',
      errorTooltip: {
        msg: '',
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      errorTooltipShown: false,
    };
  },
  watch: {
    content() {
      this.errorTooltipShown = false;
      this.$refs.input.dispatchEvent(event.createEvent('tooltip-hide'));
    },
  },
  methods: {
    validate() {
      const that = this;
      that.content = that.content.trim();
      if (that.content === '') {
        that.errorTooltip.msg = this.$t('error_msg.input_empty');
        this.$refs.input.dispatchEvent(event.createEvent('tooltip-reload'));
        this.$refs.input.dispatchEvent(event.createEvent('tooltip-show'));
        this.errorTooltipShown = true;
      } else if (that.origData.words.contents.findIndex(c => c.content === that.content) >= 0) {
        that.errorTooltip.msg = this.$t('chat_skill.errorDuplicate');
        this.$refs.input.dispatchEvent(event.createEvent('tooltip-reload'));
        this.$refs.input.dispatchEvent(event.createEvent('tooltip-show'));
        this.errorTooltipShown = true;
      } else {
        that.$emit('validateSuccess', that.content);
      }
    },
  },
  mounted() {
    this.$on('validate', this.validate);
    this.content = this.origData.content;
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';

$info-font-size: 12px;
$info-line-height: 18px;
$info-font-color: #999999;

.robot-words-edit {
  padding: 0 20px;
  width: 520px;
}
.info {
  font-size: $info-font-size;
  line-height: $info-line-height;
  color: $info-font-color;
  margin-bottom: 20px;
}
.input {
  input {
    display: block;
    width: 100%;
    outline: solid 1px rgba(255, 255, 255, 0.2);
  }
}
</style>
