<template>
  <div class="toggle-base" v-on:click="toggle" :class="[{checked: checked, big: big, disabled: disabled}, !big && size]">
    <input type="checkbox" :id="id" v-model="checked">
    <label :for="id"></label>
    <span v-if="showLabel" class="info" :style="infoStyle">{{ labelText }}</span>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    big: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    label: {
      type: Object,
      default: () => ({ on: 'on', off: 'off' }),
    },
    showLabel: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      validate: value => ['big', 'medium'].includes(value),
      default: '',
    },
  },
  watch: {
    value() {
      this.checked = this.value;
    },
    checked(val) {
      const that = this;
      if (that.timer !== undefined) {
        clearTimeout(that.timer);
      }
      that.timer = setTimeout(() => {
        if (val !== that.value) {
          that.$emit('input', that.checked);
          that.$emit('change', that.checked);
          that.timer = undefined;
        }
      }, 500);
    },
  },
  computed: {
    infoStyle() {
      return this.checked ? { left: '20%' } : { right: '20%' };
    },
    labelText() {
      return this.checked ? this.label.on : this.label.off;
    },
  },
  methods: {
    toggle() {
      this.checked = !this.checked;
    },
  },
  data() {
    const random = parseInt(Math.random() * 1000, 10);
    return {
      id: `toggle_${random}`,
      checked: false,
      timer: undefined,
    };
  },
  mounted() {
    this.checked = this.value;
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';

$toggle-active-color: #3d80ff;
$disabled-active-color: #A7C5FF;
$disabled-deactive-color: #EBEBEB;
.toggle-base {
  cursor: pointer;
  display: inline-block;
  width: 28px;
  position: relative;
  background: $deactive-color;
  height: 14px;
  border-radius: 14px;
  padding: 3px;

  &.checked {
    background: $toggle-active-color;
  }
  transition: background-color 500ms;

  input {
    visibility: hidden;
    &:checked + label {
      left: 15px;
    }
  }

  label {
    display: block;
    position: absolute;
    width: 12px;
    height: 12px;
    background: white;
    top: 1px;
    left: 1px;
    border-radius: 20px;
    user-select: none;
    cursor: pointer;
    transition: all 0.4s ease;
  }
  
  &.big {
    width: 60px;
    height: 26px;
    border-radius: 20px;
    padding: 3px;
    label {
      width: 22px;
      height: 22px;
      top: 2px;
    }
    input {
      visibility: hidden;
      &:checked + label {
        left: 36px;
      }
    }
  }

  &.medium {
    width: 44px;
    height: 22px;
    border-radius: 40px;
    label {
      width: 18px;
      height: 18px;
      top: 2px;
    }
    input:checked + label {
      left: 24px;
    }
  }

  &.small {
    width: 40px;
    height: 18px;
    border-radius: 18px;
    label {
      width: 16px;
      height: 16px;
      top: 1px;
    }
    input:checked + label {
      left: 22px;
    }
  }

  &.disabled{
    cursor: default;
    pointer-events: none;
    background: $disabled-deactive-color;
    &.checked {
      background: $disabled-active-color;
    }
  }
  .info {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    @include font-12px();
    color:  white;
  }
}
</style>
