import qs from 'qs';

const SEPARATE_TOKEN = '#SEPARATE_TOKEN#';

function parseAnswerCommand(acmd) {
  let strCmd = '';
  switch (acmd) {
    case 'no-order':
      strCmd = '无指令';
      break;
    case 'order_track':
      strCmd = '物流信息查询';
      break;
    case 'order_info':
      strCmd = '订单信息查询';
      break;
    case 'scene_id':
      strCmd = '场景标识';
      break;
    case 'cash':
      strCmd = '提现';
      break;
    case 'order_cancel':
      strCmd = '取消订单';
      break;
    case 'apply_for_return':
      strCmd = '退货申请';
      break;
    case 'exchange_goods':
      strCmd = '换货申请';
      break;
    case 'vip_finance':
      strCmd = '唯品金融';
      break;
    case 'query_refund':
      strCmd = '查询退款';
      break;
    case 'shopping':
      strCmd = '购物';
      break;
    default:
      strCmd = '无指令';
      break;
  }
  return strCmd;
}

function parseTags(tagsArray) {
  let tags = '';
  let first = true;
  tagsArray.forEach((element) => {
    if (element !== '') {
      if (first) {
        first = false;
        tags = element;
      } else {
        tags += `,${element}`;
      }
    }
  });
  return tags;
}

function transformAnswers(answers) {
  const transformedAnswers = [];
  answers.forEach((element) => {
    const transformedAnswer = {};
    transformedAnswer.id = element.Answer_Id;
    transformedAnswer.standard_a = element.Content_String;

    const dynamicMenu = element.DynamicMenu;
    transformedAnswer.dynamic_menu = (dynamicMenu) ? dynamicMenu.split(SEPARATE_TOKEN) : [];

    const relatedQuestion = element.RelatedQuestion;
    transformedAnswer.related_q = (relatedQuestion) ? relatedQuestion.split(SEPARATE_TOKEN) : [];
    transformedAnswer.not_show_in_relative_q = (element.Not_Show_In_Relative_Q === 1);
    transformedAnswer.start_time = element.Begin_Time;
    transformedAnswer.end_time = element.End_Time;
    transformedAnswer.tags = parseTags(element.dimension);
    transformedAnswer.label = element.label;

    const answerCommand = parseAnswerCommand(element.Answer_CMD);
    transformedAnswer.command = `指令:${answerCommand}`;
    transformedAnswer.Answer_CMD = element.Answer_CMD;
    transformedAnswer.Answer_CMD_Msg = element.Answer_CMD_Msg;
    if (element.Answer_CMD === 'shopping') {
      transformedAnswer.command += `[${element.Answer_CMD_Msg}]`;
    }
    transformedAnswers.push(transformedAnswer);
  });
  return transformedAnswers;
}

function transformQuestion(source) {
  const obj = {};
  obj.categoryID = (source.categoryId) ? source.categoryId : -1;
  obj.questionID = source.questionId;
  obj.standard_q = source.questionContent;
  obj.similar_count = source.sQuesCount;
  obj.categories = (source.categoryName) ? source.categoryName.split('/') : ['暂无分类'];

  // attach answers
  obj.answers = transformAnswers(source.answerItem);
  obj.originAnswers = source.answerItem;
  obj.originAnswers.forEach((answer) => {
    answer.id = answer.Answer_Id;
    answer.DynamicMenu = (answer.DynamicMenu) ? answer.DynamicMenu.split(SEPARATE_TOKEN) : [];
    const relatedQuestion = answer.RelatedQuestion;
    answer.RelatedQuestion = (relatedQuestion) ? relatedQuestion.split(SEPARATE_TOKEN) : [];
  });
  return obj;
}

function getDiemensionTypeId(type) {
  switch (type) {
    case 'platform':
      return 1;
    case 'brand':
      return 2;
    case 'sex':
      return 3;
    case 'age':
      return 4;
    case 'hobbies':
      return 5;
    default:
      return 0;
  }
}
let cachedQuestions = [];

function activeQA() {
  const url = '/php/api/ApiKey/vip_custom_question/vip_download.php';
  const options = {
    cmd: 'edit',
    appid: 'csbot',
  };
  const encodedOptions = qs.stringify(options);
  return this.$reqPost(url, encodedOptions);
}

