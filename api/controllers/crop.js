const Sequelize = require("sequelize");
const moment = require("moment-timezone");
const { agenda } = require("../agenda");
const db = require("../models");
const config = require("../config");

const Op = Sequelize.Op;
const Farm = db.farm
const Crop = db.crop;
const Layer = db.layer;
const User = db.user;
const Role = db.role;
const CropType = db.cropType;
const Brand = db.brand;
const Seed = db.seed;
const Irrigation = db.irrigation;
const InventoryType = db.inventoryType;
const Warehouse = db.warehouse;
const Inventory = db.inventory;
const Machinery = db.machinery;
const MachineryType = db.machineryType;
const Activity = db.activity;
const Soil = db.soil;
const Season = db.season;
const Farming = db.farming;
const Cultivation = db.cultivation
const ActivityMaster = db.activityMaster;
const Notification = db.notification;

// Crop Record End Points
exports.cropTypes = async (req, res) => {
  try {
    const cropTypes = await CropType.scope('withoutDates').findAll();
    const seeds = await Seed.scope('withoutDates').findAll();
    const brands = await Brand.scope('withoutDates').findAll();
    const irrigations = await Irrigation.scope('withoutDates').findAll();
    const seasons = await Season.scope('withoutDates').findAll();
    const cultivations = await Cultivation.scope('withoutDates').findAll();
    const farmings = await Farming.scope('withoutDates').findAll();
    const soils = await Soil.scope('withoutDates').findAll();
    return res.status(200).send({ seasons, soils, cultivations, farmings, cropTypes, seeds, brands, irrigations, soils, seasons, cultivations, farmings });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  };
}

exports.cropRecords = async (req, res) => {
  let where = {
    [Op.or]: [
      { name: { [Op.like]: `%${req.query.search}%` } },
    ],
  };
  let cropWhere = { isActive: true };
  let layerWhere = { isActive: true };
  let include = []
  let csrUsers = [];
  let users = [];

  if (req.query.deleted === 'true') {
    cropWhere = {};
    layerWhere = {isAbandoned: false};
  }
  if (req.query.abandoned === 'true') {
    cropWhere = {};
    if (req.query.deleted === 'true') layerWhere = {};
    else layerWhere = {[Op.or]: {isActive: true, isAbandoned: true}};
  }


  if (req.userRoleId === 5) {
    where = { ...where, userId: req.userId }
  }
  else {
    if (req.userRoleId === 2) {
      csrUsers = await User.scope("withoutPassword").findAll({
        where: { '$Roles.UserRoles.roleId$': { [Op.in]: [5] } },
        include: [
          {
            model: Role, through: 'UserRoles',
            required: false,
          }
        ]
      });
      csrUsers.forEach(csr => {
        users.push(csr.id);
      });
      where = { ...where, userId: { [Op.in]: users } };
      include.push({ model: User.scope("withoutPassword") });
    } else {
      csrUsers = await User.scope("withoutPassword").findAll({
        where: { '$managedBy.UserAssociations.csrId$': req.userId },
        include: [
          {
            model: User.scope("withoutPassword"), as: 'managedBy', through: 'UserAssociations',
            required: false,
          }
        ]
      });
      csrUsers.forEach(csr => {
        users.push(csr.id);
      });
      where = { ...where, userId: { [Op.in]: users } };
      include.push({ model: User.scope("withoutPassword") });
    }
  }

  Farm.findAll({
    where: where,
  }).then((farms) => {
    const farmIds = [];
    farms.forEach(f => farmIds.push(f.id));
    Crop.findAll({
      where: { ...cropWhere, farmId: { [Op.in]: farmIds } },
      include: [
        { model: Farm, include: [{ model: User.scope('withoutPassword') }] },
        { model: Layer, required: false, where: layerWhere },
      ]
    }).then(crops => {
      if (!farms) {
        return res.status(404).send({ message: "No Crop Records exist" });
      }
      return res.status(200).send({ crops: crops, farms: farms, csrUsers: csrUsers });
    })
  }).catch((err) => {
    console.log(err);
    return res.status(500).send({ message: err.message });
  });
};

