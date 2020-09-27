require('dotenv').config();
const csv = require('csv-parser');
const fs = require('fs');

const db = require("../models");

const CropType = db.cropType;
const Brand = db.brand;
const Seed = db.seed;
const Region = db.region;
const InventoryType = db.inventoryType;
const MachineryType = db.machineryType;
const Activity = db.activity;
const Irrigation = db.irrigation;
const Soil = db.soil;
const Season = db.season;
const Farming = db.farming;
const Cultivation = db.cultivation;

const load = () => {
  const entries = [];
  let model, validLength;
  if (process.argv[2] === "crop") {
    model = CropType, validLength = 5;
  }
  if (process.argv[2] === "seed") {
    model = Seed, validLength = 1;
  }
  if (process.argv[2] === "brand") {
    model = Brand, validLength = 2;
  }
  if (process.argv[2] === "irrigation") {
    model = Irrigation, validLength = 1;
  }
  if (process.argv[2] === "soil") {
    model = Soil, validLength = 1;
  }
  if (process.argv[2] === "season") {
    model = Season, validLength = 1;
  }
  if (process.argv[2] === "farming") {
    model = Farming, validLength = 1;
  }
  if (process.argv[2] === "cultivation") {
    model = Cultivation, validLength = 1;
  }
  if (process.argv[2] === "region") {
    model = Region, validLength = 4;
  }

  if (process.argv[2] === "inventory") {
    model = InventoryType, validLength = 3;
  }

  if (process.argv[2] === "machinery") {
    model = MachineryType, validLength = 2;
  }

  if (process.argv[2] === "activity") {
    model = Activity, validLength = 3;
  }

  try {
    fs.createReadStream(process.argv[4])
      .pipe(csv())
      .on('data', (row) => {
        entries.push(row);
      })
      .on('end', async () => {
        let i, j, temparray, chunk = 1000;
        let valid = true;
        entries.forEach(e => {
          if (Object.keys(e).length !== validLength) valid = false;
        });
        if (!valid) {
          console.log('Malformed CSV');
        }
        else {
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
        }
      });
  } catch (err) {
    console.log(err);
  }
}

(() => {
  if (process.argv[3] == "yes") {
    db.sequelize.sync({ alter: { drop: false } }).then(() => {
      console.log('Syncing DB finished');
      load();
    });
  } else if (process.argv[3] == "no") {
    load();
  }
})();
