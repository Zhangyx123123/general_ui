<template>
  <el-table :data="data"
            :height = height
            :default-sort = sort
            :row-class-name="tableRowClassName">
    <template v-for="colConfig in colConfigs">
      <slot v-if="colConfig.slot" :name="colConfig.slot"/>
      <component
        :key="colConfig.id"
        v-else-if="colConfig.component"
        :is="colConfig.component"
        :col-config="colConfig"
      @triggerKGTest = "triggerKGTest">
      </component>

        <el-table-column v-else v-bind="colConfig" :sortable= "colConfig.sortable"></el-table-column>
    </template>
  </el-table>

</template>



<script>
  import { mapGetters } from 'vuex';
  import api from '../_api/knowledgeGraph';

  export default {
    name: 'OperationTable',
    props: ['colConfigs', 'data', 'height', 'sort'],
    api,
    computed: {
      ...mapGetters([
        'robotID',
      ]),
    },

    methods: {
      tableRowClassName({ row }) {
        // console.log(row);
        if (row.checkResult !== undefined && row.checkResult === 'False') {
          return 'warning-row';
        } else if (row.checkResult !== undefined && row.checkResult === 'True') {
          return 'success-row';
        }
        return '';
      },

      triggerKGTest(row) {
        const rowIndex = row.id;
        this.changeTestStatus(rowIndex);
        this.$api.triggerKGTesting(this.robotID, row.dataset).then((res) => {
          // this.intervalStartTesting(res.data.taskId);
          const id = this.robotID;
          const timer = setInterval(
            () => this.intervalStartTesting(id, res.data.taskId, rowIndex, timer), 1000);
        });
      },

      intervalStartTesting(robotId, taskId, rowIndex, timer) {
        console.log(this.robotID);
        return this.$api.getLastTestResultStatus(robotId, taskId).then((res) => {
          if (res.data.result !== '-1') {
            this.displayFinishStatus(res.data, rowIndex);
            clearInterval(timer);
          }
          return new Promise((resolve) => { resolve(); });
        });
      },

      displayFinishStatus(result, rowIndex) {
        console.log(result);
        const newData = {
          dataset: result.dataset,
          task_id: result.task_id,
          status: 'finish',
          result: parseFloat(result.result),
        };
        this.data.splice(rowIndex, 1, newData);
      },

      changeTestStatus(rowIndex) {
        const selectedRow = this.data[rowIndex];
        // const selectIndex = this.data.indexOf(selectedRow);
        selectedRow.status = 'processing';
        selectedRow.result = '0.0';
        this.data.splice(rowIndex, 1, selectedRow);
      },
    },
  };
</script>

<style>



  .el-table .warning-row {
    background-color: oldlace;
  }

  .el-table .success-row {
    background-color: #f0f9eb;
  }

</style>
