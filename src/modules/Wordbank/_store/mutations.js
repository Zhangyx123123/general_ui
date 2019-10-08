import * as types from './mutations_type';

const CID_ALL = -3;

function resetActive(wordbank) {
  wordbank.isActive = false;
  if (wordbank.children && wordbank.children.length > 0) {
    wordbank.children.forEach((child) => {
      resetActive(child);
    });
  }
}
function setActive(wordbank, id) {
  if (wordbank.cid === id) {
    wordbank.isActive = true;
    return;
  }
  if (wordbank.children && wordbank.children.length > 0) {
    wordbank.children.forEach((child) => {
      setActive(child, id);
    });
  }
}
function getCategoryByCid(wordbank, cid) {
  if (wordbank.cid === cid) {
    return wordbank;
  }
  let category;
  if (wordbank.children && wordbank.children.length > 0) {
    wordbank.children.forEach((child) => {
      const newcategory = getCategoryByCid(child, cid);
      category = newcategory !== undefined ? newcategory : category;
    });
  }
  return category;
}

function findCategoryParent(wordbank, cid) {
  if (wordbank.children && wordbank.children.length > 0) {
    const targetIndex = wordbank.children.findIndex(child => child.cid === cid);
    if (targetIndex !== -1) {
      return wordbank;
    }
    let parent;
    wordbank.children.forEach((child) => {
      const newparent = findCategoryParent(child, cid);
      parent = (newparent === undefined) ? parent : newparent;
    });
    return parent;
  }
  return undefined;
}
function findWordbankParent(wordbank, wid) {
  if (wordbank.cid === CID_ALL) {  // Find parent other than 'ALL'
    return undefined;
  }
  if (wordbank.wordbanks && wordbank.wordbanks.length > 0) {
    const targetIndex = wordbank.wordbanks.findIndex(bank => bank.wid === wid);
    if (targetIndex !== -1) {
      return wordbank;
    }
  }
  if (wordbank.children && wordbank.children.length > 0) {
    let parent;
    wordbank.children.forEach((child) => {
      const newparent = findWordbankParent(child, wid);
      parent = (newparent === undefined) ? parent : newparent;
    });
    return parent;
  }
  return undefined;
}

function hasKeyword(wordbank, keyword) {
  if (wordbank.name.includes(keyword)) {
    return true;
  }
  let found = false;
  if (wordbank.children && wordbank.children.length > 0) {
    wordbank.children.forEach((child) => {
      const newfound = hasKeyword(child, keyword);
      found = (newfound === true) ? newfound : found;
    });
  }
  return found;
}

function setShowChild(wordbank, keyword) {
  let shouldOpen = false;
  if (wordbank.children && wordbank.children.length > 0) {
    wordbank.children.forEach((child) => {
      const shouldOpenForChild = setShowChild(child, keyword);
      shouldOpen = shouldOpen || shouldOpenForChild;
    });
  }
  wordbank.showChild = shouldOpen;
  return shouldOpen || wordbank.name.includes(keyword);
}

function closeAllChild(wordbank) {
  wordbank.showChild = false;
  if (wordbank.children && wordbank.children.length > 0) {
    wordbank.children.forEach((child) => {
      closeAllChild(child);
    });
  }
}

export const state = {
  wordbank: {},
  currentCategory: undefined,
  isEditMode: false,
  isFilterMode: false,
  isMoveToMode: false,
  allWordbanks: [],

  isActiveId: undefined,
  lastActiveState: undefined,
  lastActiveId: undefined,

  hasNewCategory: false,
};

