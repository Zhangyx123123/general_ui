<template>
   <div id="learing-clusters" class="learning-page">
     <div id="table-header">
       <div class="cluster with-tooltip"> 
         {{ $t('learning.cluster.group') }}
         <div class="tooltip-container hover" style="display: flex; align-items: center;">
          <div class="info-material-icons black"></div>
          <div class="tooltip rightside text-left-align" style="width: 350px; white-space:normal;"> {{ $t('learning.cluster.group_tooltip') }} </div>
        </div>
       </div>
       <div class="records"> {{ $t('learning.cluster.records') }} </div>
       <div class="label with-tooltip"> 
         {{ $t('learning.label') }}
         <div class="tooltip-container hover" style="display: flex; align-items: center;">
          <div class="info-material-icons black"></div>
          <div class="tooltip rightside text-left-align" style="width: 350px; white-space:normal;"> {{ $t('learning.cluster.label_tooltip') }} </div>
         </div>
        </div>
       <div class="status"> {{ $t('learning.cluster.status') }} </div>
     </div>
     <div id="table-body">
      <template  v-for="(cluster, index) in clusters">
        <div class="table-row clickable" @click="selectCluster(cluster)" :key="index">
          <div class="cluster"> {{ clusterTitle(cluster) }} </div>
          <div class="records"> {{ cluster.recordCount }} </div>
          <div class="label"> {{ cluster.label.join() }} </div>
          <div class="status clickable clickable-text"> {{ $t('learning.cluster.resolve') }} </div>
        </div>
      </template>
     </div>
     <div id="table-paging">
       <v-pagination :total="clusterCount" :pageSizeOption="[10]" :layout="['total', 'prev', 'pager', 'next', 'jumper']" v-on:page-change="handlePageChange"></v-pagination>
     </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import LearnAPI from '../../_api/learning';
import LearningState from '../../_data/learningState';
import LearningUtil from '../../_store/LearningUtil';

export default {
  data() {
    return {
      currentPage: 0,
      pageRow: 10,
      pageWording: 1,
    };
  },
  api: LearnAPI,
  computed: {
    ...mapGetters([
      'learningSelectedCollection',
    ]),
    clusters() {
      const clusters = this.learningSelectedCollection.clusters;
      const start = this.currentPage * this.pageRow;
      const end = start + this.pageRow;
      const pagedCluster = clusters.slice(start, end);
      return pagedCluster;
    },
    clusterCount() {
      const count = this.learningSelectedCollection.clusters.length;
      return count;
    },
  },
  methods: {
    ...mapMutations([
      'setSelectedCluster',
      'setLearningState',
    ]),
    selectCluster(cluster) {
      const that = this;
      that.$api.queryRecords(that.learningSelectedCollection.id, cluster.id, 0, 10)
      .then((records) => {
        const checkedRecords = LearningUtil.checkRecords(records);
        return checkedRecords;
      })
      .then((records) => {
        const fullCluster = {
          id: cluster.id,
          label: cluster.label,
          records,
          totalRecords: cluster.recordCount,
        };
        that.setSelectedCluster(fullCluster);
      })
      .then(() => {
        that.setLearningState(LearningState.FEEDBACK);
      });
    },
    handlePageChange(pageIndex) {
      this.currentPage = pageIndex - 1;
    },
    clusterTitle(cluster) {
      const titleTemplate = this.$t('learning.cluster.title_template');
      const indexStr = (cluster.id + 1).toString();
      return titleTemplate.replace('%NUM', indexStr);
    },
  },
};
</script>

