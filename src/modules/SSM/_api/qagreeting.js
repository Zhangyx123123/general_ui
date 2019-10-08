const QAGREETING_PATH = '/api/v1/robot/chatQAList';

export default {
  loadQAGreeting(keyword, page, limit) {
    return this.$reqGet(`${QAGREETING_PATH}?keyword=${keyword}&curPage=${page}&pageLimit=${limit}`)
    .then(rsp => rsp.data.result);
  },
};
