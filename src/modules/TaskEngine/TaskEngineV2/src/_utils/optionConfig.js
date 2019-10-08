import DialogueIcon from '@/assets/icons/dialogue_icon.svg';
import ParameterCollectingIcon from '@/assets/icons/parameter_collecting_icon.svg';
import RestfulIcon from '@/assets/icons/restful_icon.svg';
import TDEParameterCollectingIcon from '@/assets/icons/tde_parameter_collecting_icon.svg';
import ActionIcon from '@/assets/icons/action_icon.svg';

const ActionType = {
  CustomParser: 'custom_parser',
  Parser: 'parser',
  AssignValue: 'assign_value',
  WebAPI: 'web_api',
  JSScript: 'js_script',
  ResponseText: 'response_text',
  RemoveKey: 'remove_key',
};
const Parsers = ['common_parser', 'task_parser', 'hotel_parser', 'user_custom_parser', 'polarity_parser', 'nlu_parser', 'reg_parser'];
const NLUParserMap = {
  ADDRESS: 'ADDRESS',
  QUANTITY: 'QUANTITY',
  PERSON_NUMBER: 'PERSON_NUMBER',
  MONEY: 'MONEY',
  MOBILE_PHONE: 'MOBILE_PHONE',
  ORDINAL_NUMBER: 'ORDINAL_NUMBER',
  PERSON_NAME: 'PERSON_NAME',
  SURNAME: 'SURNAME',
  POLARITY: 'POLARITY',
  TIME_FUTURE: 'TIME_FUTURE',
  TIME_PAST: 'TIME_PAST',
  SELECT_CUSTOMIZE_OPTIONS: 'SELECT_CUSTOMIZE_OPTIONS',
  SELECT_OPTIONS_IN_KEY: 'SELECT_OPTIONS_IN_KEY',
};
const NLUTypeMap = {
  ADDRESS: 'address',
  TIME: 'time',
  MONEY: 'money',
  MOBILE_PHONE: 'mobile_phone',
  PERSON_NAME: 'person_name',
  SELECT: 'select',
  POLARITY: 'polarity',
};
const NLUTypeOptions = Object.values(NLUTypeMap);
const NLUTimeParsers = [NLUParserMap.TIME_FUTURE, NLUParserMap.TIME_PAST];
const NLUSelectParsers = [
  NLUParserMap.SELECT_CUSTOMIZE_OPTIONS,
  NLUParserMap.SELECT_OPTIONS_IN_KEY,
];
export default {
  nodeType2Tabs() {
    return {
      entry: ['settingBasicTab', 'triggerTab', 'edgeTab'],
      dialogue: ['settingTab', 'edgeTab'],
      'dialogue_2.0': ['dialogue2SettingTab', 'edgeTab2'],
      nlu_pc: ['settingBasicTab', 'entityCollectingTab', 'edgeTab'],
      restful: ['restfulSettingTab', 'restfulEdgeTab'],
      parameter_collecting: ['settingBasicTab', 'paramsCollectingTab', 'paramsCollectingEdgeTab'],
      action: ['settingBasicTab', 'actionTab', 'edgeTab'],
    };
  },
  getEntityListMap() {
    const commonEntityOptions = [
      'time', 'city', 'landmark', 'money', 'time_period',
      'phone_call', 'adjust_light', 'adjust_volume', 'movie_name', 'song_name',
      'star_name', 'teleplay_name', 'album_name', 'number',
    ];
    const taskEntityOptions = [
      'fromPlace', 'toPlace', 'departDate', 'arriveDate', 'returnDate',
    ];
    const hotelEntityOptions = [
      'City', 'CheckinDate', 'CheckoutDate', 'LandMark', 'HotelName',
      'Star', 'Price',
    ];
    return {
      common_parser: commonEntityOptions,
      task_parser: taskEntityOptions,
      hotel_parser: hotelEntityOptions,
    };
  },
  getEntityModuleOptionsMap() {
    const entityListMap = this.getEntityListMap();
    return {
      none: [],
      common_parser: entityListMap.common_parser.map(option => ({
        // 'time_module', 'city_module', 'landmark_module', 'money_module', 'time_period_module',
        text: option,
        value: `${option}_module`,
      })),
      task_parser: entityListMap.task_parser.map((option) => {
        // from_place,to_place,depart_date,arrive_date,return_date
        // CamelCase to snake_case
        const snakeCase = option.replace(/[\w]([A-Z])/g, m => `${m[0]}_${m[1]}`).toLowerCase();
        return {
          text: option,
          value: snakeCase,
        };
      }),
      hotel_parser: entityListMap.hotel_parser.map(option => ({
        // City,CheckinDate,CheckoutDate,LandMark,HotelName,Star,Price
        text: option,
        value: option,
      })),
    };
  },
  getNodeTypes(context) {
    const nodeTypes = [
      {
        type: 'entry',
        name: context.$t('task_engine_v2.node_type.entry'),
        image: '@/assets/icons/dialogue_icon.svg',
        description: '',
      },
      {
        type: 'dialogue',
        name: context.$t('task_engine_v2.node_type.dialogue'),
        image: DialogueIcon,
        description: context.$t('task_engine_v2.node_type.dialogue_description'),
      },
      {
        type: 'dialogue_2.0',
        name: context.$t('task_engine_v2.node_type.dialogue2'),
        image: DialogueIcon,
        description: context.$t('task_engine_v2.node_type.dialogue_description'),
      },
      {
        type: 'parameter_collecting',
        name: context.$t('task_engine_v2.node_type.parameter_collecting'),
        image: ParameterCollectingIcon,
        description: context.$t('task_engine_v2.node_type.parameter_collecting_description'),
      },
      {
        type: 'restful',
        name: context.$t('task_engine_v2.node_type.restful'),
        image: RestfulIcon,
        description: context.$t('task_engine_v2.node_type.restful_description'),
      },
      {
        type: 'nlu_pc',
        name: context.$t('task_engine_v2.node_type.nlu_pc'),
        image: TDEParameterCollectingIcon,
        description: context.$t('task_engine_v2.node_type.nlu_pc_description'),
      },
      {
        type: 'action',
        name: context.$t('task_engine_v2.node_type.action'),
        image: ActionIcon,
        description: context.$t('task_engine_v2.node_type.action_description'),
      },
    ];
    return nodeTypes;
  },
  NodeToEdgeMap: {
    entry: 'edgeTab',
    dialogue: 'edgeTab',
    'dialogue_2.0': 'edgeTab2',
    parameter_collecting: 'paramsCollectingEdgeTab',
    nlu_pc: 'edgeTab',
    action: 'edgeTab',
  },
  getWarningMsgMap(context) {
    return {
      has_exit_connection: context.$t('task_engine_v2.warnings.has_exit_connection'),
      missing_inbound_connection: context.$t('task_engine_v2.warnings.missing_inbound_connection'),
      missing_outbound_connection: context.$t('task_engine_v2.warnings.missing_outbound_connection'),
      missing_entry_trigger: context.$t('task_engine_v2.warnings.missing_entry_trigger'),
      missing_response: context.$t('task_engine_v2.warnings.missing_response'),
      missing_failure_response: context.$t('task_engine_v2.warnings.missing_failure_response'),
      missing_response_dialogue_2: context.$t('task_engine_v2.warnings.missing_response_dialogue_2'),
      missing_failure_response_dialogue_2: context.$t('task_engine_v2.warnings.missing_failure_response_dialogue_2'),
      missing_response_pc: context.$t('task_engine_v2.warnings.missing_response_pc'),
      missing_failure_response_pc: context.$t('task_engine_v2.warnings.missing_failure_response_pc'),
      hss_connection_to_not_exist_node: context.$t('task_engine_v2.warnings.hss_connection_to_not_exist_node'),
    };
  },
  getSourceOptions(context) {
    return [
      {
        text: context.$t('task_engine_v2.condition_block.source.text'),
        value: 'text',
      },
      {
        text: context.$t('task_engine_v2.condition_block.source.global_info'),
        value: 'global_info',
      },
      // {
      //   text: context.$t('task_engine_v2.condition_block.source.cu'),
      //   value: 'cu',
      // },
    ];
  },
  getSourceOptionsV2(context) {
    return [{
      text: context.$t('task_engine_v2.condition_action_block.source.text'),
      value: 'text',
    },
    {
      text: context.$t('task_engine_v2.condition_action_block.source.global_info'),
      value: 'global_info',
    }];
  },
  ActionType,
  getActionOptions(context) {
    return [{
      text: context.$t('task_engine_v2.condition_action_block.action.custom_parser'),
      value: ActionType.CustomParser,
    },
    {
      text: context.$t('task_engine_v2.condition_action_block.action.parser'),
      value: ActionType.Parser,
    },
    {
      text: context.$t('task_engine_v2.condition_action_block.action.assign_value'),
      value: ActionType.AssignValue,
    },
    {
      text: context.$t('task_engine_v2.condition_action_block.action.api_parser'),
      value: ActionType.WebAPI,
    },
    {
      text: context.$t('task_engine_v2.condition_action_block.action.exec_script'),
      value: ActionType.JSScript,
    },
    {
      text: context.$t('task_engine_v2.condition_action_block.action.response_text'),
      value: ActionType.ResponseText,
    },
    {
      text: context.$t('task_engine_v2.condition_action_block.action.remove_key'),
      value: ActionType.RemoveKey,
    }];
  },
  Parsers,
  NLUParserMap,
  NLUTypeMap,
  NLUTypeOptions,
  NLUTimeParsers,
  NLUSelectParsers,
  getActionOptionMap(context) {
    const assignValue = ['set_key_to_value', 'set_key_to_key'];
    return {
      [ActionType.AssignValue]: assignValue.map((func) => {
        const key = `task_engine_v2.condition_action_block.func.${func}`;
        return {
          text: context.$t(key),
          value: func,
        };
      }),
      [ActionType.Parser]: Parsers.map((parser) => {
        const key = `task_engine_v2.condition_action_block.func.${parser}`;
        return {
          text: context.$t(key),
          value: parser,
        };
      }),
    };
  },
  getFuncOptionMap(context, page) {
    let textFuncs = [
      'match', 'contains', 'regular_exp', 'nlu_parser', 'common_parser',
      'task_parser', 'hotel_parser', 'user_custom_parser', 'polarity_parser', 'api_parser',
      'intent_parser', 'custom_parser',
    ];
    let globalInfoFuncs = [
      'key_val_match', 'key_key_match', 'contain_key', 'not_contain_key', 'list_length_match',
      'counter_check', 'user_custom_transform', 'regular_exp_from_var', 'assign_value', 'remove_key',
    ];
    if (page === 'TriggerEditTab') {
      textFuncs = [
        'match', 'contains', 'regular_exp', 'user_custom_parser', 'api_parser', 'intent_parser',
      ];
      globalInfoFuncs = [
        'key_val_match', 'key_key_match', 'contain_key', 'not_contain_key', 'list_length_match',
        'regular_exp_from_var',
      ];
    }
    return {
      text: textFuncs.map((func) => {
        const key = `task_engine_v2.condition_block.func.${func}`;
        return {
          text: context.$t(key),
          value: func,
        };
      }),
      global_info: globalInfoFuncs.map((func) => {
        const key = `task_engine_v2.condition_block.func.${func}`;
        return {
          text: context.$t(key),
          value: func,
        };
      }),
    };
  },
  getFuncOptionMapV2(context) {
    const textFuncs = [
      'match', 'contains', 'regular_exp', 'intent_parser',
    ];
    const globalIngoFuncs = [
      'key_val_match', 'key_key_match', 'contain_key', 'not_contain_key', 'list_length_match',
      'counter_check', 'user_custom_transform', 'regular_exp_from_var',
    ];
    return {
      text: textFuncs.map((func) => {
        const key = `task_engine_v2.condition_action_block.func.${func}`;
        return {
          text: context.$t(key),
          value: func,
        };
      }),
      global_info: globalIngoFuncs.map((func) => {
        const key = `task_engine_v2.condition_action_block.func.${func}`;
        return {
          text: context.$t(key),
          value: func,
        };
      }),
    };
  },
  getRainbowColors() {
    return [
      '#db6b6c', '#4F68F7', '#44895F', '#f8c954', '#7e47ae',
      '#dc7598', '#5a99d2', '#89B458', '#eaa355', '#8a7168',
    ];
  },
  getBasicCompareOptions(context) {
    return [
      {
        text: context.$t('task_engine_v2.condition_block.operator.equal_to'),
        value: '==',
      },
      {
        text: context.$t('task_engine_v2.condition_block.operator.not_equal_to'),
        value: '!=',
      },
      {
        text: context.$t('task_engine_v2.condition_block.operator.greater_than'),
        value: '>',
      },
      {
        text: context.$t('task_engine_v2.condition_block.operator.greater_or_equal_to'),
        value: '>=',
      },
      {
        text: context.$t('task_engine_v2.condition_block.operator.less_than'),
        value: '<',
      },
      {
        text: context.$t('task_engine_v2.condition_block.operator.less_or_equal_to'),
        value: '<=',
      },
    ];
  },
  getKeyValMatchCompareOptions(context) {
    const options = this.getBasicCompareOptions(context);
    return [
      ...options,
      {
        text: context.$t('task_engine_v2.condition_block.operator.ignore_case_compare'),
        value: 'ignore_case_compare',
      },
      {
        text: context.$t('task_engine_v2.condition_block.operator.reg_exp'),
        value: 'reg_exp',
      },
    ];
  },
  getKeyKeyMatchCompareOptions(context) {
    const options = this.getBasicCompareOptions(context);
    return [
      ...options,
      {
        text: context.$t('task_engine_v2.condition_block.operator.ignore_case_compare'),
        value: 'ignore_case_compare',
      },
      {
        text: context.$t('task_engine_v2.condition_block.operator.in'),
        value: 'in',
      },
    ];
  },
  getListLengthMatchCompareOptions(context) {
    return this.getBasicCompareOptions(context);
  },
  getCounterCheckOptions(context) {
    return [
      {
        text: context.$t('task_engine_v2.condition_block.node_counter'),
        value: 'node_counter',
      },
      {
        text: context.$t('task_engine_v2.condition_block.scenario_counter'),
        value: 'scenario_counter',
      },
    ];
  },
  getCuParserOptions() {
    return [
      {
        text: 'Intent',
        value: 'Intent',
      },
    ];
  },
};
