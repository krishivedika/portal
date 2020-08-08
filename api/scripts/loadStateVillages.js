require('dotenv').config();
const csv = require('csv-parser');
const fs = require('fs');

const db = require("../models");

const Region = db.region;

(() => {
  db.sequelize.sync({ alter: { drop: false } }).then(() => {
    console.log('Syncing DB finished');
    load();
  });
})();

const load = () => {
  const entries = [];
  try {
    fs.createReadStream(process.argv[2])
    .pipe(csv())
    .on('data', (row) => {
      console.log(row);
      entries.push(row);
    })
    .on('end', () => {
      Region.bulkCreate(entries).then(() => {
        console.log(`Successfully uploaded entries: ${entries.length}`);
      }).catch(err => {
        console.log(err);
      });
      console.log('CSV file successfully processed');
    });
  } catch(err) {
    console.log(err);
  }
}
