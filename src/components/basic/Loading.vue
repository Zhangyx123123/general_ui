<template>
  <div class='loader' :style="{height: size, width: size}"></div>
</template>

<script>
export default {
  props: {
    size: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
@keyframes spin {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(192deg); }
  50% { transform: rotate(278deg); }
  75% { transform: rotate(336deg); }
  100% { transform: rotate(360deg); }
}
.loader {
  margin-right: 10px;
  border: 8px solid #f3f3f3; /* Light grey */
  border-top: 8px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
}
</style>
