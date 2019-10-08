import md5 from 'js-md5';
import qs from 'qs';
import 'babel-polyfill';
import constant from '@/utils/js/constant';

const LOGIN_PATH = '/auth/v3/login';
const ENTERPRISE_PATH = '/auth/v3/enterprise';
const ENTERPRISE_PATHV4 = '/auth/v4/enterprise';
const TOKEN_PATH = '/auth/v3/token';

const ENV_PATH = '/api/v1/ui/envs';

// const BF_LOGIN = '/BF_login';
const BF_TOKEN_PATH = '/api/v1/bf/access-token';

// function failPromise(msg) {
//   return new Promise((resolve, reject) => {
//     reject(msg);
//   });
// }
// function successPromise(msg) {
//   return new Promise((resolve) => {
//     resolve(msg);
//   });
// }

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonStr = window.atob(base64).replace(/(.)/g, (m, p) => {
    let code = p.charCodeAt(0).toString(16).toUpperCase();
    if (code.length < 2) {
      code = `0${code}`;
    }
    return `%${code}`;
  });
  return JSON.parse(decodeURIComponent(jsonStr));
}

function getRobots(userInfo) {
  const that = this;
  // enterprise admin
  if (userInfo.type === 1) {
    return that.$reqGet(`${ENTERPRISE_PATHV4}/${userInfo.enterprise}/apps`)
      .then(rsp => rsp.data.result);
  }
  // system admin
  if (userInfo.type === 0) {
    const currentEnterprise = window.localStorage.getItem('enterprise');
    if (currentEnterprise === '' || currentEnterprise === undefined) {
      return new Promise(r => r([]));
    }

    return that.$reqGet(`${ENTERPRISE_PATHV4}/${currentEnterprise}/apps`)
      .then(rsp => rsp.data.result);
  }
  const groups = userInfo.roles.groups;
  const apps = userInfo.roles.apps;
  let promise;

  const robots = [];
  robots.push(...apps);
  groups.forEach((group) => {
    if (promise) {
      promise = promise.then(() => that.$reqGet(`${ENTERPRISE_PATH}/${userInfo.enterprise}/group/${group.id}`));
    } else {
      promise = that.$reqGet(`${ENTERPRISE_PATH}/${userInfo.enterprise}/group/${group.id}`);
    }
    promise = promise.then((rsp) => {
      const data = rsp.data;
      if (data.result) {
        data.result.apps.forEach((app) => {
          app.role = group.role;
        });
        robots.push(...data.result.apps);
      }
    });
  });
  if (promise) {
    return promise.then(() => robots);
  }
  return new Promise(r => r(robots));
}

function setInfoWithToken(token) {
  const that = this;
  let useToken = token;
  let userInfo = {};
  let enterprise;
  let enterpriseInfos = [];
  let modules = [];
  const userRoleMap = {};
  let robots = [];

  that.$setReqToken(token);
  const promise = that.$reqGet(`${TOKEN_PATH}`)
  .then((response) => {
    if (window.localStorage.getItem('DEBUGGERMODE')) {
      debugger;
    }
    if (token === undefined || token === '' || token === null || token === 'null') {
      useToken = response.data.result;
      that.$setReqToken(useToken);
    }

    const jwt = parseJwt(useToken);
    userInfo = jwt.custom;
    enterprise = userInfo.enterprise;
    that.$cookie.set('userid', userInfo.id);

    if (userInfo.type === 0) {
      return that.$reqGet(`${ENTERPRISE_PATH}s`);
    }
    return that.$reqGet(`${ENTERPRISE_PATH}/${enterprise}`);
  })
  .then((rsp) => {
    const data = rsp.data;
    if (userInfo.type === 0) {
      enterpriseInfos = data.result;
    } else {
      enterpriseInfos = [data.result];
    }
  })
  .then(() => {
    if (userInfo.type !== 0) {
      return getRobots.bind(that)(userInfo)
      .then((result) => {
        robots = result;
        robots.forEach((robot) => {
          if (userRoleMap[robot.id] === undefined) {
            userRoleMap[robot.id] = [];
          }
          userRoleMap[robot.id].push(robot.role);
        });
      })
      .then(() => that.$reqGet(`${ENTERPRISE_PATH}/${enterprise}/modules`))
      .then((rsp) => {
        const data = rsp.data;
        modules = data.result.filter(mod => mod.status);
      });
    }
    return new Promise((r) => {
      r();
    });
  })
  .then(() => that.$reqGet(BF_TOKEN_PATH))
  .then((result) => {
    that.$cookie.set('access_token', result.data.result, { expires: constant.cookieTimeout });
  })
  .then(() => new Promise((r) => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    localStorage.setItem('token', token);
    localStorage.setItem('enterpriseInfo', JSON.stringify(enterpriseInfos));

    // belowing informations only used in specific enterprise
    localStorage.setItem('enterprise', enterprise);
    localStorage.setItem('modules', JSON.stringify(modules));
    localStorage.setItem('robots', JSON.stringify(robots));
    localStorage.setItem('roleMap', JSON.stringify(userRoleMap));
    r(userInfo);
  }));
  return promise;
}

