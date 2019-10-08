<template>
<div id="scenario_edit_page">
  <div class="content card h-fill w-fill">
    <div class="header title">
      <div class="breadcrumb">
        <div class="back-to-list" @click="$router.replace('/task-engine-scenario-v3');">{{$t("task_engine_v3.scenario_list_page.scenario_list")}}</div>
        <icon iconType="month_right" :size="20"></icon>
        <div class="scenario-name-container">
          <div class="blank"/>
          <input
            ref="inputScenarioName"
            class="input-scenario-name"
            v-model="scenarioName"
            :placeholder="$t('task_engine_v3.scenario_edit_page.placeholder_name_the_scenario')"
            @focus="setInputScenarioNameFocus(true)"
            @blur="setInputScenarioNameFocus(false)">
          <div class="bottom-border" :class="{'input-focus': inputScenarioNameFocus}"/>
        </div>
        <div class="label-switch-off label-switch">{{$t("task_engine_v3.scenario_edit_page.switch_off")}}</div>
        <toggle class="button-switch-enable" v-model="enable" @change="switchScenario()" :big="false"></toggle>
        <div class="label-switch-on label-switch">{{$t("task_engine_v3.scenario_edit_page.switch_on")}}</div>
      </div>
      <div class="header-buttons">
        <text-button button-type='default' @click="$router.replace('/task-engine-scenario-v3');">{{$t("general.close")}}</text-button>
        <text-button button-type='primary' @click="toNextPage">{{saveButtonText}}</text-button>
      </div>
    </div>
    <div class="main-content">
      <div class="sidebar">
        <div class="sidebar-content">
          <div class="slect-skill-container">
            <dropdown-select
              ref="dropdownSelect"
              v-model="currentSkillName"
              :options="skillNameList"
              :showCheckedIcon="false"
              width="141px"
            />
            <div class="setting-button" v-tooltip="{ msg: $t('task_engine_v3.scenario_edit_page.tooltip_skill_edit')}">
              <icon icon-type="setting" :enableHover="true" :size=15 @click="editSkills"/>
            </div>
          </div>
          <ul class="list-ic vertical">
            <template v-for="(page, key, idx) in pages">
              <li :key="key" :class="{ 'active': key === currentPage }">
                <span class="order">{{idx+1}}</span>
                <span class="title" @click="pageChange(key)">{{ page.name }}</span>
              </li>
            </template>
          </ul>
        </div>
      </div>
      <div class="page-container">
        <skill-edit-page
          ref="skillEditPage"
          :currentPage="currentPage"
          :initialIdToNerMap="idToNerMap"
          :initialSkillNameList="skillNameList"
          :version="version"
          @update="updateSkill"
          @updateIdToNerMap="updateIdToNerMap"
        ></skill-edit-page>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import SkillEditPage from './SkillEditPage';
import TriggerPage from './TriggerPage';
import EntityCollectingPage from './EntityCollectingPage';
import ActionPage from './ActionPage';
import EditSkillsPop from './EditSkillsPop';
import i18nUtils from '../utils/i18nUtil';
import api from './_api/taskEngine';
import general from '../utils/general';
import scenarioConvertor from '../utils/scenarioConvertor';

