import qs from 'qs';

const BF2_USER_URL = '/api/v1/bf/user';
const IM_USER_URL = '/im-admin/create';

// const V2_PREFIX = '/auth/v2';
const V3_PREFIX = '/auth/v3';

function getUsersURL(enterprise) {
  return `${V3_PREFIX}/enterprise/${enterprise}/users`;
}
function getUserURL(enterprise) {
  return `${V3_PREFIX}/enterprise/${enterprise}/user`;
}

function getEnterpriseUsers(enterprise) {
  const usersURL = getUsersURL(enterprise);
  return this.$reqGet(usersURL).then(rsp => rsp.data.result);
}
function getEnterpriseUser(enterprise, id) {
  const userURL = getUserURL(enterprise);
  return this.$reqGet(`${userURL}/${id}`).then(rsp => rsp.data.result);
}
function updateEnterpriseUser(enterprise, id, user) {
  const userURL = getUserURL(enterprise);
  return this.$reqPut(`${userURL}/${id}`, qs.stringify(user), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then((data) => {
    if (user.password && user.password !== '') {
      user.enterprise = enterprise;
      return this.$reqPut(`${BF2_USER_URL}/${id}`, qs.stringify(user), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    }
    return new Promise((r) => {
      r(data);
    });
  });
}
function addEnterpriseUser(enterprise, user, enableIM) {
  const userURL = getUserURL(enterprise);
  let userID = '';
  return this.$reqPost(userURL, qs.stringify(user), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then((rsp) => {
    if (enableIM) {
      this.$reqPost(IM_USER_URL, {
        username: user.username,
        ent_code: enterprise,
        display_name: user.username,
        user_type: 1,
      });
    }
    userID = rsp.data.result.id;
    user.id = userID;
    user.account = user.username;
    user.enterprise = enterprise;
    return this.$reqPost(BF2_USER_URL, qs.stringify(user), {
      'Content-Type': 'application/x-www-form-urlencoded',
    });
  });
}
function deleteEnterpriseUser(enterprise, id) {
  const userURL = getUserURL(enterprise);
  return this.$reqDelete(`${BF2_USER_URL}/${id}`)
    .then(() => this.$reqDelete(`${userURL}/${id}`))
    .then(rsp => rsp.data.result);
}
function updateBFUserRole(enterprise, id, roleID) {
  const options = {
    enterprise,
    role: roleID,
  };
  return this.$reqPut(`${BF2_USER_URL}/${id}/role`, qs.stringify(options), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

const BF2_CONFIG_URL = '/config/save';
function setBF2Locale(userid, locale) {
  return this.$reqPostForm(BF2_CONFIG_URL, {
    appId: '',
    name: 'lang',
    value: locale.replace('-', ''),
    userId: userid,
  });
}

export default {
  getEnterpriseUsers,
  getEnterpriseUser,
  updateEnterpriseUser,
  addEnterpriseUser,
  deleteEnterpriseUser,
  updateBFUserRole,
  setBF2Locale,
};
