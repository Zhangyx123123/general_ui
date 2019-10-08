<template lang="html">
  <div id="edges" class="edges"> 
    <svg class="svg">
      <g class="paths" v-for="p, idx in paths" >
        <path 
          :d="p.data" 
          stroke-width="5" 
          :stroke="rainbowColors[idx % rainbowColors.length]"
          fill="none">
        </path>
      </g>
    </svg>
  </div>
</template>

<script>
import optionConfig from '../_utils/optionConfig';
import { NodeBlock } from '../_utils/componentConfig';

export default {
  props: {
    edges: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      radius: 60,
      rainbowColors: optionConfig.getRainbowColors(),
    };
  },
  computed: {
    paths() {
      const pathList = [];
      this.edges.forEach((edge) => {
        const data = this.computeData(edge);
        pathList.push({
          data,
          style: edge.style,
        });
      });
      return pathList;
    },
  },
  watch: {},
  methods: {
    // p
    // |
    // q
    // |
    // c -- r -- s
    computeData(edge) {
      let px = edge.x1;
      let py = edge.y1;
      let sx = edge.x2;
      let sy = edge.y2;

      if (Math.abs(sx - px) <= (NodeBlock.nodeBlockWidth / 2)) {
        const meanX = (px + sx) / 2;
        px = meanX;
        sx = meanX;
      }
      if (Math.abs(sy - py) <= (NodeBlock.nodeBlockHeight / 2)) {
        const meanY = (py + sy) / 2;
        py = meanY;
        sy = meanY;
      }

      const qx = px;
      const cx = px;
      let rx = px;

      let qy = sy;
      const cy = sy;
      const ry = sy;

      if (sx > px) {
        rx += this.radius;
      } else if (sx < px) {
        rx -= this.radius;
      }
      if (sy > py) {
        qy -= this.radius;
      } else if (sy < py) {
        qy += this.radius;
      }
      const data = `M ${px} ${py} L ${qx} ${qy} Q ${cx} ${cy}, ${rx} ${ry} L ${sx} ${sy}`;
      return data;
    },
    distance(x1, y1, x2, y2) {
      return Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
    },
  },
};
</script>

<style lang="scss" scoped>
#edges {
  width: 100%;
  height: 100%;
  .svg {
    width: 100%;
    height: 100%;
  }
}
</style>
