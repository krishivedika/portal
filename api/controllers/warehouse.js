const Sequelize = require("sequelize");

const db = require("../models");

const Op = Sequelize.Op;
const User = db.user;
const Warehouse = db.warehouse;
const Inventory = db.inventory;

// Warehouse End Points
exports.warehouses = async (req, res) => {
  let where = {isActive: true};
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
    where = { ...where, UserId: { [Op.in]: users } };
  }
  include.push({model: User.scope("withoutPassword")});
  include.push({model: Inventory, required: false});
  try {
    const warehouses = await Warehouse.findAll({where: where, include: include});
    return res.status(200).send({ warehouses, csrUsers });
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

exports.addInventory = async (req, res) => {
  try {
    await Inventory.create({
      name: req.body.name,
      quantity: req.body.quantity,
      metric: req.body.metric,
      WarehouseId: req.body.warehouse
    });
    return res.status(200).send({
      message: "Inventory Created Successfully!",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  }
};
