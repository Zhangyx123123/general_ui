import SelfLearnMarkPop from '../_components/SelfLearnMarkPop';
import SelfLearnMarkIntentPop from '../_components/SelfLearnMarkIntentPop';

function popSelfLearnMark(datarows) {
  // Datarows is an..
  //    object, when click mark button on general-table
  //    array, when click batch mark button
  // only send array to SelfLearnMarkPop
  const propData = Array.isArray(datarows) ? datarows : [datarows];
  const that = this;
  const options = {
    title: that.$t('statistics.mark.mark'),
    component: SelfLearnMarkPop,
    data: {
      qa: propData,
      markedQuestion: '', // receive marked question
    },
    callback: {
      ok: (data) => {
        const markedQuestion = data.markedQuestion;
        const record = propData.map(prop => prop.id);
        const tomark = markedQuestion !== '';
        that.setMark(markedQuestion, record, tomark);
      },
    },
    validate: true,
    cancelValidate: true,
  };
  that.$pop(options);
}

function popSelfLearnIntentMark(datarows) {
  // Datarows is an..
  //    object, when click mark button on general-table
  //    array, when click batch mark button
  // only send array to SelfLearnMarkPop
  const propData = Array.isArray(datarows) ? datarows : [datarows];
  const that = this;
  const options = {
    title: that.$t('statistics.mark.mark'),
    component: SelfLearnMarkIntentPop,
    data: {
      qa: propData,
      markedIntent: -1,
    },
    callback: {
      ok: (data) => {
        const markedIntent = data.markedIntent;
        const positive = data.positive;
        const record = propData.map(prop => prop.id);
        // console.log(markedIntent, positive, record, tomark);
        that.setIntentMark(markedIntent, positive, record);
      },
    },
    validate: true,
    cancelValidate: true,
  };
  that.$pop(options);
}

function doIgnore(datarows) {
  const that = this;
  const rows = Array.isArray(datarows) ? datarows : [datarows];
  const toIgnore = rows.map(r => r.id);
  that.setIgnore(toIgnore, true);
}

function doCancelIgnore(datarow) {
  const that = this;
  const toCancelIgnore = [datarow.id];
  that.setIgnore(toCancelIgnore, false);
}

function appendTableDataAction(datas) {
  // check status of marked and ignored, give different action
  const that = this;
  datas.forEach((data) => {
    data.stdq_mark = [{
      text: data.is_marked ? that.$t('statistics.mark.re_marked') : that.$t('statistics.mark.mark'),
      type: 'primary',
      onclick: that.popSelfLearnMark,
    }];
    data.intent_mark = [{
      text: data.marked_intent !== undefined ? that.$t('statistics.mark.re_marked') : that.$t('statistics.mark.mark'),
      type: 'primary',
      onclick: that.popSelfLearnIntentMark,
    }];
    data.action = [{
      text: data.is_ignored ? that.$t('statistics.ignore.cancel_ignore') : that.$t('statistics.ignore.ignore'),
      type: 'primary',
      onclick: data.is_ignored ? that.doCancelIgnore : that.doIgnore,
    }];
  });
  return datas;
}

function updateMarkedTableData(tableData, markedRecord, marked) {
  const that = this;
  tableData.forEach((data) => {
    if (markedRecord.indexOf(data.id) !== -1) {
      data.is_marked = marked;
    }
  });
  return that.appendTableDataAction(tableData);
}

function updateMarkedIntentTableData(tableData, markedRecord, markedIntent) {
  const that = this;
  tableData.forEach((data) => {
    if (markedRecord.indexOf(data.id) !== -1) {
      if (markedIntent === -1) {
        data.marked_intent = undefined;
      } else {
        data.marked_intent = markedIntent;
      }
    }
  });
  return that.appendTableDataAction(tableData);
}

