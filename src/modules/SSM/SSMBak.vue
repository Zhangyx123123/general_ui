<template>
  <div>
    <iframe ref="iframe"></iframe>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import api from '@/api/BF';

export default {
  path: 'ssm',
  privCode: 'ssm',
  displayNameKey: 'ssm',
  name: 'ssm',
  isIFrame: true,
  api,
  computed: {
    ...mapGetters([
      'robotID',
      'userID',
    ]),
  },
  methods: {
    checkIFrameMsg(e) {
      if (e.data === 'open-chat-test') {
        this.$root.$emit('open-chat-test');
      } else if (e.data === 'close-chat-test') {
        this.$root.$emit('close-chat-test');
      }
    },
  },
  mounted() {
    this.$api.focusRobot(this.userID, this.robotID);
    window.addEventListener('message', this.checkIFrameMsg);
    localStorage.removeItem('CONFIGS');
    this.$refs.iframe.src = '/BF/index.html#index';
  },
  beforeDestroy() {
    window.removeEventListener('message', this.checkIFrameMsg);
  },
};
</script>

<style lang="scss" scoped>
iframe {
  width: calc(100% + 150px);
  height: calc(100% + 50px);
  top: -50px;
  left: -150px;
  position: relative;
  min-width: 800px;
}
</style>