export default {
  name: 'scenario_edit_page',
  components: {
    'skill-edit-page': SkillEditPage,
    'trigger-page': TriggerPage,
    'entity-collecting-page': EntityCollectingPage,
    'action-page': ActionPage,
  },
  data() {
    return {
      i18n: {},
      appId: '',
      scenarioId: '',
      scenarioName: '',
      skills: {},
      currentSkill: {},
      currentSkillId: '',
      skillNameList: [],
      allPages: {},
      pages: {},
      currentPage: 'triggerPage',
      idToNerMap: {},
      enable: false,
      inputScenarioNameFocus: false,
      version: '2.0',
    };
  },
  computed: {
    currentSkillName: {
      get() {
        if (this.skills[this.currentSkillId] !== undefined) {
          return [this.currentSkillId];
        }
        return [];
      },
      set(newValue) {
        this.currentSkillId = newValue[0];
      },
    },
    saveButtonText() {
      if (this.currentPage === 'actionPage') {
        return this.i18n.general.save_change;
      }
      return this.i18n.task_engine_v3.scenario_edit_page.button_save_and_next_step;
    },
  },
  watch: {
    skills: {
      handler() {
        this.updateSkillNameList();
        if (!this.skills[this.currentSkillId]) {
          this.currentSkillId = 'mainSkill';
        }
      },
      deep: true,
    },
    currentSkillId: {
      handler(newSkillId, oldSkillId) {
        if (newSkillId === oldSkillId) return;
        if (this.skills[newSkillId] === undefined) return;

        // update pages
        if (newSkillId === 'mainSkill') {
          this.pages = this.allPages;
          this.currentPage = 'triggerPage';
        } else {
          // remove triggerPage
          const { triggerPage, ...newPages } = this.allPages;
          this.pages = newPages;
          this.currentPage = 'entityCollectingPage';
        }

        // update and propagate currentSkill
        const currentSkill = this.skills[newSkillId];
        this.$refs.skillEditPage.$emit('propSkill', currentSkill);
      },
      deep: true,
    },
  },
  methods: {
    pageChange(key) {
      this.currentPage = key;
    },
    setInputScenarioNameFocus(bool) {
      this.inputScenarioNameFocus = bool;
    },
    updateSkill(newSkill) {
      this.skills[this.currentSkillId] = newSkill;
    },
    updateSkillNameList() {
      this.skillNameList = Object.keys(this.skills).map(skillId => ({
        text: this.skills[skillId].skillName,
        value: skillId,
      }));
      if (this.$refs.dropdownSelect) {
        this.$refs.dropdownSelect.$emit('updateOptions', this.skillNameList);
        this.$refs.dropdownSelect.$emit('select', this.currentSkillId);
      }
    },
    addNewSkill(skillName) {
      const skillId = this.$uuid.v1();
      this.skills[skillId] = {
        skillName,
        entityCollectorList: [],
        actionGroupList: [],
        relatedEntities: {
          relatedEntityCollectorList: [],
          relatedEntityMatrix: [],
        },
        re_parsers: [],
        tde_setting: {},
      };
      // route to new skill
      this.currentSkillId = skillId;
      this.updateSkillNameList();
    },
    updateIdToNerMap(idToNerMap) {
      // save new nerMap
      this.idToNerMap = idToNerMap;
      window.moduleData.idToNerMap = this.idToNerMap;
      this.saveScenario(window.moduleData);
    },
    loadScenario(scenarioId) {
      return api.loadScenario(scenarioId).then((data) => {
        window.moduleData = JSON.parse(data.result.editingContent);
        window.moduleDataLayouts = JSON.parse(data.result.editingLayout);
        this.scenarioName = window.moduleData.metadata.scenario_name;
        this.version = window.moduleData.version;
        this.renderData(window.moduleData);
      }, (err) => {
        general.popErrorWindow(this, 'loadScenario error', err.message);
      });
    },
    renderData(moduleData) {
      this.currentSkillId = 'mainSkill';
      // propagate currentSkill
      this.skills = moduleData.skills;
      const currentSkill = this.skills[this.currentSkillId];
      this.$refs.skillEditPage.$emit('propSkill', currentSkill);
      // propagate ner map (entity map)
      this.idToNerMap = Array.isArray(moduleData.idToNerMap) ? {} : moduleData.idToNerMap;
    },
    saveScenario(content) {
      return api.saveScenario(
        this.appId,
        this.scenarioId,
        JSON.stringify(content),
        JSON.stringify(window.moduleDataLayouts),
      ).then(() => {
        window.moduleData = content;
        // TODO use toast instead
        // console.log('场景已更新');
      }, (err) => {
        general.popErrorWindow(this, 'saveScenario error', err.message);
      });
    },
    toNextPage() {
      const keys = Object.keys(this.pages);
      const idx = keys.indexOf(this.currentPage) + 1;
      if (idx < keys.length) {
        this.currentPage = keys[idx];
      }
      this.saveScenarioContent();
    },
    saveScenarioContent() {
      if (!this.isValidScenario()) {
        return;
      }
      const content = {
        version: '2.0',
        setting: window.moduleData.setting,
        metadata: window.moduleData.metadata,
        msg_confirm: window.moduleData.msg_confirm,
        skills: this.skills,
        idToNerMap: this.idToNerMap,
      };
      content.metadata.scenario_name = this.scenarioName;
      content.metadata.update_time = general.getLocalDateTimeIsoString();
      this.saveScenario(content).then(() => {
        this.$notify({ text: this.i18n.task_engine_v3.scenario_edit_page.toast_save_success });
        this.registerNluTdeScenario(this.scenarioId, content);
        this.publishScenario(content);
      });
    },
    registerNluTdeScenario(scenarioId, content) {
      Object.keys(content.skills).map((skillId) => {
        const skill = content.skills[skillId];
        if (skill.entityCollectorList.length > 0 ||
            (skill.register_json && Object.keys(skill.register_json).length > 0)) {
          const data = scenarioConvertor.convertToRegistryData(scenarioId, skill, skillId);
          api.registerNluTdeScenario(data);
        }
        return skillId;
      });
    },
    publishScenario(content) {
      const convertedContent = scenarioConvertor.convertToNodes(content);
      this.saveScenario(convertedContent).then(() => {
        api.publishScenario(this.appId, this.scenarioId).then(() => {
          // console.log('场景已发布');
          this.enableScenario();
        }, (err) => {
          general.popErrorWindow(this, 'publishScenario error', err.message);
        });
      });
    },
    enableScenario() {
      api.switchScenario(this.appId, this.scenarioId, true).then(() => {
        // console.log('场景已开启');
      }, (err) => {
        general.popErrorWindow(this, 'enableScenario error', err.message);
      });
    },
    isValidScenario() {
      this.scenarioName = this.scenarioName.trim();
      if (this.scenarioName === '') {
        this.$refs.inputScenarioName.focus();
        this.$notifyFail(this.i18n.task_engine_v3.error_msg.please_enter_the_scenario_name);
        return false;
      }
      return true;
    },
    setSwitchToggle(appId, scenarioId) {
      api.listScenarios(appId).then((data) => {
        if (typeof (data) === 'object' && 'msg' in data) {
          const scenario = data.msg.find(s => s.scenarioID === scenarioId);
          this.enable = scenario.enable;
        }
      }, (err) => {
        general.popErrorWindow(this, 'listScenarios error', err.message);
      });
    },
    switchScenario() {
      const content = {
        version: '2.0',
        setting: window.moduleData.setting,
        metadata: window.moduleData.metadata,
        msg_confirm: window.moduleData.msg_confirm,
        skills: this.skills,
        idToNerMap: this.idToNerMap,
      };
      Promise.all([
        api.switchScenario(this.appId, this.scenarioId, this.enable),
        Object.keys(content.skills).map((skillId) => {
          const skill = content.skills[skillId];
          if (skill.entityCollectorList.length > 0 ||
              (skill.register_json && Object.keys(skill.register_json).length > 0)) {
            const data = scenarioConvertor.convertToRegistryData(this.scenarioId, skill, skillId);
            return this.enable ? api.registerNluTdeScenario(data) : Promise.resolve();
          }
          return Promise.resolve();
        }),
        this.enable && api.publishScenario(this.appId, this.scenarioId),
      ])
      .catch((err) => {
        general.popErrorWindow(this, 'switchScenario error', err.message);
      });
    },
    editSkills() {
      const that = this;
      that.$pop({
        title: this.i18n.task_engine_v3.edit_skill_pop.label_title,
        component: EditSkillsPop,
        validate: true,
        bindValue: false,
        data: {
          skills: this.skills,
        },
        callback: {
          ok: (newSkills) => {
            this.skills = newSkills;
          },
        },
      });
    },
  },
  beforeMount() {
    this.appId = this.$cookie.get('appid');
    this.scenarioId = this.$route.params.id;
    this.i18n = i18nUtils.getLocaleMsgs(this.$i18n);
    this.loadScenario(this.scenarioId);
    this.setSwitchToggle(this.appId, this.scenarioId);
  },
  mounted() {
    this.allPages = {
      triggerPage: {
        name: this.i18n.task_engine_v3.scenario_edit_page.tab.trigger,
        component: 'trigger-page',
      },
      entityCollectingPage: {
        name: this.i18n.task_engine_v3.scenario_edit_page.tab.entity_collecting,
        component: 'entity-collecting-page',
      },
      actionPage: {
        name: this.i18n.task_engine_v3.scenario_edit_page.tab.action,
        component: 'action-page',
      },
    };
    this.pages = this.allPages;
    this.$root.$on('addNewSkill', this.addNewSkill);
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
@import "../scss/scenarioEditPage.scss";
</style>
