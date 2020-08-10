require('dotenv').config();
const csv = require('csv-parser');
const fs = require('fs');

const db = require("../models");

const CropType = db.cropType;
const Brand = db.brand;
const Seed = db.seed;
const Irrigation = db.irrigation;
const Region = db.region;

(() => {
  db.sequelize.sync({ alter: { drop: false } }).then(() => {
    console.log('Syncing DB finished');
    load();
  });
})();

const load = () => {
  const entries = [];
  let model;
  if (process.argv[2] === "crop") model = CropType;
  if (process.argv[2] === "seed") model = Seed;
  if (process.argv[2] === "brand") model = Brand;
  if (process.argv[2] === "irrigation") model = Irrigation;
  if (process.argv[2] === "region") model = Region;
  try {
    fs.createReadStream(process.argv[3])
      .pipe(csv())
      .on('data', (row) => {
        entries.push(row);
      })
      .on('end', async () => {
        let i, j, temparray, chunk = 1000;
        for (i = 0, j = entries.length; i < j; i += chunk) {
          try {
            temparray = entries.slice(i, i + chunk);
            await model.bulkCreate(temparray);
            console.log(`Successfully uploaded entries: ${temparray.length}`);
          } catch(err) {
            console.log(err);
          }
        }
        console.log('CSV file successfully processed');
      });
  } catch (err) {
    console.log(err);
  }
}
