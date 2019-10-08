function padding(number, width, char = '0') {
  if (number && number.toString().length > width) {
    return number.toString();
  }

  let pad = char;
  let ret = number.toString();
  if (pad.length > 1) {
    pad = pad.toString()[0];
  }

  while (ret.length < width) {
    ret = `${pad}${ret}`;
  }
  return ret;
}

function isValidString(str) {
  if (str === undefined) {
    return false;
  }
  return typeof str === 'string' && str.trim().length > 0;
}

export default {
  padding,
  isValidString,
};
