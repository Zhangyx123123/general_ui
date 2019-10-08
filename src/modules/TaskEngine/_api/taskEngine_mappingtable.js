import axios from 'axios';
import config from '@/modules/TaskEngine/_utils/config';

const UPLOAD_PATH = '/php/api/ApiKey/mapping_table_upload.php';
const LIST_PATH = '/php/api/ApiKey/mapping_table_list.php';
const DEL_PATH = '/php/api/ApiKey/mapping_table_delete.php';
const DOWNLOAD_PATH = '/php/api/ApiKey/mapping_table_download.php';

export default {
  uploadMapping(appid, file) {
    if (!file) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject('Empty file');
        }, 0);
      });
    } else if (file.size <= 0 || file.size > config.MaximumFileSize) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject('File size need more than 0, less than 2MB');
        }, 0);
      });
    }

    const data = new FormData();
    data.append('appid', appid);
    data.append('mapping_table', file);

    return axios.post(UPLOAD_PATH, data);
  },
  getMappingList() {
    return axios.get(LIST_PATH);
  },
  getTemplateMappingList() {
    return axios.get(`${LIST_PATH}?user=templateadmin`);
  },
  deleteMappingList(tableName) {
    const params = new URLSearchParams();
    params.append('table_name', tableName);

    return axios.post(DEL_PATH, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  downloadMappingList(tableName, user) {
    if (user === 'templateadmin') {
      return axios.get(`${DOWNLOAD_PATH}?mapping_table_name=${tableName}&user=templateadmin`);
    }
    return axios.get(`${DOWNLOAD_PATH}?mapping_table_name=${tableName}`);
  },
};
