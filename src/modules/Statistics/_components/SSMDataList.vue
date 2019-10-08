<template>
  <div class="ssm-data-wrapper">
    <h1 class="title">{{$t('statistics.health_check.ssm_list_desc')}}</h1>
    <div>
      <span class="sub-title">
      {{$t('statistics.health_check.ssm_total').replace('%1', this.sqTotalCount).replace('%2', this.corpusTotalCount)}}</span>
      <span class="tips sub-title">{{$t('statistics.health_check.ssm_suggest')}}</span>
    </div>
    <div class="data-wrapper">
      <div class="sq-table-box">
        <general-table class="table-box" :table-data="sqTableData" :table-header="sqTableHeader"
        show-empty :onclickRow="handleSelectSQ"></general-table>
        <v-pagination class="pager" size="small"  :pageIndex="sqPageIndex" :total="sqTotalCount"
          :page-size="sqPageSize" :pageSizeOption="[25, 50, 100, 200]"
          :layout="['prev', 'pager', 'next', 'sizer', 'jumper']"
          @page-change="handleSQPageChange" @page-size-change="handleSQPageSizeChange">
        </v-pagination>
      </div>
      <icon class="sort-icon" :icon-type="'more'" :size="10" enableHover></icon>
      <div class="corpus-table-box">
        <general-table class="table-box" :table-data="lqTableData" :table-header="corpusTableHeader"
        show-empty ></general-table>
        <v-pagination class="pager" size="small"  :pageIndex="lqPageIndex" :total="lqTotalCount"
          :page-size="lqPageSize" :pageSizeOption="[25, 50, 100, 200]"
          :layout="['prev', 'pager', 'next', 'sizer', 'jumper']"
          @page-change="handleCorpusPageChange" @page-size-change="handleCorpusPageSizeChange">
        </v-pagination>
      </div>  
    </div>
  </div>
</template>

<script>
import GeneralTable from '@/components/GeneralScrollTable';

export default {
  props: {
    value: {
      type: Object,
      default() {
        return {
          ssmData: {},
        };
      },
    },
  },
  data() {
    return {
      sqTableHeader: [
        {
          key: 'sq',
          text: this.$t('statistics.health_check.sq'),
          width: '520px',
        },
        {
          key: 'lq_count',
          text: this.$t('statistics.health_check.corpus_count'),
        },
      ],
      // 当前选择的SQ
      selectedSQ: {},
      corpusTableHeader: [
        {
          key: 'lq',
          text: this.$t('statistics.health_check.corpus'),
        },
      ],
      sqPageIndex: 1,
      sqPageSize: 25,
      lqPageIndex: 1,
      lqPageSize: 25,
    };
  },
  computed: {
    // 语料总数
    corpusTotalCount() {
      const ssmDataArr = Object.values(this.value.ssmData);
      let totalCount = 0;
      if (ssmDataArr.length > 0) {
        ssmDataArr.forEach((sq) => {
          totalCount += sq.lq_count;
        });
      }
      return totalCount;
    },
    // 标准问table当前页数据
    sqTableData() {
      const ssmDataArr = Object.values(this.value.ssmData);
      const currentPageData = ssmDataArr.slice(this.sqPageSize * (this.sqPageIndex - 1),
        this.sqPageSize * this.sqPageIndex);
      return currentPageData;
    },
    sqTotalCount() {
      return Object.values(this.value.ssmData).length || 0;
    },
    lqTableData() {
      const lqDataArr = this.selectedSQ.lq || [];
      const currenPageData = lqDataArr.slice(this.lqPageSize * (this.lqPageIndex - 1),
        this.lqPageSize * this.lqPageIndex);
      return currenPageData;
    },
    lqTotalCount() {
      const lqDataArr = this.selectedSQ.lq || [];
      return lqDataArr.length;
    },
  },
  components: {
    GeneralTable,
  },
  mounted() {
    this.selectFirstItem();
  },
  methods: {
    selectFirstItem() {
      if (this.sqTableData.length > 0) {
        this.handleSelectSQ(this.sqTableData[0]);
      }
    },
    // 选中某一行
    handleSelectSQ(item) {
      if (this.selectedSQ) {
        this.selectedSQ.highlight = false;
      }
      item.highlight = true;
      this.selectedSQ = item;
      this.lqPageIndex = 1;
      this.value.ssmData = Object.assign({}, this.value.ssmData);
    },
    handleSQPageChange(pageIndex) {
      this.sqPageIndex = pageIndex;
      this.selectFirstItem();
    },
    handleSQPageSizeChange(pageSize) {
      this.sqPageSize = pageSize;
      this.sqPageIndex = 1;
    },
    handleCorpusPageChange(pageIndex) {
      this.lqPageIndex = pageIndex;
    },
    handleCorpusPageSizeChange(pageSize) {
      this.lqPageSize = pageSize;
      this.lqPageIndex = 1;
    },
  },
};
</script>

<style lang="scss" scoped>
.ssm-data-wrapper{
  width: 1240px;
  height: 540px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  border-top: 1px solid $color-borderline-disabled;
  border-bottom: 1px solid $color-borderline-disabled;
  .title{
    margin-bottom: 15px;
    color: $color-font-active;
    @include font-16px();
  }
  .sub-title{
    margin-bottom: 10px;
    color: $color-font-normal;
    @include font-14px();
  }
  .tips{
    float: right;
  }
  .data-wrapper{
    flex: 1;
    display: flex;  
    .sq-table-box{
      flex: 7;
      height: 100%;
    }
    .corpus-table-box{
      flex: 6;
      margin-left: 20px;
      height: 100%;
    }
    .table-box{
      height: calc(100% - 30px);
      border:1px solid $color-borderline-disabled;
      border-radius: 4px;
    }
    .pager{
      margin-top: 14px;
      float: right;
    }
    .sort-icon{
      position: relative;
      left: -60px;
      top: 22px;
      display: none;
    }
  }
} 
</style>