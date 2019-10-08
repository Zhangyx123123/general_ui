<template>
  <ul>
    <li>
      <div class="tree-item" 
        :class="{'active-item': treeItem.isActive}"
        @click="setActive">
        <span class="indentation" 
          :style="{ width: treeItem.layer <= 1 ? '0' : `${15*(treeItem.layer-1)}px`}">
        </span>
        <div class="icon-block" @click="toggleShowChild">
          <icon v-if="!hasChildren" icon-type="category_close" :size=16></icon>
          <icon v-else-if="!treeItem.showChild" icon-type="category_dropdown" :size=16></icon>
          <icon v-else-if="treeItem.showChild" icon-type="category_open" :size=16></icon>
        </div>
        <div class="item-name">
          <input v-if="isNameEditing" type="text" ref="itemName" 
            v-model="itemName"
            maxlength="20"
            :placeholder="$t('wordbank.placeholder_category_name')"
            @compositionstart="setCompositionState(true)"
            @compositionend="setCompositionState(false)"
            @blur="confirmEditItemNameOnMethod('click')"
            @keydown.enter="detectCompositionState"
            @keyup.enter="confirmEditItemNameOnMethod('enter')"/>
          <div v-else class="tree-item-name">{{ treeItem.name }}</div>
        </div>
        <icon class="item-icon" icon-type="edit_blue" :size=8 
          v-if="treeItem.editable && canEdit && !treeItem.isActive"
          ref="editBtn"
          :class="{'invisible': !isEditMode}"
          @click="editItemName"/>
        <icon class="item-icon" icon-type="edit_white" :size=8 
          v-else-if="treeItem.editable && canEdit && treeItem.isActive"
          ref="editBtn"
          :class="{'invisible': !isEditMode}"
          @click="editItemName"/>
       </div>
      <category-tree 
        v-if="hasChildren && treeItem.showChild"
        v-for="(child, idx) in treeItem.children"
        :ref="`${child.cid}-${child.name}`"
        :key="`${idx}-${child.name}`"
        :treeItem="child"
        :canEdit="canEdit"
        @confirmAddSubCategory="addSubCategory"
        @cancelAddSubCategory="cancelSubCategory">
      </category-tree>
    </li>
  </ul>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import api from '../_api/wordbank';

