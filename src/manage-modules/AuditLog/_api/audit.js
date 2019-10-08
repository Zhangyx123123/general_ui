const auditRobotURL = '/api/v2/statistic/audit/robot';
const auditEnterpriseURL = '/api/v2/statistic/audit/enterprise';
const auditSystemURL = '/api/v2/statistic/audit/system';
const fullEnterpriseURL = '/auth/v3/enterpriselist';

// function parseTableHeader(header) {
//   const parsedHeader = header.map(h => ({
//     key: h.id,
//     text: h.text,
//   }));
//   return parsedHeader;
// }

function getRobotAuditLog(params) {
  const URL = auditRobotURL;
  console.log({ URL, params });
  return this.$reqPost(URL, params).then((response) => {
    console.log(response.data.result);
    return response.data.result;
  });
}
function exportRobotAuditLog(params) {
  const URL = `${auditRobotURL}/export`;
  console.log({ URL });
  return this.$reqPost(URL, params).then(response => response.data);
}
function getEnterpriseAuditLog(params) {
  const URL = auditEnterpriseURL;
  return this.$reqPost(URL, params).then(response => response.data.result);
}
function exportEnterpriseAuditLog(params) {
  const URL = `${auditEnterpriseURL}/export`;
  console.log({ URL });
  return this.$reqPost(URL, params).then(response => response.data);
}
function getSystemAuditLog(params) {
  const URL = auditSystemURL;
  console.log({ URL });
  return this.$reqPost(URL, params).then(response => response.data.result);
}
function exportSystemAuditLog(params) {
  const URL = `${auditSystemURL}/export`;
  console.log({ URL });
  return this.$reqPost(URL, params).then(response => response.data);
}

function getFullEnterpriseList() {
  const URL = fullEnterpriseURL;
  return this.$reqGet(URL).then(response => response.data.result);

  // const mockData = [{
  //   enterprise_id: '1234567',
  //   enterprise_name: '企業一號',
  //   robot_list: [
  //     {
  //       robot_id: 'robot001',
  //       robot_name: '機器人一號',
  //     },
  //     {
  //       robot_id: 'robot001',
  //       robot_name: '機器人二號',
  //     },
  //   ],
  // }, {
  //   enterprise_id: '7654321',
  //   enterprise_name: '企業二號',
  //   robot_list: [
  //     {
  //       robot_id: 'robot003',
  //       robot_name: '機器人三號',
  //     },
  //     {
  //       robot_id: 'robot004',
  //       robot_name: '機器人四號',
  //     },
  //   ],
  // }];
  // return Promise.resolve(mockData);
}

export default {
  getRobotAuditLog,
  exportRobotAuditLog,
  getEnterpriseAuditLog,
  exportEnterpriseAuditLog,
  getSystemAuditLog,
  exportSystemAuditLog,
  getFullEnterpriseList,
};
