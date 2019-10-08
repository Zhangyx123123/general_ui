<template>
<div class="label-select" :style="{height: height, width: width}">
  <div class="option-selected" :style="{color: color}" @click="toggleShowOptions">
    <div class="icon button" :style="{height: height, width: height, 'line-height': height}">
      <slot></slot>
    </div>
    <div class="text" :style="{width: textWidth}">
      {{ selected.name }}
    </div>
    <div class="icon button" :style="{height: height, width: height, 'line-height': height}">
      <div class="triangle" :style="{'border-top-color': color}" v-if="options.length > 1"></div>
    </div>
  </div>
  <div class="option-container float-menu" :class="{show: showOption}" :style="{width: width, top: height, 'line-height': height}" ref="optionContainer">
    <div v-for="(option, idx) in options" :key="option.name" class="option" @click="choiceOption(idx)" :style="{height: height}">
      {{ option.name }}
    </div>
  </div>
</div>  
</template>
<script>
export default {
  data: () => ({
    internalSelectedIdx: 0,
    showOption: false,
  }),
  props: {
    value: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    },
    valueKey: {
      type: String,
      default: 'value',
    },
    selectHeight: {
      type: Number,
      default: 50,
    },
    selectWidth: {
      type: Number,
      default: 200,
    },
    color: {
      type: String,
      default: 'black',
    },
  },
  methods: {
    toggleShowOptions() {
      const that = this;
      if (that.options.length <= 1) {
        return;
      }
      if (that.$refs.optionContainer) {
        that.showOption = !that.showOption;
        if (that.showOption) {
          that.hideOnClickOutside(that.$refs.optionContainer);
          that.showOption = true;
        }
      }
    },
    hideOnClickOutside() {
      const that = this;
      window.test = that;
      const outsideClickListener = (e) => {
        if (!that.$el.contains(e.target)) {
          that.showOption = false;
          document.removeEventListener('click', outsideClickListener);
        }
      };
      document.addEventListener('click', outsideClickListener);
    },
    choiceOption(optIdx) {
      this.internalSelectedIdx = optIdx;
      this.$emit('input', this.options[optIdx][this.valueKey]);
      this.$emit('change', this.options[optIdx][this.valueKey]);
      if (this.$refs.optionContainer) {
        this.$refs.optionContainer.classList.remove('show');
      }
    },
  },
  computed: {
    selected() {
      const that = this;
      if (that.internalSelectedIdx < that.options.length && that.internalSelectedIdx >= 0) {
        return that.options[that.internalSelectedIdx];
      }
      return '';
    },
    height() {
      return `${this.selectHeight}px`;
    },
    width() {
      return `${this.selectWidth}px`;
    },
    textWidth() {
      return `${this.selectWidth - this.selectHeight}px`;
    },
  },
  watch: {
    value() {
      const that = this;
      that.internalSelectedIdx = that.options.findIndex(opt => opt[that.valueKey] === that.value);
    },
  },
  mounted() {
    this.internalSelectedIdx = this.options.findIndex(opt => opt[this.valueKey] === this.value);
  },
};
</script>
<style lang="scss" scoped>
.label-select {
  box-sizing: border-box;
  display: inline-block;
  min-height: 30px;
}

.option-selected {
  display: inline-flex;
  justify-content: space-between;
  align-items:center;

  width: 100%;
  height: 100%;

  overflow: hidden;
  text-overflow: ellipsis;

  & > .text {
    padding: 5px 0px;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    cursor: pointer;
  }
}

.icon {
  display: inline-block;
  text-align: center;
  cursor: pointer;

  .triangle {
    display: block;
    border-color: white transparent transparent transparent;
    border-style: solid;
    border-width: 0.5em 0.5em 0px 0.5em;
    height: 0px;
    width: 0px;
    position: relative;
    top: calc(50% - 0.25em);
    left: calc(50% - 0.25em);
  }
}

.option-container {
  color: black;
  background: white;
  border: 1px solid black;
  border-top: 0px;
  .option {
    user-select: none;
    cursor: pointer;
    padding: 0px 10px;
    text-align: center;

    &:hover {
      background: #eee;
    }
  }
}
</style>
