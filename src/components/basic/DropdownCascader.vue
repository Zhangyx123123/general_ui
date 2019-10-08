<template>
  <div class="dropdown-cascader" :style="styleObj">
    <div class="input-bar" :class="{'is-focus': show}" ref="input" @click="showSelection">
      <div class="input-block">
        <template v-if="checkedValues.length > 0">
          <div v-for="(val, idx) in checkedValues" :key="idx" class="input-text">
            <icon v-if="idx !== 0" icon-type="month_right" :size="16"></icon>
            <span>{{ val.text }}</span>
          </div>
        </template>
        <template v-else>
          <span class="placeholder">{{ placeholder }}</span>
        </template>
      </div>
      <div class="icon-block">
        <icon icon-type="drop_down" :size=10></icon>
      </div>
    </div>
    
    <div ref="list" v-if="show" class="select-list" :style="listStyle">
      <template v-if="localOptions.length === 0">
      <div class="select-item item">
        <div class="select-text" :style="selectTextStyle">
          {{ $t('general.no_option') }}
        </div>
      </div>
      </template>
      <template v-else v-for="(option, idx) in localOptions">
      <div class="select-item item" :key="idx"
        @mouseover="toggleHover(option, true)" @mouseout="toggleHover(option, false)">
        <div class="select-text" :style="selectTextStyle"> {{ option.text }} </div>
        <div class=select-icon-container>
          <div class="select-icon">
            <icon v-if="option.hovered" icon-type="month_right_white" :size=16></icon>
            <icon v-else icon-type="month_right" :size=16></icon>
          </div>
        </div>
        
        <!-- second layer cascader -->
        <template v-if="option.hovered">
          <div class="select-list cascader-list" :style="cascaderLeft">
            <template v-for="(subOption, subIdx) in option.options">
              <div class="select-item item" :key="subIdx"
                @click="selectOption(idx, subIdx)"
              >
                <div class="select-text" :style="selectTextStyle"> {{ subOption.text }} </div>
              </div>
            </template>
          </div>
        </template>
      </div>
      </template>
    </div>
  </div>
</template>
<script>
export default {
  name: 'dropdown-cascader',
  props: {
    value: {
      type: Array,
      default() {
        return [];
      },
    },
    options: {
      type: Array,
      validator: input => input.reduce((ret, value) => ret &&
        (value.text !== undefined) &&
        (value.value !== undefined), true),
    },
    width: {
      type: String,
      default: 'auto',
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  computed: {
    styleObj() {
      return {
        width: this.width,
      };
    },
    cascaderLeft() {
      return {
        left: `calc(${this.width} - 2px)`,
      };
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
    };
  },
  watch: {
    options(val) {
      this.initOptions(val);
    },
  },
  methods: {
    removeOption(opt) {
      opt.checked = false;
      this.updateValue();
    },
    selectOption(idx, subIdx) {
      const that = this;
      that.localOptions.forEach((option) => {
        option.checked = false;
        option.options.forEach((opt) => {
          opt.checked = false;
        });
      });
      that.localOptions[idx].checked = true;
      that.localOptions[idx].options[subIdx].checked = true;
      that.show = false;
      that.localOptions[idx].hovered = false;
      window.removeEventListener('click', that.detectClickListener);
      that.updateValue();
    },
    updateValue() {
      this.checkedValues = [];
      const checkedOption = this.localOptions.filter(opt => opt.checked)[0];
      this.checkedValues.push(checkedOption);
      this.checkedValues.push(checkedOption.options.filter(opt => opt.checked)[0]);
      this.$emit('input', this.checkedValues.map(opt => opt.value));
    },
    showSelection() {
      const that = this;
      if (that.show) {
        that.show = false;
        return;
      }
      that.show = true;

      const inputBox = that.$refs.input.getBoundingClientRect();
      that.listStyle = {
        width: `${inputBox.width}px`,
      };

      that.detectClickListener = (e) => {
        const clickDom = e.target;
        const listDom = that.$refs.list;
        if (listDom && !listDom.contains(clickDom)) {
          that.show = false;
          if (that.detectClickListener) {
            window.removeEventListener('click', that.detectClickListener);
          }
        }
      };
      window.addEventListener('click', that.detectClickListener);
    },
    toggleHover(option, bool) {
      option.hovered = bool;
    },
    initOptions(options) {
      const that = this;
      that.localOptions = [];
      options.forEach((opt) => {
        if (opt.options && opt.options.length > 0) {
          const localOption = {
            ...opt,
            hovered: false,
            checked: false,
          };
          localOption.options.forEach((option) => {
            option.hovered = false;
            option.checked = false;
          });
          that.localOptions.push(localOption);
        }
      });
    },
    initCheckedValue() {
      const that = this;
      if (that.value) {
        const checkedOption = this.localOptions.filter(opt => opt.value === that.value[0])[0];
        if (checkedOption) {
          this.checkedValues.push(checkedOption);
          this.checkedValues.push(checkedOption.options
            .filter(opt => opt.value === that.value[1])[0]);
        }
      }
    },
  },
  mounted() {
    const that = this;
    that.initOptions(that.options);
    that.initCheckedValue();
    that.$on('updateOptions', that.initOptions);
  },
};
</script>
<style lang="scss" scoped>

$border-color: $color-borderline;
.dropdown-cascader {
  position: relative;
}
.input-bar {
  display: flex;
  height: 28px;
  border: 1px solid $border-color;
  border-radius: 2px;
  background: $color-white;
  @include click-button();

  &:hover {
    border-color: $color-borderline-hover;
  }
  &.is-focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(75, 75, 100, 0.2);
    border-color: $color-borderline-hover;
  }

  .input-block {
    flex: 1;
    overflow: hidden;
    border: none;
    display: flex;
    align-items: center;
    padding: 5px 8px;
    .input-text {
      max-width: 50%;
      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      @include font-14px();
      color: $color-font-normal;
      display: flex;
      align-items: center;
    }
    .placeholder {
      @include font-14px();
      color: $color-font-disabled;
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
  width: 180px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  border: 1px solid $color-borderline;
  color: $color-font-normal;
  background: $color-white;
  // max-height: calc(4 * 32px);
  // @include auto-overflow-Y();
  @include customScrollbar();

  display: flex;
  flex-direction: column;
  .select-item {
    position: relative;
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
      .select-text {
        padding-left: 16px;
      }
      &.is-button {
        color: $color-primary;
        &:hover {
          color: $color-white;
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
        margin-right: 12px;
        flex: 0 0 16px;
        display: flex;
        align-items: center;
      }
    }
  }

  &.cascader-list {
    top: 0px;
    max-height: calc(4 * 32px);
    @include auto-overflow-Y();
    @include customScrollbar();
  }
}
</style>
