import * as cookie from 'tiny-cookie'
import ErrorAlert from '../components/ErrorAlert';

export default {
  getAppId() {
    const robotDataJson = JSON.parse(cookie.getRaw('robotDataJson'));
    return robotDataJson.appid;
  },
  popErrorWindow(context, msg, err, width='30%', height='30%') {
    context.$root.$emit('showWindow', {
      component: ErrorAlert,
      data: {
        msg,
        info: err,
      },
      buttons: ['ok'],
      customPopContentStyle: {
        width: width,
        height: height,
      },
    });
  },
  getLocalDateTimeIsoString() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  },
};
