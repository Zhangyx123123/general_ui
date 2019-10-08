
<template>
  <div class="card-category">
    <div class="card-category-header" v-if="!selectOnly">
      <div class="card-category-header-block">
        <div class="card-category-row">
          <div class="card-category-title">{{ title }}</div>
          <div v-if="canSetting" class="card-category-setting" @click="toggleEditMode">
            <span v-if="isEditMode"> {{ $t('category.leave_setting') }}</span>
            <span v-else> {{ $t('category.setting') }} </span>
          </div>
        </div>
        <search-input ref="categorySearchBox" v-model="categoryNameKeyword"></search-input>
      </div>
      <div class="card-category-add-root" v-if="isEditMode && canCreate" @click="addRootCategory"> 
        <input class="add-root" type="text"
          v-if="isAddingRoot" v-model="rootName" ref="rootName" 
          :placeholder="$t('category.placeholder_category_name')"
          @compositionstart="setCompositionState(true)"
          @compositionend="setCompositionState(false)"
          @blur="confirmRootNameOnMethod('click')"
          @keydown.enter="detectCompositionState"
          @keyup.enter="confirmRootNameOnMethod('enter')">
        <div v-else class="add-root-btn">
          <div class="icon-block">
            <icon icon-type="category_add" :size=16></icon>
          </div>
          <span> {{ $t('category.add_root') }} </span>
        </div>
      </div>
    </div>
    <div class="card-category-content" ref="cardCategoryContent">
      <div v-if="!hasSearchResult" class="no-category-search-result">
        {{ $t('category.empty_search_result') }}
      </div>
      <category-tree-item v-for="child in categoryTree.children" 
        v-if="child.visible"
        :treeItem="child"
        :editMode="isEditMode"
        :curLayer="1"
        :ref="`${child.cid}`"
        :key="`${child.cid}-${child.name}`"
        :canEdit="canEdit"
        @activeItemChange="handleActiveItemChange"
        @itemNameChange="handleItemNameChange"
        @setActiveToAll="handleSetActiveToAll"></category-tree-item>
    </div>
    <div class="card-category-footer" v-if="isEditMode && !selectOnly">
      <div v-if="allowSubCategory && canCreate" 
        class="card-category-setting-option option-addsub"
        :class="{'option-disabled': this.currentActiveItem.layer === maxLayer || this.currentActiveItem.cid < 0}"
        @click="addSubCategory">
        {{ $t('category.add_subcategory') }}
      </div>
      <div v-if="canDelete" class="card-category-setting-option option-delete"
        :class="{'option-disabled': !this.currentActiveItem.deletable}"
        @click="popDeleteCategory">
        {{ $t('category.delete_category') }}
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import CategoryTreeItem from './CategoryTreeItem';

Vue.component('category-tree-item', CategoryTreeItem);

