<template>
  <div>
    <h3 class="margin-space">请输入相似问</h3>
    <h3 class="margin-space">每行视为一个相似问题进行新增</h3>
    <textarea name="" id="batchQuesArea" cols="30" rows="15" v-model.trim="value.batchQuestions"></textarea>
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

<style>
.margin-space {
  margin: 5px 0px;
}

#batchQuesArea {
  width: 100%;
  resize: none;
}
</style>
