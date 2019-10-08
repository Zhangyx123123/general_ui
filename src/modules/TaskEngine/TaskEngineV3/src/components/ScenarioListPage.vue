<template lang="html">
<div id="scenario-list-page-v3">
  <div class="content card h-fill w-fill">
    <div class="header title">
      {{$t("task_engine_v3.scenario_list_page.scenario_list")}}
      <search-input v-model="filteredKeyWord" ></search-input>
    </div>
    <div class="page">
      <div id="toolbar">
        <div id="left-buttons">
          <text-button button-type='primary' @click="createNewScenario">
            {{$t("task_engine_v3.scenario_list_page.button_create_new_scenario")}}
          </text-button>
          <text-button button-type='default' @click="showImportPop">
            {{$t("task_engine_v3.scenario_list_page.button_import_scenario")}}
          </text-button>
          <input type="file" ref="uploadInput" v-on:change="changeFile()" accept=".xlsx">
          <input type="file" ref="uploadScenarioJSONInput" @change="changeScenarioJSONFile()" accept=".json">
        </div>
      </div>
      <div
        v-for="(scenario, index) in filteredScenarioList" 
        :key="scenario.scenarioID"
        class="row" 
        @mouseover="scenario.show = true" 
        @mouseleave="scenario.show = false"
      >
        <div id="scenario-grid">
          <div id="scenario-toggle-container">
            <toggle v-model="scenario.enable" @change="switchScenario(scenario)" :big="false"></toggle>
          </div>
          <div id="scenario-content-container">
            <div class="name-label"  @click="editScenario(scenario.scenarioID)">
              {{scenario.scenarioName}}
            </div>
            <div class="delete-button">
              <div class="icon_container" v-if="scenario.show" v-dropdown="moreOptions(scenario)">
                <icon :size=25 icon-type="more_blue"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import ImportScenarioPop from './ImportScenarioPop';
import i18nUtils from '../utils/i18nUtil';
import scenarioConvertor from '../utils/scenarioConvertor';
import general from '../utils/general';
import CreateScenarioPop from './CreateScenarioPop';
import taskEngineApi from './_api/taskEngine';

