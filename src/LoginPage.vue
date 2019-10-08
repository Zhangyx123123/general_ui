<template>
  <div class='login-page'>
    <div class='container'>
      <div class='logo'>
        <div id="app-logo" :class="$i18n.locale" ref="logo"></div>
      </div>
      <div class="input-row">
        <input ref="user" type="text" v-model="input.account" :placeholder="$t('login.account_place')" @keydown="passwordKey">
      </div>
      <div class="input-row">
        <input ref="password" type="password" v-model="input.password"
        :placeholder="$t('login.password_place')" @keydown="passwordKey"
        autocomplete="off">
      </div>
      <div class="input-row captcha-row" v-if="useCaptcha">
        <img :src="captchaSrc">
        <input ref="captcha" type="text" v-model="input.captcha"
        :placeholder="$t('login.captcha_place')"
        :maxlength="captchaLength"
        @keydown="passwordKey"
        autocomplete="off">
      </div>
      <div class="input-button-row">
        <loading-button main fill @click="submit" ref="btn">
          <template slot="init">{{ $t('login.login') }}</template>
          <template slot="loading">{{ $t('login.login') }}ing</template>
        </loading-button>
      </div>
      <div class="message">
        {{ $t('login.contact_sm') }}
      </div>
    </div>
    <notification></notification>
  </div>
</template>

<script>
import misc from '@/utils/js/misc';
import Icon from './components/basic/Icon';
import LoadingButton from './components/basic/LoadingButton';
import api from './api/system';

export default {
  name: 'login',
  components: {
    icon: Icon,
    LoadingButton,
  },
  api,
  data() {
    return {
      input: {
        account: '',
        password: '',
      },
      hasError: false,
      i18n: {},
      redirect: '',
      useCaptcha: false,
      captchaSrc: '',
      captchaLength: 6,
    };
  },
  methods: {
    submit() {
      const that = this;
      that.$refs.user.blur();
      that.$refs.password.blur();
      if (!that.input.account || !that.input.password) {
        that.$notify({ text: that.$t('login.notify_input'), type: 'fail' });
        if (!that.input.account) {
          that.$refs.user.focus();
        } else {
          that.$refs.password.focus();
        }
        return;
      }
      that.$refs.btn.$emit('loading');
      that.$login(that.input).then((result) => {
        if (result.authV2 === undefined) {
          return;
        }

        const info = result.authV2.info;
        if (info === undefined) {
          return;
        }

        if (info.type === 0) {
          window.location = '/#/manage/enterprise-manage';
        } else if (info.product && info.product.indexOf('IM') >= 0) {
          window.location = '/im-admin/imIndex';
        } else {
          window.location = '/#/manage/robot-manage';
        }
      }, (err) => {
        if (err.response.status === 400 && that.useCaptcha) {
          that.$notify({ text: that.$t('login.validate_fail'), type: 'fail' });
          if (that.$refs.captcha) {
            that.$refs.captcha.focus();
          }
        } else {
          that.reloadCaptcha();
          that.$notify({ text: that.$t('login.notify_fail'), type: 'fail' });
          that.$refs.user.focus();
        }
      })
      .finally(() => {
        that.$refs.btn.$emit('reset');
      });
    },
    passwordKey(e) {
      if (e.keyCode === 13) {
        this.submit();
      }
    },
    reloadCaptcha() {
      const that = this;
      that.captchaSrc = '';
      that.input.captcha = '';
      that.$api.getEnv().then((env) => {
        if (env.USE_CAPTCHA === '1' || env.USE_CAPTCHA === 'true' || env.USE_CAPTCHA === true) {
          that.useCaptcha = true;
          return that.$api.getCaptcha().then((rsp) => {
            that.captchaSrc = rsp.data;
            that.input.captchaID = rsp.id;
          });
        }
        return new Promise((r) => {
          setTimeout(r(), 0);
        });
      });
    },
    loadLogo() {
      const that = this;
      that.$api.getIcon('login').then(() => {
        that.$refs.logo.style.backgroundImage = `url("${that.$api.getIconURL('login')}")`;
      }, () => {
        that.$refs.logo.classList.add('default');
      });
      that.$api.getIcon('favicon').then(() => {
        misc.changeFavicon(that.$api.getIconURL('favicon'));
      });
    },
  },
  mounted() {
    const that = this;
    that.$refs.user.focus();
    const querys = document.location.search.substr(1).split('&');
    const queryMap = {};
    querys.forEach((query) => {
      const idx = query.indexOf('=');
      queryMap[query.substr(0, idx)] = query.substr(idx + 1);
    });
    if (Object.keys(queryMap).indexOf('invalid') >= 0) {
      that.$notifyFail(that.$t('login.auth_expire'));
    }
    if (Object.keys(queryMap).indexOf('redirect') >= 0) {
      that.redirect = decodeURIComponent(queryMap.redirect);
    }
    that.reloadCaptcha();
    that.loadLogo();
  },
};
</script>

