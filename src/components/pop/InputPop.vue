<template>
  <div>
    <input :maxlength="value.maxlength" :placeholder="value.inputName" v-model="value.value">
    <div class="err-msg" v-if="showError">{{ errorMsg }}</div>
  </div>  
</template>

<script>
import strings from '@/utils/js/strings';

export default {
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      showError: false,
      errorMsg: '',
    };
  },
  mounted() {
    this.$on('validate', () => {
      this.value.value = this.value.value.trim();
      if (this.value.value.length <= 0) {
        this.showError = true;
        this.errorMsg = this.$t('error_msg.input_empty');
      } else if (!strings.isValidString(this.value.value)) {
        this.showError = true;
        this.errorMsg = this.$t('error_msg.invalid_string');
      } else {
        this.showError = false;
        this.$emit('validateSuccess');
      }
    });
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';
input {
  width: 100%;
  font-size: 1em;
}

.err-msg {
  color: $error-color;
  font-weight: bold;
}
div.err-msg {
  margin-top: 5px;
}
span.err-msg {
  margin-left: 5px;
}
</style>