exports.addCropRecord = async (req, res) => {
  const farm = await Farm.findOne({ where: { id: req.body.farm, isActive: true } });
  Crop.findOne({
    where: { isActive: true, name: req.body.plot, FarmId: req.body.farm },
    include: [
      { model: Farm, include: [{ model: User.scope('withoutPassword') }] },
    ]
  }).then(async (crop) => {
    if (crop) {
      Layer.findOne({ where: { CropId: crop.id, isActive: true, name: req.body.layer } }).then(layer => {
        if (!layer.isCompleted) return res.status(404).send({ message: "Crop in this Plot and Layer is already active", code: 2 });
      })
    }
    const size = JSON.parse(farm.partitions).partitions.filter(p => p.item == req.body.plot)[0].area;
    try {
      if (!crop) {
        crop = await Crop.create({ FarmId: farm.id, size: size, name: req.body.plot });
      }
      const inventoryTypes = await InventoryType.findAll({ where: { isActive: true } });
      const machineryTypes = await MachineryType.findAll({ where: { isActive: true } });
      const activity = await Activity.findAll({ where: { isActive: true } });
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
      activity.forEach(i => {
        activityObj[i.name] = { man_price: i.man_price, woman_price: i.woman_price };
      });

      const activities = await ActivityMaster.findAll({ where: { crop: req.body.crop } });
      let activityJSON = [];
      let activityOrders = [];
      activities.forEach(a => {
        const mlm = JSON.parse(a.mlm);
        const activity = {
          id: a.order, stage: a.type, activity: a.name, day: a.day,
          labour: true, inm: `Material ${mlm.inventory.name || ""}`, ipm: `${mlm.inventoryIpm.name || ""}`,
          inventory: mlm.inventory, inventoryIpm: mlm.inventoryIpm, machinery: mlm.machinery,
          man_labour: mlm.man_labour, woman_labour: mlm.woman_labour
        };
        if (a.dimensionType === "season" && a.dimension === req.body.season) {
          if (!activityOrders.includes(a.order)) {
            activityJSON.push(activity);
            activityOrders.push(a.order);
          }
        }
        if (a.dimensionType === "soil" && a.dimension === req.body.soil) {
          if (!activityOrders.includes(a.order)) {
            activityJSON.push(activity);
            activityOrders.push(a.order);
          }
        }
        if (a.dimensionType === "farming" && a.dimension === req.body.farming) {
          if (!activityOrders.includes(a.order)) {
            activityJSON.push(activity);
            activityOrders.push(a.order);
          }
        }
        if (a.dimensionType === "cultivation" && a.dimension === req.body.cultivation) {
          if (!activityOrders.includes(a.order)) {
            activityJSON.push(activity);
            activityOrders.push(a.order);
          }
        }
        if (a.dimensionType === "irrigation" && a.dimension === req.body.irrigation) {
          if (!activityOrders.includes(a.order)) {
            activityJSON.push(activity);
            activityOrders.push(a.order);
          }
        }
      });
      if (activityJSON.length == 0) {
        const layer = await Layer.create({
          CropId: crop.id,
          name: req.body.layer,
          crop: req.body.crop,
          seed: req.body.seed,
          brand: req.body.brand,
          irrigation: req.body.irrigation,
          soil: req.body.soil,
          season: req.body.season,
          farming: req.body.farming,
          cultivation: req.body.cultivation,
          date: req.body.date,
          config: JSON.stringify({ stages: [] }),
          price: 0,
          machineryPrice: 0,
          initialVersion: 0,
          currentVersion: 0,
          currentOrder: 0,
        });
        const users = await User.scope("withoutPassword").findAll(
          {where: {'$Roles.UserRoles.roleId$': {[Op.in]: [6]}},
          include: [{model: Role, through: 'UserRoles'}]
        });
        users.forEach(u => {
          Notification.create({
            UserId: u.id,
            isRead: false,
            isActive: true,
            type: 10,
            subtype: 1,
            entityId: 0,
            text: `No Crop Activity found for Crop ${req.body.crop}, combination: Seed - ${req.body.seed || "NA"}, Brand - ${req.body.brand || "NA"}, Irrigation - ${req.body.irrigation || "NA"}, Soil - ${req.body.soil || "NA"}, Season - ${req.body.season || "NA"}, Farming - ${req.body.farming || "NA"}, Cultivation - ${req.body.cultivation || "NA"}`
          });
        });
        return res.status(200).send({
          message: "Crop Record Created Successfully!",
        });
      }
      activityJSON.sort((a, b) => {
        return a.id - b.id;
      });
      activityJSON[0].current = true;
      let price = 0;
      let machineryPrice = 0;
      let farmSize = 0;
      JSON.parse(farm.partitions).partitions.forEach(p => {
        if (p.item == req.body.plot) {
          farmSize = p.area;
        }
      });
      activityJSON.forEach(s => {
        if (s.inventory) {
          s.inventory.quantity = parseFloat((s.inventory.quantity || 0) * farmSize).toFixed(2);
          s.inventoryIpm.quantity = parseFloat((s.inventoryIpm.quantity || 0) * farmSize).toFixed(2);
        }
      });
      activityJSON.forEach(s => {
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
        } else {
          s.man_price = 1;
        }
        let woman_activity = activityObj[s.activity];
        if (woman_activity) {
          s.woman_price = woman_activity.woman_price;
        } else {
          s.woman_price = 1;
        }
      });
      const layer = await Layer.create({
        CropId: crop.id,
        name: req.body.layer,
        crop: req.body.crop,
        seed: req.body.seed,
        brand: req.body.brand,
        irrigation: req.body.irrigation,
        soil: req.body.soil,
        season: req.body.season,
        farming: req.body.farming,
        cultivation: req.body.cultivation,
        date: req.body.date,
        config: JSON.stringify({ stages: activityJSON }),
        price: price,
        machineryPrice: machineryPrice,
        initialVersion: 1,
        currentVersion: 1,
        currentOrder: 0,
      });
      activityJSON.forEach(a => {
        const date = new Date();
        date.setDate(date.getDate() + (a.day - 3));
        date.setHours(config.NOTIFICATIONS_HOUR);
        date.setMinutes(config.NOTIFICATIONS_MINUTES);
        date.setSeconds(0);
        const timezone = "Asia/Kolkata";
        const momentDate = moment(date.toISOString()).tz(timezone).toDate();
        const currentDate = moment().tz(timezone).toDate();
        if (momentDate > currentDate) {
          agenda.schedule(momentDate, 'create activity notification', { layerId: layer.id, activity: a.activity, order: a.id, userId: crop.Farm.User.id, emailId: crop.Farm.User.email });
        }
      });
      return res.status(200).send({
        message: "Crop Record Created Successfully!",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "Unknown Error", code: 2 });
    }
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};

exports.editLayerRecord = async (req, res) => {
  const layer = await Layer.findOne(
    {
      where: { id: req.body.id },
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
    });
  const farm = await Farm.findOne({ where: { id: layer.Crop.Farm.id, isActive: true } });
  Crop.findOne({
    where: { isActive: true, name: req.body.plot, FarmId: layer.Crop.Farm.id },
    include: [
      { model: Farm, include: [{ model: User.scope('withoutPassword') }] },
    ]
  }).then(async (crop) => {
    const size = JSON.parse(farm.partitions).partitions.filter(p => p.item == req.body.plot)[0].area;
    try {
      if (!crop) {
        crop = await Crop.create({ FarmId: farm.id, size: size, name: req.body.plot });
      }
      const inventoryTypes = await InventoryType.findAll({ where: { isActive: true } });
      const machineryTypes = await MachineryType.findAll({ where: { isActive: true } });
      const activity = await Activity.findAll({ where: { isActive: true } });
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
      activity.forEach(i => {
        activityObj[i.name] = { man_price: i.man_price, woman_price: i.woman_price };
      });

      const activities = await ActivityMaster.findAll({ where: { crop: req.body.crop } });
      let activityJSON = [];
      let activityOrders = [];
      activities.forEach(a => {
        const mlm = JSON.parse(a.mlm);
        const activity = {
          id: a.order, stage: a.type, activity: a.name, day: a.day,
          labour: true, inm: `Material ${mlm.inventory.name || ""}`, ipm: `${mlm.inventoryIpm.name || ""}`,
          inventory: mlm.inventory, inventoryIpm: mlm.inventoryIpm, machinery: mlm.machinery,
          man_labour: mlm.man_labour, woman_labour: mlm.woman_labour
        };
        if (a.dimensionType === "season" && a.dimension === req.body.season) {
          if (!activityOrders.includes(a.order)) {
            activityJSON.push(activity);
            activityOrders.push(a.order);
          }
        }
        if (a.dimensionType === "soil" && a.dimension === req.body.soil) {
          if (!activityOrders.includes(a.order)) {
            activityJSON.push(activity);
            activityOrders.push(a.order);
          }
        }
        if (a.dimensionType === "farming" && a.dimension === req.body.farming) {
          if (!activityOrders.includes(a.order)) {
            activityJSON.push(activity);
            activityOrders.push(a.order);
          }
        }
        if (a.dimensionType === "cultivation" && a.dimension === req.body.cultivation) {
          if (!activityOrders.includes(a.order)) {
            activityJSON.push(activity);
            activityOrders.push(a.order);
          }
        }
        if (a.dimensionType === "irrigation" && a.dimension === req.body.irrigation) {
          if (!activityOrders.includes(a.order)) {
            activityJSON.push(activity);
            activityOrders.push(a.order);
          }
        }
      });
      if (activityJSON.length == 0) {
        const layer = await Layer.create({
          CropId: crop.id,
          name: req.body.layer,
          crop: req.body.crop,
          seed: req.body.seed,
          brand: req.body.brand,
          irrigation: req.body.irrigation,
          soil: req.body.soil,
          season: req.body.season,
          farming: req.body.farming,
          cultivation: req.body.cultivation,
          date: req.body.date,
          config: JSON.stringify({ stages: [] }),
          price: 0,
          machineryPrice: 0,
          initialVersion: 0,
          currentVersion: 0,
          currentOrder: 0,
        });
        const users = await User.scope("withoutPassword").findAll(
          {where: {'$Roles.UserRoles.roleId$': {[Op.in]: [6]}},
          include: [{model: Role, through: 'UserRoles'}]
        });
        users.forEach(u => {
          Notification.create({
            UserId: u.id,
            isRead: false,
            isActive: true,
            type: 10,
            subtype: 1,
            entityId: 0,
            text: `No Crop Activity found for Crop ${req.body.crop}, combination: Seed - ${req.body.seed || "NA"}, Brand - ${req.body.brand || "NA"}, Irrigation - ${req.body.irrigation || "NA"}, Soil - ${req.body.soil || "NA"}, Season - ${req.body.season || "NA"}, Farming - ${req.body.farming || "NA"}, Cultivation - ${req.body.cultivation || "NA"}`
          });
        });
        return res.status(200).send({
          message: "Crop Record Created Successfully!",
        });
      }
      activityJSON.sort((a, b) => {
        return a.id - b.id;
      });
      activityJSON[0].current = true;
      let price = 0;
      let machineryPrice = 0;
      let farmSize = 0;
      JSON.parse(farm.partitions).partitions.forEach(p => {
        if (p.item == req.body.plot) {
          farmSize = p.area;
        }
      });
      activityJSON.forEach(s => {
        if (s.inventory) {
          s.inventory.quantity = parseFloat((s.inventory.quantity || 0) * farmSize).toFixed(2);
          s.inventoryIpm.quantity = parseFloat((s.inventoryIpm.quantity || 0) * farmSize).toFixed(2);
        }
      });
      activityJSON.forEach(s => {
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
        } else {
          s.man_price = 1;
        }
        let woman_activity = activityObj[s.activity];
        if (woman_activity) {
          s.woman_price = woman_activity.woman_price;
        } else {
          s.woman_price = 1;
        }
      });
      layer.update({
        name: req.body.layer,
        crop: req.body.crop,
        seed: req.body.seed,
        brand: req.body.brand,
        irrigation: req.body.irrigation,
        soil: req.body.soil,
        season: req.body.season,
        farming: req.body.farming,
        cultivation: req.body.cultivation,
        date: req.body.date,
        config: JSON.stringify({ stages: activityJSON }),
        price: price,
        machineryPrice: machineryPrice,
        initialVersion: 1,
        currentVersion: 1,
        currentOrder: 0,
      });
      activityJSON.forEach(a => {
        const date = new Date();
        date.setDate(date.getDate() + (a.day - 3));
        date.setHours(config.NOTIFICATIONS_HOUR);
        date.setMinutes(config.NOTIFICATIONS_MINUTES);
        date.setSeconds(0);
        const timezone = "Asia/Kolkata";
        const momentDate = moment(date.toISOString()).tz(timezone).toDate();
        const currentDate = moment().tz(timezone).toDate();
        if (momentDate > currentDate) {
          agenda.schedule(momentDate, 'create activity notification', { layerId: layer.id, activity: a.activity, order: a.id, userId: crop.Farm.User.id, emailId: crop.Farm.User.email });
        }
      });
      return res.status(200).send({
        message: "Crop Record Updated Successfully!",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "Unknown Error", code: 2 });
    }
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};

exports.restoreCropRecord = (req, res) => {
  Crop.findOne({ where: { isActive: true, name: req.body.plot, FarmId: req.body.farm } }).then(async (crop) => {
    if (crop) {
      return res.status(404).send({ message: "Crop already currently active, cannot restore", code: 2 });
    } else {
      Crop.findOne({ where: { id: req.body.id } }).then(restoreCrop => {
        restoreCrop.update({ isActive: true }).then(() => {
          return res.send({ message: "Successfully restored crop" })
        }).catch(err => {
          console.log(err);
          return res.status(500).send({ message: "Unknown Error", code: 2 });
        });
      })
    }
  });
};

exports.deleteCropRecord = (req, res) => {
  Crop.findOne({
    where: {
      id: req.body.id,
    },
    include: [
      { model: Farm, include: [{ model: User.scope("withoutPassword") }] }
    ]
  }).then(async (crop) => {
    if (!crop) {
      return res.status(404).send({ message: "Crop Record doesn't exist" });
    }
    if ([3, 4].includes(req.userRoleId)) {
      const users = await User.scope("withoutPassword").findAll(
        {
          where: { '$managedBy.UserAssociations.csrId$': req.userId },
          include: [{ model: User.scope("withoutPassword"), as: 'managedBy', through: 'UserAssociations' }]
        });
      const managedUsers = users.map(x => x.id);
      if (!managedUsers.includes(crop.Farm.User.id)) {
        return res.status(404).send({ message: "You dont have the permission to delete this Crop" });
      }
    }
    if ([5].includes(req.userRoleId)) {
      if (crop.Farm.User.id !== req.userId) {
        return res.status(404).send({ message: "You dont have the permission to delete this Crop" });
      }
    }
    crop.update({ isActive: false }).then(() => {
      return res.send({ message: "Crop Record Successfully Deleted!" });
    });
  }).catch(() => {
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};

exports.getLayerRecord = (req, res) => {
  Layer.findOne(
    {
      where: { id: req.query.id },
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
    }).then(async layer => {
      if (!layer) {
        return res.status(404).send({ message: "Layer doesn't exist" });
      }
      if ([3, 4].includes(req.userRoleId)) {
        const users = await User.scope("withoutPassword").findAll(
          {
            where: { '$managedBy.UserAssociations.csrId$': req.userId },
            include: [{ model: User.scope("withoutPassword"), as: 'managedBy', through: 'UserAssociations' }]
          });
        const csrUsers = users.map(x => x.id);
        if (!csrUsers.includes(layer.Crop.Farm.User.id)) {
          return res.status(404).send({ message: "You dont have the permission to get this Crop" });
        }
      }
      if ([5].includes(req.userRoleId)) {
        if (layer.Crop.Farm.User.id !== req.userId) {
          return res.status(404).send({ message: "You dont have the permission to get this Crop" });
        }
      }
      const inventories = await Inventory.findAll({ where: { WarehouseId: { [Op.in]: layer.Crop.Farm.Warehouses.map(x => x.id) } } });
      const inventoryTypes = await InventoryType.findAll({ where: { isActive: true } });
      const machinery = await Machinery.findAll({ where: { WarehouseId: { [Op.in]: layer.Crop.Farm.Warehouses.map(x => x.id) } } });
      const machineryTypes = await MachineryType.findAll({ where: { isActive: true } });
      return res.send({ layer: layer, machinery, inventories, inventoryTypes, machineryTypes });
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: 'Unknown error' });
    });
}

exports.updateLayerRecord = async (req, res) => {
  Layer.findOne(
    {
      where: { id: req.body.id },
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
    }).then(async layer => {
      if (!layer) {
        return res.status(404).send({ message: "Layer doesn't exist" });
      }
      if ([3, 4].includes(req.userRoleId)) {
        const users = await User.scope("withoutPassword").findAll(
          {
            where: { '$managedBy.UserAssociations.csrId$': req.userId },
            include: [{ model: User.scope("withoutPassword"), as: 'managedBy', through: 'UserAssociations' }]
          });
        const csrUsers = users.map(x => x.id);
        if (!csrUsers.includes(layer.Crop.Farm.User.id)) {
          return res.status(404).send({ message: "You dont have the permission to update this Crop" });
        }
      }
      if ([5].includes(req.userRoleId)) {
        if (layer.Crop.Farm.User.id !== req.userId) {
          return res.status(404).send({ message: "You dont have the permission to update this Crop" });
        }
      }


      let values = {};
      const currentConfig = JSON.parse(layer.config);
      let selectedLayer = {};
      currentConfig.stages.forEach((stage, index) => {
        if (stage.id === req.body.stageId) {
          selectedLayer = stage;
          if (req.body.confirm == "skip") {
            stage["material"] = 0;
            stage["materialIpm"] = 0;
            stage["man_labour"] = 0;
            stage["woman_labour"] = 0;
            stage["extra_cost"] = 0;
            stage["machinery_lease"] = 0;
            stage["machinery_rent"] = 0;
            stage["machinery_fuel"] = 0;
            stage["machinery_man_power"] = 0;
            stage["skip"] = true;
            stage["reason"] = req.body.reason;
            if (stage.state !== "presowing") {
              if (req.body.complete) {
                stage.current = false;
                stage.completed = true;
                if (index !== (currentConfig.stages.length - 1)) {
                  currentConfig.stages[index + 1].current = true;
                }
              }
            }
          } else {
            stage["material"] = req.body.material;
            stage["materialIpm"] = req.body.material_ipm;
            if (req.body.labour) {
              stage["man_labour"] = req.body.man;
              stage["woman_labour"] = req.body.woman;
            }
            stage["extra_cost"] = req.body.extra_cost;
            if (req.body.machinery) {
              stage["machinery_lease"] = req.body.machinery_lease;
              stage["machinery_rent"] = req.body.machinery_rent;
              stage["machinery_fuel"] = req.body.machinery_fuel;
              stage["machinery_man_power"] = req.body.machinery_man_power;
            }
            if (stage.state !== "presowing") {
              if (req.body.complete) {
                stage.current = false;
                stage.completed = true;
                if (index !== (currentConfig.stages.length - 1)) {
                  currentConfig.stages[index + 1].current = true;
                } else {
                  values.isCompleted = true;
                }
              }
            }
            if (req.body.confirm == "confirm") {
              stage["actual"] = req.body.actual;
            }
          }
        }
      });
      values.config = JSON.stringify(currentConfig);
      values.isStarted = true;
      values.currentOrder = selectedLayer.id;
      layer.update(values).then(async l => {
        const inventoryTypes = await InventoryType.findAll({ where: { isActive: true } });
        const machineryTypes = await MachineryType.findAll({ where: { isActive: true } });
        let inventories = machinery = [];
        if (req.body.confirm == "confirm") {
          Inventory.findOne({ where: { id: req.body.inventoryId } }).then(async i => {
            Inventory.findOne({ where: { id: req.body.inventoryIpmId } }).then(async iIpm => {
              if (layer.Crop.Farm.Warehouses) {
                inventories = await Inventory.findAll({ where: { WarehouseId: { [Op.in]: layer.Crop.Farm.Warehouses.map(x => x.id) } } });
                machinery = await Machinery.findAll({ where: { WarehouseId: { [Op.in]: layer.Crop.Farm.Warehouses.map(x => x.id) } } });
              }
              if (i) {
                let quantity = 0;
                if (i.quantity > selectedLayer.actual.material) {
                  quantity = i.quantity - selectedLayer.actual.material;
                }
                await i.update({ quantity: quantity });
              }
              if (iIpm) {
                let quantityIpm = 0;
                if (iIpm.quantity > selectedLayer.actual.material_ipm) {
                  quantityIpm = iIpm.quantity - selectedLayer.actual.material_ipm;
                }
                await iIpm.update({ quantity: quantityIpm });
              }
              if (layer.Crop.Farm.Warehouses) {
                inventories = await Inventory.findAll({ where: { WarehouseId: { [Op.in]: layer.Crop.Farm.Warehouses.map(x => x.id) } } });
                machinery = await Machinery.findAll({ where: { WarehouseId: { [Op.in]: layer.Crop.Farm.Warehouses.map(x => x.id) } } });
              }
              return res.send({ message: 'Successfully Updated Activity and Inventory', layer: l, inventories, machinery, inventoryTypes, machineryTypes });
            })
          }).catch(err => {
            console.log(err);
            return res.status(500).send({ message: 'Unknown error' });
          })
        } else {
          if (layer.Crop.Farm.Warehouses) {
            inventories = await Inventory.findAll({ where: { WarehouseId: { [Op.in]: layer.Crop.Farm.Warehouses.map(x => x.id) } } });
            machinery = await Machinery.findAll({ where: { WarehouseId: { [Op.in]: layer.Crop.Farm.Warehouses.map(x => x.id) } } });
          }
          return res.send({ message: 'Successfully Updated Activity', layer: l, inventories, machinery, inventoryTypes, machineryTypes });
        }
      });
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: 'Unknown error' });
    });
}

