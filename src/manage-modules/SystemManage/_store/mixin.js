const pagePath = {
  enterpriseList: '/manage/enterprise-manage',
  systemAdminList: '/manage/system-admin-list',
  systemSetting: '/manage/system-setting',
};

export default {
  methods: {
    getNavbarOption() {
      return {
        enterpriseList: this.$t('management.enterprise_list'),
        systemAdminList: this.$t('management.admin_list'),
        systemSetting: this.$t('management.system_setting'),
      };
    },
    goPage(page) {
      console.log(page);
      const path = pagePath[page];
      if (path !== undefined) {
        this.$router.push(path);
      }
    },
  },
};
