require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require('helmet')
const morgan = require('morgan')
const bcrypt = require("bcryptjs");

const config = require("./config");
const constants = require("./constants");
const db = require("./models");

const app = express();

// Logging
app.use(morgan('combined', {
  skip: (_, res) => {
    if (res.statusCode > 399) {
      console.log(res.json());
    }
    return false;
  }
}));

// Security
app.use(helmet({
  hsts: false
}));

// to enable CORS
const whitelist = [config.ORIGIN];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors());

// middleware to auto parse the body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./routes/auth')(app);
require('./routes/user')(app);
require('./routes/farm')(app);
require('./routes/crop')(app);
require('./routes/region')(app);

const Role = db.role;
const User = db.user;

db.sequelize.sync({alter: {drop: false}}).then(() => {
  console.log('Syncing DB finished');
  initial();
});

const initial = () => {
  const roles = [...Object.values(constants.ROLES)];
  roles.forEach(role => {
    Role.findOne({where: {name: role.name}}).then(r => {
      if (!r) {
        Role.create(role);
      }
    }).catch(err => {
      console.log(err);
    });
  });

  const systemAdmins = [
    {firstName: 'Priyank', lastName: 'P', email: 'pulumati.priyank@gmail.com', password: bcrypt.hashSync(config.DEFAULT_STAFF_PASSWORD, 8), isOnboarded: true, isActive: true, updatedBy: 'System'},
    {firstName: 'Hari', lastName: 'M', email: 'hmadanaraj@gmail.com', password: bcrypt.hashSync(config.DEFAULT_STAFF_PASSWORD, 8), isOnboarded: true, isActive: true, updatedBy: 'System'},
    {firstName: 'Nagen', lastName: 'S', email: 'anagin@gmail.com', password: bcrypt.hashSync(config.DEFAULT_STAFF_PASSWORD, 8), isOnboarded: true, isActive: true, updatedBy: 'System'},
    {firstName: 'Shiva', lastName: 'V', email: 'shiv@varmafoods.com', password: bcrypt.hashSync(config.DEFAULT_STAFF_PASSWORD, 8), isOnboarded: true, isActive: true, updatedBy: 'System'},
  ]
  systemAdmins.forEach(admin => {
    User.findOne({where: {email: admin.email}}).then(a => {
      if (!a) {
        User.create(admin).then(user => {
          user.setRoles([1]);
        });
      }
    });
  });

  const testUsers = [
    {firstName: 'Test', lastName: 'User', phone: '1234567890', gender: 'male', isOnboarded: true, isActive: true, updatedBy: 'System'},
  ]
  if (!config.NODE_ENV.includes("prod")) {
    testUsers.forEach(testUser => {
      User.findOne({where: {phone: testUser.phone}}).then(a => {
        if (!a) {
          User.create(testUser).then(user => {
            user.setRoles([5]);
          });
        }
      });
    });
  }
}

app.get("/", (_, res) => {
  res.json({ message: "Welcome to KVP API" });
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
