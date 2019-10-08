<template>
  <div id="relatedQ_and_dymanicMenu_container" class="command-selector">
    <div class="category-row">
      <div class="category-title">{{ $t('qalist.not_in_recommendation')}}： </div>
      <div class="category-value-container">
        <div class="category-value" v-for="type in show_type" :key="type.id">
          <input type="radio" v-model="selectedShow" :value="type.id" :id="`pop_${type.id}`"/>
          <label :for="`pop_${type.id}`">{{ type.label }}</label>
          </div>
      </div>
    </div>
    <div class="category-row">
      <div class="category-title">{{ $t('qalist.indicate_type')}}： </div>
      <div class="category-value-container">
        <div class="category-value" v-for="type in indicate_type" :key="type.id" :class="{disabledTip:disabledType.indexOf(type.id) !== -1}">
          <input type="radio"
          v-model="selectedType"
          :value="type.id"
          :disabled="disabledType.indexOf(type.id) !== -1"
          :id="`pop_${type.id}`"
          />
          <label :for="`pop_${type.id}`">{{ type.label }}
          </label>
          <span v-if="disabledType.indexOf('dynamic_menu') === -1" class="disabled-tip-text"> {{ $t('qalist.existed_dynamic_menu') }}</span>
          <span v-else-if="disabledType.indexOf('relatedQ') === -1" class="disabled-tip-text"> {{ $t('qalist.existed_related_questions') }}</span>
        </div>
      </div>
    </div>
    <div class="category-row">
      <div class="category-title" v-if="selectedType !== 'not_indicate'"> {{ $t('qalist.indicate_question')}}：
      </div>
      <div class="dynamic-lists">
        <dynamic-list v-if="selectedType === 'dynamic_menu'" v-model="dynamic_menu" key="dynamic_menu" @contentChange="handleContentChange"></dynamic-list>
        <dynamic-list v-else-if="selectedType === 'relatedQ'" v-model="related_q" key="relatedQ" @contentChange="handleContentChange"></dynamic-list>
      </div>
    </div>
    
  </div>
</template>

<script>
import DynamicList from './DynamicList';

export default {
  components: {
    DynamicList,
  },
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      show_type: [{
        id: 'yes',
        label: this.$t('general.yes'),
      }, {
        id: 'no',
        label: this.$t('general.no'),
      }],

      indicate_type: [{
        id: 'dynamic_menu',
        label: this.$t('qalist.select_dynamic_menu'),
      }, {
        id: 'relatedQ',
        label: this.$t('qalist.select_related_questions'),
      }, {
        id: 'not_indicate',
        label: this.$t('qalist.not_indicate'),
      }],

      dynamic_menu: {
        contents: this.value.dynamic_menu,
        contentMaxNum: 1000,
        totalRow: this.value.dynamic_menu.length,
      },
      related_q: {
        contents: this.value.related_q,
        contentMaxNum: 1000,
        totalRow: this.value.related_q.length,
      },

      selectedShow: this.value.not_show ? 'no' : 'yes',
      selectedType: this.value.selected,
    };
  },
  computed: {
    disabledType() {
      const isDynamicMenuEmpty = (this.value.dynamic_menu.length === 0);
      const isRelatedQEmpty = (this.value.related_q.length === 0);
      if (isDynamicMenuEmpty && isRelatedQEmpty) {
        return [];
      } else if (!isDynamicMenuEmpty) {
        return ['relatedQ', 'not_indicate'];
      } else if (!isRelatedQEmpty) {
        return ['dynamic_menu', 'not_indicate'];
      }
      return [];
    },
  },
  watch: {
    selectedType() {
      this.value.selected = this.selectedType;
    },
    selectedShow() {
      this.value.not_show = (this.selectedShow === 'no');
    },
  },
  methods: {
    handleContentChange(content) {
      const filteredContent = content.filter(val => val !== '');
      if (this.selectedType === 'dynamic_menu') {
        this.value.dynamic_menu = filteredContent;
      } else if (this.selectedType === 'relatedQ') {
        this.value.related_q = filteredContent;
      }
    },
    getHandleList() {
      if (this.selectedType === 'dynamic_menu') {
        this.value.dynamic_menu = this.value.dynamic_menu.filter(val => val !== '');
        return this.value.dynamic_menu;
      } else if (this.selectedType === 'relatedQ') {
        this.value.related_q = this.value.related_q.filter(val => val !== '');
        return this.value.related_q;
      }
      return [];
    },
    validate() {
      const handleList = this.getHandleList();
      const uniqueList = this.getDeduplicated(handleList);
      if (uniqueList.length !== handleList.length) {
        this.popNoticeDuplicateWindow();
      } else {
        this.checkDuplicate(handleList);
        this.$emit('validateSuccess');
      }
    },
    popNoticeDuplicateWindow() {
      const that = this;
      const options = {
        ok_msg: this.$t('general.ok'),
        cancel_msg: this.$t('general.cancel'),
        callback: {
          ok: () => {
            const handleList = this.getHandleList();
            this.checkDuplicate(handleList);
            that.$emit('validateSuccess');
          },
        },
        data: {
          msg: that.$t('qalist.warn_auto_deduplicate_input_questions'),
        },
      };
      this.$popCheck(options);
    },
    getDeduplicated(content) {
      const ret = [];
      content.forEach((x) => {
        const text = x.trim();
        if (ret.indexOf(text) === -1) {
          ret.push(text);
        }
      });
      return ret;
    },
    checkDuplicate(content) {
      const len = content.length;
      let val = '';
      for (let idx = len - 1; idx > 0; idx -= 1) {
        val = content[idx];
        if (content.slice(0, idx).includes(val)) {
          content.splice(idx, 1);
        }
      }
    },
  },
  mounted() {
    this.$on('validate', this.validate);
  },
};
</script>
<style lang="scss" scoped>
$row-height: 30px;
#relatedQ_and_dymanicMenu_container{
  width: 520px;
}
.category-row .dynamic-lists {
  height: 420px;
}
.category-row .dynamic-lists input {
  display: inline-block;
}

.category-value input:disabled + label {
  cursor: not-allowed;
  color:  #d7dde4;
}

.category-value {
  position: relative;
}

.disabled-tip-text {
    visibility: hidden;
    width: 120px;
    line-height: 20px;
    background-color: #d7dde4;
    color: #000;
    text-align: center;
    font-size: 11px;
    border-radius: 5px;
    padding: 0;
    position: absolute;
    z-index: 1;
    bottom: 100%;
    left: 50%;
    margin-left: -60px;
}

.category-value.disabledTip .disabled-tip-text::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #d7dde4 transparent transparent transparent;
}

.category-value.disabledTip:hover .disabled-tip-text {
    visibility: visible;
}
.command-selector {
  min-width: 500px;
  .category-row {
    display: flex;
    line-height: $row-height;
    .category-title {
      min-width: 80px;
    }
    .category-all-check {
      min-width: 120px;
    }
    .category-value-container {
      display: inline-block;
      .category-value {
        display: inline-block;
        margin: 0 10px;
      }
    }
    
    input {
      display: none;

      &:checked + label {
        border-radius: 5px;
        background: white;
        color: #0099FF;
        border: 1px solid #0099FF;
      }

      & + label {
        padding: 2px 5px;
        cursor: pointer;
        user-select: none;
      }
    }
  }
}
</style>
