const SESSIONS_URL = '/api/v1/stats/sessions/query';
const SESSIONS_EXPORT_URL = '/api/v1/stats/sessions/export';

const RECORDS_URL = '/api/v2/stats/records/query';

const DEFAULT_PAGE_START = 1;
const DEFAULT_PAGE_LIMIT = 20;

// getSessionList will get list of sessions
// page start from 0, default is 0
// limit default is 20
function getSessionList(page, limit, filters) {
  const params = JSON.parse(JSON.stringify(filters || {}));
  params.page = page || DEFAULT_PAGE_START;
  params.limit = limit || DEFAULT_PAGE_LIMIT;
  return this.$reqPost(SESSIONS_URL, params)
    .then(rsp => rsp.data)
    .then((data) => {
      data.table_header.forEach((header) => {
        header.key = header.id;
      });
      return data;
    });
}

function getSessionExportID(filters) {
  return this.$reqPost(SESSIONS_EXPORT_URL, filters || {}).then(rsp => rsp.data);
}

function getExportStatus(id) {
  return this.$reqGet(`${SESSIONS_EXPORT_URL}/${id}/status`).then(rsp => rsp.data);
}

function getRecordOfSession(sessionID) {
  const now = new Date();
  const params = {
    start_time: 0,
    end_time: parseInt(now.getTime() / 1000, 10),
    session_id: sessionID,
  };
  return this.$reqPost(RECORDS_URL, params).then(rsp => rsp.data);
}

export default {
  getSessionList,
  getSessionExportID,
  getExportStatus,
  getRecordOfSession,
};
