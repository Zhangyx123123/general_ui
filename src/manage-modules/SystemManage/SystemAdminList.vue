<template>
  <div>
    <div class="card h-fill w-fill">
      <nav-bar class='nav-bar' :options="getNavbarOption()" v-model='currentPage' @search="changeKeyword" showSearch></nav-bar>
      <div class="page">
        <command-row class="commands">
          <text-button button-type="primary" @click="popEditUser()">{{ $t('management.add_account') }}</text-button>
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
import NavBar from '@/components/NavigationBar';
import api from './_api/system';
import CommandRow from '../_components/CommandRow';
import UserAddForm from './_components/AdminAddForm';
import PasswordForm from '../UserManage/_components/UserPasswordForm';
import mixin from './_store/mixin';

export default {
  name: 'system-admin-list',
  path: 'system-admin-list',
  privCode: 'manage_admin',
  components: {
    NavBar,
    CommandRow,
  },
  api,
  mixins: [mixin],
  computed: {
    filteredUsers() {
      if (this.keyword === '') {
        return this.users;
      }
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
    currentPage(val) {
      this.goPage(val);
    },
    lastPageIdx() {
      if (this.lastPageIdx < this.curPageIdx) {
        this.curPageIdx = this.lastPageIdx;
      }
    },
  },
  data() {
    return {
      currentPage: 'systemAdminList',
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
          onclick: this.popEditUser,
        },
        {
          text: this.$t('general.delete'),
          type: 'error',
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
      that.$api.getAdmins()
      .then((users) => {
        that.users = users;
        that.users.forEach((user) => {
          if (!user.display_name) {
            user.display_name = user.user_name;
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
            that.$api.updateAdmin(origUser.id, updatedUser)
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
            console.log(tempUser);
            that.popEditUser(tempUser);
          },
        },
      });
    },
    popEditUser(user) {
      const that = this;

      const popOption = {
        title: user ? that.$t('management.edit_account') : that.$t('management.add_account'),
        component: UserAddForm,
        validate: true,
        extData: {
          user,
          editPasswordCallback: this.popEditPassword,
        },
        callback: {
          ok(retData) {
            if (user === undefined) {
              that.$api.addAdmin(retData)
              .then(() => {
                that.$notify({ text: that.$t('error_msg.save_success') });
                that.loadUsers();
              })
              .catch((err) => {
                console.log(err);
              });
            } else {
              that.$api.updateAdmin(user.id, retData)
              .then(() => {
                that.$notify({ text: that.$t('error_msg.save_success') });
                that.loadUsers();
              })
              .catch((err) => {
                console.log(err);
              });
            }
          },
        },
      };
      that.$pop(popOption);
    },
    deleteUser(user) {
      const that = this;
      that.$popWarn({
        data: {
          msg: that.$t('privileges.check_delete_user', { user: user.user_name }),
        },
        callback: {
          ok() {
            that.$api.deleteAdmin(user.id).then(() => {
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
    border-top: 1px solid $color-borderline;
    padding-right: 12px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
