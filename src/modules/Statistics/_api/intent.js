const GET_INTENT_URL = '/api/v2/intents/intents';

function getIntents() {
  return this.$reqGet(GET_INTENT_URL).then(rsp => rsp.data.result);
}

export default {
  getIntents,
};