export default {
  // api,
  props: {
    title: {
      type: String,
      default: '',
    },
    categoryTree: {
      type: Object,
      default: {},
    },
    maxLayer: {
      type: Number,
      default: 1,
    },
    allowSubCategory: {
      type: Boolean,
      default: false,
    },
    canEdit: {
      type: Boolean,
      default: false,
    },
    canDelete: {
      type: Boolean,
      default: false,
    },
    canCreate: {
      type: Boolean,
      default: false,
    },
    selectOnly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      categoryNameKeyword: '',
      isAddingRoot: false,
      rootName: '',
      compositionState: false,
      wasCompositioning: false,
      hasSearchResult: true,

      isEditMode: false,
      currentActiveItem: {},
    };
  },
  computed: {
    canSetting() {
      return this.canEdit || this.canCreate || this.canDelete;
    },
  },
  watch: {
    categoryNameKeyword() {
      // if (this.categoryNameKeyword !== '') {
      //   this.setFilterMode(true);
      // } else {
      //   this.setFilterMode(false);
      // }
      this.filterCategory(this.categoryNameKeyword);
      this.hasSearchResult = false;
      this.categoryTree.children.forEach((child) => {
        this.hasSearchResult = child.visible || this.hasSearchResult;
      });
    },
  },
  methods: {
    /** Handle SEARCH KEYWORD */
    filterCategory() {
      if (this.categoryNameKeyword === '') {
        this.categoryTree.children.forEach(child => this.closeAllChild(child));
        this.categoryTree.children.forEach((child) => {
          child.visible = true;
        });
        this.$nextTick(() => {
          this.handleSetActiveToAll();
        });
      } else {
        this.categoryTree.children.forEach((child) => {
          const foundKeyword = this.hasKeyword(child, this.categoryNameKeyword);
          if (!foundKeyword) {
            child.visible = false;
          }
        });
        this.categoryTree.children.forEach((child) => {
          this.setShowChild(child, this.categoryNameKeyword);
        });
      }
    },
    closeAllChild(treeItem) {
      treeItem.showChild = false;
      if (treeItem.children && treeItem.children.length > 0) {
        treeItem.children.forEach((child) => {
          this.closeAllChild(child);
        });
      }
    },
    setShowChild(treeItem, keyword) {
      let shouldOpen = false;
      if (treeItem.children && treeItem.children.length > 0) {
        treeItem.children.forEach((child) => {
          const shouldOpenForChild = this.setShowChild(child, keyword);
          shouldOpen = shouldOpen || shouldOpenForChild;
        });
      }
      treeItem.showChild = shouldOpen;
      return shouldOpen || treeItem.name.includes(keyword);
    },
    hasKeyword(treeItem, keyword) {
      if (treeItem.name.includes(keyword)) {
        return true;
      }
      let found = false;
      if (treeItem.children && treeItem.children.length > 0) {
        treeItem.children.forEach((child) => {
          const newfound = this.hasKeyword(child, keyword);
          found = (newfound === true) ? newfound : found;
        });
      }
      return found;
    },

    /**  Handle SET ACTIVE ITEM */
    handleActiveItemChange(item, layer, route) {
      this.resetActiveItem(this.categoryTree);
      this.setActiveItem(this.categoryTree, item.cid);
      this.setCurrentActiveItem(item, layer, route);
      this.$emit('activeItemChange', item);
    },
    setCurrentActiveItem(item, layer, route) {
      this.currentActiveItem = item;
      this.currentActiveItem.layer = layer;
      this.currentActiveItem.route = route;
    },
    resetActiveItem(treeItem) {
      if (treeItem.cid !== -1) {
        treeItem.isActive = false;
      }
      if (treeItem.children && treeItem.children.length > 0) {
        treeItem.children.forEach((child) => {
          this.resetActiveItem(child);
        });
      }
    },
    setActiveItem(treeItem, id) {
      if (treeItem.cid === id) {
        treeItem.isActive = true;
        return;
      }
      if (treeItem.children && treeItem.children.length > 0) {
        treeItem.children.forEach((child) => {
          this.setActiveItem(child, id);
        });
      }
    },
    handleSetActiveToAll() {
      console.log(this.$refs);
      const allRefName = '-3';
      const allRef = this.$refs[allRefName][0];
      allRef.$refs.treeItem.click();
    },

    /** Recursive Find Item */
    findItemParent(treeItem, id) {
      if (treeItem.children && treeItem.children.length > 0) {
        if (treeItem.children.findIndex(child => child.cid === id) !== -1) {
          return treeItem;
        }
        let parent;
        treeItem.children.forEach((child) => {
          const parentFound = this.findItemParent(child, id);
          parent = parentFound === undefined ? parent : parentFound;
        });
        return parent;
      }
      return undefined;
    },
    findItemRef(treeItem, refName) {
      if (treeItem.$refs) {
        const keys = Object.keys(treeItem.$refs);
        if (keys.length > 0) {
          const itemIdx = keys.findIndex(key => key === refName);
          if (itemIdx !== -1) {
            return treeItem.$refs[refName][0];
          }
        }
        let ref;
        keys.forEach((key) => {
          if (treeItem.$refs[key] !== undefined) {
            const nextItem = treeItem.$refs[key][0];
            if (nextItem !== undefined) {
              const refFound = this.findItemRef(nextItem, refName);
              ref = refFound === undefined ? ref : refFound;
            }
          }
        });
        return ref;
      }
      return undefined;
    },
    findItemParentRef(item) {
      const parent = this.findItemParent(this.categoryTree, item.cid);
      if (parent.cid === -1) {
        return undefined;
      }
      const parentRefName = `${parent.cid}-${parent.name}`;
      return this.findItemRef(this, parentRefName);
    },

    /** Handle EDIT ITEM NAME */
    handleItemNameChange(item, itemName) {  // v
      this.$emit('itemNameChange', item, itemName);
    },
    editItemNameSuccess(success) { // method call by parent to inform item name change state
      const refName = `${this.currentActiveItem.cid}`;
      const activeItemRef = this.findItemRef(this, refName);
      activeItemRef.editItemNameSuccess(success);
    },

    /** Handle ADD ROOT CATEGORY */
    addRootCategory() {
      if (!this.isAddingRoot) {
        this.isAddingRoot = true;
        this.$nextTick(() => {
          this.$refs.rootName.focus();
        });
      }
    },
    setCompositionState(bool) {
      this.compositionState = bool;
    },
    detectCompositionState() {
      this.wasCompositioning = this.compositionState;
    },
    confirmRootNameOnMethod(method) {
      if (this.wasCompositioning) {
        if (method === 'click') {
          this.detectCompositionState();
        } else if (method === 'enter') {
          return;
        }
      }
      this.confirmRootName();
    },
    confirmRootName() {
      this.rootName = this.rootName.trim();
      // cancel add root
      if (this.rootName === '') {
        this.isAddingRoot = false;
        return;
      }
      if (this.isRootNameDuplicate()) {
        const rootNameElem = this.$refs.rootName;
        rootNameElem.focus();
        this.rootName = '';
        return;
      }
      this.$emit('addCategory', -1, this.rootName, 1);
    },
    isRootNameDuplicate() {
      return this.categoryTree.children.findIndex(child => child.name === this.rootName) !== -1;
    },
    addCategorySuccess(success, category) {  // method call by parent
      if (this.isAddingRoot) {
        if (success) {
          this.resetActiveItem(this.categoryTree);
          this.categoryTree.children.push(category);
          this.setActiveItem(this.categoryTree, category.cid);
          this.$nextTick(() => {
            const categoryContentBlock = this.$refs.cardCategoryContent;
            categoryContentBlock.scrollTop = categoryContentBlock.scrollHeight;
          });
        }
        this.rootName = '';
        this.isAddingRoot = false;
        this.categoryNameKeyword = '';
      }
      // TODO: else is for add subcategory
    },

    /** Handle DELETE */
    popDeleteCategory() {
      if (!this.currentActiveItem.deletable) {
        return;
      }
      const option = {
        data: {
          msg: this.$t('category.delete_category_msg', { name: this.currentActiveItem.name }),
        },
        callback: {
          ok: () => {
            this.confirmDeleteCategory();
          },
        },
      };
      this.$popWarn(option);
    },
    confirmDeleteCategory() {
      this.$emit('deleteCategory', this.currentActiveItem);
    },
    deleteCategorySuccess(success) {
      if (success) {
        const parentRef = this.findItemParentRef(this.currentActiveItem);
        if (parentRef === undefined) {  // parent is root
          const idxToDel = this.categoryTree.children
            .findIndex(child => child.cid === this.currentActiveItem.cid);
          this.categoryTree.children.splice(idxToDel, 1);
          // back to all
          this.handleSetActiveToAll();
        } else {
          parentRef.deleteCategorySuccess(success, this.currentActiveItem.cid);
        }
      }
    },

    toggleEditMode() {
      this.isEditMode = !this.isEditMode;
      if (!this.isEditMode) {
        this.rootName = '';
        this.categoryNameKeyword = '';
        this.handleSetActiveToAll();
      }
      this.$emit('editModeChange', this.isEditMode);
    },

    // TODO: Add Sub Category
    addSubCategory() {
    //   if (this.currentCategory.cid < 0 || this.currentCategory.layer === this.maxLayer) return;
    //   const refName = `${this.currentCategory.cid}-${this.currentCategory.name}`;
    //   this.resetActiveCategory();
    //   this.appendSubCategory();
    //   const parentRef = this.findParentRef(this, refName);
    //   this.$nextTick(() => {
    //     const childRef = parentRef.$refs['0-'][0];
    //     childRef.editNewItemName();
    //   });
    },
  },
};
</script>
<style lang="scss" scoped>
@import 'styles/variable';
$category-item-height: 32px;

