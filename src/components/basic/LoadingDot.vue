<template>
  <div class="loading-gif">
    <div class="loader">
      <div class="loader-inner ball-beat">
        <div :style="style"></div>
        <div :style="style"></div>
        <div :style="style"></div>
      </div>
    </div>
  </div>  
</template>
<script>
export default {
  props: {
    magnify: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      style: {},
    };
  },
  mounted() {
    this.style = {
      width: `${15 * this.magnify}px`,
      height: `${15 * this.magnify}px`,
      margin: `${2 * this.magnify}px`,
    };
  },
};
</script>
<style scoped>
.loading-gif.newloading {
    display: none;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    background: rgba(250, 250, 250, 0.5);
    margin-top: 0;
    z-index: 5;
}
/*加载动画样式开始*/
@-webkit-keyframes ball-beat {
    50% {
        opacity: 0.2;
        -webkit-transform: scale(0.75);
        transform: scale(0.75); }
    100% {
        opacity: 1;
        -webkit-transform: scale(1);
        transform: scale(1); } }

@keyframes ball-beat {
    50% {
        opacity: 0.2;
        -webkit-transform: scale(0.75);
        transform: scale(0.75); }
    100% {
        opacity: 1;
        -webkit-transform: scale(1);
        transform: scale(1); } }

.ball-beat > div {
    background-color: #3389ee;
    width: 15px;
    height: 15px;
    border-radius: 100%;
    margin: 2px;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    display: inline-block;
    -webkit-animation: ball-beat 0.7s 0s infinite linear;
    animation: ball-beat 0.7s 0s infinite linear;
}
.ball-beat > div:nth-child(2n-1) {
    -webkit-animation-delay: -0.35s !important;
    animation-delay: -0.35s !important;
}

</style>

