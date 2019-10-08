<template>
  <div class="form">
    <div class="row">
      <div class="row-title">
        <div class="required">＊</div>
        {{ $t('management.enterprise_name') }}
      </div>
      <input class="row-input" v-model="name"
        :class="{'error': isNameTooltipShown}"
        :placeholder="$t('management.input_placeholder')"
        v-tooltip="nameTooltip"
        maxlength=50
        ref="name">
    </div>
    <div class="row">
      <div class="row-title">
        <div class="required"></div>
        {{ $t('management.enterprise_description') }}
      </div>
      <input class="row-input long" v-model="description" maxlength=50
        :placeholder="$t('management.length_50_placeholder')">
    </div>
    <div class="row module-title">
      <div class="row-title part" v-tooltip="moduleTooltip" ref="moduleTitle">{{ $t('management.module_list') }}</div>
    </div>
    <div class="row multi-line">
      <div v-for="(mod, idx) in modules" v-show="mod.code !== 'ssm' && mod.code !== 'qa_label'" :key="idx" class="module">
        <input :id="`module-${idx}`" type="checkbox" v-model="mod.checked" @change="closeModuleTooltip">
        <label :for="`module-${idx}`" class="module-name">{{ $t(`privileges.modules.${mod.code}`) }}</label>
        <icon icon-type="help" :size=15 v-if="mod.description && mod.description !== ''"
         v-tooltip="{msg: mod.description}" />
      </div>
    </div>
    <div class="row splitter"></div>
    <div class="row">
      <div class="row-title part">
        {{ $t('management.enterprise_admin') }}
        <icon icon-type="help" :size=15 v-tooltip="{msg: $t('management.system_admin_desc')}" />
      </div>
    </div>
    <div class="row">
      <div class="row-title">
        <div class="required">＊</div>
        {{ $t('management.user_name') }}
      </div>
      <info-input class="row-input"
        v-model="adminUserName"
        :placeholder="$t('management.input_placeholder')"
        :msg="$t('management.username_format')"
        :maxlength="userNameMaxlength"
        :error="isUserNameTooltipShown"
        :errorMsg="userNameErrorMsg"
      >
      </info-input>
    </div>
    <div class="row">
      <div class="row-title">
        <div class="required">＊</div>
        {{ $t('management.user_display_name') }}
      </div>
      <input class="row-input"
        :placeholder="$t('management.input_placeholder')"
        :class="{'error': isDisplayNameTooltipShown}"
        :maxlength="displayNameMaxlength"
        v-model="adminDisplayName"
        v-tooltip="displayNameTooltip"
        ref="displayName">
    </div>
    <div class="row">
      <div class="row-title">
        <div class="required">＊</div>
        {{ $t('management.password') }}
      </div>
      <info-input
        type="password" class="row-input"
        v-model="adminPassword"
        :placeholder="$t('management.set_passowrd_placeholder')"
        :msg="$t('management.password_format')"
        autocomplete="new-password"
        :maxlength="passwordMaxlength"
        :error="isPasswordTooltipShown"
        :errorMsg="passwordErrorMsg"
      >
      </info-input>
    </div>
    <div class="row">
      <div class="row-title">
        <div class="required">＊</div>
        {{ $t('management.check_password') }}
      </div>
      <input class="row-input"
        :class="{'error': isCheckPasswordTooltipShown}"
        :placeholder="$t('management.check_password_placeholder')"
        type="password" autocomplete="new-password"
        v-model="adminCheckPassword"
        v-tooltip="checkPasswordTooltip"
        ref="checkPassword">
    </div>
    <div class="row">
      <div class="row-title">
        <div class="required"></div>
        {{ $t('management.phone') }}
      </div>
      <input class="row-input" ref="phone"
        v-model="phone"
        :placeholder="$t('management.input_placeholder')" 
        v-tooltip="phoneTooltip"
        :maxlength="phoneMaxlength"
        :class="{'error': isPhoneTooltipShown}">
    </div>
    <div class="row">
      <div class="row-title">
        <div class="required">＊</div>
        {{ $t('management.email') }}
      </div>
      <input class="row-input"
        :class="{'error': isEmailTooltipShown}"
        :placeholder="$t('management.input_placeholder')"
        v-model="adminEmail"
        v-tooltip="emailTooltip"
        ref="email">
    </div>
  </div>  
</template>

