import MockJS from 'mockjs';

const TOTAL = 20;
const testCorpus = [];

// {
//   "status": 0,
//   "message": "success",
//   "result": [
//     {
//       "id": 0,
//       "sentence": "string",
//       "result": 0,
//       "score": 0,
//       "answer": "string"
//     }
//   ]
// }
for (let i = 0; i < TOTAL; i += 1) {
  const mockData = {
    id: MockJS.mock('@id'),
    sentence: MockJS.mock('@csentence(3, 100)'),
    result: MockJS.mock('@integer(0, 2)'),
    score: MockJS.mock('@integer(1, 100)'),
    answer: MockJS.mock('@ctitle(3, 20)'),
  };
  testCorpus.push(mockData);
}

const intentTestCorpusResponse = {
  status: 0,
  message: '',
  result: testCorpus,
};


export default {
  intentTestCorpusResponse,
};
