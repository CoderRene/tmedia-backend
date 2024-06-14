/* jshint indent: 2 */

const { DataTypes } = require("sequelize");

module.exports = function(sequelize) {
  return sequelize.define('imagepathfile', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    folder: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    file: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    isVideo: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
    },
  }, {
    sequelize,
    tableName: 'imagepathfile',
    timestamps: false,
    underscored: false
  });
};
