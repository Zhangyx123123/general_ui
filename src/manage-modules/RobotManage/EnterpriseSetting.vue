<template>
  <div>
    <div class="card h-fill w-fill">
      <nav-bar class='nav-bar' :options="getNavbarOption()" v-model="currentPage"></nav-bar>
      <div class="content">
        <div class="title-row">
          {{ $t('management.enterprise_icon_setting') }}
        </div>
        <icon-setting
          class="icon-setting"
          :name="$t('management.enterprise_lu_icon')"
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
          @upload="handleIconUpload('favicon', $event, 'faviconSetting')"
          @remove="handleIconRemove('favicon')"
          @updateName="handleNameUpdate"
          ref="faviconSetting">
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
import { mapGetters } from 'vuex';
import IconSetting from '@/manage-modules/_components/IconSettingRow';
import systemAPI from '@/api/system';
import mixin from './_store/mixin';

export default {
  path: 'enterprise-setting',
  name: 'enterprise-setting',
  privCode: 'manage_robot',
  mixins: [mixin],
  components: { IconSetting },
  api: systemAPI,
  data() {
    return {
      currentPage: 'enterpriseSetting',
      appLogoPath: '',
      faviconLogoPath: '',
    };
  },
  computed: {
    ...mapGetters([
      'enterpriseID',
    ]),
  },
  watch: {
    currentPage(val) {
      if (val === 'robotList') {
        this.$router.push('robot-manage');
      }
    },
  },
  methods: {
    handleIconUpload(type, file, refName) {
      this.$api.uploadIcon(type, this.enterpriseID, file).finally(() => {
        this.loadLogos();
        this.$refs[refName].$emit('clearFile');
      });
    },
    handleIconRemove(type) {
      this.$api.deleteIcon(type, this.enterpriseID).finally(() => {
        this.loadLogos();
      });
    },
    handleNameUpdate(name) {
      console.log(name);
    },
    loadLogos() {
      const that = this;
      this.$api.getIcon('app', that.enterpriseID).then(() => {
        that.appLogoPath = that.$api.getIconURL('app', that.enterpriseID);
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
      this.$api.getIcon('favicon', that.enterpriseID).then(() => {
        that.faviconLogoPath = that.$api.getIconURL('favicon', that.enterpriseID);
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
