<template>
  <div id="category-box" @contextmenu.stop.prevent="showContextMenu">
    <div id="category-search"> {{ $t("qalist.category_search") }}:</div>
    <input maxlength="20" v-model="filter">
    <ul id="categories">
      <TreeItem :treeData="all_categories" :parent="-1" :level="0" v-on:itemClicked="itemClicked" ></TreeItem>
      <TreeItem :treeData="un_category" :parent="-1" :level="0" v-on:itemClicked="itemClicked"></TreeItem>
      <template v-for="(tree, index) in filteredData.children">
        <TreeItem
          :treeData="tree"
          :parent="0"
          :level="tree.level"
          v-on:itemClicked="itemClicked"
          v-on:itemRightClicked="showContextMenu"
          ref="trees"
          :key="index">
        </TreeItem>
      </template>
    </ul>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapMutations, mapGetters } from 'vuex';
// import auth from '@/auth';
// import i18nutils from '@/utils/i18nUtil';
// import CheckPop from '@/components/popForm/CheckPop';
import InputPop from '@/components/pop/InputPop';
import QAapi from '../_api/qalist';
import TreeItem from './TreeItem';

Vue.component('TreeItem', TreeItem);

const WORD_LIMIT = 20;

export default {
  name: 'qacategory',
  api: QAapi,
  data() {
    return {
      msg: 'Welcome to Your Vue.js App',
      filter: '',
      data: {},
      all_categories: {},
      un_category: {},
      filteredData: {},
      contextMenuTarget: document.getElementById('categories'),
      contextMenuVisible: false,
      levelLimit: 5,
    };
  },
  mounted() {
    const that = this;
    // const i18nobj = i18nutils.getLocaleMsgs(this.$i18n);
    // when mounted, do treeview initialization
    that.all_categories = { text: that.$t('qalist.all_categories'), children: {}, id: 0 };
    that.un_category = { text: that.$t('qalist.un_category'), children: {}, id: -1 };
    // when mounted, update categories from api
    that.updateCategory();
  },
  updated() {
    // after updated, if fitler is set, open the tree
    if (/\S/.test(this.filter)) {
      if (!this.$refs.trees) {
        return;
      }
      this.$refs.trees.forEach((tree) => {
        tree.setOpen(true);
      });
    } else if (this.$refs.trees) {
      this.$refs.trees.forEach((tree) => {
        tree.setOpen(false);
      });
    }
  },
  watch: {
    filter() {
      this.handleInput();
    },
  },
  methods: {
    ...mapMutations([
      'setQAQueryOptions',
    ]),
    updateCategory() {
      return this.$api.getCategories().then((updatedData) => {
        this.data = updatedData;
        this.filteredData = this.filterData();
      });
    },
    handleInput() {
      this.filteredData = this.filterData();
    },
    hasChild(node) {
      return (node.children && node.children.length > 0);
    },
    namePassedFilter(name) {
      return name.indexOf(this.filter) > -1;
    },
    showWarning(msg) {
      // const options = {
      //   // component: CheckPop,
      //   buttons: ['ok'],
      //   data: {
      //     msg,
      //   },
      // };
      // this.$root.$emit('showWindow', options);
      this.$notify({ text: msg, type: 'fail' });
      // this.$popCheck(options);
    },
    showUpdateFailedWarning() {
      const that = this;
      // const msg = i18nutils.getLocaleMsgs(this.$i18n);
      that.showWarning(that.$t('error_msg.update_category_error'));
    },
    showEmptyInputWarning() {
      const that = this;
      // const i18nobj = i18nutils.getLocaleMsgs(this.$i18n);
      that.showWarning(that.$t('error_msg.input_empty'));
    },
    showExceedNumberLimtWarning() {
      const that = this;
      // const i18nobj = i18nutils.getLocaleMsgs(this.$i18n);
      const warningMsg = `${that.$t('error_msg.exceed_word_count')}`.replace('%NUMBER%', WORD_LIMIT);
      that.showWarning(warningMsg);
    },
    addChildCategory(category) {
      const that = this;
      // const i18nobj = i18nutils.getLocaleMsgs(this.$i18n);
      const options = {
        component: InputPop,
        validate: true,
        title: that.$t('qalist.add_child_category'),
        data: {
          inputName: that.$t('qalist.rename_msg'),
          value: '',
          maxlength: 20,
        },
        callback: {
          ok: (data) => {
            const newName = data.value;
            // check newName has at least one non white space character
            if ((/\S/.test(newName))) {
              // check if category name exceeds limit
              if (newName.length > WORD_LIMIT) {
                that.showExceedNumberLimtWarning();
                return;
              }

              that.$emit('categoryChanged');
              const params = {
                categoryname: newName,
                parentid: (category) ? category.node.id : 0,
                createduser: that.$cookie.get('userid'),
                level: (category) ? parseInt(category.level, 10) + 1 : 1,
              };

              this.$api.addCategory(params)
              .then(() => {
                that.updateCategory();
                that.$emit('categoryChangedDone');
              }).then(() => that.$emit('categoryChangedDone')).catch(that.showUpdateFailedWarning);
            } else {
              that.showEmptyInputWarning();
            }
          },
        },
      };
      that.$pop(options);
      // this.$root.$emit('showWindow', options);
    },
    renameCategory(category) {
      const that = this;
      // const i18nobj = i18nutils.getLocaleMsgs(this.$i18n);
      const options = {
        component: InputPop,
        validate: true,
        title: that.$t('qalist.rename'),
        data: {
          inputName: that.$t('qalist.rename_msg'),
          value: category.name,
          maxlength: 20,
        },
        callback: {
          ok: (data) => {
            const newName = data.value;
            if (!(/\S/.test(newName))) {
              that.showEmptyInputWarning();
              return;
            }

            if (newName.length > WORD_LIMIT) {
              that.showExceedNumberLimtWarning();
              return;
            }

            that.$emit('categoryChanged');
            const params = {
              categoryname: newName,
              edituser: that.$cookie.get('userid'),
              categoryid: category.node.id,
            };
            this.$api.renameCategory(params)
            .then(() => {
              that.updateCategory();
            }).then(() => that.$emit('categoryChangedDone')).catch(that.showUpdateFailedWarning);
          },
        },
      };
      // this.$root.$emit('showWindow', options);
      that.$pop(options);
    },
    getChildren(node, container) {
      container.push(node.id);
      const children = node.children;
      if (children && children.length > 0) {
        children.forEach((item) => {
          this.getChildren(item, container);
        });
      }
    },
    getDeletedIdStr(ids) {
      let idStr = '';
      let first = true;
      ids.forEach((id) => {
        if (first) {
          first = false;
          idStr += id;
        } else {
          idStr += `,${id}`;
        }
      });
      return idStr;
    },
    deleteCategory(category) {
      this.$emit('categoryChanged');
      const param = {
        categoryid: category.node.id,
        cid: category.parent,
      };
      this.$api.deleteCategory(param)
      .then(() => {
        this.updateCategory();
        this.$emit('categoryChangedDone');
      }).then(() => this.$emit('categoryChangedDone')).catch(this.showUpdateFailedWarning);
    },
    confirmDelete(item) {
      const that = this;
      // const i18nobj = i18nutils.getLocaleMsgs(this.$i18n);
      // this.$root.$emit('showWindow', {
      that.$popCheck({
        title: that.$t('qalist.delete_category'),
        data: {
          msg: that.$t('qalist.confirm_delete'),
          info: item.name,
        },
        // component: CheckPop,
        callback: {
          ok: () => {
            // check if the deleted category is current selected category
            const currentCategory = this.searchCategoryID;
            if (item.node.id === currentCategory) {
              const queryOptions = {
                category_id: 0,
              };
              this.setQAQueryOptions(queryOptions);
            }
            this.deleteCategory(item);
          },
        },
      });
    },
    itemClicked(options) {
      this.$emit('itemClicked', options);
    },
    showContextMenu(args) {
      if (!this.canEdit) {
        return;
      }
      // const i18nobj = i18nutils.getLocaleMsgs(this.$i18n);
      const that = this;
      const menu = [
        {
          text: that.$t('qalist.add_child_category'),
          callback: () => { that.addChildCategory(args.item); },
        },
      ];

      if (args.item !== undefined) {
        menu.push(
          {
            text: that.$t('qalist.rename'),
            callback: () => { that.renameCategory(args.item); },
          },
          {
            text: that.$t('qalist.delete_category'),
            callback: () => { that.confirmDelete(args.item); },
          },
        );
      }

      const level = (args.item) ? parseInt(args.item.node.level, 10) : -1;
      if (level >= that.levelLimit) {
        menu.splice(0, 1);
      }
      that.$root.$emit('showContextMenu', {
        menu,
        x: args.x,
        y: args.y,
      });
    },
    shouldKeep(node) {
      let keep = false;
      if (this.namePassedFilter(node.text)) {
        return true;
      }
      if (!this.hasChild(node)) {
        keep = false;
      } else {
        node.children.forEach((subNode) => {
          if (!keep) {
            const subNodeShouldKeep = this.shouldKeep(subNode);
            keep = subNodeShouldKeep;
          }
        });
        this.trimChildren(node);
      }
      return keep;
    },
    trimChildren(node) {
      if (this.hasChild(node)) {
        const copiedChildren = node.children.slice();
        copiedChildren.forEach((subNode) => {
          // trim nodes if not pass fileter
          if (!this.shouldKeep(subNode)) {
            const index = node.children.indexOf(subNode);
            node.children.splice(index, 1);
          }
        });
      }
    },
    filterData() {
      if (this.filter === '') {
        return this.data;
      }
      const copiedData = JSON.parse(JSON.stringify(this.data));
      const filteredData = {
        children: [],
      };
      copiedData.children.forEach((childData) => {
        if (!this.namePassedFilter(childData.text)) {
          this.trimChildren(childData);
          if (childData.children.length > 0) {
            filteredData.children.push(childData);
          }
        } else {
          filteredData.children.push(childData);
        }
      });
      return filteredData;
    },
  },
  computed: {
    ...mapGetters([
      'searchCategoryID',
    ]),
    canEdit() {
      // return auth.checkPrivilege('qalist', 'edit');
      return true;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
div {
  display: inline-block;
}
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  display: inline-block;
  padding: 0;
}

li {
  margin: 0 10px;
}

a {
  color: #42b983;
}

input {
  width: 70%;
  height: 20px;
  background-color: white;
}

$fill-parent: 100%;

#category-box {
  width: $fill-parent;
  height: $fill-parent;
  border: solid 1px;
  // overflow is for IE
  overflow-y: auto;
  // other browser support overlay will use overlay
  overflow-y: overlay;
  -ms-overflow-style: -ms-autohiding-scrollbar;
}

#categories {
  width:95%;
  min-height: calc(100% - 100px);
  left: 2.5%;
  margin-left: 2.5%;
  margin-top: 10px;
  
}

#categories /deep/ div {
  display: inline-block;
}

#categories /deep/ .tree-item {
  padding-left: 1em;
}

.right-menu {
  background-color: white;
}
</style>