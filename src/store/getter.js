export const robotID = s => s.appid;
export const robotList = (s) => {
  const ret = [];
  Object.keys(s.robotList).forEach((key) => {
    ret.push({
      id: key,
      name: s.robotList[key].name || '',
      description: s.robotList[key].description || '',
    });
  });
  return ret;
};
export const robotName = (s) => {
  const appid = s.appid;
  localStorage.setItem('robotName', appid in s.robotList ? s.robotList[appid].name : '');
  return appid in s.robotList ? s.robotList[appid].name : '';
};

export const enterpriseID = s => s.enterpriseID;
export const enterpriseName = (s) => {
  const eID = s.enterpriseID;
  return eID in s.enterpriseList ? s.enterpriseList[eID].name : '';
};
export const enterpriseList = (s) => {
  const ret = [];
  Object.keys(s.enterpriseList).forEach((key) => {
    ret.push({
      enterpriseID: key,
      name: s.enterpriseList[key].name,
      description: s.enterpriseList[key].description || '',
    });
  });
  return ret;
};

export const privilegeList = s => s.privilegeList;
export const menuPages = (s) => {
  const env = s.env;
  const TDEEnable = !(env.ENABLE_TDE_MODULE === '0' || env.ENABLE_TDE_MODULE === 'false');
  if (!TDEEnable) {
    const indexOfTaskEngine = s.pageInfos.findIndex(menuPage => menuPage.name === 'task_engine.module_name');
    if (indexOfTaskEngine !== -1) {
      const newPageInfos = [...s.pageInfos];
      const newTaskEngineModule = {
        ...s.pageInfos[indexOfTaskEngine],
        pages: s.pageInfos[indexOfTaskEngine].pages.filter(page => page.path !== 'task-engine-scenario-v3'),
      };
      newPageInfos[indexOfTaskEngine] = newTaskEngineModule;
      return newPageInfos;
    }
  }
  return s.pageInfos;
};
export const privilegeMap = (s) => {
  const map = {};
  s.privilegeList.forEach((priv) => {
    map[priv.privilege_name] = priv;
  });
  return map;
};

export const userID = s => s.userID;
export const userRole = s => s.userRole;
export const userRoleMap = s => s.userRoleMap;
export const currentPage = s => s.curPage;
export const isChatOpen = s => s.chatTest;
export const userInfo = s => s.userInfo;

export const userPrivilege = (s) => {
  const privileges = {};
  s.userRole.forEach((role) => {
    const localPrivilege = role.privileges;
    const keys = Object.keys(localPrivilege);
    keys.forEach((key) => {
      let cmds = privileges[key];
      if (!cmds) {
        cmds = [];
        privileges[key] = cmds;
      }
      cmds.push(...localPrivilege[key].filter(cmd => cmds.indexOf(cmd) < 0));
    });
  });
  return privileges;
};

export const hasPrivilege = s => (mod, cmd) => {
  if (s.userInfo.type < 2) {
    return true;
  }
  const nowPriv = userPrivilege(s)[mod] || [];
  if (!nowPriv) {
    return false;
  }
  return nowPriv.indexOf(cmd) >= 0;
};

export const showUserInfoPage = s => s.showUserInfo;

export const showLanguage = (s) => {
  if (s.locale) {
    return s.locale;
  }

  let ret = localStorage.getItem('locale');
  if (!ret) {
    ret = 'zh-cn';
  }
  return ret;
};

export const environment = s => s.env;
export const UIModules = s => s.uiModules;
