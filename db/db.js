const { Sequelize } = require("sequelize");
const config = require(`../config/config.${process.env.NODE_ENV || 'prod'}.json`);

const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    dialect: config.db.dialect,
    define: {
      underscored: true,
      freezeTableName: true,
      timestamps: false,
    },
    timezone: "+08:00",
    logging: false
});

const modelDefiners = [
  require('../models/imagepathfile')
];

for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize);
}

module.exports = sequelize;
