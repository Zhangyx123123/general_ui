const CHATS_INFO_PATH = '/api/v1/robot/chats';
const CHATS_DESC_PATH = '/api/v1/robot/chat-info';

function genReturnPromise(rsp) {
  return new Promise((resolve, reject) => {
    if (rsp.data.status === 0) {
      resolve(rsp.data.result);
    } else {
      reject(rsp.data.message);
    }
  });
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
};
