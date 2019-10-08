<template>
  <el-switch
    v-model="value"
    :active-text= "activeText"
    :inactive-text= "inactiveText"
  >
  </el-switch>
</template>

<script>
  export default {
    props: ['value', 'activeText', 'inactiveText'],
    name: 'TextSwitch',
  };
</script>


<style scoped>

</style>
