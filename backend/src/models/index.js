const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User')(sequelize, Sequelize.DataTypes);
const Item = require('./Item')(sequelize, Sequelize.DataTypes);
const Log = require('./Log')(sequelize, Sequelize.DataTypes);

const db = {
  sequelize,
  User,
  Item,
  Log,
};

module.exports = db;

