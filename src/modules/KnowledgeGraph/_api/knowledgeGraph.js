const DOWNLOAD_PATH = '/api/v2/dictionary/download';
const NEW_PROPERTY_PATH = '/xeonKgDal';
const NEW_ENTITY_PATH = '/xeonKgDal';
const FILE_PATH = '/fs/file';

function getUploadFaliedInfo(robotId, fileName) {
  const param = new FormData();
  param.append('filename', fileName);
  return this.$reqPost(`${NEW_ENTITY_PATH}/${robotId}/file`, param, { responseType: 'arraybuffer' });
}

function getRootNodes(robotId) {
  return this.$reqGet(`${NEW_ENTITY_PATH}/${robotId}/rootEntity`);
}

function getChildNodes(robotId, rootNodeId) {
  return this.$reqGet(`${NEW_ENTITY_PATH}/${robotId}/upNode/${rootNodeId}?type=is_a-belongs_to`);
}

function getTestDetailInfo(taskId) {
  return this.$reqGet(`${NEW_ENTITY_PATH}/testverifyinfo/${taskId}`);
}

function getAllTestInfo(robotId) {
  return this.$reqGet(`${NEW_ENTITY_PATH}/${robotId}/testverifyinfo`);
}

function triggerKGTesting(robotId, taskId) {
  return this.$reqPost(`${NEW_ENTITY_PATH}/${robotId}/test/${taskId}`, {});
}

function getLastTestResultStatus(robotId, taskId) {
  console.log(taskId);
  return this.$reqGet(`${NEW_ENTITY_PATH}/test/${robotId}/${taskId}`);
}

function submitTestFile(file, robotId) {
  const param = new FormData();
  param.append('file', file);
  return this.$reqPost(`${NEW_ENTITY_PATH}/${robotId}/import/test_data`, param);
}

function initBuildKG(file, robotId) {
  const param = new FormData();
  param.append('file', file);
  return this.$reqPost(`${NEW_ENTITY_PATH}/${robotId}/import/all`, param);
}


function batchUploadEntities(file, robotId) {
  const param = new FormData();
  param.append('file', file);
  return this.$reqPost(`${NEW_ENTITY_PATH}/${robotId}/import/entity?`, param);
}

function batchUploadSpecialProperties(file, robotId) {
  const param = new FormData();
  param.append('file', file);
  return this.$reqPost(`${NEW_ENTITY_PATH}/${robotId}/import/functional_property?`, param);
}

function batchUploadProperties(file, robotId) {
  const param = new FormData();
  param.append('file', file);
  return this.$reqPost(`${NEW_ENTITY_PATH}/${robotId}/import/property?`, param);
}

// get properties by robotId
function getPropertiesOfRobot(robotId) {
  return this.$reqGet(`${NEW_PROPERTY_PATH}/${robotId}/property/all`);
}

function getPropertyById(robotId, propertyId) {
  return this.$reqGet(`${NEW_PROPERTY_PATH}/${robotId}/property/${propertyId}`);
}

function updateProperty(robotId, propertyId, data) {
  return this.$reqPut(`${NEW_PROPERTY_PATH}/${robotId}/property/${propertyId}`, data);
}

function createProperty(robotId, data) {
  return this.$reqPost(`${NEW_PROPERTY_PATH}/${robotId}/property`, data);
}


function getPropertiesOfEntity(robotId, propertyId) {
  return this.$reqGet(`${NEW_ENTITY_PATH}/${robotId}/property/${propertyId}`);
}

function getAllEntitiesByrobotId(robotId) {
  return this.$reqGet(`${NEW_ENTITY_PATH}/${robotId}/entity/all`);
}

function addEntityUnderRobot(robotId, param) {
  return this.$reqPost(`${NEW_ENTITY_PATH}/${robotId}/entity`, param);
}

function deleteEntityUnderRobot(robotId, entityId) {
  return this.$reqDelete(`${NEW_ENTITY_PATH}/${robotId}/entity/${entityId}`);
}

function updateEntityUnderRobot(robotId, entityId, param) {
  return this.$reqPut(`${NEW_ENTITY_PATH}/${robotId}/entity/${entityId}`, param);
}

function deletePropertyUnderRobot(robotId, propertyId) {
  return this.$reqDelete(`${NEW_PROPERTY_PATH}/${robotId}/property/${propertyId}`);
}

