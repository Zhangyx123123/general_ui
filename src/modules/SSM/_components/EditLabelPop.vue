<template>
  <div id="label-edit-pop">
    <info-input
      ref="input"
      v-model="editLabel"
      :placeholder="$t('qa_label.label_placeholder')"
      :msg="$t('qa_label.label_format')"
      fill
      :maxlength="maxlength"
      :error="isErrorTooltipShown"
      :errorMsg="errorMsg"
    >
    </info-input>
  </div>
</template>
<script>
import validate from '@/utils/js/validate';

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
      editLabel: '',
      maxlength: 10,
      isErrorTooltipShown: false,
      errorMsg: '',
    };
  },
  watch: {
    editLabel() {
      const that = this;
      if (that.isErrorTooltipShown) {
        that.isErrorTooltipShown = false;
      }
    },
  },
  methods: {
    validate() {
      const that = this;
      if (!validate.isValidLabel(that.editLabel)) {
        that.errorMsg = that.$t('qa_label.err_label_format');
        that.isErrorTooltipShown = true;
        return;
      }
      const existedIdx = that.value.labelList
        .findIndex(label => (label.name !== that.value.label) && (label.name === that.editLabel));
      if (existedIdx >= 0) {
        that.errorMsg = that.$t('qa_label.err_existed_label');
        that.isErrorTooltipShown = true;
        return;
      }
      this.$emit('validateSuccess', this.editLabel);
    },
  },
  mounted() {
    if (this.value.label) {
      this.editLabel = this.value.label;
    }
    this.$on('validate', this.validate);
  },
};
</script>
<style lang="scss" scoped>
#label-edit-pop {
  width: 520px;
  padding: 0 20px;
}
</style>
