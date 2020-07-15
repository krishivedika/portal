const Sequelize = require("sequelize");
const bcrypt = require("bcryptjs");

const db = require("../models");
const constants = require("../constants");
const config = require("../config");

const Op = Sequelize.Op;
const User = db.user;
const Role = db.role;
const Farm = db.farm;
const Survey = db.survey;

exports.user = (req, res) => {
  User.scope("withoutPassword")
    .findOne({
      where: {
        id: req.query.id,
      },
      include: [
        {
          model: Role,
        },
      ],
    })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "No User exists" });
      }
      res.status(200).send({
        user: user,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message: err.message });
    });
};

exports.users = (req, res) => {
  let where = {
    [Op.or]: [
      { email: { [Op.like]: `%${req.query.search}%` } },
      { phone: { [Op.like]: `%${req.query.search}%` } },
    ],
  };
  if (req.query.isOnboarded === "true") {
    where = {
      [Op.or]: [
        { email: { [Op.like]: `%${req.query.search}%` } },
        { phone: { [Op.like]: `%${req.query.search}%` } },
      ],
      [Op.and]: [{ isOnboarded: false }],
    };
  }

  User.scope("withoutPassword")
    .findAll({
      where: where,
      include: [
        {
          model: Role,
        },
      ],
    })
    .then((users) => {
      if (!users) {
        return res.status(404).send({ message: "No Users exist" });
      }
      let customisedUsers = [];
      users.forEach((user) => {
        customisedUsers.push({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          email: user.email,
          roles: user.Roles,
          isOnboarded: user.isOnboarded,
          createdAt: user.createdAt,
          updateAt: user.updateAt,
          updatedBy: user.updatedBy,
          isActive: user.isActive,
          ration: user.ration,
          mandala: user.mandala,
          district: user.district,
          hamlet: user.hamlet,
          panchayat: user.panchayat,
          address: user.address,
          age: user.age,
          gender: user.gender,
        });
      });
      res.status(200).send({
        users: customisedUsers,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message: err.message });
    });
};

exports.onBoardMember = async (req, res) => {
  User.scope("withoutPassword")
    .findByPk(req.body.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "No Users exist" });
      }
      let updatedValues = { ...req.body };
      const dateNow = new Date();
      dateNow.setFullYear(dateNow.getFullYear() - updatedValues.age);
      dateNow.setMonth(0);
      dateNow.setDate(1);
      updatedValues.age = dateNow;

      User.findOne({
        where: req.userId,
      }).then((admin) => {
        updatedValues.updatedBy = admin.email;
        updatedValues.isOnboarded = true;
        user.update(updatedValues).then(() => {
          user.setRoles([5]).then(() => {
            return res.status(200).send({
              user: user,
            });
          });
        });
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message: err.message });
    });
};

exports.updateMember = (req, res) => {
  User.scope("withoutPassword")
    .findOne({
      where: {
        id: req.body.id,
      },
      include: [
        {
          model: Role,
        },
      ],
    })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found" });
      }
      let updatedValues = { ...req.body };
      const dateNow = new Date();
      dateNow.setFullYear(dateNow.getFullYear() - updatedValues.age);
      dateNow.setMonth(0);
      dateNow.setDate(1);
      updatedValues.age = dateNow;

      let roleId;
      Object.keys(constants.ROLES).forEach((key) => {
        if (constants.ROLES[key].name === req.body.role) {
          roleId = constants.ROLES[key].id;
        }
      });
      console.log(user);
      if (user.Roles[0].name === "farmer" && user.Roles[0].id !== roleId) {
        updatedValues.password = bcrypt.hashSync(
          config.DEFAULT_STAFF_PASSWORD,
          8
        );
      }
      user.update(updatedValues).then((user) => {
        user.setRoles([roleId]).then(() => {
          return res.send({ user: user });
        });
      });
    })
    .catch((err) => {
      return res.status(500).send({ message: err.message });
    });
};

// Farm Record End Points
exports.addFarmRecord = (req, res) => {

  let farmRecords = { ...req.body };

  Farm.create(farmRecords)
    .then(() => {
      return res.status(200).send({
        message: "Farm Record Created Successfully!",
      });
    })
    .catch(() => {
      res.status(500).send({ message: "Unknown Error", code: 2 });
    });
};

exports.updateFarmRecord = (req, res) => {
  let farmRecords = { ...req.body };
  Farm.findOne({
    where: {
      id: req.body.id
    }
  })
  .then((farm) => {
    if(!farm){
      res.status(404).send({message: "Farm Record doesn't exist"})
    }
    farm.update(farmRecords)
    .then((farm) => {
      return res.send({ farm: farm });
    })
  })
  .catch(() => {
    res.status(500).send({ message: "Unknown Error", code: 2 });
  });  
};

exports.farmRecords = (req, res) => {
  let where = {
    [Op.or]: [
      { name: { [Op.like]: `%${req.query.search}%` } },
      { streetAddress: { [Op.like]: `%${req.query.search}%` } },
    ],
  };
  Farm.findAll({
    where: where
  })
    .then((farms) => {
      if (!farms) {
        return res.status(404).send({ message: "No Farm Records exist" });
      }
      let customisedRecords = [];
      farms.forEach((farm) => {
        customisedRecords.push({
          id: farm.id,
          name: farm.name,
          streetAddress: farm.streetAddress,
          state: farm.state,
          district: farm.district,
          mandala: farm.mandala,
          panchayat: farm.panchayat,
          surveys: farm.Surveys,
          createdAt: farm.createdAt,
          updateAt: farm.updateAt,
        });
      });
      res.status(200).send({
        farms: customisedRecords,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message: err.message });
    });
};

// Survey Endpoints
exports.addSurveyRecord = (req, res) => {
  let surveyRecords = { ...req.body };

  Survey.create(surveyRecords)
    .then(() => {
      return res.status(200).send({
        message: "Survey Created Successfully!",
      });
    })
    .catch(() => {
      res.status(500).send({ message: "Unknown Error", code: 2 });
    });
};

exports.surveys = (req, res) => {
  Survey.findAll({
    where: {
      FarmId: req.params.FarmId
    }
  })
    .then((surveys) => {
      if (!surveys) {
        return res.status(404).send({ message: "No Survey Records exist" });
      }
      let customisedRecords = [];
      surveys.forEach((survey) => {
        customisedRecords.push({
          id: survey.id,
          farmId: survey.FarmId, 
          name: survey.name,
          subdivision: survey.subdivision,
          extent: survey.extent,
          link: survey.link,
          comment: survey.comment,
          createdAt: survey.createdAt,
          updateAt: survey.updatedAt,
        });
      });
      res.status(200).send({
        surveys: customisedRecords,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message: err.message });
    });
};

exports.updateSurveyRecord = (req, res) => {
  let surveyRecords = { ...req.body };
  Survey.findOne({
    where: {
      id: req.body.id
    }
  })
  .then((survey) => {
    if(!survey) {
      res.status(404).send({message: "Survey Record not found"});
    }
    survey.update(surveyRecords).then((survey) => {
      res.status(200).send({message: "Survey Updated Successfully"})
    })
    .catch(() => {
      res.status(500).send({ message: "Unknown Error", code: 2 });
    });
  })
};
