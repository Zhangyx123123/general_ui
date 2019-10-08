import qs from 'qs';

const CHECK_PATH = '/api/v1/dictionary/full-check';
const META_PATH = '/api/v1/dictionary/download-meta';

const DOWNLOAD_PATH = '/api/v2/dictionary/download';

const WORDBANK_PATH = '/api/v3/dictionary/wordbank';
const WORDBANKS_PATH = '/api/v3/dictionary/wordbanks';
const WORDBANK_CATEGORY_PATH = '/api/v3/dictionary/class';
const UPLOAD_PATH = '/api/v3/dictionary/upload';

function deleteWordbank(id) {
  return this.$reqDelete(`${WORDBANK_PATH}/${id}`);
}

function deleteWordbankCategory(id) {
  return this.$reqDelete(`${WORDBANK_CATEGORY_PATH}/${id}`);
}

function updateCategory(cid, name) {
  const param = {
    name,
  };
  return this.$reqPut(`${WORDBANK_CATEGORY_PATH}/${cid}`, qs.stringify(param));
}

function updateWordbank(wordbank) {
  const param = {
    name: wordbank.name,
    answer: wordbank.answer,
    similar_words: wordbank.similar_words.join(','), // POST and PUT similar_words is defined as a string of similiar words separate by comma
  };
  return this.$reqPut(`${WORDBANK_PATH}/${wordbank.wid}`, qs.stringify(param))
  .then(rsp => rsp.data.result);
}

function moveToCategory(wid, cid) {
  const param = {
    cid,
  };
  return this.$reqPut(`${WORDBANK_PATH}/${wid}/move`, qs.stringify(param));
}

function addCategory(pid, name, layer) {
  const param = {
    pid,
    name,
  };
  return this.$reqPost(`${WORDBANK_CATEGORY_PATH}`, qs.stringify(param))
    .then((rsp) => {
      const category = rsp.data.result;
      category.children = []; // avoid api give null value
      category.wordbanks = []; // avoid api give null value
      category.deletable = true;
      category.layer = layer;
      category.showChild = false;
      category.isActive = true;
      if (layer === 1) {
        category.visible = true;
      }
      return category;
    });
}

function addWordbank(cid, wordbank) {
  const param = {
    cid,
    name: wordbank.name,
    answer: wordbank.answer,
    similar_words: wordbank.similar_words.join(','), // POST and PUT similar_words is defined as a string of similiar words separate by comma
  };
  return this.$reqPost(`${WORDBANK_PATH}`, qs.stringify(param))
    .then(rsp => rsp.data.result);
}

// 1. by GET method, children and wordbanks attribute should always be array
// However, API may sometimes return null
// Therefore we use this function to convert wrong data types
// 2. add attributes 'layer', 'showChild', 'isActive' for displaying category-tree
// 3. add attribute 'visible' to layer 1 for displaying category-tree search result
let layer = 0;
function convertData(wordbank) {
  wordbank.layer = layer;
  wordbank.showChild = false;
  wordbank.isActive = false;
  if (wordbank.layer === 1) {
    wordbank.visible = true;
  }
  if (wordbank.similar_words === null) {
    wordbank.similar_words = [];
  }
  if (wordbank.children === null) {
    wordbank.children = [];
  }
  if (wordbank.children && wordbank.children.length > 0) {
    layer += 1;
    wordbank.children.forEach((child) => {
      convertData(child);
    });
    layer -= 1;
  }
}

// If a wordbank or a category is not editable, it's parent categories should not allow deleting
// Therefore we use this function to traverse the wordbank tree
// And add childEditable key
function parseEditable(wordbank) {
  let deletable = true;
  if (wordbank.children && wordbank.children.length > 0) {
    wordbank.children.forEach((child) => {
      deletable = parseEditable(child) === false ? false : deletable;
    });
  }
  if (wordbank.wordbanks && wordbank.wordbanks) {
    wordbank.wordbanks.forEach((word) => {
      deletable = (word.editable === false) ? false : deletable;
    });
  }
  deletable = (wordbank.editable === false) ? false : deletable;
  wordbank.deletable = deletable;
  return deletable;
}

// Wordbank should always have 'all' and 'uncategorized' categories
// Therefore we use this function to add all wordbanks to 'all'
// and add all wordbanks in root to 'uncategorized'
let allWordbanks = [];
function parseWordbank(wordbank) {
  if (wordbank.layer === 0) {
    // uncategoried
    wordbank.children.splice(0, 0, {
      name: window.vm.$t('wordbank.no_category'),
      deletable: false,
      editable: false,
      isActive: false,
      layer: 1,
      children: [],
      wordbanks: wordbank.wordbanks,
      cid: -2,
      visible: true,
    });

    // all
    wordbank.children.splice(0, 0, {
      name: window.vm.$t('wordbank.all'),
      deletable: false,
      editable: false,
      isActive: false,
      layer: 1,
      children: [],
      cid: -3,
      visible: true,
    });
  }
  if (wordbank.layer > 0) {
    if (wordbank.wordbanks && wordbank.wordbanks.length > 0) {
      allWordbanks = allWordbanks.concat(wordbank.wordbanks);
    }
  }
  if (wordbank.children && wordbank.children.length > 0) {
    wordbank.children.forEach((child) => {
      parseWordbank(child);
    });
  }

  if (wordbank.layer === 0) {
    wordbank.children[0].wordbanks = allWordbanks;
  }
}

function getWordbank(id) {
  return this.$reqGet(`${WORDBANK_PATH}/${id}`)
    .then(rsp => rsp.data.result);
}

function getCategory(id) {
  return this.$reqGet(`${WORDBANK_CATEGORY_PATH}/${id}`)
    .then(rsp => rsp.data.result);
}

function getWordbanks() {
  return this.$reqGet(`${WORDBANKS_PATH}`)
  .then((rsp) => {
    const wordbanks = rsp.data.result;
    layer = 0;  // for convertData
    convertData(wordbanks);
    parseEditable(wordbanks);

    allWordbanks = [];
    parseWordbank(wordbanks);
    return wordbanks;
  });
}

// function getDefaultSensitiveAnswer() {
//   return this.$reqGet(`${CHATS_INFO_PATH}/12`).then(res => res.data.result.contents);
// }

function uploadFile(file) {
  if (!file) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject('Empty file');
      }, 0);
    });
  } else if (file.size <= 0 || file.size > 2 * 1024 * 1024) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject('File size need more than 0, less than 2MB');
      }, 0);
    });
  }

  const data = new FormData();
  data.append('file', file);

  return this.$reqPost(UPLOAD_PATH, data);
}

// word_bank_check.php
function getLastResult() {
  return this.$reqGet(CHECK_PATH);
}
// word_bank_down.php
function getDownloadMeta() {
  return this.$reqGet(META_PATH);
}

export default {
  addWordbank,
  addCategory,
  getWordbank,
  getWordbanks,
  getCategory,
  uploadFile,
  updateWordbank,
  updateCategory,
  deleteWordbank,
  deleteWordbankCategory,
  moveToCategory,

  getLastResult,
  getDownloadMeta,

  DOWNLOAD_PATH,
};
