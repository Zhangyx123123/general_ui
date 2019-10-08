import testRecordData from './testRecordData';
import testRecordsData from './testRecordsData';
import testIntentsData from './testIntentsData';
import intentTestCorpusData from './intentTestCorpusData';

const successResponse = {
  status: 0,
  message: '',
};

function startMock(mock) {
  mock.onGet('/api/v1/intent_tests')
  .reply(200, testRecordsData.testRecordsResponse);
  mock.onGet('/api/v1/intent_tests/status')
  .reply(200, successResponse);
  mock.onGet('/api/v1/intent_tests/intents')
  .reply(200, testIntentsData.testIntentsResponse);
  mock.onGet(/\/api\/v1\/intent_tests\/\d+/)
  .reply(200, testRecordData.testRecordResponse);
  mock.onPost(/\/api\/v1\/intent_tests\/\d+\/save/)
  .reply(200, successResponse);
  mock.onDelete(/\/api\/v1\/intent_tests\/\d+\/unsave/)
  .reply(200, successResponse);
  mock.onGet(/\/api\/v1\/intent_tests\/\d+\/export/)
  .reply(200, successResponse);
  mock.onPost(/\/api\/v1\/intent_tests\/\d+\/restore/)
  .reply(200, successResponse);
  mock.onGet(/\/api\/v1\/intent_tests\/intents\/\d+/)
  .reply(200, intentTestCorpusData.intentTestCorpusResponse);
  mock.onPatch(/\/api\/v1\/intent_tests\/intents\/\d+/)
  .reply(200, successResponse);
  mock.onPost('/api/v1/intent_tests/import')
  .reply(200, successResponse);
  mock.onGet('/api/v1/intent_tests/export')
  .reply(200, successResponse);
  mock.onPost('/api/v1/intent_tests/test')
  .reply(200, successResponse);
}

export default {
  startMock,
};
