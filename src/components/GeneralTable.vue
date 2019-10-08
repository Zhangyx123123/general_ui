<template>
  <div class="general-table-container" :class="[showEmpty ? 'show-empty': '']" :style="{'min-width': tableMinWidth+'px'}">
    <div class="general-table-header">
    <table ref="tableHeader" class="general-table" :class="[autoHeight ? 'auto-height': '', fontClass]">
      <thead>
        <tr>
          <td v-if="checkbox" class="table-col-checkbox">
            <input type="checkbox" @click="checkAll" :checked="isAllChecked">
          </td>
          <td v-for="header in tableHeader" :key="header.key"
            :style="{width: header.width}"
            :class="{'fixed': header.width, 'custom-action': header.type === 'action', 'multi-action': hasMultiCustomAction, 'icon-column': header.type === 'icon'}"
            class="table-header-item">
            {{ header.text }}
            <div v-if="header.info && header.info !== ''" :ref="`${header.key}-info`"
              class="table-header-icon"
              v-tooltip="headerInfoTooltip"
              @mouseover="updateHeaderInfoTooltip(header)"
             >
              <icon :ref="`${header.key}-icon`" icon-type="info" :size=16 enableHover></icon>
            </div>
          </td>
          <td v-if="hasAction" class="table-col-action" :class="{'multi-action': action.length > 1}">
            {{ $t('general.actions') }}
          </td>
          <td v-if="$scopedSlots.menu" class="fixed menu">{{moreText}}</td>
        </tr>
      </thead>
    </table>
    </div>

    <!-- table content -->
    <div v-if="isLoading" class="loading-display">
      <loading-dot></loading-dot>
    </div>
    <div v-else-if="showEmpty && tableData.length <= 0" class="empty-display">
      <template v-if="showEmptyMsg">
        <div class="empty-msg" v-for="msg in showEmptyMsg" :key="msg">
          {{ msg }}
        </div>
      </template>
      <template v-else>
        {{ $t('general.no_data') }}
      </template>
    </div>
    <div v-else class="general-table-body" @scroll.passive="hideMenu">
    <table class="general-table" :class="[autoHeight ? 'auto-height' : '', fontClass]" v-if="tableData && tableData.length > 0">
      <tbody :class="[onclickRow ? 'clickable-row' : '']">
        <tr v-for="(data, idx) in tableData" :key="idx" :class="{'highlight': data.highlight}" @mouseenter="hoverRowIndex = idx" @mouseleave="hoverRowIndex = indexOfShowMenu = -1">
          <td v-if="checkbox" class="table-col-checkbox">
            <input type="checkbox" @click="checkSelf(data, idx)" :checked="data.isChecked">
          </td>
          <template v-if="data.onelineCommand">
            <td v-for="header in tableHeader" :key="uniqueId(header.key, idx)"
              :style="{width: header.width}"
              :class="{'fixed': header.width, 'custom-action': header.type === 'action', 'multi-action': hasMultiCustomAction, 'icon-column': header.type === 'icon'}"
              class="table-body-item oneline-command"
              @click="data.action === undefined ? () => {} : data.action(data)">
              <template v-if="header.key === data.align">
                {{ data.text }}
              </template>
            </td>
          </template>
          <template v-else>
            <td v-for="header in tableHeader" :key="uniqueId(header.key, idx)"
              :style="{width: header.width}"
              :class="{'fixed': header.width, 'custom-action': header.type === 'action', 'multi-action': hasMultiCustomAction, 'icon-column': header.type === 'icon'}"
              class="table-body-item"
              @click="handleOnclickRow(onclickRow, data, idx);$emit('onCellClicked', { rowIndex: idx, rowData: data, key: header.key })">
              <div v-if="header.type === 'tag'">
                <tag class="tags" v-for="(tag, tagIdx) in data[header.key]" :key="`${tagIdx}-${tag}`" :fontClass="fontClass">{{ tag }}</tag>
              </div>
              <!-- type toggle need to have a readonly mode -->
              <template v-else-if="header.type === 'toggle'">
                <toggle class="toggles"
                  v-model="data[header.key].val"
                  :disabled="data[header.key].disabled"
                  @change="data[header.key].onclick(data, idx)"></toggle>
              </template>
              <template v-else-if="header.type === 'action'">
                <span class="actions" v-for="act in data[header.key]"
                  :key="act.text" :class="act.type" @click="act.onclick(data, idx)">
                  {{act.text}}
                </span>
              </template>
              <template v-else-if="header.type === 'icon'">
                <icon v-if="data[header.key]" :icon-type="data[header.key].iconType" :size="data[header.key].iconSize"></icon>
              </template>
              <template  v-else-if="header.type === 'click'">
              <span class="href"
                    @click="data[header.key].onclick(data, idx)"
              > {{ data[header.key].val }}</span>
              </template>
              <div v-else :title="data[header.key]">{{ data[header.key] }}</div>
            </td>
          </template>
          <td v-if="hasAction" class="table-col-action" :class="{'multi-action': action.length > 1}">
            <template v-for="act in action">
            <span class="actions"
              :key="act.text" :class="act.type"
              @click="act.onclick(data, idx)"
              v-if="data.action_enable === undefined || (data.action_enable && data.action_enable[act.key])"
            > {{ act.text }}</span>
            </template>
          </td>
          <template v-if="$scopedSlots.menu">
            <td class="fixed menu">
              <icon v-show="hoverRowIndex === idx" iconType="more" enableHover :size=15 @click="moreClick(idx, data, $event)" style="position: initial"></icon>
            </td>
            <td v-if="idx === indexOfShowMenu && hoverRowIndex === idx" class="menu-container" :style="menuStyle"><slot name="menu" :rowData="data" :rowIndex="idx"></slot></td>
          </template>
        </tr>
      </tbody>
    </table>
    </div>
  </div>
