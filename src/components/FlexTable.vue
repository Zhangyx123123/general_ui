<template>
  <div class="flex-table">
    <div class="flex-table-panel">
      <!-- TODO: use slot to put action buttons -->
    </div>
    <div class="flex-table-header">
      <div class="flex-table-row">
        <div class="flex-table-cell blank"></div>
        <div class="flex-table-cell" v-if="showCheckBox">
          <input type="checkbox">
        </div>
        <div v-for="column in columns" :key="column.key" class="flex-table-cell" :style="customFlexWidth(column)">
          {{column.text}}
        </div>
        <div class="flex-table-cell blank"></div>
      </div>
    </div>
    <div class="flex-table-body">
      <!-- TODO: add ability to use checkbox -->
      <div v-for="(row, idx) in data" :key="idx" class="flex-table-row">
        <div class="flex-table-cell blank"></div>
        <div class="flex-table-cell" v-if="showCheckBox">
          <input type="checkbox">
        </div>
        <div v-for="column in columns" :key="column.key" class="flex-table-cell" :style="customFlexWidth(column)">
          <template v-if="column.type === 'text'">
          {{row[column.key]}}
          </template>
          <template v-if="column.type === 'icon-button'">
            <text-button :icon-type="column.icon" @click="column.iconCallback(idx, row)">{{ column.btn_text }}</text-button>
          </template>
          <template v-if="column.type === 'toggle'">
            <toggle v-model="row[column.key]" @change="column.toggleCallback(idx, row)"/>
          </template>
        </div>
        <div class="flex-table-cell blank"></div>
      </div>
    </div>
    <div class="flex-table-footer">
      <!-- TODO: add pagination into footer -->
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      required: true,
      default() {
        return [];
      },
    },
    columns: {
      type: Array,
      required: true,
      default() {
        return [];
      },
    },
    showCheckBox: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {
    customFlexWidth(column) {
      if (column.fixed) {
        return `flex: 0 0 ${column.width ? column.width : 'auto'}`;
      }
      return `flex: ${column.width}`;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "styles/variable";

.flex-table {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  height: 100%;
  line-height: $default-line-height;

  .flex-table-header {
    background: $table-header-background;
  }
  .flex-table-body {
    flex: 1 1 100px;
    // overflow is for IE
    overflow: auto;
    // other browser support overlay will use overlay
    overflow: overlay;
    max-height: 100%;
    background: $table-body-background;
    -ms-overflow-style: -ms-autohiding-scrollbar;

    .flex-table-row {
      border-bottom: 1px solid $table-border-color;
      &:hover {
        background: $table-body-hover-background;
      }
    }
  }
  .flex-table-row {
    display: flex;
    align-items: center;
    flex-direction: row;
    .flex-table-cell {
      padding: 5px;
      display: flex;
      word-break: break-all;
      text-overflow: ellipsis;
      input {
        display: block;
      }
      &.blank {
        flex: 0 0 20px;
      }
    }
  }
}
</style>
