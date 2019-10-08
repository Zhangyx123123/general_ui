import moment from 'moment';

export default {
  timestampToDatetimeString(ts, format = 'YYYY-MM-DD HH:mm') {
    const date = new Date(ts * 1000);
    return moment(date).format(format);
  },
};
