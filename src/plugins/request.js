/*
request.js wrapped the axios library
It will do extra operations for all request
ex: add auth token, log request, etc.
After ajax finish, check error code automatically
*/
import qs from 'qs';
import axios from 'axios';

let appid = '';
let token = '';

function addCustomHeader(config) {
  let option = Object.assign({}, config);
  if (!config) {
    option = {};
  }
  // TODO: correct header should add here
  if (!option.headers) {
    option.headers = {};
  }
  option.headers['X-Appid'] = appid;
  option.headers['X-Locale'] = localStorage.getItem('locale');
  if (token !== '' && token !== undefined && token !== null) {
    option.headers.Authorization = `Bearer ${token}`;
  }
  option.headers.Access_token = this.$cookie.get('access_token');
  return option;
}

function handleUnAuthenticated() {
  this.$logout(true);
  const fullPath = this.$route.fullPath;
  window.location = `/login.html?invalid=1&redirect=${encodeURIComponent(fullPath)}`;
}

function checkAjaxError(context, error) {
  let status;
  if (error.response) {
    status = error.response.status;
  }

  if (status === 401) {
    handleUnAuthenticated.bind(context)();
  }

  // handle only 500 series status code in plugin
  // 400 series may has different meanings for different modules
  if (status >= 500) {
    context.$notify({
      text: `${context.$t('general.error_code')} ${status}`,
      type: 'fail',
    });
  }
  throw error;
}

function ajax(config) {
  const that = this;
  const getConfigWithCustomHeader = addCustomHeader.bind(that);
  const header = getConfigWithCustomHeader(config);
  let axiosInstance = axios.create();
  if (config.responseType === 'blob') {
    axiosInstance = axios.create({ responseType: 'blob' });
  }
  return axiosInstance(header).catch((err) => {
    checkAjaxError.bind(this)(that, err);
  });
}

function customType(url, type, data, config) {
  let option = Object.assign({}, config);
  if (!config) {
    option = {};
  }
  option.data = data;
  option.method = type;
  option.url = url;
  return this.$reqAjax(option);
}

function get(url, config) {
  let option = Object.assign({}, config);
  if (!config) {
    option = {};
  }
  option.method = 'get';
  option.url = url;
  return this.$reqAjax(option);
}

function getBlob(url, config) {
  let option = Object.assign({}, config);
  if (!config) {
    option = {};
  }
  option.method = 'get';
  option.url = url;
  option.responseType = 'blob';
  return this.$reqAjax(option);
}

function put(url, data, config) {
  return this.$reqCustom(url, 'put', data, config);
}

function post(url, data, config) {
  return this.$reqCustom(url, 'post', data, config);
}

function postForm(url, data, config) {
  const localConfig = { ...config };
  if (localConfig.headers === undefined) {
    localConfig.headers = {};
  }
  localConfig.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  const localData = qs.stringify(data);
  return this.$reqCustom(url, 'post', localData, localConfig);
}

function putForm(url, data, config) {
  const localConfig = { ...config };
  if (localConfig.headers === undefined) {
    localConfig.headers = {};
  }
  localConfig.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  const localData = qs.stringify(data);
  return this.$reqCustom(url, 'put', localData, localConfig);
}

function patch(url, data, config) {
  return this.$reqCustom(url, 'patch', data, config);
}

function patchForm(url, data, config) {
  const localConfig = { ...config };
  if (localConfig.headers === undefined) {
    localConfig.headers = {};
  }
  localConfig.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  const localData = qs.stringify(data);
  return this.$reqCustom(url, 'patch', localData, localConfig);
}

function deleteReq(url, config) {
  return this.$reqCustom(url, 'delete', {}, config);
}

const MyPlugin = {
  install(Vue) {
    Vue.prototype.$reqGet = get;
    Vue.prototype.$reqGetBlob = getBlob;
    Vue.prototype.$reqCustom = customType;
    Vue.prototype.$reqPost = post;
    Vue.prototype.$reqPostForm = postForm;
    Vue.prototype.$reqPut = put;
    Vue.prototype.$reqPutForm = putForm;
    Vue.prototype.$reqDelete = deleteReq;
    Vue.prototype.$reqPatch = patch;
    Vue.prototype.$reqPatchForm = patchForm;
    Vue.prototype.$reqAjax = ajax;

    Vue.prototype.$setReqToken = function setUpToken(t) {
      token = t;
    };
    Vue.prototype.$setReqAppid = function setupRobot(id) {
      appid = id;
    };
  },
};

export default MyPlugin;
