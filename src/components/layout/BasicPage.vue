<template>
  <div class="base-page">
    <div class="header">
      <slot name="header"></slot>
    </div>
    <div class="main">
      <slot></slot>
    </div>
    <div class="footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {

};
</script>

<style lang="scss" scoped>
@import "styles/variable";

.base-page {
  height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    flex: 0 0 40px;
    background: $table-header-background;
  }
  .main {
    flex: 1;
    background: $table-body-background;
    @include auto-overflow();
  }
  .footer {
    flex: 0 0 40px;
    background: $table-header-background;
  }
}
</style>
