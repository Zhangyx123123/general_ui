<template lang="html">
<div id="params-collecting-block">
  <div class="button-delete-param">
    <icon icon-type="delete" :enableHover="true" :size=24 @click="deleteParam()"/>
  </div>
  <div class="param">
    <template v-for="(parser, index) in parsers">
      <div class="parser-block" :key="parser.id">
        <div class="row row-function">
          <div class="label label-start">
            {{$t("task_engine_v2.params_collecting_tab.parser")}}
          </div>
          <dropdown-select
            class="select row-content"
            :ref="`selectFunction_${index}`"
            :value="[parser.funcName]"
            @input="onSelectFunctionInput(index, $event)"
            :options="getFuncOptions()"
            :showCheckedIcon="false"
            width="160px"
            :inputBarStyle="selectStyle"
          />
          <button
            class="button button-add-parser"
            v-if="index === 0"
            @click="addParser()">
            {{$t("task_engine_v2.params_collecting_tab.button_add_parser")}}
          </button>
          <button
            class="button"
            style="width: 60px;"
            v-if="index !== 0"
            @click="deleteParser(index)">
            {{$t("task_engine_v2.condition_block.button_remove")}}
          </button>
        </div>
        <!-- 正则表示式 -->
        <div class="content-regular-exp" v-if="parser.funcName === 'regular_exp'">
          <div class="row">
            <div class="label label-start">
              {{$t("task_engine_v2.condition_block.label_pattern")}}
            </div>
            <input ref="input-content" v-tooltip="tooltip" class="row-content input-content" @focus="onInputFocus" v-model="parser.content.pattern" @input="emitUpdate"></input>
          </div>
          <template v-for="(operation, idx) in parser.content.operations">
            <div class="row">
              <div class="label label-start">
                {{$t("task_engine_v2.condition_block.label_nth_match")}}
              </div>
              <input ref="input-content" v-tooltip="tooltip" class="row-content input-content" @focus="onInputFocus"
                v-model.number="operation.index"
                oninput="this.value = this.value.replace(/[^0-9]/g, ''); this.value = this.value.replace(/(^[0-9]{1,2}).*/g, '$1');"
                @input="emitUpdate">
              </input>
              <button
                v-if="idx === 0"
                class="button"
                style="width: 70px;"
                @click="addRegTargetKey(index)">
                {{$t("task_engine_v2.condition_block.button_add")}}
              </button>
              <button
                v-if="idx !== 0"
                class="button"
                style="width: 60px;"
                @click="deleteRegTargetKey(index, idx)">
                {{$t("task_engine_v2.condition_block.button_remove")}}
              </button>
            </div>
            <div class="row">
              <div class="label label-start">
                {{$t("task_engine_v2.condition_block.label_target_key")}}
              </div>
              <input ref="input-content" v-tooltip="tooltip" class="row-content input-content" @focus="onInputFocus"
                v-model="operation.key"
                @input="emitUpdate"
              ></input>
            </div>
          </template>
        </div>
        <!-- 酒店预定语句解析器 / 通用语句解析器 / 场景语句解析器 -->
        <div class="content-parser"
          v-if="parser.funcName === 'hotel_parser' ||
                parser.funcName === 'common_parser' ||
                parser.funcName === 'task_parser'">
          <div class="row">
            <div class="label label-start">
              {{$t("task_engine_v2.condition_block.label_content")}}
            </div>
            <dropdown-select
              class="select row-content"
              :ref="`selectTargetEntity_${index}`"
              :multi="true"
              :value="parser.content.tags.split(',')"
              @input="onSelectTargetEntity(index, $event)"
              :options="entityModuleOptions(parser.funcName)"
              :showCheckedIcon="true"
              :showSearchBar="true"
              width="200px"
              :inputBarStyle="selectStyle"
            />
          </div>
        </div>
        <!-- NLU解析器 -->
        <div class="content-parser"
          v-if="parser.funcName === 'nlu_parser'">
          <div class="row">
            <div class="label label-start">
              {{$t("task_engine_v2.condition_block.label_content")}}
            </div>
            <dropdown-select
              class="select row-content"
              :key="parser.funcName"
              :ref="`selectTargetEntity_${index}`"
              :multi="false"
              :value="[getNluTargetEntity(parser.content.tags)]"
              @input="setNluTargetEntity(index, $event)"
              :options="nluTypeOptions"
              :showCheckedIcon="false"
              width="200px"
              :inputBarStyle="selectStyle"
            />
          </div>
          <div class="row"
            v-if="parser.content.tags === 'TIME_FUTURE' ||
                  parser.content.tags === 'TIME_PAST'">
            <div class="label label-start">
              {{$t("task_engine_v2.condition_action_block.label_default")}}
            </div>
            <dropdown-select
              class="select row-content"
              :key="parser.funcName"
              :multi="false"
              :value="[parser.content.tags]"
              @input="parser.content.tags = $event[0]"
              :options="nluTimeOptions"
              :showCheckedIcon="false"
              width="200px"
              :inputBarStyle="selectStyle"
            />
          </div>
          <div class="row"
            v-if="parser.content.tags === NLUParserMap.SELECT_CUSTOMIZE_OPTIONS ||
                  parser.content.tags === NLUParserMap.SELECT_OPTIONS_IN_KEY">
            <div class="label label-start">
              {{$t("task_engine_v2.condition_action_block.label_select_mode")}}
            </div>
            <dropdown-select
              class="select row-content"
              :key="parser.funcName"
              :multi="false"
              :value="[parser.content.tags]"
              @input="setNluSelectOptionType(index, $event)"
              :options="nluSelectOptions"
              :showCheckedIcon="false"
              width="200px"
              :inputBarStyle="selectStyle"
            />
          </div>
          <div class="row"
            v-if="parser.content.tags === NLUParserMap.SELECT_CUSTOMIZE_OPTIONS">
            <div class="label label-start"></div>
            <button
              class="add-new-option row-content"
              v-t="'task_engine_v2.condition_action_block.add_option'"
              @click="addNLUSelectOption(parser)">
            </button>
          </div>
          <div class="row"
            v-if="parser.content.tags === NLUParserMap.SELECT_CUSTOMIZE_OPTIONS"
            v-for="(option, index) in parser.content.options" :key="index">
            <div class="label label-start">
              {{`${$t("task_engine_v2.condition_action_block.label_option")}${index + 1}`}}
            </div>
            <input ref="input-content" v-tooltip="tooltip" class="input-content row-content" v-model="parser.content.options[index]" @focus="onInputFocus">
            <button class="button" style="width: 60px;" @click="parser.content.options.splice(index, 1); $forceUpdate();">{{$t("task_engine_v2.condition_block.button_remove")}}</button>
          </div>
          <div class="row"
            v-if="parser.content.tags === NLUParserMap.SELECT_OPTIONS_IN_KEY">
            <div class="label label-start">
              {{$t("task_engine_v2.condition_action_block.label_option_key")}}
            </div>
            <input ref="input-content" v-tooltip="tooltip" class="input-content row-content" v-model="parser.content.option_key" :placeholder="$t('task_engine_v2.condition_action_block.input_placeholder')" @focus="onInputFocus">
          </div>
          <div class="row"
            v-if="parser.content.tags === NLUParserMap.SELECT_CUSTOMIZE_OPTIONS ||
                  parser.content.tags === NLUParserMap.SELECT_OPTIONS_IN_KEY">
            <div class="label label-start">
              {{$t("task_engine_v2.condition_action_block.label_fuzzy_match")}}
            </div>
            <toggle v-model="parser.content.fuzzy_match" class="row-content" :size="'medium'" :showLabel="true" :label="toggleLabel"></toggle>
          </div>
          <div class="row"
            v-if="parser.content.tags!==NLUParserMap.SELECT_CUSTOMIZE_OPTIONS &&
                  parser.content.tags!==NLUParserMap.SELECT_OPTIONS_IN_KEY &&
                  parser.content.tags!==NLUParserMap.POLARITY">
            <div class="label label-start">
              {{$t("task_engine_v2.condition_action_block.label_has_context")}}
            </div>
            <toggle v-model="parser.content.has_context" class="row-content" :size="'medium'" :showLabel="true" :label="toggleLabel"></toggle>
          </div>
        </div>
        <!-- 自定义解析器 -->
        <div class="content-parser" v-if="parser.funcName === 'custom_parser'">
          <div class="row">
            <div class="label label-start">
              {{$t("task_engine_v2.condition_block.label_custom_parser")}}
            </div>
            <dropdown-select
              class="select"
              :key="parser.funcName"
              :ref="`selectMapTable_${index}`"
              :value="[parser.content.parser]"
              @input="customParserInput(index, $event)"
              :options="customParserOptions"
              :showCheckedIcon="false"
              :showSearchBar="true"
              width="420px"
              :inputBarStyle="selectStyle"
            />
          </div>
        </div>
        <!-- 转换数据解析器 -->
        <div class="content-map-table" v-if="parser.funcName === 'user_custom_parser'">
          <div class="row">
            <div class="label label-start">
              {{$t("task_engine_v2.condition_block.label_mapping_table")}}
            </div>
            <dropdown-select
              class="select row-content"
              :ref="`selectMapTable_${index}`"
              :value="[parser.content.trans]"
              @input="onSelectMapTableInput(index, $event)"
              :options="mapTableOptions"
              :showCheckedIcon="false"
              :showSearchBar="true"
              width="420px"
              :inputBarStyle="selectStyle"
            />
          </div>
          <div class="row">
            <div class="label label-start">
              {{$t("task_engine_v2.condition_block.label_target_key")}}
            </div>
            <input ref="input-content" v-tooltip="tooltip" class="row-content input-content" @focus="onInputFocus" v-model="parser.content.to_key" @input="emitUpdate"></input>
          </div>
        </div>
        <!-- 是否判断解析器 -->
        <div class="content-polarity-parser" v-if="parser.funcName === 'polarity_parser'">
          <div class="row">
            <div class="label label-start">
              {{$t("task_engine_v2.condition_block.label_target_key")}}
            </div>
            <input ref="input-content" v-tooltip="tooltip" class="row-content input-content" @focus="onInputFocus"
              v-model="parser.content.key"
              @input="emitUpdate"
            ></input>
          </div>
        </div>
        <!-- Web API 调用 -->
        <div class="content-api-parser" v-if="parser.funcName === 'api_parser'">
          <div class="row">
            <div class="label label-start">
              {{$t("task_engine_v2.condition_block.label_link")}}
            </div>
            <input ref="input-content" v-tooltip="tooltip" class="row-content input-content" @focus="onInputFocus" v-model="parser.content" @input="emitUpdate"></input>
          </div>
          <div class="row">
            <div class="label label-start label-tooltip">
              {{$t("task_engine_v2.params_collecting_tab.skip_if_key_exit")}}
              <div class="tooltip_container" v-tooltip="{ msg: $t('task_engine_v2.params_collecting_tab.skip_if_key_exit_info')}">
                <icon icon-type="info" :enableHover="true" :size=20 />
              </div>
            </div>
            <input ref="input-content" v-tooltip="tooltip" class="row-content input-content" @focus="onInputFocus"
              :value="getWebApiSkipIfKeyExist(index)"
              @input="onInputWebApiSkipIfKeyExist(index, $event.target.value)"
            ></input>
          </div>
        </div>
        <div class="row">
          <div class="label label-start">
            {{$t("task_engine_v2.params_collecting_tab.required")}}
          </div>
          <div class="row-content">
            <input class="checkbox-content"
              type="checkbox"
              :checked="parser.required"
              @input="onInputRequiredCheckbox(index, $event.target.checked)"
            ></input>
          </div>
        </div>
      </div>
    </template>
    <div class="msgs" v-if="hasRequiredParser===true">
      <div class="row">
        <div class="label label-tooltip">
          {{$t("task_engine_v2.params_collecting_tab.msg")}}
          <div class="tooltip_container" v-tooltip="{ msg: $t('task_engine_v2.params_collecting_tab.msg_description')}">
            <icon icon-type="info" :enableHover="true" :size=20 />
          </div>
        </div>
      </div>
      <textarea class="text-response"
        @input="emitUpdate"
        v-model="msg">
      </textarea>
      <div class="row">
        <div class="label">
          {{$t("task_engine_v2.params_collecting_tab.parse_failed_msg")}}
        </div>
      </div>
      <textarea class="text-response"
        @input="emitUpdate"
        v-model="parse_failed_msg">
      </textarea>
    </div>
  </div>
