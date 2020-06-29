module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    firstName: {
      type: Sequelize.STRING,
    },
    lastName: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
    prefix: {
      type: Sequelize.STRING,
      default: '+91',
    },
    phone: {
      type: Sequelize.STRING,
    },
    ration: {
      type: Sequelize.STRING,
    },
    gender: {
      type: Sequelize.STRING,
    },
    age: {
      type: Sequelize.INTEGER,
    },
    district: {
      type: Sequelize.STRING,
    },
    mandala: {
      type: Sequelize.STRING,
    },
    panchayat: {
      type: Sequelize.STRING,
    },
    hamlet: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.STRING,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    isOnboarded: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    updatedBy: {
      type: Sequelize.STRING,
    }
  },
    {
      scopes: {
        withoutPassword: {
          attributes: { exclude: ['password'] },
        }
      }
    }
  );

  return User;
};
