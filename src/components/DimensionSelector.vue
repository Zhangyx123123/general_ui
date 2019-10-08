<template>
  <div class="dimension-selector">
    <div class="category-row"
      v-for="category in this.value" :key="category.type"
      v-if="category.values.length > 0">
      <div class="category-title">{{ category.text }}：</div>
      <div class="category-all-check" v-if="showType==='check'">
        <input type="checkbox" v-on:change="setAllChecked(category)" v-model="category.allChecked" :id="`${category.type}_all`">
        <label :for="`${category.type}_all`">{{ $t('general.all') }}</label>
      </div>
      <div class="category-value-container">
        <div class="category-value" v-for="value in category.values" :key="value.id">
          <input v-if="showType === 'check'" v-on:change="checkAll(category)" v-model="value.checked" type="checkbox" :name="category.type" :id="`${category.type}_${value.id}`">
          <input v-if="showType !== 'check'" v-on:change="setOneCheck(category, value)" :checked="value.checked" type="radio" :name="category.type" :id="`${category.type}_${value.id}`">
          <label :for="`${category.type}_${value.id}`">{{ value.text }}</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Array,
      required: true,
    },
    extData: {
      type: Object,
    },
  },
  data() {
    return {
      allCheck: [],
    };
  },
  mounted() {
    const that = this;
    this.$on('reset', that.reset);
  },
  methods: {
    reset() {
      const that = this;
      that.value.forEach((category) => {
        category.allChecked = true;
        category.values.forEach((value) => {
          value.checked = false;
        });
      });
    },
    setAllChecked(category) {
      category.values.forEach((value) => {
        value.checked = false;
      });
      category.allChecked = true;
    },
    checkAll(category) {
      const allChecked = category.values.reduce((ret, value) => ret && value.checked, true);
      const allNotChecked = category.values.reduce((ret, value) => ret && !value.checked, true);
      category.allChecked = allChecked || allNotChecked;

      // if all checked, unselect all value
      if (category.allChecked) {
        category.values.forEach((value) => {
          value.checked = false;
        });
      }

      return allChecked || allNotChecked;
    },
    setOneCheck(category, selectedValue) {
      category.values.forEach((value) => {
        value.checked = false;
      });
      selectedValue.checked = true;
      category.allChecked = false;
    },
  },
  computed: {
    showType() {
      if (!this.extData.type) {
        return 'check';
      }
      return this.extData.type;
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';

$selected-color: #1875F0;
$row-height: 50px;

.dimension-selector {
  @include font-14px();
  min-width: 510px;
  padding: 0 24px;
  .category-row {
    display: flex;
    line-height: $row-height;
    .category-title {
      min-width: 80px;
      color: $color-font-active;
      font-weight: 500;
    }
    .category-all-check {
      margin-right: 10px;
    }
    .category-value-container {
      display: inline-block;
      .category-value {
        display: inline-block;
        margin: 0 10px;
      }
    }
    
    input {
      display: none;

      &:checked + label {
        border-radius: 2px;
        background: white;
        color: $selected-color;
        border: 1px solid $selected-color;
      }

      & + label {
        padding: 5px 13px;
        cursor: pointer;
        user-select: none;
      }
    }
  }
}
</style>
