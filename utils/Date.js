const formatYear = date => {
  const year = date.getFullYear();
  return year;
}

const formatMonth = date => {
  const month = date.getMonth()+1;
  return month;
}

const formatDay = date => {
  const day = date.getDate();
  return day;
}

module.exports = {
  formatYear: formatYear,
  formatMonth: formatMonth,
  formatDay: formatDay,
}