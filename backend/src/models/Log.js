const { LOG_ACTION } = require("../enum/action");

module.exports = (sequelize, DataTypes) => {
  const Log = sequelize.define('Log', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    action: {
      type: DataTypes.ENUM(Object.values(LOG_ACTION)),
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  });

  return Log;
}