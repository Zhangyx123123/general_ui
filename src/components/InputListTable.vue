<template>
  <div class="dynamic-list" :style="{width: width}">
    <div class="dynamic-list-title" v-if="title !== ''">{{ title }}</div>
    <div class="dynamic-list-desc" v-if="desc !== ''">{{ desc }}</div>
    <div v-for="(str, idx) in inputs" :key="idx" class="dynamic-list-row">
      <div class="list-num" >{{ idx + 1 }}</div>
      <div class="list-input">
        <input ref="input"
          :maxlength="maxLength"
          v-model="inputs[idx]"
          @compositionstart="inComposition=true"
          @compositionend="endComposition"
          @keydown="handleKeyDown($event)"
          @keyup="handleKeyup($event, idx)"
          @change="handleChange">
      </div>
    </div>
  </div>
</template>

<script>
import misc from '@/utils/js/misc';

export default {
  name: 'input-list-table',
  props: {
    title: {
      type: String,
      default: '',
    },
    desc: {
      type: String,
      default: '',
    },
    value: {
      type: Array,
      required: false,
      default: () => [],
    },
    width: {
      type: String,
      required: false,
      default: () => '',
    },
    maxValues: {
      type: Number,
      required: false,
      default: () => 5,
    },
    maxLength: {
      type: Number,
      default: () => -1,
    },
  },
  data: () => ({
    inComposition: false,
    inputs: [],
  }),
  methods: {
    endComposition() {
      this.inComposition = false;
      this.$nextTick(() => {
        this.$emit('input', this.updateValue);
      });
    },
    handleChange() {
      const temp = this.inputs.filter(input => input !== '');
      while (temp.length < this.maxValues) {
        temp.push('');
      }
      this.inputs = temp;
    },
    handleKeyDown(e) {
      const that = this;
      if (!that.inComposition) {
        if (e.keyCode === 13) {
          that.$emit('submit');
        }
      }
    },
    handleKeyup(e, idx) {
      const that = this;
      if (!that.inComposition) {
        let target;
        if (e.keyCode === 38 && idx > 0) {
          // key down
          target = that.$refs.input[idx - 1];
          // console.log(that.$refs.input[idx - 2]);
        } else if (e.keyCode === 40 && idx < that.maxValues) {
          // key up
          target = that.$refs.input[idx + 1];
          // console.log(that.$refs.input[idx]);
        }
        if (target !== undefined) {
          // select content in input after update UI, use next Tick
          that.$nextTick(() => {
            target.select();
          });
        }
        if (!misc.controlKeyOnly(e)) {
          that.$nextTick(() => {
            that.$emit('input', that.updateValue);
          });
        }
      }
    },
  },
  computed: {
    updateValue() {
      return this.inputs.filter(input => input !== '');
    },
  },
  mounted() {
    const that = this;
    for (let i = 0; i < that.maxValues; i += 1) {
      if (i < that.value.length) {
        that.inputs.push(that.value[i]);
      } else {
        that.inputs.push('');
      }
    }
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';
$row-height: $default-line-height;
$border-color: $area-border-color;

.dynamic-list {
  display: flex;
  flex-direction: column;
  border: 1px solid $area-border-color;
  border-bottom: none;
  .dynamic-list-title {
    line-height: $row-height;
    border-bottom: 1px solid $area-border-color;
    padding: 0 10px;
    background: $table-header-background;
  }
  .dynamic-list-desc {
    line-height: normal;
    font-size: 0.9em;
    padding: 5px 10px;
    word-break: break-all;
    border-bottom: 1px solid $area-border-color;
  }
  .dynamic-list-row {
    display: flex;
    line-height: $row-height;
    border-bottom: 1px solid $area-border-color;
    .list-num {
      flex: 0 0 $row-height;
      border-right: 1px solid $area-border-color;
      text-align: center;
    }
    .list-input {
      background: white;
      flex: 1;
      padding: 0 10px;
      input {
        width: 100%;
        border: none;
        outline: none;
      }
    }
  }
}
</style>
