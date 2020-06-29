const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const config = require("../config");
const db = require("../models");
const { sms } = require("../utils");
const { ROLES } = require("../../constants");

const User = db.user;
const Role = db.role;

exports.signup = (req, res) => {
  if (!sms.verifyOtp(req.body.phone, req.body.otp)) {
    return res.status(400).send({message: "Invalid OTP.", code: 1});
  }
  const userObj = {
    prefix: req.body.prefix,
    phone: req.body.phone,
  }

  User.create(userObj)
    .then((user) => {
      user.setRoles([5]).then(() => {
        res.send({message: "Member was registered successfully."});
      });
    })
    .catch((err) => {
      res.status(500).send({message: err.message});
    });
};

exports.signin = (req, res) => {
  User.scope('withoutPassword').findOne({
    where: {
      phone: req.body.phone,
      isActive: true,
    },
    include: [{
      model: Role,
    }]
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      } else if (!user.isOnboarded) {
        return res.status(404).send({ message: "Member onboarding is being processed." });
      }

      if (user.roles[0].name !== ROLES.FARMER.name) {
        return res.status(400).send({
          message: "Staff should use Email to login.",
          code: 1,
        });
      }

      if (!sms.verifyOtp(req.body.phone, req.body.otp)) {
        return res.status(400).send({
          message: "Invalid OTP",
          code: 1,
        });
      }

      const token = jwt.sign({ id: user.id }, config.SECRET_KEY, {
        expiresIn: 1209600, // Fortnite
      });

      let authorities = [];
      user.getRoles().then((roles) => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push(`${roles[i].name.toUpperCase()}`);
        }
        return res.status(200).send({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          roles: authorities,
          accessToken: token,
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({message: err.message});
    });
};

exports.staffSignin = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
      isActive: true,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      } else if (!user.isOnboarded) {
        return res.status(404).send({ message: "Staff onboarding is being processed." });
      }

      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(400).send({
          message: "Invalid Password",
          code: 1,
        });
      }

      const token = jwt.sign({ id: user.id }, config.SECRET_KEY, {
        expiresIn: 1209600, // Fortnite
      });

      let authorities = [];
      user.getRoles().then((roles) => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push(`${roles[i].name.toUpperCase()}`);
        }
        return res.status(200).send({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          roles: authorities,
          accessToken: token,
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({message: err.message});
    });
};

exports.newOtp = (req, res) => {
  sms.generateOtp();
  res.send({message: 'OTP sent.'});
};
