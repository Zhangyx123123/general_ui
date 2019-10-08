const CONFIG_GET_URL = '/api/v1/robot/configs';
// SSM线下
const CONFIG_GET_URL_SSM = 'api/v1/robot/ssmconfig/get/ssm_config_rc/rc';
const CONFIG__SSM_SET = 'api/v1/robot/ssmconfig/set';
const CONFIG__SSM_UPDATE = 'api/v1/robot/ssmconfig/publish';
// SSM线上
const CONFIG_GET_URL_SSM_ON = 'api/v1/robot/ssmconfig/get/ssm_config_rc/gold';
const CONFIG_UPDATE_URL = '/api/v1/robot/config';
const IMPORT_CUSTOM_CHAT_QUESTION_URL = '/api/v1/customchat/import/question';
const IMPORT_CUSTOM_CHAT_EXTEND_URL = '/api/v1/customchat/import/extend';
const EXPORT_CUSTOM_CHAT_URL = '/api/v1/customchat/export/question';

function getConfigs() {
  return this.$reqGet(CONFIG_GET_URL).then(rsp => rsp.data.result);
}

function getConfigsSsm() {
  return this.$reqGet(CONFIG_GET_URL_SSM).then(rsp => rsp.data.result);
}
function setConfigsSsm(data) {
  return this.$reqPost(CONFIG__SSM_SET, data).then(rsp => rsp.data.result);
}
function updataConfigsSsm() {
  return this.$reqGet(CONFIG__SSM_UPDATE).then(rsp => rsp.data.result);
}
function getConfigsSsmOn() {
  return this.$reqGet(CONFIG_GET_URL_SSM_ON).then(rsp => rsp.data.result);
}

function setConfig(key, mod, value) {
  const params = {
    configName: key,
    module: mod,
    value,
  };
  return this.$reqPutForm(CONFIG_UPDATE_URL, params).then(rsp => rsp.data.result);
}

function importCustomChat(type, file) {
  const data = new FormData();
  let ret = '';
  data.append('file', file);
  if (type === 0) {
    ret = this.$reqPost(IMPORT_CUSTOM_CHAT_QUESTION_URL, data).then((res) => {
      this.$notify({ text: this.$t('error_msg.save_success') });
      console.log(res);
    })
      .catch((err) => {
        this.$notifyFail(err.response.data.message);
        console.log(err);
      });
  } else {
    ret = this.$reqPost(IMPORT_CUSTOM_CHAT_EXTEND_URL, data).then((res) => {
      this.$notify({ text: this.$t('error_msg.save_success') });
      console.log(res);
    })
      .catch((err) => {
        this.$notifyFail(err.response.data.message);
        console.log(err);
      });
  }
  return ret;
}

function exportCustomChat() {
  // let ret = '';
  // ret = this.$reqGet(EXPORT_CUSTOM_CHAT_URL).then(rsp => rsp.data.result);
  // return ret;
  const token = window.localStorage.getItem('token');
  window.open(`${EXPORT_CUSTOM_CHAT_URL}?token=Bearer%20${token}`);
}

export default {
  getConfigs,
  setConfig,
  importCustomChat,
  exportCustomChat,
  getConfigsSsm,
  getConfigsSsmOn,
  setConfigsSsm,
  updataConfigsSsm,
};
