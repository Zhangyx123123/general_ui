import qs from 'qs';

const GET_FUNCTIONS_INFO_PATH = '/api/v1/robot/functions';
const SET_FUNCTION_INFO_PATH = '/api/v1/robot/function';
const SET_ALL_FUNCTIONS_INFO_PATH = '/api/v1/robot/functions';
const GET_FUNCTIONS_INFO_PATH_V2 = '/api/v2/robot/functions';
const SET_FUNCTION_INFO_PATH_V2 = '/api/v2/robot/function';
const SET_ALL_FUNCTIONS_INFO_PATH_V2 = '/api/v2/robot/functions';

const GET_QA_LIST_PATH = '/api/v1/robot/qas';
const QA_OPERATION_PATH = '/api/v1/robot/qa';
const REBUILD_QA_PATH = '/api/v1/robot/qabuild';
const GET_QA_LIST_PATH_V2 = '/api/v2/robot/qas';
const QA_OPERATION_PATH_V2 = '/api/v2/robot/qa';

const GET_ENT_WECHAT_LIST = '/api/v1/integration/config';
const BIND_ENT_WECHAT = '/api/v1/integration/config';
const UNBIND_ENT_WECHAT = '/api/v1/integration/config';

function getFunctionsStatus() {
  return this.$reqGet(GET_FUNCTIONS_INFO_PATH).then(rsp => rsp.data.result);
}

function setFunctionStatus(key, status) {
  const param = {
    active: status,
  };

  return this.$reqPost(`${SET_FUNCTION_INFO_PATH}/${key}`, qs.stringify(param));
}

function setFunctionInfos(infos, val) {
  const statusMap = {};
  infos.forEach((info) => {
    statusMap[info.code] = val;
  });
  const param = {
    active: JSON.stringify(statusMap),
  };
  return this.$reqPost(SET_ALL_FUNCTIONS_INFO_PATH, qs.stringify(param));
}

function getFunctionsStatusV2() {
  return this.$reqGet(GET_FUNCTIONS_INFO_PATH_V2).then(rsp => rsp.data.result);
}

function setFunctionStatusV2(key, status) {
  const param = {
    active: status,
  };

  return this.$reqPost(`${SET_FUNCTION_INFO_PATH_V2}/${key}`, qs.stringify(param));
}

function setFunctionInfosV2(infos, val) {
  const statusMap = {};
  infos.forEach((info) => {
    statusMap[info.code] = val;
  });
  const param = {
    active: JSON.stringify(statusMap),
  };
  return this.$reqPost(SET_ALL_FUNCTIONS_INFO_PATH_V2, qs.stringify(param));
}

function getRobotQAList(page, perPage) {
  const params = {};

  // input validation
  const pageInt = parseInt(page, 10);
  if (pageInt !== undefined) {
    params.page = pageInt;
  }
  const perPageInt = parseInt(perPage, 10);
  if (perPageInt !== undefined) {
    params.per_page = perPageInt;
  }
  return this.$reqGet(GET_QA_LIST_PATH, { params })
    .then(data => data.data.result);
}

function rebuildRobotQAModel() {
  return this.$reqPost(REBUILD_QA_PATH);
}

function updateRobotQA(info) {
  return this.$reqPost(`${QA_OPERATION_PATH}/${info.id}`, info);
}

function getRobotQAListV2(page, perPage) {
  const params = {};

  // input validation
  const pageInt = parseInt(page, 10);
  if (pageInt !== undefined) {
    params.page = pageInt;
  }
  const perPageInt = parseInt(perPage, 10);
  if (perPageInt !== undefined) {
    params.per_page = perPageInt;
  }
  return this.$reqGet(GET_QA_LIST_PATH_V2, { params })
    .then(data => data.data.result);
}

function updateRobotQAV2(info) {
  return this.$reqPost(`${QA_OPERATION_PATH_V2}/${info.id}`, info);
}

function getRobotSecret(enterprise, appid) {
  return this.$reqGet(`/auth/v3/enterprise/${enterprise}/app/${appid}/secret`).then(rsp => rsp.data.result);
}

function getEnterpriseWechatList() {
  return this.$reqGet(`${GET_ENT_WECHAT_LIST}/workweixin`).then((rsp) => {
    const resObj = rsp.data.result || {};
    let res = [];
    if (resObj.corpid || resObj.agentid || resObj.secret) {
      res = [resObj];
    }
    return res;
  });
}

function bindEnterpriseWechat(corpid, agentid, secret) {
  const params = {
    corpid,
    agentid,
    secret,
  };
  // qs.stringify(params)
  return this.$reqPost(`${BIND_ENT_WECHAT}/workweixin`, params).then(rsp => rsp.data.result);
}

function unBindEnterpriseWechat() {
  return this.$reqDelete(`${UNBIND_ENT_WECHAT}/workweixin`);
}

function bindWechatOffcialAccount(appId) {
  window.open(`http://botx3.applinzi.com/main?appid=${appId}`);
}

function checkIntegrationGuide() {
  window.open('/Files/wxwork_user_reference.pdf');
}

export default {
  getFunctionsStatus,
  setFunctionStatus,
  setFunctionInfos,

  getFunctionsStatusV2,
  setFunctionStatusV2,
  setFunctionInfosV2,

  getRobotQAList,
  rebuildRobotQAModel,
  updateRobotQA,

  getRobotQAListV2,
  updateRobotQAV2,

  getRobotSecret,

  getEnterpriseWechatList,
  bindEnterpriseWechat,
  unBindEnterpriseWechat,
  bindWechatOffcialAccount,
  checkIntegrationGuide,
};
