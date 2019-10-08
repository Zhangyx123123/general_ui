<template>
  <div id="learning-collections" class="learning-page">
    <div id="table-header">
      <div class="timeline"> {{ $t('learning.collection.timeline') }} </div>
      <div class="records with-tooltip"> 
        {{ $t('learning.collection.record') }}
        <div class="tooltip-container hover" style="display: flex; align-items: center;">
          <div class="info-material-icons black"></div>
          <div class="tooltip rightside text-left-align" style="white-space:nowrap;"> {{ $t('learning.cluster.clusters_tooltip') }} </div>
        </div>
      </div>
      <div class="operation"> {{ $t('learning.collection.operation') }} </div>
    </div>
    <div id="table-body">
      <template v-for="collection in collections">
        <div class="table-row" @click="selectCollection(collection)" :key="collection.title">
          <div class="timeline"> {{ collection.title }}{{ $t('learning.collection.weekly_report') }} </div>
          <div class="records"> {{ collection.totalRecordSize }} </div>
          <div class="operation clickable clickable-text"> {{ $t('learning.collection.view') }} </div>
        </div>
      </template>
    </div>
    <div id="table-paging">
      <v-pagination :total="collectionCount" :pageSizeOption="[10]" :layout="['total', 'prev', 'pager', 'next', 'jumper']"></v-pagination>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import LearnAPI from '../../_api/learning';
import LearningState from '../../_data/learningState';

export default {
  api: LearnAPI,
  data() {
    return {
      collections: [],
      collectionCount: 0,
    };
  },
  computed: {
    ...mapGetters([
      'learningType',
    ]),
  },
  watch: {
    learningType() {
      this.queryCollections();
    },
  },
  methods: {
    ...mapMutations([
      'setLearningState',
      'setSelectedCollection',
    ]),
    setCollections(collections) {
      this.collections = collections.sort((a, b) => {
        if (a.title < b.title) {
          return 1;
        } else if (a.title > b.title) {
          return -1;
        }
        return 0;
      });
      this.collectionCount = collections.length;
    },
    selectCollection(collection) {
      const that = this;
      this.$api.queryCollection(collection.id).then((clusters) => {
        const fullCollection = {
          id: collection.id,
          title: collection.title,
          clusters,
          totalRecords: collection.totalRecordSize,
        };
        that.setSelectedCollection(fullCollection);
      })
      .then(() => {
        that.setLearningState(LearningState.CLUSTERS);
      }).catch((error) => {
        console.error(error);
        const msg = that.$t('error_msg.handle_learning_error');
        that.showMessagePop(msg);
      });
    },
    showMessagePop(msg) {
      const options = {
        buttons: ['ok'],
        data: {
          msg,
        },
      };
      this.$popCheck(options);
    },
    queryCollections() {
      this.$api.queryCollections(this.learningType)
      .then(this.setCollections)
      .catch((error) => {
        console.error(error);
        const msg = this.$t('error_msg.handle_learning_error');
        this.showMessagePop(msg);
      });
    },
  },
  mounted() {
    this.queryCollections();
  },
};
</script>

