<template>
  <div class="user-preference">
    <div class="card h-fill w-fill">
      <div class="header">
        <div class='nav-bar'>
          {{ $t('management.user_preference') }}
        </div>
        <div class="button-container">
          <div class="back-button">
            <text-button @click="hideUserPreference">{{ $t('management.go_back') }}</text-button>
          </div>
          <div class="edit-button">
            <text-button button-type="primary" width="80px" @click="popEditUser">{{ $t('management.edit_data') }}</text-button>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="row" v-for="col in columnOption" :key="col.key">
          <div class="row-title">{{ col.text }}：</div>
          <div class="row-content">{{ user[col.key] }}</div>
          <text-button v-if="col.key==='password'"
          @click="popEditPassword">{{ $t('management.modify_password') }}</text-button>
        </div>
        <div class="row">
          <div class="row-title">{{ $t('general.language') }}：</div>
          <div class="row-content">
            <dropdown-select :options="languageOption" width="150px" v-model="nowLanguage" ref="language" @input="changeLanguage"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import NavBar from '@/components/NavigationBar';
import api from './_api/user';
import adminAPI from './SystemManage/_api/system';
import UserForm from './_components/NormalUserEditForm';
import PasswordForm from './_components/NormalUserPasswordForm';

export default {
  name: 'user-preference',
  components: {
    NavBar,
  },
  api: [api, adminAPI],
  data() {
    return {
      user: {},
      pageOption: {
        robotList: this.$t('management.user_preference'),
      },
      columnOption: [
        {
          key: 'user_name',
          text: 'ID',
        },
        {
          key: 'password',
          text: this.$t('management.password'),
        },
        {
          key: 'display_name',
          text: this.$t('management.user_display_name'),
        },
        {
          key: 'phone',
          text: this.$t('management.phone'),
        },
        {
          key: 'email',
          text: this.$t('management.email'),
        },
      ],
      languageOption: [
        {
          value: 'zh-cn',
          text: this.$t('general.zh_cn'),
        },
        {
          value: 'zh-tw',
          text: this.$t('general.zh_tw'),
        },
      ],
      nowLanguage: [],
    };
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'enterpriseID',
      'showLanguage',
    ]),
  },
  methods: {
    ...mapMutations([
      'hideUserPreference',
      'setLanguage',
      'setUserInfo',
    ]),
    loadUser() {
      const that = this;
      let promise;
      that.$startPageLoading();

      if (that.userInfo.type >= 1) {
        promise = that.$api.getEnterpriseUser(that.enterpriseID, that.userInfo.id);
      } else {
        promise = that.$api.getAdmin(that.userInfo.id);
      }

      return promise
      .then((data) => {
        data.password = '********';
        that.user = data;
        const userInfo = JSON.parse(JSON.stringify(data));
        delete userInfo.password;
        that.setUserInfo(userInfo);
      })
      .finally(() => {
        that.$emit('endLoading');
      });
    },
    popEditUser() {
      const that = this;
      that.$pop({
        title: that.$t('management.edit_user_preference'),
        component: UserForm,
        validate: true,
        extData: that.user,
        bindValue: false,
        ok_msg: that.$t('general.save'),
        callback: {
          ok(retData) {
            const updatedUser = {
              ...retData,
              apps: that.getUserPrivilegeStr(),
            };

            if (retData.name === that.user.display_name &&
              retData.email === that.user.email &&
              retData.phone === that.user.phone) {
              that.$notify({ text: that.$t('error_msg.save_success') });
              return;
            }

            let promise;
            that.$startPageLoading();

            if (that.userInfo.type >= 1) {
              promise = that.$api.updateEnterpriseUser(
                that.enterpriseID, that.userInfo.id, updatedUser);
            } else {
              promise = that.$api.updateAdmin(that.userInfo.id, updatedUser);
            }
            promise.then(() => {
              that.$notify({ text: that.$t('error_msg.save_success') });
              return that.loadUser();
            })
            .finally(() => {
              that.$emit('endLoading');
            });
          },
        },
      });
    },
    popEditPassword() {
      const that = this;
      that.$pop({
        title: that.$t('management.modify_password'),
        component: PasswordForm,
        validate: true,
        extData: that.user,
        ok_msg: that.$t('general.save'),
        callback: {
          ok(retData) {
            const updatedUser = {
              username: that.user.user_name,
              name: that.user.display_name,
              email: that.user.email,
              phone: that.user.phone,
              password: retData.password,
              verify_password: retData.verify,
              apps: that.getUserPrivilegeStr(),
            };

            let promise;
            that.$startPageLoading();

            if (that.userInfo.type >= 1) {
              promise = that.$api.updateEnterpriseUser(
                that.enterpriseID, that.userInfo.id, updatedUser);
            } else {
              promise = that.$api.updateAdmin(that.userInfo.id, updatedUser);
            }

            that.$startPageLoading();
            promise.then(() => {
              that.$notify({ text: that.$t('management.update_password_success') });
            })
            .catch((err) => {
              if (err.response.status === 403) {
                that.popEditPassword();
                that.$notifyFail(that.$t('management.err_origin_password'));
              } else {
                that.popEditPassword();
                that.$notifyFail(that.$t('management.err_update_password_fail'));
              }
            })
            .finally(() => {
              that.$emit('endLoading');
            });
          },
        },
      });
    },
    getUserPrivilegeStr() {
      const that = this;
      const privileges = {
        apps: {},
        groups: {},
      };
      that.user.roles.apps.forEach((app) => {
        if (!privileges.apps[app.id]) {
          privileges.apps[app.id] = [];
        }
        privileges.apps[app.id].push(app.role);
      });
      that.user.roles.groups.forEach((group) => {
        if (!privileges.groups[group.id]) {
          privileges.groups[group.id] = [];
        }
        privileges.groups[group.id].push(group.role);
      });
      return JSON.stringify(privileges);
    },
    changeLanguage(value) {
      const language = value[0];
      if (this.showLanguage === language) {
        return;
      }
      this.setLanguage(language);
      // this.$api.setBF2Locale(this.userInfo.id, language).then(() => {
      location.reload();
      // });
    },
  },
  mounted() {
    this.loadUser();
    if (this.$refs.language !== undefined) {
      this.$refs.language.$emit('select', this.showLanguage);
    }
  },
};
</script>

<style lang="scss" scoped>
.user-preference {
  position: absolute;
  left: 0;
  top: $page-header-height;
  width: 100vw;
  height: calc(100vh - #{$page-header-height});
  background: $page-base;
  box-sizing: border-box;
  overflow: hidden;
  padding: 0 20px;
  .card {
    position: relative;
    @include card();
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid $color-borderline;
    height: 60px;
    padding: 0 20px;
    .nav-bar {
      flex: 1;
      border-bottom: 0px;
      @include font-16px();
      color: $color-font-active;
    }
    .button-container {
      flex: 0 0 auto;
      display: flex;
      justify-content: flex-end;
      .edit-button {
        margin-left: 10px;
      }
    }
  }
  
  .content {
    width: 100%;
    flex: 1;
    padding: 30px 20px;
    @include font-14px();
    @include auto-overflow();
    @include customScrollbar();
    .row {
      margin-bottom: 20px;

      display: flex;
      align-items: center;
      .row-title {
        flex: 0 0 88px;
        overflow: hidden;
      }
      .row-content {
        margin-right: 10px;
      }
    }
  }
}
</style>
