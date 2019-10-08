const operationType = {
  data() {
    return {
      operationType: {
        all: this.$t('general.all'),
        add: this.$t('privileges.actions.create'),
        edit: this.$t('privileges.actions.edit'),
        delete: this.$t('privileges.actions.delete'),
        import: this.$t('privileges.actions.import'),
        export: this.$t('privileges.actions.export'),
        login: this.$t('privileges.actions.login'),
        logout: this.$t('privileges.actions.logout'),
        publish: this.$t('privileges.actions.publish'),
        active: this.$t('privileges.actions.active'),
        deactive: this.$t('privileges.actions.deactive'),
        mark: this.$t('privileges.actions.mark'),
        ignore: this.$t('privileges.actions.ignore'),
        cluster: this.$t('privileges.actions.cluster'),
      },
    };
  },
};

export default operationType;