</div>
</template>

<script>
import event from '@/utils/js/event';
import DropdownSelect from '@/components/DropdownSelect';
import general from '@/modules/TaskEngine/_utils/general';
import nerFactoryDalApi from '@/modules/TaskEngine/_api/nerFactoryDal';
import scenarioInitializer from '../_utils/scenarioInitializer';
import optionConfig from '../_utils/optionConfig';

const NLUTypeOptions = optionConfig.NLUTypeOptions;
const NLUParserMap = optionConfig.NLUParserMap;
const NLUTimeParsers = optionConfig.NLUTimeParsers;
const NLUSelectParsers = optionConfig.NLUSelectParsers;

export default {
  name: 'params-collecting-block',
  components: {
    'dropdown-select': DropdownSelect,
  },
  props: {
    nodeId: {
      type: String,
      required: true,
    },
    mapTableOptions: {
      type: Array,
      required: true,
    },
    initialParam: {
      type: Object,
      required: true,
    },
  },
  data() {
    const param = this.initialParam;
    return {
      msg: param.msg,
      parse_failed_msg: param.parse_failed_msg,
      parsers: param.parsers,
      selectStyle: {
        height: '36px',
        'border-radius': '5px',
      },
      tooltip: {
        msg: this.$t('task_engine_v2.err_empty'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
        absolute: true,
      },
      hasRequiredParser: true,
      toggleLabel: {
        on: this.$t('task_engine_v2.condition_action_block.on'),
        off: this.$t('task_engine_v2.condition_action_block.off'),
      },
      NLUParserMap,
      nluTypeOptions: NLUTypeOptions.map(parser => ({
        text: this.$t(`task_engine_v2.condition_action_block.nlu_options.${parser}`),
        value: parser,
      })),
      nluTimeOptions: NLUTimeParsers.map(parser => ({
        text: this.$t(`task_engine_v2.condition_action_block.nlu_time_options.${parser}`),
        value: parser,
      })),
      nluSelectOptions: NLUSelectParsers.map(parser => ({
        text: this.$t(`task_engine_v2.condition_action_block.nlu_select_options.${parser}`),
        value: parser,
      })),
      customParser: [],
      customParserOptions: [],
    };
  },
  computed: {},
  watch: {
    parsers: {
      handler() {
        this.emitUpdate();
      },
      deep: true,
    },
  },
  methods: {
    onInputFocus(evt) {
      evt.target.dispatchEvent(event.createEvent('tooltip-hide'));
    },
    emitUpdate() {
      const param = {
        msg: this.msg,
        parse_failed_msg: this.parse_failed_msg,
        parsers: this.parsers,
      };
      param.valid = this.isValid();
      this.$emit('update', param);
    },
    renderConditionContent() {
      const param = JSON.parse(JSON.stringify(this.initialParam));
      this.msg = param.msg;
      this.parse_failed_msg = param.parse_failed_msg;
      // set default parser.required to true
      this.parsers = param.parsers.map((parser) => {
        if (parser.required === undefined) {
          parser.required = true;
        }
        return parser;
      });
      // console.log(this.initialParam);
    },
    renderHasRequiredParser() {
      let hasRequired = false;
      this.parsers.forEach((parser) => {
        if (parser.required === true) {
          hasRequired = true;
        }
      });
      this.hasRequiredParser = hasRequired;
    },
    deleteParam() {
      this.$emit('deleteParam');
    },
    addParser() {
      const parser = scenarioInitializer.initialParser();
      parser.id = this.$uuid.v1();
      this.parsers.push(parser);
      this.renderHasRequiredParser();
      this.emitUpdate();
    },
    deleteParser(index) {
      this.parsers.splice(index, 1);
      this.renderHasRequiredParser();
      this.emitUpdate();
    },
    addRegTargetKey(index) {
      const operation = scenarioInitializer.initialRegularOperation();
      this.parsers[index].content.operations.push(operation);
      this.emitUpdate();
    },
    deleteRegTargetKey(index, idx) {
      this.parsers[index].content.operations.splice(idx, 1);
      this.emitUpdate();
    },
    getWebApiSkipIfKeyExist(index) {
      if (this.parsers[index].skipIfKeyExist) {
        return this.parsers[index].skipIfKeyExist.join(',');
      } return '';
    },
    onInputWebApiSkipIfKeyExist(index, newValue) {
      this.parsers[index].skipIfKeyExist = newValue.split(',');
      this.emitUpdate();
    },
    onSelectTargetEntity(index, newValue) {
      this.parsers[index].content.tags = newValue.join(',');
      this.emitUpdate();
    },
    onSelectMapTableInput(index, newValue) {
      const newMapTable = newValue[0];
      if (this.parsers[index].content.trans === newMapTable) return;
      this.parsers[index].content.trans = newMapTable;
      this.emitUpdate();
    },
    onSelectFunctionInput(index, newValue) {
      const newFuncName = newValue[0];
      if (this.parsers[index].funcName === newFuncName) return;
      this.parsers[index].funcName = newFuncName;
      // initial content
      const content = scenarioInitializer.initialFunctionContent(newFuncName, this.nodeId);
      this.parsers[index].content = content;
      // update parser options
      if (newFuncName === 'common_parser' ||
          newFuncName === 'task_parser' ||
          newFuncName === 'hotel_parser') {
        const options = this.entityModuleOptions(newFuncName);
        const selectRef = `selectTargetEntity_${index}`;
        if (this.$refs[selectRef] && this.$refs[selectRef].length > 0) {
          this.$refs[selectRef][0].$emit('updateOptions', options);
          content.tags.split(',').forEach((target) => {
            this.$refs[selectRef][0].$emit('select', target);
          });
        }
      }
      this.reloadTooltip();
      this.emitUpdate();
    },
    onInputRequiredCheckbox(index, newValue) {
      this.parsers[index].required = newValue;
      this.renderHasRequiredParser();
      this.emitUpdate();
    },
    reloadTooltip() {
      this.$refs['input-content'].forEach((el) => {
        el.dispatchEvent(event.createEvent('tooltip-reload'));
      });
    },
    entityModuleOptions(parser) {
      const entityModuleOptions = optionConfig.getEntityModuleOptionsMap();
      return entityModuleOptions[parser];
    },
    getEntityKeyNameOptionsMap() {
      const entityListMap = optionConfig.getEntityListMap();
      return {
        none: [],
        common_parser: entityListMap.common_parser.map(option => ({
          text: option,
          value: option,
        })),
        task_parser: entityListMap.task_parser.map(option => ({
          text: option,
          value: option,
        })),
        hotel_parser: entityListMap.hotel_parser.map(option => ({
          text: option,
          value: option,
        })),
      };
    },
    getFuncOptions() {
      return [
        'regular_exp', 'nlu_parser', 'common_parser', 'task_parser',
        'hotel_parser', 'user_custom_parser', 'polarity_parser', 'api_parser', 'custom_parser',
      ].map((func) => {
        const key = `task_engine_v2.condition_block.func.${func}`;
        return {
          text: this.$t(key),
          value: func,
        };
      });
    },
    getNluTargetEntity(tags) {
      if (optionConfig.NLUTimeParsers.indexOf(tags) > -1) {
        return optionConfig.NLUTypeMap.TIME;
      }
      if (optionConfig.NLUSelectParsers.indexOf(tags) > -1) {
        return optionConfig.NLUTypeMap.SELECT;
      }
      return tags.toLowerCase();
    },
    setNluTargetEntity(index, newValue) {
      if (newValue[0] === optionConfig.NLUTypeMap.TIME) {
        this.parsers[index].content.tags = NLUParserMap.TIME_FUTURE;
      } else if (newValue[0] === optionConfig.NLUTypeMap.SELECT) {
        this.parsers[index].content.tags = NLUParserMap.SELECT_CUSTOMIZE_OPTIONS;
        this.parsers[index].content.options = [''];
        this.parsers[index].content.fuzzy_match = true;
        this.parsers[index].content.has_context = true;
      } else if (newValue[0] === optionConfig.NLUTypeMap.POLARITY) {
        this.parsers[index].content.tags = NLUParserMap.POLARITY;
        this.parsers[index].content.has_context = true;
      } else {
        this.parsers[index].content.tags = newValue[0].toUpperCase();
      }
      // this.emitUpdate();
    },
    setNluSelectOptionType(index, newValue) {
      const type = newValue[0];
      const content = this.parsers[index].content;
      content.tags = type;
      delete content.options;
      delete content.option_key;
      if (type === NLUParserMap.SELECT_CUSTOMIZE_OPTIONS) {
        this.$set(content, 'options', ['']);
      }
      if (type === NLUParserMap.SELECT_OPTIONS_IN_KEY) {
        this.$set(content, 'option_key', '');
      }
      // this.emitUpdate();
    },
    addNLUSelectOption(rule) {
      if (rule.content.options) {
        rule.content.options.push('');
      } else {
        this.$set(rule.content, 'options', ['']);
      }
      this.$forceUpdate();
      // this.emitUpdate();
    },
    isValid() {
      return general.isInputContentsValid(this.$refs['input-content']);
    },
    showToolTip() {
      general.showInputContentTooltip(this.$refs['input-content']);
    },
    customParserInput(index, newValue) {
      const parser = newValue[0];
      this.parsers[index].content.parser = parser;
      this.parsers[index].source = 'text';
      this.parsers[index].content.parserData =
        this.customParsers.filter(item => item.parserId === parser)[0];
    },
  },
  beforeMount() {
    this.renderConditionContent();
    this.renderHasRequiredParser();
  },
  mounted() {
    this.$on('showToolTip', this.showToolTip);
    this.appId = this.$cookie.get('appid');
    const that = this;
    nerFactoryDalApi.getNerParserList(this.appId).then((data) => {
      that.customParsers = data.data;
      that.customParserOptions = that.customParsers.map(parser => ({
        text: parser.name,
        value: parser.parserId,
      }));
    });
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';

#params-collecting-block{
  position: relative;
  display: flex;
  flex-direction: column;
  background: #F3F7F9;
  padding: 20px 20px 20px 20px;
  border: 1px solid $color-borderline;
  border-radius: 5px;
  margin: 0px 0px 20px 0px;
  cursor: move;
  .button-delete-param{
    position: absolute;
    top: 10px;
    right: 10px;
  }
  .parser-block{
    &:not(:first-child){
      margin: 30px 0px 0px 0px;
    }
  }
  .row{
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 36px;
    margin: 0px 0px 10px 0px;
    &.row-then-goto{
      margin: 0px 0px 0px 0px;
    }
    .label{
      height: 36px;
      line-height: 36px;
      font-size: 16px;
    }
    .label-tooltip{
      display: flex;
      .tooltip_container{
        .button{
          margin-left: 0;
          background-color: transparent;
        }
        display: flex;
        align-items: center;
      }
    }
    .label-start{
      width: 84px;
    }
    .row-content{
      margin-left: 10px;
    }
    .select{
      background: white;
    }
    input{
      height: 36px;
    }
    input[type=checkbox]{
      @include general-checkbox();
    }
    .input-content{
      width: 420px;
    }
    .checkbox-content{
      height: auto;
      width: auto;
    }
    .button{
      background: #57C7D4;
      height: 36px;
      margin-left: 15px;
      border-radius: 5px;
      color: white;
      font-size: 14px;
      font-weight: 600;
    }
    .button-add-parser{
      width: 100px;
    }
    .add-new-option {
      color: $color-primary;
      border: none;
      background-color: transparent;
      padding: 0;
      @include font-14px();
      cursor: pointer;
    }
  }
  .text-response{
    height: 100px;
    width: 100%;
    color: $color-font-normal;
  }
}
</style>
