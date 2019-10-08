const FEEDBACK_REASONS_URL = '/api/v1/feedback/feedback/reasons';

function getFeedbackReasons() {
  return this.$reqGet(FEEDBACK_REASONS_URL).then(rsp => rsp.data);
}

export default {
  getFeedbackReasons,
};
