<template>
  <div class="range-input">
    <div class="range-name" v-if="name !== undefined">{{ name }}</div>
    <dropdown-select class="range-type" width="80px" :options="typeOption"
      v-model="rangeType" @input="handleTypeChange" ref="type" />
    <div class="range-selector" :class="{hide: !showRange}">
      <dropdown-select :width="width" :options="startDropOption"
        v-model="start" @input="handleValueChange" ref="start" :showCheckedIcon=false />
      <div class="range-text">～</div>
      <dropdown-select :width="width" :options="endDropOption"
        v-model="end" @input="handleValueChange" ref="end" :showCheckedIcon=false />
    </div>
  </div>  
</template>

<script>
import DropdownSelect from '@/components/DropdownSelect';

export default {
  props: {
    width: {
      type: String,
      default: '60px',
      required: false,
    },
    name: {
      type: String,
      default: undefined,
      required: false,
    },
    defaultStart: {
      required: false,
    },
    defaultEnd: {
      required: false,
    },
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    step: {
      type: Number,
      required: false,
      default: 1,
    },
  },
  components: {
    DropdownSelect,
  },
  data() {
    return {
      start: [],
      end: [],
      origOption: [],
      startDropOption: [],
      endDropOption: [],
      typeOption: [
        { value: '', text: this.$t('general.all') },
        { value: 'range', text: this.$t('general.range') },
      ],
      rangeType: [''],
      showRange: false,
    };
  },
  methods: {
    handleTypeChange() {
      const that = this;
      if (that.rangeType.length <= 0 || that.rangeType[0] === '') {
        that.showRange = false;
      } else {
        that.showRange = true;
      }
      that.emitUpdate();
    },
    handleValueChange() {
      this.updateEndOption();
      this.emitUpdate();
    },
    emitUpdate() {
      const param = {};
      if (this.showRange) {
        param.start = this.start[0];
        param.end = this.end[0];
      }
      this.$emit('input', param);
    },
    updateEndOption() {
      const that = this;
      that.endDropOption = [];
      that.origOption.forEach((opt) => {
        if (opt.value >= that.start[0]) {
          that.endDropOption.push({
            text: opt.text,
            value: opt.value,
          });
        }
      });

      if (that.end[0] < that.start[0]) {
        that.end = [that.start[0]];
      }

      that.$refs.end.$emit('updateOption', that.endDropOption);
    },
    initOption() {
      const that = this;
      for (let i = that.min; i <= that.max; i += that.step) {
        that.origOption.push({
          text: i.toString(),
          value: i,
        });
      }
    },
    setup() {
      const that = this;
      that.origOption.forEach((opt) => {
        that.startDropOption.push({
          text: opt.text,
          value: opt.value,
        });
      });

      if (that.defaultStart === undefined) {
        if (that.startDropOption.length > 0) {
          that.start = [that.startDropOption[0].value];
        }
      } else {
        that.start = [that.defaultStart];
      }

      that.updateEndOption();
      if (that.defaultEnd === undefined || that.defaultEnd < that.defaultStart) {
        if (that.endDropOption.length > 0) {
          that.end = [that.endDropOption[that.endDropOption.length - 1].value];
        }
      } else {
        that.end = [that.defaultEnd];
      }
    },
  },
  mounted() {
    const that = this;
    that.initOption();
    that.setup();
    that.$on('reload', () => {
      that.initOption();
      that.setup();
    });
  },
};
</script>

<style lang="scss" scoped>
.range-input {
  display: flex;
  align-items: center;
  .range-name {
    margin-right: 10px;
  }
  .range-type {
    margin-right: 10px;
  }
  .range-selector {
    display: flex;
    align-items: center;
    &.hide {
      display: none;
    }
  }
  .range-text {
    margin: 0 5px;
  }
}
</style>
