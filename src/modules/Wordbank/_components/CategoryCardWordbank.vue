
<template>
  <div id="card-category">
    <div id="card-category-header">
      <div id="card-category-header-block">
        <div id="card-category-row">
          <div class="card-category-title">
            {{ $t('pages.wordbank.wordbank_list') }}
            <icon iconType="info" :size="16" enableHover v-tooltip="categoryCardTooltip"></icon>
          </div>
          <div v-if="canSetting" class="card-category-setting" @click="triggerEditMode">
            <span v-if="isEditMode"> {{ $t('wordbank.leave_setting') }}</span>
            <span v-else> {{ $t('wordbank.setting') }} </span>
          </div>
        </div>
        <search-input ref="categorySearchBox" v-model="categoryNameKeyword"></search-input>
      </div>
      <div id="card-category-add-root" v-if="isEditMode && canCreate" @click="addRootCategory"> 
        <input id="add-root" type="text"
          v-if="isAddingRoot" v-model="rootName" ref="rootName" 
          :placeholder="$t('wordbank.placeholder_category_name')"
          maxlength="20"
          @compositionstart="setCompositionState(true)"
          @compositionend="setCompositionState(false)"
          @blur="confirmRootNameOnMethod('click')"
          @keydown.enter="detectCompositionState"
          @keyup.enter="confirmRootNameOnMethod('enter')">
        <div v-else id="add-root-btn">
          <div class="icon-block">
            <icon icon-type="category_add" :size=16></icon>
          </div>
          <span> {{ $t('wordbank.add_rootcategory') }} </span>
        </div>
      </div>
    </div>
    <div id="card-category-content" ref="cardCategoryContent">
      <div v-if="!hasSearchResult" id="no-category-search-result">
        {{ $t('wordbank.empty_category_search_result') }}
      </div>
      <category-tree v-for="(child, idx) in wordbank.children" 
        v-if="child.visible"
        :canEdit="canEdit"
        :treeItem="child"
        :ref="`${child.cid}-${child.name}`"
        :key="`${child.name}-${idx}`"></category-tree>
    </div>
    <div id="card-category-footer" v-if="isEditMode">
      <div v-if="canCreate" class="card-category-setting-option"
        :class="{'option-disabled': disallowAddSubCategory}"
        @click="addSubCategory">
        {{ $t('wordbank.add_subcategory') }}
      </div>
      <div v-if="canDelete" class="card-category-setting-option"
        :class="{'option-disabled': disallowDeleteCategory}"
        @click="popDeleteCategory">
        {{ $t('wordbank.delete_category') }}
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import { mapGetters, mapMutations } from 'vuex';
import CategoryTree from './CategoryTree';
import api from '../_api/wordbank';

Vue.component('category-tree', CategoryTree);

