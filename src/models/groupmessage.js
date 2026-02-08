"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class GroupMessage extends Model {
    static associate(models) {
      GroupMessage.belongsTo(models.Group, {
        foreignKey: "groupId",
        as: "group",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      GroupMessage.belongsTo(models.User, {
        foreignKey: "senderId",
        as: "sender",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  GroupMessage.init(
    {
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "text",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isEdited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      editedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "GroupMessage",
    }
  );

  return GroupMessage;
};
