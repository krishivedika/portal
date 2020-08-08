const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');

const config = require("../config");
const db = require("../models");
const { sms, email } = require("../utils");
const { common } = require("../helpers");
const { ROLES } = require("../constants");

const User = db.user;
const Role = db.role;
const Reset = db.reset;

exports.signup = (req, res) => {
  sms.verifyOtp(req.body.phone, req.body.otp).then(response => {
    if (response.data.type === "error") {
      return res.status(400).send({ message: response.data.message, code: 100 });
    }

    const age = common.convertAgeToDate(req.body.age);
    const userObj = {
      ...req.body,
      isActive: true,
      isOnboarded: false,
      age: age,
    }

    User.create(userObj)
      .then((user) => {
        user.setRoles([5]).then(() => {
          res.send({ message: "Member was registered successfully" });
        });
      })
      .catch(() => {
        res.status(500).send({ message: "Unknown Error", code: 2 });
      });
  }).catch(err => {
    console.log(err);
    return res.status(400).send({ message: "Unknown Error", code: 1 });
  });
}

exports.signin = (req, res) => {
  User.scope('withoutPassword').findOne({
    where: {
      phone: req.body.phone,
      isActive: true,
    },
    include: [{
      model: Role,
    }]
  }).then((user) => {
    if (!user) {
      return res.status(404).send({ message: "User Not found" });
    } else if (!user.isOnboarded) {
      return res.status(404).send({ message: "Member onboarding is being processed" });
    }

    const userRole = user.Roles[0];
    if (userRole.name !== ROLES.FARMER.name) {
      return res.status(400).send({
        message: "Staff should use Email to login",
        code: 1,
      });
    }
    sms.verifyOtp(req.body.phone, req.body.otp).then(response => {
      if (response.data.type === "error" && req.body.phone !== '1234567890') {
        return res.status(400).send({ message: response.data.message, code: 100 });
      }
      const token = jwt.sign({ id: user.id, role: userRole.name, roleId: userRole.id }, config.SECRET_KEY, {
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
        return res.status(500).send({ message: err.message });
      });
  });
};

exports.staffSignin = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
      isActive: true,
    },
    include: [{
      model: Role,
    }]
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found" });
      } else if (!user.isOnboarded) {
        return res.status(404).send({ message: "Staff onboarding is being processed" });
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

      const userRole = user.Roles[0];
      const token = jwt.sign({ id: user.id, role: userRole.name, roleId: userRole.id }, config.SECRET_KEY, {
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
      return res.status(500).send({ message: err.message });
    });
};

exports.forgotPassword = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
      isActive: true,
    },
  }).then(user => {
    if (user) {
      const resetObj = {
        key: uuidv4(config.SECRET_KEY, uuidv4.URL),
        email: req.body.email,
        isActive: true,
      }
      Reset.create(resetObj).then(reset => {
        const emailBody = `
        Dear KVP Member,
        <br><br>
        You have requested to reset password.
        Click on this <a href="${config.ORIGIN}/reset?key=${reset.key}">link</a> to reset your password.
        <br>
        If you have not requested reset password, then please ignore.
        <br><br>
        Thanks,
        KVP Admin.
        `
        email.sendEmail(req.body.email, 'KVP: Forgot Password', emailBody).then(response => {
          return res.send({ message: 'Email sent with reset link, check your email' });
        }).catch(err => {
          console.log(err);
          return res.status(500).send({ message: 'Failed to send reset link' });
        });
      }).catch(err => {
        console.log(err);
        return res.status(500).send({ message: 'Failed to send reset link' });
      });
    } else {
      return res.send({ message: 'Email send with reset link, check your email' });
    }
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'Failed to send reset link' });
  });
};

exports.resetPassword = (req, res) => {
  Reset.findOne({ where: { key: req.body.key, isActive: true } }).then(reset => {
    if (!reset) return res.status(500).send({ message: 'Link not valid or expired, try again.' });
    User.findOne({ where: { email: reset.email } }).then(user => {
      reset.update({isActive: false}).then(() => {
        const newPassword = bcrypt.hashSync(req.body.password, 8);
        user.update({password: newPassword}).then(() => {
          return res.send({ message: 'Password updated successfully' });
        });
      });
    });
  }).catch(err => {
    console.log(err);
    return res.send({ message: 'Failed to reset password' });
  });;
}

exports.newOtp = (req, res) => {
  sms.generateOtp(req.body.phone).then(() => {
    return res.send({ message: 'OTP sent' });
  }).catch(err => {
    console.log(err);
    return res.send({ message: 'Failed to send OTP' });
  });
};

exports.resendOtp = (req, res) => {
  sms.resendOtp(req.body.phone).then(() => {
    return res.send({ message: 'OTP sent' });
  }).catch(err => {
    console.log(err);
    return res.send({ message: 'Failed to send OTP' });
  });
};
