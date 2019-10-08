<template>
  <div class="check-pop">
    <div>
      {{ value.msg }}
    </div>
    <br>
    <div v-if="value.info && value.info !== ''">
      <pre>
        {{ value.info }}
      </pre>
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
.check-pop {
  padding: 20px;
  font-size: 14px;
}
</style>
