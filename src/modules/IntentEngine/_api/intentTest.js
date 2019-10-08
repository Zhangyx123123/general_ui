import qs from 'qs';

const INTENT_TEST_URL = '/api/v1/intent_tests';
const INTENT_TEST_DATA_URL = '/api/v1/intent_tests/intents';

function getTestRecords() {
  return this.$reqGet(INTENT_TEST_URL).then(rsp => rsp.data.result);
}

function getTestStatus() {
  return this.$reqGet(`${INTENT_TEST_URL}/status`).then(rsp => rsp.data.result);
}

function getTestRecord(intentTestId, keyword) {
  return this.$reqGet(`${INTENT_TEST_URL}/${intentTestId}`, {
    params: {
      keyword,
    },
  }).then(rsp => rsp.data.result);
}

function saveTestRecord(intentTestId, recordName) {
  const body = {
    name: recordName,
  };
  return this.$reqPost(
    `${INTENT_TEST_URL}/${intentTestId}/save`,
    qs.stringify(body),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  ).then(rsp => rsp.data.result);
}

function patchTestRecord(intentTestId, recordName) {
  const body = {
    name: recordName,
  };
  return this.$reqPatch(
    `${INTENT_TEST_URL}/${intentTestId}`,
    qs.stringify(body),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  ).then(rsp => rsp.data.result);
}

function unsaveTestRecord(intentTestId) {
  return this.$reqDelete(`${INTENT_TEST_URL}/${intentTestId}/unsave`).then(rsp => rsp.data.result);
}

function exportTestRecord(intentTestId) {
  const token = window.localStorage.getItem('token');
  window.open(`${INTENT_TEST_URL}/${intentTestId}/export?token=Bearer%20${token}`);
}

function restoreTestRecord(intentTestId) {
  return this.$reqPost(`${INTENT_TEST_URL}/${intentTestId}/restore`).then(rsp => rsp.data.result);
}

function getTestIntents(keyword) {
  return this.$reqGet(INTENT_TEST_DATA_URL, {
    params: {
      keyword,
    },
  }).then(rsp => rsp.data.result);
}

function getIntentTestCorpus(intentId, keyword) {
  return this.$reqGet(`${INTENT_TEST_DATA_URL}/${intentId}`, {
    params: {
      keyword,
    },
  }).then(rsp => rsp.data.result);
}

function patchIntentTestCorpus(intentId, update, del) {
  const body = {
    update: JSON.stringify(update),
    delete: JSON.stringify(del),
  };
  return this.$reqPatch(
    `${INTENT_TEST_DATA_URL}/${intentId}`,
    qs.stringify(body),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  ).then(rsp => rsp.data.result);
}

function importIntentTestCorpus(file) {
  const formData = new FormData();
  formData.append('file', file);
  return this.$reqPost(
    `${INTENT_TEST_URL}/import`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  ).then(rsp => rsp.data.result);
}

function exportIntentTestCorpus() {
  const token = window.localStorage.getItem('token');
  window.open(`${INTENT_TEST_URL}/export?token=Bearer%20${token}`);
}

function testIntentTestCorpus(intentModelId) {
  const body = {
    ie_model_id: intentModelId,
  };
  return this.$reqPost(
    `${INTENT_TEST_URL}/test`,
    qs.stringify(body),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  ).then(rsp => rsp.data.result);
}

function getModels() {
  return this.$reqGet(`${INTENT_TEST_URL}/models`).then(rsp => rsp.data.result);
}

export default {
  getTestRecords,
  getTestRecord,
  getTestStatus,
  saveTestRecord,
  patchTestRecord,
  unsaveTestRecord,
  exportTestRecord,
  restoreTestRecord,
  getTestIntents,
  getIntentTestCorpus,
  patchIntentTestCorpus,
  importIntentTestCorpus,
  exportIntentTestCorpus,
  testIntentTestCorpus,
  getModels,
};
