const Sequelize = require("sequelize");

const db = require("../models");
const warehouseFarm = require("../models/warehouseFarm");

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
  let include = []
  let csrUsers = [];
  let users = [];

  if (req.query.deleted === 'true') {
    cropWhere = {};
  }

  if (req.userRoleId === 5) {
    where = { ...where, userId: req.userId }
  }
  else {
    if (req.userRoleId === 2) {
      csrUsers = await User.scope("withoutPassword").findAll({
        where: {'$Roles.UserRoles.roleId$': {[Op.in]: [5]}},
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
      where = {...where, userId: { [Op.in]: users}};
      include.push({model: User.scope("withoutPassword")});
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
      where = {...where, userId: { [Op.in]: users}};
      include.push({model: User.scope("withoutPassword")});
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
        { model: Layer, required: false },
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

exports.addCropRecord = (req, res) => {
  Crop.findOne({ where: { isActive: true, name: req.body.plot, FarmId: req.body.farm } }).then(async (crop) => {
    if (crop) {
      Layer.findOne({ where: { CropId: crop.id, isActive: true, name: req.body.layer } }).then(layer => {
        if (layer) return res.status(404).send({ message: "Crop in this Plot and Layer is already active", code: 2 });
      })
    }
    try {
      if (!crop) {
        crop = await Crop.create({ FarmId: req.body.farm, name: req.body.plot });
      }
      const practice = await Practice.findOne({ where: { seed: req.body.seed, brand: req.body.brand, irrigation: req.body.irrigation } });
      const inventoryTypes = await InventoryType.findAll({where: {isActive: true}});
      const machineryTypes = await MachineryType.findAll({where: {isActive: true}});
      const inventoryTypesObj = {};
      inventoryTypes.forEach(i => {
        inventoryTypesObj[i.item] = i.price;
      });
      const machineryTypesObj = {};
      machineryTypes.forEach(i => {
        machineryTypesObj[i.item] = i.price;
      });
      let price = 0;
      let machineryPrice = 0;
      if (practice) {
        const stages = JSON.parse(practice.config).stages;
        stages.forEach(s => {
          if (s.inventory) {
            price += inventoryTypesObj[s.inventory.name] * s.inventory.quantity;
          }
          if (s.machinery) {
            machineryPrice += machineryTypesObj[s.machinery.name] * s.machinery.quantity;
          }
        });
      }
      await Layer.create({
        CropId: crop.id,
        name: req.body.layer,
        crop: req.body.crop,
        seed: req.body.seed,
        brand: req.body.brand,
        irrigation: req.body.irrigation,
        date: req.body.date,
        config: practice ? practice.config : null,
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

exports.restoreCropRecord = (req, res) => {
  Crop.findOne({ where: { isActive: true, name: req.body.plot, FarmId: req.body.farm } }).then(async (crop) => {
    if (crop) {
        return res.status(404).send({ message: "Crop already currently active, cannot restore", code: 2 });
    } else {
      Crop.findOne({where: {id: req.body.id}}).then(restoreCrop => {
        restoreCrop.update({isActive: true}).then(() => {
          return res.send({ message: "Successfully restored crop"})
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
      const inventories = await Inventory.findAll({where: {WarehouseId: {[Op.in]: layer.Crop.Farm.Warehouses.map(x => x.id)}}});
      const machinery = await Machinery.findAll({where: {WarehouseId: {[Op.in]: layer.Crop.Farm.Warehouses.map(x => x.id)}}});
      return res.send({ layer: layer, machinery, inventories });
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
          return res.status(404).send({ message: "You dont have the permission to update this Crop" });
        }
      }
      else if (layer.Crop.Farm.User.id !== req.userId) {
        return res.status(404).send({ message: "You dont have the permission to update this Crop" });
      }
      const currentConfig = JSON.parse(layer.config);
      let selectedLayer = {};
      currentConfig.stages.forEach((layer, index) => {
        if (layer.id === req.body.stageId) {
          selectedLayer = layer;
          layer.completed = true;
          if (layer.state !== "presowing") {
            layer.current = false;
            if (index !== (currentConfig.stages.length - 1)) {
              currentConfig.stages[index + 1].current = true;
            }
          }
        }
      });
      layer.update({ config: JSON.stringify(currentConfig) }).then(l => {
        if (req.body.confirm) {
          Inventory.findOne({where: {id: req.body.inventoryId}}).then(i => {
            if (!i) {
              return res.send({ message: 'Successfully Updated Activity', layer: l });
            }
            let quantity = 0;
            if (i.quantity > selectedLayer.inventory.quantity) {
              quantity = i.quantity - selectedLayer.inventory.quantity;
            }
            i.update({quantity: quantity}).then(() => {
              return res.send({ message: 'Successfully Updated Activity and Inventory', layer: l });
            })
          }).catch(err => {
            console.log(err);
            return res.status(500).send({message: 'Unknown error'});
          })
        } else {
          return res.send({ message: 'Successfully Updated Activity', layer: l });
        }
      });
    }).catch(err => {
      console.log(err);
      return res.status(500).send({message: 'Unknown error'});
    });
}
