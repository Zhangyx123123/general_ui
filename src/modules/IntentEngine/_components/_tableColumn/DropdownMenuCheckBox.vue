<template>
  <div id="checkbox-option-container">
    <input class="checkbox" type="checkbox" :checked="option.checked">
    <span class="text">{{option.text}}</span>
  </div>
</template>
<script>

export default {
  props: {
    option: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {};
  },
  watch: {
  },
  methods: {},
  mounted() {
  },
};
</script>

<style lang="scss" scoped>
#checkbox-option-container {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 28px;
  input[type=checkbox]{
    @include general-checkbox();
    margin: 0px 8px 0px 10px;
  }
  .text{
    @include font-14px-line-height-28px();
    color: $color-font-normal;
  }
  &:hover{
    background-color: #f3f3f3;
    color: $color-white;
  }
}
</style>