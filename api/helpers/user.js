const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const db = require("../models");
const User = db.user;

const { convertAgeToDate } = require("./common");

const findInvalidRows = async (entries) => {
  const badEntries = [];
  const goodEntries = [];
  const phoneEntries = entries.map(x => x.phone);
  const phones = [];
  try {
    const users = await User.findAll({where: {isActive: true, phone: {[Op.in]: phoneEntries}}});
    users.forEach(u => {
      phones.push(u.phone);
    });
  entries.forEach(entry => {
    if (entry.firstName.length < 2) {
      badEntries.push({...entry, reason: 'First Name should be atleast 2 cahracters long'});
      return;
    }
    if (entry.lastName.length === "") {
      badEntries.push({...entry, reason: 'Last Name should be atleast 1 cahracter long'});
      return;
    }
    if (!['male', 'female', 'other'].includes(entry.gender)) {
      badEntries.push({...entry, reason: 'Gender is required'});
      return;
    }
    if(isNaN(parseInt(entry.age))) {
      badEntries.push({...entry, reason: 'Age should be in valid format (number)'});
      return;
    }
    if (entry.phone.length !== 10) {
      badEntries.push({...entry, reason: 'Phone should be 10 digits long'});
      return;
    }
    if (entry.ration === '') {
      badEntries.push({...entry, reason: 'Ration Card No. is required'});
      return;
    }
    if (entry.address === '') {
      badEntries.push({...entry, reason: 'Address is required'});
      return;
    }
    if (entry.district === '') {
      badEntries.push({...entry, reason: 'District Card No. is required'});
      return;
    }
    if (phones.includes(entry.phone)) {
      badEntries.push({...entry, reason: 'Phone is already in use'});
      return;
    }
    goodEntries.push({...entry});
  });
  goodEntries.forEach(e => {
    e.age = convertAgeToDate(e.age);
  });
  return {badEntries, goodEntries};
  } catch (err) {
    console.log(err);
    return {badEntries, goodEntries};
  }
};

module.exports = {
  findInvalidRows,
}