export default {
  privCode: 'wordbank',
  api,
  data() {
    return {
      categoryNameKeyword: '',
      isAddingRoot: false,
      rootName: '',
      compositionState: false,
      wasCompositioning: false,
      hasSearchResult: true,
      MAX_LAYER: 4,
      categoryCardTooltip: {
        msg: this.$t('wordbank.category_card_tooltip'),
      },
    };
  },
  computed: {
    ...mapGetters([
      'wordbank',
      'currentCategory',
      'isEditMode',
      'isFilterMode',
      'hasNewCategory',
    ]),
    disallowAddSubCategory() {
      return this.currentCategory.layer === this.MAX_LAYER || this.currentCategory.cid < 0
        || this.isAddingRoot || this.hasNewCategory;
    },
    disallowDeleteCategory() {
      return !this.currentCategory.deletable || this.isAddingRoot || this.hasNewCategory;
    },
    canEdit() {
      return this.$hasRight('edit');
    },
    canDelete() {
      return this.$hasRight('delete');
    },
    canCreate() {
      return this.$hasRight('create');
    },
    canSetting() {
      return this.canEdit || this.canDelete || this.canCreate;
    },
  },
  watch: {
    categoryNameKeyword() {
      if (this.categoryNameKeyword !== '') {
        this.setFilterMode(true);
      } else {
        this.setFilterMode(false);
      }
      this.filterCategory(this.categoryNameKeyword);
      this.hasSearchResult = false;
      this.wordbank.children.forEach((child) => {
        this.hasSearchResult = child.visible || this.hasSearchResult;
      });
    },
  },
  methods: {
    ...mapMutations([
      'setWordbank',
      'setCurrentCategory',
      'toggleEditMode',
      'resetActiveCategory',
      'appendToRootCategory',
      'appendSubCategory',
      'removeCurrentCategory',
      'setFilterMode',
      'filterCategory',
    ]),
    addRootCategory() {
      if (!this.isAddingRoot) {
        this.isAddingRoot = true;
        this.$nextTick(() => {
          this.$refs.rootName.focus();
        });
      }
    },
    addSubCategory() {
      if (this.disallowAddSubCategory) return;
      const refName = `${this.currentCategory.cid}-${this.currentCategory.name}`;
      this.resetActiveCategory();
      this.appendSubCategory();
      const parentRef = this.findParentRef(this, refName);
      this.$nextTick(() => {
        const childRef = parentRef.$refs['0-'][0];
        childRef.editNewItemName();
      });
    },
    findParentRef(elem, refName) {
      if (elem.$refs) {
        const keys = Object.keys(elem.$refs);
        if (keys.length !== 0) {
          const idx = keys.findIndex(key => key === refName);
          if (idx !== -1) {
            return elem.$refs[refName][0];
          }
          let parent;
          keys.forEach((key) => {
            if (elem.$refs[key] !== undefined) {
              const nextElem = elem.$refs[key][0];
              if (nextElem !== undefined) {
                const newparent = this.findParentRef(nextElem, refName);
                parent = newparent === undefined ? parent : newparent;
              }
            }
          });
          return parent;
        }
      }
      return undefined;
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
      this.$api.addCategory(-1, this.rootName, 1)
      .then((category) => {
        this.resetActiveCategory();
        this.appendToRootCategory(category);
        this.$nextTick(() => {
          const categoryContentBlock = this.$refs.cardCategoryContent;
          categoryContentBlock.scrollTop = categoryContentBlock.scrollHeight;
        });
      })
      .catch(() => {
        this.$notifyFail(this.$t('wordbank.error.add_category_fail'));
      })
      .finally(() => {
        this.rootName = '';
        this.isAddingRoot = false;
        this.categoryNameKeyword = '';
      });
    },
    isRootNameDuplicate() {
      return this.wordbank.children.findIndex(child => child.name === this.rootName) !== -1;
    },
    popDeleteCategory() {
      if (this.disallowDeleteCategory) {
        return;
      }
      const option = {
        data: {
          msg: this.$t('wordbank.delete_category_msg', { name: this.currentCategory.name }),
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
      const cid = this.currentCategory.cid;
      this.$api.deleteWordbankCategory(cid)
      .then(() => {
        this.resetActiveCategory();
        this.removeCurrentCategory(cid);
        this.setCurrentCategory(this.wordbank.children[0]);
      })
      .catch(() => {
        this.$notifyFail(this.$t('wordbank.error.delete_category_fail'));
      });
    },
    triggerEditMode() {
      this.toggleEditMode();
      if (!this.isEditMode) {
        this.rootName = '';
        this.loadWordbanks();
      }
    },
    loadWordbanks() {
      const that = this;
      that.$startPageLoading();
      that.$api.getWordbanks()
        .then((data) => {
          that.setWordbank(data);
          that.setCurrentCategory(data.children[0]);
          data.children[0].isActive = true;
        })
        .catch((err) => {
          console.log(err);
          that.$notifyFail(this.$t('wordbank.error.load_wordbanks_fail'));
        })
        .finally(() => {
          that.$emit('endLoading');
        });
    },
  },
};
</script>
<style lang="scss" scoped>
@import 'styles/variable';
$category-item-height: 32px;

#card-category {
  display: flex;
  flex-direction: column;
  #card-category-header {
    background: #fcfcfc;
    flex: 0 0 auto;
    #card-category-header-block {
      padding: 0 10px 14px 10px;
      // padding-bottom: 14px;
      border-bottom: 1px solid $color-borderline;
      #card-category-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 60px;
        .card-category-title {
          @include font-16px();
          font-weight: 500;
          color: $color-font-active;
          display: flex;
          align-items: center;
          .icon {
            margin-left: 6px;
          }
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

    #card-category-add-root {
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
        &#add-root {
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

      #add-root-btn {
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
  #card-category-content {
    flex: 1 1 auto;
    @include auto-overflow();
    @include customScrollbar();
    #no-category-search-result {
      height: $category-item-height;
      line-height: $category-item-height;
      text-align: center;
    }
  }
  #card-category-footer {
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

      &.option-disabled {
        color: $color-font-disabled;
        cursor: no-drop;
      }
    }
    :first-child {
      border-right: 1px solid $color-borderline;
    }
  }
}
</style>
