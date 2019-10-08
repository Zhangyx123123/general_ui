<template>
<div id="skill-editor" class="skill-editor">
  <keep-alive>
    <trigger-page ref="triggerPage"
      v-if="currentPage === 'triggerPage'"
      :initialTriggerList="skill.triggerList"
      @update="updateTriggerList"
    ></trigger-page>
    <entity-collecting-page ref="entityCollectingPage"
      v-if="currentPage === 'entityCollectingPage'"
      :initialEntityCollectorList="skill.entityCollectorList"
      :initialIdToNerMap="initialIdToNerMap"
      :initialRelatedEntities="skill.relatedEntities"
      :initialREParsers="skill.re_parsers || []"
      :initialTDESetting="(skill.tde_setting === undefined || Array.isArray(skill.tde_setting)) ? {} : skill.tde_setting"
      :initialRegisterJSON="skill.register_json || {}"
      @update="updateEntityCollectorList"
      @updateIdToNerMap="updateIdToNerMap"
      @updateRelatedEntities="updateRelatedEntities"
      @updateREParsers="updateREParsers"
      @updateTDESetting="updateTDESetting"
      @updateRegisterJSON="updateRegisterJSON"
    ></entity-collecting-page>
    <action-page ref="actionPage"
      v-if="currentPage === 'actionPage'"
      :initialActionGroupList="skill.actionGroupList"
      :initialEntityCollectorList="skill.entityCollectorList"
      :initialSkillNameList="initialSkillNameList"
      :version="version"
      @update="updateActionGroupList"
    ></action-page>
  </keep-alive>
</div>
</template>

<script>
import TriggerPage from './TriggerPage';
import EntityCollectingPage from './EntityCollectingPage';
import ActionPage from './ActionPage';
import i18nUtils from '../utils/i18nUtil';

export default {
  name: 'skill-editor',
  components: {
    'trigger-page': TriggerPage,
    'entity-collecting-page': EntityCollectingPage,
    'action-page': ActionPage,
  },
  props: {
    version: {
      type: String,
      required: true,
    },
    currentPage: {
      type: String,
      required: true,
    },
    initialIdToNerMap: {
      type: Object,
      required: true,
    },
    initialSkillNameList: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      i18n: {},
      skill: {
        triggerList: [],
        entityCollectorList: [],
        actionGroupList: [],
        relatedEntities: {
          relatedEntityCollectorList: [],
          relatedEntityMatrix: [],
        },
        re_parsers: [],
        tde_setting: {},
        register_json: {},
      },
    };
  },
  computed: {},
  watch: {},
  methods: {
    propSkill(newSkill) {
      this.skill = JSON.parse(JSON.stringify(newSkill));
      this.$nextTick(() => {
        this.$refs[this.currentPage].$emit('rerender', {});
      });
    },
    updateTriggerList(newTriggerList) {
      this.skill.triggerList = newTriggerList;
      this.$emit('update', this.skill);
    },
    updateEntityCollectorList(newEntityCollectorList) {
      this.skill.entityCollectorList = newEntityCollectorList;
      this.$emit('update', this.skill);
    },
    updateREParsers(reParsers) {
      this.skill.re_parsers = reParsers;
      this.$emit('update', this.skill);
    },
    updateTDESetting(tdeSetting) {
      this.skill.tde_setting = tdeSetting;
      this.$emit('update', this.skill);
    },
    updateRegisterJSON(registerJSON) {
      this.skill.register_json = registerJSON;
      this.$emit('update', this.skill);
    },
    updateActionGroupList(newActionGroupList) {
      this.skill.actionGroupList = newActionGroupList;
      this.$emit('update', this.skill);
    },
    updateRelatedEntities(relatedEntities) {
      this.skill.relatedEntities = relatedEntities;
      this.$emit('update', this.skill);
    },
    updateIdToNerMap(idToNerMap) {
      this.$emit('updateIdToNerMap', idToNerMap);
    },
  },
  beforeMount() {
    this.i18n = i18nUtils.getLocaleMsgs(this.$i18n);
    this.$on('propSkill', this.propSkill);
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
@import "../scss/skillEditPage.scss";
</style>
