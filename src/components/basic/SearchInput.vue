<template>
  <div class="input-container">
    <div class="input-name" v-if="name !== undefined">{{ name }}</div>
    <div class="search-input icon-input" :class="{'ie-focus-within': isFocus, fill: fill, flex: flex}">
      <input v-model="keyword"
        ref="input"
        :placeholder="$t('general.search_placeholder')"
        @keypress.enter="$emit('search', keyword)"
        @input="handleInput"
        @focus="toggleFocus(true)"
        @blur="toggleFocus(false)">
      <div class="input-icon"> 
        <icon icon-type="search" :size=16 />
      </div> 
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      required: true,
    },
    fill: {
      type: Boolean,
      required: false,
      default: false,
    },
    flex: {
      type: Boolean,
      required: false,
      default: false,
    },
    name: {
      type: String,
      required: false,
      default: undefined,
    },
  },
  data() {
    return {
      keyword: '',
      isFocus: false,
      inComposition: false,
    };
  },
  watch: {
    value() {
      this.keyword = this.value;
    },
  },
  methods: {
    handleInput() {
      this.$emit('input', this.keyword);
    },
    toggleFocus(bool) {
      this.isFocus = bool;
      this.$emit('focus', bool);
    },
  },
  mounted() {
    this.keyword = this.value;
  },
};
</script>

<style lang="scss" scoped>
$input-height: 28px;

.input-container {
  display: flex;

  align-items: center;
  .input-name {
    @include font-14px();
    margin-right: 10px;
  }
}
.search-input {
  display: inline-flex;
  height: $input-height;
  &.fill {
    width: 100%;
    display: flex;

    input {
      display: block;
      flex: 1;
      width: auto;
    }
    .input-icon {
      flex: 0 0 auto;
    }
  }
}
input {
  outline: none;
  background: transparent;
}

/* workaround of focus-within of IE*/
.ie-focus-within {
  outline: none;
  box-shadow: 0 0 0 2px rgba(75, 75, 100, 0.2);
  border-color: $color-borderline-hover;
}
</style>
