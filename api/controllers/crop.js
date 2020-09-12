const Sequelize = require("sequelize");

const db = require("../models");

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
const Practice = db.practice;
const InventoryType = db.inventoryType;
const Warehouse = db.warehouse;
const Inventory = db.inventory;
const Machinery = db.machinery;
const MachineryType = db.machineryType;
const Activity = db.activity;

// Crop Record End Points
exports.cropTypes = async (req, res) => {
  try {
    const cropTypes = await CropType.scope('withoutDates').findAll();
    const seeds = await Seed.scope('withoutDates').findAll();
    const brands = await Brand.scope('withoutDates').findAll();
    const irrigations = await Irrigation.scope('withoutDates').findAll();
    return res.status(200).send({ cropTypes, seeds, brands, irrigations });
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
    layerWhere = {};
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
  const farm = await Farm.findOne({where: {id: req.body.farm, isActive: true}});
  Crop.findOne({ where: { isActive: true, name: req.body.plot, FarmId: req.body.farm } }).then(async (crop) => {
    if (crop) {
      Layer.findOne({ where: { CropId: crop.id, isActive: true, name: req.body.layer } }).then(layer => {
        if (layer) return res.status(404).send({ message: "Crop in this Plot and Layer is already active", code: 2 });
      })
    }
    const size = JSON.parse(farm.partitions).partitions.filter(p => p.item == req.body.plot)[0].area;
    try {
      if (!crop) {
        crop = await Crop.create({ FarmId: farm.id, size: size, name: req.body.plot });
      }
      const practice = await Practice.findOne({ where: { seed: req.body.seed, brand: req.body.brand, irrigation: req.body.irrigation } });
      const inventoryTypes = await InventoryType.findAll({ where: { isActive: true } });
      const machineryTypes = await MachineryType.findAll({ where: { isActive: true } });
      const activity = await Activity.findAll({ where: { isActive: true } });
      const inventoryTypesObj = {};
      inventoryTypes.forEach(i => {
        inventoryTypesObj[i.item] = i.price;
      });
      const machineryTypesObj = {};
      machineryTypes.forEach(i => {
        machineryTypesObj[i.item] = i.price;
      });
      const activityObj = {};
      activity.forEach(i => {
        activityObj[i.name] = {man_price: i.man_price, woman_price: i.woman_price};
      });

      let price = 0;
      let machineryPrice = 0;
      let practiceCalculated = undefined;
      if (practice) {
        let stages = JSON.parse(practice.config).stages;
        let farmSize = 0;
        JSON.parse(farm.partitions).partitions.forEach(p => {
          if (p.item == req.body.plot) {
            farmSize = p.area;
          }
        });
        stages.forEach(s => {
          if (s.inventory) {
            s.inventory.quantity = parseInt(s.inventory.quantity * farmSize);
          }
        });
        stages.forEach(s => {
          if (s.inventory) {
            price += inventoryTypesObj[s.inventory.name] * s.inventory.quantity;
          }
          if (s.machinery) {
            machineryPrice += machineryTypesObj[s.machinery.name] * s.machinery.quantity;
          }
          let man_activity = activityObj[s.activity];
          s.man_price = man_activity || 1;
          let woman_activity = activityObj[s.activity];
          s.woman_price = woman_activity || 1;
        });
        practiceCalculated = JSON.stringify({stages: stages});
      }
      await Layer.create({
        CropId: crop.id,
        name: req.body.layer,
        crop: req.body.crop,
        seed: req.body.seed,
        brand: req.body.brand,
        irrigation: req.body.irrigation,
        date: req.body.date,
        config: practiceCalculated ? practiceCalculated : null,
        price: price,
        machineryPrice: machineryPrice,
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

exports.editLayerRecord = (req, res) => {
  Layer.findOne({ where: { isActive: true, id: req.body.id }}).then(async (layer) => {
    if (!layer) {
      return res.status(404).send({ message: "Crop does not exist", code: 2 });
    }
    layer.update({...req.body}).then(() => {
      return res.send({message: 'Successfully updated crop'});
    });
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
    else if (crop.Farm.User.id !== req.userId) {
      return res.status(404).send({ message: "You dont have the permission to delete this Crop" });
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
      else if (layer.Crop.Farm.User.id !== req.userId) {
        return res.status(404).send({ message: "You dont have the permission to get this Crop" });
      }
      const inventories = await Inventory.findAll({ where: { WarehouseId: { [Op.in]: layer.Crop.Farm.Warehouses.map(x => x.id) } } });
      const inventoryTypes = await InventoryType.findAll({ where: { isActive: true} });
      const machinery = await Machinery.findAll({ where: { WarehouseId: { [Op.in]: layer.Crop.Farm.Warehouses.map(x => x.id) } } });
      const machineryTypes = await MachineryType.findAll({ where: { isActive: true} });
      return res.send({ layer: layer, machinery, inventories, inventoryTypes, machineryTypes });
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: 'Unknown error' });
    });
}

exports.updateLayerRecord = (req, res) => {
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
      else if (layer.Crop.Farm.User.id !== req.userId) {
        return res.status(404).send({ message: "You dont have the permission to update this Crop" });
      }
      console.log(req.body);
      const currentConfig = JSON.parse(layer.config);
      let selectedLayer = {};
      currentConfig.stages.forEach((layer, index) => {
        if (layer.id === req.body.stageId) {
          selectedLayer = layer;
          if (req.body.labour) {
            layer["man_labour"] = req.body.man;
            layer["woman_labour"] = req.body.woman;
          }
          layer["extra_cost"] = req.body.extra_cost;
          if (req.body.machinery) {
            layer["machinery_rent"] = req.body.machinery_rent;
            layer["machinery_fuel"] = req.body.machinery_fuel;
            layer["machinery_man_power"] = req.body.machinery_man_power;
          }
          if (layer.state !== "presowing") {
            if (req.body.complete) {
              layer.current = false;
              layer.completed = true;
              if (index !== (currentConfig.stages.length - 1)) {
                currentConfig.stages[index + 1].current = true;
              }
            }
          }
        }
      });
      let values = { config: JSON.stringify(currentConfig), isStarted: true };
      layer.update(values).then(async l => {
        const inventoryTypes = await InventoryType.findAll({ where: { isActive: true} });
        const machineryTypes = await MachineryType.findAll({ where: { isActive: true} });
        let inventories = machinery = [];
        if (layer.Crop.Farm.Warehouses) {
          inventories = await Inventory.findAll({ where: { WarehouseId: { [Op.in]: layer.Crop.Farm.Warehouses.map(x => x.id) } } });
          machinery = await Machinery.findAll({ where: { WarehouseId: { [Op.in]: layer.Crop.Farm.Warehouses.map(x => x.id) } } });
        }
        if (req.body.confirm) {
          Inventory.findOne({ where: { id: req.body.inventoryId } }).then(async i => {
            if (!i) {
              return res.send({ message: 'Successfully Updated Activity', layer: l, inventories, machinery, inventoryTypes, machineryTypes });
            }
            let quantity = 0;
            if (i.quantity > selectedLayer.inventory.quantity) {
              quantity = i.quantity - selectedLayer.inventory.quantity;
            }
            i.update({ quantity: quantity }).then(() => {
              return res.send({ message: 'Successfully Updated Activity and Inventory', layer: l, inventories, machinery, inventoryTypes, machineryTypes });
            })
          }).catch(err => {
            console.log(err);
            return res.status(500).send({ message: 'Unknown error' });
          })
        } else {
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
      else if (layer.Crop.Farm.User.id !== req.userId) {
        return res.status(404).send({ message: "You dont have the permission to delete this Layer Crop" });
      }
      layer.update({ isActive: false }).then(async l => {
        return res.send({ message: 'Successfully Deleted Layer' });
      }).catch(err => {
        console.log(err);
        return res.status(500).send({ message: 'Unknown error' });
      })
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: 'Unknown error' });
    });
}
