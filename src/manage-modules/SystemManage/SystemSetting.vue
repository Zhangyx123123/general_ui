<template>
  <div>
    <div class="card h-fill w-fill">
      <nav-bar class='nav-bar' :options="getNavbarOption()" v-model="currentPage"></nav-bar>
      <div class="content">
        <div class="title-row">
          {{ $t('management.system_icon_setting') }}
        </div>
        <icon-setting
          class="icon-setting"
          :name="$t('management.login_icon')"
          icon-path="/static/login_icon_ex.png"
          :upload-info="$t('management.login_icon_info')"
          @upload="handleIconUpload('login', $event, 'loginLogoSetting')"
          @remove="handleIconRemove('login')"
          ref="loginLogoSetting">
          <template slot="current" v-if="loginLogoPath !== ''">
            <div class="login-logo" ref="loginLogo"></div>
          </template>
        </icon-setting>
        <icon-setting
          class="icon-setting"
          :name="$t('management.system_lu_icon')"
          icon-path="/static/enterprise_icon_ex.png"
          :upload-info="$t('management.enterprise_lu_icon_info')"
          @upload="handleIconUpload('app', $event, 'appLogoSetting')"
          @remove="handleIconRemove('app')"
          ref="appLogoSetting">
          <template slot="current" v-if="appLogoPath !== ''">
            <div class="app-logo" ref="appLogo"></div>
          </template>
        </icon-setting>
        <icon-setting
          class="icon-setting"
          :name="$t('management.browser_page_icon')"
          icon-path="/static/browser_icon_ex.png"
          :upload-info="$t('management.browser_page_icon_info')"
          current-name="123"
          @upload="handleIconUpload('favicon', $event, 'faviconLogoSetting')"
          @remove="handleIconRemove('favicon')"
          @updateName="handleNameUpdate"
          ref="faviconLogoSetting">
          <template slot="current" v-if="faviconLogoPath !== ''">
            <div class="favicon-bg">
              <div class="favicon-content">
                <div class="favicon-logo" ref="faviconLogo"></div>
                <div>
                  {{ $t('general.system_name_default') }}
                </div>
              </div>
            </div>
          </template>
        </icon-setting>
      </div>
    </div>
  </div>
</template>

<script>
import IconSetting from '@/manage-modules/_components/IconSettingRow';
import systemAPI from '@/api/system';
import mixin from './_store/mixin';

export default {
  path: 'system-setting',
  name: 'system-setting',
  privCode: 'manage_enterprise',
  mixins: [mixin],
  components: { IconSetting },
  api: systemAPI,
  data() {
    return {
      currentPage: 'systemSetting',
      loginLogoPath: '',
      appLogoPath: '',
      faviconLogoPath: '',
    };
  },
  watch: {
    currentPage(val) {
      this.goPage(val);
    },
  },
  methods: {
    handleIconUpload(type, file, refName) {
      const that = this;
      that.$api.uploadIcon(type, '', file).finally(() => {
        that.loadLogos();
        that.$refs[refName].$emit('clearFile');
        that.$notify({ text: `${that.$t('general.upload')}${that.$t('general.success')}` });
      });
    },
    handleIconRemove(type) {
      this.$api.deleteIcon(type, '').finally(() => {
        this.loadLogos();
      });
    },
    handleNameUpdate(name) {
      console.log(name);
    },
    loadLogos() {
      const that = this;
      this.$api.getIcon('login').then(() => {
        that.loginLogoPath = that.$api.getIconURL('login');
        that.$refs.loginLogoSetting.$emit('showCurrent');
        that.$nextTick(() => {
          that.$refs.loginLogo.style.backgroundImage = `url("${that.loginLogoPath}")`;
        });
      }, () => {
        that.$refs.loginLogoSetting.$emit('hideCurrent');
      })
      .finally(() => {
        that.$root.$emit('reload-logo');
      });
      this.$api.getIcon('app').then(() => {
        that.appLogoPath = that.$api.getIconURL('app');
        that.$refs.appLogoSetting.$emit('showCurrent');
        that.$nextTick(() => {
          that.$refs.appLogo.style.backgroundImage = `url("${that.appLogoPath}")`;
        });
      }, () => {
        that.$refs.appLogoSetting.$emit('hideCurrent');
      })
      .finally(() => {
        that.$root.$emit('reload-logo');
      });
      this.$api.getIcon('favicon').then(() => {
        that.faviconLogoPath = that.$api.getIconURL('favicon');
        that.$refs.faviconSetting.$emit('showCurrent');
        that.$nextTick(() => {
          that.$refs.faviconLogo.style.backgroundImage = `url("${that.faviconLogoPath}")`;
        });
      }, () => {
        that.$refs.faviconSetting.$emit('hideCurrent');
      })
      .finally(() => {
        that.$root.$emit('reload-logo');
      });
    },
  },
  mounted() {
    this.loadLogos();
  },
};

</script>

<style lang="scss" scoped>
.content {
  padding: 20px;
  .title-row {
    @include font-16px();
    margin-bottom: 20px;
    color: #333333;
  }
  .icon-setting:not(:last-child) {
    margin-bottom: 80px;
  }
  .login-logo {
    height: 120px;
    width: 200px;
    background-color: transparent;
    background-size: 200px 120px;
    border: 1px solid #dbdbdb;
  }
  .app-logo {
    height: 50px;
    width: 150px;
    background-color: $page-menu-color;
    background-size: 150px 50px;
    border: 1px solid #dbdbdb;
  }
  .favicon-bg {
    width: 290px;
    height: 76px;
    background-color: transparent;
    background-size: 290px 76px;
    background-image: url("/static/favicon_bg.png");
    position: relative;

    .favicon-content {
      position: absolute;
      top: 16px;
      left: 19px;

      display: flex;
      align-items: center;
      .favicon-logo {
        height: 20px;
        width: 20px;
        margin-right: 5px;
        background-color: transparent;
        background-size: 20px 20px;
      }
    }
  }
}
</style>
