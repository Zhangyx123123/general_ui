import qs from 'qs';

const ACTIVITIES_URL = '/api/v1/faq/rules';
const ACTIVITY_URL = '/api/v1/faq/rule';

function loadRules() {
  return this.$reqGet(ACTIVITIES_URL).then(rsp => rsp.data.result);
}

function addRule(rule) {
  const params = {
    name: rule.name,
    rule: JSON.stringify(rule.rule),
    target: rule.target,
    answer: rule.answer,
    response_type: rule.type,
    status: rule.status,
    labels: rule.labels.join(','),
  };
  if (rule.begin_time) {
    rule.begin_time.toISOString();
  }
  if (rule.end_time) {
    rule.end_time.toISOString();
  }
  return this.$reqPost(ACTIVITY_URL, qs.stringify(params)).then(rsp => rsp.data.result);
}

function updateRule(id, rule) {
  const params = {
    name: rule.name,
    rule: JSON.stringify(rule.rule),
    target: rule.target,
    answer: rule.answer,
    response_type: rule.type,
    status: rule.status,
    labels: rule.labels.join(','),
  };
  if (rule.begin_time) {
    rule.begin_time.toISOString();
  }
  if (rule.end_time) {
    rule.end_time.toISOString();
  }
  return this.$reqPut(`${ACTIVITY_URL}/${id}`, qs.stringify(params));
}

function deleteRule(id) {
  return this.$reqDelete(`${ACTIVITY_URL}/${id}`);
}

export default {
  loadRules,
  addRule,
  updateRule,
  deleteRule,
};
