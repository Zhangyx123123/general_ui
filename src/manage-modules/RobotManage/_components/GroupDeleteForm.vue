<template>
  <div class="form">
    <div class="row">
      <div class="row-title">{{ $t('management.input_personal_pass') }}</div>
      <input class="row-input" v-model="password" type="password" autocomplete="new-password"
        :placeholder="$t('management.manager_password')"
        :class="{'error': isPasswordTooltipShown}"
        v-tooltip="passwordTooltip"
        ref="password">
    </div>
    <div class="row">
      <div class="row-title">{{ $t('management.reason_description') }}</div>
      <input class="row-input" v-model="reason"
        :placeholder="$t('management.length_50_placeholder')"
        maxlength="50">
    </div>
  </div>  
</template>

<script>
import md5 from 'md5';
import event from '@/utils/js/event';

export default {
  name: 'group-delete-form',
  props: {
    extData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      password: '',
      reason: '',
      passwordTooltip: {
        msg: this.$t('management.err_password'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      isPasswordTooltipShown: false,
    };
  },
  watch: {
    password() {
      this.$refs.password.dispatchEvent(event.createEvent('tooltip-hide'));
      this.isPasswordTooltipShown = false;
    },
  },
  methods: {
    validate() {
      const that = this;
      if (that.$cookie.get('verify') === md5(that.password)) {
        that.$emit('validateSuccess', that.reason);
      } else {
        that.$refs.password.dispatchEvent(event.createEvent('tooltip-show'));
        this.isPasswordTooltipShown = true;
      }
    },
  },
  mounted() {
    const that = this;
    that.$on('validate', that.validate);
  },
};
</script>

<style lang="scss" scoped>
.form {
  width: 400px;
  padding: 0 30px;

  display: flex;
  flex-direction: column;
  .row {
    margin-bottom: 10px;

    display: flex;
    align-items: center;
    .row-title {
      flex: 0 0 100px;
      &:after {
        content: '：'
      }
    }
    .row-input {
      flex: 1;
      display: flex;
      padding: 5px 8px;
    }
  }
}
</style>
