module.exports = (sequelize, Sequelize) => {
    const Permission = sequelize.define("permissions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
      },
    });
  
    return Permission;
  };