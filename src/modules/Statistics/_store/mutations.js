import * as types from './mutations_type';
import DAILY_VIEW from '../_data/dailyView';

export const state = {
  daily: {
    currentView: DAILY_VIEW.DAILY,
    searchInfo: undefined,
    clusterReport: undefined,
    searchParams: undefined,
  },
};

export const mutations = {
  [types.SET_DAILY_CURRENT_VIEW]: (_, view) => {
    state.daily.currentView = view;
  },
  [types.SET_DAILY_SEARCH_INFO]: (_, info) => {
    state.daily.searchInfo = info;
  },
  [types.SET_DAILY_CLUSTER_REPORT]: (_, report) => {
    state.daily.clusterReport = report;
  },
  [types.SET_DAILY_SEARCH_PARAMS]: (_, params) => {
    state.daily.searchParams = params;
  },
};
