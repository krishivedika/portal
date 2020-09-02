const Sequelize = require("sequelize");
const bcrypt = require("bcryptjs");
const csv = require('csv-parser');
const { Readable } = require("stream");

const db = require("../models");
const constants = require("../constants");
const config = require("../config");
const { common, user } = require("../helpers");

const Op = Sequelize.Op;
const User = db.user;
const Role = db.role;
const UserRole = db.userRole;
const UserAssociation = db.userAssociation;

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
    where = { ...where, [Op.and]: [{ isOnboarded: false }] };
  }

  if ([3, 4].includes(req.userRoleId)) {
    where = { ...where,
      [Op.or]: [
        {'$managedBy.UserAssociations.csrId$': req.userId },
        {id: req.userId},
      ]};
  }
  User.scope("withoutPassword")
    .findAll({
      where: where,
      include: [
        {
          model: Role,
          where: { id: { [Op.gte]: req.userRoleId } },
        },
        {
          model: User.scope("withoutPassword"), as: 'managedBy', through: 'UserAssociations',
          required: false,
        },
      ],
    })
    .then((users) => {
      if (!users) {
        return res.status(404).send({ message: "No Users exist" });
      }
      User.scope("withoutPassword").findAll(
        {where: {'$Roles.UserRoles.roleId$': {[Op.in]: [3,4]}},
        include: [{model: Role, through: 'UserRoles'}]
      }).then(csrUsers => {
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
            managedBy: user.managedBy,
          });
        });
        return res.status(200).send({
          users: customisedUsers,
          csrUsers,
        });
      })
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message: err.message });
    });
};

exports.onBoardMember = async (req, res) => {
  User.scope("withoutPassword")
    .findByPk(req.body.id, {
      include: [
        {
          model: Role,
          where: { id: { [Op.gte]: req.userRoleId } },
        },
        {
          model: User.scope("withoutPassword"), through: 'UserAssociations', as: 'managedBy'
        },
      ],
    })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "No Users exist" });
      }
      let updatedValues = { ...req.body };
      updatedValues.age = common.convertAgeToDate(updatedValues.age);
      User.findOne({
        where: req.userId,
      }).then((admin) => {
        updatedValues.updatedBy = admin.email;
        updatedValues.isOnboarded = true;

        let roleId;
        Object.keys(constants.ROLES).forEach((key) => {
          if (constants.ROLES[key].name === req.body.role) {
            roleId = constants.ROLES[key].id;
          }
        });
        if (roleId !== 5) {
          updatedValues.password = bcrypt.hashSync(
            config.DEFAULT_STAFF_PASSWORD,
            8
          );
        }
        user.update(updatedValues).then(() => {
          user.setManagedBy([req.body.csr]).then(() => {
            user.setRoles([roleId]).then(() => {
              return res.status(200).send({
                user: user,
              });
            })
          });
        });
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message: err.message });
    });
};

exports.bulkOnboardPrep = async (req, res) => {
  try {
    const buffer = new Buffer(req.file.buffer);
    const readable = new Readable();
    const entries = [];
    let badEntries = [];
    readable._read = () => {};
    readable.push(buffer)
    readable.push(null)
    readable.pipe(csv())
    .on('data', (row) => {
      entries.push(row);
    })
    .on('end', async () => {
      let valid = true;
      entries.forEach(e => {
        console.log(e);
        if (Object.keys(e).length !== 9) valid = false;
      });
      if (!valid) {
        return res.status(404).send({message: 'Malformed CSV structure'});
      }
      const tempUsers = await user.findInvalidRows(entries);
      badEntries = [...tempUsers.badEntries];
      return res.status(200).send({entries: entries.length, badEntries: badEntries.length, csvData: badEntries});
    });
  } catch(err) {
    console.log(err);
    return res.status(200).send({message: 'Unknown error occured'});
  }
};

