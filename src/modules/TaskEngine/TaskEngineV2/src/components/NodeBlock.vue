<template lang="html">
<div class="node-block" :style="style"
  @mouseover="mouseOverNode = true"
  @mouseout="mouseOverNode = false">
  <div class="label-node-name">
    {{node.nodeName}}
  </div>
  <div class="info-row">
    <div class="rounded">
      {{nodeTypeName}}
    </div>
    <div 
      class="rounded relative"
      ref="exitIcon"
      v-if="hasExitConnection"
      @mouseover="tooltipMouseover($event, 'endStyle')"
      @mouseleave="endStyle.visibility = 'hidden'">
      END
      <div class="tooltip" :style="endStyle">
        <div class="text">
          {{ endTooltip.msg }}
        </div>
      </div>
    </div>
    <div
      class="warning-icon"
      ref="warningIcon"
      v-if="warningTooltipValue.msgs && warningTooltipValue.msgs.length > 0"
      @mouseover="tooltipMouseover($event, 'warningIconStyle')"
      @mouseleave="warningIconStyle.visibility = 'hidden'">
      <icon icon-type="info_warning" :size=22></icon>
      <div class="tooltip" :style="warningIconStyle">
        <div class="text">
          <p v-for="(m, i) in warningTooltipValue.msgs" :key="i">
            {{ m }}
          </p>
        </div>
      </div>
    </div>
  </div>
  <div class="button-row">
    <div v-if="node.nodeType !== 'entry'" class="transparent-button" @click="deleteNode()">
      <span>{{deleteText}}</span>
    </div>
    <span
      class="transparent-button"
      v-if="node.nodeType !== 'entry'"
      @click="copyNode()">
      {{copyText}}
    </span>
    <text-button
      class="button button-edit-node"
      button-type='primary'
      @click="editNode()">
      {{$t("general.edit")}}
    </text-button>
  </div>
  <div class="edge-slot edge-slot-from"
    id="edgeSlotFrom"
    ref="edgeSlotFrom"
    v-if="linking === false || isSrcNode === true"
    :class="{'is-src-node': isSrcNode, 'mouse-over-node': mouseOverNode}"
    @mousedown.stop.prevent="srcSlotMouseDown">
  </div>
  <div class="edge-slot edge-slot-to"
    id="edgeSlotTo"
    ref="edgeSlotTo"
    v-if="linking === true && isSrcNode === false && node.nodeType !== 'entry'"
    @mouseup.stop.prevent="dstSlotMouseUp($event)"
    @mouseenter.stop="dstSlotMouseEnter()"
    @mouseleave.stop="dstSlotMouseLeave()">
  </div>
</div>
</template>

<script>
import NodeEditPage from './NodeEditPage';
import optionConfig from '../_utils/optionConfig';

