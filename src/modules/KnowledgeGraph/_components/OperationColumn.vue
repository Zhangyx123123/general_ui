<template>
  <el-table-column :label="colConfig.label">
    <div slot-scope="{ row }">
      <text-button button-type="primary" @click="handleBrowse(row)" >
        {{$t('general.browse')}}
      </text-button>
      <text-button button-type="primary" @click="triggerKGTest(row)">
        {{$t('knowledge_graph.material_manage.test')}}
      </text-button>
      <!--<text-button button-type="primary" @click="handleDelete(row)">-->
        <!--{{$t('general.delete')}}-->
      <!--</text-button>-->
    </div>
  </el-table-column>
</template>

<script>
  import TestResultPop from './TestResultPop';
  import api from '../_api/knowledgeGraph';

  export default {
    name: 'OperationColumn',
    props: ['colConfig'],
    api,

    methods: {
      handleBrowse(row) {
        console.log(row);
        this.$api.getTestDetailInfo(row.task_id).then((res) => {
          const resultList = res.data.checkresults;

          const options = {
            component: TestResultPop,
            title: this.$t('knowledge_graph.material_manage.test_report'),
            extData: {
              resultList,
              // KGEntityDropList: this.KGEntityDropList,
              // KGPropertyDropList: this.KGPropertyDropList,
              // KGFuncPropertyDropList: this.KGFuncPropertyDropList,
            },
            validate: false,
            callback: {
              ok: () => {
              },
            },
          };

          this.$pop(options);
        });
      },

      triggerKGTest(row) {
        this.$emit('triggerKGTest', row);
      },
      // handleDelete(row) {
      //   console.log(row);
      // },
    },

  };
</script>

<style scoped>

</style>
