const Sequelize = require("sequelize");

const db = require("../models");

const Op = Sequelize.Op;
const User = db.user;
const Role = db.role;
const Warehouse = db.warehouse;
const Inventory = db.inventory;
const InventoryType = db.inventoryType;
const Machinery = db.machinery;
const MachineryType = db.machineryType;

// Warehouse End Points
exports.warehouses = async (req, res) => {
  let where = { isActive: true };
  let include = [];
  let csrUsers = [];
  let users = [];

  if (req.query.deleted === 'true') {
    cropWhere = {};
  }

  if (req.userRoleId === 5) {
    where = { ...where, UserId: req.userId }
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
  include.push({ model: User.scope("withoutPassword") });
  include.push({ model: Inventory, required: false });
  include.push({ model: Machinery, required: false });
  try {
    const warehouses = await Warehouse.findAll({ where: where, include: include });
    const inventories = await InventoryType.findAll({ where: { isActive: true } });
    const machineries = await MachineryType.findAll({ where: { isActive: true } });
    return res.status(200).send({ warehouses, csrUsers, inventories, machineries });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: err.message });
  };
}

exports.addWarehouse = async (req, res) => {
  try {
    let userId = req.userId;
    if (req.userRoleId !== 5) {
      userId = req.body.member;
    }
    const warehouse = await Warehouse.create({
      name: req.body.name,
      address: req.body.address,
      UserId: userId,
    });
    return res.status(200).send({
      message: "Warehouse Created Successfully!",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  }
};

exports.deleteWarehouse = async (req, res) => {
  Warehouse.findOne({
    where: {
      id: req.body.id,
      isActive: true,
    },
  }).then(async (warehouse) => {
    if (!warehouse) {
      return res.status(404).send({ message: "Warehouse doesn't exist" });
    }
    if ([3, 4].includes(req.userRoleId)) {
      const users = await User.scope("withoutPassword").findAll(
        {
          where: { '$managedBy.UserAssociations.csrId$': req.userId },
          include: [{ model: User.scope("withoutPassword"), as: 'managedBy', through: 'UserAssociations' }]
        });
      const csrUsers = users.map(x => x.id);
      if (!csrUsers.includes(warehouse.UserId)) {
        return res.status(404).send({ message: "You dont have the permission to delete this Warehouse" });
      }
    }
    else if (warehouse.UserId !== req.userId) {
      return res.status(404).send({ message: "You dont have the permission to delete this Warehouse" });
    }
    warehouse.update({ isActive: false }).then(() => {
      return res.send({ message: "Warehouse Successfully Deleted!" });
    });
  }).catch((err) => {
    console.log(err);
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};

exports.addInventory = async (req, res) => {
  Inventory.findOne({ where: { item: req.body.item, WarehouseId: req.body.warehouse } }).then(async inventory => {
    if (inventory) {
      inventory.update({ quantity: inventory.quantity + req.body.quantity }).then(() => {
        return res.status(200).send({
          message: "Inventory Updated Successfully!",
        });
      }).catch(err => {
        console.log(err);
        return res.status(500).send({ message: "Unknown Error", code: 2 });
      });
    } else {
      try {
        await Inventory.create({
          item: req.body.item,
          quantity: req.body.quantity,
          metric: req.body.metric,
          price: req.body.price,
          WarehouseId: req.body.warehouse,
        });
        return res.status(200).send({
          message: "Inventory Created Successfully!",
        });
      } catch (err) {
        console.log(err);
        return res.status(500).send({ message: "Unknown Error", code: 2 });
      }
    }
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });;
};

exports.editInventory = async (req, res) => {
  Inventory.findOne({ where: { id: req.body.id } }).then(async inventory => {
    if (inventory) {
      inventory.update({ quantity: req.body.quantity }).then(() => {
        return res.status(200).send({
          message: "Inventory Updated Successfully!",
        });
      }).catch(err => {
        console.log(err);
        return res.status(500).send({ message: "Unknown Error", code: 2 });
      });
    }
  });
};

exports.addMachinery = async (req, res) => {
  Machinery.findOne({ where: { item: req.body.item, WarehouseId: req.body.warehouse } }).then(async machinery => {
    if (machinery) {
      machinery.update({ quantity: machinery.quantity + req.body.quantity }).then(() => {
        return res.status(200).send({
          message: "Machinery Updated Successfully!",
        });
      }).catch(err => {
        console.log(err);
        return res.status(500).send({ message: "Unknown Error", code: 2 });
      });
    } else {
      try {
        await Machinery.create({
          item: req.body.item,
          quantity: req.body.quantity,
          details: req.body.details,
          price: req.body.price,
          date: req.body.date,
          manufacturer: req.body.manufacturer,
          WarehouseId: req.body.warehouse
        });
        return res.status(200).send({
          message: "Machinery Created Successfully!",
        });
      } catch (err) {
        console.log(err);
        return res.status(500).send({ message: "Unknown Error", code: 2 });
      }
    }
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });;
};

exports.editMachinery = async (req, res) => {
  Machinery.findOne({ where: { id: req.body.id } }).then(async machinery => {
    if (machinery) {
      machinery.update({ quantity: req.body.quantity, details: req.body.details }).then(() => {
        return res.status(200).send({
          message: "Machinery Updated Successfully!",
        });
      }).catch(err => {
        console.log(err);
        return res.status(500).send({ message: "Unknown Error", code: 2 });
      });
    }
  });
};
