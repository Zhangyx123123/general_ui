const GET_HEALTH_REPORT = '/api/v1/lq_health/report';
const GET_SSM_DATA = '/api/v1/lq_health/report/sqlq';
const GET_SSM_COUNT = '/api/v1/lq_health/report/sqlq_count';
const GET_REPORT_STATUS = '/api/v1/lq_health/report/status';

function getHealthReport(appId) {
  return this.$reqGet(`${GET_HEALTH_REPORT}/${appId}`).then(rsp => rsp.data);
}

function generateHealthReport(appId, locale) {
  return this.$reqPost(`${GET_HEALTH_REPORT}/${appId}/${locale}`).then(rsp => rsp.data);
}

function getHealthReportStatus(appId) {
  return this.$reqGet(`${GET_REPORT_STATUS}/${appId}`).then(rsp => rsp.data);
}

function getSSMData(appId) {
  return this.$reqGet(`${GET_SSM_DATA}/${appId}`).then(rsp => rsp.data);
}

function getSSMCorpusTotalCount(appId) {
  return this.$reqGet(`${GET_SSM_COUNT}/${appId}`).then(rsp => rsp.data);
}

export default {
  getHealthReport,
  generateHealthReport,
  getHealthReportStatus,
  getSSMData,
  getSSMCorpusTotalCount,
};
