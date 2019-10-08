import axios from 'axios';

const QS = require('qs');
// const BASE_URL='../../../../api/ApiKey/';
const BASE_URL = '/php/api/ApiKey/';
const INTENT_ENGINE_V1_PATH = `${BASE_URL}get_intent.php`;
const INTENT_ENGINE_V2_LIST_PATH = '/api/v2/intents/intents';


function getIntent(data) {
  return axios({
    method: 'POST',
    url: INTENT_ENGINE_V1_PATH,
    data: QS.stringify(data),
    config: { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  }).then(resp => resp.data);
}

function IntentEngine1(appId) {
  this.appId = appId;
}

IntentEngine1.prototype = {
  checkIntent(intentName) {
    const data = {
      type: 'check',
      app_id: this.appId,
      intent_name: intentName,
    };
    return getIntent(data);
  },
  listIntents() {
    const data = {
      type: 'search',
      app_id: this.appId,
    };
    return getIntent(data);
  },
  updateIntent(data) {
    const params = {
      type: 'update',
      app_id: this.appId,
      data,
    };
    return getIntent(params);
  },
  deleteIntent(intentName) {
    const data = {
      type: 'delete',
      app_id: this.appId,
      intent_name: intentName,
    };
    return getIntent(data);
  },
};

function IntentEngine2() {}

IntentEngine2.prototype = {
  listIntents() {
    return this.$reqGet(INTENT_ENGINE_V2_LIST_PATH);
    // return axios.get(INTENT_ENGINE_V2_LIST_PATH);
  },
};

export default function Api(context, version, appId) {
  this.api = '';
  this.context = context;
  if (version === '1.0') {
    this.api = new IntentEngine1(appId);
  } else if (version === '2.0') {
    this.api = new IntentEngine2();
  }
}

Api.prototype = {
  checkIntent(intentName) {
    return this.api.checkIntent.bind(this.context)(intentName);
  },
  listIntents() {
    return this.api.listIntents.bind(this.context)();
  },
  updateIntent(data) {
    return this.api.updateIntent.bind(this.context)(data);
  },
  deleteIntent(intentName) {
    return this.api.deleteIntent.bind(this.context)(intentName);
  },
};
