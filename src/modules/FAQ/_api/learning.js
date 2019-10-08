import moment from 'moment';

export default {
  queryCollections(type) {
    // query list of collections
    const url = `/api/v1/selfLearn/reports?type=${type}`;
    return this.$reqGet(url).then((response) => {
      /* response format will like
      [
        {
          "id": 0,
          "start_time": "2018-01-10T08:44:21.686Z",
          "end_time": "2018-01-10T08:44:21.686Z",
          "clusterSize": 0,
          "userQuestionSize": 0
        }
      ]
      we will transform format like this
      [{
        id: 0,
        title: ${start_time} ~ ${end_time}
        totalClusterSize: 0,
        totalRecordSize: 0,
      }]
      */
      const data = response.data;
      const transfromedData = [];
      data.forEach((collection) => {
        const startTime = new Date(collection.start_time);
        const endTme = new Date(collection.end_time);
        const startTimeStr = moment(startTime).format('YYYY-MM-DD HH:mm');
        const endTimeStr = moment(endTme).format('YYYY-MM-DD HH:mm');
        const title = `${startTimeStr} ~ ${endTimeStr}`;
        const transfromedCollection = {
          id: collection.id,
          title,
          totalClusterSize: collection.clusterSize,
          totalRecordSize: collection.userQuestionSize,
        };
        transfromedData.push(transfromedCollection);
      });
      return transfromedData;
    });
  },
  queryCollection(id) {
    // query collection by id
    /*
    [{
      "id": 0,
      "userQuestionSize": 0,
      "tags": [
        "string"
      ]
    }]
    =>
    [{
      "id": 0,
      "recordCount": 0,
      label: [
        "string"
      ]
    }]
    */
    const url = `/api/v1/selfLearn/reports/${id}/clusters`;
    return this.$reqGet(url).then((response) => {
      const data = response.data;
      const collections = [];
      data.forEach((collection) => {
        const transformedCollection = {
          id: collection.id,
          label: collection.tags,
          recordCount: collection.userQuestionSize,
        };
        collections.push(transformedCollection);
      });
      return collections;
    });
  },
  queryCluster(id) {
    // query cluster id
    console.log(id);
  },
  queryRecords(collectionId, clusterId, page, num) {
    const url = '/api/v1/selfLearn/userQuestions';
    const params = {
      reportID: collectionId,
      clusterID: clusterId,
      page,
      limit: num,
    };

    return this.$reqGet(url, { params }).then((response) => {
      const data = response.data;
      const records = [];
      data.forEach((record) => {
        const transformedRecord = {
          id: record.id,
          stdQuestion: record.std_question,
          content: record.question,
        };
        records.push(transformedRecord);
      });
      return records;
    });
  },
  resolveRecords(standardQ, records) {
    const url = '/api/v1/selfLearn/userQuestions';
    const body = {
      std_question: standardQ,
      feedbacks: records,
    };
    return this.$reqPost(url, body);
  },
  revokeRecord(record) {
    const url = `/api/v1/selfLearn/userQuestions/${record.id}/revoke`;
    return this.$reqPost(url);
  },
  queryRecommendForMe(records) {
    const url = '/api/v1/selfLearn/recommend';
    return this.$reqPost(url, records).then(response => response.data);
  },
};
