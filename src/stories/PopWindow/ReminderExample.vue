<template>
<div id="reminder-ex">
  <p>Reminder</p>
</div>
</template>

<script>
export default {
  methods: {
    validate() {
      this.$emit('showReminder', {
        buttonRef: 'okBtn',
        content: 'contents ...',
        cancel: () => { },
        ok: () => { this.$emit('validateSuccess'); },
      });
    },
    cancelValidate() {
      this.$emit('showReminder', {
        buttonRef: 'cancelBtn',
        content: 'contents ...',
        cancel: () => { },
        ok: () => { this.$emit('cancelValidateSuccess'); },
      });
    },
  },
  mounted() {
    this.$on('validate', this.validate);
    this.$on('cancelValidate', this.cancelValidate);
  },
};
</script>

<style lang="scss" scoped>
#reminder-ex {
  padding: 20px;
  p {
    width: 500px;
    height: 200px;
  }
}
</style>

