<template>
  <div>
    <div class="card h-fill w-fill">
      <nav-bar class='nav-bar' :options=pageOption @search="changeKeyword" showSearch></nav-bar>
      <div class="page">
        <command-row class="commands">
          <text-button button-type="primary" @click="popAddUser(2)">{{ $t('management.add_account') }}</text-button>
          <text-button @click="goRoleList">{{ $t('management.privilege_setting') }}</text-button>
        </command-row>
        <general-table
          id="list-table"
          :table-header="tableHeader"
          :table-data="showUsers"
          :action="actions"
          autoHeight
        />
      </div>
      <div class="table-paginator">
        <v-pagination size="small"
          :total="filteredUsers.length"
          :pageIndex="curPageIdx"
          :pageSize="pageLimit"
          :pageSizeOption="[25, 50, 100, 200, 500, 1000]"
          :layout="['prev', 'pager', 'next', 'sizer', 'jumper']"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import NavBar from '@/components/NavigationBar';
import sysAPI from '@/api/system';
import CommandRow from '../_components/CommandRow';
import userAPI from '../_api/user';
import groupAPI from '../_api/group';
import roleAPI from '../_api/role';
import robotAPI from '../_api/robot';
import ChooseUserTypeForm from './_components/ChooseUserTypeForm';
import UserAddForm from './_components/UserAddForm';
import PasswordForm from './_components/UserPasswordForm';

