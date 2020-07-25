const convertAgeToDate = (age) => {
  const dateNow = new Date();
  dateNow.setFullYear(dateNow.getFullYear() - age);
  dateNow.setMonth(0);
  dateNow.setDate(1);
  return dateNow;
};

module.exports = {
  convertAgeToDate,
}
