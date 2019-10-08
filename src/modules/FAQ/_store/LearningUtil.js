export default {
  checkRecords(records) {
    records.forEach((record) => {
      record.resolved = false;
      if (record.stdQuestion && record.stdQuestion !== '') {
        record.resolved = true;
      }
    });
    return records;
  },
};
