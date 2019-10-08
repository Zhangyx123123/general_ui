<template lang="html">
<div id="entity-collecting-page" class="page entity-collecting-page">
  <div class="tool-box">
    <div class="row">
      <div class="title-container">
        <div class="title">{{$t("task_engine_v3.entity_collecting_page.title")}}</div>
        <div class="tooltip_container" v-tooltip="{ msg: $t('task_engine_v3.entity_collecting_page.title_description')}">
          <icon icon-type="info" :enableHover="true" :size=18 />
        </div>
      </div>
      <div class="advanced-config" v-dropdown="advancedConfigOptions">
        <text-button iconType="header_dropdown_gray" :iconSize="8" iconAlign="right" width="100px">
          {{$t("task_engine_v3.entity_collecting_page.advanced_config")}}
        </text-button>
      </div>
    </div>
    <div class="row">
      <text-button button-type='primary' width='100px' height='28px' @click="addNewEntityCollector">
        {{$t("task_engine_v3.entity_collecting_page.add_new_entity_collector")}}
      </text-button>
    </div>
  </div>
  <div class="entity-collector-header-container">
    <div class="entity-collector-container">
      <div class="order_column">
        {{$t("task_engine_v3.entity_collecting_page.order")}}
        <div class="tooltip_container" v-tooltip="{ msg: $t('task_engine_v3.entity_collecting_page.order_description')}">
          <icon icon-type="info" :enableHover="true" :size=18 />
        </div>
      </div>
      <div class="required_column">
        {{$t("task_engine_v3.entity_collecting_page.required")}}
        <div class="tooltip_container" v-tooltip="{ msg: $t('task_engine_v3.entity_collecting_page.required_description')}">
          <icon icon-type="info" :enableHover="true" :size=18 />
        </div>
      </div>
      <div class="entity_name_column">
        {{$t("task_engine_v3.entity_collecting_page.entity_name")}}
        <div class="tooltip_container" v-tooltip="{ msg: $t('task_engine_v3.entity_collecting_page.entity_name_description')}">
          <icon icon-type="info" :enableHover="true" :size=18 />
        </div>
      </div>
      <div class="entity_type_column">
        {{$t("task_engine_v3.entity_collecting_page.entity_type")}}
        <div class="tooltip_container" v-tooltip="{ msg: $t('task_engine_v3.entity_collecting_page.entity_type_description')}">
          <icon icon-type="info" :enableHover="true" :size=18 />
        </div>
      </div>
      <div class="prompt_column">
        {{$t("task_engine_v3.entity_collecting_page.prompt")}}
        <div class="tooltip_container" v-tooltip="{ msg: $t('task_engine_v3.entity_collecting_page.prompt_description')}">
          <icon icon-type="info" :enableHover="true" :size=18 />
        </div>
      </div>
      <div class="retry_times_column">
        {{$t("task_engine_v3.entity_collecting_page.retry_times")}}
        <div class="tooltip_container" v-tooltip="{ msg: $t('task_engine_v3.entity_collecting_page.retry_times_description'), alignLeft: true}">
          <icon icon-type="info" :enableHover="true" :size=18 />
        </div>
      </div>
      <div class="more_setting_column"></div>
    </div>
  </div>
  <div class="entity-collector-list-container">
    <draggable v-model="entityCollectorList" :options="{ghostClass:'ghost'}" @start="drag=true" @end="drag=false">
      <div class="entity-collector-row" v-for="(entityCollector, index) in entityCollectorList" :key="entityCollector.id">
        <entity-collector
          :order="index"
          :initialEntityCollector="entityCollector"
          :initialCategoryToNerTypeMap="categoryToNerTypeMap"
          @deleteEntityCollectorButtonClick="deleteEntityCollector(index)"
          @updateData="updateData(index, $event)"
          @addCustomNer="addCustomNer"
          @deleteCustomNer="deleteCustomNer"
        ></entity-collector>
      </div>
    </draggable>
  </div>
  <!--
  <button class="btn-basic edit-entity-relation-button"
      @click="editEntityRelation"
    >{{$t("task_engine_v3.entity_collecting_page.edit_entity_relation")}}</button>
  -->