function login(input) {
  const that = this;
  const params = {
    account: input.account,
    passwd: md5(input.password),
  };
  // let imUser = false;
  const retObj = {};
  that.$cookie.set('verify', md5(input.password), { expires: constant.cookieTimeout });

  let token;
  return that.$reqGet(ENV_PATH).then((envRsp) => {
    // let authTypes = ['all'];
    const res = envRsp.data;
    // if (res.result.AUTH_TYPE) {
    //   authTypes = res.result.AUTH_TYPE.split(',');
    // }

    if (res.result.USE_CAPTCHA) {
      params.captcha = input.captcha;
      params.captchaID = input.captchaID;
    }

    return that.$reqPost(LOGIN_PATH, qs.stringify(params), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then((rsp) => {
      const data = rsp.data;
      token = data.result.token;
      that.$setReqToken(token);
      that.$cookie.set('userid', data.result.info.id);

      localStorage.setItem('token', token);
      retObj.authV2 = data.result;
      // if (data.result.info.product && data.result.info.product.indexOf('IM') >= 0) {
      //   imUser = true;
      // }
      return data.result;
    })
    .then(() => retObj);
  });
}

function checkToken(token) {
  return this.$reqGet(`${TOKEN_PATH}/${token}`);
}

function checkPrivilege(moduleCode, cmd) {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const isAdmin = userInfo.type <= 1;

  if (isAdmin) {
    return true;
  }

  const roleInfo = JSON.parse(localStorage.getItem('role'));
  const privilege = roleInfo.privileges;

  if (Object.keys(privilege).indexOf(moduleCode) !== -1) {
    return privilege[moduleCode].indexOf(cmd) !== -1;
  }
  return false;
}

function clearAuth() {
  this.$cookie.delete('appid');
  this.$cookie.delete('userid');
  this.$cookie.delete('verify');
  this.$cookie.delete('access_token');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('token');
  localStorage.removeItem('enterpriseInfo');
  localStorage.removeItem('enterprise');
  localStorage.removeItem('modules');
  localStorage.removeItem('role');
}

function logout(backToLogin) {
  const that = this;
  clearAuth.bind(that)();
  return that.$reqGet(ENV_PATH).then((envRsp) => {
    if (backToLogin && envRsp.data.result.SSO_LOGIN_URL) {
      window.location = `${envRsp.data.result.SSO_LOGIN_URL}?redirect=${window.location}`;
    } else if (envRsp.data.result.SSO_LOGOUT_URL) {
      window.location = `${envRsp.data.result.SSO_LOGOUT_URL}?redirect=${window.location}`;
    } else {
      window.location = '/login.html';
    }
  });
}

function getToken() {
  return localStorage.getItem('token');
}

function getUserEnterprises() {
  try {
    return JSON.parse(localStorage.getItem('enterpriseInfo'));
  } catch (e) {
    logout(true);
    return {};
  }
}

function getPrivModules() {
  return JSON.parse(localStorage.getItem('modules'));
}

function getRobotsFromStorage() {
  return JSON.parse(localStorage.getItem('robots'));
}

function hasRight(cmd) {
  if (this.$options.privCode) {
    return this.$store.getters.hasPrivilege(this.$options.privCode, cmd);
  }
  return false;
}

const MyPlugin = {
  install(Vue) {
    Vue.prototype.$checkPrivilege = checkPrivilege;

    Vue.prototype.$login = login;
    Vue.prototype.$checkToken = checkToken;
    Vue.prototype.$getToken = getToken;
    Vue.prototype.$logout = logout;
    Vue.prototype.$setIntoWithToken = setInfoWithToken;
    Vue.prototype.$getUserEnterprises = getUserEnterprises;
    Vue.prototype.$getPrivModules = getPrivModules;
    Vue.prototype.$loadRobotOfUser = getRobots;
    Vue.prototype.$getRobots = getRobotsFromStorage;
    Vue.prototype.$hasRight = hasRight;
  },
};

export default MyPlugin;
