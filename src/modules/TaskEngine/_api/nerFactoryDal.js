import axios from 'axios';


const NER_PARSER_LIST_PATH = '/nerFactoryDal/customParserList';
const NER_PARSER_COUNT_PATH = '/nerFactoryDal/customParserUsedCount';


export default {
  getNerParserList(appId) {
    const data = {
      userId: appId,
      listType: 'released',
      // userId: 'custom',
      // listType: 'all',
    };
    return axios.post(NER_PARSER_LIST_PATH, data).then(resp => resp.data);
  },
  updateNerParserCount(appId, parserId) {
    const data = {
      userId: appId,
      // userId: 'custom',
      parserId,
      times: '1',
    };
    return axios.post(NER_PARSER_COUNT_PATH, data).then(resp => resp.data);
  },
  deleteNerParserCount(appId, parserId) {
    const data = {
      userId: appId,
      // userId: 'custom',
      parserId,
      times: '-1',
    };
    return axios.post(NER_PARSER_COUNT_PATH, data).then(resp => resp.data);
  },
  updateNerParsersCount(appId, parserId) {
    parserId.forEach((id) => {
      this.updateNerParserCount(appId, id);
    });
  },
  deleteNerParsersCount(appId, parserId) {
    parserId.forEach((id) => {
      this.deleteNerParserCount(appId, id);
    });
  },
};
