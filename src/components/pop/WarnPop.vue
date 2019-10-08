<template>
  <div class="warn-pop">
    <div class="warn-icon">
      <icon iconType="info_warning" :size="32"></icon>
    </div>
    <div class="warn-msg">
      {{ value.msg }}
    </div>
  </div>  
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.warn-pop {
  padding: 20px;
  font-size: 14px;
  width: 348px;

  .warn-icon {
    margin-top: 5px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .warn-msg {
    text-align: center;
    color: $color-font-normal;
    @include font-14px();
    white-space:normal; 
    word-break:break-all;
  }
}
</style>