</template>

<script>
import event from '@/utils/js/event';
import Tag from '@/components/basic/Tag';
import Toggle from '@/components/basic/Toggle';

export default {
  components: {
    Tag,
    Toggle,
  },
  props: {
    tableHeader: {
      type: Array,
      required: true,
      default() {
        return [];
      },
    },
    tableData: {
      type: Array,
      required: true,
      default() {
        return [];
      },
    },
    checkbox: {
      type: Boolean,
      required: false,
      default: false,
    },
    action: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },
    actionInfo: {
      type: String,
      required: false,
      default: '',
    },
    onclickRow: {
      type: Function,
      required: false,
      default: undefined,
    },
    autoHeight: {
      type: Boolean,
      required: false,
      default: false,
    },
    fontClass: {
      type: String,
      required: false,
      default: 'font-14',
    },
    showEmpty: {
      type: Boolean,
      required: false,
      default: false,
    },
    showEmptyMsg: {
      type: Array,
      required: false,
      default: undefined,
    },
    isLoading: {
      type: Boolean,
      required: false,
      default: false,
    },
    moreText: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isAllChecked: false,
      checkedData: [],
      headerInfoTooltip: {
        msg: '',
      },
      menuStyle: {
      },
      indexOfShowMenu: -1,
      hoverRowIndex: -1,
    };
  },
  computed: {
    hasAction() {
      return this.action.length > 0;
    },
    hasMultiCustomAction() {
      const actionHeader = this.tableHeader.find(header => header.type === 'action');
      if (!actionHeader) return false;
      const key = actionHeader.key;
      if (this.tableData.length > 0) {
        return this.tableData[0][key].length > 1;
      }
      return false;
    },
    tableMinWidth() {
      return (80 * this.tableHeader.length) + 176;
    },
  },
  watch: {
    tableData() {
      if (this.checkbox) {
        this.tableData.forEach((data) => {
          data.isChecked = false;
        });
        this.isAllChecked = false;
        // this.setCheckedData();
        // this.$emit('checkedChange', this.checkedData);
      }
    },
  },
  methods: {
    uniqueId(key, idx) {
      // using idx of rowData to produce unique key for array type tag instead of using random key
      return `${idx}-${key}`;
    },
    checkSelf(data) {
      data.isChecked = !data.isChecked;
      this.isAllChecked = this.isAllRowChecked();
      this.setCheckedData();
      this.$emit('checkedChange', this.checkedData);
    },
    checkAll() {
      if (this.isAllRowChecked()) {
        this.tableData.forEach((data) => {
          data.isChecked = false;
        });
      } else {
        this.tableData.forEach((data) => {
          data.isChecked = true;
        });
      }
      this.isAllChecked = this.isAllRowChecked();
      this.setCheckedData();
      this.$emit('checkedChange', this.checkedData);
    },
    isAllRowChecked() {
      const hasUnchecked = this.tableData.some(data => data.isChecked === false);
      return !hasUnchecked;
    },
    setCheckedData() {
      this.checkedData = this.tableData.filter(data => data.isChecked === true);
    },
    handleOnclickRow(onclickRow, data, idx) {
      if (onclickRow !== undefined) {
        onclickRow(data, idx);
      }
    },
    updateHeaderInfoTooltip(header) {
      const tableHeaderDom = this.$refs.tableHeader;
      const infoIconBlockDom = this.$refs[`${header.key}-info`][0];
      const tableHeaderRightPos = tableHeaderDom.getBoundingClientRect().right;
      const infoIconRightPos = infoIconBlockDom.getBoundingClientRect().right;

      /** Max-width of tooltip is 300px,
      /*  Let tooltip alignLeft if infoIcon is too close to righthand side of table */
      if (tableHeaderRightPos - infoIconRightPos < 350) {
        this.headerInfoTooltip.alignLeft = true;
      } else {
        this.headerInfoTooltip.alignLeft = false;
      }
      this.headerInfoTooltip.msg = header.info;
      infoIconBlockDom.dispatchEvent(event.createEvent('tooltip-reload'));
    },
    moreClick(index, rowData, e) {
      this.$emit('moreClick', { rowIndex: index, rowData });
      const rect = e.target.getBoundingClientRect();
      const top = document.documentElement.scrollTop + rect.top + rect.height;
      const windowWidth = window.innerWidth || document.body.clientWidth;
      this.indexOfShowMenu = index;
      this.menuStyle = {
        top: `${top}px`,
        right: `${(windowWidth - rect.right) + (rect.width / 2)}px`,
      };
    },
    hideMenu() {
      this.indexOfShowMenu = -1;
    },
  },
  mounted() {
    if (this.checkbox) {
      this.tableData.forEach((data) => {
        data.isChecked = false;
      });
      this.isAllChecked = false;
      // this.setCheckedData();
      // this.$emit('checkedChange', this.checkedData);
    }
    window.addEventListener('resize', this.hideMenu);
    document.body.addEventListener('click', this.hideMenu, true);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.hideMenu);
    document.body.removeEventListener('click', this.hideMenu, true);
  },
};
</script>

