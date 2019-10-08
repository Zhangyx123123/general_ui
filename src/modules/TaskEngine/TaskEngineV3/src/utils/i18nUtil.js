export default {
  getLocaleMsgs(vueI18n) {
    if (vueI18n) {
      let locale = localStorage.getItem('locale');
      if (!locale) {
        locale = 'zh-cn';
      }
      return vueI18n.messages[locale];
    }
    return {};
  },
};
