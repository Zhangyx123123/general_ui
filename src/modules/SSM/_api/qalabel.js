import qs from 'qs';

const TAGS_URL = '/api/v1/bf/ssm/labels';
// const TAG_URL = '/api/v1/faq/label';

// const TAGS_URL = '/faq/ssm/dac/tag';
const TAG_ADD_URL = '/tag/add';
const TAG_UPDATE_URL = '/tag/update';
const TAG_DELETE_URL = '/tag/delete';

function loadLabels() {
  return this.$reqGet(TAGS_URL).then(rsp => rsp.data);
}

function addLabel(params) {
  return this.$reqPost(TAG_ADD_URL, qs.stringify(params)).then(rsp => rsp.data);
}
function updateLabel(params) {
  return this.$reqPost(TAG_UPDATE_URL, qs.stringify(params)).then(rsp => rsp.data);
}
function deleteLabel(params) {
  return this.$reqPost(TAG_DELETE_URL, qs.stringify(params)).then(rsp => rsp.data);
}


export default {
  loadLabels,
  addLabel,
  deleteLabel,
  updateLabel,
};
