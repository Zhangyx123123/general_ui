export default {
  genDefaultQueryOptions() {
    return {
      dimension: [],
      timeset: false,
      begin_time: '',
      end_time: '',
      search_question: false,
      search_answer: false,
      search_dm: false,
      search_rq: false,
      key_word: '',
      not_show: false,
      category_id: 0,
      page_limit: 10,
      cur_page: 0,
      search_all: false,
    };
  },
};