exports.deleteLayerRecord = (req, res) => {
  Layer.findOne(
    {
      where: { id: req.body.id },
      include: [
        {
          model: Crop, include: [
            {
              model: Farm, include: [
                { model: User.scope("withoutPassword") }
              ]
            }
          ]
        }
      ]
    }).then(async layer => {
      if (!layer) {
        return res.status(404).send({ message: "Layer doesn't exist" });
      }
      if ([3, 4].includes(req.userRoleId)) {
        const users = await User.scope("withoutPassword").findAll(
          {
            where: { '$managedBy.UserAssociations.csrId$': req.userId },
            include: [{ model: User.scope("withoutPassword"), as: 'managedBy', through: 'UserAssociations' }]
          });
        const csrUsers = users.map(x => x.id);
        if (!csrUsers.includes(layer.Crop.Farm.User.id)) {
          return res.status(404).send({ message: "You dont have the permission to delete this Layer Crop" });
        }
      }
      if ([5].includes(req.userRoleId)) {
        if (layer.Crop.Farm.User.id !== req.userId) {
          return res.status(404).send({ message: "You dont have the permission to delete this Layer Crop" });
        }
      }
      layer.update({ isActive: false }).then(async l => {
        return res.send({ message: 'Successfully Deleted Crop' });
      }).catch(err => {
        console.log(err);
        return res.status(500).send({ message: 'Unknown error' });
      })
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: 'Unknown error' });
    });
}

