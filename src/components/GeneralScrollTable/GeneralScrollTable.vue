<template>
  <div class="general-table-container" :class="[showEmpty ? 'show-empty': '']">
    <div class="general-table-header">
    <div ref="tableHeader" class="table general-table auto-height" :class="[fontClass]">
      <div class="thead">
        <div class="table-layout-left" :class="{'has-scroll-x': isScrollbarXShown}">
          <div class="tr">
            <div v-if="checkbox" class="td table-col-checkbox table-header-item">
              <input type="checkbox" @click="checkAll" :checked="isAllChecked">
            </div>
            <template v-for="headerLeft in tableColumnLeft()">
              <div :key="headerLeft.key"
              :style="{width: headerLeft.width}"
              :class="columnClassObject(headerLeft)"
              class="td table-header-item">
                {{ headerLeft.text }}
                <div v-if="headerLeft.info && headerLeft.info !== ''"
                  :ref="`${headerLeft.key}-info`"
                  class="table-header-icon"
                  v-tooltip="headerInfoTooltip"
                  @mouseover="updateHeaderInfoTooltip(headerLeft)"
                >
                  <icon :ref="`${headerLeft.key}-icon`" icon-type="info" :size=16 enableHover></icon>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div ref="tableHeaderScroll" class="table-layout-middle">
          <div class="tr">
            <template v-for="header in tableHeader">
              <div v-if="isTableColumnMiddle(header)"
                :key="header.key" 
                :style="{width: header.width}"
                :class="columnClassObject(header)"
                class="td table-header-item">
                  {{ header.text }}
                <div v-if="header.info && header.info !== ''" :ref="`${header.key}-info`"
                  class="table-header-icon"
                  v-tooltip="headerInfoTooltip"
                  @mouseover="updateHeaderInfoTooltip(header)"
                >
                  <icon :ref="`${header.key}-icon`" icon-type="info" :size=16 enableHover></icon>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div class="table-layout-right"
          :class="{
            'has-action': action.length !== 0 || $scopedSlots.menu,
            'multi-action': action.length > 1,
            'has-custom-header': allowCustomHeader,
            'has-scroll-x': isScrollbarXShown,
          }"
          :style="layoutRightStyle(action.length, allowCustomHeader, tableColumnRight())">
          <div class="tr">
            <template v-for="headerRight in tableColumnRight()">
              <div :key="headerRight.key"
              :style="{
                width: headerRight.width,
                maxWidth: headerRight.width,
                flexBasis: headerRight.width,
              }"
              :class="columnClassObject(headerRight)"
              class="td table-header-item">
                {{ headerRight.text }}
                <div v-if="headerRight.info && headerRight.info !== ''"
                  :ref="`${headerRight.key}-info`"
                  class="table-header-icon"
                  v-tooltip="headerInfoTooltip"
                  @mouseover="updateHeaderInfoTooltip(headerRight)"
                >
                  <icon :ref="`${headerRight.key}-icon`" icon-type="info" :size=16 enableHover></icon>
                </div>
              </div>
            </template>
            <div v-if="hasAction" class="td table-col-action table-header-item" :class="{'multi-action': action.length > 1}" :style="multiActionStyle(action.length)">
              {{ $t('general.actions') }}
            </div>
            <div v-if="$scopedSlots.menu" class="td fixed menu"></div>
            <div v-if="allowCustomHeader" class="td table-col-set table-header-item">
              <icon icon-type="table_set" :size="18" enableHover @click="toggleHeaderSelector"></icon>
              <table-header-selector 
                v-if="showHeaderSelector" 
                :tableHeader="tableHeader"
                :selectedTableHeader="selectedTableHeader"
                :useDefault="useDefaultHeaderSetting"
                @close="toggleHeaderSelector"
                @selectedHeaderChange="setSelectedTableHeader"
                @changeDefault="onChangeDefaultHeaderSetting">
              </table-header-selector>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div><!-- ./end of table header -->

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
      <template v-else-if="$slots.emptyMsg">
        <slot name="emptyMsg"></slot>
      </template>
      <template v-else>
        {{ $t('general.no_data') }}
      </template>
    </div>
    <div v-else class="general-table-body">
    <div class="table general-table" :class="[autoHeight ? 'auto-height' : '', fontClass]" v-if="tableData && tableData.length > 0">
      <div class="tbody" :class="[onclickRow ? 'clickable-row' : '']">
        
        <div ref="tableBodyLeft" class="table-layout-left" :class="{'has-scroll-x': isScrollbarXShown}" @wheel="scrollRight">
          <div v-for="(data, idx) in tableData" :key="idx"
            :class="{'highlight': data.highlight, 'row-hover': data.isHover}" class="tr"
            @mouseover="hoverTableRow(data, true)"
            @mouseout="hoverTableRow(data, false)"
            >
            <div v-if="checkbox" class="td table-col-checkbox">
              <input type="checkbox" @click="checkSelf(data, idx)" :checked="data.isChecked">
            </div>
            <template v-for="headerLeft in tableColumnLeft()">
              <div :key="uniqueId(headerLeft.key, idx)"
                :style="{width: headerLeft.width}"
                :class="columnClassObject(headerLeft)"
                class="td table-body-item"
                @click="handleOnclickRow(onclickRow, data, idx)"
              >
                <div v-if="headerLeft.type === 'tag'">
                <tag class="tags" v-for="(tag, tagIdx) in data[headerLeft.key]" :key="`${tagIdx}-${tag}`" :fontClass="fontClass">{{ tag }}</tag>
              </div>
              <!-- type toggle need to have a readonly mode -->
              <template v-else-if="headerLeft.type === 'toggle'">
                <toggle class="toggles"
                  v-model="data[headerLeft.key].val"
                  :disabled="data[headerLeft.key].disabled"
                  @change="data[headerLeft.key].onclick(data, idx)"></toggle>
              </template>
              <template v-else-if="headerLeft.type === 'action'">
                <span class="actions" v-for="act in data[headerLeft.key]"
                  :key="act.text" :class="act.type" @click="act.onclick(data, idx)">
                  {{act.text}}
                </span>
              </template>
              <template v-else-if="headerLeft.type === 'icon'">
                <icon v-if="data[headerLeft.key]" :icon-type="data[headerLeft.key].iconType" :size="data[headerLeft.key].iconSize"></icon>
              </template>
              <template v-else-if="headerLeft.type === 'custom'">
                <component :is="data[headerLeft.key]" :value="data"></component>
              </template>
              <div v-else
                class="click-copy"
                :ref="`column-${uniqueId(headerLeft.key, idx)}`"
                v-tooltip="overflowTooltip"
                @mouseover="showFullText($event, data[headerLeft.key], `column-${uniqueId(headerLeft.key, idx)}`)"
                @click="copyText($event, headerLeft)"
                @mouseout="hideFullText($event, `column-${uniqueId(headerLeft.key, idx)}`)">
                  {{ data[headerLeft.key] }}
              </div>
              </div>
            </template>
          </div>
        </div><!-- ./end of tablebody table-layout-left -->

        <div ref="tableBodyScroll" class="table-layout-middle" @wheel="scrollRight">
          <div v-for="(data, idx) in tableData" :key="idx"
            :class="{'highlight': data.highlight, 'row-hover': data.isHover}" class="tr"
            @mouseover="hoverTableRow(data, true)"
            @mouseout="hoverTableRow(data, false)">
            <template v-for="header in tableHeader">
            <div v-if="isTableColumnMiddle(header)" :key="uniqueId(header.key, idx)"
              :style="{width: header.width}"
              :class="columnClassObject(header)"
              class="td table-body-item"
              @click="handleOnclickRow(onclickRow, data, idx)">
              
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
              <template v-else-if="header.type === 'custom'">
                <component :is="data[header.key]" :value="data"></component>
              </template>
              <div v-else
                class="click-copy"
                :ref="`column-${uniqueId(header.key, idx)}`"
                v-tooltip="overflowTooltip"
                @mouseover="showFullText($event, data[header.key], `column-${uniqueId(header.key, idx)}`)"
                @click="copyText($event, header)"
                @mouseout="hideFullText($event, `column-${uniqueId(header.key, idx)}`)">
                  {{ data[header.key] }}
              </div>
            </div>
            </template>
            <div class="td empty-td" :key="idx"></div>
          </div>
        </div><!-- ./end of tablebody table-layout-middle -->

        <div ref="tableBodyRight" class="table-layout-right"
          :class="{
            'has-action': action.length !== 0 || $scopedSlots.menu,
            'multi-action': action.length > 1,
            'has-custom-header': allowCustomHeader,
            'has-scroll-x': isScrollbarXShown,
          }"
          :style="layoutRightStyle(action.length, allowCustomHeader, tableColumnRight())" @scroll="syncScroll">
          <div v-for="(data, idx) in tableData" :key="idx"
            :class="{'highlight': data.highlight, 'row-hover': data.isHover}" class="tr"
            @mouseover="hoverTableRow(data, true)"
            @mouseout="hoverTableRow(data, false)">
            
            <template v-for="headerRight in tableColumnRight()">
              <div :key="uniqueId(headerRight.key, idx)"
                :style="{
                  width: headerRight.width,
                  maxWidth: headerRight.width,
                  flexBasis: headerRight.width,
                }"
                :class="columnClassObject(headerRight)"
                class="td table-body-item"
                @click="handleOnclickRow(onclickRow, data, idx)"
              >
                <div v-if="headerRight.type === 'tag'">
                  <tag class="tags" v-for="(tag, tagIdx) in data[headerRight.key]" :key="`${tagIdx}-${tag}`" :fontClass="fontClass">{{ tag }}</tag>
                </div>
                <!-- type toggle need to have a readonly mode -->
                <template v-else-if="headerRight.type === 'toggle'">
                  <toggle class="toggles"
                    v-model="data[headerRight.key].val"
                    :disabled="data[headerRight.key].disabled"
                    @change="data[headerRight.key].onclick(data, idx)"></toggle>
                </template>
                <template v-else-if="headerRight.type === 'action'">
                  <span class="actions" v-for="act in data[headerRight.key]"
                    :key="act.text" :class="act.type" @click="act.onclick(data, idx)">
                    {{act.text}}
                  </span>
                </template>
                <template v-else-if="headerRight.type === 'icon'">
                  <icon v-if="data[headerRight.key]" :icon-type="data[headerRight.key].iconType" :size="data[headerRight.key].iconSize"></icon>
                </template>
                <template v-else-if="headerRight.type === 'custom'">
                <component :is="data[headerRight.key]" :value="data"></component>
              </template>
                <div v-else
                  class="click-copy"
                  :ref="`column-${uniqueId(headerRight.key, idx)}`"
                  v-tooltip="overflowTooltip"
                  @mouseover="showFullText($event, data[headerRight.key], `column-${uniqueId(headerRight.key, idx)}`)"
                  @click="copyText($event, headerRight)"
                  @mouseout="hideFullText($event, `column-${uniqueId(headerRight.key, idx)}`)">
                    {{ data[headerRight.key] }}
                </div>
              </div>
            </template>
            
            <div v-if="hasAction" class="td table-col-action" :class="{'multi-action': action.length > 1}" :style="multiActionStyle(action.length)">
              <template v-for="act in action">
              <span class="actions" 
                :key="act.text" :class="[act.type, {'action-disabled':(data.action_clickable && !data.action_clickable[act.key]) }]"
                @click="act.onclick(data, idx)"
                v-if="data.action_enable === undefined || (data.action_enable && data.action_enable[act.key])"
              > {{ act.text }}</span>
              </template>
            </div>
            <template v-if="$scopedSlots.menu">
              <div class="td fixed menu">
                <icon iconType="more" enableHover :size=15 @click="moreClick(idx)" style="position: initial"></icon>
              </div>
              <div v-if="idx === indexOfShowMenu" class="td menu-container"><slot name="menu" :rowData="data" :rowIndex="idx"></slot></div>
            </template>
            <div v-if="allowCustomHeader" class="td table-col-set"></div>
          </div>
        </div><!-- ./end of tablebody table-layout-right -->
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import event from '@/utils/js/event';
import misc from '@/utils/js/misc';
import Tag from '@/components/basic/Tag';
import Toggle from '@/components/basic/Toggle';
import TableHeaderSelector from './TableHeaderSelector';

