<template>
  <div class="qa-greeting">
    <div class="actions row">
      <search-input v-model="keyword"></search-input>
    </div>
    <basic-page>
      <div slot="header" class="table-header">
        <span class="header-title">{{ $t('qa_greeting.question') }}</span>
        <span class="header-title">{{ $t('qa_greeting.answer') }}</span>
      </div>
      <div class="greeting-list">
        <template v-for="greeting in greetingList">
          <div class="row greeting-row" :key="greeting.question">
            <div class="question">
              {{ greeting.question }}
            </div>
            <div class="answers">
              <div v-for="ans in greeting.answer" class="answer" :key="ans">
                {{ ans }}
              </div>
            </div>
          </div>
        </template>
      </div>
      <div slot="footer" class="table-footer">
        <v-pagination :total="totalCnt" :pageIndex="curPage" :pageSize="pageLimit" :layout="['total', 'prev', 'pager', 'next', 'jumper']" v-on:page-change="handlePageChange"></v-pagination>
      </div>
    </basic-page>
  </div>
</template>
<script>
import BasicPage from '@/components/layout/BasicPage';
import SearchInput from '@/components/basic/SearchInput';
import api from './_api/qagreeting';

export default {
  path: 'qa_greeting',
  privCode: 'qa_greeting',
  displayNameKey: 'qa_greeting',
  icon: 'white_SQ',
  name: 'qa-greeting',
  api,
  components: {
    BasicPage,
    SearchInput,
  },
  data() {
    return {
      keyword: '',
      curPage: 1,
      pageLimit: 20,
      totalCnt: 0,
      greetingList: [],
    };
  },
  watch: {
    curPage() {
      this.loadQAGreeting();
    },
    keyword() {
      this.keyword = this.keyword.trim();
      this.loadQAGreeting();
      this.toFirstPage();
    },
  },
  methods: {
    toFirstPage() {
      this.curPage = 1;
    },
    toCurPage(page) {
      this.curPage = page;
    },
    handlePageChange(page) {
      this.toCurPage(page);
    },
    loadQAGreeting() {
      const that = this;
      that.$api.loadQAGreeting(that.keyword, that.curPage, that.pageLimit)
      .then((res) => {
        that.totalCnt = res.totalQACnt;
        that.greetingList = res.chatQAs;
      }).catch((err) => {
        console.log(err);
        that.$notifyFail(that.$t('qagreeting.load_fail'));
      });
    },
  },
  mounted() {
    const that = this;
    that.loadQAGreeting();
  },
};
</script>
<style lang="scss" scoped>
@import "styles/variable";
.qa-greeting {
  display: flex;
  flex-direction: column;

  .action {
    flex: 0 0 90px;
  }

  .table-header {
    height: 100%;
    display: flex;
    align-items: center;
    .header-title {
      flex: 1 1 50%;
      padding: 0px 10px;
    }
  }

  .greeting-list {
    // border: 1px solid green;
    line-height: $default-line-height;
    display: flex;
    flex-direction: column;
    .greeting-row {
      border-bottom: 2px solid $table-border-color;
      display: flex;
      &:hover {
        background: $table-body-hover-background;
      }

      .question {
        flex: 0 0 50%;
        padding-right: 10px;
      }
      .answers {
        // border: 1px solid green;
        flex: 0 0 50%;
        padding: 0px 10px;
        display: flex;
        flex-direction: column;
        :not(:last-child) {
          border-bottom: 1px solid $table-border-color;
        }
      }
    }
  }

  .table-footer {
    padding: 10px 0px;
  }
}

.row {
  @include flex-row();
  .actions {
    flex: 0 0 90px;
  }
}
</style>
