<template>
<div id="page-header">
  <div class="robot-list column click-button" @click="showRobotList" v-if="enterpriseID !== '' && !showSpecialPage">
    {{ $t('general.robot_list') }}
  </div>
  <div class="product column click-button" @click="goIMPage" v-if="userInfo.type === 1 && imEnable && !showSpecialPage">
    {{ $t('general.im') }}
  </div>
  <div class="empty column"></div>
  <div class="enterprise column" v-if="!showUserInfoPage && enterpriseID !== '' && !showAuditModule">
    <div class="icon-container">
      <icon :size=22 icon-type="header_enterprise"/>
    </div>
    <div>{{ enterpriseName }}</div>
  </div>
  <template v-if="robotID !== '' && !showUserInfoPage && !showAuditModule">
  <div class="robot column">
    <div class="icon-container">
      <icon :size=22 icon-type="robot"/>
    </div>
    <div ref="robotName" class="column-text" v-tooltip="robotNameTooltip" @mouseover="showFullRobotName($event, robotName)" @mouseout="hideFullRobotName($event)">{{ robotName }}</div>
  </div>
  <div class="chat-test column click-button" @click="showChatTest" v-if="!showUserInfoPage && !showAuditModule">
    <div class="icon-container">
      <icon :size=22 icon-type="header_dialog"/>
    </div>
    {{$t('general.chat_test')}}
  </div>
  </template>
  <div class="user">
    <div class="user-column" @click.stop="showMenu">
      <div class="icon-container">
        <icon :size=22 icon-type="header_user"/>
      </div>
      <div>{{ userInfo.display_name || userInfo.user_name }}</div>
      <div class="icon-container icon-right">
        <icon :size=7 icon-type="header_dropdown"/>
      </div>
    </div>

    <div class="user-menu-container" :class="[ showUserMenu ? 'show': '']" ref="list">
      <div class="user-menu">
        <div class="menu-item" @click="clickShowUserPreference">{{ $t('header.user_info') }}</div>
        <div class="menu-item" v-if="userInfo.type <= 1 && enterpriseID !== ''" @click="goEnterprisePrivilege">{{ $t('header.enterprise_privilege_list') }}</div>
        <div class="menu-item" v-if="userInfo.type === 0 && enterpriseID !== ''" @click="goEnterpriseList">{{ $t('header.back_to_system_manage') }}</div>
        <div class="menu-item" @click="goAuditLog">{{ $t('header.audit_log') }}</div>
        <div class="menu-item" @click="logout">{{ $t('header.logout') }}</div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
import api from '@/api/system';
import event from '@/utils/js/event';

