export const intentTrain = {
  name: 'intentTrain',
  namespaced: true,
  state: {
    intentList: [],
    isTraining: false,
  },
  getters: {
    hasIntents(s) {
      return s.intentList.length > 0;
    },
  },
  mutations: {
    setIsTraining(s, isTraining) {
      s.isTraining = isTraining;
    },
    setIntentList(s, intentList) {
      s.intentList = intentList;
    },
  },
};
export const intentTest = {
  name: 'intentTest',
  namespaced: true,
  state: {
    allIntents: [],
    intentList: [],
    corpusGroupsWithoutIntent: [],
    searchIntentMode: false,
    isTesting: false,
    lastPath: '',
  },
  getters: {
    corpusCounts: (s) => {
      if (!s.searchIntentMode) {
        let count = s.corpusGroupsWithoutIntent.reduce(
          (acc, intent) => acc + intent.sentences_count, 0,
        );
        count += s.intentList.reduce(
          (acc, intent) => acc + intent.sentences_count, 0,
        );
        return count;
      }
      return 0;
    },
    hasEmptyCorpus: (s) => {
      let hasEmptyCorpus = false;
      for (let i = 0; i < s.intentList.length; i += 1) {
        const intent = s.intentList[i];
        if (intent.sentences_count === 0) {
          hasEmptyCorpus = true;
          break;
        }
      }
      return hasEmptyCorpus;
    },
  },
  mutations: {
    setIsTesting(s, isTesting) {
      s.isTesting = isTesting;
    },
    setAllIntents(s, allIntents) {
      s.allIntents = allIntents;
    },
    setIntentList(s, intentList) {
      s.intentList = intentList;
    },
    setCorpusGroupsWithoutIntent(s, corpusGroups) {
      s.corpusGroupsWithoutIntent = corpusGroups;
    },
    setLastPath(s, path) {
      s.lastPath = path;
    },
  },
};
