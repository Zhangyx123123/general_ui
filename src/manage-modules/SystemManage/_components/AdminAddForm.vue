<template>
  <div class="user-info-form" :class="[isAdmin ? 'admin' : 'normal']">
    <div class="row">
      <div class="row-title">
        <div class="required">＊ </div>
        {{ $t('management.user_name') }}
      </div>
      <div v-if="editMode">{{ userName }}</div>
      <info-input v-else
        v-model="userName"
        :placeholder="$t('management.input_placeholder')"
        :msg="$t('management.username_format')"
        fill
        :maxlength="userNameMaxlength"
        :error="isUserNameTooltipShown"
        :errorMsg="userNameErrorMsg"
      >
      </info-input>
    </div>

    <div class="row">
      <div class="row-title">
        <span class="required"></span>
      {{ $t('management.user_type') }}
      </div>
      <div>{{ isAdmin ? $t('management.enterprise_admin') : $t('management.system_admin')}}</div>
    </div>

    <div class="row">
      <div class="row-title">
        <span class="required">＊ </span>
        {{ $t('management.set_password') }}
      </div>
      <div class="row-input-col" v-if="editMode && !passwordEdit">
        <div>********</div>
        <text-button class="modify" @click="startEditPassword">{{ $t('management.modify_password') }}</text-button>
      </div>
      <info-input v-else
        type="password"
        v-model="password"
        :placeholder="$t('management.set_passowrd_placeholder')"
        :msg="$t('management.password_format')"
        fill
        ref="password"
        autocomplete="new-password"
        :maxlength="passwordMaxlength"
        :error="isPasswordTooltipShown"
        :errorMsg="passwordErrorMsg"
      >
      </info-input>
    </div>

    <div class="row" v-if="!editMode || passwordEdit">
      <div class="row-title">
        <span class="required">＊ </span>
        {{ $t('management.check_password') }}
      </div>
      <input class="row-input" ref="checkPassword" v-model="checkPassword" type="password" :placeholder="$t('management.check_password_placeholder')" v-tooltip="passwordCheckTooltip" :maxlength="passwordMaxlength"
      :class="{'error': isPasswordCheckTooltipShown}">
    </div>

    <div class="row">
      <div class="row-title">
        <span class="required">＊ </span>
        {{ $t('management.user_display_name') }}
      </div>
      <input class="row-input" ref="displayName" v-model="displayName" :placeholder="$t('management.input_placeholder')" :maxlength="displayNameMaxlength" v-tooltip="displayNameTooltip"
      :class="{'error': isDisplayNameTooltipShown}">
    </div>
    
    <div class="row">
      <div class="row-title">
        <span class="required"></span>
        {{ $t('management.phone') }}
      </div>
      <input class="row-input" ref="phone" v-model="phone" :placeholder="$t('management.input_placeholder')" v-tooltip="phoneTooltip"
      :maxlength="phoneMaxlength"
      :class="{'error': isPhoneTooltipShown}">
    </div>
    <div class="row">
      <div class="row-title">
        <span class="required">＊ </span>
        {{ $t('management.email') }}
      </div>
      <input class="row-input" ref="email" v-model="email" :placeholder="$t('management.input_placeholder')" v-tooltip="emailTooltip"
      :class="{'error': isEmailTooltipShown}">
    </div>
  </div>
</template>

<script>
import md5 from 'md5';
import DropdownSelector from '@/components/DropdownSelect';
import validate from '@/utils/js/validate';
import event from '@/utils/js/event';

