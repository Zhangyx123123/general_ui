import qs from 'qs';

const TAGS_URL = '/api/v1/faq/labels';
const TAG_URL = '/api/v1/faq/label';

function loadLabels() {
  return this.$reqGet(TAGS_URL).then(rsp => rsp.data.result);
}

function addLabel(name) {
  const params = {
    name,
  };
  return this.$reqPost(TAG_URL, qs.stringify(params)).then(rsp => rsp.data);
}
function deleteLabel(id) {
  return this.$reqDelete(`${TAG_URL}/${id}`).then(rsp => rsp.data);
}
function updateLabel(id, name) {
  const params = {
    name,
  };
  return this.$reqPut(`${TAG_URL}/${id}`, qs.stringify(params)).then(rsp => rsp.data);
}

export default {
  loadLabels,
  addLabel,
  deleteLabel,
  updateLabel,
};
