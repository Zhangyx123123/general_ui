const SSM_CATEGORY_URL = '/api/v2/bf/ssm/categories';
const SSM_LABEL_URL = '/api/v1/bf/ssm/labels';

function getSSMCategories(userid) {
  const headers = {
    headers: {
      'X-UserID': userid,
    },
  };
  return this.$reqGet(SSM_CATEGORY_URL, headers).then(res => res.data.result);
}

function getSSMLabels() {
  return this.$reqGet(SSM_LABEL_URL).then(res => res.data.result);
}

const INSERT_STD_Q_URL = '/faq/ssm/dac/sq';
function addStdQuestion(appid, userid, question, answer) {
  const stdQParam = {
    category_id: -1,
    sq: question,
    tag_id_list: [],
    answers: [{
      answer,
      dimension_id_list: [],
      end_time: '',
      related_sq_id_list: [],
      start_time: '',
    }],
  };
  const headers = {
    headers: {
      app_id: appid,
      user_id: userid,
    },
  };
  return this.$reqPost(INSERT_STD_Q_URL, stdQParam, headers).then(rsp => rsp.data);
}

export default {
  getSSMCategories,
  getSSMLabels,
  addStdQuestion,
};