<script>
import validate from '@/utils/js/validate';
import event from '@/utils/js/event';

export default {
  name: 'enterprise-add-form',
  props: {
    extData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      name: '',
      description: '',
      existedEnterprises: [],
      modules: [],

      nameTooltip: this.genErrTooltip(),
      displayNameTooltip: this.genErrTooltip(),
      checkPasswordTooltip: this.genErrTooltip(),
      emailTooltip: this.genErrTooltip(),
      moduleTooltip: this.genErrTooltip(),
      phoneTooltip: this.genErrTooltip(),

      adminUserName: '',
      adminDisplayName: '',
      adminEmail: '',
      adminPassword: '',
      adminCheckPassword: '',
      phone: '',

      isNameTooltipShown: false,
      isUserNameTooltipShown: false,
      isDisplayNameTooltipShown: false,
      isPasswordTooltipShown: false,
      isCheckPasswordTooltipShown: false,
      isEmailTooltipShown: false,
      isPhoneTooltipShown: false,

      userNameErrorMsg: '',
      passwordErrorMsg: '',

      userNameMaxlength: 64,
      passwordMinlength: 6,
      passwordMaxlength: 16,
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
    adminUserName() {
      if (this.adminUserName.trim() !== '') {
        this.isUserNameTooltipShown = false;
      }
    },
    adminDisplayName() {
      if (this.adminDisplayName.trim() !== '') {
        this.isDisplayNameTooltipShown = false;
        this.$refs.displayName.dispatchEvent(event.createEvent('tooltip-hide'));
      }
    },
    adminEmail() {
      if (this.adminEmail.trim() !== '') {
        this.isEmailTooltipShown = false;
        this.$refs.email.dispatchEvent(event.createEvent('tooltip-hide'));
      }
    },
    phone() {
      this.isPhoneTooltipShown = false;
      this.$refs.phone.dispatchEvent(event.createEvent('tooltip-hide'));
    },
    adminPassword() {
      if (this.adminPassword.trim() !== '') {
        this.isPasswordTooltipShown = false;
      }
    },
    adminCheckPassword() {
      this.isCheckPasswordTooltipShown = false;
      this.$refs.checkPassword.dispatchEvent(event.createEvent('tooltip-hide'));
    },
  },
  methods: {
    genErrTooltip() {
      return {
        msg: '',
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      };
    },
    showUpdatedTooltip(context, tooltip, msg) {
      tooltip.msg = msg;
      const triggerObj = context.$el ? context.$el : context;
      this.$nextTick(() => {
        triggerObj.dispatchEvent(event.createEvent('tooltip-reload'));
        triggerObj.dispatchEvent(event.createEvent('tooltip-show'));
      });
    },
    closeModuleTooltip() {
      this.$refs.moduleTitle.dispatchEvent(event.createEvent('tooltip-hide'));
    },
    validate() {
      const that = this;
      that.name = that.name.trim();
      let isValid = true;
      if (that.name === '') {
        isValid = false;
        that.isNameTooltipShown = true;
        that.showUpdatedTooltip(that.$refs.name, that.nameTooltip, that.$t('management.err_enterprise_name_empty'));
      } else if (that.name !== that.extData.name &&
        that.existedEnterprises.indexOf(that.name) >= 0) {
        isValid = false;
        that.isNameTooltipShown = true;
        that.showUpdatedTooltip(that.$refs.name, that.nameTooltip, that.$t('management.err_enterprise_duplicate'));
      }

      if (that.adminUserName === '') {
        isValid = false;
        that.isUserNameTooltipShown = true;
        that.userNameErrorMsg = that.$t('management.err_username_length');
      } else if (!validate.isValidUserName(that.adminUserName)) {
        isValid = false;
        that.isUserNameTooltipShown = true;
        that.userNameErrorMsg = that.$t('management.err_invalid_username');
      }
      if (that.adminDisplayName === '') {
        isValid = false;
        that.isDisplayNameTooltipShown = true;
        that.showUpdatedTooltip(that.$refs.displayName, that.displayNameTooltip, that.$t('management.err_display_name_length'));
      } else if (!validate.isValidDisplayName(that.adminDisplayName.trim())) {
        isValid = false;
        that.isDisplayNameTooltipShown = true;
        that.showUpdatedTooltip(that.$refs.displayName, that.displayNameTooltip, that.$t('management.err_display_name_length'));
      }
      if (that.phone !== '' && !validate.isValidPhone(that.phone)) {
        isValid = false;
        that.isPhoneTooltipShown = true;
        that.showUpdatedTooltip(that.$refs.phone, that.phoneTooltip, that.$t('management.err_invalid_phone'));
      }
      if (that.adminEmail === '') {
        isValid = false;
        that.isEmailTooltipShown = true;
        that.showUpdatedTooltip(that.$refs.email, that.emailTooltip,
          that.$t('management.err_empty_email'));
      } else if (!validate.isValidEmail(that.adminEmail)) {
        isValid = false;
        that.isEmailTooltipShown = true;
        that.showUpdatedTooltip(that.$refs.email, that.emailTooltip,
          that.$t('management.err_invalid_email'));
      }
      if (that.adminPassword.length < 6 || that.adminPassword.length > 16) {
        isValid = false;
        that.isPasswordTooltipShown = true;
        that.passwordErrorMsg = that.$t('management.err_password_length');
      } else if (!validate.isValidPassword(that.adminPassword)) {
        isValid = false;
        that.isPasswordTooltipShown = true;
        that.passwordErrorMsg = that.$t('management.err_password_invalid');
      } else if (that.adminPassword !== that.adminCheckPassword) {
        isValid = false;
        that.isCheckPasswordTooltipShown = true;
        that.showUpdatedTooltip(that.$refs.checkPassword, that.checkPasswordTooltip, that.$t('management.err_invalid_check_password'));
      }
      const pickAnyModule = that.modules.reduce((val, mod) => val || mod.checked, false);
      if (!pickAnyModule) {
        isValid = false;
        that.showUpdatedTooltip(that.$refs.moduleTitle, that.moduleTooltip, that.$t('management.err_pick_no_modules'));
      }
      if (isValid) {
        that.$emit('validateSuccess', {
          name: that.name,
          description: that.description,
          modules: that.modules.filter(mod => mod.checked).map(mod => mod.code),
          admin: {
            account: that.adminUserName,
            name: that.adminDisplayName,
            password: that.adminPassword,
            email: that.adminEmail,
            phone: that.phone,
          },
        });
      }
    },
  },
  mounted() {
    const that = this;

    that.modules = that.extData.modules || [];
    that.existedEnterprises = that.extData.existedEnterprises || [];
    that.$on('validate', that.validate);

    that.modules.forEach((mod) => {
      mod.checked = true;
    });

    if (that.extData.initData) {
      const initData = that.extData.initData;
      that.name = initData.name || '';
      that.description = initData.description || '';
      that.modules.forEach((mod) => {
        if (initData.modules.indexOf(mod.code) >= 0) {
          mod.checked = true;
        } else {
          mod.checked = false;
        }
      });
      that.adminUserName = initData.admin.account;
      that.adminDisplayName = initData.admin.name;
      that.adminPassword = initData.admin.password;
      that.adminEmail = initData.admin.email;
    }
  },
};
</script>