export default {
  name: 'node-block',
  props: {
    x: {
      type: Number,
      default: 0,
      validator(val) {
        return typeof val === 'number';
      },
    },
    y: {
      type: Number,
      default: 0,
      validator(val) {
        return typeof val === 'number';
      },
    },
    nodeTypeName: {
      type: String,
      required: true,
    },
    initialNode: {
      type: Object,
      required: true,
      default: undefined,
    },
    initialGlobalEdges: {
      type: Array,
      required: true,
      default: undefined,
    },
    toNodeOptions: {
      type: Array,
      required: true,
      default: undefined,
    },
    globalVarOptionsMap: {
      type: Object,
      required: true,
      default: undefined,
    },
    linking: {
      type: Boolean,
      default: false,
    },
    nodeBlockWidth: {
      type: Number,
      default: 230,
    },
    nodeBlockHeight: {
      type: Number,
      default: 120,
    },
    version: {
      type: String,
      required: true,
    },
    jsCodeAlias: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      node: {},
      lastMouseX: 0,
      lastMouseY: 0,
      canMove: false,
      hasMoved: false,
      hasExitConnection: false,
      warningTooltipValue: {},
      endTooltip: {
        msg: this.$t('task_engine_v2.warnings.has_exit_connection'),
      },
      warningMsgMap: {},
      isSrcNode: false,
      mouseOverNode: false,
      warningIconStyle: {
        visibility: 'hidden',
      },
      endStyle: {
        visibility: 'hidden',
      },
    };
  },
  computed: {
    style() {
      return {
        top: `${this.y}px`,
        left: `${this.x}px`,
        width: `${this.nodeBlockWidth}px`,
        height: `${this.nodeBlockHeight}px`,
        'min-width': `${this.nodeBlockWidth}px`,
        'min-height': `${this.nodeBlockHeight}px`,
      };
    },
    deleteText() {
      return this.$t('general.delete').split('').join(' ');
    },
    copyText() {
      return this.$t('general.copy').split('').join(' ');
    },
  },
  methods: {
    tooltipMouseover(e, key) {
      const rect = e.target.getBoundingClientRect();
      this[key] = {
        left: `${rect.width}px`,
        bottom: `${rect.height}px`,
        visibility: 'visible',
      };
    },
    onMouseDown(e) {
      const target = e.target || e.srcElement;
      if (target.id === 'edgeSlotFrom' || target.id === 'edgeSlotTo') {
        return;
      }
      const mouseX = e.pageX;
      const mouseY = e.pageY;
      this.lastMouseX = mouseX;
      this.lastMouseY = mouseY;

      if (this.$el.contains(target) && e.which === 1) {
        this.canMove = true;
        if (e.preventDefault) e.preventDefault();
      }
    },
    onMouseMove(e) {
      if (!this.canMove) {
        return;
      }
      const mouseX = e.pageX;
      const mouseY = e.pageY;

      const diffX = mouseX - this.lastMouseX;
      const diffY = mouseY - this.lastMouseY;

      this.lastMouseX = mouseX;
      this.lastMouseY = mouseY;

      let left = this.x + diffX;
      let top = this.y + diffY;
      this.hasMoved = true;

      // 进行边界处理,这就是拖拽的left 和 top 值
      if (top < 0) {
        top = 0;
      } else if (left < 0) {
        left = 0;
      }

      // console.log(left, top);
      this.$emit('updatePosition', { left, top });
    },
    onMouseUp() {
      if (this.canMove && this.hasMoved) {
        this.$emit('savePosition');
      }
      this.canMove = false;
      this.hasMoved = false;
      this.isSrcNode = false;
    },
    srcSlotMouseDown() {
      this.isSrcNode = true;
      const edgeSlotFrom = this.$refs.edgeSlotFrom;
      const halfElementHeight = edgeSlotFrom.offsetHeight / 2;
      const x = edgeSlotFrom.offsetLeft + edgeSlotFrom.offsetParent.offsetLeft + halfElementHeight;
      const y = edgeSlotFrom.offsetTop + edgeSlotFrom.offsetParent.offsetTop + halfElementHeight;
      const slot = { x, y };
      this.$emit('linkingStart', slot);
    },
    dstSlotMouseUp(e) {
      this.$emit('linkingStop', e);
    },
    dstSlotMouseEnter() {
      const edgeSlotTo = this.$refs.edgeSlotTo;
      const halfElementHeight = edgeSlotTo.offsetHeight / 2;
      const x = edgeSlotTo.offsetLeft + edgeSlotTo.offsetParent.offsetLeft + halfElementHeight;
      const y = edgeSlotTo.offsetTop + edgeSlotTo.offsetParent.offsetTop + halfElementHeight;
      const slot = { x, y };
      this.$emit('mouseEnterDstSlot', slot);
    },
    dstSlotMouseLeave(e) {
      this.$emit('mouseLeaveDstSlot', e);
    },
    deleteNode() {
      this.$emit('deleteNode');
    },
    editNode(tabType) {
      const that = this;
      that.$pop({
        title: `${that.node.nodeName}（${that.node.nodeId}）`,
        component: NodeEditPage,
        validate: true,
        cancelValidate: true,
        extData: {
          currentTab: tabType,
          jsCodeAlias: this.jsCodeAlias,
          node: that.node,
          globalEdges: that.initialGlobalEdges,
          toNodeOptions: that.toNodeOptions,
          globalVarOptionsMap: that.globalVarOptionsMap,
          version: this.version,
        },
        callback: {
          ok: (resultObj) => {
            this.node = resultObj.nodeResult;
            this.$emit('addTempNodes', resultObj.newNodeOptions);
            this.$emit('saveNode', resultObj.nodeResult);
          },
        },
      });
    },
    copyNode() {
      this.$emit('copyNode');
    },
    renderData() {
      this.node = JSON.parse(JSON.stringify(this.initialNode));
      this.renderWarnings();
    },
    propNode(newNode) {
      this.node = JSON.parse(JSON.stringify(newNode));
      this.renderWarnings();
    },
    renderWarnings() {
      if (!this.node.warnings || !(this.node.warnings instanceof Array)) return;
      const warningMsgs = [];
      this.hasExitConnection = false;
      this.node.warnings.forEach((w) => {
        if (w.type === 'has_exit_connection') {
          this.hasExitConnection = true;
        } else {
          const msg = this.warningMsgMap[w.type];
          warningMsgs.push(msg);
        }
      });
      this.warningTooltipValue.msgs = warningMsgs;

      // reload
      if (this.$refs.warningIcon) {
        this.$refs.warningIcon.dispatchEvent(new Event('tooltip-reload'));
      }
    },
    addListeners() {
      document.documentElement.addEventListener('mousemove', this.onMouseMove, false);
      document.documentElement.addEventListener('mousedown', this.onMouseDown, false);
      document.documentElement.addEventListener('mouseup', this.onMouseUp, false);
    },
    removeListeners() {
      document.documentElement.removeEventListener('mousemove', this.onMouseMove, false);
      document.documentElement.removeEventListener('mousedown', this.onMouseDown, false);
      document.documentElement.removeEventListener('mouseup', this.onMouseUp, false);
    },
  },
  beforeMount() {
    this.warningMsgMap = optionConfig.getWarningMsgMap(this);
    this.renderData();
  },
  mounted() {
    this.$on('propNode', this.propNode);
    this.addListeners();
  },
  beforeDestroy() {
    this.removeListeners();
  },
};
</script>

