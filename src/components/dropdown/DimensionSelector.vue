<template>
  <div class="dropdown-container">
  <div class="dropdown-name" v-if="name !== undefined">{{ name }}</div>
  <div class="dropdown-select" :style="styleObj">
    <div class="input-bar" :class="{'is-focus': show, disabled}" :style="inputBarStyle" ref="input" @click="showSelection">
      <div class="input-block multi">
        <span v-if="!checkedValues.length" class="placeholder">{{ placeholder }}</span>
        <template v-else>
          <template v-for="category in checkedValues">
          <div class="input-tag" :key="category.key" v-if="category.value !== undefined">
            <div>{{ category.text }}:</div>
            <div class="tag-value" v-if="category.value === ''"> {{ $t('general.all') }} </div>
            <div class="tag-value" v-else>{{ category.value }}</div>
          </div>
          </template>
        </template>
      </div>
      <div class="icon-block">
        <icon icon-type="drop_down" :size=10></icon>
      </div>
    </div>
    <div ref="list" v-if="show" class="select-list" :style="listStyle">
      <div class="button-list">
        <text-button class="select-button" @click="setAll(false)">{{ $t('general.clear_all') }}</text-button>
        <text-button class="select-button" @click="setAll(true)">{{ $t('general.reset_to_default') }}</text-button>
      </div>
      <div v-for="category in selfOptions" :key="category.key" class="category-row">
        <div class="category-name">
          <input type="checkbox" :id="'category-check-' + category.key"
            v-indeterminate="category.indeterminate"
            v-model="category.checked"
            @change="handleCategoryValChange($event, category)">
          <label :for="'category-check-' + category.key">{{ category.text }}</label>
        </div>
        <div v-for="value in category.values" :key="value.key" class="category-opt">
          <input type="checkbox" :id="'category-opt-' + value.key"
            v-model="value.checked"
            @change="handleOptValChange($event, category, value)">
          <div>
            <label :for="'category-opt-' + value.key">{{ value.text }}</label>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  name: 'dimension-select',
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
    name: {
      type: String,
      required: false,
      default: undefined,
    },
    options: {
      type: Array,
      default: () => [],
      required: true,
    },
    inputBarStyle: {
      type: Object,
      default() {
        return {};
      },
    },
    width: {
      type: String,
      default: '420px',
      required: false,
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      disabled: false,
      show: false,
      listStyle: {},

      selfOptions: [],

      test: true,
    };
  },
  computed: {
    styleObj() {
      return {
        width: this.width,
        flex: `0 0 ${this.width}`,
      };
    },
    checkedValues() {
      return this.selfOptions.map((category) => {
        const ret = {
          text: category.text,
          value: category.values.filter(x => x.checked).map(x => x.text),
        };
        if (ret.value.length === category.values.length) {
          ret.value = '';
        } else if (ret.value.length === 0) {
          ret.value = undefined;
        } else {
          ret.value = ret.value.join('/');
        }
        return ret;
      });
    },
  },
  directives: {
    indeterminate(el, binding) {
      el.indeterminate = Boolean(binding.value);
    },
  },
  watch: {
  },
  methods: {
    addEventListeners() {
      window.addEventListener('click', this.hideListWhenEventTriggeredOutside, true);
      window.addEventListener('scroll', this.hideListWhenEventTriggeredOutside, true);
      window.addEventListener('resize', this.reposition);
    },
    removEventListeners() {
      window.removeEventListener('click', this.hideListWhenEventTriggeredOutside, true);
      window.removeEventListener('scroll', this.hideListWhenEventTriggeredOutside, true);
      window.removeEventListener('resize', this.reposition);
    },
    hideListWhenEventTriggeredOutside(e) {
      if (this.$refs.list && !this.$refs.list.contains(e.target)) {
        this.show = false;
        this.filtering = false;
        this.removEventListeners();
      }
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
      that.show = true;
      that.reposition();
      that.addEventListeners();
    },
    reposition() {
      const inputBox = this.$refs.input.getBoundingClientRect();
      this.listStyle = {
        position: 'fixed',
        top: `${inputBox.top + inputBox.height + 3}px`,
        left: `${inputBox.left}px`,
        // width: `${inputBox.width}px`,
      };
    },
    setAll(val) {
      const setValue = !!val;

      this.selfOptions.forEach((category) => {
        category.checked = setValue;
        category.indeterminate = false;
        category.values.forEach((value) => {
          value.checked = setValue;
        });
      });
      this.emitUpdate();
    },
    handleCategoryValChange(e, category) {
      category.indeterminate = false;
      category.values.forEach((value) => {
        value.checked = category.checked;
      });
      this.emitUpdate();
    },
    handleOptValChange(e, category) {
      const allChecked = category.values.reduce((ret, v) => v.checked && ret, true);
      const allNotChecked = category.values.reduce((ret, v) => !v.checked && ret, true);
      category.indeterminate = !allChecked && !allNotChecked;
      category.checked = allChecked;
      this.emitUpdate();
    },
    emitUpdate() {
      const ret = {};
      this.selfOptions.forEach((category) => {
        ret[category.key] = [];
        if (!category.indeterminate) {
          return;
        }
        ret[category.key] = category.values.filter(x => x.checked).map(x => x.key);
      });
      this.$emit('input', ret);
    },
    setOption(options) {
      const that = this;
      that.selfOptions = [];
      that.selfOptions = options.map(category => ({
        key: category.key,
        text: category.text,
        checked: true,
        indeterminate: false,
        values: category.values.map(value => ({
          key: value.key,
          text: value.text,
          checked: true,
        })),
      }));
    },
  },
  mounted() {
    const that = this;
    that.setOption(that.options);
    that.$on('set-option', that.setOption);
  },
};
</script>

<style lang="scss" scoped>
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
    padding: 3px 5px;

    display: flex;
    align-items: stretch;
    .input-tag {
      margin-left: 5px;
      background: #eeeeee;

      display: flex;
      align-items: center;
      padding: 0 8px;
      color: #666666;
      opacity: 0.9;

      .tag-value {
        margin-left: 5px;
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
  @include font-14px();
  box-sizing: border-box;
  max-height: 200px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
  padding: 10px;

  border-radius: 2px;
  border: 1px solid $color-borderline;

  background: $color-white;
  color: $color-font-normal;

  z-index: 100;

  display: flex;
  flex-direction: column;

  .button-list {
    display: flex;
    .select-button:not(:last-child) {
      margin-right: 10px;
    }
  }

  .category-row {
    flex: 0 0 36px;

    padding: 0 10px; 
    margin-top: 10px;
    background-color: #f7f7f7;

    display: flex;
    align-items: center;

    .category-name {
      flex: 0 0 105px;
      width: 105px;
      border-right: 1px solid $color-borderline;
      margin-right: 10px;
    }

    .category-opt {
      flex: 0 0 auto;

      &:not(:last-child) {
        margin-right: 30px;
      }

      display: flex;
      align-items: center;
      input {
        margin-right: 10px;
      }
    }
  }
}
</style>
