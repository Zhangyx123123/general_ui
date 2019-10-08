function convertToCSV(objArray, headerInfo) {
  if (objArray.length === 0) {
    return null;
  }
  const keys = headerInfo.map(obj => obj.key);
  let data = '';
  data += `${headerInfo.map(obj => obj.text)}\r\n`;
  for (let i = 0; i < objArray.length; i += 1) {
    data += `"${keys.map((key) => {
      if (typeof objArray[i][key] === 'string') {
        return objArray[i][key].replace(/"/g, '""');
      }
      return objArray[i][key];
    }).join('","')}"\r\n`;
  }
  return data;
}

export default {
  convertToCSV,
};
