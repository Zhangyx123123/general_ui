<template>
  <div class="normal-password-form">
    <div class="row">
      <div class="row-title">
        <span class="required">＊</span>
        {{ $t('management.orig_password') }}
      </div>
      <input type="password" class="row-input" ref="origPassword" v-model="origPassword"
      :placeholder="$t('management.input_placeholder')" autocomplete="new-password"
      v-tooltip="origPasswordTooltip"
      :maxlength="passwordMaxlength"
      :class="{'error': isOrigPasswordTooltipShown}">
    </div>
    <div class="row">
      <div class="row-title">
        <span class="required">＊</span>
        {{ $t('management.new_password') }}
      </div>
      <info-input
        ref="password"
        type="password"
        v-model="password"
        :placeholder="$t('management.input_placeholder')"
        :msg="$t('management.password_format')"
        fill
        :maxlength="passwordMaxlength"
        :error="isPasswordTooltipShown"
        :errorMsg="passwordErrorMsg"
        autocomplete='new-password'
      >
      </info-input>
    </div>
    <div class="row">
      <div class="row-title">
        <span class="required">＊</span>
        {{ $t('management.check_new_password') }}
      </div>
      <input type="password" class="row-input" ref="newPassword" v-model="newPassword"
      :placeholder="$t('management.input_placeholder')" autocomplete="new-password"
      v-tooltip="newPasswordTooltip"
      :maxlength="passwordMaxlength"
      :class="{'error': isNewPasswordTooltipShown}">
    </div>
  </div>
</template>

<script>
import md5 from 'md5';
import event from '@/utils/js/event';
import validate from '@/utils/js/validate';

export default {
  name: 'user-password-form',
  props: {
    extData: {
      type: Object,
      default: {},
    },
  },
  computed: {
    isAdmin() {
      return this.userType <= 1;
    },
  },
  data() {
    return {
      origPassword: '',
      password: '',
      newPassword: '',
      userType: 2,
      passwordMaxlength: 16,
      passwordMinlength: 6,
      origPasswordTooltip: {
        msg: this.$t('management.err_password_length'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      passwordTooltip: {
        msg: this.$t('management.err_password_length'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      newPasswordTooltip: {
        msg: this.$t('management.err_invalid_check_password'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      isOrigPasswordTooltipShown: false,
      isPasswordTooltipShown: false,
      isNewPasswordTooltipShown: false,

      passwordErrorMsg: '',
    };
  },
  watch: {
    origPassword() {
      if (this.origPassword !== '') {
        this.isOrigPasswordTooltipShown = false;
        this.$refs.origPassword.dispatchEvent(event.createEvent('tooltip-hide'));
      }
    },
    password() {
      if (this.password !== '') {
        this.isPasswordTooltipShown = false;
      }
    },
    newPassword() {
      if (this.newPassword !== '') {
        this.isNewPasswordTooltipShown = false;
        this.$refs.newPassword.dispatchEvent(event.createEvent('tooltip-hide'));
      }
    },
  },
  methods: {
    validate() {
      const that = this;

      if ((that.origPassword.length < that.passwordMinlength ||
                  that.origPassword.length > that.passwordMaxlength)) {
        that.origPasswordTooltip.msg = that.$t('management.err_password_length');
        that.$refs.origPassword.dispatchEvent(event.createEvent('tooltip-reload'));
        that.$refs.origPassword.dispatchEvent(event.createEvent('tooltip-show'));
        that.$refs.origPassword.focus();
        that.isOrigPasswordTooltipShown = true;
      } else if ((that.password.length < that.passwordMinlength ||
                  that.password.length > that.passwordMaxlength)) {
        that.passwordErrorMsg = that.$t('management.err_password_length');
        that.$refs.password.focus();
        that.isPasswordTooltipShown = true;
      } else if (!validate.isValidPassword(that.password)) {
        that.passwordErrorMsg = that.$t('management.err_password_invalid');
        that.$refs.password.focus();
        that.isPasswordTooltipShown = true;
      } else if (that.newPassword !== that.password) {
        that.$refs.newPassword.dispatchEvent(event.createEvent('tooltip-show'));
        that.$refs.newPassword.focus();
        that.isNewPasswordTooltipShown = true;
      } else {
        that.$emit('validateSuccess', {
          password: md5(that.password),
          verify: md5(that.origPassword),
        });
      }
    },
  },
  mounted() {
    if (this.extData.user) {
      this.userType = this.extData.user.type || 2;
    }
    this.$on('validate', this.validate);
  },
};
</script>

<style lang="scss" scoped>
.normal-password-form {
  color: #666666;
  padding: 0 25px;
  @include font-14px();
  width: 465px;
  display: flex;
  flex-direction: column;
  .row {
    flex: 0 0 40px;

    display: flex;
    align-items: center;
    .row-title {
      flex: 0 0 100px;
      .required {
        display: inline-block;
        width: 14px;
        color: $color-primary;
      }
    }
    .row-input {
      flex: 0 1 340px;
      padding: 3px 8px;
      @include font-14px();
    }
  }
}
</style>
