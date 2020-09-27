const db = require("../models");
const { sms, email } = require("../utils");
const config = require("../config");

const Notification = db.notification;
const User = db.user;
const Crop = db.crop;
const Farm = db.farm;
const Layer = db.layer;
const Activity = db.activity;
const InventoryType = db.inventoryType;
const MachineryType = db.machineryType;
const Warehouse = db.warehouse;

exports.createActivityNotification = async (job, done) => {
  const { activity, userId, layerId, emailId } = job.attrs.data;
  const layer = await Layer.findOne({where: {id: layerId}});
  if (layer.isActive && !layer.isAbandoned) {
    const text = `Activity ${activity} due in 3 days, please mark completed once done.`
    await Notification.create({
      UserId: userId,
      isRead: false,
      isActive: true,
      type: 1,
      subtype: 1,
      entityId: layerId,
      text: text
    });
    if (emailId) {
      try {
        const emailBody = `
            Dear KVP Member,
            <br><br>
            ${text}
            Click on this <a href="${config.ORIGIN}/tasks">link</a> to update.
            <br>
            <br><br>
            Thanks,
            KVP Admin.
            `;
        email.sendEmail(emailId, 'KVP: Crop needs attention', emailBody);
      } catch (err) {
        console.log(err);
      }
    }
  }
  done();
}

exports.flushNewActivity = async (job, done) => {
  const { order, mlm, crop, cultivations, irrigations, seasons, farmings, soils } = job.attrs.data;
  const inventoryTypes = await InventoryType.findAll({ where: { isActive: true } });
  const machineryTypes = await MachineryType.findAll({ where: { isActive: true } });
  const activities = await Activity.findAll({ where: { isActive: true } });
  const layerAdded = {};
  const dimensionFlush = (dimensions, type) => {
    for (const dimension of dimensions) {
      let where = {crop: crop};
      where[type] = dimension;
      Layer.findAll({where: where,
        include: [
          {
            model: Crop, include: [
              {
                model: Farm, include: [
                  { model: User.scope("withoutPassword") },
                  {
                    model: Warehouse,
                    required: false,
                    where: { isActive: true },
                  },
                ]
              }
            ]
          }
        ]
      }).then(async layers => {
        layers.forEach(async layer => {
          const farm = await Farm.findOne({ where: { id: layer.Crop.Farm.id, isActive: true } });
          const inventoryTypesObj = {};
          inventoryTypes.forEach(i => {
            inventoryTypesObj[i.item] = {};
          });
          inventoryTypes.forEach(i => {
            if (i.metric) {
              inventoryTypesObj[i.item][i.metric] = i.price;
            } else {
              inventoryTypesObj[i.item][i.item] = i.price;
            }
          });
          const machineryTypesObj = {};
          machineryTypes.forEach(i => {
            machineryTypesObj[i.item] = i.price;
          });
          const activityObj = {};
          activities.forEach(i => {
            activityObj[i.name] = { man_price: i.man_price, woman_price: i.woman_price };
          });
          let stages = JSON.parse(layer.config).stages;
          let currentConfig = [...stages];
          if (currentConfig.length === 0) {
            currentConfig.push({
              id: order,
              stage: type,
              activity: activity,
              day: days,
              labour: true,
              inm: mlm.inventory.name,
              ipm: mlm.inventoryIpm.name,
              inventory: mlm.inventory,
              inventoryIpm: mlm.inventoryIpm,
              machinery: mlm.machinery,
              man_labour: mlm.man_labour,
              woman_labour: mlm.woman_labour,
              current: true,
            });
            layerAdded[layer.id] = true;
          } else {
            currentConfig.forEach((stage, index) => {
              if (order > stage.id && !stage.completed) {
                if (!layerAdded[layer.id]) {
                  layerAdded[layer.id] = true;
                  currentConfig.splice(index + 1, 0, {
                    id: order,
                    stage: type,
                    activity: activity,
                    day: days,
                    labour: true,
                    inm: mlm.inventory.name,
                    ipm: mlm.inventoryIpm.name,
                    inventory: mlm.inventory,
                    inventoryIpm: mlm.inventoryIpm,
                    machinery: mlm.machinery,
                    man_labour: mlm.man_labour,
                    woman_labour: mlm.woman_labour,
                  });
                }
              }
            });
          }
          currentConfig.sort((a, b) => {
            return a.id - b.id;
          });
          let price = 0;
          let machineryPrice = 0;
          let farmSize = 0;
          JSON.parse(farm.partitions).partitions.forEach(p => {
            if (p.item == layer.Crop.name) {
              farmSize = p.area;
            }
          });
          currentConfig.forEach(s => {
            s.inventory.quantity = parseFloat((s.inventory.quantity) * farmSize).toFixed(2);
            s.inventoryIpm.quantity = parseFloat((s.inventoryIpm.quantity) * farmSize).toFixed(2);
          });
          currentConfig.forEach(s => {
            if (s.inventory.name && s.inventory.metric) {
              price += inventoryTypesObj[s.inventory.name][s.inventory.metric] * s.inventory.quantity;
            } else if (s.inventory.name) {
              price += inventoryTypesObj[s.inventory.name][s.inventory.name] * s.inventory.quantity;
            }
            if (s.inventoryIpm.name && s.inventoryIpm.metric) {
              price += inventoryTypesObj[s.inventoryIpm.name][s.inventoryIpm.metric] * s.inventoryIpm.quantity;
            } else if (s.inventoryIpm.name) {
              price += inventoryTypesObj[s.inventoryIpm.name][s.inventoryIpm.name] * s.inventoryIpm.quantity;
            }
            if (s.machinery) {
              machineryPrice += machineryTypesObj[s.machinery.name] * s.machinery.quantity;
            }
            let man_activity = activityObj[s.activity];
            s.man_price = 0;
            s.woman_price = 0;
            if (man_activity) {
              s.man_price = man_activity.man_price;
            }
            let woman_activity = activityObj[s.activity];
            if (man_activity) {
              s.woman_price = woman_activity.woman_price;
            }
          });
          if (layerAdded[layer.id] === true) {
            layer.update({price: price, machineryPrice: machineryPrice, config: JSON.stringify({stages: currentConfig}), currentVersion: layer.initialVersion + 1});
          }
        })
      }).catch(err => {
        console.log(err);
      });
    };
  }
  dimensionFlush(cultivations, "cultivation");
  dimensionFlush(irrigations, "irrigation");
  dimensionFlush(seasons, "season");
  dimensionFlush(soils, "soil");
  dimensionFlush(farmings, "farming");
  done();
}
