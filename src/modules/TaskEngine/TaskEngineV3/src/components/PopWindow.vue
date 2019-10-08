<template>
  <div id="pop-window" :class="{hidden: !show}">
    <div id="pop-content" v-bind:style="[customPopContentStyle]">
      <div class="title" v-if="title">
        <label>{{ title }}</label>
      </div>
      <div v-bind:class="[customContentClasses]" class="content">
        <component :is="currentView" v-model="data" ref="content"
          v-on:validateSuccess="validatePass"
        ></component>
      </div>
      <div class="pop-button">
        <button v-on:click.stop="click(true)" v-if="buttons.indexOf('ok') != -1" class="btn-basic btn-border primary" v-bind:class="{disabled: disable_ok}">{{ ok_msg }}</button>
        <button v-on:click.stop="click(false)" v-if="buttons.indexOf('cancel') != -1" class="btn-basic btn-border">{{ cancel_msg}}</button>
      </div>
    </div>
  </div>
</template>

<script>
import i18nUtils from '../utils/i18nUtil';

export default {
  name: 'pop-window',
  components: {
  },
  data() {
    return {
      i18n: {},
      show: false,
      dft_ok_msg: i18nUtils.getLocaleMsgs(this.$i18n).general.ok,
      dft_cancel_msg: i18nUtils.getLocaleMsgs(this.$i18n).general.cancel,
      buttons: ['ok', 'cancel'],
      title: '',
      currentView: undefined,
      data: {},
      callOk: undefined,
      callCancel: undefined,
      extData: {},
      disable_ok: false,
      disable_custom: false,
      ok_msg: i18nUtils.getLocaleMsgs(this.$i18n).general.ok,
      cancel_msg: i18nUtils.getLocaleMsgs(this.$i18n).general.cancel,
      custom_button: [],
      // countDown: undefined,
      customContentClasses: [],
      customPopContentStyle: {},
      clickOutsideClose: true,
    };
  },
  methods: {
    showWindow(option) {
      this.show = true;
      // if (this.countDown && clearTimeout) {
      //   clearTimeout(this.countDown);
      // }
      this.title = option.title;
      this.buttons = option.buttons || ['ok', 'cancel'];
      this.ok_msg = option.ok_msg || this.dft_ok_msg;
      this.cancel_msg = option.cancel_msg || this.dft_cancel_msg;
      this.data = option.data;
      // this.extData = option.extData || {};
      this.currentView = option.component;
      this.validate = option.validate || false;
      this.validate_custom = option.validate_custom;
      this.disable_ok = option.disable_ok || false;
      this.disable_custom = option.disable_custom || false;
      this.custom_button = option.custom_button || [];
      this.customContentClasses = option.customContentClasses || [];
      this.customPopContentStyle = option.customPopContentStyle || {};
      this.clickOutsideClose = option.clickOutsideClose !== false;
      // this.countDown = setTimeout(this.checkCustomButton, 1000);
      if (option.callback) {
        this.callOk = option.callback.ok;
        this.callCancel = option.callback.cancel;
      } else {
        this.callOk = undefined;
        this.callCancel = undefined;
      }
    },
    hideWindow() {
      this.click(false);
    },
    click(ok = true) {
      if (!ok) {
        this.show = false;
        this.currentView = undefined;
        this.$root.$emit('closeWindow', this);
        if (this.callCancel && typeof this.callCancel === 'function') {
          this.callCancel.call(this, this.data);
        }
      }

      if (ok && !this.disable_ok) {
        if (this.validate) {
          this.$refs.content.$emit('validate');
        } else {
          this.validatePass();
        }
      }
    },
    validatePass(customData) {
      this.show = false;
      this.currentView = undefined;
      this.$root.$emit('closeWindow', this);
      if (this.callOk && typeof this.callOk === 'function') {
        if (customData) {
          this.callOk.call(this, customData);
        } else {
          this.callOk.call(this, this.data);
        }
      }
    },
  },
  mounted() {
    this.i18n = i18nUtils.getLocaleMsgs(this.$i18n);
  },
};

</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
@import "../scss/popWindow.scss";
</style>
