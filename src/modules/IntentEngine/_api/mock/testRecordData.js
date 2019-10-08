import MockJS from 'mockjs';

const TOTAL = 20;
const testIntents = [];

// {
//   "status": 0,
//   "message": "success",
//   "result": {
//     "updated_time": 0,
//     "test_intents_count": 0,
//     "test_sentences_count": 0,
//     "true_positives": 0,
//     "false_positives": 0,
//     "true_negatives": 0,
//     "false_negatives": 0,
//     "tester": "string",
//     "name": "string",
//     "saved": true,
//     "ie_model_updated_time": 0,
//     "intents_count": 0,
//     "sentences_count": 0,
//     "test_intents": [
//       {
//         "id": 0,
//         "name": "string",
//         "sentences_count": 0,
//         "positives_count": 0,
//         "type": true
//       }
//     ]
//   }
// }
for (let i = 0; i < TOTAL; i += 1) {
  const mockData = {
    id: MockJS.mock('@id'),
    name: MockJS.mock('@ctitle'),
    sentences_count: MockJS.mock('@integer(1, 1000)'),
    positives_count: MockJS.mock('@integer(1, 1000)'),
    type: true,
  };
  testIntents.push(mockData);
}
testIntents.push({
  id: MockJS.mock('@id'),
  name: MockJS.mock('@ctitle'),
  sentences_count: MockJS.mock('@integer(1, 1000)'),
  positives_count: MockJS.mock('@integer(1, 1000)'),
  type: false,
});

const testRecordResponse = {
  status: 0,
  message: '',
  result: {
    updated_time: MockJS.mock('@datetime("yyyy-MM-dd HH:mm")'),
    test_intents_count: 21,
    test_sentences_count: MockJS.mock('@integer(10000, 20000)'),
    true_positives: MockJS.mock('@integer(1, 500)'),
    false_positives: MockJS.mock('@integer(1, 500)'),
    true_negatives: MockJS.mock('@integer(1, 500)'),
    false_negatives: MockJS.mock('@integer(1, 500)'),
    tester: MockJS.mock('@cname'),
    name: MockJS.mock('@ctitle'),
    ie_model_updated_time: MockJS.mock('@datetime("yyyy-MM-dd HH:mm")'),
    intents_count: 21,
    sentences_count: MockJS.mock('@integer(10000, 20000)'),
    saved: true,
    test_intents: testIntents,
  },
};


export default {
  testRecordResponse,
};
