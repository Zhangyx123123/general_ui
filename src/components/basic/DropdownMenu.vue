<template>
  <div v-if="show" class="dropdown-menu-container" :style="style">
    <div class="dropdown-menu">
      <template v-if="optionType === 'text'">
        <div v-for="(option, idx) in options" :key="idx" class="text-menu-option menu-option" :class="{'disabled': option.disabled === true}" @click.stop="clickOption($event, option.onclick)">
          {{ option.text }}          
        </div>
      </template>
      <template v-else-if="optionType === 'custom'">
        <div v-for="(option, idx) in options" :key="idx" class="custom-menu-option menu-option" :class="{'disabled': option.disabled === true}" @click.stop="clickOption($event, option.onclick)">
          <component :is="option.component" :option="option"></component>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
export default {
  name: 'dropdown',
  props: {
    options: {
      type: Array,
      required: true,
      default: () => [],
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    width: {
      type: String,
      default: '160px',
    },
    alignLeft: {
      type: Boolean,
      default: false,
    },
    optionType: {
      type: String,
      default: 'text', // 'text' / 'custom'
    },
    hideAfterOptionClicked: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      show: false,
      showX: 0,
      showY: 0,
    };
  },
  computed: {
    style() {
      return {
        position: 'fixed',
        top: this.show ? `${this.showY}px` : 0,
        left: this.show ? `${this.showX}px` : 0,
        visibility: this.show ? 'visible' : 'hidden',
        width: this.width,
      };
    },
  },
  methods: {
    clickOption(e, onclickFunction) {
      const that = this;
      onclickFunction(e);
      if (this.hideAfterOptionClicked) {
        that.show = false;
      }
    },
  },
  mounted() {
    const that = this;
    that.$on('show', (pos) => {
      that.show = true;
      that.$nextTick(() => {
        if (pos) {
          that.x = pos.x;
          that.y = pos.y;
        }
        if (that.alignLeft) {
          that.showX = (that.x + 10) - that.$el.clientWidth;
        } else {
          that.showX = that.x - 10;
          // we keep 10px padding to show box-shadow, shift left for 10px to pretty align elems
        }
        if (that.y + that.$el.clientHeight > window.innerHeight) {
          that.showY = that.y - that.$el.clientHeight - pos.anchorRect.height;
        } else {
          that.showY = that.y;
        }
      });
    });
    that.$on('hide', () => {
      that.show = false;
    });
  },
};
</script>
<style lang="scss" scoped>
$option-height: 32px;
.dropdown-menu-container {
  padding: 10px;
  z-index: 5;
}
.dropdown-menu {
  background-color: $color-white;
  color: $color-font-normal;
  border-radius: 2px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
  max-height: calc(#{$option-height} * 4);
  @include auto-overflow();
  @include customScrollbar();
  .menu-option {
    @include font-14px;
    display: flex;
    align-items: center;
    cursor: pointer;

    &.disabled {
      color: $color-font-disabled;
      background-color: $color-white;
      cursor: default;
      pointer-events: none;
    }
    &:hover {
      background-color: $color-select-hover;
      color: $color-white;
    }
    &:first-child {
      border-top-left-radius: 2px;
      border-top-right-radius: 2px;
    }
    &:last-child {
      border-bottom-left-radius: 2px;
      border-bottom-right-radius: 2px;
    }
  }
  .text-menu-option {
    height: $option-height;
    padding: 7px 15px;
  }
}
</style>
