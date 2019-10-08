<template>
  <div class="commands">
    <div class="buttons">
      <slot></slot>
    </div>
  </div>  
</template>

<script>
export default {
};
</script>

<style lang="scss" scoped>
.commands {
  flex: 0 0 auto;
  padding: 0 20px;
  padding-top: 20px;

  display: flex;
  justify-content: space-between;
  .buttons {
    & > div {
      margin-right: 10px;
    }
  }
}
</style>
