<template>
  <div v-if="show" class="tooltip" :style="style" :class="{absolute,'error': error}" ref="tooltip">
    <div class="tooltip-text" v-if="msg !== '' && (buttons === undefined || buttons.length <= 0)">
      {{ msg }}
    </div>
    <div class="tooltip-text" v-if="msgs.length > 0 && (buttons === undefined || buttons.length <= 0)">
      <template v-for="(m, i) in msgs">
        <p :key="i">{{ m }}</p>
      </template>
    </div>
    <div class="tooltip-form" v-if="buttons !== undefined && buttons.length > 0">
      <div class="tooltip-info">
        <div class="tooltip-icon" v-if="iconType && iconType !== ''">
          <icon :icon-type="iconType" :size=12 />
        </div>
        <div class="tooltip-text">
          {{ msg }}
        </div>
      </div>
      <div class="tooltip-buttons">
        <text-button v-for="button in buttons" :key="button.msg"
          @click="clickButton(button)"
          :button-type="button.buttonType ? button.buttonType : 'default'">
          {{ button.msg }}
        </text-button>
      </div>
    </div>
    <div class="tooltip-triangle" :style="triangleStyle"></div>
  </div>
</template>

<script>
const tooltipTypes = ['default', 'error'];

export default {
  name: 'tooltip',
  props: {
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    msg: {
      type: String,
      default: '',
    },
    msgs: {
      type: Array,
      default() { return []; },
    },
    leftOffset: {
      type: Number,
      default: 0,
    },
    topOffset: {
      type: Number,
      default: 0,
    },
    /** Default to show tooltip on right hand side.
    /*  Use alignLeft to show tooltip on left hand side */
    alignLeft: {
      type: Boolean,
      default: false,
    },

    buttons: {
      type: Array,
      default() { return []; },
    },
    tooltipType: {
      type: String,
      default: 'default',
      validator: value => tooltipTypes.indexOf(value) > -1,
    },
    iconType: {
      type: String,
      default: '',
    },
    data: {
      type: Object,
      default: undefined,
    },
    absolute: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      show: false,
      showX: 0,
      showY: 0,
      elemWidth: 0,
    };
  },
  computed: {
    style() {
      if (this.absolute) {
        return {
          right: `${this.showX}px`,
          top: `${this.showY}px`,
        };
      }
      return {
        top: `${this.showY}px`,
        left: `${this.showX}px`,
      };
    },
    triangleStyle() {
      const left = (this.elemWidth / 2) - 5; // minus half triangle width to centeralize triangle
      return {
        left: `${left}px`,
      };
    },
    error() {
      return this.tooltipType === 'error';
    },
  },
  methods: {
    clickButton(button) {
      const that = this;
      if (button.closeAfterClick) {
        that.show = false;
      }
      if (button.callback) {
        button.callback(that.data);
      }
    },
  },
  mounted() {
    const that = this;

    that.$on('show', (pos) => {
      that.show = true;
      that.$nextTick(() => {
        if (pos) {
          that.x = pos.x;
          that.y = pos.y;
        }
        that.elemWidth = that.$el.clientWidth;
        if (that.alignLeft) {
          that.showX = (that.x - that.$el.clientWidth) + that.leftOffset;
          that.showY = (that.y - that.$el.clientHeight - 8) + that.topOffset;
        } else {
          that.showX = that.x + that.leftOffset;
          that.showY = (that.y - that.$el.clientHeight - 8) + that.topOffset;
        }
        if (that.absolute) {
          that.showX = pos.x;
          that.showY = pos.y - this.$el.getBoundingClientRect().height - 5;
        }
      });
    });
    that.$on('hide', () => {
      that.show = false;
    });
  },
};
</script>

<style lang='scss' scoped>
.tooltip {
  &.absolute {
    position: absolute;
  }
  position: fixed;
  z-index: 10;
  word-break: break-all;
  white-space: normal;  // explicitly set normal to avoid being rewritten by parent

  & > .tooltip-text {
    max-width: 300px;
  }
  font-size: 12px;
  line-height: 18px;
  border-radius: 2px;
  color: #FFFFFF;
  background-color: rgba(0, 0, 0, 0.85);
  // box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2);
  padding: 5px 8px;
  cursor: default;

  .tooltip-form {
    background-color: #FFFFFF;
    color: #000000;
    .tooltip-info {
      display: flex;
      .tooltip-icon {
        flex: 0 0 auto;
      } 
      .tooltip-text {
        padding: 10px 0;
        flex: 0 1 180px;
        &:not(:first-child) {
          margin-left: 8px;
        }
      }
    }
    .tooltip-buttons {
      display: flex;

      & > div {
        &:not(:first-child) {
          margin-left: 10px;
        }
      }
    }
  }

  &.error {
    z-index: 10;
    background-color: #FEF3F0;
    border-radius: 4px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
    & > .tooltip-text {
      color: #F76260;
    }
    .tooltip-triangle {
      position: absolute;
      left: 25px;
      top: 100%;
      width: 16px;
      height: 16px;
      overflow: hidden;
      &::after{
        content: "";
        background: #FEF3F0;
        position: absolute;
        transform: rotate(45deg);
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
        width: 8px;
        height: 8px;
        top: -4px;
        left: 4px;
      }
    }
  }
}
</style>