export default {
  name: 'category-tree',
  props: {
    treeItem: {
      type: Object,
    },
    canEdit: {
      type: Boolean,
      default: true,
    },
  },
  api,
  data() {
    return {
      itemName: '',
      isNameEditing: false,
      wasCompositioning: false,
      compositionState: false,
      isNewCategory: false,
    };
  },
  computed: {
    ...mapGetters([
      'wordbank',
      'currentCategory',
      'isEditMode',
    ]),
    hasChildren() {
      return this.treeItem.children.length > 0;
    },
  },
  methods: {
    ...mapMutations([
      'setCurrentCategory',
      'resetActiveCategory',
      'addToCurrentCategory',
      'cancelAddFromCurrentCategory',
      'setHasNewCategory',
    ]),
    setActive() {
      // If set current category to a new one which is not yet added
      // we can't splice it out on cancel add category
      if (!this.isNewCategory) {
        this.setCurrentCategory(this.treeItem);
      }
      this.resetActiveCategory();
      this.treeItem.isActive = true;
    },
    toggleShowChild() {
      this.treeItem.showChild = !this.treeItem.showChild;
    },
    setCompositionState(bool) {
      this.compositionState = bool;
    },
    detectCompositionState() {
      this.wasCompositioning = this.compositionState;
    },
    editNewItemName() { // This is called by Category Card Component, don't delete it.
      this.isNewCategory = true;
      this.setHasNewCategory(true);
      this.editItemName();
    },
    editItemName() {
      this.isNameEditing = true;
      this.$nextTick(() => {
        this.$refs.itemName.focus();
      });
    },
    confirmEditItemNameOnMethod(method) {
      if (this.wasCompositioning) {
        if (method === 'click') {
          this.detectCompositionState();
        } else if (method === 'enter') {
          return;
        }
      }
      if (this.isNewCategory) {
        this.confirmAddSubCategory(method);
        return;
      }
      this.confirmEditItemName();
    },
    confirmEditItemName() {
      this.itemName = this.itemName.trim();
      if (this.itemName === '') {
        this.itemName = this.treeItem.name;
      }
      if (this.itemName === this.treeItem.name) {
        this.isNameEditing = false;
        return;
      }
      if (this.isItemNameDuplicate()) {
        const itemNameElem = this.$refs.itemName;
        this.itemName = '';
        itemNameElem.focus();
        return;
      }
      this.$api.updateCategory(this.treeItem.cid, this.itemName)
      .then(() => {
        this.treeItem.name = this.itemName;
      })
      .catch(() => {
        this.$notifyFail(this.$t('wordbank.error.edit_category_name_fail'));
        this.itemName = this.treeItem.name;
      })
      .finally(() => {
        this.isNameEditing = false;
      });
    },
    confirmAddSubCategory(method) {
      if (method === 'enter') {
        this.isNameEditing = false;
        return; // avoid trigger by both enter and blur;
      }
      this.itemName = this.itemName.trim();
      if (this.itemName === '') {
        this.$emit('cancelAddSubCategory');
        console.log('cancel add?');
        this.isNameEditing = false;
        return;
      }

      if (this.isItemNameDuplicate()) {
        const itemNameElem = this.$refs.itemName;
        this.itemName = '';
        itemNameElem.focus();
        return;
      }
      this.$emit('confirmAddSubCategory', this.itemName);
      this.treeItem.name = this.itemName;
      this.isNameEditing = false;
    },
    addSubCategory(name) {
      this.$api.addCategory(this.currentCategory.cid, name, this.currentCategory.layer + 1)
      .then((category) => {
        this.resetActiveCategory();
        this.addToCurrentCategory(category);
        this.setHasNewCategory(false);
      });
    },
    cancelSubCategory() {
      this.resetActiveCategory();
      this.cancelAddFromCurrentCategory();
      this.setHasNewCategory(false);
    },
    isItemNameDuplicate() {
      if (this.isNewCategory) { // current is still parent
        return this.currentCategory.children
          .findIndex(child => child.name === this.itemName) !== -1;
      }
      const parentCategory = this.findCategoryParent(this.wordbank, this.currentCategory.cid);
      return parentCategory.children.findIndex(child => child.name === this.itemName) !== -1;
    },
    findCategoryParent(wordbank, cid) {
      if (wordbank.children && wordbank.children.length > 0) {
        const targetIndex = wordbank.children.findIndex(child => child.cid === cid);
        if (targetIndex !== -1) {
          return wordbank;
        }
        let parent;
        wordbank.children.forEach((child) => {
          const newparent = this.findCategoryParent(child, cid);
          parent = (newparent === undefined) ? parent : newparent;
        });
        return parent;
      }
      return undefined;
    },
  },
  mounted() {
    this.itemName = this.treeItem.name;
  },
};
</script>
<style lang="scss" scoped>
  @import './styles/variable';
  ul {
    padding: 0px;
  }
  li {
    @include font-12px();
    list-style: none;
    text-decoration: none;
    display: flex;
    flex-direction: column;

    .tree-item {
      box-sizing: border-box;
      height: 32px;
      flex: 0 0 auto;
      padding: 0 10px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid $color-borderline;
      cursor: pointer;

      &.active-item {
        background: $color-primary;
        color: $color-white;
      }
      &:hover:not(.active-item) {
        background: #f8f8f8;
      }
      .icon-block {
        flex: 0 0 auto;
        height: 30px;
        width: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .indentation {
        display: inline-block;
        flex: 0 0 auto;
      }
      .item-name {
        flex: 1;
        position: relative;
        display:flex;
        align-items: center;
        
        .tree-item-name {
          display: inline-block;
          position: absolute; 
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          // IE11 Hack: absolutely positioned component cannot be align centered by flex parent
          @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
            position: relative;
          }
        }
      }
      .item-icon {
        flex: 0 0 12px;
        margin: 0 2px 0 12px;
      }
    }
  }

  .invisible {
    visibility: hidden;
  }

  input[type=text] {
    background: $color-primary;
    border: 0px;
    color: $color-white;
    padding: 0px;
    width: calc(100% - 10px);
    &:focus {
      outline: none;
      border: 0px;
      box-shadow: 0 0 0 $color-white;
    }
  }
</style>
