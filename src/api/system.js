const VERSION_URL = '/api/v1/ui/versions';
const ENV_PATH = '/api/v1/ui/envs';
const CAPTCHA_PATH = '/auth/v1/captcha';
const LOGO_PATH = '/api/v1/ui/logo';
const UI_MODULE_PATH = '/api/v1/ui/modules';

function getVersionInfo() {
  return this.$reqGet(VERSION_URL).then(rsp => rsp.data.result);
}
function getEnv() {
  return this.$reqGet(ENV_PATH).then(rsp => rsp.data.result);
}

function getCaptcha() {
  return this.$reqGet(CAPTCHA_PATH).then(rsp => rsp.data);
}

function getIconURL(iconType, enterprise) {
  return `${LOGO_PATH}?type=${iconType}${enterprise ? `&enterprise=${enterprise}` : ''}`;
}
function getIcon(iconType, enterprise) {
  return this.$reqGet(getIconURL(iconType, enterprise)).then(rsp => rsp.data);
}
function uploadIcon(iconType, enterprise, file) {
  const data = new FormData();
  data.append('file', file);
  data.append('type', iconType);
  data.append('enterprise', enterprise);

  return this.$reqPut(LOGO_PATH, data);
}
function deleteIcon(iconType, enterprise) {
  return this.$reqDelete(getIconURL(iconType, enterprise));
}

function getUIModule() {
  return this.$reqGet(UI_MODULE_PATH).then(rsp => rsp.data.result);
}

export default {
  getVersionInfo,
  getEnv,
  getCaptcha,

  getIconURL,
  getIcon,
  uploadIcon,
  deleteIcon,
  getUIModule,
};
