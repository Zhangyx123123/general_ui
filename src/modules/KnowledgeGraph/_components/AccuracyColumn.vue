<template>
  <el-table-column :label="colConfig.label">
    	<div slot-scope="{ row }">
        <el-progress :text-inside="true"
                     :stroke-width="18"
                     :percentage= "parseFloat(row[colConfig.prop]) < 0 ? 0.0: parseFloat(row[colConfig.prop])" status="success">
        </el-progress>
      </div>
  </el-table-column>
</template>

<script>
  export default {
    name: 'AccuracyColumn',
    props: ['colConfig'],
  };
</script>

<style scoped>

</style>
