const Sequelize = require("sequelize");

const db = require("../models");
const { storage } = require("../utils");
const config = require("../config");
const { common } = require("../helpers");

const Op = Sequelize.Op;
const Farm = db.farm;
const User = db.user;
const Role = db.role;
const Survey = db.survey;
const SurveyFile = db.surveyFile;
const WarehouseFarm = db.warehouseFarm;
const Warehouse = db.warehouse;

// Farm Record End Points
exports.farmRecords = async (req, res) => {
  let where = {
    [Op.or]: [
      { name: { [Op.like]: `%${req.query.search}%` } },
    ],
  };

  let surveyWhere = {};
  if (req.query.deleted !== 'true') {
    where = {...where, isActive: true};
    surveyWhere = {...surveyWhere, isActive: true};
  }

  let include = [
    {
      model: Warehouse,
      required: false,
      where: { isActive: true },
    },
    {
      model: Survey,
      required: false,
      where: surveyWhere,
      include: [{ model: SurveyFile, where: { isActive: true }, required: false }],
    },
    {
      model: User.scope("withoutPassword"),
    }
  ]
  let csrUsers = [];
  let users = [];
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
    include: include,
    order: [['id', 'DESC']],
  }).then((farms) => {
    if (!farms) {
      return res.status(404).send({ message: "No Farm Records exist" });
    }
    return res.status(200).send({ farms: farms, csrUsers: csrUsers });
  }).catch((err) => {
    console.log(err);
    return res.status(500).send({ message: err.message });
  });

};

