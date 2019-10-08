const QATEST_PATH = '/api/v1/qatest/chat-test';

export default {
  QATest(text, filter, isonline) {
    const params = {
      qtype: 'debug',
      top: 2,
      text,
      info: filter,
      extend_data: {
        online: isonline,
      },
    };

    Object.keys(filter).forEach((key) => {
      params[key] = filter[key];
    });

    return this.$reqPost(QATEST_PATH, params);
  },
};
