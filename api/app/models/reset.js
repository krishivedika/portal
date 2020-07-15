module.exports = (sequelize, Sequelize) => {
  const Reset = sequelize.define("reset", {
    key: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
    },
  });

  return Reset;
};
