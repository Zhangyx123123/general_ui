<template lang="html">
  <div id="edges-on-top" class="edges">
    <svg class="svg">
      <defs>
        <marker id="head" viewBox="0 0 10 10" refX="7" refY="5" markerUnits="strokeWidth" markerWidth="4" markerHeight="3" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" stroke="none" fill="#AAAAAA"/>
        </marker>
      </defs>
      <g class="linking-path" v-if="linkingPath.show === true">
        <path marker-end='url(#head)' :d="linkingPath.data" :style="linkingPathStyle"></path>
      </g>
    </svg>
  </div>
</template>

<script>

export default {
  name: 'edges-on-top',
  components: {},
  props: {
    linkingEdge: {
      type: Object,
      default: [],
    },
  },
  data() {
    return {
      radius: 60,
      linkingPath: {},
      linkingPathStyle: {
        stroke: '#AAAAAA',
        strokeWidth: 5,
        fill: 'none',
      },
    };
  },
  watch: {
    linkingEdge: {
      handler() {
        this.linkingPath = {
          show: this.linkingEdge.show,
          data: this.computeLinkingPathData(this.linkingEdge),
          style: this.linkingEdge.style,
        };
      },
      deep: true,
    },
  },
  methods: {
    // p
    // |
    // q
    // |
    // c -- r -- s
    computeLinkingPathData(edge) {
      const px = edge.x1;
      const py = edge.y1;
      const qx = px;
      let qy = py;
      let sx = edge.x2;
      let sy = edge.y2;
      let rx = sx;
      const ry = sy;
      const cx = px;
      const cy = sy;

      if (Math.abs(sx - px) > this.radius) {
        if (sx > px) {
          rx = cx + this.radius;
        } else if (sx < px) {
          rx = cx - this.radius;
        }
      }
      if (Math.abs(sy - py) > this.radius) {
        if (sy > py) {
          qy = cy - this.radius;
        } else if (sy < py) {
          qy = cy + this.radius;
        }
      }

      if (rx === sx) {
        if (px > sx) {
          sx -= 1;
        } else {
          sx += 1;
        }
      }

      if (ry === sy) {
        if (py > sy) {
          sy -= 1;
        } else {
          sy += 1;
        }
      }

      const data = `M ${px} ${py} L ${qx} ${qy} Q ${cx} ${cy}, ${rx} ${ry} L ${sx} ${sy}`;
      return data;
    },
  },
  beforeMount() {},
  mounted() {
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';

#edges-on-top{
  position: absolute;
  left: 0px;
  top: 0px;
  pointer-events: none;
  width: 100%;
  height: 100%;
  .svg{
    width: 100%;
    height: 100%;
  }
}
</style>
