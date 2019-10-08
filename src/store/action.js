import api from '@/api/system';
import * as types from '@/store/mutations_type';

export default {
  getEnv({ commit }, instance) {
    return api.getEnv.call(instance)
    .then((data) => {
      commit(types.SET_ENV, data);
    });
  },
  getUIModule({ commit }, instance) {
    return api.getUIModule.call(instance)
    .then((data) => {
      commit(types.SET_UI_MODULES, data);
    });
  },
};
