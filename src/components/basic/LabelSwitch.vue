<template>
  <div class="label-switch">
    <template v-for="opt in options">
      <div :key="opt.val" class="option"
        @click="clickOnOption(opt)"
        :class="{selected: opt.val === selectedVal}">
        {{ opt.text }}
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'label-switch',
  props: {
    value: {
      // type cannot check for two type, use validator
      required: false,
      default: undefined,
      validator: v => (typeof v === 'number' || typeof v === 'string'),
    },
    options: {
      type: Array,
      required: true,
      default: () => [],
      validator: opts => opts.length > 0 && (opts.reduce((ret, opt) => ret && ('text' in opt) && ('val' in opt), true)),
    },
    default: {
      required: false,
      default: undefined,
      validator: v => (typeof v === 'number' || typeof v === 'string'),
    },
  },
  watch: {
    value(val) {
      this.selectedVal = val;
    },
  },
  data() {
    return {
      selectedVal: undefined,
    };
  },
  methods: {
    clickOnOption(option) {
      this.selectedVal = option.val;
      this.$emit('change', option.val);
      this.$emit('input', option.val);
    },
  },
  mounted() {
    // validator check that options must has more than one option
    this.selectedVal = this.value || this.default || this.options[0].val;
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable';

$border-color: $color-borderline;
$border-radius: 2px;
$font-size: 12px;
$line-height: 18px;

$active-background: $button-blue-active-text;
$active-border-color: $color-primary;

.label-switch {
  background: #ffffff;
  width: auto;
  display: inline-flex;
  align-items: center;
  font-size: $font-size;
  line-height: $line-height;
}

.option {
  padding: 4px 15px;

  white-space: nowrap;
  display: inline-block;
  border: 1px solid $border-color;
  border-left: none;
  cursor: pointer;
  user-select: none;
  transition: border-color 300ms;

  &:first-child {
    border-left: 1px solid $border-color;
    border-top-left-radius: $border-radius;
    border-bottom-left-radius: $border-radius;
  }
  &:last-child {
    border-top-right-radius: $border-radius;
    border-bottom-right-radius: $border-radius;
  }

  &.selected {
    box-shadow: inset 0 -1px 0 0 $active-border-color;
    border-bottom: solid 1px $active-border-color;
  }

  &:hover {
    background: $color-disabled;
  }
}

</style>
