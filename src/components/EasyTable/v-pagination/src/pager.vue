<template>
    <span class="v-page-pager">
        <!-- <li @click.stop.prevent="jumpPage(1)" :class='[pageIndex === 1 ? "v-page-li-active":"","v-page-li"]'><a>1</a></li>

        <li @click.stop.prevent="jumpPage(pageIndex - showPagingCount)" v-if="showJumpPrev"
            :class="[pageIndex=== 1 ? 'disabled' :'','v-page-li','v-page-jump-prev']"
            :title="'向前 '+showPagingCount+' 页'">
            <a><i class="v-icon-angle-double-left"></i></a>
        </li> -->

        <li v-for="num in pagingCounts" @click.stop.prevent="jumpPage(num)"
            :class='[num === pageIndex ? "v-page-li-active":"","v-page-li"]'><a>{{num}}</a></li>

        <!-- <li @click.stop.prevent="jumpPage(pageIndex + showPagingCount)" v-if="showJumpNext"
            class="v-page-li v-page-jump-next" :title="'向后 '+showPagingCount+' 页'"><a><i
                class="v-icon-angle-double-right"></i></a>

        <li v-if="pageCount >1" @click.stop.prevent="jumpPage(pageCount)"
            :class='[pageIndex === pageCount ? "v-page-li-active":"","v-page-li"]'><a>{{pageCount}}</a></li> -->
    </span>
</template>

<script>
    export default{
      props: {
          pageCount: Number,
          pageIndex: Number,
          showPagingCount: Number,
        },
      computed: {
          numOffset() {
              return Math.floor((this.showPagingCount + 2) / 2) - 1;
            },

          showJumpPrev() {
              if (this.pageCount > this.showPagingCount + 2) {
                  if (this.pageIndex > this.showPagingCount) {
                      return true;
                    }
                }
              return false;
            },

          showJumpNext() {
              if (this.pageCount > this.showPagingCount + 2) {
                    // if (this.pageIndex < this.pageCount - this.numOffset) {
                  if (this.pageIndex <= this.pageCount - this.showPagingCount) {
                      return true;
                    }
                }
              return false;
            },

            // 当前要显示的数字按钮集合
          pagingCounts() {
              let vm = this,
                  startNum,
                  result = [];
              if ( vm.pageIndex <= 1 + vm.numOffset) {
                  if (vm.pageCount >= vm.showPagingCount) {
                    for (let i = 1; i < vm.showPagingCount + 1; i++) {
                        result.push(i);
                    }
                  } else {
                    for (let i = 1; i < vm.pageCount + 1; i++) {
                        result.push(i);
                    }
                  }
              } else if (vm.pageIndex > 1 + vm.numOffset && vm.pageIndex < vm.pageCount - vm.numOffset) {
                  for (let i = vm.pageIndex - vm.numOffset; i <= vm.pageIndex + vm.numOffset; i++) {
                      result.push(i);
                  }
              } else {
                  if (vm.pageCount >= vm.showPagingCount) {
                    for (let i = vm.pageCount - vm.showPagingCount + 1; i <   vm.pageCount + 1; i++) {
                        result.push(i);
                    }
                  } else {
                     for (let i = 1; i < vm.pageCount + 1; i++) {
                        result.push(i);
                    } 
                  }
              }

              return result;
            },
        },
      methods: {
          jumpPage(pageIndex) {
              this.$emit('jumpPageHandler', pageIndex);
            },
        },
      created() {

        },
    };
</script>