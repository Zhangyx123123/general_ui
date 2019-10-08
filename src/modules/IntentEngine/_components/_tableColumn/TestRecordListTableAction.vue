<template>
  <div id="action-column" v-dropdown="moreOptions()">
    <icon :size=18 icon-type="more_blue"/>
  </div>
</template>
<script>

export default {
  data() {
    return {};
  },
  watch: {},
  methods: {
    moreOptions() {
      const options = this.options.map(option => ({
        text: option.text,
        onclick() {
          option.onclick();
        },
      }));
      return {
        options,
        alignLeft: true,
        width: '190px',
        globalFix: true,
      };
    },
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
#action-column {
  width: 18px;
  height: 18px;
  cursor: pointer;
  border-radius: 9px;
  &:hover{
    background-color: $color-disabled;
  }
}
</style>