const Sequelize = require("sequelize");

const db = require("../models");
const constants = require("../../constants");

const Op = Sequelize.Op;
const User = db.user;
const Role = db.role;

exports.user = (req, res) => {
  User.scope('withoutPassword').findOne({
    where: {
      id: req.query.id,
    },
    include: [{
      model: Role,
    }]
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "No User exists." });
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
  User.scope('withoutPassword').findAll({
    where: {
      [Op.or]: [
        { email: { [Op.like]: `%${req.query.search}%` } },
        { phone: { [Op.like]: `%${req.query.search}%` } },
      ]
    },
    include: [{
      model: Role,
    }]
  })
    .then((users) => {
      if (!users) {
        return res.status(404).send({ message: "No Users exist." });
      }
      let customisedUsers = [];
      users.forEach(user => {
        customisedUsers.push(
          {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            email: user.email,
            roles: user.roles,
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
          }
        );
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
  User.scope('withoutPassword').findByPk(req.body.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "No Users exist." });
      }
      let updatedValues = { ...req.body };
      User.findOne({
        where: req.userId
      }).then(admin => {
        updatedValues.updatedBy = admin.email;
        updatedValues.isOnboarded = true;
        user.update(updatedValues).then(() => {
          user.setRoles([5]).then(() => {
            return res.status(200).send({
              user: user,
            });
          });
        })
      })
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message: err.message });
    });
};

exports.updateMember = (req, res) => {
  User.scope('withoutPassword').findOne({
    where: {
      id: req.body.id,
    },
    include: [{
      model: Role,
    }]
  }).then((user) => {
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }
    let updatedValues = { ...req.body };
    let role, roleId;
    Object.keys(constants.ROLES).forEach(key => {
      if (constants.ROLES[key].name === req.body.role) {
        role = constants.ROLES[key].name;
        roleId = constants.ROLES[key].id;
      }
    });
    user.update(updatedValues).then((user) => {
      user.setRoles([roleId]).then(u => {
        return res.send({ user: u });
      })
    });
  })
    .catch((err) => {
      return res.status(500).send({ message: err.message });
    });
};
