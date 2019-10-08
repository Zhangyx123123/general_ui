<template>
  <ul :style="{left: `${x}px`, top: `${y}px`}" id="context-menu" v-show="show" >
    <li v-for="item in menu" @click="clickItem($event, item)" :key="item.txt"> {{ item.text }} </li>
  </ul>
</template>

<script>

export default {
  name: 'context-menu',
  methods: {
    clickItem(event, item) {
      this.hideMenu();
      item.callback(event);
    },
    clickOutside(event) {
      const that = this;
      if (that.$el && !that.$el.contains(event.target)) {
        that.hideMenu();
      }
      return false;
    },
    showMenu(option) {
      const that = this;
      that.show = true;
      that.menu = option.menu;
      that.x = option.x ? option.x + 10 : 0;
      that.y = option.y || 0;
      // if it will show outside window, shift to bottom;
      if (that.y + (that.menu.length * 40) > window.innerHeight) {
        that.y = window.innerHeight - (that.menu.length * 40);
      }
      document.addEventListener('click', that.clickOutside);
    },
    hideMenu() {
      const that = this;
      that.show = false;
      document.removeEventListener('click', that.clickOutside, false);
    },
  },
  data() {
    return {
      show: false,
      menu: {},
      x: 0,
      y: 0,
    };
  },
  mounted() {
    this.$root.$on('showContextMenu', this.showMenu);
    this.$root.$on('hideContextMenu', this.hideMenu);
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';

#context-menu {
  position: absolute;
  background-color: white;
  box-shadow: 1px 1px 5px $page-header-color;

  li {
    padding: 0 20px;
    min-width: 100px;
    height: 38px;
    line-height: 38px;
    font-size: 18px;
    cursor: pointer;
  }

  li:hover {
    background: #E8F3FF;
    color: #0099FF;
  }
}
</style>