export default {
  parseAnswerCommand,
  parseTags,
  transformAnswers,
  transformQuestion,
  getDiemensionTypeId,
  queryDimension() {
    const url = '/php/api/ApiKey/vip_custom_question/Tag_query.php';
    return this.$reqGet(url).then((response) => {
      const data = response.data;
      return data;
    });
  },
  queryQuestionDetail(options) {
    const url = '/php/api/ApiKey/vip_custom_question/custom_question.php?cmd=detail_query&table_prefix=csbot';
    const encodedOptions = qs.stringify(options);
    return this.$reqPost(url, encodedOptions).then((response) => {
      const data = response.data;
      return data;
    });
  },
  decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html.replace(/&quot;/g, '\\"');
    return txt.value;
  },
  getCategories() {
    const url = '/api/v1/faq/categories';
    return this.$reqGet(url).then((response) => {
      // unescape html code here, but should do it in api
      // const data = JSON.parse(this.decodeHtml(JSON.stringify(response.data)));
      const data = response.data;
      const sortChildren = (cat) => {
        if (cat.children) {
          cat.children.sort((a, b) => a.id > b.id);
          cat.children.forEach((child) => {
            sortChildren(child);
          });
        }
      };
      data.sort((a, b) => a.id > b.id);
      sortChildren(data);
      const tree = { children: data };
      return tree;
    }).catch((error) => {
      console.log(error);
    });
  },
  getContent(options) {
    // 1. request QAs from server
    const url = '/php/api/ApiKey/vip_custom_question/custom_question.php?cmd=query&table_prefix=csbot';
    const encodedOptions = qs.stringify(options);
    return this.$reqPost(url, encodedOptions).then((response) => {
      cachedQuestions = {
        content: [],
      };
      // transform data structure
      response.data.QueryResult.forEach((element) => {
        const transformedObj = transformQuestion(element);
        cachedQuestions.content.push(transformedObj);
      });
      cachedQuestions.totalNum = response.data.TotalQuestionNum;
      return cachedQuestions;
    });
  },
  filterQuestions(params) {
    const url = '/api/v1/faq/questions/filter';
    return this.$reqGet(url, { params }).then((response) => {
      cachedQuestions = {
        content: [],
      };
      // transform data structure
      response.data.QueryResult.forEach((element) => {
        const transformedObj = transformQuestion(element);
        cachedQuestions.content.push(transformedObj);
      });
      cachedQuestions.totalNum = response.data.TotalQuestionNum;
      return cachedQuestions;
    });
  },
  deleteCategory(params) {
    const url = `/api/v1/faq/category/${params.categoryid}`;
    return this.$reqDelete(url);
  },
  renameCategory(params) {
    const url = `/api/v1/faq/category/${params.categoryid}`;
    // params.cmd = 'update';
    // params.table_prefix = 'csbot';
    const encodedParams = qs.stringify(params);
    return this.$reqPost(url, encodedParams);
  },
  addCategory(params) {
    const url = '/api/v1/faq/category';
    const encodedParams = qs.stringify(params);
    return this.$reqPut(url, encodedParams).then(data => data.id);
  },
  deleteQuestion(options) {
    const url = '/php/api/ApiKey/vip_custom_question/custom_question.php?cmd=delete&table_prefix=csbot';
    const encodedOptions = qs.stringify(options);
    return this.$reqPost(url, encodedOptions);
  },
  deleteAnswer(options) {
    const url = '/php/api/ApiKey/vip_custom_question/custom_question.php?cmd=update&table_prefix=csbot';
    const encodedOptions = qs.stringify(options);
    return this.$reqPost(url, encodedOptions);
  },
  queryQAImportFileStatus() {
    const url = '/php/api/ApiKey/vip_custom_question/vip_download.php';
    const options = {
      cmd: 'download',
      appid: 'csbot',
    };
    const encodedOptions = qs.stringify(options);
    return this.$reqPost(url, encodedOptions).then((response) => {
      const data = response.data.data;
      return data;
    });
  },
  checkServerImportStatus() {
    const url = '/php/api/ApiKey/vip_custom_question/vip_download.php';
    const options = {
      cmd: 'check',
      appid: 'csbot',
    };
    const encodedOptions = qs.stringify(options);
    return this.$reqPost(url, encodedOptions).then((response) => {
      const data = response.data;
      return data;
    });
  },
  importFile(form) {
    const url = '/php/api/ApiKey/vip_custom_question/vip_upload.php';
    return this.$reqPost(url, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((response) => {
      const data = response.data;
      return data;
    });
  },
  createExportFile() {
    const url = '/php/api/ApiKey/vip_custom_question/vip_download.php';
    const options = {
      cmd: 'create',
      appid: 'csbot',
    };
    const encodedOptions = qs.stringify(options);
    return this.$reqPost(url, encodedOptions).then((response) => {
      const data = response.data;
      return data;
    });
  },
  querySimilarQuestions(options) {
    const url = '/php/api/ApiKey/vip_custom_question/custom_question.php?cmd=detail_similar_question&table_prefix=csbot';
    const encodedOptions = qs.stringify(options);
    return this.$reqPost(url, encodedOptions).then((response) => {
      const data = response.data;
      return data;
    });
  },
  addSimilarQuestion(options) {
    const url = '/php/api/ApiKey/vip_custom_question/custom_question.php?cmd=add_similar_question&table_prefix=csbot';
    const encodedOptions = qs.stringify(options);
    return this.$reqPost(url, encodedOptions).then((response) => {
      const data = response.data;
      return data;
    });
  },
  deleteSimilarQuestion(options) {
    const url = '/php/api/ApiKey/vip_custom_question/custom_question.php?cmd=delete_similar_question&table_prefix=csbot';
    const encodedOptions = qs.stringify(options);
    return this.$reqPost(url, encodedOptions).then((response) => {
      const data = response.data;
      return data;
    });
  },
  updateSimilarQuestion(options) {
    const url = '/php/api/ApiKey/vip_custom_question/custom_question.php?cmd=update_similar_question&table_prefix=csbot';
    const encodedOptions = qs.stringify(options);
    return this.$reqPost(url, encodedOptions);
  },
  updateQuestion(options) {
    const url = '/php/api/ApiKey/vip_custom_question/custom_question.php?cmd=update&table_prefix=csbot';
    const encodedOptions = qs.stringify(options);
    return this.$reqPost(url, encodedOptions);
  },
  createQuestion(options) {
    const url = '/php/api/ApiKey/vip_custom_question/custom_question.php?cmd=create&table_prefix=csbot';
    const encodedOptions = qs.stringify(options);
    return this.$reqPost(url, encodedOptions);
  },
  activeQA,
  addSimilarQuestions(qid, user, newSimilarQuestions) {
    const vueObj = this;
    const url = `/api/v1/faq/question/${qid}/similar-questions`;
    const body = {
      user,
      similarQuestions: newSimilarQuestions,
    };

    return this.$reqPost(url, body).then(() => activeQA.bind(vueObj)());
  },
  queryOperations(params) {
    const url = '/api/v1/qa/questions/operations';
    return this.$reqGet(url, { params }).then((response) => {
      const data = {
        records: [],
      };
      if (response.data.records && response.data.records.length > 0) {
        response.data.records.forEach((record) => {
          const transformedRecord = {
            stateId: record.state_id,
            action: record.action,
            createdTime: record.created_time,
            extraInfo: record.extra_info,
            status: record.status,
            updatedTime: record.updated_time,
            userId: record.user_id,
          };
          data.records.push(transformedRecord);
        });
      }
      return data;
    });
  },
  queryOperationProgress(id) {
    const url = `/api/v1/qa/questions/operations/${id}/progress`;
    return this.$reqGet(url).then((response) => {
      const data = {
        stateId: response.data.state_id,
        status: response.data.status,
        createdTime: response.data.created_time,
        extraInfo: response.data.extra_info,
      };
      return data;
    });
  },
  downloadFile(id) {
    const url = `/api/v1/qa/questions/operations/${id}/download`;
    window.open(url);
  },
  importQuestions(user, mode, file) {  // add user
    const url = '/api/v1/qa/questions/operations/import';
    const formData = new FormData();
    formData.append('user', user);
    formData.append('mode', mode);
    formData.append('file', file);

    return this.$reqPost(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((response) => {
      const data = {
        stateId: response.data.state_id,
        createdTime: 0,
      };
      return data;
    });
  },
  exportQuestions(filterOptions) {
    const url = '/api/v1/qa/questions/operations/export';
    const encodedOptions = qs.stringify(filterOptions);
    return this.$reqPost(url, encodedOptions).then((response) => {
      const data = {
        stateId: response.data.state_id,
        createdTime: response.data.created_time,
      };
      return data;
    });
  },
  querySingleQuestion(content) {
    const url = '/api/v1/faq/questions/search';
    const params = {
      content,
    };

    return this.$reqGet(url, { params }).then((response) => {
      const data = response.data;
      const transformedQuestion = {
        questionID: data.questionId,
      };
      return transformedQuestion;
    });
  },
};
