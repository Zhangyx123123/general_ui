<template>
  <div :class="{fill: fill}">
    <text-button button-type="disable" :width="fill ? '100%':auto" :height=height v-if="state === 'loading'">
      <slot name="loading"></slot>
    </text-button>
    <text-button v-else-if="state === 'init' " button-type="primary" :width="fill ? '100%':auto" :height=height :disabled="disabled" @click="click">
      <slot name="init"></slot>
    </text-button>
    <text-button v-else button-type="primary" :disabled="disabled" :width="fill ? '100%':auto" :height=height @click="click">
      <slot name="finish"></slot>
    </text-button>
  </div>
</template>

<script>
import TextButton from './TextButton';

export default {
  name: 'loading-button',
  components: {
    TextButton,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    fill: {
      type: Boolean,
      default: false,
    },
    height: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      state: 'init',
    };
  },
  methods: {
    click(e) {
      this.state = 'loading';
      this.$emit('click', this, e);
    },
  },
  mounted() {
    const that = this;
    that.$on('loading', () => {
      this.state = 'loading';
    });
    that.$on('finish', () => {
      this.state = 'finish';
    });
    that.$on('reset', () => {
      this.state = 'init';
    });
    that.$on('forceClick', () => {
      this.click();
    });
  },
};
</script>

<style lang="scss" scoped>
.fill {
  width: 100%;
}
</style>