export default {
  name: 'enterprise-user-list',
  path: 'enterprise-user-list',
  privCode: 'manage_user',
  components: {
    NavBar,
    CommandRow,
  },
  api: [userAPI, groupAPI, roleAPI, robotAPI, sysAPI],
  computed: {
    ...mapGetters([
      'enterpriseID',
      'userRoleMap',
      'userID',
    ]),
    filteredUsers() {
      if (this.keyword === '') {
        return this.users;
      }
      this.curPageIdx = 1;
      return this.users.filter(user => user.user_name.indexOf(this.keyword) >= 0);
    },
    showUsers() {
      const start = this.pageLimit * (this.curPageIdx - 1);
      const end = start + this.pageLimit;
      return this.filteredUsers.slice(start, end);
    },
    lastPageIdx() {
      return Math.ceil(this.filteredUsers.length / this.pageLimit);
    },
  },
  watch: {
    lastPageIdx() {
      if (this.lastPageIdx < this.curPageIdx) {
        this.curPageIdx = this.lastPageIdx;
      }
    },
  },
  data() {
    return {
      pageOption: {
        userList: this.$t('management.enterprise_privilege_manage'),
      },
      keyword: '',
      users: [],
      curPageIdx: 1,
      pageLimit: 25,
      tableHeader: [
        {
          key: 'user_name',
          text: this.$t('management.user_name'),
          width: '10%',
        },
        {
          key: 'type_text',
          text: this.$t('management.user_type'),
          width: '10%',
        },
        {
          key: 'display_name',
          text: this.$t('management.user_display_name'),
          width: '10%',
        },
        {
          key: 'phone',
          text: this.$t('management.phone'),
          width: '20%',
        },
        {
          key: 'email',
          text: this.$t('management.email'),
        },
      ],
      actions: [
        {
          text: this.$t('general.edit'),
          type: 'primary',
          key: 0,
          onclick: this.popEditUser,
        },
        {
          text: this.$t('general.delete'),
          type: 'error',
          key: 1,
          onclick: this.deleteUser,
        },
        {
          text: this.$t('general.log_off'),
          type: 'error',
          key: 2,
          onclick: this.deleteUser,
        },
      ],
    };
  },
  methods: {
    changeKeyword(word) {
      this.keyword = word;
    },
    goRoleList() {
      this.$router.push('/manage/enterprise-role-list');
    },
    toFirstPage() {
      this.curPageIdx = 1;
    },
    handlePageChange(page) {
      this.curPageIdx = page;
    },
    handlePageSizeChange(pageSize) {
      this.pageLimit = pageSize;
      this.toFirstPage();
    },
    loadUsers() {
      const that = this;
      that.$startPageLoading();
      that.$api.getEnterpriseUsers(that.enterpriseID)
      .then((users) => {
        that.users = users;
        that.users.forEach((user) => {
          if (user.type === 2) {
            user.type_text = that.$t('management.normal_user');
          } else if (user.type === 1) {
            user.type_text = that.$t('management.enterprise_admin');
          } else if (user.type === 0) {
            user.type_text = that.$t('management.system_admin');
          } else {
            user.type_text = that.$t('management.unknown');
          }

          if (!user.display_name) {
            user.display_name = user.user_name;
          }
          if (that.userID !== user.id) {
            user.action_enable = [true, true, false];
          } else {
            user.action_enable = [true, false, true];
          }
        });
      })
      .finally(() => {
        that.$emit('endLoading');
      });
    },
    popEditPassword(origUser, tempUser) {
      const that = this;
      that.$pop({
        title: that.$t('management.edit_account'),
        component: PasswordForm,
        validate: true,
        extData: {
          user: origUser,
        },
        ok_msg: that.$t('general.save'),
        callback: {
          ok(retData) {
            const updatedUser = {
              username: origUser.user_name,
              name: origUser.display_name,
              email: origUser.email,
              phone: origUser.phone,
              password: retData.password,
              verify_password: retData.verify,
            };
            that.$api.updateEnterpriseUser(that.enterpriseID, origUser.id, updatedUser)
            .then(() => {
              that.$notify({ text: that.$t('management.update_password_success') });
              that.popEditUser(tempUser);
            })
            .catch((err) => {
              that.popEditPassword(origUser, tempUser);
              if (err.response.status === 403) {
                that.$notifyFail(that.$t('management.err_manager_password'));
              } else {
                that.$notifyFail(that.$t('management.err_update_password_fail'));
              }
            });
          },
          cancel() {
            that.popEditUser(tempUser);
          },
        },
      });
    },
    popEditUser(user) {
      const that = this;
      const promises = [
        that.$api.getEnterpriseRoles(that.enterpriseID),
        that.$api.getRobotGroups(that.enterpriseID),
        that.$api.getRobots(that.enterpriseID),
        that.$api.getEnterpriseUsers(that.enterpriseID),
      ];

      const popOption = {
        title: that.$t('management.edit_account'),
        component: UserAddForm,
        validate: true,
        extData: {
          type: user.type,
          editMode: true,
          user,
          editPasswordCallback: this.popEditPassword,
        },
        cancel_msg: that.$t('management.go_back'),
        callback: {
          ok(retData) {
            that.$api.updateEnterpriseUser(that.enterpriseID, user.id, retData).then(() => {
              that.loadUsers();
            });
          },
        },
      };

      that.$startPageLoading();
      Promise.all(promises)
      .then(([roles, groups, robots, users]) => {
        popOption.extData.roles = roles;
        popOption.extData.groups = groups;
        popOption.extData.robots = robots;
        popOption.extData.users = users;
        that.$pop(popOption);
      })
      .finally(() => {
        that.$emit('endLoading');
      });
    },
    popAddUser(dftUserType) {
      const that = this;
      that.$pop({
        title: that.$t('management.add_account'),
        component: ChooseUserTypeForm,
        validate: true,
        ok_msg: that.$t('management.next_step'),
        extData: {
          defaultType: dftUserType,
        },
        callback: {
          ok(retData) {
            that.popAddUserInfo(retData);
          },
        },
      });
    },
    popAddUserInfo(userType) {
      const that = this;

      const promises = [
        that.$api.getEnterpriseRoles(that.enterpriseID),
        that.$api.getRobotGroups(that.enterpriseID),
        that.$api.getRobots(that.enterpriseID),
        that.$api.getEnterpriseUsers(that.enterpriseID),
      ];
      const popOption = {
        title: that.$t('management.add_account'),
        component: UserAddForm,
        validate: true,
        extData: {
          type: userType,
          editMode: false,
        },
        left_button: {
          callback() {
            that.popAddUser(userType);
          },
          closeAfterClick: true,
          msg: that.$t('management.last_step'),
        },
        callback: {
          ok(retData) {
            let imEnable = false;
            retData.type = userType;
            that.$api.getEnv().then((rspData) => {
              imEnable = (rspData.IM_ENABLE === '1' || rspData.IM_ENABLE === 'true');
            })
            .then(() => that.$api.addEnterpriseUser(that.enterpriseID, retData, imEnable))
            .then(() => {
              that.$notify({ text: that.$t('management.add_user_success') });
              that.loadUsers();
            });
          },
        },
      };

      that.$startPageLoading();
      Promise.all(promises)
      .then(([roles, groups, robots, users]) => {
        popOption.extData.roles = roles;
        popOption.extData.groups = groups;
        popOption.extData.robots = robots;
        popOption.extData.users = users;
        that.$pop(popOption);
      })
      .finally(() => {
        that.$emit('endLoading');
      });
    },
    deleteUser(user) {
      const that = this;
      let msg = that.$t('privileges.check_delete_user', { user: user.user_name });
      if (user.id === that.userID) {
        msg = that.$t('privileges.check_cancel_user', { user: user.user_name });
      }
      that.$popWarn({
        data: {
          msg,
        },
        callback: {
          ok() {
            that.$api.deleteEnterpriseUser(that.enterpriseID, user.id).then(() => {
              if (user.id === that.userID) {
                that.$logout();
                return;
              }
              that.$notify({ text: that.$t('privileges.delete_success') });
              that.loadUsers();
            });
          },
        },
        bindValue: true,
      });
    },
  },
  mounted() {
    this.loadUsers();
  },
};
</script>

<style lang="scss" scoped>
.card {
  overflow: hidden;

  display: flex;
  flex-direction: column;
  .nav-bar {
    flex: 0 0 auto;
  }
  .page {
    flex: 1;

    display: flex;
    flex-direction: column;
    .commands {
      flex: 0 0 auto;
      padding-bottom: 20px;
    }
    #list-table {
      flex: 1;
      overflow: hidden;
    }
  }
  .table-paginator {
    flex: 0 0 50px;
    padding-right: 12px;
    border-top: 1px solid $color-borderline;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
