<template>
  <span class="tag" :class="[fontClass]">
    <slot></slot>
  </span>
</template>
<script>
export default {
  props: {
    fontClass: {
      type: String,
      required: false,
      default: 'font-14',
    },
  },
};
</script>

<style lang="scss" scoped>
@import "styles/variable";

$tag-dft-background: #eeeeee;
$tag-dft-color: $color-font-normal;
.tag {
  &.font-16 {
    @include font-16px();
  }
  &.font-14 {
    @include font-14px();
  }
  &.font-12 {
    @include font-12px();
  }
  color: $tag-dft-color;
  background-color: $tag-dft-background;
  margin: 0px;
  padding: 3px 5px;
  border-radius: 2px;
  // height: 20px;
}
</style>