function apiSetMark(tableData, markedQuestion, record, tomark) {
  const that = this;
  return that.$api.setMark(markedQuestion, record, tomark)
  .then((rsp) => {
    if (rsp.data.done.length > 0) {
      that.$notify({ text: that.$t('statistics.success.mark_ok') });
    }
    if (rsp.data.skip.length > 0) {
      that.$notifyWarn(that.$t('statistics.warning.mark_skip', { num: rsp.data.skip.length }));
    }

    return that.updateMarkedTableData(tableData, rsp.data.done, tomark);
  })
  .catch((err) => {
    const statusCode = err.response.status;
    if (statusCode === 409) { // some record is stdQ, cannot be marked
      const conflictRecord = err.response.data.conflicted_content;
      that.$notifyFail(that.$t('statistics.error.mark_conflict', { text: conflictRecord }));
    } else if (statusCode === 500) {
      const rollbacked = err.response.data.rollbacked;
      if (rollbacked) { // cancel all successed requests
        that.$notifyFail(that.$t('statistics.error.mark_fail'));
      } else { // request partly successed, need user reload
        that.$notifyFail(that.$t('statistics.error.system_error_reload'));
      }
    } else {
      that.$notifyFail(that.$t('statistics.error.mark_fail'));
    }

    return tableData;
  });
}

function apiSetIntentMark(tableData, markedIntent, positive, record) {
  const that = this;
  return that.$api.setIntentMark(markedIntent, positive, record)
  .then((rsp) => {
    if (rsp.data.done.length > 0) {
      that.$notify({ text: that.$t('statistics.success.mark_ok') });
    }
    if (rsp.data.skip.length > 0) {
      that.$notifyWarn(that.$t('statistics.warning.mark_skip', { num: rsp.data.skip.length }));
    }

    return that.updateMarkedIntentTableData(tableData, rsp.data.done, markedIntent);
  })
  .catch((err) => {
    const statusCode = err.response.status;
    if (statusCode === 409) { // some record is stdQ, cannot be marked
      const conflictRecord = err.response.data.conflicted_content;
      that.$notifyFail(that.$t('statistics.error.mark_conflict', { text: conflictRecord }));
    } else if (statusCode === 500) {
      const rollbacked = err.response.data.rollbacked;
      if (rollbacked) { // cancel all successed requests
        that.$notifyFail(that.$t('statistics.error.mark_fail'));
      } else { // request partly successed, need user reload
        that.$notifyFail(that.$t('statistics.error.system_error_reload'));
      }
    } else {
      that.$notifyFail(that.$t('statistics.error.mark_fail'));
    }

    return tableData;
  });
}

function updateIgnoredTableData(tableData, ignoredRecord, ignored) {
  const that = this;
  tableData.forEach((data) => {
    if (ignoredRecord.indexOf(data.id) !== -1) {
      data.is_ignored = ignored;
    }
  });
  return that.appendTableDataAction(tableData);
}

function apiSetIgnore(tableData, records, ignore) {
  const that = this;
  return that.$api.setIgnore(records, ignore)
  .then(() => {
    that.$notify({ text: that.$t('statistics.success.ignore_ok') });
    return that.updateIgnoredTableData(tableData, records, ignore);
  })
  .catch((err) => {
    const statusCode = err.response.status;
    if (statusCode === 500) {
      const rollbacked = err.response.data.rollbacked;
      if (rollbacked) { // cancel all successed requests
        that.$notifyFail(that.$t('statistics.error.ignore_fail'));
      } else { // request partly successed, need user reload
        that.$notifyFail(that.$t('statistics.error.system_error_reload'));
      }
    } else {
      that.$notifyFail(that.$t('statistics.error.ignore_fail'));
    }
    return tableData;
  });
}

export default {
  methods: {
    apiSetMark,
    apiSetIntentMark,
    popSelfLearnMark,
    popSelfLearnIntentMark,
    apiSetIgnore,
    appendTableDataAction,
    doIgnore,
    updateIgnoredTableData,
    doCancelIgnore,
    updateMarkedTableData,
    updateMarkedIntentTableData,
  },
};
