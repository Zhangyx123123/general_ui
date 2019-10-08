<template>
  <div class="nav-bar">
    <div class="tag-container">
      <div class="tag"
        v-for="(text, val) in options" :key=val
        :class="{active: selectedPage === val, 'no-hover': Object.keys(options).length <= 1}"
        @click="clickPage(val)" ref="tags">
        {{text}}
      </div>
    </div>
    <div class="active-bar" ref='activeBar' :class="{animation: animation}"></div>
    <search-input v-if="showSearch" v-model='keyword' @input="keywordChange"></search-input>
  </div>  
</template>

<script>
export default {
  name: 'nav-bar',
  props: {
    options: {
      type: Object,
      default: {},
      required: true,
    },
    value: {
      default: '',
    },
    showSearch: {
      type: Boolean,
      default: false,
    },
    animation: {
      type: Boolean,
      defualt: false,
    },
  },
  watch: {
    selectedPage(val) {
      this.$emit('input', val);
      this.computeWidth();
    },
  },
  data() {
    return {
      selectedPage: '',
      keyword: '',
      emitTimer: undefined,
    };
  },
  methods: {
    clickPage(val) {
      if (Object.keys(this.options).length <= 1) {
        return;
      }
      this.selectedPage = val;
    },
    keywordChange() {
      const that = this;
      if (that.emitTimer) {
        clearTimeout(that.emitTimer);
      }
      that.emitTimer = setTimeout(() => {
        that.$emit('search', that.keyword);
      }, 200);
    },
    computeWidth() {
      const that = this;
      const idx = Object.keys(that.options).findIndex(x => x === that.selectedPage);
      if (that.$refs.tags === undefined) {
        return;
      }
      const tag = that.$refs.tags[idx];
      const left = that.$refs.tags.reduce((ret, t, currentIdx) => {
        if (currentIdx < idx) {
          return ret + 24 + t.getBoundingClientRect().width;
        }
        return ret;
      }, 18);
      if (tag !== undefined) {
        that.$refs.activeBar.style.width = `${tag.getBoundingClientRect().width}px`;
        that.$refs.activeBar.style.left = `${left}px`;
      }
    },
  },
  mounted() {
    this.selectedPage = this.value;
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';

$navbar-font-size: 16px;
$navbar-line-height: 18px;
$navbar-active-color: $color-primary;

.nav-bar {
  height: 60px;
  display: flex;
  box-shadow: inset 0 -1px 0 0 $color-borderline;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;

  position: relative;
  .active-bar {
    position: absolute;
    left: 0;
    bottom: 0px;
    color: $navbar-active-color;
    border-bottom: 3px solid $navbar-active-color;
    padding-bottom: 0px;
    &.animation {
      transition: left 0.3s ease-in-out, width 0.3s ease-in-out;
    }
  }
  .tag-container {
    display: flex;
    .tag {
      color: $color-font-active;
      box-sizing: border-box;
      height: 60px;
      font-size: $navbar-font-size;
      line-height: $navbar-line-height;
      margin-left: 24px;
      display: flex;
      align-items: center;
      padding-bottom: 3px;
      &:first-child{
        margin-left: 18px;
      }
      &.active {
        color: $navbar-active-color;
      //   border-bottom: 3px solid $navbar-active-color;
      //   padding-bottom: 0px;
      }
      &:not(.no-hover) {
        @include click-button();
        &:hover {
          color: $navbar-active-color;
        }
      }
    }
  }
}
</style>