export default {
  name: 'admin-add-form',
  props: {
    extData: {
      type: Object,
      default: () => ({
        type: 2,
      }),
    },
  },
  components: {
    DropdownSelector,
  },
  computed: {
    isAdmin() {
      return this.userType === 1;
    },
    editMode() {
      return this.extData.user !== undefined;
    },
  },
  watch: {
    displayName() {
      if (this.displayName.trim() !== '') {
        this.isDisplayNameTooltipShown = false;
        this.$refs.displayName.dispatchEvent(event.createEvent('tooltip-hide'));
      }
    },
    userName() {
      if (!this.editMode && this.userName.trim() !== '') {
        this.isUserNameTooltipShown = false;
      }
    },
    email() {
      if (this.email.trim() !== '') {
        this.isEmailTooltipShown = false;
        this.$refs.email.dispatchEvent(event.createEvent('tooltip-hide'));
      }
    },
    password() {
      if (this.password.trim() !== '') {
        this.isPasswordTooltipShown = false;
      }
    },
    checkPassword() {
      this.isPasswordCheckTooltipShown = false;
      this.$refs.checkPassword.dispatchEvent(event.createEvent('tooltip-hide'));
    },
    phone() {
      this.isPhoneTooltipShown = false;
      this.$refs.phone.dispatchEvent(event.createEvent('tooltip-hide'));
    },
  },
  data() {
    return {
      userType: 2,
      userName: '',
      password: '',
      checkPassword: '',
      displayName: '',
      phone: '',
      email: '',
      passwordEdit: false,
      passwordMaxlength: 16,
      passwordMinlength: 6,
      userNameMaxlength: 64,
      displayNameMaxlength: validate.displayNameMaxlength,
      phoneMaxlength: validate.phoneMaxlength,

      editPasswordCallback: undefined,
      existedUsers: [],

      emailTooltip: {
        msg: this.$t('management.err_empty_email'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      displayNameTooltip: {
        msg: this.$t('management.err_display_name_length'),
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
      passwordCheckTooltip: {
        msg: this.$t('management.err_invalid_check_password'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      isUserNameTooltipShown: false,
      isEmailTooltipShown: false,
      isDisplayNameTooltipShown: false,
      isPasswordTooltipShown: false,
      isPasswordCheckTooltipShown: false,
      isPhoneTooltipShown: false,

      passwordErrorMsg: '',
      userNameErrorMsg: '',
    };
  },
  methods: {
    startEditPassword() {
      const that = this;
      that.$emit('cancel');
      that.$nextTick(() => {
        const copyUser = Object.assign({}, that.extData.user);
        copyUser.display_name = that.displayName.trim();
        copyUser.email = that.email.trim();
        copyUser.phone = that.phone.trim();

        that.editPasswordCallback(that.extData.user, copyUser);
      });
    },
    validate() {
      const that = this;
      const isValid = this.checkInputValidation();
      if (!isValid) {
        return;
      }

      const ret = {
        username: that.userName.trim(),
        name: that.displayName.trim(),
        email: that.email.trim(),
        phone: that.phone,
      };

      if (that.password !== '') {
        ret.password = md5(that.password);
      }
      that.$emit('validateSuccess', ret);
    },
    checkInputValidation() {
      const that = this;

      let isValid = true;
      if (that.userName.trim() === '') {
        isValid = false;
        that.userNameErrorMsg = that.$t('management.err_username_length');
        that.isUserNameTooltipShown = true;
      } else if (!validate.isValidUserName(that.userName)) {
        isValid = false;
        that.userNameErrorMsg = that.$t('management.err_invalid_username');
        that.isUserNameTooltipShown = true;
      } else if (!that.editMode) {
        if (that.existedUsers.indexOf(that.userName) >= 0) {
          isValid = false;
          that.userNameErrorMsg = that.$t('management.err_existed_username');
          that.isUserNameTooltipShown = true;
        }
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

      if (that.displayName.trim() === '') {
        isValid = false;
        that.$refs.displayName.dispatchEvent(event.createEvent('tooltip-show'));
        that.isDisplayNameTooltipShown = true;
      } else if (!validate.isValidDisplayName(that.displayName.trim())) {
        isValid = false;
        that.$refs.displayName.dispatchEvent(event.createEvent('tooltip-show'));
        that.isDisplayNameTooltipShown = true;
      }
      if (!that.editMode) {
        if (that.password.length < that.passwordMinlength ||
           that.password.length > that.passwordMaxlength) {
          isValid = false;
          that.passwordErrorMsg = that.$t('management.err_password_length');
          that.isPasswordTooltipShown = true;
        } else if (validate.isValidPassword(that.password) === false) {
          isValid = false;
          that.passwordErrorMsg = that.$t('management.err_password_invalid');
          that.isPasswordTooltipShown = true;
        } else if (that.checkPassword !== that.password) {
          isValid = false;
          that.$refs.checkPassword.dispatchEvent(event.createEvent('tooltip-show'));
          that.isPasswordCheckTooltipShown = true;
        }
      }
      return isValid;
    },
  },
  beforeMount() {
    const that = this;
    if (that.extData.user !== undefined) {
      const user = that.extData.user;
      that.userName = user.user_name;
      that.email = user.email;
      that.displayName = user.display_name;
      that.phone = user.phone || '';
      that.editPasswordCallback = that.extData.editPasswordCallback;
    }
    if (that.extData.users) {
      that.extData.users.forEach((user) => {
        that.existedUsers.push(user.user_name);
      });
    }

    that.$on('validate', that.validate);
  },
};
</script>

<style lang="scss" scoped>
.user-info-form {
  color: #666666;
  padding: 0 25px;
  @include font-14px();
  &.admin {
    width: 510px;
  }
  &.normal {
    width: 560px;
  }
  display: flex;
  flex-direction: column;
  .row {
    flex: 0 0 40px;
    max-height: 40px;

    display: flex;
    align-items: center;
    .row-title {
      flex: 0 0 100px;
      max-width: 100px;
      .required {
        display: inline-block;
        width: 14px;
        color: $color-primary;
      }
    }
    .row-input {
      flex: 0 1 100%;
      padding: 3px 8px;
      @include font-14px();
    }
    .row-input-col {
      flex: 0 1 340px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .row-text {
      margin: 0 9px 0 10px;
    }
    .row-button {
      margin-left: 10px;
    }
    .selector {
      flex: 1;
    }
  }
}
</style>