exports.abandonLayerRecord = (req, res) => {
  Layer.findOne(
    {
      where: { id: req.body.id },
      include: [
        {
          model: Crop, include: [
            {
              model: Farm, include: [
                { model: User.scope("withoutPassword") }
              ]
            }
          ]
        }
      ]
    }).then(async layer => {
      if (!layer) {
        return res.status(404).send({ message: "Layer doesn't exist" });
      }
      if ([3, 4].includes(req.userRoleId)) {
        const users = await User.scope("withoutPassword").findAll(
          {
            where: { '$managedBy.UserAssociations.csrId$': req.userId },
            include: [{ model: User.scope("withoutPassword"), as: 'managedBy', through: 'UserAssociations' }]
          });
        const csrUsers = users.map(x => x.id);
        if (!csrUsers.includes(layer.Crop.Farm.User.id)) {
          return res.status(404).send({ message: "You dont have the permission to delete this Layer Crop" });
        }
      }
      if ([5].includes(req.userRoleId)) {
        if (layer.Crop.Farm.User.id !== req.userId) {
          return res.status(404).send({ message: "You dont have the permission to delete this Layer Crop" });
        }
      }
      layer.update({ isActive: false, isAbandoned: true, reason: req.body.reason }).then(async l => {
        return res.send({ message: 'Successfully Abandoned Crop' });
      }).catch(err => {
        console.log(err);
        return res.status(500).send({ message: 'Unknown error' });
      })
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: 'Unknown error' });
    });
}