<style lang="scss">
@import "styles/reset.scss";

input:-webkit-autofill {
  -webkit-box-shadow:0 0 0 50px white inset;
  -webkit-text-fill-color: #333;
}
::-webkit-input-placeholder {
  text-align: center;
}

:-moz-placeholder { /* Firefox 18- */
  text-align: center;  
}

::-moz-placeholder {  /* Firefox 19+ */
  text-align: center;  
}

:-ms-input-placeholder {  
  text-align: center; 
}
div {
  box-sizing: border-box;
}
.login-page {
  font-family: PingFangHK-Regular, PingFangSC, 'Microsoft YaHei', 'Microsoft JhengHei';
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;

  height: 100vh;
  width: 100vw;
  .container {
    flex:  0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 240px;

    .logo {
      flex: 0 0 auto;
      margin-bottom: 40px;

      display: flex;
      justify-content: center;
      #app-logo {
        width: 200px;
        height: 120px;
        background-repeat: no-repeat;
        background-position: center center;
        background-color: transparent;
        background-size: 200px 120px;
        &.default.zh-cn {
          background-image: url("/static/emotibot_logo_chs.svg");
        }
        &.default.zh-tw {
          background-image: url("/static/emotibot_logo_cht.svg");
        }
      }
    }
    .input-row {
      flex: 0 0 28px;
      border: solid 1px $color-borderline;
      border-radius: 2px;

      display: flex;
      align-items: stretch;
      justify-content: stretch;
      margin-bottom: 10px;
      input {
        text-align: center;
        font-size: 14px;
        line-height: 16px;
        box-sizing: border-box;
        display: inline-block;
        padding: 0 8px;
        width: 100%;
        outline: none;
        border: none;
        background: none;
        &::placeholder {
          color: #999999;
        }
      }
      &.captcha-row {
        border: none;
        justify-content: space-between;
        input {
          border: solid 1px $color-borderline;
          border-radius: 2px;
          width: calc(50% - 4px);
        }
        img {
          width: 50%;
          border: solid 1px $color-borderline;
          border-radius: 2px;
        }
      }
    }
    .input-button-row {
      flex: 0 0 auto;
      margin-top: 10px;
      margin-bottom: 15px;

      display: flex;
      align-items: center;
      justify-content: center;
    }
    .message {
      font-size: 12px;
      text-align: center;
      color: #666666;
    }
  }
  div.loading {
    @media screen and (max-width: $break-small) {
      left: 0;
      top: $page-header-height;
      width: 100vw
    }
    position: fixed;
    height: 100vh;
    width: 100vw;
    background: rgba(0%, 0%, 0%, 0.6);
    color: white;
    font-size: 1.5em;
    display: flex;
    align-items: center;
    justify-content: center;
    @keyframes spin {
      0% { transform: rotate(0deg); }
      25% { transform: rotate(192deg); }
      50% { transform: rotate(278deg); }
      75% { transform: rotate(336deg); }
      100% { transform: rotate(360deg); }
    }
    .loader {
      margin-right: 10px;
      border: 8px solid #f3f3f3; /* Light grey */
      border-top: 8px solid #3498db; /* Blue */
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 2s linear infinite;
    }
  }
}
</style>
