<template>
  <div class="bind-wechat-wrapper">
    <general-table
      :table-data="enterpriseList"
      :table-header="tableHeader"
      :action="action"
      auto-height
      show-empty>
    </general-table>
  </div>
</template>

<script>
import robotAPI from '../_api/robot';

export default {
  api: robotAPI,
  data() {
    return {
      tableHeader: [
        {
          key: 'corpid',
          text: `${this.$t('robot_setting.enterprise')}ID`,
          width: '300px',
        },
        {
          key: 'agentid',
          text: 'AgentID',
          width: '300px',
        },
      ],
      enterpriseList: [],
      action: [
        {
          key: 'delete',
          text: this.$t('robot_setting.unbind'),
          type: 'error',
          onclick: this.handleUnbindWechat,
        },
      ],
    };
  },
  created() {
    this.getEnterpriseWechatList();
  },
  methods: {
    getEnterpriseWechatList() {
      this.$api.getEnterpriseWechatList().then((res) => {
        this.enterpriseList = res;
        this.enterpriseList.forEach((item) => {
          item.action_enable = {
            delete: true,
          };
        });
      });
    },
    handleUnbindWechat() {
      this.$api.unBindEnterpriseWechat().then(() => {
        this.getEnterpriseWechatList();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.bind-wechat-wrapper{
  width: 834px;
  height: 480px;
  min-height: 200px;
}
</style>