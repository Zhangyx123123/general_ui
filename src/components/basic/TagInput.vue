<template>
  <div class="tags-wrapper" :style="{width: width}">
    <div class="tooltip-container" v-if="showTooltip">
      <div class="tooltip"> {{ errorWording }} </div>
    </div>
    <div class="tags-container"
      :class="{'tags-area': area, 'disabled': readonly}">
      <div class="tags-input-container" @click.stop="$refs.taginput.focus()">
        <span class="tags" v-for="(tag, idx) in selectedTags" :key="tag" :data-index="idx">
          <!-- <span class="tag-remove-btn" @click="removeTag(idx)">x</span> -->
          {{ tag }}
          <span v-if="!readonly" class="tag-remove-btn">
            <icon icon-type="close" :size="8" @click.stop="removeTag(idx)"/>
          </span>
        
        </span>
        <input ref="taginput" class="tags-input" type="text" :maxlength="maxlength" :size="inputSize"
          v-model="inputTag"
          :disabled="readonly"
          @keydown="handleKeyDown()"
          @compositionstart="setCompositionState(true)"
          @compositionend="setCompositionState(false)"
          @compositionupdate="countInputingLength($event)"
          @keydown.enter="detectCompositionState"
          @keyup.enter="addTagByInput(inputTag)"
          @focus="openSelector">
          <!-- 
            @keyup.188="addTagByInput(inputTag)"
            @keydown.delete="deleteTag($event)"
            @keydown.left="toPrevTag()"
            @keydown.right="toNextTag()"
            @keydown.up="toPrevSelect()"
            @keydown.down="toNextSelect()"
            @keydown.enter="addTagBySelector(curSelectItemIdx)" 
          -->
      </div>
      <div v-if="!readonly" class="dropdown-icon" @click.stop="toggleSelector">
        <icon icon-type="drop_down" :size="12"/>
      </div>
    </div>
    <div class="tags-selector" v-if="showSelector">
      <div class="tags-selector-items" v-for="(item, idx) in selectItems"
        :key="item" 
        :class="{'tags-selector-items-selected': isItemSelected(item)}"
        @click="addTagBySelector(idx)"
        @mousemove="changeSelectItemFocus(idx)"
        @mouseout="changeSelectItemFocus(-1)">
        <span>{{ item }}</span>
        <icon icon-type="checked" v-if="isSelectItemFocus(item, idx)" :size=16></icon>
        <icon icon-type="check" v-else-if="isItemSelected(item)" :size=16></icon>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    origTags: {
      type: Array,
      default: () => [],
    },
    tagsList: {
      type: Array,
      default: () => [],
    },
    maxtag: {
      type: Number,
      default: Infinity,
    },
    maxlength: {
      type: Number,
      default: Infinity,
    },
    tagValidation: {
      type: Function,
      default: null,
    },
    allowTypeahead: {
      type: Boolean,
      default: false,
    },
    allowNewTag: {
      type: Boolean,
      default: true,
    },
    area: {
      type: Boolean,
      default() {
        return false;
      },
    },
    width: {
      type: String,
      default: '160px',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      inputTag: '',
      isInputing: false,
      compositionState: false,
      wasCompositioning: false,
      inputingLength: 0,
      selectedTags: [],
      errorWording: '',
      curSelectItemIdx: -1,
      showTooltip: false,
      selectorControl: false,
    };
  },
  computed: {
    inputSize() {
      return this.inputTag.length + this.inputingLength + 4;
    },
    showSelector() {
      return this.allowTypeahead && (this.selectItems.length > 0)
        && (!this.isExceedMax()) && this.selectorControl;
    },
    selectItems() {
      if (this.inputTag.length !== 0 && this.tagsList.length !== 0 && (!this.isExceedMax())) {
        const pattern = `.*${this.escapeRegExp(this.inputTag)}.*`;
        const tagRegex = new RegExp(pattern);
        const items = this.tagsList.filter(item =>
          item.match(tagRegex));
        return (items !== null) ? items : [];
      }
      return this.tagsList;
    },
  },
  watch: {
    selectedTags() {
      this.$emit('selectedTagsChanged', this.selectedTags);
    },
    inputTag() {
      if (this.inputTag.length > 0) {
        this.removeAllTagFocus();
      }
    },
    origTags() {
      this.selectedTags = [];
      if (this.origTags.length > 0) {
        this.origTags.forEach((tag) => {
          this.selectedTags.push(tag);
        });
      }
    },
  },
  methods: {
    toggleSelector() {
      this.selectorControl = !this.selectorControl;
    },
    openSelector() {
      this.selectorControl = true;
    },
    closeSelector() {
      this.selectorControl = false;
    },
    // handleKeyDown() {
    // },
    clickOutside(e) {
      if (this.$el && !this.$el.contains(e.target)) {
        this.closeSelector();
      }
      return false;
    },
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    },
    /**
     * Handle Input Compositioning
     * */
    setCompositionState(bool) {
      this.compositionState = bool;
      if (!bool) {
        this.inputingLength = 0;
      }
    },
    detectCompositionState() {
      this.wasCompositioning = this.compositionState;
    },
    countInputingLength(e) {
      this.inputingLength = e.data.length;
    },
    /**
     * Handle Add Tag
     * */
    addTagByInput(tag) {
      if (this.wasCompositioning) {
        return;
      }
      const splitTag = tag.split(/[ ,]+/);
      let tagToAdd = tag;
      let tagRemain = '';
      if (splitTag.length > 1) {
        tagToAdd = splitTag[0];
        tagRemain = splitTag[1];
      }
      const idx = this.getIdxToInsertTag();
      if (this.allowNewTag && !this.isInputing && tagToAdd !== '') {
        const errmsg = this.checkTagError(tagToAdd);
        if (errmsg === '') {
          this.addSelectedTag(idx, tagToAdd);
          this.addNewTag(tagToAdd);
          this.$nextTick(() => {
            this.inputTag = tagRemain;
          });
        } else {
          this.inputTag = tag.replace(/ /g, '');
          this.$emit('tagError', errmsg);
        }
      } else {
        this.inputTag = tag.replace(/ /g, '');
      }
    },
    addTagBySelector(selectedIdx) {
      if (this.selectItems.length !== 0) {
        const tag = this.selectItems[selectedIdx];
        const idx = this.getIdxToInsertTag();
        const errmsg = this.checkTagError(tag);
        if (errmsg === '') {  // add Tage
          this.addSelectedTag(idx, tag);
          this.addNewTag(tag);
        } else if (this.isDuplicate(tag)) { // delete tag if already added
          const idxToRemove = this.selectedTags.indexOf(tag);
          this.removeTag(idxToRemove);
        } else {
          this.$emit('tagError', errmsg);
        }
      }
    },
    addTagByClickOutside() {
      const tag = this.inputTag;
      const idx = this.getIdxToInsertTag();
      if (tag !== '' && this.allowNewTag) {
        const errmsg = this.checkTagError(tag);
        if (errmsg === '') {
          this.addSelectedTag(idx, tag);
          this.addNewTag(tag);
          this.$nextTick(() => {
            this.$refs.taginput.blur();
          });
        }
      }
      this.inputTag = '';
    },
    getIdxToInsertTag() {
      let nextTag;
      if (this.$refs.tagInput) {
        nextTag = this.$refs.taginput.nextElementSibling;
      }
      return nextTag ? nextTag.getAttribute('data-index') : this.selectedTags.length;
    },
    addSelectedTag(idx, tag) {
      this.selectedTags.splice(idx, 0, tag);
      this.inputTag = '';
      this.removeAllTagFocus();
      this.curSelectItemIdx = 0;
      this.$nextTick(() => {
        this.toNextTag();
      });
    },
    addNewTag(tag) {
      if (this.allowNewTag && this.tagsList.indexOf(tag) === -1) {
        this.tagsList.splice(0, 0, tag);
        this.$emit('addNewTag', tag);
      }
    },
    /**
     * Tag Validity Checking
     * */
    checkTagError(tag) {
      let errmsg = '';
      if (this.isExceedMax()) {
        errmsg = 'ExceedMaxTag';
      } else if (!this.isValidTag(tag)) {
        errmsg = 'InvalidTag';
      } else if (this.isDuplicate(tag)) {
        errmsg = 'DuplicateTag';
      }
      return errmsg;
    },
    isDuplicate(tag) {
      return (this.selectedTags.indexOf(tag) !== -1);
    },
    isExceedMax() {
      return (this.selectedTags.length >= this.maxtag);
    },
    isValidTag(tag) {
      return (this.tagValidation) ? this.tagValidation(tag) : true;
    },
    /**
     * Handle Delete Tag
     * */
    removeTag(idx) {
      this.selectedTags.splice(idx, 1);
    },
    deleteTag(e) {
      if (this.inputTag.length === 0 && !this.isInputing) {
        const prevTag = e.target.previousElementSibling;
        if (prevTag) {
          if (!prevTag.classList.contains('tag-focus')) {
            prevTag.classList.add('tag-focus');
          } else {
            const idx = prevTag.getAttribute('data-index');
            this.selectedTags.splice(idx, 1);
          }
        }
      }
    },
    /**
     * Handle Input Tag Behavior
     * */
    toPrevTag() {
      if (this.inputTag.length === 0 && this.selectedTags.length !== 0) {
        const inputBox = this.$refs.taginput;
        const container = inputBox.parentElement;
        const curPrevTag = inputBox.previousElementSibling;
        if (curPrevTag) {
          if (!curPrevTag.classList.contains('tag-focus')) {
            curPrevTag.classList.add('tag-focus');
          } else {
            const newPrevTag = curPrevTag.previousElementSibling;
            this.removeAllTagFocus();
            container.insertBefore(inputBox, curPrevTag);
            if (newPrevTag) {
              newPrevTag.classList.add('tag-focus');
            }
          }
        }
        inputBox.focus();
      }
    },
    toNextTag() {
      if (this.inputTag.length === 0 && this.selectedTags.length !== 0) {
        const inputBox = this.$refs.taginput;
        const container = inputBox.parentElement;
        const curNextTag = inputBox.nextElementSibling;
        this.removeAllTagFocus();
        if (curNextTag) {
          const newNextTag = curNextTag.nextElementSibling;
          curNextTag.classList.add('tag-focus');
          container.insertBefore(inputBox, newNextTag);
        }
        inputBox.focus();
      }
    },
    removeAllTagFocus() {
      const spanTags = document.querySelectorAll('.tags');
      spanTags.forEach((tag) => {
        tag.classList.remove('tag-focus');
      });
    },
    /**
     * Handle Tag Selector Behavior
     * */
    toPrevSelect() {
      if (this.curSelectItemIdx > 0) {
        this.curSelectItemIdx -= 1;
      }
    },
    toNextSelect() {
      if (this.curSelectItemIdx < this.selectItems.length - 1) {
        this.curSelectItemIdx += 1;
      }
    },
    isItemSelected(item) {
      return this.selectedTags.indexOf(item) !== -1;
    },
    isSelectItemFocus(item, idx) {
      return this.curSelectItemIdx === idx;
    },
    changeSelectItemFocus(idx) {
      this.curSelectItemIdx = idx;
    },
  },
  mounted() {
    const that = this;
    document.addEventListener('click', this.clickOutside, false);
    if (that.origTags.length > 0) {
      that.origTags.forEach((tag) => {
        that.selectedTags.push(tag);
      });
    }
  },
};
</script>
<style lang="scss" scoped>
@import "styles/variable";
$row-height: 28px;
$color-tag-hover: $color-disabled;
.tags-wrapper {
  position: relative;
  width: 160px;
  .tags-container {
    box-sizing: border-box;
    border: solid 1px $color-borderline;
    border-radius: 2px;
    background-color: $color-white;
    height: $row-height;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &.disabled {
      &:hover {
        border-color: $color-borderline;
      }
    }
    &:hover {
      border-color: $color-borderline-hover;
    }
    &:focus-within {  /** do not support IE **/
      outline: none;
      box-shadow: 0 0 0 2px rgba(75, 75, 100, 0.2);
      border-color: $color-borderline-hover;
    }
    &.tags-area {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: flex-start;
      align-content: flex-start;
      height: calc(#{$row-height} * 5);
      overflow-y: scroll;
    }
    .tags-input-container {
      flex: 1;
      overflow: auto;
      white-space: nowrap;
      height: 100%;
      @include customScrollbar();
      display: flex;
      align-items: center;
      &:hover {
        cursor: text;
      }
      .tags-input {
        @include font-12px();
        box-sizing: border-box;
        display: inline-block;
        border: 0;
        color: $color-font-normal;
        padding: 0 5px;

        &:focus{
          outline: none;
          box-shadow: 0px 0px 0px 0px;
          border: 0;
        }
      }

      .tags {
        @include font-12px();
        display: inline-flex;
        align-items: center;
        color: $color-font-normal;
        background-color: #eeeeee;
        margin: 0 3px;
        height: 20px;
        padding-left: 10px;
        padding-right: 5px;
        border-radius: 2px;
        line-height: 22px;
        &.tag-focus {
          color: $color-white;
          background-color: $color-tag-hover;
        }

        .tag-remove-btn {
          font-weight: bold;
          margin-left: 10px;
          &:hover {
            cursor: pointer;
          }
        }
      }
    }
    .dropdown-icon {
      flex: 0 0 auto;
      display: inline-block;
      font-weight: bold;
      padding: 3px 10px;
      &:hover {
        cursor: pointer;
      }
    }
  }

  .tags-selector {
    @include font-14px();
    @include customScrollbar();
    background-color: #ffffff;
    position: absolute;
    width: inherit;
    height: calc(#{$row-height} * 4);
    overflow: auto;
    top: calc(#{$row-height} + 5px);
    z-index: 1;
    border: 1px solid $color-borderline;
    border-radius: 2px;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
    .tags-selector-items {
      box-sizing: border-box;
      height: $row-height;
      padding: 5px 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: $color-font-normal;
      &:hover {
        color: $color-white;
        background-color: $color-select-hover;
      }
      &.tags-selector-items-selected {
        background-color: $color-select;
        &:hover {
          color: $color-white;
          background-color: $color-select-hover;
        }
      }
      &:hover {
        cursor: pointer;
      }
    }
  }
}
.tooltip-container {
  position: relative;
  .tooltip {
    $tool-tip-color: #ffc0cb;
    line-height: 1em;
    background-color: $tool-tip-color; 
    color: #2c3e50;
    text-align: center;
    border-radius: 5px;
    padding: 5px;
    position: absolute;
    min-width: 50%;
    display: inline-block;
    bottom: calc(100% + 5px);

    &::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 15%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: $tool-tip-color transparent transparent transparent;
    }
  }
}
</style>
