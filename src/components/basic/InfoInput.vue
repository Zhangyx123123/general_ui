<template>
  <div ref="infoInput" class="info-input icon-input" :class="{'ie-focus-within': isFocus, fill: fill, flex: flex, disabled: disabled, error: error}" v-tooltip="errorTooltip">
    <input v-model="text"
      ref="input"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxlength"
      :type="type"
      :autocomplete="autocomplete"
      @input="$emit('input', text)"
      @focus="toggleFocus(true)"
      @blur="toggleFocus(false)">
    <div ref="infoIcon" class="input-icon info-icon" 
      v-tooltip="infoTooltip"
    >
      <icon icon-type="info" :size=16 enableHover/>
    </div> 
  </div>
</template>


<script>
import event from '@/utils/js/event';

export default {
  props: {
    value: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: false,
      default: 'text',
    },
    fill: {
      type: Boolean,
      required: false,
      default: false,
    },
    flex: {
      type: Boolean,
      required: false,
      default: false,
    },
    placeholder: {
      type: String,
      required: false,
      default: '',
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    maxlength: {
      type: Number,
      required: false,
    },
    error: {
      type: Boolean,
      required: false,
      default: false,
    },
    errorMsg: {
      type: String,
      required: false,
      default: '',
    },
    msg: {
      type: String,
      required: true,
      default: '',
    },
    autocomplete: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      text: '',
      isFocus: false,
      errorTooltip: {
        msg: '',
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
    };
  },
  computed: {
    infoTooltip() {
      const msg = this.msg;
      return {
        msg,
        top: 0,
        alignLeft: true,
      };
    },
  },
  watch: {
    value() {
      this.text = this.value;
    },
    errorMsg() {
      const that = this;
      that.errorTooltip.msg = that.errorMsg;
      that.$refs.infoInput.dispatchEvent(event.createEvent('tooltip-reload'));
    },
    error() {
      const that = this;
      if (that.error) {
        that.$refs.infoInput.dispatchEvent(event.createEvent('tooltip-show'));
        // reposition info tooltip
        const extralines = Math.ceil(that.msg.length / 25) - 1;  // each line can fit about 25 words
        that.infoTooltip.top = 30 + 30 + (extralines * 18) + 8;
        // inputHeight + tooltipHeight + extralines * lineheight + padding
        that.$refs.infoIcon.dispatchEvent(event.createEvent('tooltip-reload'));
      } else {
        that.$refs.infoInput.dispatchEvent(event.createEvent('tooltip-hide'));
         // reposition info tooltip
        that.infoTooltip.top = 0;
        that.$refs.infoIcon.dispatchEvent(event.createEvent('tooltip-reload'));
      }
    },
  },
  methods: {
    focus() {
      this.$refs.input.focus();
      this.toggleFocus(true);
    },
    toggleFocus(bool) {
      this.isFocus = bool;
    },
  },
  mounted() {
    this.text = this.value;
  },
};
</script>

<style lang="scss" scoped>
@import "styles/variable";

$input-height: 28px;

.info-input {
  height: $input-height;
  display: inline-flex;
  &.fill {
    width: 100%;
    display: flex;

    input {
      display: block;
      flex: 1;
      width: auto;
    }
    .input-icon {
      flex: 0 0 auto;
    }
  }

  .info-icon {
    &:hover {
      cursor: pointer;
    }
  }
}
input {
  outline: none;
  background: transparent;
}

/* workaround of focus-within of IE*/
.ie-focus-within {
  outline: none;
  box-shadow: 0 0 0 2px rgba(75, 75, 100, 0.2);
  border-color: $color-borderline-hover;
}
</style>