export const mutations = {
  [types.SET_HAS_NEW_CATEGORY]: (_, bool) => {
    state.hasNewCategory = bool;
  },
  [types.SET_WORDBANK]: (_, wordbank) => {
    state.wordbank = wordbank;

    const categoryAll = state.wordbank.children.find(child => child.cid === CID_ALL);
    state.allWordbanks = categoryAll.wordbanks;
  },
  [types.SET_CURRENT_CATEGORY]: (_, category) => {
    state.isActiveId = category.cid;
    if (!state.isMoveToMode) {
      state.currentCategory = category;
      state.currentCategory.isActive = true;
    }
  },
  [types.RESET_ACTIVE_ID]: () => {
    state.isActiveId = undefined;
  },
  [types.RESET_ACTIVE_CATEGORY]: () => {
    resetActive(state.wordbank);
  },
  [types.CLOSE_ALL_CHILD]: () => {
    state.wordbank.children.forEach((child) => {
      closeAllChild(child);
    });
  },
  [types.STORE_LAST_CATEGORY_STATUS]: () => {
    state.lastActiveState = state.wordbank;
    state.lastActiveId = state.currentCategory.cid;
  },
  [types.RECOVER_LAST_ACTIVE_CATEGORY]: () => {
    state.wordbank = state.lastActiveState;
    setActive(state.wordbank, state.lastActiveId);
  },
  [types.TOGGLE_EDIT_MODE]: () => {
    state.isEditMode = !state.isEditMode;
    if (!state.isEditMode) {
      resetActive(state.wordbank);
      if (state.hasNewCategory) {
        state.hasNewCategory = false;
      }
      state.currentCategory = state.wordbank.children[0];
      state.currentCategory.isActive = true;
    }
  },
  [types.TOGGLE_MOVETO_MODE]: () => {
    state.isMoveToMode = !state.isMoveToMode;
  },
  [types.SET_FILTER_MODE]: (_, bool) => {
    state.isFilterMode = bool;
  },
  [types.FILTER_CATEGORY]: (_, keyword) => {
    if (keyword === '') {
      state.wordbank.children.forEach((child) => {
        child.visible = true;
      });
      state.wordbank.children.forEach((child) => {
        closeAllChild(child);
      });
    } else {
      state.wordbank.children.forEach((child) => {
        const foundKeyword = hasKeyword(child, keyword);
        if (!foundKeyword) {
          child.visible = false;
        }
      });
      state.wordbank.children.forEach((child) => {
        setShowChild(child, keyword);
      });
    }
  },
  [types.APPEND_TO_ROOT_CATEGORY]: (_, category) => {
    state.wordbank.children.push(category);
    const idx = state.wordbank.children.length - 1;
    state.currentCategory = state.wordbank.children[idx];
  },
  [types.APPEND_SUB_CATEGORY]: () => {
    const subCategory = {
      name: '',
      layer: state.currentCategory.layer + 1,
      cid: 0,
      editable: true,
      deletable: true,
      isActive: true,
      showChild: false,
      children: [],
      wordbanks: [],
    };
    state.currentCategory.children.splice(0, 0, subCategory);
    state.currentCategory.showChild = true;
  },
  [types.ADD_TO_CURRENT_CATEGORY]: (_, category) => {
    state.currentCategory.children.splice(0, 1);
    state.currentCategory.children.push(category);
    const idx = state.currentCategory.children.length - 1;
    state.currentCategory = state.currentCategory.children[idx];
  },
  [types.CANCEL_ADD_FROM_CURRENT_CATEGORY]: () => {
    state.currentCategory.children.splice(0, 1);
    state.currentCategory.isActive = true;
  },
  [types.REMOVE_CURRENT_CATEGORY]: (_, cid) => {
    const parent = findCategoryParent(state.wordbank, cid);
    const categoryIndex = parent.children.findIndex(child => child.cid === cid);
    parent.children.splice(categoryIndex, 1);
  },
  [types.UPDATE_WORDBANK_IN_CATEGORY]: (_, newbank) => {
    // Update 'ALL' Category
    const categoryAll = state.wordbank.children.find(child => child.cid === CID_ALL);
    const idxInAll = categoryAll.wordbanks.findIndex(bank => bank.wid === newbank.wid);
    categoryAll.wordbanks.splice(idxInAll, 1, newbank);

    // Update Category it belongs
    const categoryBelong = findWordbankParent(state.wordbank, newbank.wid);
    const idxInBelong = categoryBelong.wordbanks.findIndex(bank => bank.wid === newbank.wid);
    categoryBelong.wordbanks.splice(idxInBelong, 1, newbank);
  },
  [types.ADD_WORDBANK_TO_CATEGORY]: (_, { cid, newbank }) => {
    // Add To 'ALL' Category no matter what
    const categoryAll = state.wordbank.children.find(child => child.cid === CID_ALL);
    categoryAll.wordbanks.splice(0, 0, newbank);

    if (cid === CID_ALL) { // If Current is 'ALL', add to 'NO Categroy'
      const categoryNO = state.wordbank.children.find(child => child.cid === -2);
      categoryNO.wordbanks.splice(0, 0, newbank);
    } else if (cid !== CID_ALL) {  // Add To target category
      if (state.currentCategory.cid === cid) {
        state.currentCategory.wordbanks.splice(0, 0, newbank);
      } else {
        const categoryBelong = getCategoryByCid(state.wordbank, cid);
        categoryBelong.wordbanks.splice(0, 0, newbank);
      }
    }
  },
  [types.DELETE_WORDBANK_FROM_CATEGORY]: (_, wid) => {
    // Delete from 'ALL' Category
    const categoryAll = state.wordbank.children.find(child => child.cid === CID_ALL);
    const idxInAll = categoryAll.wordbanks.findIndex(bank => bank.wid === wid);
    categoryAll.wordbanks.splice(idxInAll, 1);

    // Delete from Category it belongs
    const categoryBelong = findWordbankParent(state.wordbank, wid);
    const idxInBelong = categoryBelong.wordbanks.findIndex(bank => bank.wid === wid);
    categoryBelong.wordbanks.splice(idxInBelong, 1);
  },
};