exports.getLayerActivity = (req, res) => {
  Layer.findAll(
    {
      order: [['id', 'DESC']],
      where: { isActive: true },
      include: [
        {
          model: Crop, include: [
            {
              model: Farm, include: [
                { model: User.scope("withoutPassword"), where: { id: req.userId, isActive: true } },
                {
                  model: Warehouse,
                  required: false,
                  where: { isActive: true },
                },
              ]
            }
          ],
          where: { isActive: true },
        }
      ]
    }).then(async layers => {
      if (!layers) {
        return res.status(404).send({ message: "No crops found" });
      }
      const inventoryTypes = await InventoryType.findAll({ where: { isActive: true } });
      const machineryTypes = await MachineryType.findAll({ where: { isActive: true } });
      let inventories = {};
      let machinery = {};
      Array.prototype.forEachAsync = async function (cb) {
        for (let x of this) {
          await cb(x);
        }
      }
      for (const layer of layers) {
        if (layer.Crop) {
          if (layer.Crop.Farm) {
            if (layer.Crop.Farm.Warehouses) {
              try {
                inventories[layer.id] = await Inventory.findAll({ where: { WarehouseId: { [Op.in]: layer.Crop.Farm.Warehouses.map(x => x.id) } } });
                machinery[layer.id] = await Machinery.findAll({ where: { WarehouseId: { [Op.in]: layer.Crop.Farm.Warehouses.map(x => x.id) } } });
              } catch (err) {
                console.log(err);
              }
            }
          }
        }
      };
      return res.send({ layers: layers, inventoryTypes, machineryTypes, inventories, machinery });
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: 'Unknown error' });
    });
}