</div>
</template>

<script>
import draggable from 'vuedraggable';
import DropdownMenu from '@/components/basic/DropdownMenu';
import EntityCollector from './EntityCollector';
import EntityRelationEditPop from './EntityRelationEditPop';
import SentenceReplacementEditorPop from './SentenceReplacementEditorPop';
import TDESettingEditorPop from './TDESettingEditorPop';
import RegisterJSONEditorPop from './RegisterJSONEditorPop';
import i18nUtils from '../utils/i18nUtil';
import general from '../utils/general';

export default {
  name: 'entity-collecting-page',
  components: {
    draggable,
    'entity-collector': EntityCollector,
    'dropdown-menu': DropdownMenu,
  },
  props: {
    initialEntityCollectorList: {
      type: Array,
      required: true,
    },
    initialIdToNerMap: {
      type: Object,
      required: true,
    },
    initialRelatedEntities: {
      type: Object,
      required: true,
    },
    initialREParsers: {
      type: Array,
      required: true,
    },
    initialTDESetting: {
      type: Object,
      required: true,
    },
    initialRegisterJSON: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      i18n: {},
      entityCollectorList: [],
      idToNerMap: {},
      categoryToNerTypeMap: {},
      relatedEntities: {
        relatedEntityCollectorList: [],
        relatedEntityMatrix: [],
      },
      re_parsers: [],
      tde_setting: {},
      register_json: {},
      advancedConfigOptions: {},
    };
  },
  computed: {},
  watch: {
    entityCollectorList() {
      this.$emit('update', this.entityCollectorList);
      this.$emit('update:valid', this.isValid());
    },
  },
  methods: {
    propEntityCollectorList(newList) {
      this.entityCollectorList = JSON.parse(JSON.stringify(newList));
    },
    addCustomNer(customNer) {
      this.idToNerMap[customNer.id] = customNer;
      this.$emit('updateIdToNerMap', this.idToNerMap);
      this.updateCategoryToNerTypeMap(this.idToNerMap);
    },
    deleteCustomNer(customNer) {
      delete this.idToNerMap[customNer.id];
      this.$emit('updateIdToNerMap', this.idToNerMap);
      this.updateCategoryToNerTypeMap(this.idToNerMap);
    },
    updateCategoryToNerTypeMap(idToNerMap) {
      this.categoryToNerTypeMap = {
        通用实体类别: [
          {
            entityCategory: '通用实体类别',
            entityType: '时间日期',
            sourceType: 'system',
            slotType: 'time',
          },
          {
            entityCategory: '通用实体类别',
            entityType: '时间日期(粒度-分)(未来时间)',
            sourceType: 'system',
            slotType: 'time-minute-future',
          },
          {
            entityCategory: '通用实体类别',
            entityType: '时间日期(粒度-时)(未来时间)',
            sourceType: 'system',
            slotType: 'time-hour-future',
          },
          {
            entityCategory: '通用实体类别',
            entityType: '时间日期(粒度-天)(未来时间)',
            sourceType: 'system',
            slotType: 'time-day-future',
          },
          {
            entityCategory: '通用实体类别',
            entityType: '整数',
            sourceType: 'system',
            slotType: 'integer',
          },
          {
            entityCategory: '通用实体类别',
            entityType: '人数',
            sourceType: 'system',
            slotType: 'person-number',
          },
          {
            entityCategory: '通用实体类别',
            entityType: '姓氏',
            sourceType: 'system',
            slotType: 'last-name',
          },
          {
            entityCategory: '通用实体类别',
            entityType: '来电人姓氏',
            sourceType: 'system',
            slotType: 'your-last-name',
          },
          {
            entityCategory: '通用实体类别',
            entityType: '联络人姓氏',
            sourceType: 'system',
            slotType: 'his-last-name',
          },
          {
            entityCategory: '通用实体类别',
            entityType: '电子邮件',
            sourceType: 'system',
            slotType: 'email',
          },
          {
            entityCategory: '通用实体类别',
            entityType: '大陆手机号码',
            sourceType: 'system',
            slotType: 'mobile-mainland',
          },
          {
            entityCategory: '通用实体类别',
            entityType: '大陆固定电话号码+手机号码',
            sourceType: 'system',
            slotType: 'phone-mainland',
          },
          {
            entityCategory: '通用实体类别',
            entityType: '台湾固定电话号码+手机号码',
            sourceType: 'system',
            slotType: 'phone-taiwan',
          },
          {
            entityCategory: '通用实体类别',
            entityType: '是否',
            sourceType: 'system',
            slotType: 'binary',
          },
          {
            entityCategory: '通用实体类别',
            entityType: '车牌号码',
            sourceType: 'system',
            slotType: 'car-plate',
          },
        ],
        餐饮实体类别: [
          {
            entityCategory: '餐饮实体类别',
            entityType: '包厢还是大堂',
            sourceType: 'system',
            slotType: 'room-type',
          },
          {
            entityCategory: '餐饮实体类别',
            entityType: '宝宝椅',
            sourceType: 'system',
            slotType: 'baby-chair',
          },
          {
            entityCategory: '餐饮实体类别',
            entityType: '是否排号',
            sourceType: 'system',
            slotType: 'take-ticket',
          },
          {
            entityCategory: '餐饮实体类别',
            entityType: '特殊需求',
            sourceType: 'system',
            slotType: 'other-require',
          },
        ],
        金融实体类别: [
          {
            entityCategory: '金融实体类别',
            entityType: '信用卡号',
            sourceType: 'system',
            slotType: 'bank-card',
          },
          {
            entityCategory: '金融实体类别',
            entityType: '金钱',
            sourceType: 'system',
            slotType: 'money',
          },
        ],
      };
      Object.keys(idToNerMap).map((id) => {
        const ner = idToNerMap[id];
        const category = ner.entityCategory;
        if (this.categoryToNerTypeMap[category] === undefined) {
          this.categoryToNerTypeMap[category] = [ner];
        } else {
          this.categoryToNerTypeMap[category].push(ner);
        }
        return id;
      });
    },
    updateData(index, newEntityCollector) {
      this.entityCollectorList[index] = JSON.parse(JSON.stringify(newEntityCollector));
      this.$emit('update', this.entityCollectorList);
      this.$emit('update:valid', this.isValid());
    },
    editEntityRelation() {
      const customEntityCollectorList = this.entityCollectorList.filter(collector => collector.ner.sourceType === 'custom');
      if (customEntityCollectorList.length < 2) {
        general.popErrorWindow(this,
          this.i18n.task_engine_v3.error_msg.custom_entity_list_length_must_greater_than_two,
          '',
        );
      } else {
        const that = this;
        that.$pop({
          title: '',
          component: EntityRelationEditPop,
          validate: true,
          ok_msg: that.$t('general.add'),
          data: {
            customEntityCollectorList,
            relatedEntityCollectorList: that.relatedEntities.relatedEntityCollectorList,
            relatedEntityMatrix: that.relatedEntities.relatedEntityMatrix,
          },
          callback: {
            ok: (rtnObj) => {
              that.relatedEntities.relatedEntityCollectorList = rtnObj.relatedEntityCollectorList;
              that.relatedEntities.relatedEntityMatrix = rtnObj.relatedEntityMatrix;
              that.$emit('updateRelatedEntities', that.relatedEntities);
            },
          },
        });
      }
    },
    editSentenceReplacement() {
      const that = this;
      that.$pop({
        title: this.i18n.task_engine_v3.sentence_replacement_editor_pop.title,
        component: SentenceReplacementEditorPop,
        validate: true,
        data: {
          re_parsers: that.re_parsers,
        },
        callback: {
          ok: (reParsers) => {
            that.$emit('updateREParsers', reParsers);
            that.re_parsers = reParsers;
          },
        },
      });
    },
    editTDESetting() {
      const that = this;
      that.$pop({
        title: this.i18n.task_engine_v3.tde_setting_editor_pop.title,
        component: TDESettingEditorPop,
        validate: true,
        data: {
          tde_setting: that.tde_setting,
        },
        callback: {
          ok: (tdeSetting) => {
            that.$emit('updateTDESetting', tdeSetting);
            that.tde_setting = tdeSetting;
          },
        },
      });
    },
    editRegisterJSON() {
      const that = this;
      that.$pop({
        title: this.i18n.task_engine_v3.register_json_editor_pop.title,
        component: RegisterJSONEditorPop,
        validate: true,
        data: {
          register_json: that.register_json,
        },
        callback: {
          ok: (registerJSON) => {
            that.$emit('updateRegisterJSON', registerJSON);
            that.register_json = registerJSON;
          },
        },
      });
    },
    addNewEntityCollector() {
      const firstCategory = Object.keys(this.categoryToNerTypeMap)[0];
      const firstNer = this.categoryToNerTypeMap[firstCategory][0];
      this.entityCollectorList.push({
        id: this.$uuid.v1(),
        entityName: null,
        entityCategory: firstCategory,
        ner: firstNer,
        prompt: null,
        retry_num: 3,
        required: true,
      });
    },
    deleteEntityCollector(index) {
      this.entityCollectorList.splice(index, 1);
    },
    rerender() {
      this.entityCollectorList = JSON.parse(JSON.stringify(this.initialEntityCollectorList));
      this.idToNerMap = JSON.parse(JSON.stringify(this.initialIdToNerMap));
      this.relatedEntities = JSON.parse(JSON.stringify(this.initialRelatedEntities));
      this.re_parsers = JSON.parse(JSON.stringify(this.initialREParsers));
      this.tde_setting = JSON.parse(JSON.stringify(this.initialTDESetting));
      this.register_json = JSON.parse(JSON.stringify(this.initialRegisterJSON));
      this.updateCategoryToNerTypeMap(this.idToNerMap);
    },
    printSlotType() {
      // print ner slotType list for use of copying and pasteing to
      // SlotType list in emotigo spreadsheet upload
      let out = '';
      Object.keys(this.categoryToNerTypeMap).forEach((category) => {
        const nerList = this.categoryToNerTypeMap[category];
        nerList.forEach((ner) => {
          out += `"${ner.entityType}": "${ner.slotType}",\n`;
        });
      });
      console.log(out);
    },
    isValid() {
      return true;
    },
    showToolTip() {
      general.showInputContentTooltip(this.$refs['input-content']);
    },
  },
  beforeMount() {
    this.i18n = i18nUtils.getLocaleMsgs(this.$i18n);
    this.advancedConfigOptions = {
      options: [{
        text: this.i18n.task_engine_v3.entity_collecting_page.edit_sentence_replacement,
        onclick: this.editSentenceReplacement,
      }, {
        text: this.i18n.task_engine_v3.entity_collecting_page.edit_tde_setting,
        onclick: this.editTDESetting,
      }, {
        text: this.i18n.task_engine_v3.entity_collecting_page.edit_register_json,
        onclick: this.editRegisterJSON,
      }],
      alignLeft: true,
    };
    this.$on('rerender', this.rerender);
    this.$on('showToolTip', this.showToolTip);
    this.rerender();
    // this.printSlotType();
  },
  mounted() {
  },
  activated() {
    this.rerender();
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
@import "../scss/entityCollectingPage.scss";
</style>
