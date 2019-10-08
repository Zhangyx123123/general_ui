<template>
  <div class="command-selector">
    <div class="category-row" v-for="category in this.value" :key="category.type">
      <div class="category-title">{{ category.text }}：</div>
      <div class="category-all-check">
        <input type="checkbox" v-on:change="setAllNotChecked(category)" v-model="category.allNotChecked" :id="`${category.type}_all`">
        <label :for="`${category.type}_all`">{{ category.noCommandText }}</label>
      </div>
      <div class="category-value-container">
        <div class="category-value" v-for="value in category.values" :key="value.id">
          <input v-on:change="checkAll(category)" v-model="value.checked" type="checkbox" :name="category.type" :id="`${category.type}_${value.id}`">
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
    setAllNotChecked(category) {
      category.values.forEach((value) => {
        value.checked = false;
      });
      category.allNotChecked = true;
    },
    checkAll(category) {
      const allNotChecked = category.values.reduce((ret, value) => ret && !value.checked, true);
      category.allNotChecked = allNotChecked;

      return allNotChecked;
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