.card-category {
  display: flex;
  flex-direction: column;
  .card-category-header {
    background: #fcfcfc;
    flex: 0 0 auto;
    .card-category-header-block {
      padding: 0 10px 14px 10px;
      border-bottom: 1px solid $color-borderline;
      .card-category-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 60px;
        .card-category-title {
          @include font-16px();
          font-weight: 500;
          color: $color-font-active;
        }
        .card-category-setting {
          @include font-12px();
          color: $color-primary;
          cursor: pointer;
        }
      }  
      .search-input {
        width: 180px;
      }
    }

    .card-category-add-root {
      background: #fcfcfc;
      height: $category-item-height;
      line-height: 18px;
      padding: 10px;
      color: $color-primary;
      cursor: pointer;
      border-bottom: 1px solid $color-borderline;
      display: flex;
      align-items: center;
      input[type=text] {
        &.add-root {
          background: #fcfcfc;
          border: 0px;
          padding: 0px;
          width: calc(100% - 10px);
          &:focus {
            outline: none;
            border: 0px;
            box-shadow: 0 0 0 $color-white;
          }   
        }
      }
      .add-root-btn {
        @include font-14px();
        display: flex;
        align-items: center;
        .icon-block {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
  .card-category-content {
    flex: 1 1 auto;
    @include auto-overflow();
    @include customScrollbar();
    .no-category-search-result {
      height: $category-item-height;
      line-height: $category-item-height;
      text-align: center;
    }
  }
  .card-category-footer {
    flex: 0 0 auto;
    display: flex;
    background: #f8f8f8;
    border-top: 1px solid $color-borderline;
    .card-category-setting-option {
      flex: 1 1 50%;
      height: 28px;
      line-height: 28px;
      text-align: center;
      color: $color-primary;
      cursor: pointer;

      &.option-addsub {
        border-right: 1px solid $color-borderline;
      }
      &.option-disabled {
        color: $color-font-disabled;
        cursor: no-drop;
      }
    }
  }
}
</style>
