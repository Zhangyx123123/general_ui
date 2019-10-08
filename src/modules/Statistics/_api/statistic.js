const STATS_VISIT_URI = '/stats/visit';
const STATS_QUESTION_URI = '/stats/questions';
// const STATS_VISIT2_URI = '/stats/visit2';
// const STATS_QUESTION2_URI = '/stats/questions2';

const STATS_VISIT2_URI = '/api/v1/stats/visit';
const STATS_QUESTION2_URI = '/api/v1/stats/question';

const STATS_AUDIT_PATH = '/api/v1/statistic/audit';
// const STATS_RECORD_LIST = '/stats/record';

const STATS_RECORD_LIST = '/api/v1/stats/record';
const STATS_RECORD_EXPORT = '/api/v1/stats/record/export';

const STATS_DETAIL_RECORD_LIST = '/stats/detail_record';


const STATS_UNRESOLVE_PATH = '/api/v1/statistic/question';
const TAGS_PATH = '/api/v2/faq/tag-types';

const requestID = 'statistics';

function getFAQTagTypes() {
  return this.$reqGet(TAGS_PATH).then(rsp => rsp.data.result);
}

export default {
  getFAQTagTypes,
  // days: 1, 7, 30
  // type: 'time', 'barchart'
  getVisitStats2(params) {
    if (!params.days || !params.type ||
      ['time', 'barchart'].indexOf(params.type) === -1) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Parameter error'));
        }, 0);
      });
    }

    return this.$reqGet(STATS_VISIT2_URI, { params }, {
      // cancelToken: source.token,
      requestId: requestID,
      timeout: 3000,
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((data) => {
      const res = data.data;
      return res;
    });
  },
  getTopQuestions2(params) {
    if (!params.days || !params.type ||
      ['top', 'unused', 'unsolved'].indexOf(params.type) === -1) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Parameter error'));
        }, 0);
      });
    }

    return this.$reqGet(STATS_QUESTION2_URI, { params }, {
      // cancelToken: source.token,
      requestId: requestID,
      timeout: 3000,
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((data) => {
      const res = data.data;
      res.data = res.data.filter(d => d.question !== '');
      return res;
    });
  },
  getVisitStats(params) {
    if (!params.days || !params.type ||
      [1, 7, 30].indexOf(parseInt(params.days, 10)) === -1 ||
      ['time', 'barchart'].indexOf(params.type) === -1) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Parameter error'));
        }, 0);
      });
    }

    return this.$reqGet(STATS_VISIT_URI, { params }, {
      // cancelToken: source.token,
      requestId: requestID,
      timeout: 3000,
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((data) => {
      const res = data.data;
      return res;
    });
  },
  getTopQuestions(params) {
    if (!params.days || !params.type ||
      [1, 7, 30].indexOf(parseInt(params.days, 10)) === -1 ||
      ['top', 'unused'].indexOf(params.type) === -1) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Parameter error'));
        }, 0);
      });
    }

    return this.$reqGet(STATS_QUESTION_URI, { params }, {
      // cancelToken: source.token,
      requestId: requestID,
      timeout: 3000,
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((data) => {
      const res = data.data;
      return res;
    });
  },

  getRecords(searchParam, page, limit) {
    let queryUrl = `${STATS_RECORD_LIST}/query?page=${page}`;
    queryUrl = limit ? `${queryUrl}&limit=${limit}` : queryUrl;
    return this.$reqPost(queryUrl, searchParam)
    .then(response => response.data);
  },
  exportRecords(searchParam) {
    const queryUrl = `${STATS_RECORD_LIST}/download`;
    return this.$reqPost(queryUrl, searchParam)
    .then(response => response.data);
  },

  getContinueRecords(params) {
    return this.$reqGet(STATS_DETAIL_RECORD_LIST, { params });
  },

  getTopUnResolveQuestions(params) {
    if (!params.days || !params.type ||
      [1, 7, 30].indexOf(parseInt(params.days, 10)) === -1) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Parameter error'));
        }, 0);
      });
    }

    return this.$reqGet(STATS_UNRESOLVE_PATH, { params }, {
      // cancelToken: source.token,
      requestId: requestID,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 3000,
    }).then((data) => {
      const res = data.data.result;
      return res;
    });
  },

  getAuditLog(params) {
    return this.$reqPost(STATS_AUDIT_PATH, params);
  },

  getExportID(params) {
    return this.$reqPost(STATS_RECORD_EXPORT, params).then(rsp => rsp.data);
  },
  getExportStatus(id) {
    return this.$reqGet(`${STATS_RECORD_EXPORT}/${id}/status`).then(rsp => rsp.data);
  },
};
