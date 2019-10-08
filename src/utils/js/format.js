function paddingNumToTwo(num) {
  return num >= 10 ? num.toString() : `0${num}`;
}

function datetimeToString(date) {
  const time = new Date(date);

  if (isNaN(time.getTime())) {
    return '';
  }

  const month = paddingNumToTwo(time.getMonth() + 1);
  const day = paddingNumToTwo(time.getDate());
  const hour = paddingNumToTwo(time.getHours());
  const min = paddingNumToTwo(time.getMinutes());
  const sec = paddingNumToTwo(time.getSeconds());

  return `${time.getFullYear()}/${month}/${day} ${hour}:${min}:${sec}`;
}

function dateToString(date) {
  const month = paddingNumToTwo(date.getMonth() + 1);
  const day = paddingNumToTwo(date.getDate());

  return `${date.getFullYear()}${month}${day}`;
}

function recongizeType(obj) {
  const classToType = {};
  'Boolean Number String Function Array Date RegExp Object Error'.split(' ').forEach((e) => {
    classToType[`[object ${e}]`] = e.toLowerCase();
  });

  if (obj === null) {
    return String(obj);
  }
  return typeof obj === 'object' || typeof obj === 'function' ?
    classToType[classToType.toString.call()] || 'object' :
    typeof obj;
}

export default {
  datetimeToString,
  dateToString,
  recongizeType,
};
