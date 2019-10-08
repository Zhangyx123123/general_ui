<template>
  <div id="download-link-column" @click="linkClicked()">
    <icon :size=18 icon-type="slice"/>
    <span class="text">{{linkData.text}}</span>
  </div>
</template>
<script>

export default {
  data() {
    return {};
  },
  watch: {},
  methods: {
    linkClicked() {
      this.linkData.onclick();
    },
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
#download-link-column {
  display: flex;
  align-items: center;
  border-bottom: 1px solid transparent;
  cursor: pointer;
  &:hover {
    border-bottom: 1px solid $color-primary;
  }
  .text{
    margin-left: 10px;
    @include font-14px();
    color: $color-primary;
  }
}
</style>