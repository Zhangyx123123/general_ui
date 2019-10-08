function syncDateTime(obj) {
  obj.dateObj.setHours(parseInt(obj.timeObj.HH, 10));
  obj.dateObj.setMinutes(parseInt(obj.timeObj.mm, 10));
  obj.dateObj.setSeconds(parseInt(obj.timeObj.ss, 10));
}

function getTimestamp() {
  syncDateTime(this);
  return parseInt(this.dateObj.getTime() / 1000, 10);
}

export default {
  createDateObj(date) {
    return {
      dateObj: date || (new Date()),
      timeObj: {
        HH: '00',
        mm: '00',
        ss: '00',
      },
      getTimestamp,
    };
  },
  initTime(component) {
    const now = new Date();
    component.end.dateObj = new Date();
    component.start.dateObj = new Date();
    component.end.dateObj.setDate(now.getDate());
    component.start.dateObj.setDate(now.getDate() - 1);
    this.updateTimeObj(component);
  },
  updateTimeObj(component) {
    [component.end, component.start].forEach((obj) => {
      const hour = obj.dateObj.getHours();
      obj.timeObj.HH = hour >= 10 ? hour.toString() : `0${hour}`;

      const min = obj.dateObj.getMinutes();
      obj.timeObj.mm = min >= 10 ? min.toString() : `0${min}`;
    });
  },
  createForeverStartPickerObj() {
    return this.createPickerByTimeStr(this.FOREVER_START_TIME);
  },
  createForeverEndPicker() {
    return this.createPickerByTimeStr(this.FOREVER_END_TIME);
  },
  parseTimeStr(timeStr) {
    // format must like "YYYY-mm-dd HH:MM:SS"
    let args = [];
    const splitDate = timeStr.split(' ')[0].split('-');
    args = args.concat(splitDate);

    // month should be 0-based, so month should minus 1
    args[1] -= 1;

    const splitDatetime = timeStr.split(' ')[1].split(':');
    args = args.concat(splitDatetime);

    // set seconds to 0
    args[args.length - 1] = 0;
    return args;
  },
  createPickerByTimeStr(timeStr) {
    const dateArgs = this.parseTimeStr(timeStr);
    const picker = {
      dateObj: new Date(...dateArgs),
      timeObj: {
        HH: '00',
        mm: '00',
        ss: '00',
      },
    };
    picker.getTimestamp = getTimestamp.bind(picker);
    this.initTimeObj(picker);
    return picker;
  },
  createNowPicker() {
    const picker = {
      dateObj: new Date(),
      timeObj: {
        HH: '00',
        mm: '00',
        ss: '00',
      },
    };
    picker.getTimestamp = getTimestamp.bind(picker);
    this.initTimeObj(picker);
    return picker;
  },
  createYesterdayFromNowPicker() {
    const picker = this.createNowPicker();
    picker.dateObj.setDate(picker.dateObj.getDate() - 1);
    return picker;
  },
  initTimeObj(picker) {
    const hour = picker.dateObj.getHours();
    picker.timeObj.HH = hour >= 10 ? hour.toString() : `0${hour}`;

    const min = picker.dateObj.getMinutes();
    picker.timeObj.mm = min >= 10 ? min.toString() : `0${min}`;

    const sec = picker.dateObj.getSeconds();
    picker.timeObj.ss = sec >= 10 ? sec.toString() : `0${sec}`;
  },
  toTimeString(picker) {
    syncDateTime(picker);
    const dateObj = picker.dateObj;
    const timeStr = this.toTimeStingByDatetime(dateObj);

    return `${timeStr}:00`;
  },
  toTimeStingByDatetime(d) {
    const dateStr = this.toDateStringByDatetime(d);
    const hour = d.getHours() >= 10 ? `${d.getHours()}` : `0${d.getHours()}`;
    const minute = d.getMinutes() >= 10 ? `${d.getMinutes()}` : `0${d.getMinutes()}`;

    return `${dateStr} ${hour}:${minute}`;
  },
  toDateStringByDatetime(d) {
    const month = d.getMonth() + 1 >= 10 ? `${d.getMonth() + 1}` : `0${d.getMonth() + 1}`;
    const day = d.getDate() >= 10 ? `${d.getDate()}` : `0${d.getDate()}`;
    return `${d.getFullYear()}-${month}-${day}`;
  },
  FOREVER_START_TIME: '1970-01-01 00:00:00',
  FOREVER_END_TIME: '2999-12-31 23:59:00',
};
