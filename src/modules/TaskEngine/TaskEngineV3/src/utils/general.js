// import * as cookie from 'tiny-cookie';
// import ErrorAlert from '../components/ErrorAlert';


export default {
  getAppId() {
    // const robotDataJson = JSON.parse(cookie.getRaw('robotDataJson'));
    // return robotDataJson.appid;
  },
  popErrorWindow(context, msg, err) {
    context.$root.$popError(msg, err);
  },
  // popErrorWindow(context, msg, err, width = '30%', height = '30%') {
  //   context.$root.$emit('showWindow', {
  //     component: ErrorAlert,
  //     data: {
  //       msg,
  //       info: err,
  //     },
  //     buttons: ['ok'],
  //     customPopContentStyle: {
  //       width,
  //       height,
  //     },
  //   });
  // },
  getLocalDateTimeIsoString() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  },
  composePath(childPath) {
    const PAGE_PATH = '/task-engine-scenario-v3';
    return `${PAGE_PATH}/${childPath}`;
  },
};