exports.createActivity = async (req, res) => {
  if ([6].includes(req.userRoleId)) {
    try {
      const { crop, days, activity, type, order } = req.body;
      const activities = await ActivityMaster.findAll({ where: { crop: crop } });
      let found = false;
      activities.forEach(a => {
        if (a.order == order) {
          found = true;
        }
      });
      if (found) {
        return res.status(500).send({ message: 'Crop with this order already exists' });
      }
      const mlm = {
        inventory: { name: req.body["0_inm_material_name"], quantity: req.body["0_inm_material_quantity"], metric: req.body["0_inm_material_metric"] },
        inventoryIpm: { name: req.body["0_ipm_material_name"], quantity: req.body["0_ipm_material_quantity"], metric: req.body["0_ipm_material_metric"] },
      }
      if (req.body["0_machinery_name"]) {
        mlm["machinery"] = { name: req.body["0_machinery_name"], quantity: req.body["0_machinery_quantity"] };
      }
      mlm["man_labour"] = req.body.man_labour || 0;
      mlm["woman_labour"] = req.body.woman_labour || 0;
      const common = {
        name: activity,
        type: type,
        order: order,
        crop: crop,
        day: days,
        mlm: JSON.stringify(mlm),
      }
      const cultivations = req.body.cultivation || [];
      const panchayats = req.body.panchayat || [];
      const irrigations = req.body.irrigation || [];
      const seasons = req.body.season || [];
      const farmings = req.body.farming || [];
      const soils = req.body.soil || [];
      cultivations.forEach(async c => {
        await ActivityMaster.create({
          ...common,
          dimension: c,
          dimensionType: "cultivation",
        });
      });
      panchayats.forEach(async c => {
        await ActivityMaster.create({
          ...common,
          dimension: c,
          dimensionType: "geography",
        });
      });
      irrigations.forEach(async c => {
        await ActivityMaster.create({
          ...common,
          dimension: c,
          dimensionType: "irrigation",
        });
      });
      seasons.forEach(async c => {
        await ActivityMaster.create({
          ...common,
          dimension: c,
          dimensionType: "season",
        });
      });
      soils.forEach(async c => {
        await ActivityMaster.create({
          ...common,
          dimension: c,
          dimensionType: "soil",
        });
      });
      farmings.forEach(async c => {
        await ActivityMaster.create({
          ...common,
          dimension: c,
          dimensionType: "farming",
        });
      });
      agenda.now('flush new activity', { order, mlm, crop, cultivations, irrigations, seasons, farmings, soils });
      return res.status(200).send({
        message: "Activity Created Successfully!",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: 'Unknown error' });
    }
  } else {
    return res.status(500).send({ message: 'You dont have the permissions to do this' });
  }
}

