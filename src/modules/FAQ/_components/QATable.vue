<template>
  <div id="qa-table-container" style="width:100%; height:100%;">
    <qa-table-header :height="30"></qa-table-header>
    <div id="qa-table-body-container" :class="{'ie-scroll': useIE}">
      <qa-table-body ref="tableBody" @resetAllSelect="resetAllSelect" :tableData="retrieveContent"></qa-table-body>
    </div>
    <div class="navigation-bar">
      <input type="checkbox" class="all-select" @change="toggleAllSelect" v-model="allSelected" style="display: inline-block;">
      <label class="all-select"> {{$t('qalist.page_selected')}} </label>
      <template v-if="totalRow <= 10">
        <div class="total">{{$t("qalist.total_row", {num: totalRow})}}</div>
      </template>
      <template v-if="totalRow > 10">
      <v-pagination :total="totalRow" :pageIndex="pageWording" :pageSizeOption="[10]" :layout="['total', 'prev', 'pager', 'next', 'jumper']" v-on:page-change="handlePageChange"></v-pagination>
      </template>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import general from '@/utils/js/misc';
import qaTableHeader from './QATableHeader';
import qaTableBody from './QATableBody';

Vue.component('qa-table-header', qaTableHeader);
Vue.component('qa-table-body', qaTableBody);

export default {
  name: 'qatable',
  data() {
    return {
      rowNum: 10,
      totalRow: 0,
      allSelected: false,
      pageWording: 1,
      useIE: false,
    };
  },
  mounted() {
    this.useIE = general.useIE();
  },
  methods: {
    resetAllSelect() {
      this.allSelected = false;
    },
    setPageIndex(pageIndex) {
      this.curPage = pageIndex;
      this.pageWording = pageIndex + 1;
    },
    unSetAllSelect() {
      this.allSelected = false;
      this.$forceUpdate();
    },
    deleteSelectedQuestions() {
      return this.$refs.tableBody.deleteSelectedQuestions();
    },
    handlePageChange(pageIndex) {
      this.$root.$emit('QATable::pageChanged', pageIndex);
      this.pageWording = pageIndex;
    },
    toggleAllSelect() {
      this.$refs.tableBody.selectAllQuestion(this.allSelected);
    },
    getSelectedQuestions() {
      return this.$refs.tableBody.getSelectedQuestions();
    },
  },
  computed: {
    retrieveContent() {
      this.totalRow = this.tableData.totalNum;
      return this.tableData.content;
    },
  },
  props: ['tableData'],
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
div {
  display: inline-block;
}
h1, h2 {
  font-weight: normal;
}

a {
  color: #42b983;
}

$fill-parent: 100%;

/* hack here, if we don't set vertical-align other than baseline
   the table layout might "out of control"
 */
#table-container /deep/ td {
  vertical-align: top;
}

#table-container /deep/ .v-table-body {
  height: calc(100% - 50px);
}

#qa-table-body-container{
  width: 100%;
  overflow-y: hidden; 
  overflow-x: hidden;

  &.ie-scroll {
    overflow-y: auto;
    -ms-overflow-style: -ms-autohiding-scrollbar;
  }
}

#qa-table-body-container:hover {
  overflow-y: overlay;
}

.all-select {
  height: 32px;
  vertical-align: top;
  display: inline-flex;
  align-items: center;
}
.total {
  margin-left: 10px;
  font-size: 14px;
}

div {
  font-size: 12px;
}
.navigation-bar {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}
#qa-table-container {
  display: flex;
  flex-direction: column;
}
</style>