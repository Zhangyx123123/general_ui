import MockJS from 'mockjs';

const TOTAL = 30;
const testRecords = [];

for (let i = 0; i < TOTAL; i += 1) {
  const mockData = {
    intent_test: {
      updated_time: MockJS.mock('@datetime("yyyy-MM-dd HH:mm")'),
      test_intents_count: MockJS.mock('@integer(1, 20)'),
      test_sentences_count: MockJS.mock('@integer(1, 1000)'),
      true_positives: MockJS.mock('@integer(1, 200)'),
      false_positives: MockJS.mock('@integer(1, 200)'),
      true_negatives: MockJS.mock('@integer(1, 200)'),
      false_negatives: MockJS.mock('@integer(1, 200)'),
      id: MockJS.mock('@id'),
      name: MockJS.mock('@ctitle'),
      tester: MockJS.mock('@cname'),
    },
    ie_model: {
      id: MockJS.mock('@id'),
      updated_time: MockJS.mock('@datetime("yyyy-MM-dd HH:mm")'),
      intents_count: MockJS.mock('@integer(1, 20)'),
      sentences_count: MockJS.mock('@integer(1, 1000)'),
    },
  };
  testRecords.push(mockData);
}

const testRecordsResponse = {
  status: 0,
  message: '',
  result: {
    latest: testRecords.slice(0, 5),
    saved: testRecords.slice(5, 30),
  },
};

export default {
  testRecordsResponse,
};
