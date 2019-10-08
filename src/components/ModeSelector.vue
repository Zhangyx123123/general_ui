<template>
  <div class="mode-selector">
    <div class="category-row">
      <div class="category-value-container">
        <div class="category-value" v-for="(val, index) in value" :key="index">
          <input v-if="showType !== 'check'" v-on:change="setOneCheck(val)" type="radio" name="mode" :checked="val.checked" :id="`mode${index}`">
          <label :for="`mode${index}`" v-tooltip="val.desc">{{ val.name }}</label>
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
    this.$on('reset', this.reset);
  },
  methods: {
    reset() {
      const that = this;
      that.value.forEach((val) => {
        val.checked = false;
      });
    },
    setOneCheck(selectedValue) {
      this.reset();
      selectedValue.checked = true;
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

.mode-selector {
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
        margin-right: 10px;
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
