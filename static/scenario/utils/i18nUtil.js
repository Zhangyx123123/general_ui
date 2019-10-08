export default {
  getLocaleMsgs(vueI18n) {
    if (vueI18n) {
      return vueI18n.messages[vueI18n.locale];
    }
    return {};
  },
};
