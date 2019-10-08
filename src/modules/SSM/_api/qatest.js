const QATEST_PATH = '/api/v1/qatest/chat-test';

export default {
  QATest(text, filter) {
    const params = {
      qtype: 'debug',
      top: 2,
      text,
    };

    Object.keys(filter).forEach((key) => {
      params[key] = filter[key];
    });

    return this.$reqPost(QATEST_PATH, params);
  },
};