exports.bulkOnboard = async (req, res) => {
  try {
    const buffer = new Buffer(req.file.buffer);
    const readable = new Readable();
    const entries = [];
    const entriesByPhone = {};
    let goodEntries = [];
    const agents = [];
    readable._read = () => {};
    readable.push(buffer)
    readable.push(null)
    readable.pipe(csv())
    .on('data', (row) => {
      entries.push(row);
    })
    .on('end', async () => {
      let valid = true;
      entries.forEach(entry => {
        if (Object.keys(entry).length !== 9) valid = false;
        agents.push(entry.agent);
        entriesByPhone[entry.phone] = entry.agent;
        entry.isActive = true;
        entry.isOnboarded = true;
        entry.UserRoles = {roleId: 5};
        entry.updatedBy = req.userEmail;
        console.log(entry);
      });
      if (!valid) {
        return res.status(404).send({message: 'Malformed CSV structure'});
      }
      const tempUsers = await user.findInvalidRows(entries);
      goodEntries = [...tempUsers.goodEntries];
      const t = await db.sequelize.transaction();
      try {
        const users = await User.bulkCreate(goodEntries, {include: [{model: Role, through: 'UserRoles'}]});
        let userIds = users.map(u => ({userId: u.id, roleId: 5}));
        await UserRole.bulkCreate(userIds, {fields: ['roleId', 'userId']});
        const agentUsers = await User.findAll({where: {email: {[Op.in]: agents}}, include: [{model: Role, through: 'UserRoles', required: false}]});
        const agentObj = {};
        agentUsers.forEach(agent => {
          agentObj[agent.email] = agent.id;
        });
        const userAssociations = [];
        users.forEach(user => {
          userAssociations.push({userId: user.id, csrId: agentObj[entriesByPhone[user.phone]]});
        });
        await UserAssociation.bulkCreate(userAssociations, {fields: ['csrId', 'userId']});
        await t.commit();
        console.log('CSV file successfully processed');
        return res.status(200).send({message: 'Successfully uploaded members.'});
      } catch(err) {
        console.log(err);
        await t.rollback();
        return res.status(404).send({ message: `Failed to upload, reason ${err}` });
      }
    });
  } catch(err) {
    console.log(err);
  }
};

exports.createMember = async (req, res) => {
  let updatedValues = { ...req.body };
  if (updatedValues.role !== "farmer" && !updatedValues.email) {
    return res.status(404).send({ message: "Email is required to this role" });
  }
  updatedValues.age = common.convertAgeToDate(updatedValues.age);
  User.findOne({
    where: req.userId,
  }).then((admin) => {
    updatedValues.updatedBy = admin.email;
    updatedValues.isOnboarded = true;
    updatedValues.isActive = true;
    User.create(updatedValues).then(user => {
      let roleId;
      Object.keys(constants.ROLES).forEach((key) => {
        if (constants.ROLES[key].name === req.body.role) {
          roleId = constants.ROLES[key].id;
        }
      });
      if (roleId !== 5) {
        updatedValues.password = bcrypt.hashSync(
          config.DEFAULT_STAFF_PASSWORD,
          8
        );
      }
      user.update(updatedValues).then(() => {
        user.setManagedBy([req.body.csr]).then(() => {
          user.setRoles([roleId]).then(() => {
            return res.status(200).send({
              user: user,
            });
          })
        });
      });
    })
  }).catch((err) => {
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
      updatedValues.age = common.convertAgeToDate(req.body.age);
      updatedValues.updatedBy = req.userEmail;
      let roleId;
      Object.keys(constants.ROLES).forEach((key) => {
        if (constants.ROLES[key].name === req.body.role) {
          roleId = constants.ROLES[key].id;
        }
      });
      if (user.Roles[0].name === "farmer") {
        updatedValues.password = bcrypt.hashSync(
          config.DEFAULT_STAFF_PASSWORD,
          8
        );
      }
      user.update(updatedValues).then((user) => {
        user.setManagedBy([req.body.csr || req.userRoleId]).then(() => {
          user.setRoles([roleId]).then(() => {
            return res.send({ user: user });
          });
        });
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message: err.message });
    });
};