exports.deleteActivity = async (req, res) => {
  if ([6].includes(req.userRoleId)) {
    ActivityMaster.update({ isActive: false }, { where: { id: req.body.id } }).then(() => {
      return res.send({ message: 'Successfully Deleted Activity' });
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: 'Unknown error' });
    });
  } else {
    return res.status(500).send({ message: 'You dont have the permissions to do this' });
  }
}

exports.getActivities = async (req, res) => {
  if ([6].includes(req.userRoleId)) {
    try {
      const irrigations = await Irrigation.scope('withoutDates').findAll();
      const seasons = await Season.scope('withoutDates').findAll();
      const soils = await Soil.scope('withoutDates').findAll();
      const cultivations = await Cultivation.scope('withoutDates').findAll();
      const farmings = await Farming.scope('withoutDates').findAll();
      const inventoryTypes = await InventoryType.findAll({ where: { isActive: true } });
      const machineryTypes = await MachineryType.findAll({ where: { isActive: true } });
      const cropTypes = await CropType.scope('withoutDates').findAll();
      let where = {
        isActive: true,
        [Op.or]: [
          { crop: { [Op.like]: `%${req.query.search || ""}%` } },
        ],
      };
      ActivityMaster.findAll({ where: where, order: [['id', 'DESC']] }).then(activities => {
        return res.send({ activities, irrigations, seasons, soils, cultivations, farmings, inventoryTypes, machineryTypes, cropTypes });
      }).catch(err => {
        console.log(err);
        return res.status(500).send({ message: 'Unknown error' });
      });
    } catch (err) {
      return res.status(500).send({ message: 'Unknown error' });
    }
  } else {
    return res.status(500).send({ message: 'You dont have the permissions to do this' });
  }
}