<style lang="scss" scoped>
@mixin module() {
  .module {
    flex: 0 0 140px;

    display: flex;
    align-items: center;
    margin-bottom: 20px;
    .module-name {
      margin-left: 5px;
      margin-right: 7px;
      cursor: pointer;
    }
    input[type=checkbox] {
      width: 14px;
      height: 14px;
      cursor: pointer;
    }
  }
}

.form {
  width: 700px;
  padding: 0 30px;
  color: #666666;
  @include font-14px();

  display: flex;
  flex-direction: column;
  .row {
    margin-bottom: 12px;

    display: flex;
    align-items: center;
    &.multi-line {
      flex-wrap: wrap;
      align-content: flex-start;

      @include module();
    }
    &.splitter {
      flex: 0 0 1px;
      box-shadow: inset 0 1px 0 0 $color-borderline;
    }
    &.module-title {
      margin-top: 8px;
      margin-bottom: 20px;
    }
    .row-title {
      flex: 0 0 100px;
      .required {
        display: inline-block;
        width: 14px;
        color: $color-primary;
      }
      &.part {
        flex: 0 0 150px;
        display: flex;
        align-items: center;
        .icon {
          margin-left: 5px;
        }
      }
    }
    .row-input {
      flex: 0 0 240px;
      display: flex;
      &.long {
        flex: 0 0 540px;
      }
    }
  }
}
</style>
