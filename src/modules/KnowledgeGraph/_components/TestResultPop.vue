<template>
  <div class="test_detail_form">
    <div class="row">
      <template>
        <operation-table
          :data="resultList"
          :col-configs="colConfigs"
        >
        </operation-table>
      </template>

      <div>

      </div>
    </div>

  </div>

</template>

<script>
  import api from '../_api/knowledgeGraph';
  import OperationTable from '../_components/OperationTable';
  // import OperationTable from './OperationTable';

  export default {
    name: 'TestResultPop',
    components: { OperationTable },
    api,
    OperationTable,
    props: {
      extData: {
        type: Object,
        default: () => ({
          type: 2,
        }),
      },
    },

    data() {
      return {
        resultList: [

        ],
        colConfigs: [
          { prop: 'query', label: this.$t('knowledge_graph.material_manage.query') },
          { prop: 'target', label: this.$t('knowledge_graph.material_manage.target') },
          { prop: 'referResult', label: this.$t('knowledge_graph.material_manage.referResult') },
          { prop: 'checkResult', label: this.$t('knowledge_graph.material_manage.checkResult') },
        ],
      };
    },
    methods: {
      validate() {
        const ret = {};
        this.$emit('validateSuccess', ret);
      },
    },

    beforeMount() {
      this.resultList = this.extData.resultList.map(item => ({
        query: item.query,
        target: item.target,
        referResult: item.refer_result,
        checkResult: item.check_result,
      }));
    },

  };
</script>

<style lang="scss" scoped>
  .test_detail_form {
    color: #666666;
    padding: 0 25px;
    min-width: 60vw;
    @include font-14px();
    .row {
      margin: 5px 0px;
      flex: 0 0 40px;
      // max-height: 40px;

      display: flex;
      align-items: center;
      .row-title {
        flex: 0 0 100px;
        max-width: 100px;
        .required {
          display: inline-block;
          width: 14px;
          color: $color-primary;
        }
      }
    }
  }

</style>
