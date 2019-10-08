<template>
  <div id="check-diff-link">
    <div class="no-diff" v-if="linkData.diffCount===0">
      {{linkData.text}}
    </div>
    <div class="diff-count" v-if="linkData.diffCount>0" @click="linkClicked()">
      {{linkData.text}}
    </div>
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
#check-diff-link {
  display: flex;
  @include font-14px();
  .no-diff{
    color: $color-font-normal;
  }
  .diff-count{
    @include clickable-text();
    color: $color-primary;
  }
}
</style>