<template>
  <div class="wx-subs-wrapper">
    <img src="../../../assets/images/wx_subscription.svg">
    <text-button
      class="auth-btn"
      :button-type="'fill'"
      @click="handleClickAuthorize">
      {{$t('robot_setting.wx_authority_platform')}}
    </text-button>
    <div class="tips" v-html="$t('robot_setting.wx_authority_tips')"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import robotAPI from '../_api/robot';

export default {
  api: robotAPI,
  computed: {
    ...mapGetters([
      'robotID',
    ]),
  },
  methods: {
    handleClickAuthorize() {
      this.$api.bindWechatOffcialAccount(this.robotID);
    },
  },
};
</script>

<style lang="scss" scoped>
.wx-subs-wrapper{
  width: 480px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border-top: 1px solid $color-borderline-disabled;
  border-bottom: 1px solid $color-borderline-disabled;
  img{
    width: 64px;
    height: 64px;
    margin-bottom: 30px;
  }
  .auth-btn{
    margin-bottom: 30px;
  }
  .tips{
    margin-bottom: 58px;
    @include font-14px();
  }
} 
</style>