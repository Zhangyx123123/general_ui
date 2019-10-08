<template>
  <div class="dimension-selector">
    <div class="category-row" v-for="category in this.value" :key="category.type">
      <div class="category-title">{{ category.text }}：</div>
      <div class="category-all-check" v-if="showType==='check'">
        <input type="checkbox" v-on:change="setAllChecked(category)" v-model="category.allChecked" :id="`${category.type}_all`">
        <label :for="`${category.type}_all`">{{ $t('general.all') }}{{ category.text }}</label>
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
  methods: {
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
$row-height: 30px;
.dimension-selector {
  min-width: 500px;
  .category-row {
    display: flex;
    line-height: $row-height;
    .category-title {
      min-width: 80px;
    }
    .category-all-check {
      min-width: 120px;
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
        border-radius: 5px;
        background: white;
        color: #0099FF;
        border: 1px solid #0099FF;
      }

      & + label {
        padding: 2px 5px;
        cursor: pointer;
        user-select: none;
      }
    }
  }
}
</style>
