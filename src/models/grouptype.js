"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GroupType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GroupType.hasMany(models.Group, {
        foreignKey: "groupTypeId",
        as: "groups",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  GroupType.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "GroupType",
    }
  );
  return GroupType;
};
