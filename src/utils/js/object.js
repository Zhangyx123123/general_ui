function jsonEqual(obj1, obj2) {
  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  if (obj1 === null && obj2 === null) {
    return true;
  } else if (obj1 === null || obj2 === null) {
    return false;
  }

  if (typeof obj1 === 'object') {
    const key1 = Object.keys(obj1).sort();
    const key2 = Object.keys(obj2).sort();

    if (key1.length !== key2.length) {
      return false;
    }

    return key1.reduce((ret, key) => {
      const val2 = obj2[key];
      if (val2 === undefined) {
        return false;
      }
      const temp = jsonEqual(obj1[key], obj2[key]);
      return ret && temp;
    }, true);
  }
  return obj1 === obj2;
}

export default {
  jsonEqual,
};
