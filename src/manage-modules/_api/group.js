import qs from 'qs';

const baseURL = '/auth/v3/enterprise';

function getRobotGroups(enterpriseID) {
  return this.$reqGet(`${baseURL}/${enterpriseID}/groups`).then(rsp => rsp.data.result);
}

function getRobotGroup(enterpriseID, groupID) {
  return this.$reqGet(`${baseURL}/${enterpriseID}/group/${groupID}`).then(rsp => rsp.data.result);
}

function addRobotGroup(enterpriseID, group) {
  return this.$reqPost(`${baseURL}/${enterpriseID}/group`, qs.stringify(group), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(rsp => rsp.data);
}
function updateRobotGroup(enterpriseID, groupID, group) {
  return this.$reqPut(`${baseURL}/${enterpriseID}/group/${groupID}`, qs.stringify(group), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(rsp => rsp.data);
}

function deleteRobotGroup(enterpriseID, groupID) {
  return this.$reqDelete(`${baseURL}/${enterpriseID}/group/${groupID}`).then(rsp => rsp.data);
}

export default {
  getRobotGroups,
  getRobotGroup,
  addRobotGroup,
  updateRobotGroup,
  deleteRobotGroup,
};
