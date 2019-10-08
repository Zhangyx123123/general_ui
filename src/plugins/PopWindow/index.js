
import ErrorForm from '@/components/pop/ErrorAlert';
import CheckPop from '@/components/pop/CheckPop';
import WarnPop from '@/components/pop/WarnPop';
import PopWindows from './PopWindows';

function popWindow(option) {
  this.$root.$emit('pop-window', option);
}

function popCheck(option) {
  const that = this;
  option.component = CheckPop;
  that.$root.$emit('pop-window', option);
}

function popWarn(option) {
  const that = this;
  option.component = WarnPop;
  option.popWarn = true;
  that.$root.$emit('pop-window', option);
}

function popDescription(option) {
  const that = this;
  option.popDescription = true;
  option.clickOutsideClose = true;
  that.$root.$emit('pop-window', option);
}

function popError(msg, info) {
  const that = this;
  return new Promise((resolve) => {
    const option = {
      title: that.$t('general.error'),
      component: ErrorForm,
      data: {
        msg,
        info,
      },
      callback: {
        ok: () => {
          resolve();
        },
        cancel: () => {
          resolve();
        },
      },
      buttons: ['ok'],
    };
    this.$root.$emit('pop-window', option);
  });
}


const MyPlugin = {
  install(Vue) {
    Vue.component(PopWindows.name, PopWindows);
    let backgroundBlur = false;

    Vue.prototype.$pop = popWindow;
    Vue.prototype.$popError = popError;
    Vue.prototype.$popCheck = popCheck;
    Vue.prototype.$popWarn = popWarn;
    Vue.prototype.$popDescription = popDescription;
    Vue.prototype.$isBackgroundBlur = () => backgroundBlur;
    Vue.prototype.$setBackgroundBlur = (bool) => { backgroundBlur = bool; };
  },
};

export default MyPlugin;
