<template>
  <div class="dynamic-list-input">
    <div class="dynamic-input" v-for="(val, idx) in value.contents" :key="val">
      <span class="dynamic-title">{{title}}</span>
      <input maxlength="200" :data-idx="idx" v-on:change="setVal" :value="val" :disabled="readOnly">
      <div class="dynamic-button icon" v-on:click="addVal()" v-if="value.contents.length < value.contentMaxNum && idx === value.contents.length - 1">
        <div class="row"></div>
        <div class="vertical"></div>
      </div>
      <div class="dynamic-button icon" v-on:click="removeVal(idx)" v-if="value.contents.length > 0">
        <div class="row"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default: {},
    },
    title: {
      type: String,
      default: '',
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    addVal() {
      this.value.contents.push('');
    },
    removeVal(idx) {
      if (this.value.contents.length === 1) {
        this.value.contents[0] = '';
        this.$forceUpdate();
      } else {
        this.value.contents.splice(idx, 1);
      }
    },
    setVal(event) {
      const e = event || window.event;
      const idx = e.currentTarget.dataset.idx;
      if (e && e.currentTarget) {
        this.value.contents[idx] = e.currentTarget.value;
      }
    },
    showAdd(idx) {
      return this.value.contents.length - 1 === idx;
    },
  },
  beforeUpdate() {
    if (this.value.contents && this.value.contents.length === 0) {
      this.value.contents.push('');
    }
  },
  beforeMount() {
    if (this.value.contents && this.value.contents.length === 0) {
      this.value.contents.push('');
    }
  },
};
</script>
<style lang="scss" scoped>
$row-height: 30px;
.dynamic-list-input {
  .dynamic-input {
    height: $row-height;
    line-height: $row-height;
    width: 100%;
    white-space: pre-wrap;
    overflow: hidden;
    white-space: nowrap;

    input {
      font-size: 16px;
      position: relative;
      padding: 5px;
    }

    .dynamic-title {
      vertical-align: middle;
      margin-right: 20px;
    }

    .dynamic-button {
      display: inline;
      text-align: center;
      vertical-align: middle;
      user-select: none;
      cursor: pointer;
      height: 1em;
      width: 1em;

      &.icon {
        position: relative;
        display: inline-block;

        div {
          display: inline;
          position: absolute;
        }
        span {
          display: block;
          width: 100%;
          height: 100%;
        }
        .row {
          top: calc(0.5em - 1px);
          width: 18px;
          height: 2px;
          background-color: black;
          display: block;
        }
        .vertical {
          top: calc(0.5em - 1px);
          width: 18px;
          height: 2px;
          background-color: black;
          display: block;
          transform: rotate(90deg);
        }
        
        &.disabled{
          cursor: not-allowed;
          span{
            pointer-events: none;
          }
          .row{
            background-color: #d7dde4;
          }
          .vertical{
            background-color: #d7dde4;
          }
        }
      }
    }

    input {
      width: 380px;
    }
  }
}
</style>
