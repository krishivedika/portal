require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const config = require("./app/config");
const db = require("./app/models");

const app = express();

// to enable CORS
app.use(cors());

// middleware to auto parse the body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./app/routes/auth')(app);
require('./app/routes/user')(app);

const Role = db.role;
const Permission = db.permission;

if (config.NODE_ENV === 'production') {
  db.sequelize.sync();
} else {
  // to drop table data
  db.sequelize.sync({force: true}).then(() => {
    console.log('Drop and Resync DB');
    initial();
  });
}


const initial = () => {
  Role.create({
    id: 1,
    name: "user"
  });

  Role.create({
    id: 2,
    name: "admin"
  });

  Permission.create({
    id: 1,
    name: "edit_user"
  });

  Permission.create({
    id: 2,
    name: "view_user"
  });
  
}

app.get("/", (_, res) => {
  res.json({ message: "Welcome to vintc application." });
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
