const transformLongMessage = (str) => {
  if (str.length>100) {
    let newStr = str.slice(0,99)+'...';
    return newStr;
  }
  return str;
};

module.exports = transformLongMessage;