<style lang="scss" scoped>
@import "styles/variable";

$table-header-background: $color-disabled;
$table-data-background: #fcfcfc;
$table-color-borderline: $color-borderline-disabled;
$table-row-height: 50px;
$table-cell-min-width: 80px;

.general-table-container {
  &.show-empty {
    flex: 1;
  }
  display: flex;
  flex-direction: column;
  width: inherit;
  background-color: #fcfcfc;
  .general-table-header {
    flex: 0 0 auto;
    .auto-height {
      thead {
        tr {
          height: auto;
          max-height: 90px;
          td {
            min-width: $table-cell-min-width;
          }
        }
      }
    }
    .table-header-item {
      display: flex;
      align-items: center;
      .table-header-icon {
        display: flex;
        align-items: center;
        margin-left: 5px;
        cursor: pointer;
      }
    }
  }
  .menu {
    min-width: 90px;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .menu-container {
    padding: 0;
    position: fixed;
  }
  .general-table-body {
    @include auto-overflow-Y();
    @include customScrollbar();
    overflow-x: hidden;
    .table-body-item {
      display: flex;
      align-items: center;
      div {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      &.oneline-command {
        color: $color-primary;
      }
    }
    tr {
      &:hover{
      background-color: #F6F9FF;
      }
    }
    .clickable-row {
      tr {
        cursor: pointer;
        .table-col-action, .table-col-checkbox {
          cursor: default;
        }
      }
    }

    .auto-height {
      thead {
        tr {
          height: auto;
        }
      }
      tbody {
        tr {
          height: auto;
          td {
            text-overflow: unset;
            overflow: unset;
            white-space: unset;
            word-break: break-all;
            min-width: $table-cell-min-width;
            &.table-body-item {
              div {
                text-overflow: unset;
                overflow: unset;
                white-space: unset;
                word-break: break-all;

                // IE11 do not has unset css property
                @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
                  overflow: visible;
                  white-space: normal;
                }
              }
            }
          }
        }
      }
    }
  }
  .empty-display {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: $color-font-mark;
    @include font-14px();
    .empty-msg {
      margin: 3px 0;
    }
  }
  .loading-display {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
table {
  &.font-16 {
    @include font-16px();
  }
  &.font-14 {
    @include font-14px();
  }
  &.font-12 {
    @include font-12px();
  }
  width: 100%;
  table-layout: fixed;
  border-spacing: 0px;
  overflow-x: hidden;
  color: $color-font-normal;
  thead {
    background: $table-header-background;
    tr {
      height: $table-row-height;
      display: flex;
      border-bottom: 1px solid $table-color-borderline;

      td {
        flex: 1 0 0;
        box-sizing: border-box;
        padding: 15px 10px;
        &.fixed {
          flex: 0 0 auto;
        }
      }
      td:first-child {
        padding-left: 20px;
      }
      td:last-child.table-col-action {
        padding-right: 20px;
      }
      .table-col-checkbox {
        flex: 0 0 50px;
      }
      .table-header-item {
        &.icon-column {
          flex: 0 0 50px;
        }
        &.custom-action {
          flex: 0 0 88px;
          max-width: 88px;
          &.multi-action {
            flex: 0 0 176px;
            max-width: 176px;  // IE11 Hack: Apply max-width on flex children so box-sizing   would work
            display: flex;
            // justify-content: space-between;
          }
        }
      }
      .table-col-action {
        flex: 0 0 60px;
        max-width: 60px;  // IE11 Hack: Apply max-width on flex children so box-sizing would work
        display: flex;
        align-items: center;
        &.multi-action {
          flex: 0 0 110px;
          max-width: 110px;  // IE11 Hack: Apply max-width on flex children so box-sizing would work
          display: flex;  // IE11 need flex to grow the width
          align-items: center;
        }
      }
    }
  }

  tbody {
    background: $table-data-background;
    tr {
      height: $table-row-height;
      display: flex;
      width: inherit;
      overflow: hidden;
      border-bottom: 1px solid $table-color-borderline;
      &.highlight {
        background-color: #e6e6e6;
      }
      td {
        flex: 1 0 0px;
        // min-width: 100px;
        box-sizing: border-box;
        padding: 15px 10px;
        &.fixed {
          flex: 0 0 auto;
        }
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      td:first-child {
        padding-left: 20px;
      }
      td:last-child.table-col-action {
        padding-right: 20px;
      }
      .table-col-checkbox {
        flex: 0 0 50px;
      }
      .table-body-item {
        &.icon-column {
          flex: 0 0 50px;
        }
        &.custom-action {
          flex: 0 0 88px;
          max-width: 88px;
          &.multi-action {
            flex: 0 0 176px;
            max-width: 176px;  // IE11 Hack: Apply max-width on flex children so box-sizing   would work
            display: flex;
            justify-content: space-between;
          }
          .actions {
            width: 88px;
            &.primary {
              color: $color-primary;
            }
            &:hover {
              cursor: pointer;
            }
          }
        }
      }
      .table-col-action {
        flex: 0 0 60px;
        max-width: 60px;  // IE11 Hack: Apply max-width on flex children so box-sizing would work
        display: flex;
        align-items: center;
        &.multi-action {
          flex: 0 0 110px;
          max-width: 110px;  // IE11 Hack: Apply max-width on flex children so box-sizing would work
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .actions {
          &.primary {
            color: $color-primary;
          }
          &.error {
            color: $color-error;
          }
          &:hover {
            cursor:pointer;
          }
        }
      }
    }
  }
}

.href {
  @include click-button();
  color: $color-primary;
}

.tags {
  &.tag {
    margin: 0 5px;
    &:first-child {
      margin-left: 0px;
    }
  }
}
input[type=checkbox]{
  @include general-checkbox();
}
</style>
