function reduceToSingleDigit(num, keepMaster = false) {
  while (num > 9 || (keepMaster && (num === 11 || num === 22))) {
    if (keepMaster && (num === 11 || num === 22)) return num;
    num = num.toString().split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return num;
}

function digitSum(num) {
  return num.toString().split('').reduce((a, b) => a + parseInt(b), 0);
}

function kabbalahReduce(sum) {
  const remainder = sum % 9;
  return remainder === 0 ? 9 : remainder;
}

module.exports = { reduceToSingleDigit, digitSum, kabbalahReduce };
