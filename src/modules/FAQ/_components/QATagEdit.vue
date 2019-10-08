<template>
  <div class='qa-activity-edit'>
    <div class="row" v-if="!addMode">
      <span class='row-name'>{{ $t('qa_activity.activity_id') }}</span>
      <div>{{ id }}</div>
    </div>
    <div class="row">
      <span class='row-name'>{{ $t('qa_activity.activity_name') }}</span>
      <input v-model="name" :class="{error: isNameError}" @keyup="checkName">
    </div>
    <div class="err-msg" v-if="isNameError">
      <tempalte v-if="nameErrorType === 'empty'">{{ $t('error_msg.input_empty') }}</tempalte>
      <tempalte v-if="nameErrorType === 'existed'">{{ $t('qa_activity.err_existed_activity') }}</tempalte>
    </div>
  </div>
</template>

<script>
export default {
  name: 'qa-tag-edit',
  props: {
    origData: {
      type: Object,
      default: undefined,
    },
  },
  data() {
    return {
      name: '',
      id: '',
      addMode: true,
      existTags: [],
      nameErrorType: '',
    };
  },
  computed: {
    isNameError() {
      return this.nameErrorType !== '';
    },
  },
  methods: {
    validate() {
      if (this.checkName()) {
        this.$emit('validateSuccess', this.name);
      }
    },
    checkName() {
      const that = this;

      if (that.name === '') {
        that.nameErrorType = 'empty';
      } else if (that.existTags.indexOf(that.name) >= 0) {
        that.nameErrorType = 'existed';
      } else {
        that.nameErrorType = '';
      }

      that.$emit(that.isNameError ? 'disableOK' : 'enableOK');
      return !that.isNameError;
    },
  },
  mounted() {
    const that = this;
    that.$on('validate', that.validate);
    if (that.origData !== undefined) {
      that.addMode = that.origData.addMode || true;
      that.name = that.origData.name || '';
      that.id = that.origData.id || '';
      that.existTags = that.origData.existTags || [];
    }
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';

.qa-activity-edit {
  @include popForm(80px);
}
</style>
