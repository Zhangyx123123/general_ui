<template>
  <div id="qa-question-category-pop">
    <div id="current-category">
      <div style="font-weight: bold;"> {{$t('qalist.current_categories')}}: </div>
      <div class="category-tag" v-for="category in value.categories" :key="category"> {{ category }} </div>
    </div>
    <div id="category-list">
      <div style="font-weight: bold;"> {{$t('qalist.modify_current_categories')}}: </div>
      <div style=" margin-top: 15px;"></div>
      <TreeItem :treeData="unCategory" :parent="-1" :level="0" v-on:itemClicked="itemClicked"></TreeItem>  
      <template v-for="(tree, idx) in trees">
        <TreeItem 
          :treeData="tree"
          :parent="0"
          :level="tree.level"
          v-on:itemClicked="itemClicked"
          ref="trees"
          :key="idx">
        </TreeItem>
      </template>
    </div>
  </div>
</template>

<script>
// import i18nUtil from '@/utils/i18nUtil';
import TreeItem from './TreeItem';
import QAapi from '../_api/qalist';

export default {
  api: QAapi,
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      trees: {},
      unCategory: {},
    };
  },
  computed: {
  },
  mounted() {
    const that = this;
    // const msg = i18nUtil.getLocaleMsgs(this.$i18n);
    that.unCategory = { text: that.$t('qalist.un_category'), children: {}, id: -1 };
    this.$api.getCategories().then((data) => {
      that.trees = data.children;
    });
  },
  updated() {
    if (this.$refs.trees) {
      let found = false;
      this.$refs.trees.forEach((tree) => {
        if (!found) {
          const id = parseInt(this.value.categoryID, 10);
          found = tree.find(id);
        }
      });
    }
  },
  methods: {
    itemClicked(categoryID) {
      this.value.newCategoryID = categoryID;
    },
  },
  components: {
    TreeItem,
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
#qa-question-category-pop {
    width: 680px;
    height: 400px;
    display: flex;
    position: relative;

    #current-category {
      width: 40%;
      height: 100%;
    }

    #category-list {
      width: 60%;
      height: 100%;
      overflow-x: auto;
      .tree-item-list {
        font-size: 15px;
      }
    }

    #category-list /deep/ .tree-item {
      padding-left: 1em;
    }

    .category-tag {
      word-wrap: break-word;
      width: 120px;
      min-height: 30px;
      background-color: lightgray;
      margin-top :20px;
      align-items: center;
      justify-content: center;
      border-radius: 5px;
      padding-left: 10px;
      padding-bottom: 10px;
      padding-top: 10px;
    }
}
</style>