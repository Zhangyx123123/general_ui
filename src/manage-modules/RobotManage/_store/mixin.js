export default {
  methods: {
    getNavbarOption() {
      return {
        robotList: this.$t('management.robot_list'),
        enterpriseSetting: this.$t('management.enterprise_setting'),
      };
    },
  },
};
