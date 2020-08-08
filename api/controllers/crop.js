const Sequelize = require("sequelize");

const db = require("../models");
const { common } = require("../helpers");

const Op = Sequelize.Op;
const Farm = db.farm
const Crop = db.crop;
const CropType = db.cropType;
const User = db.user;

// Crop Record End Points
exports.cropTypes = (req, res) => {
  CropType.scope('withoutDates').findAll().then(cropTypes => {
    return res.status(200).send({ cropTypes: cropTypes });
  }).catch(err => {
    return res.status(500).send({ message: err.message });
  });
}

exports.cropRecords = async (req, res) => {
  let where = {};
  let include = []
  let csrUsers = [];
  let users = [];
  if (req.userRoleId === 5) {
    where = { ...where, userId: req.userId }
  }
  else {
    csrUsers = await User.scope("withoutPassword").findAll({
      where: { '$managedBy.UserAssociations.csrId$': req.userId },
      include: [
        {
          model: User, as: 'managedBy', through: 'UserAssociations',
          required: false,
        }
      ]
    });
    csrUsers.forEach(csr => {
      users.push(csr.id);
    });
    where = {...where, userId: { [Op.in]: users}};
    include.push({model: User});
  }

  Farm.findAll({
    where: where,
  }).then((farms) => {
    const farmIds = [];
    farms.forEach(f => farmIds.push(f.id));
    Crop.findAll({
      where: {farmId: {[Op.in]: farmIds}},
      include: [
        { model: Farm}
      ]
    }).then(crops => {
      if (!farms) {
        return res.status(404).send({ message: "No Crop Records exist" });
      }
      return res.status(200).send({ crops: crops, farms: farms });
    })
  }).catch((err) => {
    console.log(err);
    return res.status(500).send({ message: err.message });
  });
};

exports.addCropRecord = (req, res) => {
  let farmRecords = { ...req.body };
  farmRecords.crops.forEach(c => {
    c.isActive = true;
    c.FarmId = farmRecords.farmId;
  });
  Crop.findOne({where: {FarmId: farmRecords.farmId}}).then(crops => {
    if(crops) {
      return res.status(404).send({ message: "Farm already has crops", code: 2 });
    } else {
      Crop.bulkCreate(req.body.crops).then(() => {
        return res.status(200).send({
          message: "Crop Record Created Successfully!",
        });
      })
    }
  }).catch(() => {
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};

exports.updateCropRecord = (req, res) => {
  let farmRecords = { ...req.body };
  farmRecords.ownerAge = common.convertAgeToDate(req.body.ownerAge);
  Farm.findOne({
    where: {
      id: req.body.id,
    },
  }).then((farm) => {
    if (!farm) {
      return res.status(404).send({ message: "Crop Record doesn't exist" });
    }
    farm.update(farmRecords).then((farm) => {
      return res.send({ farm: farm });
    });
  }).catch(() => {
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};
