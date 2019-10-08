const MODULES_URL = '/auth/v3/modules';
const ADMINS_URL = '/auth/v3/admins';
const ADMIN_URL = '/auth/v3/admin';
const BF2_USER_URL = '/api/v1/bf/user';

function getModules() {
  return this.$reqGet(MODULES_URL).then(rsp => rsp.data.result);
}

function getAdmins() {
  return this.$reqGet(ADMINS_URL).then(rsp => rsp.data.result);
}

function getAdmin(id) {
  return this.$reqGet(`${ADMIN_URL}/${id}`).then(rsp => rsp.data.result);
}

function updateAdmin(id, user) {
  return this.$reqPutForm(`${ADMIN_URL}/${id}`, user)
  .then((data) => {
    if (user.password && user.password !== '') {
      return this.$reqPutForm(`${BF2_USER_URL}/${id}`, user);
    }
    return new Promise((r) => {
      r(data);
    });
  });
}

function deleteAdmin(id) {
  return this.$reqDelete(`${ADMIN_URL}/${id}`)
  .then(() => this.$reqDelete(`${BF2_USER_URL}/${id}`));
}

function addAdmin(user) {
  return this.$reqPostForm(`${ADMIN_URL}`, user)
  .then((rsp) => {
    const userID = rsp.data.result.id;
    user.id = userID;
    user.account = user.username;
    return this.$reqPostForm(BF2_USER_URL, user);
  });
}

export default {
  getModules,
  getAdmins,
  getAdmin,
  updateAdmin,
  addAdmin,
  deleteAdmin,
};