/** Max-width of tooltip is 300px
 *  Let tooltip alignLeft if column is too close to     righthand side of table */
const TOOLTIP_WIDTH = 350;

export default {
  components: {
    Tag,
    Toggle,
    TableHeaderSelector,
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
    allowCustomHeader: {
      type: Boolean,
      required: false,
      default: false,
    },
    columnBoder: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      isAllChecked: false,
      checkedData: [],
      headerInfoTooltip: {
        msg: '',
      },
      overflowTooltip: {
        msg: '',
        eventOnly: true,
      },
      indexOfShowMenu: -1,

      // customize table header by selector
      showHeaderSelector: false,
      selectedTableHeader: [],
      useDefaultHeaderSetting: true,

      tableBodyScrollWidth: 0,
      tableBodyClientWidth: 0,

      hintDiv: undefined,
      showTimer: undefined,
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
    showTableData() {
      return !this.isLoading && this.tableData && this.tableData.length > 0;
    },
    isScrollbarXShown() {
      const that = this;
      return that.tableBodyScrollWidth > that.tableBodyClientWidth;
    },
  },
  watch: {
    tableHeader() {
      this.resetSelectedHeader();
    },
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
    showTableData(show) {
      const that = this;
      if (show) {
        that.$nextTick(() => {
          that.$refs.tableBodyScroll.addEventListener('scroll', that.scrollTableHeader);
        });
      } else {
        that.$refs.tableBodyScroll.removeEventListener('scroll', that.scrollTableHeader);
      }
    },
  },
  methods: {
    /** Table Data Shown */
    tableColumnLeft() {
      return this.tableHeader.filter(header => header.lockedLeft);
    },
    isTableColumnMiddle(header) {
      if (this.allowCustomHeader) {
        return this.isSelectedHeader(header.key) && !header.lockedLeft && !header.lockedRight;
      }
      return !header.lockedLeft && !header.lockedRight;
    },
    tableColumnRight() {
      return this.tableHeader.filter(header => header.lockedRight);
    },

    /** Table Style */
    layoutRightStyle(columnNum, allowCustomHeader, tableRight) {
      let width = 0;
      if (tableRight.length > 0) {
        tableRight.forEach((column) => {
          width += parseInt(column.width.replace('px', ''), 10);
        });
      }
      if (columnNum >= 1) {
        width += (40 * columnNum) + 30;
      }
      if (allowCustomHeader) {
        width += 60;
      }
      return {
        flex: `0 0 ${width}px`,
        maxWidth: `${width}px`,
      };
    },
    multiActionStyle(columnNum) {
      if (columnNum >= 1) {
        const multiActionWidth = (40 * columnNum) + 30;
        return {
          flex: `0 0 ${multiActionWidth}px`,
          maxWidth: `${multiActionWidth}px`,
        };
      }
      return {
        flex: '0 0 80px',
        maxWidth: '80px',
      };
    },
    columnClassObject(header) {
      return {
        fixed: header.width,
        'custom-action': header.type === 'action',
        'multi-action': this.hasMultiCustomAction,
        'icon-column': header.type === 'icon',
        'column-border': this.columnBoder,
      };
    },
    uniqueId(key, idx) {
      // using idx of rowData to produce unique key for array type tag instead of using random key
      return `${idx}-${key}`;
    },
    /** ./end Table Style */


    /** Checkbox Behaviors */
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
    /** ./end Checkbox Behaviors */


    handleOnclickRow(onclickRow, data, idx) {
      if (onclickRow !== undefined) {
        onclickRow(data, idx);
      }
    },
    hoverTableRow(data, hover) {
      data.isHover = hover;
      this.$forceUpdate();
    },
    updateHeaderInfoTooltip(header) {
      const tableHeaderDom = this.$refs.tableHeader;
      const infoIconBlockDom = this.$refs[`${header.key}-info`][0];
      const tableHeaderRightPos = tableHeaderDom.getBoundingClientRect().right;
      const infoIconRightPos = infoIconBlockDom.getBoundingClientRect().right;

      /** Max-width of tooltip is 300px,
      /*  Let tooltip alignLeft if infoIcon is too close to righthand side of table */
      if (tableHeaderRightPos - infoIconRightPos < TOOLTIP_WIDTH) {
        this.headerInfoTooltip.alignLeft = true;
      } else {
        this.headerInfoTooltip.alignLeft = false;
      }
      this.headerInfoTooltip.msg = header.info;
      infoIconBlockDom.dispatchEvent(event.createEvent('tooltip-reload'));
    },
    copyText(e, header) {
      console.log(header.type);
      if (['toggle', 'action', 'icon', 'custom'].indexOf(header.type) >= 0) {
        return;
      }
      const text = e.target.innerText;
      if (text === '') {
        return;
      }
      misc.copyToClipboard(text);

      let showText = text.substring(0, 10);
      if (showText.length !== text.length) {
        showText = `${showText}...`;
      }
      this.$notify({ text: `${this.$t('general.copy')} ${showText}` });
    },
    showFullText(e, text, refName) {
      const that = this;

      if (!misc.isEllipsisActive(e.target)) return;

      const columnDom = that.$refs[refName][0];
      const tableHeaderDom = that.$refs.tableHeader;
      const columnDomRightPos = columnDom.getBoundingClientRect().right;
      const tableHeaderRightPos = tableHeaderDom.getBoundingClientRect().right;

      that.showCopyHint(
        columnDom.getBoundingClientRect().left + columnDom.offsetWidth,
        columnDom.getBoundingClientRect().top);

      if (tableHeaderRightPos - columnDomRightPos < TOOLTIP_WIDTH) {
        that.overflowTooltip.alignLeft = true;
      } else {
        that.overflowTooltip.alignLeft = false;
      }
      that.overflowTooltip.msg = text;
      const ref = Array.isArray(that.$refs[refName]) ? that.$refs[refName][0] : that.$refs[refName];
      ref.dispatchEvent(event.createEvent('tooltip-reload'));
      ref.dispatchEvent(event.createEvent('tooltip-show'));
    },
    hideFullText(e, refName) {
      const that = this;
      if (!misc.isEllipsisActive(e.target)) return;
      that.hideCopyHint();
      const ref = Array.isArray(that.$refs[refName]) ? that.$refs[refName][0] : that.$refs[refName];
      ref.dispatchEvent(event.createEvent('tooltip-hide'));
    },
    moreClick(index, e) {
      const rect = e.target.getBoundingClientRect();
      const top = document.documentElement.scrollTop + rect.top;
      const windowWidth = window.innerWidth || document.body.clientWidth;
      this.indexOfShowMenu = index;
      this.menuStyle = {
        top: `${top}px`,
        right: `${windowWidth - rect.right - (rect.width / 2)}px`,
      };
    },


    /** Custom Header Selector */
    hideMenu() {
      this.indexOfShowMenu = -1;
    },
    toggleHeaderSelector() {
      this.showHeaderSelector = !this.showHeaderSelector;
    },
    setSelectedTableHeader(selectedHeader) {
      this.selectedTableHeader = selectedHeader;
    },
    onChangeDefaultHeaderSetting(useDefault) {
      this.useDefaultHeaderSetting = useDefault;
    },
    isSelectedHeader(key) {
      return this.selectedTableHeader.find(headerKey => headerKey === key) !== undefined;
    },
    resetSelectedHeader() {
      if (this.allowCustomHeader) {
        this.selectedTableHeader = this.tableHeader
          .filter(header => header.lockedLeft === true
            || header.lockedRight === true
            || header.default === true)
          .map(header => header.key);
      }
    },
    /** ./end Custom Header Selector */


    /** Table Scroll Behavior */
    scrollTableHeader(e) {
      const that = this;
      that.$refs.tableHeaderScroll.scrollLeft = e.target.scrollLeft;
    },
    detectTableBodyScroll() {
      const that = this;
      if (that.$refs.tableBodyScroll) {
        that.tableBodyScrollWidth = that.$refs.tableBodyScroll.scrollWidth;
        that.tableBodyClientWidth = that.$refs.tableBodyScroll.clientWidth;
      } else {
        that.tableBodyScrollWidth = 0;
        that.tableBodyClientWidth = 0;
      }
    },
    syncScroll() {
      const that = this;
      const right = that.$refs.tableBodyRight;
      const left = that.$refs.tableBodyLeft;
      const main = that.$refs.tableBodyScroll;
      left.scrollTop = right.scrollTop;
      main.scrollTop = right.scrollTop;
    },
    scrollRight(e) {
      this.$refs.tableBodyRight.scrollTop += e.deltaY;
      this.syncScroll();
    },
    showCopyHint(x, y) {
      if (this.hintDiv) {
        this.showTimer = setTimeout(() => {
          this.hintDiv.style.visibility = 'visible';
          this.hintDiv.style.left = `${x}px`;
          this.hintDiv.style.top = `${y}px`;
        }, 1000);
      }
    },
    hideCopyHint() {
      if (this.hintDiv) {
        if (this.showTimer) {
          clearTimeout(this.showTimer);
          this.showTimer = undefined;
        }
        this.hintDiv.style.visibility = 'hidden';
      }
    },
    createCopyHint() {
      const hintDiv = document.createElement('div');
      const body = document.querySelector('body');
      hintDiv.style.backgroundImage = 'url(/static/clickToCopy.png)';
      hintDiv.style.width = '70px';
      hintDiv.style.height = '18px';
      hintDiv.style.position = 'fixed';
      hintDiv.style.top = '0';
      hintDiv.style.left = '0';
      hintDiv.style.visibility = 'hidden';
      body.appendChild(hintDiv);
      this.hintDiv = hintDiv;
    },
    removeCopyHint() {
      const body = document.querySelector('body');
      body.removeChild(this.hintDiv);
    },
  },
  mounted() {
    console.log(this.$slots);
    if (this.checkbox) {
      this.tableData.forEach((data) => {
        data.isChecked = false;
      });
      this.isAllChecked = false;
      // this.setCheckedData();
      // this.$emit('checkedChange', this.checkedData);
    }

    this.tableData.forEach((data) => {
      data.isHover = false;
    });
    this.resetSelectedHeader();
    document.body.addEventListener('click', this.hideMenu, true);

    window.addEventListener('resize', this.detectTableBodyScroll);
    this.$nextTick(() => {
      if (this.showTableData) {
        this.$nextTick(() => {
          this.$refs.tableBodyScroll.addEventListener('scroll', this.scrollTableHeader);
        });
      }
    });
    this.createCopyHint();
  },
  updated() {
    const that = this;
    that.detectTableBodyScroll();
  },
  beforeDestroy() {
    document.body.removeEventListener('click', this.hideMenu, true);
    window.removeEventListener('resize', this.detectTableBodyScroll);
    this.removeCopyHint();
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
$table-action-width: 80px;

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
    border-bottom: 1px solid $table-color-borderline;
    .table {
      // display: table;
      overflow: visible;
    }
    .thead {
      position: relative;
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
    .auto-height {
      .thead {
        .tr {
          height: auto;
          max-height: 90px;
          .td:not(.table-col-set):not(.table-col-action):not(.table-col-checkbox) {
            min-width: $table-cell-min-width;
          }
        }
      }
    }
  }
  .menu {
    width: 50px;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .menu-container {
    position: fixed;
  }
  .general-table-body {
    overflow-x: hidden;
    flex: 1;

    display: flex;
    flex-direction: column;

    .general-table {
      flex: 1;

      display: flex;
      flex-direction: column;
    }

    .tbody {
      flex: 1;
      position: relative;
      overflow: hidden;
      .table-layout-left {
        overflow-y: hidden;
      }
      .table-layout-middle {
        overflow-y: hidden;
      }
      .table-layout-right {
        @include auto-overflow-Y();
        @include customScrollbar();
        overflow-x: hidden;
      }
    }
    .table-body-item {
      display: flex;
      align-items: center;
      div {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        word-break: break-all;
      }
    }
    .clickable-row {
      .tr {
        cursor: pointer;
        .table-col-action, .table-col-checkbox {
          cursor: default;
        }
      }
    }

    .auto-height {
      .thead {
        .tr {
          height: auto;
        }
      }
      .tbody {
        .tr {
          height: auto;
          .td {
            text-overflow: unset;
            overflow: unset;
            white-space: unset;
            word-break: break-all;

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

$table-layout-right-flex-basis: 60px;
.table {
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
  .thead {
    background: $table-header-background;
    display: flex;
    .table-layout-left {
      &.has-scroll-x {
        box-shadow: 2px 0px 4px 0px rgba(115, 115, 115, 0.2);
      }
      flex: 0 0 auto;
      display: flex;
    }
    .table-layout-middle {
      flex: 1;
      overflow: hidden;
      display: flex;
    }

    
    .table-layout-right {
      display: flex;
      &.has-scroll-x {
        box-shadow: -2px 0px 4px 0px rgba(115, 115, 115, 0.2);
      }
      &.has-action {
        flex: 0 0 $table-action-width;
        display: flex;
        align-items: center;
        &.has-custom-header {
          flex: 0 0 140px;
        }
        &.multi-action {
          flex: 0 0 110px;
          &.has-custom-header {
            flex: 0 0 170px;
          }
        }
      }
      &.has-custom-header {
        flex: 0 0 60px;
      }
    }

    .tr {
      height: $table-row-height;
      display: flex;
      // border-bottom: 1px solid $table-color-borderline;

      .td {
        flex: 1 0 0px;
        box-sizing: border-box;
        padding: 15px 10px;
        &.fixed {
          flex: 0 0 auto;
        }
      }
      .td:first-child {
        padding-left: 20px;
      }
      .td:last-child.table-col-action {
        padding-left: 20px;
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
        &.column-border{
          border-right: 1px solid $table-color-borderline;
        }
      }
      .table-col-action {
        flex: 0 0 $table-action-width;
        max-width: $table-action-width;  // IE11 Hack: Apply max-width on flex children so box-sizing would work
        &.multi-action {
          // flex: 0 0 110px;
          // max-width: 110px;  // IE11 Hack: Apply max-width on flex children so box-sizing would work
          display: flex;  // IE11 need flex to grow the width
        }
      }
      .table-col-set {
        flex: 0 0 60px;
        padding-right: 20px;
        max-width: 60px;  // IE11 Hack: Apply max-width on flex children so box-sizing would work
        position: relative;
      }
    }
  }

  .tbody {
    background: $table-data-background;
    display: flex;
    .table-layout-left {
      position: relative; // Fix background remove box-shadow issue
      &.has-scroll-x {
        z-index: 3;         // Fix background remove box-shadow issue
        box-shadow: 2px 0px 4px 0px rgba(115, 115, 115, 0.2);
      }
      flex: 0 0 auto;
    }
    .table-layout-middle {
      flex: 1;
      @include customScrollbar();
      @include auto-overflow-X();
      .tr {
        // min-width: max-content;
        .td {
          min-width: $table-cell-min-width;
          &.empty-td {
            flex: 1;
            min-width: 0;
            padding: 0px;
          }
        }
      }
    }
    .table-layout-right {
      &.has-scroll-x {
        position: relative; // Fix background remove box-shadow issue
        z-index: 3;         // Fix background remove box-shadow issue
        box-shadow: -2px 0px 4px 0px rgba(115, 115, 115, 0.2);
      }
      &.has-action {
        flex: 0 0 $table-action-width;
        &.has-custom-header {
          flex: 0 0 140px;
        }
        &.multi-action {
          flex: 0 0 110px;
          &.has-custom-header {
            flex: 0 0 170px;
          }
        }
      }
      &.has-custom-header {
        flex: 0 0 60px;
      }
    }

    .tr {
      height: $table-row-height;
      display: flex;
      
      &.highlight {
        background-color: #e6e6e6;
      }
      &.row-hover {
        background-color: #F6F9FF;
        .td {
          background-color: #F6F9FF;
        }
      }
      

      .td {
        border-bottom: 1px solid $table-color-borderline;
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
      .td:first-child {
        padding-left: 20px;
      }
      .td:last-child.table-col-action {
        padding-left: 20px;
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
            pointer-events: none; // default use none
            &.primary {
              color: $color-primary;
              cursor: pointer;
              pointer-events: auto;
            }
            &.error {
              color: $color-error;
              cursor: pointer;
              pointer-events: auto;
            }
          }
        }
        &.column-border{
          border-right: 1px solid $table-color-borderline;
        }
      }
      .table-col-action {
        flex: 0 0 $table-action-width;
        max-width: $table-action-width;  // IE11 Hack: Apply max-width on flex children so box-sizing would work
        &.multi-action {
          // flex: 0 0 110px;
          // max-width: 110px;  // IE11 Hack: Apply max-width on flex children so box-sizing would work
          display: flex;
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

          &.action-disabled {
            color: $color-font-disabled;
            pointer-events: none;
          }
        }
      }
      .table-col-set {
        flex: 0 0 60px;
        max-width: 60px;  // IE11 Hack: Apply max-width on flex children so box-sizing would work
        padding-right: 20px;
      }
    }
  }
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