export default {
  name: 'scenario-list-page-v3',
  components: {},
  data() {
    return {
      i18n: {},
      appId: '',
      scenarioList: [],
      filteredKeyWord: '',
    };
  },
  computed: {
    filteredScenarioList() {
      return this.scenarioList
        .filter(scenario => scenario.scenarioName.indexOf(this.filteredKeyWord) !== -1)
        .sort((a, b) => a.scenarioName.localeCompare(b.scenarioName));
    },
  },
  watch: {},
  methods: {
    moreOptions(scenario) {
      const that = this;
      return {
        options: [{
          text: this.i18n.general.export,
          onclick() {
            taskEngineApi.exportScenario(scenario.scenarioID);
          },
        }, {
          text: this.i18n.general.delete,
          onclick() {
            that.deleteScenario(scenario);
          },
        }],
        alignLeft: true,
      };
    },
    listAllScenarios() {
      taskEngineApi.listScenarios(this.appId).then((data) => {
        // console.log(data);
        if (typeof (data) === 'object' && 'msg' in data) {
          this.scenarioList = data.msg.filter(scenario => scenario.version === '2.0')
                                      .map((scenario) => {
                                        scenario.show = false;
                                        return scenario;
                                      });
        } else {
          general.popErrorWindow(this, 'listAllScenarios error',
            `unexpected return value from listScenarios API: ${data}`);
        }
      }, (err) => {
        general.popErrorWindow(this, 'listAllScenarios error', err.message);
      });
    },
    createNewScenario() {
      const that = this;
      that.$pop({
        title: this.i18n.task_engine_v3.create_scenario_pop.label_create_new_scenario,
        component: CreateScenarioPop,
        validate: true,
        ok_msg: that.$t('general.add'),
        data: {
          scenarioName: '',
        },
        callback: {
          ok: (scenarioName) => {
            taskEngineApi.createScenario(that.appId, scenarioName).then((data) => {
              if ('template' in data && 'metadata' in data.template) {
                const metadata = data.template.metadata;
                const scenarioId = metadata.scenario_id;
                const scenario = scenarioConvertor.initialScenario(metadata);
                that.saveScenario(scenarioId, scenario).then(() => {
                  const path = general.composePath(`scenario/${scenarioId}`);
                  that.$router.replace(path);
                });
              } else {
                general.popErrorWindow(that, that.i18n.task_engine_v3.error_msg.create_new_scenario_failed, '');
              }
            }, (err) => {
              general.popErrorWindow(that, 'createScenario error', err.message);
            });
          },
        },
      });
    },
    saveScenario(scenarioId, scenario) {
      return taskEngineApi.saveScenario(
        this.appId,
        scenarioId,
        JSON.stringify(scenario.editingContent),
        JSON.stringify(scenario.editingLayout),
      ).then(() => {
        this.$notify({ text: this.$t('error_msg.save_success') });
      }, (err) => {
        this.$notifyFail(`${this.$t('error_msg.save_fail')}:${err.message}`);
      });
    },
    editScenario(scenarioId) {
      const path = general.composePath(`scenario/${scenarioId}`);
      this.$router.replace(path);
    },
    deleteScenario(scenario) {
      const that = this;
      that.$popWarn({
        data: {
          msg: that.$t(
            'task_engine_v3.scenario_list_page.ask_delete_confirm',
            { scenario: scenario.scenarioName },
          ),
        },
        callback: {
          ok() {
            taskEngineApi.deleteScenario(scenario.scenarioID).then((data) => {
              if ('msg' in data && data.msg === 'Update success') {
                that.listAllScenarios();
              } else {
                general.popErrorWindow(that, 'deleteScenario error', 'failed to delete scenario.');
              }
            });
          },
        },
      });
    },
    switchScenario(scenario) {
      const scenarioId = scenario.scenarioID;
      if (!scenario.enable) {
        taskEngineApi.switchScenario(this.appId, scenarioId, scenario.enable)
        .catch((err) => {
          general.popErrorWindow(this, 'switchScenario error', err.message);
        });
        return;
      }
      taskEngineApi.loadScenario(scenarioId)
      .then((data) => {
        const moduleData = JSON.parse(data.result.editingContent);
        const content = {
          version: '2.0',
          skills: moduleData.skills,
        };
        Promise.all([
          taskEngineApi.switchScenario(this.appId, scenarioId, scenario.enable),
          Object.keys(content.skills).map((skillId) => {
            const skill = content.skills[skillId];
            if (skill.entityCollectorList.length > 0 ||
                (skill.register_json && Object.keys(skill.register_json).length > 0)) {
              const registryData = scenarioConvertor.convertToRegistryData(scenarioId, skill, skillId); // eslint-disable-line
              return taskEngineApi.registerNluTdeScenario(registryData);
            }
            return Promise.resolve();
          }),
          taskEngineApi.publishScenario(this.appId, scenarioId),
        ])
        .catch((err) => {
          general.popErrorWindow(this, 'switchScenario error', err.message);
        });
      });
    },
    showImportPop() {
      const that = this;
      that.$pop({
        title: that.$t('task_engine_v3.import_scenario_pop.label_title'),
        component: ImportScenarioPop,
        disable_ok: true,
        validate: true,
        data: {
          skillName: '',
        },
        callback: {
          ok: (retData) => {
            const file = retData.file;
            const importFormat = retData.importFormat;
            if (importFormat === 'json') {
              that.uploadScenarioJSON(that.appId, file).then(() => {
                that.listAllScenarios();
              });
            } else if (importFormat === 'xlsx') {
              const fileName = file.name;
              const scenarioName = fileName.substring(0, fileName.lastIndexOf('.xlsx'));
              taskEngineApi.createScenario(that.appId, scenarioName).then((data) => {
                if ('template' in data && 'metadata' in data.template) {
                  const metadata = data.template.metadata;
                  const scenarioId = metadata.scenario_id;
                  const initialScenario = scenarioConvertor.initialScenario(metadata);
                  that.uploadSpreadSheet(that.appId, scenarioId, initialScenario, file).then(() => {
                    const path = general.composePath(`scenario/${scenarioId}`);
                    that.$router.replace(path);
                  });
                } else {
                  that.$notifyFail(that.$t('task_engine_v3.error_msg.create_new_scenario_failed'));
                }
              }, (err) => {
                that.$notifyFail(`${that.$t('task_engine_v3.error_msg.create_new_scenario_failed')}:${err.message}`);
              });
            }
          },
        },
      });
    },
    uploadScenarioJSON(appId, file) {
      const that = this;
      return taskEngineApi.uploadScenarioJSON(
        appId,
        file,
      ).then((resp) => {
        if (resp.return === 0) {
          that.$notify({ text: that.$t('error_msg.success') });
          that.$refs.uploadInput.value = '';
        } else {
          that.$notifyFail(`${that.$t('error_msg.save_fail')}:${resp.error}`);
        }
      }, (err) => {
        that.$refs.uploadInput.value = '';
        that.$notifyFail(`${that.$t('error_msg.save_fail')}:${err.message}`);
      });
    },
    uploadSpreadSheet(appId, scenarioId, scenario, file) {
      const that = this;
      return taskEngineApi.uploadSpreadsheet(
        appId,
        scenarioId,
        JSON.stringify(scenario),
        file,
      ).then((resp) => {
        if (resp.return === 0) {
          that.$notify({ text: that.$t('error_msg.success') });
          that.$refs.uploadInput.value = '';
        } else {
          that.$notifyFail(`${that.$t('error_msg.save_fail')}:${resp.error}`);
        }
      }, (err) => {
        that.$refs.uploadInput.value = '';
        that.$notifyFail(`${that.$t('error_msg.save_fail')}:${err.message}`);
      });
    },
  },
  beforeMount() {},
  mounted() {
    this.i18n = i18nUtils.getLocaleMsgs(this.$i18n);
    this.appId = this.$cookie.get('appid');
    this.listAllScenarios();
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';
$row-height: $default-line-height;
@import "../scss/teVariable.scss";

#scenario-list-page-v3{
  height: 100%;
  .content {
    display: flex;
    flex-direction: column;
    .header {
      flex: 0 0 60px;
      padding: 0 20px;
      &.title {
        @include font-16px();
        color: $color-font-active;
        flex: 0 0 60px;
        border-bottom: 1px solid $color-borderline;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
    .page {
      flex: 1;
      @include auto-overflow();
      @include customScrollbar();

      #toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px;
        #left-buttons {
          flex: 1;
          .text-button {
            margin-right: 10px;
          }
        }
        #right-buttons {
          flex: 0 0 auto;
        }
        #left-buttons, #right-buttons {
          display: flex;
          align-items: center;
        }
      }
      input[type=file] {
        visibility: hidden;
        width: 30px;
      }
      .file-selector {
        & ~ input {
          display: none;
        }
      }
    }
    .row {
      flex: 0 0 auto;
      padding: 20px;
      padding-top: 0px;
      #scenario-grid {
        display: flex;
        height: 82px;
        border-radius: 4px;
        border: solid 1px $color-borderline;
        color: $color-font-active;
        transition: all .2s ease-in-out;
        &:hover {
          box-shadow: 0 4px 9px 0 rgba(115, 115, 115, 0.2), 0 5px 8px 0 rgba(228, 228, 228, 0.5);
        }

        #scenario-toggle-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 68px;
          border-right: solid 1px $color-borderline;
        }
        #scenario-content-container {
          flex: 1 1 auto;
          display: flex;
          align-items: center;
          @include font-14px();
          .name-label {
            display: flex;
            align-items: center;
            flex: 1 1 auto;
            height: 100%;
            padding-left: 20px;
            cursor: pointer;
          }
          .delete-button {
            flex: 0 0 68px;
            .icon_container{
              position: relative;
              width: 25px;
              height: 25px;
              border-radius: 25px;
              cursor: pointer;
              &:hover{
                background-color: #f7f7f7;
              }
            }
          }
        }
      }
    }
  }
}
</style>
