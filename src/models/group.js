"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Group.belongsTo("User", {
        foreignKey: "userId",
        as: "creator",
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
      });

      Group.belongsTo("User", {
        foreignKey: "leaderId",
        as: "leader",
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
      });

      Group.belongsToMany(models.User, {
        through: "GroupUsers",
        foreignKey: "groupId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  Group.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "User",
          key: "id",
        },
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
      },
      leaderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "User",
          key: "id",
        },
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "Group",
    }
  );
  return Group;
};
