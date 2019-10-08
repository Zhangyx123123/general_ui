<template lang="html">
<div id="scenario-list-page-v2">
  <input type="file" ref="uploadScenarioJSONInput" style="visibility: hidden; display: none;" @change="changeScenarioJSONFile()" accept=".json">
  <div class="content card h-fill w-fill no-scenario" v-if="filteredScenarioList.length === 0">
    <div class="center-msg">
      <div class="title">{{ $t('task_engine_v2.scenario_list_page.start_scenario') }}</div>
      <div class="model-help" v-if="false">
        <div class="help-video">
          <icon :size=14 icon-type="te_help_video"></icon>
          {{ $t('task_engine_v2.scenario_list_page.help_video') }}
        </div>
        <div class="upload-data">
          <icon :size=14 icon-type="scenario_upload"></icon>
          {{ $t('task_engine_v2.scenario_list_page.upload_transfor_data') }}
        </div>
      </div>
      <div class="start-scenario">
        <text-button button-type='primary' width='140px' height='46px' @click="createNewScenario">
          {{$t("task_engine_v2.scenario_list_page.button_create_new_scenario")}}
        </text-button>
        <text-button button-type='default' :iconSize=15 width='140px' height='46px' @click="importScenarioJSON">
          {{$t("task_engine_v2.scenario_list_page.button_import_scenario")}}
        </text-button>
      </div>
    </div>
  </div>
  <div class="content card h-fill w-fill" v-else>
    <div class="row title">
      {{$t("task_engine_v2.scenario_list_page.scenario_list")}}
      <search-input v-model="filteredKeyWord" style="width: 220px;" ></search-input>
    </div>
    <div class="page">
      <div class="row">
        <div id="toolbar">
          <div id="left-buttons">
            <text-button button-type='primary' width='100px' height='32px' @click="createNewScenario">
              {{$t("task_engine_v2.scenario_list_page.button_create_new_scenario")}}
            </text-button>
            <text-button button-type='default' :iconSize=15 width='100px' height='32px' @click="importScenarioJSON">
              {{$t("task_engine_v2.scenario_list_page.button_import_scenario")}}
            </text-button>
            <text-button button-type='default' width='120px' height='32px' @click="exportAllScenarios">
              {{$t("task_engine_v2.scenario_list_page.button_export_all_scenarios")}}
            </text-button>
          </div>
          <div class="model-help top" v-if="false">
            <div class="help-video">
              <icon :size=14 icon-type="te_help_video"></icon>
              {{ $t('task_engine_v2.scenario_list_page.help_video') }}
            </div>
            <div class="upload-data">
              <icon :size=14 icon-type="scenario_upload"></icon>
              {{ $t('task_engine_v2.scenario_list_page.upload_transfor_data') }}
            </div>
          </div>
        </div>
      </div>
      <div class="scenario-list">
        <div
          v-for="(scenario, index) in filteredScenarioList"
          :key="scenario.scenarioID"
          class="scenario-grid"
          @mouseover="scenario.show = true"
          @mouseleave="scenario.show = false"
        >
          <div class="scenario-title">
            <div class="name-box">
              <div class="name-label" v-if="!scenario.editScenarioName" @click="editScenario(scenario.scenarioID)">
                {{scenario.scenarioName}}
              </div>
              <textarea
                class="name-label"
                :ref="`scenarioName`"
                v-focus
                v-if="scenario.editScenarioName"
                wrap="soft"
                v-model.trim="scenario.oldScenarioName"
                @blur="cancelEditScenarioName(scenario)"
                @keyup.enter="setScenarioName(scenario, index)"
                v-tooltip="scenarioNameTooltip">
              </textarea>
              <div class="icon-box"
                :ref="`editScenarioIcon_${index}`"
                v-show="scenario.show && !scenario.editScenarioName">
                <icon
                  :size=24
                  icon-type="edit_pen_1"
                  @click="startEditScenarioName(scenario, index)"
                  v-tooltip="tipsEditScenario"
                  >
                </icon>
              </div>
            </div>
            <toggle class="toggle" v-model="scenario.enable" @change="switchScenario(scenario, $event)" :big="false"></toggle>
          </div>
          <div class="scenario-content">
            <text-button class="txt-btn" :button-type="scenario.show ? 'primary' : 'default'" width='100px' height='38px' @click="editScenario(scenario.scenarioID)">
              {{$t("task_engine_v2.scenario_list_page.edit")}}
            </text-button>
            <div class="txt-btn" @click="exportScenario(scenario.scenarioID)">{{$t("general.export")}}</div>
            <div class="txt-btn" @click="deleteScenario(scenario)">{{$t("general.delete")}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import taskEngineApi from '@/modules/TaskEngine/_api/taskEngine';
import nerFactoryDalApi from '@/modules/TaskEngine/_api/nerFactoryDal';
import general from '@/modules/TaskEngine/_utils/general';
import config from '@/modules/TaskEngine/_utils/config';
// import event from '@/utils/js/event';
import CreateScenarioPop from './CreateScenarioPop';
import scenarioInitializer from '../_utils/scenarioInitializer';
import scenarioConvertor from '../_utils/scenarioConvertor';
import scenarioVersionConvertor from '../_utils/scenarioVersionConvertor';

export default {
  name: 'scenario-list-page-v2',
  components: {},
  data() {
    return {
      appId: '',
      scenarioList: [],
      filteredKeyWord: '',
      tipsEditScenario: {
        msg: this.$t('task_engine_v2.scenario_list_page.tips_edit_scenario_name'),
        eventOnly: false,
        clickShow: false,
        // errorType: true,
        alignLeft: true,
      },
      scenarioNameTooltip: {
        msg: this.$t('task_engine_v2.scenario_settings_edit_pop.err_empty_scenario_name'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      toggleLabel: {
        on: this.$t('task_engine_v2.scenario_edit_page.on'),
        off: this.$t('task_engine_v2.scenario_edit_page.off'),
      },
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
  directives: {
    focus: {
      inserted(el) {
        el.focus();
      },
    },
  },
  methods: {
    exportScenario(scenarioID) {
      taskEngineApi.exportScenario(scenarioID);
    },
    publishScenario(scenario, jsonData) {
      const that = this;
      taskEngineApi.publishScenario(that.appId, scenario.scenarioID).then(() => {
        // that.$notify({ text: that.$t('task_engine_v2.scenario_list_page.publish_succeed') });
      }, (err) => {
        that.$notifyFail(`${that.$t('task_engine_v2.scenario_list_page.publish_failed')}:${err.message}`);
      });
      const newJsonData = scenarioVersionConvertor.convertJsonToVersion('2.6', jsonData);
      scenarioConvertor.registerNluTdeScenario(
        scenario.scenarioID,
        newJsonData.moduleData.ui_data.nodes,
      );
    },
    exportAllScenarios() {
      taskEngineApi.exportAllScenarios(this.appId);
    },
    listAllScenarios() {
      taskEngineApi.listScenarios(this.appId).then((data) => {
        if (typeof (data) === 'object' && 'msg' in data) {
          this.scenarioList = data.msg.filter(scenario => scenario.version !== '2.0')
                                      .map((scenario) => {
                                        scenario.show = false;
                                        scenario.editScenarioName = false;
                                        scenario.oldScenarioName = scenario.scenarioName;
                                        return scenario;
                                      });
        } else {
          this.$notifyFail(`listAllScenarios error: unexpected return value from listScenarios API: ${data}`);
        }
      }, (err) => {
        this.$notifyFail(`listAllScenarios error:${err.message}`);
      });
    },
    createNewScenario() {
      const that = this;
      that.$pop({
        title: that.$t('task_engine_v3.create_scenario_pop.create_scenario'),
        component: CreateScenarioPop,
        validate: true,
        ok_msg: that.$t('task_engine_v3.create_scenario_pop.comfire_create'),
        data: {
          scenarioName: '',
        },
        callback: {
          ok: (obj) => {
            taskEngineApi.createScenarioWithTemplate(that.appId, obj.scenarioName, obj.templateID)
            .then((data) => {
              if ('template' in data && 'metadata' in data.template) {
                const metadata = data.template.metadata;
                const scenarioId = metadata.scenario_id;
                if (obj.templateID === '') {
                  const entryNodeName = that.$t('task_engine_v2.node_type.entry');
                  const scenario = scenarioInitializer.initialScenario(metadata, entryNodeName);
                  that.saveScenario(scenarioId, scenario).then(() => {
                    const path = general.composeV2Path(`scenario/${scenarioId}`);
                    that.$router.replace(path);
                  });
                } else {
                  const path = general.composeV2Path(`scenario/${scenarioId}`);
                  that.$router.replace(path);
                }
              } else {
                that.$notifyFail(`${that.$t('task_engine_v2.scenario_list_page.create_new_scenario_failed')}`);
              }
            }, (err) => {
              that.$notifyFail(`${that.$t('task_engine_v2.scenario_list_page.create_new_scenario_failed')}:${err.message}`);
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
      const path = general.composeV2Path(`scenario/${scenarioId}`);
      this.$router.replace(path);
    },
    deleteScenario(scenario) {
      const that = this;
      that.$popCheck({
        data: {
          msg: that.$t(
            'task_engine_v3.scenario_list_page.ask_delete_confirm',
            { scenario: scenario.scenarioName },
          ),
        },
        callback: {
          ok() {
            that.removeScenarioCustomParser(scenario);
            taskEngineApi.deleteScenario(scenario.scenarioID).then((data) => {
              if ('msg' in data && data.msg === 'Update success') {
                that.listAllScenarios();
              } else {
                that.$notifyFail('deleteScenario error: failed to delete scenario.');
              }
            });
          },
        },
      });
    },
    switchScenario(scenario, enable) {
      scenario.enable = enable;
      let triggerIntents = [];
      if (scenario.enable) {
        this.loadScenario(scenario).then((jsonData) => {
          this.publishScenario(scenario, jsonData);
          triggerIntents = scenarioConvertor.parseTriggerIntents(jsonData.moduleData.ui_data.nodes);
          this.saveTaskEngineIntents(scenario, triggerIntents);
        });
      } else {
        this.saveTaskEngineIntents(scenario, triggerIntents);
      }
      taskEngineApi.switchScenario(this.appId, scenario.scenarioID, scenario.enable).then(() => {
      }, (err) => {
        this.$notifyFail(`switchScenario error:${err.message}`);
      });
    },
    loadScenario(scenario) {
      return taskEngineApi.loadScenario(scenario.scenarioID).then((data) => {
        const jsonData = {
          moduleData: JSON.parse(data.result.editingContent),
          moduleDataLayouts: JSON.parse(data.result.editingLayout),
        };
        return jsonData;
      }, (err) => {
        general.popErrorWindow(this, 'loadScenario error', err.message);
      });
    },
    saveTaskEngineIntents(scenario, triggerIntents) {
      taskEngineApi.saveTaskEngineIntents(
        this.appId,
        scenario.scenarioID,
        triggerIntents,
      ).then(() => {}, (err) => {
        this.$notifyFail(`saveTaskEngineIntents failed, error:${err.message}`);
      });
    },
    importScenarioJSON() {
      this.$refs.uploadScenarioJSONInput.click();
    },
    changeScenarioJSONFile() {
      const files = this.$refs.uploadScenarioJSONInput.files;
      const file = files[0] || undefined;
      const that = this;
      if (file.size <= 0 || file.size > config.MaximumFileSize) {
        // maximum size: 10 MB
        that.$notifyFail(that.$t('error_msg.upload_file_size_error'));
      } else {
        that.uploadScenarioJSON(this.appId, file).then((resp) => {
          this.listAllScenarios();
          if (resp.return === 0 && resp.scenarioids !== undefined) {
            resp.scenarioids.forEach((scenarioID) => {
              that.updateUploadScenarioCustomParser(scenarioID);
            });
          }
        });
      }
    },
    uploadScenarioJSON(appId, file) {
      const that = this;
      return taskEngineApi.uploadScenarioJSON(
        appId,
        file,
      ).then((resp) => {
        if (resp.return === 0) {
          that.$notify({ text: that.$t('error_msg.success') });
          that.$refs.uploadScenarioJSONInput.value = '';
        } else {
          that.$notifyFail(`${that.$t('error_msg.save_fail')}:${resp.error}`);
        }
        return resp;
      }, (err) => {
        that.$refs.uploadScenarioJSONInput.value = '';
        that.$notifyFail(`${that.$t('error_msg.save_fail')}:${err.message}`);
      });
    },
    startEditScenarioName(scenario) {
      const checkShow = this.filteredScenarioList.findIndex(item => item.editScenarioName === true);
      if (checkShow === -1) {
        scenario.editScenarioName = true;
      } else {
        this.$refs[`scenarioName_${checkShow}`].classList.add('error');
      }
    },
    cancelEditScenarioName(scenario) {
      // this.$refs.scenarioName[0].dispatchEvent(event.createEvent('tooltip-hide'));
      scenario.editScenarioName = false;
      scenario.oldScenarioName = scenario.scenarioName;
    },
    setScenarioName(scenario) {
      scenario.oldScenarioName = scenario.oldScenarioName.replace(/[\r\n]/g, '');
      // if (scenario.oldScenarioName.trim() === '') {
      //   this.$refs.scenarioName[0].dispatchEvent(event.createEvent('tooltip-show'));
      // } else if (scenario.oldScenarioName.trim() !== '') {
      //   this.$refs.scenarioName[0].dispatchEvent(event.createEvent('tooltip-hide'));
      scenario.editScenarioName = false;
      if (scenario.oldScenarioName !== scenario.scenarioName) {
        scenario.scenarioName = scenario.oldScenarioName;
        const that = this;
        taskEngineApi.loadScenario(scenario.scenarioID).then((data) => {
          const moduleData = JSON.parse(data.result.editingContent);
          const layout = JSON.parse(data.result.editingLayout);
          moduleData.metadata.scenario_name = scenario.scenarioName;
          taskEngineApi.saveScenario(
            that.appId,
            scenario.scenarioID,
            JSON.stringify(moduleData),
            JSON.stringify(layout),
          ).then(() => {
            that.listAllScenarios();
          }, (err) => {
            that.$notifyFail(`${that.$t('task_engine_v2.scenario_list_page.create_new_scenario_failed')}:${err.message}`);
          });
        }, (err) => {
          this.$popError('loadScenario error', err.message);
        });
      }
      scenario.oldScenarioName = scenario.scenarioName;
      // }
    },
    removeScenarioCustomParser(scenario) {
      const that = this;
      taskEngineApi.loadScenario(scenario.scenarioID).then((data) => {
        const moduleData = JSON.parse(data.result.editingContent);
        if ('custom_parsers' in moduleData) {
          nerFactoryDalApi.deleteNerParsersCount(that.appId,
            Object.keys(moduleData.custom_parsers));
        }
      }, (err) => {
        this.$popError('loadScenario error', err.message);
      });
    },
    updateUploadScenarioCustomParser(scenarioID) {
      const that = this;
      taskEngineApi.loadScenario(scenarioID).then((data) => {
        const moduleData = JSON.parse(data.result.editingContent);
        if ('custom_parsers' in moduleData) {
          nerFactoryDalApi.getNerParserList(this.appId).then((parsers) => {
            const parserIds = parsers.data.map(parser => (parser.parserId));
            const added = [];
            const other = [];
            Object.keys(moduleData.custom_parsers).forEach((key) => {
              if (parserIds.indexOf(key) > -1) {
                added.push(key);
              } else {
                other.push(moduleData.custom_parsers[key]);
              }
            });
            nerFactoryDalApi.updateNerParsersCount(that.appId, added);
            if (other.length > 0) {
              that.$popCheck({
                data: {
                  msg: that.$t(
                    'task_engine_v2.scenario_list_page.upload_scenario_info',
                    { parser_info: other.map(item => (item.name)) },
                  ),
                },
                buttons: ['ok'],
              });
            }
          }, (err) => {
            this.$popError('getNerParserList error', err.message);
          });
        }
      }, (err) => {
        this.$popError('loadScenario error', err.message);
      });
    },
  },
  beforeMount() {
    this.appId = this.$cookie.get('appid');
  },
  mounted() {
    this.listAllScenarios();
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';
$row-height: $default-line-height;
#scenario-list-page-v2{
  height: 100%;
  padding: 0 20px;
  .content {
    display: flex;
    flex-direction: column;
    &.no-scenario {
      justify-content: center;
      background: {
        image: url('../../../../../assets/images/scenario_bg.svg');
        position: center right;
        repeat: no-repeat;
        size: 665px 501px;
      }
    }
    .page{
      flex: 1;
      @include auto-overflow();
      @include customScrollbar();
    }
    .row {
      flex: 0 0 auto;
      padding: 0px 20px 0px 20px;
      &.title {
        @include font-16px();
        font-size: 18px;
        color: $color-font-active;
        flex: 0 0 60px;
        // border-bottom: 1px solid $color-borderline;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .text-button {
        margin-right: 10px;
      }
      input[type=file] {
        visibility: hidden;
      }
      .file-selector {
        & ~ input {
          display: none;
        }
      }

      #toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        // margin-right: 20px;
        #left-buttons{
          display: flex;
          align-items: center;
        }
      }
    }
    .scenario-list{
      flex: 1;
      padding: 20px;
      padding-bottom: 0px;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-content: flex-start;
      .scenario-grid {
        display: flex;
        flex-direction: column;
        flex: 0 0 350px;
        max-width: 350px;
        height: 164px;
        border-radius: 4px;
        border: 1px solid $color-borderline;
        margin-right: 30px;
        margin-bottom: 20px;
        padding: 30px;
        transition: all .2s ease-in-out;

        &:hover {
          box-shadow: 0 4px 9px 0 rgba(115, 115, 115, 0.2), 0 5px 8px 0 rgba(228, 228, 228, 0.5);
          .card-title {
            .card-title-edit {
              visibility: visible;
            }
          }
        }

        .toggle {
          margin-top: 5px;
        }

        .scenario-title {
          flex: 1 1 auto;
          display: flex;
          justify-content: space-between;
          .name-box {
            display: flex;
            flex-flow: row nowrap;
            width: calc(100% - 28px);
          }
          .icon-box {
            display: flex;
            margin-right: 5px;
          }
          .name-label {
            flex: 1 1 auto;
            max-width: calc(100% - 24px);
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            font-size: 16px;
            padding: 5px 2px;
            box-sizing: border-box;
            @include click-button();
          }
          textarea.name-label {
            padding: 0px 2px;
            white-space: inherit;
            line-height: 25px;
            max-height: 50px;
            width: calc(100% - 24px);
            overflow-y: auto;
            font-size: 16px;
            color: #333333;
            border-radius: 3px;
            border-color: #dbdbdb;
            // background-color: #f4f7fd;
          }
        }
        .scenario-content {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
          .text-button{
            margin-right: 10px;
          }
          .txt-btn {
            cursor: pointer;
            font-size: 14px;
            margin-right: 30px;
          }
        }
      }
    }
  }
}
$marginLeft: 80px;
$textWidth: 378px;
$titleFontSize: 38px;
$helpFontSize: 16px;
$btnMarginTop: 43px;
.center-msg {
  margin-left: $marginLeft;
  width: $textWidth;

  .title {
    color: $color-font-active;
    width: $textWidth;
    font-size: $titleFontSize;
  }
  .start-scenario {
    margin-top: $btnMarginTop;
    & > * {
      margin-right: 20px;
    }
  }
}
.model-help {
  display: flex;
  width: 100%;
  color: $color-primary;
  font-size: $helpFontSize;
  margin-top: 20px;
  line-height: 24px;

  .upload-data {
    padding-left: 32px;
  }

  &.top {
    width: auto;
    margin: 0;
    font-size: 14px;
  }
}
</style>
