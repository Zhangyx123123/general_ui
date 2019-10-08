import qs from 'qs';

const CHATS_INFO_PATH = '/api/v1/robot/chats';
const CHATS_DESC_PATH = '/api/v1/robot/chat-info';

const CHATS_V2_PATH = '/api/v2/robot/chats';
const CHAT_V2_PATH = '/api/v2/robot/chat';

function genReturnPromise(rsp) {
  return new Promise((resolve, reject) => {
    if (rsp.data.status === 0) {
      resolve(rsp.data.result);
    } else {
      reject(rsp.data.message);
    }
  });
}

function getRobotChatPathV2(typeID) {
  return `${CHAT_V2_PATH}/${typeID}`;
}

function getRobotChatListV2() {
  return this.$reqGet(CHATS_V2_PATH).then(rsp => genReturnPromise(rsp));
}
function getRobotChatV2(typeID) {
  return this.$reqGet(getRobotChatPathV2(typeID)).then(rsp => genReturnPromise(rsp));
}
function addRobotChatContentV2(typeID, content) {
  const param = {
    content,
  };
  return this.$reqPost(`${getRobotChatPathV2(typeID)}/content`, qs.stringify(param), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(rsp => genReturnPromise(rsp));
}
function updateRobotChatContentV2(typeID, contentID, content) {
  const param = {
    content,
  };
  return this.$reqPut(`${getRobotChatPathV2(typeID)}/content/${contentID}`, qs.stringify(param), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(rsp => genReturnPromise(rsp));
}
function deleteRobotChatContentV2(typeID, contentID) {
  return this.$reqDelete(`${getRobotChatPathV2(typeID)}/content/${contentID}`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(rsp => genReturnPromise(rsp));
}

function getRobotChatList() {
  return this.$reqGet(CHATS_INFO_PATH).then(rsp => genReturnPromise(rsp));
}

function updateRobotChat(param) {
  return this.$reqPost(CHATS_INFO_PATH, param).then(rsp => rsp.data);
}

function getRobotChatDescription() {
  return this.$reqGet(CHATS_DESC_PATH).then(rsp => genReturnPromise(rsp));
}

export default {
  getRobotChatList,
  updateRobotChat,
  getRobotChatDescription,

  getRobotChatListV2,
  getRobotChatV2,
  addRobotChatContentV2,
  updateRobotChatContentV2,
  deleteRobotChatContentV2,
};
