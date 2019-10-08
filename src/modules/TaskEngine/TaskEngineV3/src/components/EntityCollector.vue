<template lang="html">
  <div id="entity-collector" class="entity-collector-container" @mouseover="moreIcon = true" @mouseleave="moreIcon = false">
    <div class="order_column">
      <icon :size=20 icon-type="daggle"/>
      <div>{{order+1}}</div>
    </div>
    <div class="required_column">
      <input type="checkbox" v-model="entityCollector.required" @change="updateData">
    </div>
    <div class="entity_name_column">
      <input class="full_width" type="text" name="entity_name" 
        :placeholder="$t('task_engine_v3.entity_collecting_page.entity_name_placeholder')"
        v-model="entityCollector.entityName"
        @input="updateData"
      >
    </div>
    <div class="entity_type_column">
      <dropdown-select
        ref="categorySelect"
        v-model="category"
        :options="categoryList"
        :width="`150px`"
        :fixedListWidth="false"
        @input="changeEntityCategory"
      />
      <dropdown-select
        ref="entityTypeSelect"
        v-model="entityType"
        :options="entityTypeList"
        :width="`150px`"
        :fixedListWidth="false"
        @input="updateData"
      />
      <!--
        <input type="button" class="btn-basic" @click="addCustomEntityType" :value="$t('general.add')">
        <input type="button" class="btn-basic" @click="editCustomEntityType" :value="$t('general.modify')" v-if="entityCollector.ner !== undefined && entityCollector.ner.sourceType === 'custom'">
        <input type="button" class="btn-basic" @click="deleteCustomEntityType" :value="$t('general.delete')" v-if="entityCollector.ner !== undefined && entityCollector.ner.sourceType === 'custom'">
      -->
    </div>
    <div class="prompt_column">
      <input class="full_width" type="text" name="prompt" 
        :placeholder="$t('task_engine_v3.entity_collecting_page.prompt_placeholder')"
        v-model="entityCollector.prompt"
        @input="updateData"
      >
    </div>
    <div class="retry_times_column">
      <input type="number" v-model="entityCollector.retry_num" @input="updateData">
    </div>
    <div class="more_setting_column">
      <div class="icon_container" v-show="moreIcon" v-dropdown="moreOptions">
        <icon :size=25 icon-type="more_blue"/>
      </div>
    </div>
  </div>
</template>

<script>
import DropdownMenu from '@/components/basic/DropdownMenu';
import CustomEntityTypeEditorPop from './CustomEntityTypeEditorPop';
import i18nUtils from '../utils/i18nUtil';

export default {
  name: 'entity-collector',
  components: {
    'dropdown-menu': DropdownMenu,
  },
  props: {
    initialEntityCollector: {
      type: Object,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    initialCategoryToNerTypeMap: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      i18n: {},
      moreIcon: false,
      entityCollector: {},
      categoryToNerTypeMap: {},
      moreOptions: {},
    };
  },
  computed: {
    entityType: {
      get() {
        return [this.entityCollector.ner.entityType];
      },
      set(newValue) {
        this.categoryToNerTypeMap[this.entityCollector.entityCategory].forEach((ner) => {
          if (ner.entityType === newValue[0]) {
            this.entityCollector.ner = ner;
          }
        });
      },
    },
    entityTypeList() {
      return this.categoryToNerTypeMap[this.entityCollector.entityCategory].map(
              ner => ({ text: ner.entityType, value: ner.entityType }));
    },
    category: {
      get() {
        return [this.entityCollector.entityCategory];
      },
      set(newValue) {
        this.entityCollector.entityCategory = newValue[0];
      },
    },
    categoryList() {
      return Object.keys(this.categoryToNerTypeMap).map(
              category => ({ text: category, value: category }));
    },
  },
  watch: {},
  methods: {
    hasNER(nerList, ner) {
      if (ner === undefined) { return false; }
      for (let i = 0; i < nerList.length; i += 1) {
        if (nerList[i].entityCategory === ner.entityCategory &&
           nerList[i].entityType === ner.entityType &&
           nerList[i].sourceType === ner.sourceType &&
           nerList[i].slotType === ner.slotType
          ) { return true; }
      }
      return false;
    },
    changeEntityCategory() {
      // update entityCategory and NER
      const cat = this.entityCollector.entityCategory;
      if (this.categoryToNerTypeMap[cat]) {
        if (!this.hasNER(this.categoryToNerTypeMap[cat], this.entityCollector.ner)) {
          this.entityCollector.ner = this.categoryToNerTypeMap[cat][0];
        } // else: NER remain the same.
      } else {
        this.entityCollector.ner = undefined;
      }
      this.updateData();
      this.$refs.entityTypeSelect.$emit('updateOptions', this.entityTypeList);
      this.$refs.entityTypeSelect.$emit('select', this.entityCollector.ner.entityType);
    },
    deleteCustomEntityType() {
      this.$emit('deleteCustomNer', this.entityCollector.ner);
      this.entityCollector.ner = this.categoryToNerTypeMap[this.entityCollector.entityCategory][0];
      this.$nextTick(() => {
        this.categoryToNerTypeMap = JSON.parse(JSON.stringify(this.initialCategoryToNerTypeMap));
      });
    },
    editCustomEntityType() {
      const that = this;
      that.$pop({
        title: '',
        component: CustomEntityTypeEditorPop,
        validate: true,
        data: {
          customEntity: that.entityCollector.ner,
          nerCategoryList: Object.keys(that.categoryToNerTypeMap),
        },
        callback: {
          ok: (ner) => {
            that.$emit('addCustomNer', ner);
            that.$nextTick(() => {
              that.categoryToNerTypeMap =
                JSON.parse(JSON.stringify(that.initialCategoryToNerTypeMap));
            });
            that.entityCollector.ner = ner;
          },
        },
      });
    },
    addCustomEntityType() {
      const that = this;
      that.$pop({
        title: '',
        component: CustomEntityTypeEditorPop,
        validate: true,
        data: {
          customEntity: {
            id: that.$uuid.v1(),
            entityType: null,
            entityTypeDescription: null,
            entityCategory: that.entityCollector.entityCategory,
            entitySynonymsList: [],
            sourceType: 'custom',
            slotType: 'pText',
          },
          nerCategoryList: Object.keys(that.categoryToNerTypeMap),
        },
        callback: {
          ok: (ner) => {
            that.$emit('addCustomNer', ner);
            that.$nextTick(() => {
              that.categoryToNerTypeMap =
                JSON.parse(JSON.stringify(that.initialCategoryToNerTypeMap));
            });
            that.entityCollector.ner = ner;
          },
        },
      });
    },
    updateData() {
      this.$emit('updateData', this.entityCollector);
    },
    deleteThisEntityCollector() {
      this.$emit('deleteEntityCollectorButtonClick');
    },
  },
  beforeMount() {
    this.i18n = i18nUtils.getLocaleMsgs(this.$i18n);
    this.entityCollector = JSON.parse(JSON.stringify(this.initialEntityCollector));
    this.categoryToNerTypeMap = JSON.parse(JSON.stringify(this.initialCategoryToNerTypeMap));
    this.moreOptions = {
      options: [{
        text: this.i18n.task_engine_v3.entity_collecting_page.delete,
        onclick: this.deleteThisEntityCollector,
      }],
      alignLeft: true,
    };
  },
  mounted() {
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
@import "../scss/entityCollectingPage.scss";
</style>