export default {
  data: () => ({
    selectedIdx: 0,
    showUserMenu: false,
    clickHandler: undefined,
    blurHandler: undefined,
    robotNameTooltip: {
      msg: '',
      eventOnly: true,
      top: 90,
      left: -250,
    },
  }),
  api,
  computed: {
    ...mapState({
      imEnable(state) {
        const env = state.env;
        return (env.IM_ENABLE === '1' || env.IM_ENABLE === 'true');
      },
    }),
    ...mapGetters([
      'robotName',
      'robotID',
      'enterpriseName',
      'enterpriseID',
      'robotList',
      'enterpriseList',
      'userInfo',
      'showUserInfoPage',
    ]),
    showGoEnterpriseList() {
      return this.enterpriseID !== '' && this.userInfo.type <= 0;
    },
    showGoEnterpriseUserList() {
      return this.robotID !== '' && this.userInfo.type <= 1;
    },
    showAuditModule() {
      const auditURL = [
        '/manage/audit-system',     // 0
        '/manage/audit-enterprise', // 1
        '/manage/audit-robot',      // 2
      ];
      return auditURL.indexOf(this.$route.path) !== -1;
    },
    showSpecialPage() {
      return this.showAuditModule || this.showUserInfoPage;
    },
  },
  methods: {
    ...mapMutations([
      'setRobot',
      'setEnterprise',
      'showUserPreference',
      'hideUserPreference',
    ]),
    ...mapActions(['getEnv']),
    isEllipsisActive(elem) {
      return elem.offsetWidth < elem.scrollWidth;
    },
    showFullRobotName(e, name) {
      const that = this;
      if (!that.isEllipsisActive(e.target)) return;
      that.robotNameTooltip.msg = name;
      that.$refs.robotName.dispatchEvent(event.createEvent('tooltip-reload'));
      that.$refs.robotName.dispatchEvent(event.createEvent('tooltip-show'));
    },
    hideFullRobotName(e) {
      const that = this;
      if (!that.isEllipsisActive(e.target)) return;
      that.$refs.robotName.dispatchEvent(event.createEvent('tooltip-hide'));
    },
    clickShowUserPreference() {
      this.showUserMenu = false;
      this.showUserPreference();
    },
    goEnterpriseList() {
      const that = this;
      that.setRobot('');
      that.setEnterprise('');
      that.$router.push('/manage/enterprise-manage');
      that.hideUserPreference();

      that.closeMenu();
    },
    goEnterprisePrivilege() {
      const that = this;
      that.setRobot('');
      that.$router.push('/manage/enterprise-user-list');
      that.hideUserPreference();

      that.closeMenu();
    },
    goAuditLog() {
      const that = this;
      if ((this.enterpriseID !== '' && this.robotID !== '') || this.userInfo.type >= 2) { // normal user
        that.$router.push('/manage/audit-robot');
      } else if (this.enterpriseID !== '') {
        that.$router.push('/manage/audit-enterprise');
      } else {
        that.$router.push('/manage/audit-system');
      }
      that.hideUserPreference();
      that.closeMenu();
    },
    showRobotList() {
      this.setRobot('');
      this.$router.push('/manage/robot-manage');
    },
    closeMenu() {
      const that = this;
      that.showUserMenu = false;
      window.removeEventListener('click', that.clickHandler);
      that.clickHandler = undefined;
    },
    goIMPage() {
      window.open('/im-admin/imIndex');
    },
    showMenu() {
      const that = this;
      that.showUserMenu = true;

      that.clickHandler = (e) => {
        const clickDom = e.target;
        const listDom = that.$refs.list;
        if (listDom && !listDom.contains(clickDom)) {
          that.showUserMenu = false;
          window.removeEventListener('click', that.clickHandler);
          that.clickHandler = undefined;
        }
      };
      that.blurHandler = () => {
        that.showUserMenu = false;
        window.removeEventListener('blur', that.blurHandler);
        that.blurHandler = undefined;
      };
      window.addEventListener('click', that.clickHandler);
      window.addEventListener('blur', that.blurHandler);
    },
    logout() {
      this.$logout();
    },
    showChatTest() {
      this.$root.$emit('open-chat-test');
    },
  },
  mounted() {
    // this.getEnv.call(null, this);
  },
};
</script>

<style lang="scss" scoped>
@import "styles/variable";

#page-header {
  position: absolute;
  left: $page-menu-width;
  top: 0;
  width: calc(100vw - #{$page-menu-width});
  height: $page-header-height;
  background: $page-header-color;
  box-shadow: inset -1px 0 0 0 #222222;
  color: white;
  font-weight: bold;

  display: flex;
  justify-content: flex-end;
  align-items: stretch;

  .column {
    flex: 0 0 auto;
    &:not(.empty) {
      max-width: 300px;
      .column-text {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    display: flex;
    align-items: center;
    .icon-container {
      margin-right: 10px;
    }
    box-shadow: inset -1px 0 0 0 #333333;
    padding: 0 20px;
    &.empty {
      flex: 1;
      padding: 0;
    }
    &:hover:not(.empty):not(.enterprise):not(.robot) {
      background-color: #505050;
    }
  }

  .click-button {
    @include click-button();
  }

  .user {
    flex: 0 0 auto;

    display: flex;
    flex-direction: column;
    .user-column {
      flex: 0 0 $page-header-height;
      @include click-button();

      display: flex;
      align-items: center;
      .icon-container {
        margin-right: 10px;
        &.icon-right {
          margin-left: 10px;
          margin-right: 0px;
        }
      }
      box-shadow: inset -1px 0 0 0 #333333;
      padding: 0 20px;
      &:hover {
        background-color: #505050;
      }
    }
    .user-menu-container { 
      z-index: 1;
      flex: 0 0 auto;
      color: #666666;
      padding: 10px;
      visibility: hidden;
      &.show {
        visibility: visible;
      }

      display: flex;
      flex-direction: column;
      .user-menu {
        flex: 0 0 auto;
        background: white;
        color: $color-font-normal;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
        border-radius: 2px;
        display: flex;
        flex-direction: column;
        .menu-item {
          @include font-14px;
          height: 32px;
          flex: 0 0 32px;
          padding: 7px 15px;
          font-weight: normal;
          display: flex;
          align-items: center;
          @include click-button();

          &:hover {
            background-color: $color-select-hover;
            color: white;
          }
          &:first-child {
            border-top-left-radius: 2px;
            border-top-right-radius: 2px;
          }
          &:last-child {
            border-bottom-left-radius: 2px;
            border-bottom-right-radius: 2px;
          }
        }
      }
    }
  }
}
</style>