exports.addFarmRecord = (req, res) => {
  let farmRecords = { ...req.body };
  farmRecords.isActive = true;
  farmRecords.userId = req.userId;
  farmRecords.ownerAge = common.convertAgeToDate(req.body.ownerAge);
  farmRecords.partitions = JSON.stringify({ partitions: [{ item: 'Plot 1', area: 0 }] });
  let userId = 0;
  if (req.userRoleId === 5) userId = req.userId;
  else userId = req.body.member;
  farmRecords.userId = userId;
  Farm.findOne({ where: { name: farmRecords.name, userId: userId, isActive: true } }).then(farm => {
    if (farm) {
      return res.status(404).send({ message: "Farm with same name already exists" });
    }
    Farm.create(farmRecords).then(farm => {
      if (farmRecords.warehouse) {
        WarehouseFarm.create({FarmId: farm.id, WarehouseId: farmRecords.warehouse}, {fields: ['FarmId', 'WarehouseId']}).then(() => {
          return res.status(200).send({
            message: "Farm Record Created Successfully!",
          });
        });
      }
      else {
        return res.status(200).send({
          message: "Farm Record Created Successfully!",
        });
      }
    })
  }).catch(() => {
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};

exports.updateFarmRecord = (req, res) => {
  let farmRecords = { ...req.body };
  farmRecords.ownerAge = common.convertAgeToDate(req.body.ownerAge);
  Farm.findOne({
    where: {
      id: req.body.id,
    },
  }).then((farm) => {
    if (!farm) {
      return res.status(404).send({ message: "Farm Record doesn't exist" });
    }
    farm.update(farmRecords).then((farm) => {
      return res.send({ farm: farm });
    });
  }).catch(() => {
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};

exports.restoreFarmRecord = (req, res) => {
  Farm.findOne({
    where: {
      id: req.body.id,
    },
  }).then((farm) => {
    if (!farm) {
      return res.status(404).send({ message: "Farm Record doesn't exist" });
    }
    Farm.findAll({where: {name: farm.name, userId: farm.userId, isActive: true}}).then(farms => {
      if (farms.length > 0) {
        return res.status(404).send({ message: "Farm with same name already exists" });
      } else {
        farm.update({ isActive: true }).then((farm) => {
          return res.send({ message: "Successfully restored farm" });
        });
      }
    })
  }).catch(() => {
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};

exports.partitionFarmRecord = (req, res) => {
  let farmRecords = { ...req.body };
  Farm.findOne({
    where: {
      id: req.body.id,
    },
  }).then((farm) => {
    if (!farm) {
      return res.status(404).send({ message: "Farm Record doesn't exist" });
    }
    let partitions = [];
    Object.entries(farmRecords.partitions).forEach(entry => {
      partitions.push({ item: entry[0], area: entry[1].toFixed(4) });
    });
    farm.update({ partitions: JSON.stringify({ partitions: partitions }) }).then((farm) => {
      return res.send({ farm: farm });
    });
  }).catch(() => {
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
}

exports.deleteFarmRecord = async (req, res) => {
  Farm.findOne({
    where: {
      id: req.params.id,
    },
  }).then(async (farm) => {
    if (!farm) {
      return res.status(404).send({ message: "Farm Record doesn't exist" });
    }
    if ([3,4].includes(req.userRoleId)) {
      const users = await User.scope("withoutPassword").findAll(
        {where: {'$managedBy.UserAssociations.csrId$': req.userId},
        include: [{model: User.scope("withoutPassword"), as: 'managedBy', through: 'UserAssociations'}]
      });
      const csrUsers = users.map(x => x.id);
      if (!csrUsers.includes(farm.userId)) {
        return res.status(404).send({ message: "You dont have the permission to delete this Farm" });
      }
    }
    else if (farm.userId !== req.userId) {
      return res.status(404).send({ message: "You dont have the permission to delete this Farm" });
    }
    farm.update({ isActive: false }).then(() => {
      return res.send({ message: "Farm Record Successfully Deleted!" });
    });
  }).catch((err) => {
    console.log(err);
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};

// Survey Endpoints

exports.surveys = (req, res) => {
  Survey.findAll({
    where: {
      FarmId: req.params.FarmId,
      isActive: true,
    },
    include: [{ model: SurveyFile, where: { isActive: true } }],
    order: [['id', 'DESC']]
  }).then((surveys) => {
    if (!surveys) {
      return res.status(404).send({ message: "No Survey Records exist" });
    }
    return res.status(200).send({
      surveys: surveys,
    });
  }).catch((err) => {
    console.log(err);
    return res.status(500).send({ message: err.message });
  });
};

exports.addSurveyRecord = (req, res) => {
  let surveyRecord = { ...req.body };
  surveyRecord.isActive = true;
  surveyRecord.extent = surveyRecord.extent.toFixed(4);
  Farm.findOne({ where: { id: surveyRecord.FarmId } }).then(farm => {
    Farm.findAll({ where: { panchayat: farm.panchayat }, include: [{ model: Survey }] }).then(farms => {
      let isSurvey = false;
      farms.forEach(f => {
        f.Surveys.forEach(s => {
          if (s.number === surveyRecord.number && s.subdivision === surveyRecord.subdivision) {
            isSurvey = true;
          }
        });
      });
      if (isSurvey) {
        return res.status(404).send({ message: "Survey and Subdivision already exist in this village" });
      } else {
        Survey.create(surveyRecord).then(() => {
          return res.status(200).send({
            message: "Survey Created Successfully!",
          });
        })
      }
    });
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};

exports.updateSurveyRecord = (req, res) => {
  let surveyRecord = { ...req.body };
  surveyRecord.extent = surveyRecord.extent.toFixed(4);
  Survey.findOne({
    where: {
      id: req.body.id,
    },
  }).then((survey) => {
  Farm.findOne({ where: { id: surveyRecord.FarmId } }).then(farm => {
    Farm.findAll({ where: { panchayat: farm.panchayat }, include: [{ model: Survey }] }).then(farms => {
      let isSurvey = false;
      farms.forEach(f => {
        f.Surveys.forEach(s => {
          if (s.number === surveyRecord.number && s.subdivision === surveyRecord.subdivision && s.id !== survey.id) {
            isSurvey = true;
          }
        });
      });
      if (isSurvey) {
        return res.status(404).send({ message: "Survey and Subdivision already exist in this village" });
      } else {
          if (!survey) {
            return res.status(404).send({ message: "Survey Record not found" });
          }
          survey.update(surveyRecord).then(() => {
            return res.status(200).send({ message: "Survey Updated Successfully" });
          }).catch(err => {
            console.log(err);
            return res.status(500).send({ message: "Unknown Error", code: 2 });
          });;
        }
      })
    });
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};

exports.deleteSurveyRecord = (req, res) => {
  Survey.findOne({
    where: {
      id: req.body.id,
    },
    include: [
      {model: Farm, required: false, include: [{model: User}]},
    ]
  }).then(async (survey) => {
    if (!survey) {
      return res.status(404).send({ message: "Survey Record doesn't exist" });
    }
    if ([3,4].includes(req.userRoleId)) {
      const users = await User.scope("withoutPassword").findAll(
        {where: {'$managedBy.UserAssociations.csrId$': req.userId},
        include: [{model: User.scope("withoutPassword"), as: 'managedBy', through: 'UserAssociations'}]
      });
      const csrUsers = users.map(x => x.id);
      if (!csrUsers.includes(survey.Farm.User.id)) {
        return res.status(404).send({ message: "You dont have the permission to delete this Farm" });
      }
    }
    else if (survey.Farm.User.id !== req.userId) {
      console.log(survey.Farm.User.id);
      return res.status(404).send({ message: "You dont have the permission to delete this Farm" });
    }
    survey.update({ isActive: false }).then(() => {
      return res.send({ message: "Survey Record Successfully Deleted!" });
    });
  }).catch((err) => {
    console.log(err);
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};

exports.fileUpload = (req, res) => {
  const surveyContainer = config.STORAGE_ACCOUNT_SURVEYS;
  try {
    const path = `${req.body.survey}/${req.file.originalname}`;
    const fileName = req.file.originalname;
    storage.fileUpload(surveyContainer, path, req.file.buffer, req.file.buffer.length, (error, response, result) => {
      if (!error) {
        const surveyFileObj = {
          path: path,
          SurveyId: req.body.survey,
          isActive: true,
          filename: fileName,
          filetype: fileName.split('.').pop(),
        }
        SurveyFile.create(surveyFileObj).then(surveyFile => {
          Survey.findAll(
            {where: {id: req.body.survey, isActive: true},
            include: [{model: SurveyFile, required: false, where: {isActive: true}}]
            }
            ).then(surveyFiles => {
            return res.status(200).send({surveyFiles});
          })
        }).catch(err => {
          console.log(err);
          return res.status(500).send({ message: err.message });
        });
      } else {
        return res.status(400).send({ message: 'Unable to update field' });
      }
    });
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: err.message });
  }
};

exports.deleteUpload = (req, res) => {
  SurveyFile.findOne({
    where: {
      id: req.body.survey,
      isActive: true,
    },
  }).then((surveyFile) => {
    if (!surveyFile) {
      return res.status(404).send({ message: "Survey File doesn't exist" });
    }
    surveyFile.update({ isActive: false }).then(() => {
      return res.send({ message: "Survey File Successfully Deleted!" });
    });
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};
