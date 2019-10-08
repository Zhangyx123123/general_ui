import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import IntentTest from '@/modules/IntentEngine/_api/mock/intentTest';

const mock = new MockAdapter(axios);

function start() {
  IntentTest.startMock(mock);
  mock.onAny().passThrough(); // Let non-matched APIs through
}

export default {
  start,
};
