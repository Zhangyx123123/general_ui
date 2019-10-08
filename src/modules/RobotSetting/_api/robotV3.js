const ROBOT_QAS_URL = '/api/v3/robot/qas';
const ROBOT_QA_URL = '/api/v3/robot/qa';

function getRobotQABaseURL(id) {
  return `${ROBOT_QA_URL}/${id}`;
}

function getRobotQAs() {
  return this.$reqGet(ROBOT_QAS_URL).then(rsp => rsp.data.result);
}
function addRobotQARelateQuestion(id, content) {
  const that = this;
  const url = `${getRobotQABaseURL(id)}/question`;
  if (!Number.isInteger(id)) {
    return new Promise((resolve, reject) => {
      reject(that.$t('error_msg.invalid_id'));
    });
  }

  return that.$reqPostForm(url, { content }).then(rsp => rsp.data.result);
}
function addRobotQAAnswer(id, content) {
  const that = this;
  const url = `${getRobotQABaseURL(id)}/answer`;
  if (!Number.isInteger(id)) {
    return new Promise((resolve, reject) => {
      reject(that.$t('error_msg.invalid_id'));
    });
  }

  return that.$reqPostForm(url, { content }).then(rsp => rsp.data.result);
}

function deleteRobotQAQuestion(id, qid) {
  const that = this;
  const url = `${getRobotQABaseURL(id)}/question/${qid}`;
  return that.$reqDelete(url);
}

function deleteRobotQAAnswer(id, aid) {
  const that = this;
  const url = `${getRobotQABaseURL(id)}/answer/${aid}`;
  return that.$reqDelete(url);
}

function updateRobotQAQuestion(id, qid, content) {
  const that = this;
  const url = `${getRobotQABaseURL(id)}/question/${qid}`;
  if (!Number.isInteger(id)) {
    return new Promise((resolve, reject) => {
      reject(that.$t('error_msg.invalid_id'));
    });
  }

  return that.$reqPutForm(url, { content }).then(rsp => rsp.data.result);
}
function updateRobotQAAnswer(id, aid, content) {
  const that = this;
  const url = `${getRobotQABaseURL(id)}/answer/${aid}`;
  if (!Number.isInteger(id)) {
    return new Promise((resolve, reject) => {
      reject(that.$t('error_msg.invalid_id'));
    });
  }

  return that.$reqPutForm(url, { content }).then(rsp => rsp.data.result);
}

export default {
  getRobotQAs,
  addRobotQARelateQuestion,
  addRobotQAAnswer,
  updateRobotQAQuestion,
  updateRobotQAAnswer,
  deleteRobotQAQuestion,
  deleteRobotQAAnswer,
};