function getEntityByEntityId(robotId, entityId) {
  return this.$reqGet(`${NEW_ENTITY_PATH}/${robotId}/entity/${entityId}`);
}

function addSingleSpeechUnderEntity(robotId, param) {
  return this.$reqPost(`${NEW_ENTITY_PATH}/${robotId}/speech`, param);
}

function getV3Data(robotId) {
  return this.$reqGet(`${NEW_ENTITY_PATH}/${robotId}/visualizer`);
}

function triggerTraining(robotId) {
  return this.$reqGet(`${NEW_ENTITY_PATH}/${robotId}/ftTrainTrigger`);
}

function checkTrainingStatus(robotId, taskId) {
  return this.$reqGet(`${NEW_ENTITY_PATH}/${robotId}/ftTrainResult/${taskId}`);
}

function getPropertyTypes(robotId) {
  return this.$reqGet(`${NEW_PROPERTY_PATH}/${robotId}/type`);
}

function syncDataAfterTest(robotId) {
  return this.$reqGet(`/api/v1/kbqa/syncData?appid=${robotId}`);
}

function batchUploadTemplate() {
  return this.$reqGet(`${NEW_PROPERTY_PATH}/template/data`, { responseType: 'arraybuffer' });
}

function TestFileTemplate() {
  return this.$reqGet(`${NEW_PROPERTY_PATH}/template/test`, { responseType: 'arraybuffer' });
}

function AttachDocument(file, userId) {
  const param = new FormData();
  param.append('file', file);
  param.append('categoryId', 0);
  param.append('createBy', userId);
  param.append('type', 1);

  return this.$reqPost(`${FILE_PATH}/upload`, param);
}

function DeleteAttachDoc(fileId) {
  return this.$reqDelete(`${FILE_PATH}/${fileId}`);
}

function ExportKGFile(robotId) {
  return this.$reqGet(`${NEW_ENTITY_PATH}/${robotId}/export`);
}

function ExportByFileName(robotId, fileName) {
  const param = new FormData();
  param.append('filename', fileName);
  return this.$reqPost(`${NEW_ENTITY_PATH}/${robotId}/file`, param, { responseType: 'arraybuffer' });
}

function CheckSandbox(robotId) {
  return this.$reqGet(`${NEW_ENTITY_PATH}/${robotId}/checkSandboxModify`);
}

function SandboxSync(robotId) {
  return this.$reqPost(`${NEW_ENTITY_PATH}/${robotId}/synchronizeSandbox`, {});
}

function SandboxWithdraw(robotId) {
  return this.$reqPost(`${NEW_ENTITY_PATH}/${robotId}/withdrawSandbox`, {});
}

function UploadPicture(robotId, userId, file) {
  const param = new FormData();
  param.append('appid', robotId);
  param.append('userid', userId);
  param.append('filename', file);

  return this.$reqPost('/dal/upload', param);
}

export default {

  // KG Training related
  checkTrainingStatus,
  triggerTraining,
  syncDataAfterTest,
  getUploadFaliedInfo,

  // KG Entity Graph Layout
  getV3Data,

  // Entity Management
  addSingleSpeechUnderEntity,
  getEntityByEntityId,
  updateEntityUnderRobot,
  deleteEntityUnderRobot,
  addEntityUnderRobot,
  getAllEntitiesByrobotId,
  getRootNodes,
  getChildNodes,

  // Property Management
  deletePropertyUnderRobot,
  getPropertiesOfEntity,
  createProperty,
  updateProperty,
  getPropertyById,
  getPropertiesOfRobot,
  getPropertyTypes,

  // batch upload
  batchUploadSpecialProperties,
  batchUploadProperties,
  batchUploadEntities,
  initBuildKG,
  batchUploadTemplate,

  // test related
  submitTestFile,
  getLastTestResultStatus,
  triggerKGTesting,
  getAllTestInfo,
  getTestDetailInfo,
  TestFileTemplate,

  AttachDocument,
  DeleteAttachDoc,

  ExportKGFile,
  ExportByFileName,

  // sandBox related
  CheckSandbox,
  SandboxSync,
  SandboxWithdraw,

  UploadPicture,

  DOWNLOAD_PATH,
};
