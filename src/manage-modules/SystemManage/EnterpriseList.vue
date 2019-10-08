<template>
  <div>
    <div class="card h-fill w-fill">
      <nav-bar class='nav-bar' :options="getNavbarOption()" v-model="currentPage"  @search="doSearch" showSearch></nav-bar>
      <div class="page">
        <command-row class="commands">
            <text-button button-type="primary"
            @click="popAddEnterprise()">{{ $t('management.create_enterprise') }}</text-button>
        </command-row>
        <div class="enterprise-list">
          <div class="enterprise-card" 
            v-for="enterprise in filteredEnterprise" :key="enterprise.id"
            @click="goEnterprise(enterprise)">
            <div class="card-title">
              <div class="card-title-text">
                {{ enterprise.name }}
              </div>
              <div class="card-title-edit" @click.stop="popEditEnterprise(enterprise)">
                <icon :size=12 icon-type="edit_blue"></icon>
              </div>
            </div>
            <div class="card-description">
              {{ enterprise.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import NavBar from '@/components/NavigationBar';
import sysAPI from '@/api/system';
import EnterpriseAddForm from './_components/EnterpriseAddForm';
import EnterpriseEditForm from './_components/EnterpriseEditForm';
import EnterpriseDeleteForm from './_components/EnterpriseDeleteForm';
import enterpriseAPI from './_api/enterprise';
import systemAPI from './_api/system';
import CommandRow from '../_components/CommandRow';
import mixin from './_store/mixin';

const robotListPage = '/manage/robot-manage';
export default {
  path: 'enterprise-manage',
  name: 'enterprise-manage',
  privCode: 'manage_enterprise',
  components: {
    NavBar,
    CommandRow,
  },
  api: [enterpriseAPI, systemAPI, sysAPI],
  mixins: [mixin],
  computed: {
    ...mapGetters([
      'userInfo',
      'enterpriseList',
    ]),
    filteredEnterprise() {
      if (this.keyword === '') {
        return this.enterpriseList;
      }
      return this.enterpriseList.filter(enterprise =>
        enterprise.name.indexOf(this.keyword) >= 0 ||
        (enterprise.description && enterprise.description.indexOf(this.keyword) >= 0));
    },
  },
  data() {
    return {
      keyword: '',
      currentPage: 'enterpriseList',
    };
  },
  watch: {
    currentPage(val) {
      this.goPage(val);
    },
  },
  mounted() {
    this.setEnterprise('');
  },
  methods: {
    ...mapMutations([
      'setEnterprise',
      'setRobotList',
      'setUserRoleMap',
      'setPrivilegeList',
      'setPrivilegedEnterprise',
    ]),
    doSearch(word) {
      this.keyword = word;
    },
    goEnterprise(enterprise) {
      const that = this;
      that.$api.getEnterpriseModules(enterprise.enterpriseID).then((modules) => {
        const showModules = modules.filter(mod => mod.status);
        localStorage.setItem('enterprise', enterprise.enterpriseID);
        localStorage.setItem('modules', JSON.stringify(showModules));
        this.setEnterprise(enterprise.enterpriseID);

        const userRoleMap = JSON.parse(localStorage.getItem('roleMap'));
        that.setUserRoleMap(userRoleMap);
        that.setPrivilegeList(that.$getPrivModules());
        that.$router.push(robotListPage);
      });
    },
    popDeleteEnterprise(enterprise) {
      const that = this;
      that.$pop({
        title: that.$t('management.delete_enterprise'),
        component: EnterpriseDeleteForm,
        validate: true,
        extData: {
          name: enterprise.name,
          description: enterprise.description,
        },
        callback: {
          ok(reason) {
            that.$api.deleteEnterprise(enterprise.enterpriseID, reason || '')
              .then(() => that.reloadEnterprise());
          },
          cancel() {
            that.popEditEnterprise(enterprise);
          },
        },
      });
    },
    popEditEnterprise(enterprise) {
      const that = this;
      const promises = [
        that.$api.getEnterprises(),
        that.$api.getModules(),
        that.$api.getEnterpriseModules(enterprise.enterpriseID),
      ];

      return Promise.all(promises).then((datas) => {
        const [enterprises, modules, enterpriseModules] = datas;
        that.$pop({
          title: that.$t('management.edit_enterprise'),
          component: EnterpriseEditForm,
          extData: {
            existedEnterprises: enterprises.map(e => e.name),
            modules,
            name: enterprise.name,
            description: enterprise.description,
            checkedModules: enterpriseModules,
          },
          left_button: {
            msg: that.$t('general.delete'),
            type: 'error',
            closeAfterClick: true,
            callback: () => {
              that.popDeleteEnterprise(enterprise);
            },
          },
          validate: true,
          callback: {
            ok(retData) {
              that.editEnterprise(enterprise.enterpriseID, retData);
            },
          },
        });
      });
    },
    popAddEnterprise(initData) {
      const that = this;
      const promises = [
        that.$api.getEnterprises(),
        that.$api.getModules(),
      ];

      return Promise.all(promises).then((datas) => {
        const [enterprises, modules] = datas;
        that.$pop({
          title: that.$t('management.create_enterprise'),
          component: EnterpriseAddForm,
          extData: {
            existedEnterprises: enterprises.map(enterprise => enterprise.name),
            modules,
            initData,
          },
          validate: true,
          callback: {
            ok(retData) {
              that.addEnterprise(retData);
            },
          },
        });
      });
    },
    addEnterprise(data) {
      const that = this;
      let imEnable = false;
      that.$startPageLoading();
      that.$api.getEnv().then((rspData) => {
        imEnable = (rspData.IM_ENABLE === '1' || rspData.IM_ENABLE === 'true');
      })
      .then(() => that.$api.addEnterprise(data, imEnable))
      .then(() => that.reloadEnterprise())
      .catch((err) => {
        window.logerr = err;
        if (err.response.data.ret_msg === 'Column input error: admin username') {
          that.$notifyFail(that.$t('management.err_enterprise_admin_duplicate'));
        } else if (err.response.data.ret_msg === 'Column input error: admin email') {
          that.$notifyFail(that.$t('management.err_enterprise_email_duplicate'));
        } else {
          that.$notifyFail(that.$t('management.err_unkown'));
        }
        that.popAddEnterprise(data);
      })
      .finally(() => {
        that.$emit('endLoading');
      });
    },
    editEnterprise(id, data) {
      const that = this;
      that.$startPageLoading();
      return this.$api.updateEnterprise(id, data)
      .then(() => that.reloadEnterprise())
      .finally(() => {
        that.$emit('endLoading');
      });
    },
    reloadEnterprise() {
      const that = this;
      return that.$api.getEnterprises().then((datas) => {
        that.setPrivilegedEnterprise(datas);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.card {
  display: flex;
  flex-direction: column;

  .nav-bar {
    flex: 0 0 60px;
  }
  .page {
    flex: 1;
  }
}

.page {
  display: flex;
  flex-direction: column;
  @include auto-overflow();
  @include customScrollbar();

  .enterprise-list {
    flex: 1;
    padding: 20px;
    padding-bottom: 0px;
    
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    .enterprise-card {
      flex: 0 0 380px;
      max-width: 380px;
      height: 150px;
      border-radius: 4px;
      border: 1px solid $color-borderline;
      margin-right: 30px;
      margin-bottom: 20px;
      padding: 20px;
      @include click-button();
      transition: all .2s ease-in-out;
      &:hover {
        box-shadow: 0 4px 9px 0 rgba(115, 115, 115, 0.2), 0 5px 8px 0 rgba(228, 228, 228, 0.5);
        .card-title {
          .card-title-edit {
            visibility: visible;
          }
        }
      }

      display: flex;
      flex-direction: column;
      .card-title {
        flex: 0 0 auto;
        margin-bottom: 20px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

        display: flex;
        align-items: center;
        .card-title-text {
          flex: 1;
          font-size: 20px;
          line-height: 24px;
          color: #333333;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
        .card-title-edit {
          flex: 0 0 24px;
          height: 24px;
          visibility: hidden;
          @include click-button();

          display: flex;
          align-items: center;
          justify-content: center;

          &:hover {
            background-color: #f7f7f7;
            border-radius: 12px;
          }
        }
      }
      .card-description {
        @include font-14px();
        color: #666666;
        word-break: break-all;
      }
    }
  }
}
</style>
