import MockJS from 'mockjs';

const TOTAL = 20;
const testIntents = [];

// {
//   "intents": [
//     {
//       "id": 0,
//       "name": "string",
//       "sentences_count": 0
//       "type": false
//     }
//   ]
// }
for (let i = 0; i < TOTAL; i += 1) {
  const mockData = {
    id: MockJS.mock('@id'),
    name: MockJS.mock('@ctitle'),
    sentences_count: MockJS.mock('@integer(1, 1000)'),
    type: true,
  };
  testIntents.push(mockData);
}
testIntents.push({
  id: MockJS.mock('@id'),
  name: MockJS.mock('@ctitle'),
  sentences_count: MockJS.mock('@integer(1, 1000)'),
  type: false,
});

const testIntentsResponse = {
  status: 0,
  message: '',
  result: testIntents,
};


export default {
  testIntentsResponse,
};
