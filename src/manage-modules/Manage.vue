<template>
  <router-view @startLoading="$startPageLoading($event)" @endLoading="$endPageLoading($event)"></router-view>
</template>

<script>
export default {

};
</script>

<style lang="scss" scoped>

</style>
