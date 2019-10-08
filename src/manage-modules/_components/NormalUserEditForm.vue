<template>
  <div class="user-edit-form">
    <div class="row">
      <div class="row-title">
        <div class="required">＊</div>
        {{ $t('management.user_display_name') }}
      </div>
      <div class="row-input">
        <input ref="name" v-tooltip="nameTooltip" v-model="name" :maxlength="displayNameMaxlength" :class="{'error': isNameTooltipShown}">
      </div>
    </div>
    <div class="row">
      <div class="row-title">
        <div class="required"></div>
        {{ $t('management.phone') }}
      </div>
      <div class="row-input">
        <input ref="phone" v-tooltip="phoneTooltip" v-model="phone" :maxlength="phoneMaxlength" :class="{'error': isPhoneTooltipShown}">
      </div>
    </div>
    <div class="row">
      <div class="row-title">
        <div class="required">＊</div>
        {{ $t('management.email') }}
      </div>
      <div class="row-input">
        <input ref="email" v-tooltip="emailTooltip" v-model="email" :class="{'error': isEmailTooltipShown}">
      </div>
    </div>
  </div>
</template>

<script>
import event from '@/utils/js/event';
import validate from '@/utils/js/validate';

export default {
  props: {
    extData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      nameTooltip: {
        msg: this.$t('management.err_display_name_length'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      emailTooltip: {
        msg: this.$t('management.err_empty_email'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      phoneTooltip: {
        msg: this.$t('management.err_invalid_phone'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      name: '',
      phone: '',
      email: '',
      isNameTooltipShown: false,
      isEmailTooltipShown: false,
      isPhoneTooltipShown: false,
      displayNameMaxlength: validate.displayNameMaxlength,
      phoneMaxlength: validate.phoneMaxlength,
    };
  },
  watch: {
    name() {
      if (this.name.trim() !== '') {
        this.isNameTooltipShown = false;
        this.$refs.name.dispatchEvent(event.createEvent('tooltip-hide'));
      }
    },
    email() {
      if (this.email.trim() !== '') {
        this.$refs.email.dispatchEvent(event.createEvent('tooltip-hide'));
        this.isEmailTooltipShown = false;
      }
    },
    phone() {
      this.isPhoneTooltipShown = false;
      this.$refs.phone.dispatchEvent(event.createEvent('tooltip-hide'));
    },
  },
  methods: {
    validate() {
      const that = this;
      let isValid = true;
      if (that.name.trim() === '') {
        isValid = false;
        that.$refs.name.dispatchEvent(event.createEvent('tooltip-show'));
        that.isNameTooltipShown = true;
      } else if (!validate.isValidDisplayName(that.name.trim())) {
        isValid = false;
        that.$refs.name.dispatchEvent(event.createEvent('tooltip-show'));
        that.isNameTooltipShown = true;
      }
      if (that.email.trim() === '') {
        isValid = false;
        that.emailTooltip.msg = that.$t('management.err_empty_email');
        that.$refs.email.dispatchEvent(event.createEvent('tooltip-reload'));
        that.$refs.email.dispatchEvent(event.createEvent('tooltip-show'));
        that.isEmailTooltipShown = true;
      } else if (!validate.isValidEmail(that.email)) {
        isValid = false;
        that.emailTooltip.msg = that.$t('management.err_invalid_email');
        that.$refs.email.dispatchEvent(event.createEvent('tooltip-reload'));
        that.$refs.email.dispatchEvent(event.createEvent('tooltip-show'));
        that.isEmailTooltipShown = true;
      }
      if (that.phone !== '' && !validate.isValidPhone(that.phone)) {
        isValid = false;
        that.$refs.phone.dispatchEvent(event.createEvent('tooltip-show'));
        that.isPhoneTooltipShown = true;
      }

      if (!isValid) {
        return;
      }

      that.$emit('validateSuccess', {
        name: that.name,
        email: that.email,
        phone: that.phone,
      });
    },
  },
  mounted() {
    this.name = this.extData.display_name || '';
    this.phone = this.extData.phone || '';
    this.email = this.extData.email || '';
    this.$on('validate', this.validate);
  },
};
</script>

<style lang="scss" scoped>
.user-edit-form {
  width: 465px;
  padding: 0 24px;
  @include font-14px();
  display: flex;
  flex-direction: column;

  .row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    .row-title {
      flex: 0 0 100px;
      overflow: hidden;
      .required {
        display: inline-block;
        width: 14px;
        color: $color-primary;
      }
    }
    .row-input {
      flex: 1;
      input {
        display: block;
        width: 100%;
      }
    }
  }
}
</style>
