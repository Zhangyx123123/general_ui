import qs from 'qs';

const GET_INTENT_URL = 'api/v2/intents';
const DELETE_INTENTS_URL = 'api/v2/intents/delete';
const IMPORT_INTENT_URL = 'api/v2/intents/import';
const TRAIN_URL = 'api/v2/intents/train';
const GET_TRAINING_STATUS_URL = 'api/v2/intents/status';

const INTENT_ACTION_URL = 'api/v2/intents/intent';

function getIntents() {
  return this.$reqGet(GET_INTENT_URL).then(rsp => rsp.data.result);
}

function getIntentsDetail(keyword, version) {
  let GET_INTENT_DETAIL_URL = version === undefined ? `${GET_INTENT_URL}/intents?` : `${GET_INTENT_URL}/intents?version=${version}`;
  if (keyword) {
    GET_INTENT_DETAIL_URL = `${GET_INTENT_DETAIL_URL}keyword=${keyword}`;
  }
  return this.$reqGet(GET_INTENT_DETAIL_URL).then(rsp => rsp.data.result.map((intent) => {
    intent.count = intent.positive_count + intent.negative_count;
    return intent;
  }));
}

function importIntents(file) {
  const data = new FormData();
  data.append('file', file);
  return this.$reqPost(IMPORT_INTENT_URL, data).then(rsp => rsp.data.result);
}

function addIntent(param) {
  const body = {
    name: param.name,
    positive: JSON.stringify(param.pos),
    negative: JSON.stringify(param.neg),
  };
  return this.$reqPost(INTENT_ACTION_URL, qs.stringify(body), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(rsp => rsp.data.result);
}

function updateIntent(intent, intentName, updated, added, deleted) {
  const type = {
    pos: 0,
    neg: 1,
  };
  const intentId = intent.id;
  let updateObj = [];
  updateObj = updated.map((u) => {
    const returnObj = {
      id: u.id,
      content: u.text,
      type: type[u.type],
    };
    return returnObj;
  });
  updateObj = updateObj.concat(added.map(((a) => {
    const returnObj = {
      id: 0,
      content: a.text,
      type: type[a.type],
    };
    return returnObj;
  })));

  const param = {
    name: intentName,
    update: JSON.stringify(updateObj),
    delete: JSON.stringify(deleted),
  };
  return this.$reqPatch(`${INTENT_ACTION_URL}/${intentId}`, qs.stringify(param), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(rsp => rsp.data.result);
}

function deleteIntent(idToDel) {
  return this.$reqDelete(`${INTENT_ACTION_URL}/${idToDel}`);
}

function getCorpus(intentId, keyword) {
  let GET_CORPUS_URL = `${INTENT_ACTION_URL}/${intentId}`;
  GET_CORPUS_URL = keyword ? `${GET_CORPUS_URL}?keyword=${keyword}` : GET_CORPUS_URL;
  return this.$reqGet(GET_CORPUS_URL).then(rsp => rsp.data.result);
}

function startTraining() {
  // use only intent engine in v1.2
  return this.$reqPost(`${TRAIN_URL}?engine=intent_engine`);
}

function getTrainingStatus() {
  // const GET_VERSION_TRAINING_STATUS_URL = version ?
  // `${GET_TRAINING_STATUS_URL}?version=${version}` : GET_TRAINING_STATUS_URL;
  // return Promise.resolve('NOT_TRAINED');
  return this.$reqGet(GET_TRAINING_STATUS_URL)
    .then((rsp) => {
      const result = rsp.data.result;
      // const IE = result.ie_status;
      // // const RE = result.re_status;

      /** Use this if Training Button can train both IE and RE */
      // if (IE === 'TRAINING' || RE === 'TRAINING') {
      //   status = 'TRAINING';
      // } else if (IE === 'NOT_TRAINED' || RE === 'NOT_TRAINED') {
      //   status = 'NOT_TRAINED';
      // } else if (IE === 'TRAIN_FAILED' || RE === 'TRAIN_FAILED') {
      //   status = 'TRAIN_FAILED';
      // } else {
      //   status = 'TRAINED';
      // }
      switch (result.status) {
        case 'TRAINING':
        case 'NOT_TRAINED':
        case 'TRAIN_FAILED':
          break;
        case 'NEED_TRAIN':
          result.status = 'NOT_TRAINED';
          break;
        default:
          result.status = 'TRAINED';
      }
      return result;
    });
}

function deleteIntents(IDs) {
  return this.$reqPost(DELETE_INTENTS_URL, {
    id: IDs,
  });
}

function getModels() {
  return this.$reqGet(`${GET_INTENT_URL}/models`).then(rsp => rsp.data.result);
}

function exportModel(appid, version) {
  window.open(`${GET_INTENT_URL}/export?appid=${appid}&version=${version}`);
}

export default {
  getIntents,
  getIntentsDetail,
  importIntents,
  addIntent,
  updateIntent,
  deleteIntent,
  getCorpus,
  startTraining,
  getTrainingStatus,
  deleteIntents,
  getModels,
  exportModel,
};
