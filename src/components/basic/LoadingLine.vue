<template>
  <div class="running-gif">
    <div class="loader">
      <div class="loader-inner line-scale-pulse-out-rapid">
        <div :style="style"></div>
        <div :style="style"></div>
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
      width: `${4 * this.magnify}px`,
      height: `${35 * this.magnify}px`,
      borderRadius: `${2 * this.magnify}px`,
      margin: `${2 * this.magnify}px`,
    };
  },
};
</script>
<style scoped>
@-webkit-keyframes line-scale-pulse-out-rapid {
    0% {
        -webkit-transform: scaley(1);
        transform: scaley(1);
    }
    80% {
        -webkit-transform: scaley(0.3);
        transform: scaley(0.3);
    }
    90% {
        -webkit-transform: scaley(1);
        transform: scaley(1);
    }
}

@keyframes line-scale-pulse-out-rapid {
    0% {
        -webkit-transform: scaley(1);
        transform: scaley(1);
    }
    80% {
        -webkit-transform: scaley(0.3);
        transform: scaley(0.3);
    }
    90% {
        -webkit-transform: scaley(1);
        transform: scaley(1);
    }
}

.line-scale-pulse-out-rapid > div {
    background-color: #1875F0;
    width: 4px;
    height: 35px;
    border-radius: 2px;
    margin: 2px;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    display: inline-block;
    vertical-align: middle;
    -webkit-animation: line-scale-pulse-out-rapid 0.9s -0.5s infinite cubic-bezier(0.11, 0.49, 0.38, 0.78);
    animation: line-scale-pulse-out-rapid 0.9s -0.5s infinite cubic-bezier(0.11, 0.49, 0.38, 0.78);
}
.line-scale-pulse-out-rapid > div:nth-child(2), .line-scale-pulse-out-rapid > div:nth-child(4) {
    -webkit-animation-delay: -0.25s !important;
    animation-delay: -0.25s !important;
}
.line-scale-pulse-out-rapid > div:nth-child(1), .line-scale-pulse-out-rapid > div:nth-child(5) {
    -webkit-animation-delay: 0s !important;
    animation-delay: 0s !important;
}

@-webkit-keyframes line-spin-fade-loader {
    50% {
        opacity: 0.3;
    }
    100% {
        opacity: 1;
    }
}

@keyframes line-spin-fade-loader {
    50% {
        opacity: 0.3;
    }
    100% {
        opacity: 1;
    }
}

.line-spin-fade-loader {
    position: relative;
    top: -10px;
    left: -4px;
}
.line-spin-fade-loader > div:nth-child(1) {
    top: 20px;
    left: 0;
    -webkit-animation: line-spin-fade-loader 1.2s -0.84s infinite ease-in-out;
    animation: line-spin-fade-loader 1.2s -0.84s infinite ease-in-out;
}
.line-spin-fade-loader > div:nth-child(2) {
    top: 13.63636px;
    left: 13.63636px;
    -webkit-transform: rotate(-45deg);
    transform: rotate(-45deg);
    -webkit-animation: line-spin-fade-loader 1.2s -0.72s infinite ease-in-out;
    animation: line-spin-fade-loader 1.2s -0.72s infinite ease-in-out;
}
.line-spin-fade-loader > div:nth-child(3) {
    top: 0;
    left: 20px;
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
    -webkit-animation: line-spin-fade-loader 1.2s -0.6s infinite ease-in-out;
    animation: line-spin-fade-loader 1.2s -0.6s infinite ease-in-out;
}
.line-spin-fade-loader > div:nth-child(4) {
    top: -13.63636px;
    left: 13.63636px;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
    -webkit-animation: line-spin-fade-loader 1.2s -0.48s infinite ease-in-out;
    animation: line-spin-fade-loader 1.2s -0.48s infinite ease-in-out;
}
.line-spin-fade-loader > div:nth-child(5) {
    top: -20px;
    left: 0;
    -webkit-animation: line-spin-fade-loader 1.2s -0.36s infinite ease-in-out;
    animation: line-spin-fade-loader 1.2s -0.36s infinite ease-in-out;
}
.line-spin-fade-loader > div:nth-child(6) {
    top: -13.63636px;
    left: -13.63636px;
    -webkit-transform: rotate(-45deg);
    transform: rotate(-45deg);
    -webkit-animation: line-spin-fade-loader 1.2s -0.24s infinite ease-in-out;
    animation: line-spin-fade-loader 1.2s -0.24s infinite ease-in-out;
}
.line-spin-fade-loader > div:nth-child(7) {
    top: 0;
    left: -20px;
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
    -webkit-animation: line-spin-fade-loader 1.2s -0.12s infinite ease-in-out;
    animation: line-spin-fade-loader 1.2s -0.12s infinite ease-in-out;
}
.line-spin-fade-loader > div:nth-child(8) {
    top: 13.63636px;
    left: -13.63636px;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
    -webkit-animation: line-spin-fade-loader 1.2s 0s infinite ease-in-out;
    animation: line-spin-fade-loader 1.2s 0s infinite ease-in-out;
}
.line-spin-fade-loader > div {
    background-color: #fff;
    /* border-radius: 2px; */
    margin: 2px;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    position: absolute;
    width: 5px;
    height: 15px;
}
</style>