<style lang="scss" scoped>
.node-block {
  position: absolute;
  display: flex;
  flex-direction: column;
  background: white;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 20px;
  justify-content: space-between;
  cursor: move;
  .tooltip {
    width: 300px;
    position: absolute;
    word-break: break-all;
    white-space: normal;
    font-size: 12px;
    line-height: 18px;
    border-radius: 2px;
    color: #FFFFFF;
    .text {
      background-color: rgba(0, 0, 0, 0.85);
      padding: 5px 8px;
      display: inline-block;
    }
  }
  .label-node-name {
    @include font-16px();
    color: $color-font-active;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .info-row {
    display: flex;
    align-items: center;
    @include font-12px();
    color: $color-font-active;
    .rounded {
      background-color: #eeeeee;
      border-radius: 10px;
      padding: 2px 10px;
      margin-right: 10px;
      &.relative {
        position: relative;
      }
    }
    .warning-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }
  }
  .button-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    @include font-12px();
    color: $color-button;
    cursor: pointer;
    height: 32px;
    .button {
      width: 80px;
      height: 32px;
    }
    .transparent-button {
      height: 32px;
      display: flex;
      align-items: center;
      padding: 0 10px;
    }
  }
  .edge-slot{
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  .edge-slot-from{
    position: absolute;
    bottom: -8px;
    left: 132px;
  }
  .mouse-over-node{
    border: 2px solid #AAAAAA;
    border-radius: 100%;
  }
  .is-src-node {
    background: #AAAAAA;
    border: 2px solid #AAAAAA;
    border-radius: 100%;
  }
  .edge-slot-to{
    z-index: 100;
    position: absolute;
    top: -8px;
    left: 132px;
    border: 2px solid #AAAAAA;
    border-radius: 100%;
    &:hover{
      background: $color-primary;
      border: 2px solid $color-primary;
    }
  }
}
</style>
