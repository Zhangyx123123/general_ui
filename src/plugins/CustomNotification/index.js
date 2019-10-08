import CustomNotification from '@/components/layout/CustomNotification';

let globalOption = {};

function popNotification(option) {
  const localOption = {};
  Object.assign(localOption, option);
  if (globalOption !== undefined) {
    Object.keys(globalOption).forEach((k) => {
      if (option[k] === undefined) {
        localOption[k] = globalOption[k];
      }
    });
  }
  this.$root.$emit('notification', localOption);
}

function popFailNotification(text) {
  this.$notify({ text, type: 'fail' });
}
function popWarnNotification(text) {
  this.$notify({ text, type: 'warning' });
}
function popInfoNotification(text) {
  this.$notify({ text, type: 'info' });
}

const MyPlugin = {
  install(Vue, option) {
    // user can use notifications as tag to use notification in web
    Vue.component(CustomNotification.name, CustomNotification);
    // setup global option
    globalOption = option;
    Vue.prototype.$notificationSetting = option;
    Vue.prototype.$setNotificationSetting = (opt) => {
      Vue.$notificationSetting = opt;
      globalOption = opt;
    };

    // user can use vue.$notify to use notification
    Vue.prototype.$notify = popNotification;
    Vue.prototype.$notifyFail = popFailNotification;
    Vue.prototype.$notifyWarn = popWarnNotification;
    Vue.prototype.$notifyInfo = popInfoNotification;
  },
};

export default MyPlugin;
