import QAListUtil from './QAListUtil';
import LearningState from '../_data/learningState';
import LearningType from '../_data/learningType';

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  qaQueryOptions: QAListUtil.genDefaultQueryOptions(),
  qalist: {
    doQuery: false,
  },
  learning: {
    state: LearningState.COLLECTIONS,
    type: LearningType.UNMATCHED,
    selectedCollection: {
      id: undefined,
      title: '',
      clusters: [],
      totalRecords: 0,
    },
    selectedCluster: {
      id: undefined,
      label: [],
      records: [],
      totalRecords: 0,
    },
  },
  tagTypes: [],
};

// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  setQAQueryOptions(_, newOptions) {
    state.qaQueryOptions = Object.assign(state.qaQueryOptions, newOptions);
  },
  doQuery(_, toDqQuery) {
    state.qalist.doQuery = toDqQuery;
  },
  setSelectedCollection(_, collection) {
    state.learning.selectedCollection = collection;
  },
  setSelectedCluster(_, cluster) {
    state.learning.selectedCluster = cluster;
  },
  setLearningState(_, newState) {
    state.learning.state = newState;
  },
  setSelectedType(_, newType) {
    state.learning.type = newType;
  },
  resetLearning() {
    state.learning = {
      state: LearningState.COLLECTIONS,
      type: LearningType.UNMATCHED,
      selectedCollection: {
        id: undefined,
        title: '',
        clusters: [],
        totalRecords: 0,
      },
      selectedCluster: {
        id: undefined,
        label: [],
        records: [],
        totalRecords: 0,
      },
    };
  },
  setTagTypes(_, newTypes) {
    state.tagTypes = newTypes;
  },
};

// actions are functions that cause side effects and can involve
// asynchronous operations.
const actions = {
};

// getters are functions
const getters = {
  doQueryState: s => s.qalist.doQuery,
  searchCategoryID: s => s.qaQueryOptions.category_id,
  curPage: s => s.qaQueryOptions.cur_page,
  qaQueryOptions: s => s.qaQueryOptions,
  qaQueryDimension: s => s.qaQueryOptions.dimension,
  qaTagTypes: s => s.tagTypes,
  learningState: s => s.learning.state,
  learningType: s => s.learning.type,
  learningCollectionName: s => s.learning.selectedCollection.title,
  learningSelectedCollection: s => s.learning.selectedCollection,
  learningSelectedCluster: s => s.learning.selectedCluster,
};

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default {
  name: 'qalist',
  state,
  getters,
  actions,
  mutations,
};
