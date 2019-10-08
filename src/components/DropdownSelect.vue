<template>
  <div class="dropdown-container">
  <div class="dropdown-name" v-if="name !== undefined">{{ name }}</div>
  <div class="dropdown-select" :style="styleObj">
    <div class="input-bar" :class="{'is-focus': show, error: showError, disabled}" :style="inputBarStyle" ref="input" @click="showSelection">
      <div class="input-block" :class="{multi}">
        <span v-if="!checkedValues.length" class="placeholder">{{ placeholder }}</span>
        <template v-if="multi">
        <tag class="input-tag" v-for="value in checkedValues" :key="value.value" font-class="font-12">
          {{ value.text }}
          <icon v-if="!hideClose" icon-type="close" :size="8" class="close-icon" @click.stop="removeOption(value)"/>
        </tag>
        </template>
        <template v-else-if="filterable">
          <input
            class="input-search" 
            ref="searchInput"
            :value="filtering ? searchKeyWord : checkedValues[0] && checkedValues[0].text" 
            @input="filterInput"
            @focus="$event.target.select()"/>
        </template>
        <template v-else-if="checkedValues.length > 0">
          <div class="input-text">{{checkedValues[0].text}}</div>
        </template>
      </div>
      <div class="icon-block">
        <icon icon-type="drop_down" :size=10></icon>
      </div>
    </div>
    <div ref="list" v-if="show" class="select-list" :style="listStyle">
      <div class="search-bar" v-if="showSearchBar">
        <search-input v-model="searchKeyWord" fill></search-input>
      </div>
      <div class="select-item-block">
        <div v-if="action" class="select-item item-action" @click="onClickAction($event, action.onclick)">
          <div>{{ action.text }}</div>
        </div>
        <template v-if="filteredLocalOptions.length === 0">
          <div class="select-item item">
            <div class="select-text not-selectable" :style="selectTextStyle">
              {{ filterable ? $t('general.no_filterable_option') : $t('general.no_option') }}
            </div>
          </div>
        </template>
        <template v-else  v-for="(option, idx) in filteredLocalOptions">
        <div class="select-item item" :key="idx" v-if="!option.isGroup"
          :class="{
            checked: option.checked && showCheckedIcon,
            'in-group': option.inGroup,
            'is-button': option.isButton,
            filterable: option.checked && filterable,
          }"
          @click="selectOption(idx)"
          @mouseover="toggleHover(option, true)" @mouseout="toggleHover(option, false)">
          <div class="select-text" :style="selectTextStyle"> {{option.text}} </div>
          <div class=select-icon-container v-if="showCheckedIcon">
            <div class="select-icon" v-if="!option.checked && !option.isButton">
              <icon icon-type="checked" :size=16></icon>
            </div>
            <div class="select-icon" v-if="option.checked">
              <icon v-if="option.hovered" icon-type="checked" :size=16></icon>
              <icon v-else icon-type="check" :size=16></icon>
            </div>
          </div>
        </div>
        <div class="select-item group" :class="{'group-selectable': groupSelectable}"
          v-if="option.isGroup" :key="idx"
          @mouseover="toggleGroupHover(option, true)" @mouseout="toggleGroupHover(option, false)" @click="selectGroup(idx)">
          <div class="select-text">{{ option.text }}</div>
          <div v-if="option.hovered && groupSelectable" class="select-all">{{ $t('general.select_all') }}</div>
        </div>
        </template>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  name: 'dropdown-select',
  props: {
    value: {
      type: Array,
      default() {
        return [];
      },
    },
    name: {
      type: String,
      required: false,
      default: undefined,
    },
    options: {
      type: Array,
      validator: input => input.reduce((ret, value) =>
        ret && (value.text !== undefined) && (value.value !== undefined || value.isGroup), true),
      default: () => [],
    },
    showCheck: {
      type: Boolean,
      default: true,
    },
    multi: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: 'auto',
    },
    flex: {
      type: Boolean,
      default: false,
    },
    fixedListWidth: {
      type: Boolean,
      default: true,
    },
    showCheckedIcon: {
      type: Boolean,
      default: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
    inputBarStyle: {
      type: Object,
      default() {
        return {};
      },
    },
    showSearchBar: {
      type: Boolean,
      default: false,
    },
    showError: {
      type: Boolean,
      default: false,
    },
    hideClose: {
      type: Boolean,
      default: true,
    },
    filterable: {
      type: Boolean,
      default: false,
    },
    allowSelectGroup: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    action: {
      type: Object,
      default() {
        return undefined;
      },
    },
  },
  computed: {
    styleObj() {
      return {
        width: this.width,
        flex: `1 1 ${this.width}`,
      };
    },
    filteredLocalOptions() {
      if ((this.filterable && !this.filtering) || this.searchKeyWord === '') {
        return this.localOptions;
      }
      return this.localOptions.filter(option => option.text.indexOf(this.searchKeyWord) !== -1);
    },
    groupSelectable() {
      return this.multi && this.allowSelectGroup;
    },
  },
  data() {
    return {
      show: false,
      localOptions: [],
      listStyle: {},
      selectTextStyle: {},
      checkedValues: [],
      detectClickListener: undefined,
      searchKeyWord: '',
      filtering: false,
    };
  },
  watch: {
    options(options) {
      this.initOptions(options);
    },
    show(show) {
      if (!show && this.showSearchBar) {
        this.searchKeyWord = '';
      }
    },
  },
  methods: {
    filterInput(e) {
      if (e.target.value.length) {
        this.filtering = true;
      }
      this.searchKeyWord = e.target.value;
    },
    removeOption(opt) {
      opt.checked = false;
      this.updateValue();
    },
    addEventListeners() {
      window.addEventListener('click', this.hideListWhenEventTriggeredOutside);
      window.addEventListener('scroll', this.hideListWhenEventTriggeredOutside, true);
      window.addEventListener('resize', this.reposition);
    },
    removEventListeners() {
      window.removeEventListener('click', this.hideListWhenEventTriggeredOutside);
      window.removeEventListener('scroll', this.hideListWhenEventTriggeredOutside, true);
      window.removeEventListener('resize', this.reposition);
    },
    onClickAction(e, action) {
      const that = this;
      if (action) {
        action(e);
      }
      that.show = false;
      that.removEventListeners();
    },
    selectGroup(idx) {
      const that = this;
      if (!that.groupSelectable) return;

      let nextGroupIdx = that.localOptions.findIndex(
        (option, index) => option.isGroup === true && index > idx);
      nextGroupIdx = nextGroupIdx > 0 ? nextGroupIdx : undefined;

      const selectedValues = that.localOptions
          .slice(idx + 1, nextGroupIdx).map(option => option.value);
      selectedValues.forEach((value) => {
        const option = that.localOptions.find(o => o.value === value);
        option.checked = true;
        that.toggleHover(option, false);
      });
      this.filtering = false;
      that.updateValue();
    },
    selectOption(idx) {
      const value = this.filteredLocalOptions[idx].value;
      const that = this;
      if (that.multi) {
        const option = that.localOptions.find(o => o.value === value);
        option.checked = !option.checked;
        that.toggleHover(option, false);
      } else {
        that.localOptions.forEach((option) => {
          option.checked = false;
        });
        const option = that.localOptions.find(o => o.value === value);
        option.checked = true;
        that.show = false;
        this.removEventListeners();
      }
      this.filtering = false;
      that.updateValue();
    },
    updateValue() {
      this.checkedValues = this.localOptions.filter(opt => opt.checked);
      if (this.filterable) {
        this.searchKeyWord = this.checkedValues[0].text;
      }
      this.$emit('input', this.checkedValues.map(opt => opt.value));
    },
    showSelection() {
      const that = this;
      if (that.disabled) {
        return;
      }
      if (that.show) {
        that.show = false;
        return;
      }
      if (that.filterable) {
        const searchInput = that.$refs.searchInput;
        searchInput.focus();
      }
      that.show = true;

      that.reposition();

      that.addEventListeners();
    },
    hideListWhenEventTriggeredOutside(e) {
      if (this.$refs.list && !this.$refs.list.contains(e.target)) {
        this.show = false;
        this.filtering = false;
        this.removEventListeners();
      }
    },
    reposition() {
      const inputBox = this.$refs.input.getBoundingClientRect();
      this.listStyle = {
        position: 'fixed',
        top: `${inputBox.top + inputBox.height + 3}px`,
        left: `${inputBox.left}px`,
        width: `${inputBox.width}px`,
      };
      if (!this.fixedListWidth) {
        this.listStyle.width = 'auto';
        this.listStyle['min-width'] = `${inputBox.width}px`;
        this.selectTextStyle['flex-grow'] = 0;
        this.selectTextStyle['flex-shrink'] = 0;
        this.selectTextStyle['flex-basis'] = 'auto';
      }
    },

    /**
     * Reset all options to assigned values
     * Will replace checked values with assigned values
     * @param {Array} valueToCheck
     * */
    resetCheckedValue(valueToCheck) {
      const that = this;
      that.localOptions.forEach((option) => {
        option.checked = false;
      });
      if (valueToCheck) {
        that.localOptions.forEach((opt) => {
          if (valueToCheck.indexOf(opt.value) !== -1) {
            opt.checked = true;
          }
        });
      }
      that.checkedValues = this.localOptions.filter(opt => opt.checked);
      that.updateValue();
    },

    /**
     * Select one option by assigning value
     * If multi, will select assign value without clearing existing values
     * */
    selectValue(value) {
      if (value === undefined) {
        return;
      }
      const that = this;
      if (!that.multi) {
        that.localOptions.forEach((option) => {
          option.checked = false;
        });
      }
      that.localOptions.forEach((opt) => {
        if (opt.value === value) {
          opt.checked = true;
        }
      });
      that.checkedValues = this.localOptions.filter(opt => opt.checked);
      that.updateValue();
    },
    toggleHover(option, bool) {
      option.hovered = bool;
    },
    toggleGroupHover(option, bool) {
      option.hovered = bool;
    },
    initOptions(options) {
      const that = this;
      that.localOptions = [];
      options.forEach((opt) => {
        let initCheck = false;
        if (that.value.length > 0) {
          initCheck = that.value.indexOf(opt.value) >= 0;
        }
        that.localOptions.push({
          ...opt,
          checked: initCheck,
          hovered: false,
        });
      });
      that.checkedValues = this.localOptions.filter(opt => opt.checked);
    },
  },
  mounted() {
    const that = this;
    that.initOptions(that.options);
    that.$on('select', that.selectValue);
    that.$on('reset', that.resetCheckedValue);
    that.$on('updateOptions', that.initOptions);
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';
.dropdown-container {
  display: flex;

  align-items: center;
  .dropdown-name {
    @include font-14px();
    margin-right: 10px;
  }
}
$border-color: $color-borderline;
.input-bar {
  display: flex;
  height: 28px;
  border: 1px solid $border-color;
  border-radius: 2px;
  background: $color-white;
  &.error {
    background: $color-input-error;
  }
  &.disabled {
    background: $color-disabled;
    border: 1px solid $color-borderline-disabled;
    cursor: default;
    &:hover {
      border-color: $color-borderline-disabled;
    }
    .input-block {
      .input-text{
        color: $color-font-disabled;
      }
    }
    .icon-block {
      border-left: 1px solid $color-borderline-disabled;
    }
  }
  @include click-button();

  .placeholder {
    @include font-14px();
    color: $color-font-disabled;
  }

  &:hover {
    border-color: $color-borderline-hover;
  }
  &.is-focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(75, 75, 100, 0.2);
    border-color: $color-borderline-hover;
  }

  .input-block {
    &.multi {
      @include customScrollbar();
      @include auto-overflow-X();
      overflow-y: hidden;
    }
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border: none;
    display: flex;
    align-items: center;
    padding: 5px 8px;

    .input-tag {
      margin-left: 5px;
      .close-icon {
        @include click-button();
      }
    }
    .input-text, .input-search {
      @include font-14px();
      color: $color-font-normal;
    }
    .input-search {
      width: 100%;
      border: none;
      &:focus {
        box-shadow: none;
      }
    }
  }
  .icon-block {
    flex: 0 0 28px;

    display: flex;
    align-items: center;
    justify-content: center;
    margin: 3px 0;
    border-left: 1px solid $border-color;
  }
}
.select-list {
  position: absolute;
  top: 35px; // input height + 5px padding
  left: 0;
  @include font-14px();
  z-index: 10;
  box-sizing: border-box;
  width: 150px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  border: 1px solid $color-borderline;
  color: $color-font-normal;
  background: $color-white;
  max-height: calc(4 * 32px);

  display: flex;
  flex-direction: column;

  .search-bar {
    flex: 0 0 36px;
    padding: 4px;
    border-bottom: 1px solid $color-borderline;
    background: #fafafa;
  }
  .select-item-block {
    display: flex;
    flex-direction: column;
    @include auto-overflow();
    @include customScrollbar();
    .select-item {
      flex: 0 0 32px;
      &.item {
        @include click-button();
        &.checked {
          background: $color-select;
        }
        &:hover {
          background: $color-select-hover;
          color: $color-white;
        }
        &.in-group {
          .select-text {
            padding-left: 24px;
          }
        }
        &.is-button {
          color: $color-primary;
          &:hover {
            color: $color-white;
          }
        }
        &.filterable {
          background: $color-select-hover;
        }
      }
      &.item-action {
        color: $color-primary;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover {
          text-decoration: underline;
          cursor: pointer;
        }
      }
      &.group {
        font-weight: bold;
        padding-right: 16px;
        &.group-selectable {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          .select-text {
            flex: 1;
          }
          .select-all {
            flex: 0 0 28px;
            @include font-12px();
            font-weight: normal;
          }
        }
      }
      display: flex;
      align-items: center;
      justify-content: space-between;
      .select-text {
        flex: 1;
        padding-left: 16px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .select-icon-container{
        .select-icon {
          margin-right:16px;
          flex: 0 0 16px;
          display: flex;
          align-items: center;
        }
      }
    }
  }
}
</style>
