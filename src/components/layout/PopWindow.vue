<template>
<transition name="slide-in">
  <div class="pop-window" :class="{hidden: !show, 'background-dark': isBackgroundDark}" v-on:mousedown="exitPop">
    <div class="pop-content">
      <div class="title" v-if="title">
        <label>{{ title }}</label>
        <div v-if="popDescription" class="close-button" @click="close">
          <icon icon-type="info_close" :size="16"></icon>
        </div>
      </div>
      <div v-bind:class="[customContentClasses]" class="content">
        <component v-if="bindValue === true"
          @validateSuccess="validatePass"
          @cancelValidateSuccess="cancelValidatePass"
          @disableOK="disableOK"
          @enableOK="enableOK"
          @changeOKMsg="changeOKMsg"
          @cancel="close"
          @showReminder="showReminder"
          :is="currentView" v-model="data" :extData="extData" ref="content"></component>
        <component v-else
          @validateSuccess="validatePass"
          @cancelValidateSuccess="cancelValidatePass"
          @disableOK="disableOK"
          @enableOK="enableOK"
          @changeOKMsg="changeOKMsg"
          @cancel="close"
          @showReminder="showReminder"
          :is="currentView" :origData="data" :extData="extData" ref="content"></component>
      </div>
      <div v-if="!popDescription" class="pop-button" :class="{'center-align': popWarn}">
        <div class="left-part">
          <text-button v-if="left_button !== undefined"
            :button-type="left_button.type ? left_button.type : 'default'"
            v-on:click="customClick(left_button)" :key="left_button.msg">{{ left_button.msg }}</text-button>
        </div>
        <div class="right-part">
        <template v-for="button in custom_button">
          <text-button :button-type="button.type ? button.type : 'default'"
            v-on:click="customClick(button)" :key="button.msg">{{ button.msg }}</text-button>
        </template>
        <text-button
          v-on:click="click(false)"
          ref="cancelBtn"
          v-if="buttons.indexOf('cancel') != -1">{{ cancel_msg }}</text-button>
        <text-button
          :button-type="okBtnType"
          v-on:click="click(true)"
          ref="okBtn"
          v-if="buttons.indexOf('ok') != -1">{{ ok_msg }}</text-button>
        </div>
        <div
          v-if="isReminderShow" 
          class="reminder" 
          :style="reminderStyle">
          <div class="container">
            <p>{{ reminderObj.content }}</p>
            <div class="panel">
              <button class="btn" @click="reminderCancel">
                {{ reminderObj.cancel_msg || cancel_msg }}
              </button>
              <button class="btn" @click="reminderOk">
                {{ reminderObj.ok_msg || ok_msg }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import TextButton from '../basic/TextButton';

export default {
  name: 'pop-window',
  components: {
    TextButton,
  },
  computed: {
    okBtnType() {
      if (this.disable_ok) return 'disable';
      return this.popWarn ? 'primary' : 'fill';
    },
  },
  methods: {
    close() {
      this.$root.$emit('close-window', this);
      this.$setBackgroundBlur(false);
    },
    exitPop(e) {
      const target = e.target;
      if (target.className === 'pop-window' && this.clickOutsideClose) {
        this.click(false);
      }
    },
    customClick(button) {
      if (button.closeAfterClick) {
        this.show = false;
        this.currentView = undefined;
        this.close();
      }

      if (button.callback) {
        button.callback();
      }

      if (button.event) {
        this.$refs.content.$emit(button.event, button.payload);
      }
    },
    click(ok = true) {
      if (!ok) {
        if (this.cancelValidate) {
          this.$refs.content.$emit('cancelValidate');
        } else {
          this.cancelValidatePass();
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
      this.close();
      if (this.callOk && typeof this.callOk === 'function') {
        if (customData) {
          this.callOk.call(this, customData);
        } else {
          this.callOk.call(this, this.data);
        }
      }
    },
    cancelValidatePass(customData) {
      this.show = false;
      this.currentView = undefined;
      this.close();
      if (this.callCancel && typeof this.callCancel === 'function') {
        if (customData) {
          this.callCancel.call(this, customData);
        } else {
          this.callCancel.call(this, this.data);
        }
      }
    },
    showWindow(option) {
      const that = this;
      that.show = true;
      that.title = option.title;
      that.buttons = option.buttons || ['ok', 'cancel'];
      that.ok_msg = option.ok_msg || that.dft_ok_msg;
      that.cancel_msg = option.cancel_msg || that.dft_cancel_msg;
      that.data = option.data;
      that.extData = option.extData || {};
      that.currentView = option.component;
      that.validate = option.validate;
      that.cancelValidate = option.cancelValidate || false;
      that.disable_ok = option.disable_ok || false;
      that.custom_button = option.custom_button || [];
      that.left_button = option.left_button || undefined;
      that.clickOutsideClose = option.clickOutsideClose === true;
      that.bindValue = option.bindValue !== false;
      that.popWarn = option.popWarn === true;
      that.popDescription = option.popDescription === true;
      if (option.callback) {
        that.callOk = option.callback.ok;
        that.callCancel = option.callback.cancel;
      } else {
        that.callOk = undefined;
        that.callCancel = undefined;
      }
      if (option.customContentClasses !== undefined) {
        that.customContentClasses = option.customContentClasses;
      } else {
        that.customContentClasses = [];
      }

      if (option.popDescription) {
        that.isBackgroundDark = false;
        that.$setBackgroundBlur(false);
      } else {
        that.isBackgroundDark = true;
        that.$setBackgroundBlur(true);
      }
    },
    hideWindow() {
      this.click(false);
    },
    enableOK() {
      this.disable_ok = false;
    },
    disableOK() {
      this.disable_ok = true;
    },
    changeOKMsg(msg) {
      this.ok_msg = msg;
    },
    showReminder({ buttonRef, ok = () => {}, cancel = () => {}, content, ok_msg, cancel_msg }) {
      this.isReminderShow = true;
      if (this.$refs[buttonRef]) {
        this.reminderCallbacks = {
          ok,
          cancel,
        };
        this.reminderObj = {
          content,
          ok_msg,
          cancel_msg,
        };
        this.$nextTick(() => {
          const rect = this.$refs[buttonRef].$el.getBoundingClientRect();
          this.reminderStyle = {
            right: `${innerWidth - ((rect.right + (rect.width / 2)) - 10)}px`,
            bottom: `${innerHeight - (rect.top - 6)}px`,
          };
        });
      }
    },
    reminderCancel() {
      this.isReminderShow = false;
      this.$nextTick(this.reminderCallbacks.cancel);
    },
    reminderOk() {
      this.isReminderShow = false;
      this.$nextTick(this.reminderCallbacks.ok);
    },
  },
  data() {
    return {
      show: false,
      dft_ok_msg: this.$t('general.ok'),
      dft_cancel_msg: this.$t('general.cancel'),
      buttons: ['ok', 'cancel'],
      title: '',
      currentView: undefined,
      data: {},
      callOk: undefined,
      callCancel: undefined,
      extData: {},
      disable_ok: false,
      ok_msg: 'ok',
      cancel_msg: 'cancel',
      custom_button: [],
      customContentClasses: [],
      clickOutsideClose: true,
      bindValue: true,
      left_button: undefined,
      popWarn: false,
      popDescription: false,
      isBackgroundDark: false,
      isReminderShow: false,
      reminderStyle: {},
      reminderObj: {
        content: '',
        ok_msg: '',
        cancel_msg: '',
      },
      reminderCallbacks: {
        ok: this.validatePass,
        cancel: this.cancelValidatePass,
      },
    };
  },
};
</script>

<style lang="scss" scoped>
@import "styles/variable";

$pop-title-font-size: 20px;
$pop-title-font-color: #333333;
$pop-spacing: 24px;

@keyframes showup {
  from {
    margin-top: -20px;
    opacity: 0;
    min-height: 70%;
  }
  to {
    margin-top: 0;
    opacity: 1;
    height: auto;
  }
}

.pop-window {
  &.hidden {
    visibility: hidden;
  }
  &.background-dark {
    background: rgba(0%, 0%, 0%, 0.6);
  }
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  @include auto-overflow();
  @include customScrollbar();
  &.slide-in-enter-active, &.slide-in-leave-active {
    transition: all 0.25s ease-in;
    .pop-content {
      transition: all 0.25s ease-in;
    }
  }
  &.slide-in-enter, &.slide-in-leave-to {
    .pop-content {
      margin-top: -20px;
      opacity: 0;
    }
  }
  &.slide-in-enter-to, &.slide-in-leave {
    .pop-content {
      margin-top: 0;
      opacity: 1;
    }
  }

  $pop-max-height: 90vh;
  .pop-content {
    // animation-name: showup;
    // animation-duration: 0.5s;

    background: white;
    // min-width: 300px;
    // max-width: 90%;
    max-height: $pop-max-height;

    display: flex;
    flex-direction: column;
    
    align-items: center;
    justify-content: left;
    box-shadow: 0 0 18px 0 rgba(0,0,0,0.24);
    border-radius: 4px;
    // padding: 5px;

    $content-padding-top: 5px;  /* leave some space to show box-shadow of the first-child */

    & > .title {
      color: $color-font-active;
      line-height: $pop-title-font-size;
      font-size: $pop-title-font-size;
      padding: $pop-spacing;
      padding-bottom: calc(#{$pop-spacing} - #{$content-padding-top});
      width: 100%;
      display: flex;
      justify-content: space-between;
      & > label {
        display: inline-block;
        max-width: 600px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .close-button {
        cursor: pointer;
      }
    }

    & > .content {
      position: relative;
      min-height: 30px;
      max-height: calc(#{$pop-max-height} - 140px);
      padding-top: $content-padding-top;
      box-sizing: border-box;
      @include auto-overflow();
      @include customScrollbar();
    }

    & > .visible-overflow {
      overflow: visible;
    }

    .pop-button {
      text-align: right;
      width: 100%;
      padding: $pop-spacing;
      box-sizing: border-box;

      display: flex;
      align-items: center;
      justify-content: space-between;

      .text-button {
        width: 60px;
        &:not(:last-child) {
          margin-right: 10px;
        }
      }
      &.center-align {
        justify-content: center;
        .text-button {
          width: 68px;
        }
      }
    }
  }

  & div.loading {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    background: rgba(0%, 0%, 0%, 0.6);
    color: white;
    display: flex;
      align-items: center;
      justify-content: center;
  }
  .reminder {
    font-size: 12px;
    line-height: 1.5;
    color: white;
    position: fixed;
    &::after {
      content: ' ';
      position: absolute;
      width: 0;
      height: 0;
      border-width: 6px 6px 0 6px;
      border-color: #5c5c5c transparent transparent;
      border-style: solid;
      right: 40px;
    }
    .container {
      text-align: left;
      width: 188px;
      background-color: #5c5c5c;
      border-radius: 4px;
      box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
      padding: 10px;
      .panel {
        margin-top: 10px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        .btn {
          border: none;
          outline: none;
          cursor: pointer;
          font-size: 12px;
          line-height: 1.5;
          color: #666666;
          border-radius: 2px;
          &:first-of-type {
            margin-right: 10px;
          }
        }
      }
    }
  }
}
</style>
