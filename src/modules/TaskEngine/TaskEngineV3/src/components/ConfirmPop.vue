<template>
  <div>
    {{ value.msg }}
    <br><br>
    {{ value.info }}
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

