<template>
  <div class="wechat-enterprise-wrapper">
    <img src="../../../assets/images/wx_enterprise.svg">
    <div class="input-area">
      <div class="line">
        <span class="input-label">{{$t('robot_setting.enterprise')}}ID</span>
        <info-input v-model="corpId" :maxlength="50"
        :msg="$t('robot_setting.tip_enterprise')"
        :placeholder="$t('robot_setting.enter_enterprise_id')"></info-input>
      </div>
      <div class="line">
        <span class="input-label">AgentID</span>
        <info-input v-model="agentId" :maxlength="20"
        :msg="$t('robot_setting.tip_agent')"
        :placeholder="$t('robot_setting.search_keyword')"></info-input>
      </div>
      <div class="line">
        <span class="input-label">Secret</span>
        <info-input v-model="secret" :maxlength="100"
        :msg="$t('robot_setting.tip_secret')"
        :placeholder="$t('robot_setting.search_keyword')"></info-input>
      </div>
      <text-button class="generate-btn" :button-type="enableGenerate?'fill':'disable'"
      @click="handleBindEntWechat">{{$t('robot_setting.generate')}}</text-button>
      <p class="genereate-tip1">{{$t('robot_setting.generate_tip1')}}</p>
    </div>
    <div class="result-area">
      <span class="genereate-tip2">{{$t('robot_setting.generate_tip2')}}</span>
      <span class="check-guide" @click="handleCheckIntegrationGuide">{{$t('robot_setting.check_guide')}}</span>
      <p class="result-title">{{$t('robot_setting.generate_info')}}</p>
      <div class="line">
        <span class="label">URL</span>
        <input id="generatedURL" v-model="generatedURL" type="password" disabled />
        <span class="copy-btn" @click="handleCopyToClipboard(generatedURL)">{{$t('general.copy')}}</span>
      </div>
      <div class="line">
        <span class="label">Token</span>
        <input id="generatedToken" v-model="generatedToken" type="password" disabled />
        <span class="copy-btn" @click="handleCopyToClipboard(generatedToken)">{{$t('general.copy')}}</span>
      </div>
      <div class="line">
        <span class="label">EncodingASEKey</span>
        <input id="generatedASEKey" v-model="generatedASEKey" type="password" disabled />
        <span class="copy-btn" @click="handleCopyToClipboard(generatedASEKey)">{{$t('general.copy')}}</span>
      </div>
      <input id="copyInputBox" />
      <p class="check-bind-wechat" @click="popUpEnterpriseWechatList">
      {{$t('general.view')}}{{$t('robot_setting.binded_enterprise_list')}}</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import misc from '@/utils/js/misc';
import WechatEnterpriseList from './WechatEnterpriseList';
import robotAPI from '../_api/robot';

export default {
  api: robotAPI,
  data() {
    return {
      enterpriseList: [],
      corpId: '',
      agentId: '',
      secret: '',
      generatedURL: '',
      generatedToken: '',
      generatedASEKey: '',
    };
  },
  created() {
    this.getEnterpriseWechatList();
  },
  computed: {
    ...mapGetters([
      'robotID',
    ]),
    enableGenerate() {
      return this.corpId && this.agentId && this.secret;
    },
  },
  methods: {
    getEnterpriseWechatList() {
      this.$api.getEnterpriseWechatList().then((res) => {
        this.enterpriseList = res;
      });
    },
    handleCheckIntegrationGuide() {
      this.$api.checkIntegrationGuide();
    },
    handleBindEntWechat() {
      if (!this.enableGenerate) {
        return;
      }
      if (this.enterpriseList.length === 1) {
        this.$notifyWarn(this.$t('robot_setting.enterprise_maximum'));
        return;
      }
      this.$api.bindEnterpriseWechat(this.corpId, this.agentId,
        this.secret).then((res) => {
          this.generatedURL = res.url;
          this.generatedToken = res.token;
          this.generatedASEKey = res['encoded-aes'];
        });
    },
    popUpEnterpriseWechatList() {
      this.$emit('cancel');
      const options = {
        title: this.$t('robot_setting.binded_enterprise_list'),
        component: WechatEnterpriseList,
        data: {
          readonly: true,
        },
        buttons: ['cancel', 'ok'],
        validate: false,
      };
      this.$pop(options);
    },
    // 复制链接内容到剪切板
    handleCopyToClipboard(text) {
      misc.copyToClipboard(text);
    },
  },
};
</script>

<style lang="scss" scoped>
.wechat-enterprise-wrapper{
  width: 480px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 16px;
  border-top: 1px solid $color-borderline-disabled;
  border-bottom: 1px solid $color-borderline-disabled;
  img{
    width: 64px;
    height: 64px;
    margin-bottom: 10px;
  }
  .input-area{
    width: 100%;
    border-bottom: 1px solid $color-borderline;
    .line{
      display: flex;
      margin-bottom: 10px;
      .input-label{
        width: 56px;
        @include font-14px-line-height-28px();
      }
      .info-input{
        margin-left: 10px;
        flex: 1;
      }
    }
    .generate-btn{
      margin: 10px 0px;
      width: 100%;
    }
    .genereate-tip1{
      color: $color-font-mark;
      margin-bottom: 20px;
    }
  }
  .result-area{
    padding-top: 35px;
    position: relative;
    .genereate-tip2{
      @include font-14px();
    }
    .check-guide{
      @include font-14px();
      color: $app-active-color;
      cursor: pointer;
    }
    .result-title{
      @include font-14px-line-height-28px();
      color: $color-font-active;
    }
    .line{
      margin-top: 10px;
      display: flex;
      .label{
        width: 118px;
        @include font-14px-line-height-28px();
      }
      input{
        flex: 1;
      }
      .copy-btn{
        @include font-14px-line-height-28px();
        color: $color-primary;
        margin-left: 10px;
        cursor: pointer;
      }
    }
    #copyInputBox{
      z-index: -1;
      position: absolute;
      bottom: 80px;
      opacity: 0;
    }
    .check-bind-wechat{
      @include font-14px-line-height-28px();
      color: $color-primary;
      margin-top: 20px;
      cursor: pointer;
    }
  }
}
</style>