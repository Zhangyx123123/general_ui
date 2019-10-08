<template>
  <ul>
    <li>
      <div class="tree-item" ref="treeItem"
        :class="{'active-item': treeItem.isActive}"
        @click="setActiveItem">
        <span class="indentation" 
          :style="{ width: curLayer <= 1 ? '0' : `${15*(curLayer-1)}px`}">
        </span>
        <div class="icon-block" @click="toggleShowChild">
          <icon v-if="!hasChildren" icon-type="category_close" :size=16></icon>
          <icon v-else-if="!treeItem.showChild" icon-type="category_dropdown" :size=16></icon>
          <icon v-else-if="treeItem.showChild" icon-type="category_open" :size=16></icon>
        </div>
        <div class="item-name">
          <input v-if="isNameEditing" type="text" ref="itemName" 
            v-model="itemName"
            :placeholder="$t('wordbank.placeholder_category_name')"
            @compositionstart="setCompositionState(true)"
            @compositionend="setCompositionState(false)"
            @blur="confirmEditItemNameOnMethod('click')"
            @keydown.enter="detectCompositionState"
            @keyup.enter="confirmEditItemNameOnMethod('enter')"/>
          <span v-else class="tree-item-name">{{ treeItem.name }}</span>
        </div>
        <icon class="item-icon" icon-type="edit_blue" :size=8 
          v-if="treeItem.editable && canEdit && !treeItem.isActive"
          ref="editBtn"
          :class="{'invisible': !editMode}"
          @click="editItemName"/>
        <icon class="item-icon" icon-type="edit_white" :size=8 
          v-else-if="treeItem.editable && canEdit && treeItem.isActive"
          ref="editBtn"
          :class="{'invisible': !editMode}"
          @click="editItemName"/>
       </div>
      <category-tree-item 
        v-if="hasChildren && treeItem.showChild"
        v-for="(child, idx) in treeItem.children"
        :ref="`${child.cid}-${child.name}`"
        :key="`${idx}-${child.name}`"
        :treeItem="child"
        :editMode="editMode"
        :curLayer="curLayer + 1"
        :canEdit="canEdit"
        @activeItemChange="handleActiveItemChange"
        @itemNameChange="handleItemNameChange"
        @confirmAddSubCategory="addSubCategory"
        @cancelAddSubCategory="cancelSubCategory"
        @setActiveToAll="handleSetActiveToAll">
      </category-tree-item>
    </li>
  </ul>
</template>
<script>

export default {
  name: 'category-tree-item',
  props: {
    treeItem: {
      type: Object,
    },
    editMode: {
      type: Boolean,
      default: false,
    },
    curLayer: {
      type: Number,
      default: 0,
    },
    canEdit: {
      type: Boolean,
      default: false,
    },
  },
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
    hasChildren() {
      return this.treeItem.children.length > 0;
    },
  },
  methods: {
    setActiveItem() {
      const route = [this.treeItem.cid];
      this.$emit('activeItemChange', this.treeItem, this.curLayer, route);
    },
    handleActiveItemChange(activeItem, layer, route) {
      route.splice(0, 0, this.treeItem.cid);
      this.$emit('activeItemChange', activeItem, layer, route);
    },
    toggleShowChild() {
      this.treeItem.showChild = !this.treeItem.showChild;
    },

    // Handle Inputing
    setCompositionState(bool) {
      this.compositionState = bool;
    },
    detectCompositionState() {
      this.wasCompositioning = this.compositionState;
    },
    // editNewItemName() {
    //   this.isNewCategory = true;
    //   this.editItemName();
    // },
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
      // cancel edit
      if (this.itemName === '') {
        this.itemName = this.treeItem.name;
      }
      if (this.itemName === this.treeItem.name) {
        this.isNameEditing = false;
        return;
      }
      this.$emit('itemNameChange', this.treeItem, this.itemName);
    },
    editItemNameSuccess(success) { // method call by parent to inform item name change state
      if (success) {
        this.treeItem.name = this.itemName;
      } else {
        this.itemName = this.treeItem.name;
      }
      this.isNameEditing = false;
    },
    handleItemNameChange(item, itemName) {
      const isChild = this.treeItem.children.findIndex(child => child.cid === item.cid) !== -1;
      if (isChild) {
        if (this.isItemNameDuplicate(itemName)) {
          const refName = `${item.cid}-${item.name}`;
          const childRef = this.$refs[refName][0];
          childRef.cancelDuplicateNameEdit();
          return;
        }
        this.$emit('itemNameChange', item, itemName);
      } else {
        this.$emit('itemNameChange', item, itemName);
      }
    },
    isItemNameDuplicate(itemName) {
      return this.treeItem.children.findIndex(child => child.name === itemName) !== -1;
    },
    cancelDuplicateNameEdit() { // method call by parent
      // TODO: show Tooptip to warn duplicate
      const itemNameElem = this.$refs.itemName;
      this.itemName = '';
      itemNameElem.focus();
    },
    confirmAddSubCategory(method) {
      if (method === 'enter') {
        this.isNameEditing = false;
        return; // avoid trigger by both enter and blur;
      }
      this.itemName = this.itemName.trim();
      if (this.itemName === '') {
        this.$emit('cancelAddSubCategory');
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
      });
    },
    cancelSubCategory() {
      this.resetActiveCategory();
      this.cancelAddFromCurrentCategory();
    },
    deleteCategorySuccess(success, idToDel) {  // method call by parent
      if (success) {
        const idxToDel = this.treeItem.children.findIndex(child => child.id === idToDel);
        this.treeItem.children.splice(idxToDel);
        // back to all
        this.$emit('setActiveToAll');
      }
    },
    handleSetActiveToAll() {
      this.$emit('setActiveToAll');
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
      .triangle {
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

  .triangle-up {
    width: 0; 
    height: 0; 
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid $color-icon;
    &.active {
      border-bottom: 5px solid $color-white;
    }
  }
  .triangle-down {
    width: 0; 
    height: 0; 
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid $color-icon;
    &.active {
      border-top: 5px solid $color-white;
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
