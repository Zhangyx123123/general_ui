import * as types from './mutations_type';

export const state = {
  appid: '',
  robotList: {},

  enterpriseID: '',
  enterpriseList: {},

  privilegeList: [],
  pageInfos: [],
  curPage: {},
  userID: '',
  userRole: [],
  userRoleMap: {},
  chatTest: false,
  userInfo: {},
  showUserInfo: false,
  locale: '',
  env: {
    IM_ENABLE: false,
    ENABLE_TDE_MODULE: false,
  },
  uiModules: [],
};

export const mutations = {
  [types.SET_PRIVILEGED_ENTERPRISES]: (s, enterpriseList) => {
    s.enterpriseList = {};
    enterpriseList.forEach((enterprise) => {
      s.enterpriseList[enterprise.id] = enterprise;
    });

    const keys = Object.keys(s.enterpriseList);
    // If only one enterprise, it is normal user or enterprise admin
    if (keys.length === 1 && s.userInfo.type >= 1) {
      s.enterpriseID = keys[0];
      window.localStorage.setItem('enterprise', s.enterpriseID);
      window.sessionStorage.setItem('enterprise', s.enterpriseID);
    }
  },
  [types.SET_ROBOT]: (s, appid) => {
    window.localStorage.setItem('appid', appid);
    window.sessionStorage.setItem('appid', appid);
    if (s.appid === appid) {
      return;
    }

    if (appid in s.robotList) {
      s.appid = appid;
    } else {
      s.appid = '';
    }
  },
  [types.SET_ROBOT_LIST]: (s, robotList) => {
    window.localStorage.setItem('robots', JSON.stringify(robotList));
    s.robotList = {};

    robotList.forEach((robot) => {
      s.robotList[robot.id] = robot;
    });

    if (Object.keys(s.robotList).indexOf(s.appid) < 0) {
      s.appid = '';
    }
  },
  [types.SET_ENTERPRISE]: (s, enterpriseID) => {
    window.localStorage.setItem('enterprise', enterpriseID);
    window.sessionStorage.setItem('enterprise', enterpriseID);
    if (s.enterpriseID === enterpriseID) {
      return;
    }

    if (enterpriseID in s.enterpriseList) {
      s.enterpriseID = enterpriseID;
    } else {
      s.enterpriseID = '';
    }
  },
  [types.SET_PRIVILEGE_LIST]: (s, privilegeList) => {
    s.privilegeList = privilegeList;
  },
  [types.SET_PAGES]: (s, pageInfos) => {
    s.pageInfos = pageInfos;
    s.pageInfos.forEach((info) => {
      const idx = info.pages.findIndex(p => p.path === s.curPage.path);
      if (idx >= 0) {
        info.expanded = true;
      } else {
        info.expanded = false;
      }
    });
  },
  [types.SET_USER]: (s, userID) => {
    s.userID = userID;
  },
  [types.SET_USER_ROLE]: (s, role) => {
    s.userRole = role;
  },
  [types.SET_USER_ROLE_MAP]: (s, roleMap) => {
    s.userRoleMap = roleMap;
  },
  [types.SET_CUR_PAGE]: (s, curPage) => {
    s.curPage = curPage;
    // current page may set before all page info is set
    s.pageInfos.forEach((info) => {
      const idx = info.pages.findIndex(p => p.path === curPage.path);
      if (idx >= 0) {
        info.expanded = true;
      } else {
        info.expanded = false;
      }
    });
  },
  [types.TOGGLE_PAGE_CATEGORY]: (s, name) => {
    const expandIdx = s.pageInfos.findIndex(page => page.name === name);
    if (expandIdx < 0) {
      return;
    }
    s.pageInfos[expandIdx].expanded = !s.pageInfos[expandIdx].expanded;
    if (s.pageInfos[expandIdx].expanded) {
      s.pageInfos.forEach((info, idx) => {
        if (idx !== expandIdx) {
          info.expanded = false;
        }
        if (info.pages.indexOf(s.curPage) >= 0) {
          info.expanded = true;
        }
      });
    }
  },
  [types.OPEN_CHAT_TEST]: (s) => {
    s.chatTest = true;
  },
  [types.CLOSE_CHAT_TEST]: (s) => {
    s.chatTest = false;
  },
  [types.SET_USER_INFO]: (s, info) => {
    s.userInfo = info;
  },
  [types.SHOW_USER_PREFERENCE]: (s) => {
    s.showUserInfo = true;
  },
  [types.HIDE_USER_PREFERENCE]: (s) => {
    s.showUserInfo = false;
  },
  [types.SET_LANGUAGE]: (s, language) => {
    s.locale = language;
    localStorage.setItem('locale', language);
  },
  [types.SET_ENV]: (s, env) => {
    s.env = env;
  },
  [types.SET_UI_MODULES]: (s, modules) => {
    s.uiModules = modules;
  },
};
