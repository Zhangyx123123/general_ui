<template>
  <div>
    <pop-window v-for="popWindow in popWindows" ref="pops" :key="popWindow.name"></pop-window>
  </div>
</template>

<script>
import Vue from 'vue';
import PopWindow from '@/components/layout/PopWindow';

export default {
  name: 'pop-windows',
  components: {
    PopWindow,
  },
  data() {
    return {
      popWindows: [],
    };
  },
  methods: {
    showPopWindow(option) {
      if (this.popWindows.length > 0) {
        const lastOption = this.popWindows[this.popWindows.length - 1];
        if (option.component === lastOption.component) {
          this.popWindows.pop();
        }
      }
      this.popWindows.push(option);
      const idx = this.popWindows.length - 1;
      const that = this;
      Vue.nextTick(() => {
        if (idx >= 0 && idx < that.$refs.pops.length) {
          that.$refs.pops[idx].showWindow(option);
        }
      });
    },
    closePopWindow(popWindow) {
      const idx = this.$refs.pops.findIndex(p => p === popWindow);
      if (idx >= 0) {
        this.popWindows.splice(idx, 1);
      }
    },
  },
  mounted() {
    this.$root.$on('pop-window', this.showPopWindow);
    this.$root.$on('close-window', this.closePopWindow);
  },
};
</script>