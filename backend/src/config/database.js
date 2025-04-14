const { Sequelize } = require('sequelize')


const databaseName = 'appbay_studio_tht';
const userName = 'postgres';
const password = '123456';

const sequelize = new Sequelize(databaseName, userName, password, {
  host: 'localhost',
  dialect: 'postgres',
});

module.exports = sequelize;